"""
image_optimizer.py — Módulo de validación y optimización de imágenes para StayHuila
=====================================================================================
Proporciona funciones para:
  - Validar formato, tamaño y resolución de imágenes.
  - Detectar imágenes borrosas usando el operador Laplaciano de OpenCV.
  - Optimizar imágenes (redimensionar, comprimir, eliminar EXIF, convertir a WebP).
  - Guardar la imagen optimizada y su miniatura en el directorio de uploads.

Cambios v2 (optimización de rendimiento):
  - Formato de salida: JPEG → WebP (≈30% más ligero con misma calidad visual)
  - Se generan dos archivos por imagen:
      · <uuid>_<idx>.webp        → imagen principal (max 1280 px ancho)
      · <uuid>_<idx>_thumb.webp  → miniatura (max 480 px ancho)
  - Eliminación de metadatos EXIF al guardar (privacidad + tamaño)
  - `saved_url`  → URL de la imagen principal (uso en detalle/galería)
  - `thumb_url`  → URL de la miniatura (uso en tarjetas de listado)

Dependencias:
  pip install Pillow opencv-python-headless numpy
"""

import os
import uuid
import numpy as np

from PIL import Image, ImageEnhance, ExifTags
import cv2

# ── CONSTANTES DE VALIDACIÓN ────────────────────────────────────────────────
ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png', 'webp'}  # Formatos aceptados (añadido webp)
MAX_FILE_SIZE_MB   = 15                               # Aumentado para aceptar fotos de celular sin rechazar
MIN_WIDTH          = 800                              # Resolución mínima: ancho (reducido para mayor compatibilidad)
MIN_HEIGHT         = 400                              # Resolución mínima: alto
BLUR_THRESHOLD     = 50.0                             # Umbral más permisivo para varianza Laplaciana
TARGET_WIDTH       = 1280                             # Ancho máximo imagen principal (px)
THUMB_WIDTH        = 480                              # Ancho máximo miniatura (px)
WEBP_QUALITY       = 82                               # Calidad WebP principal (0-95). 82 = balance óptimo
WEBP_THUMB_QUALITY = 72                               # Calidad WebP miniatura (menor = más ligera)
BRIGHTNESS_FACTOR  = 1.05                             # Mejora sutil de brillo (reducida para no sobreexponer)
CONTRAST_FACTOR    = 1.04                             # Mejora sutil de contraste


# ── RESULTADO ────────────────────────────────────────────────────────────────
class ImageResult:
    """Contenedor de resultado para el procesamiento de una imagen."""

    def __init__(self):
        self.valid       = False   # True si pasó todas las validaciones
        self.blurry      = False   # True si la imagen es borrosa
        self.status      = ''      # Mensaje corto de estado
        self.message     = ''      # Mensaje descriptivo para el usuario
        self.saved_path  = None    # Ruta absoluta de la imagen principal (WebP)
        self.saved_url   = None    # URL relativa para Flask (/static/uploads/...)
        self.thumb_path  = None    # Ruta absoluta de la miniatura WebP
        self.thumb_url   = None    # URL relativa de la miniatura (/static/uploads/..._thumb.webp)
        self.width       = 0
        self.height      = 0
        self.file_size   = 0       # Tamaño en bytes del archivo recibido
        self.saved_size  = 0       # Tamaño en bytes del archivo optimizado final

    def to_dict(self):
        """Serializa el resultado a diccionario para respuesta JSON."""
        return {
            'valid':      self.valid,
            'blurry':     self.blurry,
            'status':     self.status,
            'message':    self.message,
            'saved_url':  self.saved_url,
            'thumb_url':  self.thumb_url,
            'width':      self.width,
            'height':     self.height,
            'file_size':  self.file_size,
            'saved_size': self.saved_size,
        }


# ── HELPERS ──────────────────────────────────────────────────────────────────

def _get_extension(filename: str) -> str:
    """Devuelve la extensión en minúsculas sin punto. Ejemplo: 'jpg'"""
    if '.' in filename:
        return filename.rsplit('.', 1)[-1].lower()
    return ''


def _strip_exif(pil_image: Image.Image) -> Image.Image:
    """
    Elimina todos los metadatos EXIF de la imagen.
    Mejora privacidad (GPS, cámara, fecha) y reduce tamaño del archivo.
    Retorna una nueva imagen limpia preservando canal Alpha si existe.
    """
    if pil_image.mode in ('RGBA', 'LA') or (pil_image.mode == 'P' and 'transparency' in pil_image.info):
        mode = 'RGBA'
    else:
        mode = 'RGB'
    clean = Image.new(mode, pil_image.size)
    clean.putdata(list(pil_image.getdata()))
    return clean.convert(mode)


