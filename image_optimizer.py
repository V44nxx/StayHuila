"""
image_optimizer.py — Módulo de validación y optimización de imágenes para StayHuila
=====================================================================================
Proporciona funciones para:
  - Validar formato, tamaño y resolución de imágenes.
  - Detectar imágenes borrosas usando el operador Laplaciano de OpenCV.
  - Optimizar imágenes (redimensionar, comprimir, mejorar brillo/contraste).
  - Guardar la imagen optimizada en el directorio de uploads.

Dependencias:
  pip install Pillow opencv-python-headless numpy
"""

import os
import uuid
import numpy as np

from PIL import Image, ImageEnhance
import cv2

# ── CONSTANTES DE VALIDACIÓN ────────────────────────────────────────────────
ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png'}   # Formatos aceptados
MAX_FILE_SIZE_MB   = 5                          # Tamaño máximo en megabytes
MIN_WIDTH          = 1000                       # Resolución mínima: ancho
MIN_HEIGHT         = 500                        # Resolución mínima: alto
BLUR_THRESHOLD     = 80.0                       # Varianza Laplaciana por debajo = borrosa
TARGET_WIDTH       = 1280                       # Ancho objetivo tras redimensionar
TARGET_QUALITY     = 82                         # Calidad JPEG de salida (0-95)
BRIGHTNESS_FACTOR  = 1.08                       # Factor de mejora de brillo (1.0 = sin cambio)
CONTRAST_FACTOR    = 1.06                       # Factor de mejora de contraste


# ── RESULTADO ────────────────────────────────────────────────────────────────
class ImageResult:
    """Contenedor de resultado para el procesamiento de una imagen."""

    def __init__(self):
        self.valid       = False   # True si pasó todas las validaciones
        self.blurry      = False   # True si la imagen es borrosa
        self.status      = ''      # Mensaje corto de estado
        self.message     = ''      # Mensaje descriptivo para el usuario
        self.saved_path  = None    # Ruta absoluta donde se guardó la imagen optimizada
        self.saved_url   = None    # URL relativa para servir desde Flask (/static/uploads/...)
        self.width       = 0
        self.height      = 0
        self.file_size   = 0       # Tamaño en bytes del archivo recibido

    def to_dict(self):
        """Serializa el resultado a diccionario para respuesta JSON."""
        return {
            'valid':      self.valid,
            'blurry':     self.blurry,
            'status':     self.status,
            'message':    self.message,
            'saved_url':  self.saved_url,
            'width':      self.width,
            'height':     self.height,
            'file_size':  self.file_size,
        }


# ── HELPERS ──────────────────────────────────────────────────────────────────

def _get_extension(filename: str) -> str:
    """Devuelve la extensión en minúsculas sin punto. Ejemplo: 'jpg'"""
    if '.' in filename:
        return filename.rsplit('.', 1)[-1].lower()
    return ''


def _detect_blur(pil_image: Image.Image) -> tuple[bool, float]:
    """
    Detecta si una imagen es borrosa usando la varianza del Laplaciano.
    Retorna (es_borrosa: bool, varianza: float).
    Una varianza baja (< BLUR_THRESHOLD) indica imagen borrosa.
    """
    # Convertir PIL → OpenCV (BGR)
    img_cv = cv2.cvtColor(np.array(pil_image.convert('RGB')), cv2.COLOR_RGB2BGR)
    gray   = cv2.cvtColor(img_cv, cv2.COLOR_BGR2GRAY)
    laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
    return laplacian_var < BLUR_THRESHOLD, round(laplacian_var, 2)


def _optimize_image(pil_image: Image.Image) -> Image.Image:
    """
    Optimiza la imagen:
      1. Redimensiona si el ancho supera TARGET_WIDTH, manteniendo proporción.
      2. Mejora levemente brillo y contraste.
    """
    img = pil_image.convert('RGB')

    # 1. Redimensionar (solo si es más grande que el objetivo)
    w, h = img.size
    if w > TARGET_WIDTH:
        ratio    = TARGET_WIDTH / w
        new_h    = int(h * ratio)
        img      = img.resize((TARGET_WIDTH, new_h), Image.LANCZOS)

    # 2. Mejorar brillo
    img = ImageEnhance.Brightness(img).enhance(BRIGHTNESS_FACTOR)

    # 3. Mejorar contraste
    img = ImageEnhance.Contrast(img).enhance(CONTRAST_FACTOR)

    return img


# ── FUNCIÓN PRINCIPAL ─────────────────────────────────────────────────────────

def process_image(file_storage, upload_folder: str, index: int = 0) -> ImageResult:
    """
    Valida, detecta blur, optimiza y guarda una imagen de Flask (FileStorage).

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
        result.message = f'Formato no permitido (.{ext}). Usa JPG, JPEG o PNG.'
        return result

    # ── 2. Leer el archivo en memoria ────────────────────────────────────────
    file_bytes = file_storage.read()
    result.file_size = len(file_bytes)

    # Validar tamaño antes de intentar abrir como imagen
    max_bytes = MAX_FILE_SIZE_MB * 1024 * 1024
    if result.file_size > max_bytes:
        result.status  = 'size_error'
        result.message = f'El archivo pesa {result.file_size / (1024*1024):.1f} MB. El máximo permitido es {MAX_FILE_SIZE_MB} MB.'
        return result

    # ── 3. Abrir con Pillow ───────────────────────────────────────────────────
    try:
        from io import BytesIO
        pil_image = Image.open(BytesIO(file_bytes))
        pil_image.verify()          # Verificar integridad
        # Re-abrir tras verify() porque verify() cierra el stream
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

    # ── 5. Detectar blur ─────────────────────────────────────────────────────
    is_blurry, lap_var = _detect_blur(pil_image)
    if is_blurry:
        result.blurry  = True
        result.status  = 'blurry'
        result.message = f'Imagen borrosa detectada (nitidez: {lap_var:.0f}). Sube una foto más nítida.'
        return result

    # ── 6. Optimizar imagen ──────────────────────────────────────────────────
    optimized = _optimize_image(pil_image)

    # ── 7. Guardar en disco ──────────────────────────────────────────────────
    os.makedirs(upload_folder, exist_ok=True)
    # Siempre guardamos como JPEG para consistencia y compresión óptima
    filename = f"{uuid.uuid4().hex}_{index}.jpg"
    save_path = os.path.join(upload_folder, filename)

    optimized.save(save_path, 'JPEG', quality=TARGET_QUALITY, optimize=True)

    # ── 8. Resultado exitoso ─────────────────────────────────────────────────
    result.valid      = True
    result.status     = 'ok'
    result.message    = 'Imagen válida y optimizada correctamente.'
    result.saved_path = save_path
    result.saved_url  = f'/static/uploads/{filename}'
    result.width, result.height = optimized.size

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
