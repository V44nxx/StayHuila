from pyngrok import ngrok
from dotenv import load_dotenv
import os
import sys
import re

# Cargar variables desde el archivo .env
load_dotenv()

# Intentar obtener el token de las variables de entorno
NGROK_AUTH_TOKEN = os.getenv("NGROK_AUTH_TOKEN")

if not NGROK_AUTH_TOKEN or NGROK_AUTH_TOKEN == "TU_TOKEN_AQUI":
    print("\n⚠️  No se encontró un NGROK_AUTH_TOKEN válido en el archivo .env.")
    print("1. Ve a https://dashboard.ngrok.com/get-started/your-authtoken")
    print("2. Copia tu token.")
    print("3. Pégalo en el archivo .env en la línea: NGROK_AUTH_TOKEN=tu_token")
    sys.exit(1)

def update_env_file(url):
    """Actualiza WEBHOOK_BASE_URL en el archivo .env sin borrar las demás variables."""
    env_path = os.path.join(os.path.dirname(__file__), '.env')
    if not os.path.exists(env_path):
        print(f"⚠️  No se encontró {env_path}. Creándolo...")
        with open(env_path, 'w', encoding='utf-8') as f:
            f.write(f"WEBHOOK_BASE_URL={url}\n")
        return

    with open(env_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Reemplazar la línea existente o agregar al final
    pattern = r'^WEBHOOK_BASE_URL=.*$'
    if re.search(pattern, content, re.MULTILINE):
        content = re.sub(pattern, f'WEBHOOK_BASE_URL={url}', content, flags=re.MULTILINE)
    else:
        content += f"\nWEBHOOK_BASE_URL={url}\n"

    with open(env_path, 'w', encoding='utf-8') as f:
        f.write(content)

try:
    ngrok.set_auth_token(NGROK_AUTH_TOKEN)
    # Abre un túnel en el puerto 5000 (puerto por defecto de Flask)
    public_url = ngrok.connect(5000).public_url

    # Guardar la URL en el .env automáticamente
    update_env_file(public_url)

    print(f"\n✅ Túnel ngrok activo!")
    print(f"🔗 URL Pública: {public_url}")
    print(f"⚙️  WEBHOOK_BASE_URL actualizado automáticamente en .env")
    print("-" * 50)
    print("Ahora puedes iniciar tu servidor Flask en otra terminal.")
    print("Presiona Ctrl+C para cerrar el túnel.")
    
    # Mantener el proceso vivo
    import time
    while True:
        time.sleep(1)
except KeyboardInterrupt:
    print("\nCerrando túnel...")
    ngrok.kill()
except Exception as e:
    print(f"\n❌ Error al iniciar ngrok: {e}")
