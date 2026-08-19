FROM python:3.11-slim

WORKDIR /app

ARG CACHEBUST=1

# Instalar dependencias del sistema:
# - libwebp-dev: soporte WebP nativo para Pillow (más rápido que puro Python)
# - libgl1: requerido por OpenCV headless
# - brotli: soporte Brotli para Flask-Compress (compresión superior a gzip)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libwebp-dev \
    libgl1 \
    brotli \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Crear y asegurar directorio de uploads persistente
RUN mkdir -p /app/static/uploads/comprobantes && chmod -R 777 /app/static/uploads

# Declarar volumen persistente para uploads
VOLUME ["/app/static/uploads"]

EXPOSE 5000

# Usar gunicorn.conf.py para configuración optimizada:
#   - workers calculados automáticamente según CPUs disponibles
#   - gthread worker class (sync + threads, ideal para Flask I/O-bound)
#   - preload_app=True (ahorra RAM con fork copy-on-write)
#   - keepalive=5, timeout=120, max_requests=1000
CMD ["gunicorn", "app:app", "--config", "gunicorn.conf.py"]