def _detect_blur(pil_image: Image.Image) -> tuple[bool, float]:
    """
    Detecta si una imagen es borrosa usando la varianza del Laplaciano.
    Retorna (es_borrosa: bool, varianza: float).
    Una varianza baja (< BLUR_THRESHOLD) indica imagen borrosa.
    """
    img_cv = cv2.cvtColor(np.array(pil_image.convert('RGB')), cv2.COLOR_RGB2BGR)
    gray   = cv2.cvtColor(img_cv, cv2.COLOR_BGR2GRAY)
    laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
    return laplacian_var < BLUR_THRESHOLD, round(laplacian_var, 2)


def _resize_image(pil_image: Image.Image, max_width: int) -> Image.Image:
    """
    Redimensiona la imagen si su ancho supera max_width.
    Mantiene la proporción de aspecto original.
    Usa LANCZOS para máxima calidad de reducción.
    """
    w, h = pil_image.size
    if w > max_width:
        ratio = max_width / w
        new_h = int(h * ratio)
        return pil_image.resize((max_width, new_h), Image.LANCZOS)
    return pil_image


def _enhance_image(pil_image: Image.Image) -> Image.Image:
    """Aplica mejora sutil de brillo y contraste para compensar la compresión."""
    img = ImageEnhance.Brightness(pil_image).enhance(BRIGHTNESS_FACTOR)
    img = ImageEnhance.Contrast(img).enhance(CONTRAST_FACTOR)
    return img


def _save_webp(pil_image: Image.Image, save_path: str, quality: int) -> int:
    """
    Guarda una imagen PIL en formato WebP.
    Retorna el tamaño del archivo guardado en bytes.
    
    WebP ventajas vs JPEG/PNG:
    - Mismo WebP calidad 82 ≈ JPEG calidad 85 pero 25-35% más pequeño
    - Soporte en todos los navegadores modernos (Chrome, Firefox, Safari 14+, Edge)
    - Soporte nativo de transparencia (futuro)
    """
    pil_image.save(
        save_path,
        'WEBP',
        quality=quality,
        optimize=True,
        method=4        # Método de compresión (0=rápido, 6=máximo). 4 = balance velocidad/tamaño
    )
    return os.path.getsize(save_path)


# ── FUNCIÓN PRINCIPAL ─────────────────────────────────────────────────────────

def process_image(file_storage, upload_folder: str, index: int = 0) -> ImageResult:
    """
    Valida, detecta blur, optimiza y guarda una imagen de Flask (FileStorage).
    
    Genera DOS archivos WebP por imagen:
      1. Imagen principal: <uuid>_<index>.webp      (max TARGET_WIDTH px)
      2. Miniatura:        <uuid>_<index>_thumb.webp (max THUMB_WIDTH px)

    Parámetros:
        file_storage  : objeto werkzeug.datastructures.FileStorage
        upload_folder : ruta absoluta a la carpeta de uploads
        index         : índice del archivo en caso de subida múltiple

    Retorna:
        ImageResult con todos los campos poblados.
    """
    result = ImageResult()

    # ── 1. Validar extensión / formato ───────────────────────────────────────
    ext = _get_extension(file_storage.filename)
    if ext not in ALLOWED_EXTENSIONS:
        result.status  = 'format_error'
        result.message = f'Formato no permitido (.{ext}). Usa JPG, JPEG, PNG o WEBP.'
        return result

    # ── 2. Leer el archivo en memoria ────────────────────────────────────────
    file_bytes = file_storage.read()
    result.file_size = len(file_bytes)

    # Validar tamaño antes de intentar abrir como imagen
    max_bytes = MAX_FILE_SIZE_MB * 1024 * 1024
    if result.file_size > max_bytes:
        result.status  = 'size_error'
        result.message = (
            f'El archivo pesa {result.file_size / (1024*1024):.1f} MB. '
            f'El máximo permitido es {MAX_FILE_SIZE_MB} MB.'
        )
        return result

    # ── 3. Abrir con Pillow ───────────────────────────────────────────────────
    try:
        from io import BytesIO
        pil_image = Image.open(BytesIO(file_bytes))
        pil_image.verify()          # Verificar integridad del archivo
        # Re-abrir tras verify() porque verify() cierra el stream interno
        pil_image = Image.open(BytesIO(file_bytes))
    except Exception:
        result.status  = 'corrupt_error'
        result.message = 'El archivo está dañado o no es una imagen válida.'
        return result

    result.width, result.height = pil_image.size

    # ── 4. Validar resolución mínima ─────────────────────────────────────────
    if result.width < MIN_WIDTH or result.height < MIN_HEIGHT:
        result.status  = 'resolution_error'
        result.message = (
            f'Resolución muy baja ({result.width}×{result.height} px). '
            f'La mínima requerida es {MIN_WIDTH}×{MIN_HEIGHT} px.'
        )
        return result

    # ── 5. Eliminar EXIF y convertir a RGB limpio ────────────────────────────
    # Importante: hacerlo ANTES de detectar blur para trabajar con imagen limpia
    pil_clean = _strip_exif(pil_image)

    # ── 6. Detectar blur ─────────────────────────────────────────────────────
    is_blurry, lap_var = _detect_blur(pil_clean)
    if is_blurry:
        result.blurry  = True
        result.status  = 'blurry'
        result.message = (
            f'Imagen borrosa detectada (nitidez: {lap_var:.0f}). '
            f'Sube una foto más nítida.'
        )
        return result

    # ── 7. Preparar imagen principal ─────────────────────────────────────────
    img_main = _resize_image(pil_clean, TARGET_WIDTH)
    img_main = _enhance_image(img_main)

    # ── 8. Preparar miniatura ────────────────────────────────────────────────
    img_thumb = _resize_image(pil_clean, THUMB_WIDTH)
    # La miniatura no necesita mejora de brillo/contraste extra

    # ── 9. Guardar en disco ──────────────────────────────────────────────────
    os.makedirs(upload_folder, exist_ok=True)
    unique_id = uuid.uuid4().hex

    # Imagen principal — WebP
    filename_main  = f"{unique_id}_{index}.webp"
    path_main      = os.path.join(upload_folder, filename_main)
    saved_size     = _save_webp(img_main, path_main, WEBP_QUALITY)

    # Miniatura — WebP
    filename_thumb = f"{unique_id}_{index}_thumb.webp"
    path_thumb     = os.path.join(upload_folder, filename_thumb)
    _save_webp(img_thumb, path_thumb, WEBP_THUMB_QUALITY)

    # ── 10. Resultado exitoso ─────────────────────────────────────────────────
    result.valid      = True
    result.status     = 'ok'
    result.message    = 'Imagen válida y optimizada correctamente.'
    result.saved_path = path_main
    result.saved_url  = f'/static/uploads/{filename_main}'
    result.thumb_path = path_thumb
    result.thumb_url  = f'/static/uploads/{filename_thumb}'
    result.saved_size = saved_size
    result.width, result.height = img_main.size

    return result


