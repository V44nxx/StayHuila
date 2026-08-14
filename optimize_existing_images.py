#!/usr/bin/env python3
"""
optimize_existing_images.py — Conversión masiva de imágenes existentes a WebP
==============================================================================
Convierte todas las imágenes PNG/JPEG de static/images/ y static/uploads/
a formato WebP, generando también miniaturas _thumb.webp.

Características:
  - NO destructivo: conserva los archivos originales
  - Idempotente: si el .webp ya existe, lo omite (a menos que se use --force)
  - Actualiza la base de datos: cambia rutas .jpg/.png → .webp en las tablas
    hospedaje_imagenes y experiencia_imagenes
  - Reporta estadísticas de ahorro de espacio

Uso:
    # Ejecutar desde la raíz del proyecto en el servidor
    python optimize_existing_images.py

    # Ver qué haría sin ejecutarlo (dry-run)
    python optimize_existing_images.py --dry-run

    # Forzar reconversión incluso si ya existe el .webp
    python optimize_existing_images.py --force

    # Solo convertir, sin actualizar la BD
    python optimize_existing_images.py --no-db

Requisitos: Pillow, python-dotenv, PyMySQL (ya instalados)
"""

import os
import sys
import argparse
from pathlib import Path
from io import BytesIO

from PIL import Image
from dotenv import load_dotenv

# ── Configuración ─────────────────────────────────────────────────────────────
load_dotenv()

# Rutas relativas al script (ejecutar desde la raíz del proyecto)
BASE_DIR     = Path(__file__).parent
STATIC_DIR   = BASE_DIR / 'static'
IMAGES_DIR   = STATIC_DIR / 'images'
UPLOADS_DIR  = STATIC_DIR / 'uploads'

# Parámetros de conversión
WEBP_QUALITY_MAIN  = 82    # Imagen principal
WEBP_QUALITY_THUMB = 72    # Miniatura
THUMB_MAX_WIDTH    = 480   # px
MAIN_MAX_WIDTH     = 1280  # px

EXTENSIONS_TO_CONVERT = {'.jpg', '.jpeg', '.png', '.jfif', '.avif', '.bmp'}


# ── Helpers ───────────────────────────────────────────────────────────────────

def human_size(b: int) -> str:
    """Convierte bytes a representación legible."""
    for unit in ['B', 'KB', 'MB', 'GB']:
        if b < 1024:
            return f"{b:.1f} {unit}"
        b /= 1024
    return f"{b:.1f} GB"


def resize_if_needed(img: Image.Image, max_width: int) -> Image.Image:
    """Redimensiona si el ancho supera max_width, conservando proporción."""
    w, h = img.size
    if w > max_width:
        ratio = max_width / w
        img = img.resize((max_width, int(h * ratio)), Image.LANCZOS)
    return img


def convert_to_webp(src_path: Path, dry_run: bool = False, force: bool = False) -> dict:
    """
    Convierte una imagen a WebP y genera su miniatura.
    Retorna dict con estadísticas de la conversión.
    """
    result = {
        'src': str(src_path),
        'skipped': False,
        'error': None,
        'main_path': None,
        'thumb_path': None,
        'original_size': src_path.stat().st_size,
        'main_size': 0,
        'thumb_size': 0,
    }

    # Calcular rutas de destino
    main_path  = src_path.with_suffix('.webp')
    thumb_path = src_path.parent / (src_path.stem + '_thumb.webp')

    result['main_path']  = str(main_path)
    result['thumb_path'] = str(thumb_path)

    # Si ya existen y no se fuerza, omitir
    if not force and main_path.exists() and thumb_path.exists():
        result['skipped'] = True
        result['main_size']  = main_path.stat().st_size
        result['thumb_size'] = thumb_path.stat().st_size
        return result

    if dry_run:
        print(f"  [DRY-RUN] Convertiría: {src_path.name} → {main_path.name} + {thumb_path.name}")
        return result

    try:
        # Abrir imagen original
        with Image.open(src_path) as img:
            # Convertir a RGB (elimina canal alpha y EXIF implícitamente)
            img_rgb = img.convert('RGB')

            # Imagen principal
            img_main = resize_if_needed(img_rgb.copy(), MAIN_MAX_WIDTH)
            img_main.save(str(main_path), 'WEBP', quality=WEBP_QUALITY_MAIN, optimize=True, method=4)
            result['main_size'] = main_path.stat().st_size

            # Miniatura
            img_thumb = resize_if_needed(img_rgb.copy(), THUMB_MAX_WIDTH)
            img_thumb.save(str(thumb_path), 'WEBP', quality=WEBP_QUALITY_THUMB, optimize=True, method=4)
            result['thumb_size'] = thumb_path.stat().st_size

    except Exception as e:
        result['error'] = str(e)

    return result


