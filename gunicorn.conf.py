# gunicorn.conf.py — Configuración optimizada de Gunicorn para StayHuila VPS
# =============================================================================
# Justificación de cada parámetro:
#
#  workers = 3
#      Fórmula recomendada: (2 × vCPUs) + 1
#      Para VPS de 1 vCPU → 3 workers
#      Para VPS de 2 vCPUs → 5 workers (ajustar si aplica)
#      Cada worker es un proceso Python independiente; usar más de lo necesario
#      desperdicia RAM y puede causar thrashing.
#
#  worker_class = 'gthread'
#      Sync-with-threads: mejor para apps Flask con operaciones I/O (MySQL, filesystem)
#      Alternativa: 'gevent' requeriría instalar gevent y monkey-patching.
#      'gthread' es más simple, estable y suficiente para este uso.
#
#  threads = 2
#      Cada worker manejará hasta 2 peticiones en paralelo mediante threads.
#      Total de peticiones simultáneas: workers × threads = 3 × 2 = 6
#      Ideal para un VPS pequeño con 1-2 GB RAM.
#
#  timeout = 120
#      120 segundos para requests largos (subida de imágenes grandes + procesamiento
#      con OpenCV + llamadas a Gemini API para OCR).
#      Si una petición dura más, Gunicorn mata el worker y lo reinicia.
#
#  keepalive = 5
#      HTTP Keep-Alive: mantiene la conexión TCP abierta 5 segundos después de
#      una respuesta. Evita el overhead de TCP handshake en peticiones consecutivas
#      (CSS, JS, imágenes cargados en secuencia). Traefik ya usa keepalive, esto
#      aplica a la conexión Traefik → Gunicorn (upstream).
#
#  preload_app = True
#      Carga la aplicación Flask UNA SOLA VEZ en el proceso maestro antes de hacer
#      fork() para crear los workers. Beneficios:
#        · Ahorra RAM: los workers comparten memoria (copy-on-write con fork)
#        · Startup más rápido de workers
#        · La inicialización pesada (genai.configure, _ensure_columns) ocurre 1 vez
#      Nota: incompatible con recarga automática en desarrollo (usar debug=True en ese caso).
#
#  max_requests = 1000
#      Cada worker se reinicia después de 1000 peticiones.
#      Previene memory leaks graduales en procesos de larga duración.
#
#  max_requests_jitter = 100
#      Añade variación aleatoria al límite de requests para evitar que todos los
#      workers se reinicien al mismo tiempo (efecto thundering herd).
#
#  graceful_timeout = 30
#      Tiempo máximo para que un worker termine sus peticiones activas antes de
#      ser terminado forzosamente durante un reinicio.

import multiprocessing

# ── Número de workers ─────────────────────────────────────────────────────────
# Detectar CPUs automáticamente. Si el entorno Docker reporta 1 CPU → 3 workers.
_cpu_count = multiprocessing.cpu_count()
workers = (_cpu_count * 2) + 1

# ── Clase de worker ───────────────────────────────────────────────────────────
worker_class = 'gthread'
threads = 2

# ── Bind ──────────────────────────────────────────────────────────────────────
bind = '0.0.0.0:5000'

# ── Timeouts ──────────────────────────────────────────────────────────────────
timeout = 120           # Request timeout (subida imágenes + Gemini OCR)
keepalive = 5           # HTTP Keep-Alive segundos
graceful_timeout = 30   # Tiempo para finalizar peticiones activas al reiniciar

# ── Memoria y estabilidad ─────────────────────────────────────────────────────
preload_app = False      # Cargar app antes de fork (ahorra RAM)
max_requests = 1000     # Reiniciar worker cada 1000 requests (previene memory leaks)
max_requests_jitter = 100  # Variación aleatoria para evitar reinicios simultáneos

# ── Logging ───────────────────────────────────────────────────────────────────
# '-' = stdout/stderr (Docker captura y Dokploy/Traefik puede reenviar a su log)
accesslog = '-'
errorlog  = '-'
loglevel  = 'warning'  # En producción, 'warning' reduce ruido en logs

# ── Access log format ─────────────────────────────────────────────────────────
# Formato legible: IP - Status - Tamaño - Tiempo de respuesta
access_log_format = '%(h)s "%(r)s" %(s)s %(b)s %(D)sµs'