def process_images(files, upload_folder: str) -> list[dict]:
    """
    Procesa una lista de FileStorage (múltiples imágenes).
    Retorna lista de diccionarios con el resultado de cada imagen.
    Solo las imágenes válidas son guardadas en disco.
    """
    results = []
    for idx, f in enumerate(files):
        if not f or not f.filename:
            continue
        res = process_image(f, upload_folder, index=idx)
        results.append(res.to_dict())
    return results


def thumb_url_from_url(image_url: str, check_exists: bool = True) -> str:
    """
    Dado el URL de una imagen principal, devuelve el URL de su miniatura.
    Ejemplo:
        /static/uploads/abc123_0.webp  →  /static/uploads/abc123_0_thumb.webp
        /static/uploads/abc123_0.jpg   →  /static/uploads/abc123_0_thumb.webp (si existe)
        https://example.com/img.jpg    →  https://example.com/img.jpg (externo, sin cambio)
    
    Si check_exists=True y la miniatura no existe en disco,
    devuelve la imagen original para evitar errores 404.
    """
    if not image_url or not isinstance(image_url, str):
        return image_url

    # No procesar URLs externas (Unsplash, ui-avatars, etc.)
    if image_url.startswith('http://') or image_url.startswith('https://'):
        return image_url

    # Para imágenes locales de uploads, construir URL de miniatura
    if '/static/uploads/' in image_url or 'static/uploads/' in image_url:
        # Separar nombre de archivo
        base, dot_ext = image_url.rsplit('.', 1) if '.' in image_url else (image_url, 'webp')
        # Si ya es una miniatura, devolver tal cual
        if base.endswith('_thumb'):
            return image_url

        thumb_url = f"{base}_thumb.webp"

        if check_exists:
            # Obtener ruta absoluta del sistema de archivos para verificar existencia
            # Ejemplo: '/static/uploads/abc.jpg' -> 'static/uploads/abc_thumb.webp'
            rel_path = thumb_url.lstrip('/').lstrip('\\')
            base_dir = os.path.dirname(os.path.abspath(__file__))
            abs_path = os.path.join(base_dir, rel_path.replace('/', os.sep))
            if not os.path.exists(abs_path):
                # Si el archivo miniatura no existe aún en disco, usar la imagen original
                return image_url

        return thumb_url

    # Para imágenes en /static/images/ (logo, fondo) no hay miniatura
    return image_url