def update_database(url_mapping: dict[str, str], dry_run: bool) -> int:
    """
    Actualiza las URLs de imágenes en la base de datos.
    url_mapping: {'/static/uploads/old.jpg': '/static/uploads/new.webp', ...}
    Retorna número de filas actualizadas.
    """
    try:
        import pymysql
    except ImportError:
        print("  [BD] PyMySQL no disponible, omitiendo actualización de BD.")
        return 0

    DB_CONFIG = dict(
        host=os.environ.get('DB_HOST', 'localhost'),
        port=int(os.environ.get('DB_PORT', '3306')),
        user=os.environ.get('DB_USER', 'root'),
        password=os.environ.get('DB_PASSWORD', ''),
        database=os.environ.get('DB_NAME', 'StayHuila'),
        charset='utf8mb4',
        cursorclass=pymysql.cursors.DictCursor,
    )

    total_updated = 0

    # Tablas y columnas de imágenes a actualizar
    tables_cols = [
        ('hospedaje_imagenes',  'url'),
        ('experiencia_imagenes', 'url'),
        ('usuarios',            'foto_perfil'),
    ]

    if dry_run:
        print(f"\n  [DRY-RUN BD] Actualizaría {len(url_mapping)} URLs en las tablas de imágenes.")
        return 0

    try:
        conn = pymysql.connect(**DB_CONFIG)
        with conn:
            with conn.cursor() as cur:
                for old_url, new_url in url_mapping.items():
                    for table, col in tables_cols:
                        try:
                            cur.execute(
                                f"UPDATE {table} SET {col} = %s WHERE {col} = %s",
                                (new_url, old_url)
                            )
                            total_updated += cur.rowcount
                        except Exception as te:
                            print(f"  [BD] Error en {table}.{col}: {te}")
            conn.commit()
    except Exception as e:
        print(f"  [BD] Error de conexión: {e}")
        print("  [BD] Verifica las variables de entorno DB_HOST, DB_USER, DB_PASSWORD, DB_NAME")

    return total_updated


def scan_directory(directory: Path, recursive: bool = True) -> list[Path]:
    """Lista todos los archivos convertibles en un directorio."""
    if not directory.exists():
        return []

    pattern = '**/*' if recursive else '*'
    files = []
    for ext in EXTENSIONS_TO_CONVERT:
        files.extend(directory.glob(f'{pattern}{ext}'))
        files.extend(directory.glob(f'{pattern}{ext.upper()}'))

    # Excluir archivos que ya sean miniaturas
    files = [f for f in files if not f.stem.endswith('_thumb')]
    return sorted(set(files))


def main():
    parser = argparse.ArgumentParser(
        description='Convierte imágenes existentes de StayHuila a WebP'
    )
    parser.add_argument('--dry-run',  action='store_true', help='Mostrar qué haría sin ejecutar')
    parser.add_argument('--force',    action='store_true', help='Reconvertir incluso si ya existe el .webp')
    parser.add_argument('--no-db',    action='store_true', help='No actualizar la base de datos')
    parser.add_argument('--uploads-only', action='store_true', help='Solo procesar static/uploads/')
    args = parser.parse_args()

    sys.stdout.reconfigure(encoding='utf-8')
    print("=" * 65)
    print("  StayHuila - Optimizador masivo de imagenes -> WebP")
    print("=" * 65)
    if args.dry_run:
        print("  ⚠️  MODO DRY-RUN: No se escribirá nada en disco ni en BD\n")

    # Reunir archivos a procesar
    dirs_to_scan = []
    if not args.uploads_only:
        dirs_to_scan.append(IMAGES_DIR)
    dirs_to_scan.append(UPLOADS_DIR)

    all_files = []
    for d in dirs_to_scan:
        found = scan_directory(d)
        print(f"  📁 {d}: {len(found)} imágenes encontradas")
        all_files.extend(found)

    if not all_files:
        print("\n  ✅ No se encontraron imágenes para convertir.")
        return

    print(f"\n  Total a procesar: {len(all_files)} imágenes\n")
    print("-" * 65)

    # Procesar imágenes
    stats = {
        'converted': 0,
        'skipped': 0,
        'errors': 0,
        'original_total': 0,
        'webp_total': 0,
    }
    url_mapping: dict[str, str] = {}

    for i, src in enumerate(all_files, 1):
        print(f"  [{i:3d}/{len(all_files)}] {src.name[:50]:<50}", end=' ')

        r = convert_to_webp(src, dry_run=args.dry_run, force=args.force)

        if r['error']:
            print(f"❌ Error: {r['error']}")
            stats['errors'] += 1
            continue

        if r['skipped']:
            print(f"⏭  Ya existe ({human_size(r['main_size'])})")
            stats['skipped'] += 1
            stats['original_total'] += r['original_size']
            stats['webp_total']     += r['main_size'] + r['thumb_size']
            continue

        if not args.dry_run:
            # Calcular reducción
            saved = r['original_size'] - r['main_size'] - r['thumb_size']
            pct   = (saved / r['original_size'] * 100) if r['original_size'] else 0
            print(f"✅ {human_size(r['original_size'])} → {human_size(r['main_size'])} + thumb ({pct:.0f}% menos)")

            stats['converted'] += 1
            stats['original_total'] += r['original_size']
            stats['webp_total']     += r['main_size'] + r['thumb_size']

            # Mapeo de URLs para actualizar BD
            # Convertir ruta absoluta → URL relativa /static/...
            try:
                rel_src  = '/' + src.relative_to(BASE_DIR).as_posix()
                rel_main = '/' + Path(r['main_path']).relative_to(BASE_DIR).as_posix()
                url_mapping[rel_src] = rel_main
            except ValueError:
                pass
        else:
            print(f"[DRY-RUN] {human_size(r['original_size'])}")
            stats['converted'] += 1

    # Resumen
    print("\n" + "=" * 65)
    print(f"  ✅ Convertidas:  {stats['converted']}")
    print(f"  ⏭  Omitidas:    {stats['skipped']}")
    print(f"  ❌ Errores:     {stats['errors']}")

    if not args.dry_run and stats['original_total'] > 0:
        saved_total = stats['original_total'] - stats['webp_total']
        pct_total   = saved_total / stats['original_total'] * 100
        print(f"\n  📦 Tamaño original: {human_size(stats['original_total'])}")
        print(f"  📦 Tamaño WebP:     {human_size(stats['webp_total'])}")
        print(f"  💾 Ahorro:          {human_size(saved_total)} ({pct_total:.1f}%)")

    # Actualizar BD
    if url_mapping and not args.no_db:
        print(f"\n  🗄️  Actualizando base de datos ({len(url_mapping)} URLs)...")
        updated = update_database(url_mapping, dry_run=args.dry_run)
        print(f"  ✅ Filas actualizadas en BD: {updated}")
    elif url_mapping and args.no_db:
        print(f"\n  ⚠️  --no-db: Se omitió la actualización de BD ({len(url_mapping)} URLs pendientes)")
        print("     Las rutas en la BD aún apuntan a los archivos originales.")

    print("\n  ℹ️  Los archivos originales NO fueron eliminados.")
    print("     Puedes eliminarlos manualmente después de verificar que todo funciona.")
    print("=" * 65)


if __name__ == '__main__':
    main()
