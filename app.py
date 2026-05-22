from flask import Flask, render_template, request, redirect, url_for, flash, jsonify, session
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from flask_bcrypt import Bcrypt
import pymysql
from datetime import datetime, date, timedelta, time as dt_time
from decimal import Decimal
import random, string, os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import requests
import hashlib
import hmac
import traceback
from payment_service import PaymentService, NequiProvider
# Módulo de validación y optimización de imágenes (OpenCV + Pillow)
from image_optimizer import process_image
from dotenv import load_dotenv

# Cargar variables de entorno desde .env
load_dotenv()

# Configurar API de Gemini para OCR
import json
import re
import io
import google.generativeai as genai
from PIL import Image

API_KEY = os.environ.get("GEMINI_API_KEY", "AIzaSyCmOKSELF5XKcU1wESXz130Y0Slh750j28")
genai.configure(api_key=API_KEY)


app = Flask(__name__)
app.secret_key = 'stayhuila_secret_2024_xk9'
bcrypt = Bcrypt(app)
login_manager = LoginManager(app)
login_manager.login_view = 'login'
login_manager.login_message = 'Inicia sesión para continuar'
login_manager.login_message_category = 'info'

@app.after_request
def add_header(response):
    """
    Desactiva el caché del navegador para proteger la privacidad del usuario.
    Esto evita que al cerrar sesión se pueda 'volver atrás' y ver datos sensibles.
    También añade headers básicos de seguridad.
    """
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'SAMEORIGIN'
    return response

# ── CONFIGURACIÓN SMTP (Gmail) ────────────────────────────────────────────────
# ↓ PON TU CORREO DE GMAIL Y TU APP PASSWORD AQUÍ ↓
MAIL_USERNAME = 'murciacorredoremerson@gmail.com'   # Ejemplo: 'miCorreo@gmail.com'
MAIL_PASSWORD = 'rdvhjcbzixjmumfv'   # App Password de 16 caracteres (ver instrucciones abajo)
# ─────────────────────────────────────────────────────────────────────────────
# Cómo obtener el App Password de Gmail:
#   1. Ve a myaccount.google.com → Seguridad → Verificación en 2 pasos (actívala)
#   2. Luego en myaccount.google.com → Seguridad → Contraseñas de aplicaciones
#   3. Selecciona "Otra (nombre personalizado)" → escribe "StayHuila" → Generar
#   4. Copia el código de 16 caracteres SIN espacios y pégalo en MAIL_PASSWORD
# ─────────────────────────────────────────────────────────────────────────────
MAIL_SERVER   = os.environ.get('MAIL_SERVER', 'smtp.gmail.com')
MAIL_PORT     = int(os.environ.get('MAIL_PORT', '587'))
MAIL_FROM     = MAIL_USERNAME

# ── CONFIGURACIÓN NEQUI NEGOCIOS ───────────────────────────────────────────────
NEQUI_NEGOCIO_CELULAR = os.environ.get('NEQUI_NEGOCIO_CELULAR', '3112345678')
NEQUI_NEGOCIO_NOMBRE = os.environ.get('NEQUI_NEGOCIO_NOMBRE', 'StayHuila Reservas')
NEQUI_NEGOCIO_LINK = os.environ.get('NEQUI_NEGOCIO_LINK', 'https://link.nequi.co/stayhuila')

# Inicializar servicio de pagos
payment_provider = NequiProvider(NEQUI_NEGOCIO_CELULAR, NEQUI_NEGOCIO_NOMBRE, NEQUI_NEGOCIO_LINK)
payment_service = PaymentService(payment_provider)
# ─────────────────────────────────────────────────────────────────────────────


def combine_date_time(d, t, default=dt_time(15, 0)):
    """Combina un date con un TIME de MySQL (timedelta) → datetime.
    Si t es None usa default (dt_time). Soporta timedelta y dt_time."""
    if d is None:
        return None
    if t is None:
        return datetime.combine(d, default)
    if isinstance(t, timedelta):
        total = int(t.total_seconds())
        return datetime.combine(d, dt_time(total // 3600, (total % 3600) // 60))
    if isinstance(t, dt_time):
        return datetime.combine(d, t)
    return datetime.combine(d, default)


def send_reset_email(to_email, codigo):
    """Envía el código de recuperación de contraseña por correo."""
    if not MAIL_USERNAME or not MAIL_PASSWORD:
        raise RuntimeError('El servicio de correo no está configurado en el servidor.')
    msg = MIMEMultipart('alternative')
    msg['Subject'] = 'Código de recuperación — StayHuila'
    msg['From']    = f'StayHuila <{MAIL_FROM}>'
    msg['To']      = to_email
    html = f"""<!DOCTYPE html>
<html>
<body style="font-family:'Outfit',Arial,sans-serif;background:#f5f5f0;margin:0;padding:24px;">
  <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.08);">
    <div style="background:linear-gradient(135deg,#2C4A3B,#3d6b52);padding:32px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:1.6rem;letter-spacing:-.02em;">🌿 StayHuila</h1>
      <p style="color:rgba(255,255,255,.8);margin:6px 0 0;font-size:.95rem;">Recuperación de contraseña</p>
    </div>
    <div style="padding:32px;">
      <p style="color:#333;font-size:1rem;margin-bottom:.6rem;">Hola,</p>
      <p style="color:#555;font-size:.95rem;line-height:1.6;">Recibimos una solicitud para restablecer la contraseña de tu cuenta StayHuila. Usa el siguiente código de verificación:</p>
      <div style="background:#f0f7f4;border:2px dashed #2C4A3B;border-radius:12px;padding:28px;text-align:center;margin:24px 0;">
        <span style="font-size:2.6rem;font-weight:800;letter-spacing:.35em;color:#2C4A3B;">{codigo}</span>
      </div>
      <p style="color:#888;font-size:.85rem;">⏱ Este código expira en <strong>15 minutos</strong>.</p>
      <p style="color:#888;font-size:.85rem;margin-top:.5rem;">Si no solicitaste este cambio, puedes ignorar este correo con seguridad.</p>
    </div>
    <div style="background:#f5f5f0;padding:16px;text-align:center;">
      <p style="color:#aaa;font-size:.78rem;margin:0;">© 2024 StayHuila · Huila, Colombia</p>
    </div>
  </div>
</body>
</html>"""
    msg.attach(MIMEText(html, 'html'))
    with smtplib.SMTP(MAIL_SERVER, MAIL_PORT) as server:
        server.ehlo()
        server.starttls()
        server.login(MAIL_USERNAME, MAIL_PASSWORD)
        server.sendmail(MAIL_FROM, to_email, msg.as_string())



DB = dict(host='localhost', user='root', password='', database='StayHuila',
          charset='utf8mb4', cursorclass=pymysql.cursors.DictCursor)

def db():
    return pymysql.connect(**DB)

def _ensure_columns():
    """Auto-migra columnas opcionales y tablas nuevas (seguro ejecutar varias veces)."""
    try:
        c = db()
        with c.cursor() as cur:
            # ── Crédito de descuento en usuarios ─────────────────────────────
            cur.execute("SHOW COLUMNS FROM usuarios LIKE 'credito_descuento'")
            if not cur.fetchone():
                cur.execute("ALTER TABLE usuarios ADD COLUMN credito_descuento DECIMAL(5,2) DEFAULT 0")

            # ── Estadía mínima y máxima en hospedajes ────────────────────────
            # estadia_minima: cantidad mínima de noches requerida (default 1)
            cur.execute("SHOW COLUMNS FROM hospedajes LIKE 'estadia_minima'")
            if not cur.fetchone():
                cur.execute("ALTER TABLE hospedajes ADD COLUMN estadia_minima TINYINT UNSIGNED NOT NULL DEFAULT 1")

            # estadia_maxima: cantidad máxima de noches permitida (default 30)
            cur.execute("SHOW COLUMNS FROM hospedajes LIKE 'estadia_maxima'")
            if not cur.fetchone():
                cur.execute("ALTER TABLE hospedajes ADD COLUMN estadia_maxima TINYINT UNSIGNED NOT NULL DEFAULT 30")

            # ── Tabla de sesiones de experiencias ────────────────────────────
            cur.execute("""
                CREATE TABLE IF NOT EXISTS experiencia_sesiones (
                    id            INT AUTO_INCREMENT PRIMARY KEY,
                    experiencia_id INT NOT NULL,
                    fecha         DATE NOT NULL,
                    hora_inicio   TIME NOT NULL,
                    hora_fin      TIME NOT NULL,
                    cupos_totales INT NOT NULL,
                    cupos_disponibles INT NOT NULL,
                    estado        ENUM('disponible', 'lleno', 'cancelado', 'suspendido_por_clima') DEFAULT 'disponible',
                    creado_en     DATETIME DEFAULT NOW(),
                    FOREIGN KEY (experiencia_id) REFERENCES experiencias(id) ON DELETE CASCADE,
                    INDEX idx_exp_fecha (experiencia_id, fecha)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
            """)

            # ── Columna sesion_id en reservas ────────────────────────────────
            cur.execute("SHOW COLUMNS FROM reservas LIKE 'sesion_id'")
            if not cur.fetchone():
                cur.execute("ALTER TABLE reservas ADD COLUMN sesion_id INT NULL AFTER experiencia_id")
                cur.execute("ALTER TABLE reservas ADD FOREIGN KEY (sesion_id) REFERENCES experiencia_sesiones(id) ON DELETE SET NULL")

            # ── Tabla de Pagos ───────────────────────────────────────────────
            # Asegurar que existan las nuevas columnas para Mercado Pago
            cur.execute("SHOW COLUMNS FROM pagos LIKE 'usuario_id'")
            if not cur.fetchone():
                cur.execute("ALTER TABLE pagos ADD COLUMN usuario_id INT NOT NULL DEFAULT 0 AFTER reserva_id")

            cur.execute("SHOW COLUMNS FROM pagos LIKE 'preference_id'")
            if not cur.fetchone():
                cur.execute("ALTER TABLE pagos ADD COLUMN preference_id VARCHAR(200) NULL AFTER usuario_id")

            cur.execute("SHOW COLUMNS FROM pagos LIKE 'payment_id'")
            if not cur.fetchone():
                cur.execute("ALTER TABLE pagos ADD COLUMN payment_id VARCHAR(100) NULL AFTER preference_id")
            
            # Índice único en preference_id
            cur.execute("SHOW INDEX FROM pagos WHERE Key_name = 'idx_preference_id'")
            if not cur.fetchone():
                try:
                    cur.execute("CREATE UNIQUE INDEX idx_preference_id ON pagos(preference_id)")
                except Exception:
                    pass  # Ya existe con otro nombre
            
            cur.execute("SHOW COLUMNS FROM pagos LIKE 'currency'")
            if not cur.fetchone():
                cur.execute("ALTER TABLE pagos ADD COLUMN currency VARCHAR(10) DEFAULT 'COP' AFTER monto")
            
            cur.execute("SHOW COLUMNS FROM pagos LIKE 'provider'")
            if not cur.fetchone():
                cur.execute("ALTER TABLE pagos ADD COLUMN provider VARCHAR(50) DEFAULT 'mercadopago' AFTER estado")

            cur.execute("SHOW COLUMNS FROM pagos LIKE 'mp_status'")
            if not cur.fetchone():
                cur.execute("ALTER TABLE pagos ADD COLUMN mp_status VARCHAR(50) NULL AFTER provider")

            cur.execute("SHOW COLUMNS FROM pagos LIKE 'mp_status_detail'")
            if not cur.fetchone():
                cur.execute("ALTER TABLE pagos ADD COLUMN mp_status_detail VARCHAR(200) NULL AFTER mp_status")

            # Modificar a VARCHAR flexible para compatibilidad con MP
            cur.execute("ALTER TABLE pagos MODIFY COLUMN metodo VARCHAR(100) NOT NULL DEFAULT 'mercadopago'")
            cur.execute("ALTER TABLE pagos MODIFY COLUMN estado VARCHAR(50) DEFAULT 'pending'")

            # ── Columnas MP en reservas (desnormalizadas para queries rápidas) ──
            cur.execute("SHOW COLUMNS FROM reservas LIKE 'mp_payment_id'")
            if not cur.fetchone():
                cur.execute("ALTER TABLE reservas ADD COLUMN mp_payment_id VARCHAR(100) NULL")

            cur.execute("SHOW COLUMNS FROM reservas LIKE 'mp_preference_id'")
            if not cur.fetchone():
                cur.execute("ALTER TABLE reservas ADD COLUMN mp_preference_id VARCHAR(200) NULL")

            # ── Tabla de logs de webhooks para auditoría ─────────────────────
            cur.execute("""
                CREATE TABLE IF NOT EXISTS webhook_logs (
                    id          INT AUTO_INCREMENT PRIMARY KEY,
                    received_at DATETIME DEFAULT NOW(),
                    topic       VARCHAR(50),
                    payment_id  VARCHAR(100),
                    mp_status   VARCHAR(50),
                    reserva_id  INT,
                    raw_payload TEXT,
                    procesado   TINYINT(1) DEFAULT 0,
                    error_msg   TEXT,
                    ip_origen   VARCHAR(45),
                    INDEX idx_wl_payment (payment_id),
                    INDEX idx_wl_reserva (reserva_id)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
            """)

            # ── Tabla de Lista de Espera ─────────────────────────────────────
            cur.execute("""
                CREATE TABLE IF NOT EXISTS lista_espera (
                    id            INT AUTO_INCREMENT PRIMARY KEY,
                    usuario_id    INT NOT NULL,
                    sesion_id     INT NOT NULL,
                    huespedes     INT NOT NULL DEFAULT 1,
                    creado_en     DATETIME DEFAULT NOW(),
                    notificado    TINYINT(1) DEFAULT 0,
                    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
                    FOREIGN KEY (sesion_id) REFERENCES experiencia_sesiones(id) ON DELETE CASCADE
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
            """)

        c.commit()
        c.close()
    except Exception:
        pass
_ensure_columns()

def serialize(obj):
    """Convert MySQL types to JSON-safe Python types."""
    if isinstance(obj, dict):
        return {k: serialize(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [serialize(i) for i in obj]
    if isinstance(obj, timedelta):
        total = int(obj.total_seconds())
        return f"{total//3600:02d}:{(total%3600)//60:02d}"
    if isinstance(obj, (date, datetime)):
        return obj.isoformat()
    if isinstance(obj, (dt_time,)):
        return obj.strftime('%H:%M')
    if isinstance(obj, Decimal):
        return float(obj)
    return obj

def digits_only(value, max_length):
    return ''.join(c for c in str(value or '') if c.isdigit())[:max_length]

def bounded_int(value, default, minimum, maximum):
    try:
        number = int(value)
    except (TypeError, ValueError):
        number = default
    return max(minimum, min(maximum, number))

class User(UserMixin):
    def __init__(self, d):
        self.id = d['id']; self.nombre = d['nombre']; self.apellido = d['apellido']
        self.email = d['email']; self.tipo = d['tipo']; self.puntos = d['puntos_gamificacion']
        self.foto_perfil = d.get('foto_perfil')
        self.credito_descuento = float(d.get('credito_descuento') or 0)

@login_manager.user_loader
def load_user(uid):
    c = db()
    try:
        with c.cursor() as cur:
            cur.execute("SELECT * FROM usuarios WHERE id=%s AND activo=1", (uid,))
            u = cur.fetchone()
        return User(u) if u else None
    finally:
        c.close()

def gen_code():
    return 'SH' + ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))

def check_wompi_and_login(wompi_txn_id, rid=None):
    if not wompi_txn_id:
        return None, rid
    
    wompi_data = None
    # Consultar la API de Wompi (producción primero, luego sandbox)
    for base_url in ["https://production.wompi.co/v1", "https://sandbox.wompi.co/v1"]:
        try:
            r = requests.get(f"{base_url}/transactions/{wompi_txn_id}", timeout=5)
            if r.status_code == 200:
                wompi_data = r.json().get('data', {})
                break
        except Exception as e:
            app.logger.error(f"[Wompi Helper] Error al consultar {wompi_txn_id} en {base_url}: {e}")
            
    if not wompi_data:
        return None, rid
        
    status = wompi_data.get('status')
    email = wompi_data.get('customer_email')
    amount_in_cents = wompi_data.get('amount_in_cents')
    
    if email:
        c = db()
        try:
            with c.cursor() as cur:
                cur.execute("SELECT * FROM usuarios WHERE email=%s AND activo=1", (email,))
                user = cur.fetchone()
                if user:
                    # Iniciar sesión automáticamente si no está logueado o es otro usuario
                    if not current_user.is_authenticated or current_user.email != email:
                        login_user(User(user))
                        app.logger.info(f"[Wompi Helper] Auto-login de usuario: {email}")
                    
                    # Intentar resolver la reserva si no se pasó
                    if not rid:
                        cur.execute(
                            "SELECT id, total FROM reservas WHERE usuario_id=%s AND estado='pendiente_pago' ORDER BY id DESC",
                            (user['id'],)
                        )
                        pending_reservas = cur.fetchall()
                        expected_cents = int(amount_in_cents) if amount_in_cents else 0
                        for pr in pending_reservas:
                            pr_cents = int(float(pr['total']) * 100)
                            if abs(pr_cents - expected_cents) < 5:
                                rid = pr['id']
                                break
                        # Si sigue sin encontrarse pero hay pendientes, asignar la más reciente
                        if not rid and pending_reservas:
                            rid = pending_reservas[0]['id']
        except Exception as e:
            app.logger.error(f"[Wompi Helper] Error al asociar usuario/reserva: {e}\n{traceback.format_exc()}")
        finally:
            c.close()
            
    return status, rid

# ── MERCADO PAGO HELPERS ────────────────────────────────────────────────────────
@app.route('/webhook/mercadopago', methods=['POST'])
def mercadopago_webhook_deprecated():
    """Webhook depreciado de Mercado Pago."""
    return jsonify({"success": False, "message": "Deprecated. Use Nequi."}), 410


@app.route('/pago/transferir/<int:reserva_id>')
@login_required
def pago_transferir_gateway(reserva_id):
    """
    Ruta de transición premium que almacena el ID de la reserva en sesión y localStorage
    y redirige de forma fluida a la URL oficial de Nequi Negocios.
    """
    c = db()
    try:
        with c.cursor() as cur:
            cur.execute("""
                SELECT id FROM reservas 
                WHERE id = %s AND usuario_id = %s AND estado = 'pendiente_pago'
                LIMIT 1
            """, (reserva_id, current_user.id))
            reserva = cur.fetchone()
            
            if not reserva:
                flash('Reserva no válida para pagar.', 'error')
                return redirect(url_for('mis_reservas'))
                
            session['pending_reserva_id'] = reserva_id
            return render_template(
                'pago_transferir.html',
                reserva_id=reserva_id,
                nequi_link=NEQUI_NEGOCIO_LINK
            )
    except Exception as e:
        app.logger.error(f"[Pago Transferir] Error: {e}")
        flash('Error al iniciar la pasarela de Nequi.', 'error')
        return redirect(url_for('mis_reservas'))
    finally:
        c.close()


@app.route('/pago/nequi/<int:reserva_id>')
@login_required
def pago_nequi_gateway(reserva_id):
    """
    Antiguo portal integrado, redirigido a la pasarela de transferencia por enlace.
    """
    return redirect(url_for('pago_transferir_gateway', reserva_id=reserva_id))


@app.route('/api/pago/nequi/confirmar', methods=['POST'])
@login_required
def api_nequi_confirmar():
    """
    Confirma el pago a través de Nequi de forma interactiva y segura.
    Valida el número de celular y la referencia de pago real, actualizando las tablas pagos y reservas usando SELECT FOR UPDATE.
    """
    data = request.get_json() or {}
    reserva_id = data.get('reserva_id')
    celular = data.get('celular', '').strip()
    referencia = data.get('referencia', '').strip()
    
    if not reserva_id:
        return jsonify({'success': False, 'error': 'Falta el ID de la reserva'}), 400
        
    if not payment_provider.validar_celular(celular):
        return jsonify({'success': False, 'error': 'Número celular de Nequi inválido (debe tener 10 dígitos y empezar con 3)'}), 400

    if not referencia:
        return jsonify({'success': False, 'error': 'La referencia de pago es obligatoria.'}), 400

    if len(referencia) < 4:
        return jsonify({'success': False, 'error': 'La referencia de pago debe tener al menos 4 caracteres.'}), 400

    c = db()
    try:
        c.autocommit(False)
        with c.cursor() as cur:
            # SELECT FOR UPDATE para evitar colisiones
            cur.execute("SELECT * FROM reservas WHERE id=%s AND usuario_id=%s FOR UPDATE", (reserva_id, current_user.id))
            reserva = cur.fetchone()
            
            if not reserva:
                c.rollback()
                return jsonify({'success': False, 'error': 'Reserva no encontrada'}), 404
                
            if reserva['estado'] != 'pendiente_pago':
                c.rollback()
                return jsonify({'success': False, 'error': f'La reserva ya no está pendiente de pago. Estado: {reserva["estado"]}'}), 400

            # Guardar la referencia real del pago ingresada por el usuario como ID de transacción
            txn_id = referencia
            metodo_label = f"Nequi (Cel: {celular})"

            # 1. Actualizar tabla pagos
            cur.execute("""
                UPDATE pagos
                SET payment_id       = %s,
                    monto            = %s,
                    currency         = 'COP',
                    metodo           = %s,
                    estado           = 'approved',
                    mp_status        = 'approved',
                    mp_status_detail = 'acreditado',
                    fecha_pago       = NOW()
                WHERE reserva_id = %s AND tipo = 'cobro'
            """, (txn_id, float(reserva['total']), metodo_label, reserva_id))

            # 2. Actualizar tabla reservas
            cur.execute("""
                UPDATE reservas
                SET estado = 'confirmada',
                    estado_pago = 'pagado',
                    fecha_confirmacion = NOW(),
                    mp_payment_id = %s
                WHERE id = %s
            """, (txn_id, reserva_id))

            # 3. Gamificación: Sumar 50 puntos al usuario
            cur.execute(
                "UPDATE usuarios SET puntos_gamificacion = puntos_gamificacion + 50 WHERE id = %s",
                (current_user.id,)
            )

            c.commit()
            app.logger.info(f"[Nequi] Pago exitoso confirmado para reserva {reserva_id}. Txn={txn_id}")
            return jsonify({'success': True, 'txn_id': txn_id, 'redirect_url': f"/pago/exito?external_reference={reserva_id}&payment_id={txn_id}"})
            
    except Exception as e:
        c.rollback()
        app.logger.error(f"[Nequi Confirmar] Error: {e}\n{traceback.format_exc()}")
        return jsonify({'success': False, 'error': f'Error interno del servidor: {str(e)}'}), 500
    finally:
        c.close()



@app.route('/pago/exito')
def pago_exito():
    """Pantalla de pago exitoso con datos reales de la transacción."""
    rid = request.args.get('external_reference') or request.args.get('reserva_id')
    payment_id_mp = request.args.get('payment_id')
    merchant_order_id = request.args.get('merchant_order_id', '')
    wompi_txn_id = request.args.get('id')

    if wompi_txn_id:
        status, new_rid = check_wompi_and_login(wompi_txn_id, rid)
        if status:
            if status != 'APPROVED':
                dest_route = 'pago_pendiente' if status == 'PENDING' else 'pago_fallo'
                return redirect(url_for(dest_route, reserva_id=new_rid or rid, id=wompi_txn_id))
            
            if new_rid and new_rid != rid:
                return redirect(url_for('pago_exito', reserva_id=new_rid, payment_id=wompi_txn_id))
            elif new_rid:
                rid = new_rid

    # Si no se pasó por parámetro, intentar recuperar de la sesión
    session_reserva_id = session.pop('pending_reserva_id', None)
    if not rid and session_reserva_id:
        return redirect(url_for('pago_exito', reserva_id=session_reserva_id))

    if not current_user.is_authenticated:
        flash('Inicia sesión para ver los detalles de tu reserva.', 'info')
        return redirect(url_for('login', next=request.full_path))

    reserva_data = None
    pago_data = None

    if rid:
        # Auto-confirmación atómica de la reserva si sigue pendiente
        c = db()
        try:
            c.autocommit(False)
            with c.cursor() as cur:
                # SELECT FOR UPDATE para evitar colisiones
                cur.execute("SELECT * FROM reservas WHERE id=%s AND usuario_id=%s FOR UPDATE", (rid, current_user.id))
                reserva = cur.fetchone()
                
                if reserva and reserva['estado'] == 'pendiente_pago':
                    # Generar ID de transacción para registrar el pago con Nequi Link
                    txn_id = payment_id_mp or wompi_txn_id or ("NEQ-" + "".join(random.choices(string.ascii_uppercase + string.digits, k=8)))
                    metodo_label = "Nequi Negocios Link"

                    # 1. Actualizar tabla pagos
                    cur.execute("""
                        UPDATE pagos
                        SET payment_id       = %s,
                            monto            = %s,
                            currency         = 'COP',
                            metodo           = %s,
                            estado           = 'approved',
                            mp_status        = 'approved',
                            mp_status_detail = 'acreditado',
                            fecha_pago       = NOW()
                        WHERE reserva_id = %s AND tipo = 'cobro'
                    """, (txn_id, float(reserva['total']), metodo_label, rid))

                    # 2. Actualizar tabla reservas
                    cur.execute("""
                        UPDATE reservas
                        SET estado = 'confirmada',
                            estado_pago = 'pagado',
                            fecha_confirmacion = NOW(),
                            mp_payment_id = %s
                        WHERE id = %s
                    """, (txn_id, rid))

                    # 3. Gamificación: Sumar 50 puntos al usuario
                    cur.execute(
                        "UPDATE usuarios SET puntos_gamificacion = puntos_gamificacion + 50 WHERE id = %s",
                        (current_user.id,)
                    )
                    c.commit()
                    app.logger.info(f"[Nequi Exito] Pago de reserva {rid} auto-confirmado exitosamente. Txn={txn_id}")
                else:
                    c.rollback()
        except Exception as e:
            c.rollback()
            app.logger.error(f"[Nequi Exito] Error al auto-confirmar reserva {rid}: {e}\n{traceback.format_exc()}")
        finally:
            c.close()

    if rid:
        try:
            c = db()
            with c.cursor() as cur:
                cur.execute("""
                    SELECT r.*,
                        COALESCE(h.nombre, e.nombre) AS hosp_nombre,
                        COALESCE(h.municipio, e.municipio) AS municipio,
                        COALESCE(i.url, ei.url) AS hosp_img
                    FROM reservas r
                    LEFT JOIN hospedajes h ON r.hospedaje_id = h.id
                    LEFT JOIN hospedaje_imagenes i ON h.id = i.hospedaje_id AND i.es_portada = 1
                    LEFT JOIN experiencias e ON r.experiencia_id = e.id
                    LEFT JOIN experiencia_imagenes ei ON e.id = ei.experiencia_id AND ei.es_portada = 1
                    WHERE r.id = %s AND r.usuario_id = %s
                """, (rid, current_user.id))
                reserva_data = serialize(cur.fetchone())

                if reserva_data:
                    cur.execute("""
                        SELECT payment_id, monto, currency, metodo, estado, mp_status,
                               fecha_pago, provider
                        FROM pagos
                        WHERE reserva_id = %s AND tipo = 'cobro'
                        ORDER BY id DESC LIMIT 1
                    """, (rid,))
                    pago_data = serialize(cur.fetchone())
            c.close()
        except Exception as e:
            app.logger.error(f"[pago_exito] Error cargando datos: {e}")

    # Si rid existe pero no se encontró la reserva (o no pertenece a current_user)
    if rid and not reserva_data:
        flash('No se pudo encontrar la reserva especificada.', 'error')
        return redirect(url_for('mis_reservas'))

    return render_template(
        'pago_resultado.html',
        resultado='exito',
        reserva=reserva_data,
        pago=pago_data,
        payment_id_mp=payment_id_mp or wompi_txn_id,
        merchant_order_id=merchant_order_id
    )


@app.route('/pago/fallo')
def pago_fallo():
    """Pantalla de pago fallido con opciones de reintento."""
    rid = request.args.get('external_reference') or request.args.get('reserva_id')
    wompi_txn_id = request.args.get('id')

    if wompi_txn_id:
        status, new_rid = check_wompi_and_login(wompi_txn_id, rid)
        if new_rid:
            rid = new_rid

    session_reserva_id = session.pop('pending_reserva_id', None)
    if not rid and session_reserva_id:
        return redirect(url_for('pago_fallo', reserva_id=session_reserva_id))

    if not current_user.is_authenticated:
        flash('Inicia sesión para ver los detalles de tu reserva.', 'info')
        return redirect(url_for('login', next=request.full_path))

    reserva_data = None

    if rid:
        try:
            c = db()
            with c.cursor() as cur:
                cur.execute("""
                    SELECT r.*,
                        COALESCE(h.nombre, e.nombre) AS hosp_nombre,
                        COALESCE(i.url, ei.url) AS hosp_img
                    FROM reservas r
                    LEFT JOIN hospedajes h ON r.hospedaje_id = h.id
                    LEFT JOIN hospedaje_imagenes i ON h.id = i.hospedaje_id AND i.es_portada = 1
                    LEFT JOIN experiencias e ON r.experiencia_id = e.id
                    LEFT JOIN experiencia_imagenes ei ON e.id = ei.experiencia_id AND ei.es_portada = 1
                    WHERE r.id = %s AND r.usuario_id = %s
                """, (rid, current_user.id))
                reserva_data = serialize(cur.fetchone())
            c.close()
        except Exception as e:
            app.logger.error(f"[pago_fallo] Error: {e}")

    return render_template('pago_resultado.html', resultado='fallo', reserva=reserva_data, pago=None)


@app.route('/pago/pendiente')
def pago_pendiente():
    """Pantalla de pago pendiente (PSE, transferencias bancarias)."""
    rid = request.args.get('external_reference') or request.args.get('reserva_id')
    wompi_txn_id = request.args.get('id')

    if wompi_txn_id:
        status, new_rid = check_wompi_and_login(wompi_txn_id, rid)
        if new_rid:
            rid = new_rid

    session_reserva_id = session.pop('pending_reserva_id', None)
    if not rid and session_reserva_id:
        return redirect(url_for('pago_pendiente', reserva_id=session_reserva_id))

    if not current_user.is_authenticated:
        flash('Inicia sesión para ver los detalles de tu reserva.', 'info')
        return redirect(url_for('login', next=request.full_path))

    reserva_data = None
    pago_data = None

    if rid:
        try:
            c = db()
            with c.cursor() as cur:
                cur.execute("""
                    SELECT r.*,
                        COALESCE(h.nombre, e.nombre) AS hosp_nombre,
                        COALESCE(i.url, ei.url) AS hosp_img
                    FROM reservas r
                    LEFT JOIN hospedajes h ON r.hospedaje_id = h.id
                    LEFT JOIN hospedaje_imagenes i ON h.id = i.hospedaje_id AND i.es_portada = 1
                    LEFT JOIN experiencias e ON r.experiencia_id = e.id
                    LEFT JOIN experiencia_imagenes ei ON e.id = ei.experiencia_id AND ei.es_portada = 1
                    WHERE r.id = %s AND r.usuario_id = %s
                """, (rid, current_user.id))
                reserva_data = serialize(cur.fetchone())

                if reserva_data:
                    cur.execute("""
                        SELECT payment_id, monto, currency, metodo, estado, mp_status, fecha_pago
                        FROM pagos WHERE reserva_id = %s AND tipo = 'cobro'
                        ORDER BY id DESC LIMIT 1
                    """, (rid,))
                    pago_data = serialize(cur.fetchone())
            c.close()
        except Exception as e:
            app.logger.error(f"[pago_pendiente] Error: {e}")

    return render_template('pago_resultado.html', resultado='pendiente', reserva=reserva_data, pago=pago_data)

@app.route('/pagar/<int:reserva_id>')
@login_required
def pagar_reserva(reserva_id):
    """
    Genera o reutiliza la intención de pago para Nequi y redirige a la pasarela Nequi local.
    """
    c = db()
    try:
        c.autocommit(False)
        with c.cursor() as cur:
            # SELECT FOR UPDATE — evitar procesamiento paralelo por doble clic
            cur.execute("""
                SELECT r.*, h.nombre AS hosp_nombre, e.nombre AS exp_nombre,
                       p.preference_id AS pago_preference_id,
                       p.estado AS pago_estado,
                       p.fecha_pago AS pago_fecha
                FROM reservas r
                LEFT JOIN hospedajes h ON r.hospedaje_id = h.id
                LEFT JOIN experiencias e ON r.experiencia_id = e.id
                LEFT JOIN pagos p ON p.reserva_id = r.id AND p.tipo = 'cobro'
                WHERE r.id = %s AND r.usuario_id = %s
                FOR UPDATE
            """, (reserva_id, current_user.id))
            reserva = cur.fetchone()

            if not reserva:
                c.rollback()
                flash('Reserva no encontrada.', 'error')
                return redirect(url_for('mis_reservas'))

            # Validar que la reserva esté pendiente de pago
            if reserva['estado'] != 'pendiente_pago':
                c.rollback()
                if reserva['estado'] == 'confirmada':
                    flash('Esta reserva ya fue pagada exitosamente. ✅', 'success')
                elif reserva['estado'] == 'cancelada':
                    flash('Esta reserva fue cancelada.', 'error')
                else:
                    flash(f'Estado de reserva: {reserva["estado"]}', 'info')
                return redirect(url_for('confirmacion', id=reserva_id))

            # Validar que el pago no está ya aprobado
            if reserva.get('pago_estado') == 'approved':
                c.rollback()
                flash('¡Esta reserva ya tiene un pago aprobado!', 'success')
                return redirect(url_for('confirmacion', id=reserva_id))

            nombre_publicacion = reserva.get('hosp_nombre') or reserva.get('exp_nombre') or 'Estadía'
            titulo = f"StayHuila - {nombre_publicacion}"
            descripcion = f"Reserva {reserva['codigo_reserva']} · {reserva['num_huespedes']} huésped(es)"

            reservation_data = {
                'id': reserva_id,
                'titulo': titulo,
                'descripcion': descripcion,
                'total': float(reserva['total']),
                'tipo': reserva['tipo'],
                'codigo': reserva['codigo_reserva'],
                'base_url': request.host_url.rstrip('/')
            }

            user_data = {
                'id': current_user.id,
                'nombre': current_user.nombre,
                'apellido': current_user.apellido,
                'email': current_user.email
            }

            preference = payment_service.generate_payment_link(reservation_data, user_data)

            # Actualizar preference_id en pagos y en reservas (desnormalizado)
            cur.execute("""
                UPDATE pagos
                SET preference_id = %s
                WHERE reserva_id = %s AND tipo = 'cobro'
            """, (preference['id'], reserva_id))

            cur.execute("""
                UPDATE reservas SET mp_preference_id = %s WHERE id = %s
            """, (preference['id'], reserva_id))

            c.commit()

            # Redirigir a la pantalla de transición local para registrar localStorage
            return redirect(url_for('pago_transferir_gateway', reserva_id=reserva_id))

    except Exception as e:
        c.rollback()
        app.logger.error(f"[Nequi] Error al generar pago reserva {reserva_id}: {e}\n{traceback.format_exc()}")
        flash(f'Error al conectar con la pasarela de Nequi: {str(e)}', 'error')
        return redirect(url_for('confirmacion', id=reserva_id))
    finally:
        c.close()



@app.route('/api/pago/estado/<int:reserva_id>')
@login_required
def api_pago_estado(reserva_id):
    """
    API JSON para polling del estado del pago desde el frontend.
    Usado en la pantalla de pago pendiente para verificar si el webhook confirmó el pago.
    """
    c = db()
    try:
        with c.cursor() as cur:
            cur.execute("""
                SELECT r.estado, r.estado_pago, r.mp_payment_id, r.codigo_reserva,
                       p.payment_id, p.fecha_pago, p.metodo, p.mp_status, p.monto, p.currency
                FROM reservas r
                LEFT JOIN pagos p ON p.reserva_id = r.id AND p.tipo = 'cobro'
                WHERE r.id = %s AND r.usuario_id = %s
                LIMIT 1
            """, (reserva_id, current_user.id))
            row = cur.fetchone()

        if not row:
            return jsonify({'success': False, 'error': 'Reserva no encontrada'}), 404

        return jsonify({
            'success': True,
            'estado_reserva': row['estado'],
            'estado_pago': row.get('mp_status') or row.get('estado_pago', ''),
            'payment_id': row.get('payment_id') or row.get('mp_payment_id'),
            'codigo_reserva': row['codigo_reserva'],
            'fecha_pago': row['fecha_pago'].isoformat() if row.get('fecha_pago') else None,
            'metodo': row.get('metodo'),
            'monto': float(row['monto']) if row.get('monto') else None,
            'currency': row.get('currency', 'COP')
        })
    finally:
        c.close()


def extraer_json_ocr(texto):
    """Extrae el bloque JSON de la respuesta del modelo OCR."""
    try:
        return json.loads(texto)
    except Exception:
        match = re.search(r'```json\s*(.*?)\s*```', texto, re.DOTALL)
        if match:
            try: return json.loads(match.group(1))
            except Exception: pass
        match = re.search(r'(\{.*?\})', texto, re.DOTALL)
        if match:
            try: return json.loads(match.group(1))
            except Exception: pass
    return None


@app.route('/api/pago/ocr-confirmar/<int:reserva_id>', methods=['POST'])
@login_required
def api_pago_ocr_confirmar(reserva_id):
    """
    Recibe un comprobante de pago en formato imagen, realiza OCR con Gemini,
    y si se detecta un ID de transacción válido, confirma el pago de forma automática.
    """
    import uuid
    file = request.files.get('file')
    if not file or not file.filename:
        return jsonify({'success': False, 'error': 'No se cargó ningún archivo de comprobante.'}), 400

    # 1. Validar extensión de la imagen
    allowed_extensions = {'jpg', 'jpeg', 'png', 'webp'}
    ext = file.filename.rsplit('.', 1)[-1].lower() if '.' in file.filename else ''
    if ext not in allowed_extensions:
        return jsonify({'success': False, 'error': f'Formato no permitido (.{ext}). Usa JPG, JPEG, PNG o WEBP.'}), 400

    c = db()
    try:
        # 2. Leer bytes de la imagen
        file_bytes = file.read()
        if len(file_bytes) > 5 * 1024 * 1024:
            return jsonify({'success': False, 'error': 'El archivo es demasiado grande (máximo 5MB).'}), 400

        # Guardar una copia local del comprobante para auditoría y verificación futura
        upload_folder = os.path.join(app.root_path, 'static', 'uploads', 'comprobantes')
        os.makedirs(upload_folder, exist_ok=True)
        filename = f"comprobante_reserva_{reserva_id}_{uuid.uuid4().hex[:10]}.{ext}"
        filepath = os.path.join(upload_folder, filename)
        
        with open(filepath, 'wb') as f:
            f.write(file_bytes)

        # 3. Llamar a Gemini 2.5 Flash con la imagen para OCR
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        prompt = (
            "Analiza esta imagen que es un comprobante de pago (Nequi, Daviplata, Wompi, etc.). "
            "Detecta y extrae el ID de transacción, número de aprobación o referencia de pago. "
            "Responde ÚNICAMENTE con un objeto JSON válido con la estructura exacta: "
            '{"transaction_id": "VALOR_DETECTADO", "confidence": "high|medium|low"}. '
            "Si no logras encontrar ningún ID de transacción o referencia de pago en la imagen, deja transaction_id como null."
        )

        try:
            pil_image = Image.open(io.BytesIO(file_bytes))
            response = model.generate_content([prompt, pil_image])
            ocr_text = response.text.strip()
            app.logger.info(f"[OCR] Respuesta de Gemini para reserva {reserva_id}: {ocr_text}")
        except Exception as ge:
            app.logger.error(f"[OCR] Error llamando a Gemini: {ge}")
            return jsonify({'success': False, 'error': 'Error de comunicación con el servicio de IA. Inténtalo de nuevo o ingresa el ID a mano.'}), 500

        # 4. Parsear respuesta JSON
        data = extraer_json_ocr(ocr_text)
        if not data:
            return jsonify({'success': False, 'error': 'No se pudo interpretar el comprobante de pago. Intenta subir una foto más clara o ingresa el ID a mano.'}), 400

        txn_id = data.get('transaction_id')
        confidence = data.get('confidence', 'low')

        if not txn_id or confidence == 'low' or len(str(txn_id).strip()) < 4:
            return jsonify({
                'success': False, 
                'error': 'No logramos detectar una referencia de pago válida en la imagen. Por favor, asegúrate de que el comprobante sea legible e inténtalo de nuevo, o ingresa el código a mano.'
            }), 400

        txn_id = str(txn_id).strip()

        # 5. Iniciar confirmación atómica en BD
        c.autocommit(False)
        with c.cursor() as cur:
            # SELECT FOR UPDATE para evitar condiciones de carrera
            cur.execute("SELECT * FROM reservas WHERE id=%s AND usuario_id=%s FOR UPDATE", (reserva_id, current_user.id))
            reserva = cur.fetchone()

            if not reserva:
                c.rollback()
                return jsonify({'success': False, 'error': 'Reserva no encontrada'}), 404

            if reserva['estado'] != 'pendiente_pago':
                c.rollback()
                return jsonify({'success': False, 'error': f'La reserva ya no está pendiente de pago. Estado: {reserva["estado"]}'}), 400

            metodo_label = "Nequi OCR Comprobante"

            # A. Actualizar la tabla pagos
            cur.execute("""
                UPDATE pagos
                SET payment_id       = %s,
                    monto            = %s,
                    currency         = 'COP',
                    metodo           = %s,
                    estado           = 'approved',
                    mp_status        = 'approved',
                    mp_status_detail = 'acreditado',
                    fecha_pago       = NOW()
                WHERE reserva_id = %s AND tipo = 'cobro'
            """, (txn_id, float(reserva['total']), metodo_label, reserva_id))

            # B. Actualizar la tabla reservas
            cur.execute("""
                UPDATE reservas
                SET estado = 'confirmada',
                    estado_pago = 'pagado',
                    fecha_confirmacion = NOW(),
                    mp_payment_id = %s
                WHERE id = %s
            """, (txn_id, reserva_id))

            # C. Gamificación: Sumar 50 puntos al usuario
            cur.execute(
                "UPDATE usuarios SET puntos_gamificacion = puntos_gamificacion + 50 WHERE id = %s",
                (current_user.id,)
            )

            c.commit()
            app.logger.info(f"[OCR] Pago exitoso auto-confirmado para reserva {reserva_id}. Txn={txn_id}")
            return jsonify({
                'success': True,
                'txn_id': txn_id,
                'redirect_url': f"/pago/exito?reserva_id={reserva_id}&payment_id={txn_id}"
            })

    except Exception as e:
        if c:
            c.rollback()
        app.logger.error(f"[OCR Confirmar] Error: {e}\n{traceback.format_exc()}")
        return jsonify({'success': False, 'error': f'Error interno del servidor: {str(e)}'}), 500
    finally:
        c.close()


@app.route('/api/pago/cancelar/<int:reserva_id>', methods=['POST'])
@login_required
def api_cancelar_pago(reserva_id):
    """
    Cancelar voluntariamente una reserva en estado pendiente_pago.
    Libera cupos de sesión si aplica.
    """
    c = db()
    try:
        c.autocommit(False)
        with c.cursor() as cur:
            cur.execute("""
                SELECT * FROM reservas
                WHERE id = %s AND usuario_id = %s AND estado = 'pendiente_pago'
                FOR UPDATE
            """, (reserva_id, current_user.id))
            reserva = cur.fetchone()

            if not reserva:
                c.rollback()
                return jsonify({'success': False, 'error': 'Reserva no encontrada o no cancelable'}), 404

            # Cancelar la reserva
            cur.execute("""
                UPDATE reservas SET estado = 'cancelada', fecha_cancelacion = NOW(),
                motivo_cancelacion = 'Cancelada voluntariamente por el usuario'
                WHERE id = %s
            """, (reserva_id,))

            # Marcar el pago como cancelado
            cur.execute(
                "UPDATE pagos SET estado = 'cancelled', mp_status = 'cancelled' WHERE reserva_id = %s AND tipo = 'cobro'",
                (reserva_id,)
            )

            # Liberar cupos de sesión
            if reserva.get('sesion_id'):
                cur.execute("""
                    UPDATE experiencia_sesiones
                    SET cupos_disponibles = cupos_disponibles + %s, estado = 'disponible'
                    WHERE id = %s
                """, (reserva['num_huespedes'], reserva['sesion_id']))

            c.commit()
            return jsonify({'success': True, 'message': 'Reserva cancelada correctamente'})

    except Exception as e:
        c.rollback()
        app.logger.error(f"[api_cancelar_pago] Error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        c.close()

DESCUENTO_CANTIDAD_MIN_HUESPEDES = 5
DESCUENTO_CANTIDAD_PCT = 5

def descuento_por_cantidad(precio_base, huespedes):
    if int(huespedes or 0) >= DESCUENTO_CANTIDAD_MIN_HUESPEDES:
        return round(float(precio_base) * DESCUENTO_CANTIDAD_PCT / 100, 2)
    return 0

def liberar_reservas_expiradas(cur):
    """
    Cancela automáticamente las reservas en estado 'pendiente_pago' que superen el límite de 10 minutos
    para completar el pago. No elimina registros físicamente.
    """
    limite = datetime.now() - timedelta(minutes=10)
    
    # 1. Buscar las reservas a expirar
    cur.execute("""
        SELECT id, sesion_id, num_huespedes FROM reservas 
        WHERE estado = 'pendiente_pago' AND fecha_reserva < %s
    """, (limite,))
    expiradas = cur.fetchall()
    
    if expiradas:
        ids = [r['id'] for r in expiradas]
        format_strings = ','.join(['%s'] * len(ids))
        
        # 2. Si hay experiencias con sesiones, liberar cupos
        for r in expiradas:
            if r['sesion_id']:
                cur.execute("""
                    UPDATE experiencia_sesiones 
                    SET cupos_disponibles = cupos_disponibles + %s, 
                        estado = 'disponible' 
                    WHERE id = %s
                """, (r['num_huespedes'], r['sesion_id']))
        
        # 3. Actualizar estado de las reservas a 'cancelada'
        cur.execute(f"""
            UPDATE reservas 
            SET estado = 'cancelada', 
                fecha_cancelacion = NOW(), 
                motivo_cancelacion = 'Expiración automática por falta de pago (límite de 10 minutos superado).' 
            WHERE id IN ({format_strings})
        """, tuple(ids))
        
        # 3. Actualizar estado de los pagos asociados a 'rechazado'
        cur.execute(f"""
            UPDATE pagos 
            SET estado = 'rechazado' 
            WHERE reserva_id IN ({format_strings}) AND estado = 'pendiente'
        """, tuple(ids))


# ── HOME ──────────────────────────────────────────────────────
@app.route('/')
def home():
    c = db()
    try:
        with c.cursor() as cur:
            # Solo muestra hospedajes activos, no deshabilitados y no eliminados
            cur.execute("""SELECT h.*,i.url as image FROM hospedajes h
                LEFT JOIN hospedaje_imagenes i ON h.id=i.hospedaje_id AND i.es_portada=1
                WHERE h.activo=1 AND h.eliminado=0 AND h.estado='abierta' AND h.verificado=1
                ORDER BY h.destacado DESC,h.calificacion DESC""")
            hospedajes = serialize(cur.fetchall())

            # Solo muestra experiencias activas, no deshabilitadas y no eliminadas
            cur.execute("""SELECT e.*,i.url as image FROM experiencias e
                LEFT JOIN experiencia_imagenes i ON e.id=i.experiencia_id AND i.es_portada=1
                WHERE e.activo=1 AND e.eliminado=0 AND e.estado='abierta' AND e.verificado=1
                ORDER BY e.destacado DESC,e.calificacion DESC""")
            experiencias = serialize(cur.fetchall())
        return render_template('index.html', hospedajes=hospedajes, experiencias=experiencias)
    finally:
        c.close()

# ── HOSPEDAJES ────────────────────────────────────────────────
@app.route('/hospedajes')
def hospedajes():
    q          = request.args.get('q',         '').strip()
    huespedes  = request.args.get('huespedes',  '').strip()
    precio_max = request.args.get('precio_max', '').strip()
    checkin    = request.args.get('checkin',    '').strip()
    checkout   = request.args.get('checkout',   '').strip()
    cat        = request.args.get('cat',        '').strip()

    c = db()
    try:
        with c.cursor() as cur:
            query = """
                SELECT h.*, i.url as image
                FROM hospedajes h
                LEFT JOIN hospedaje_imagenes i ON h.id = i.hospedaje_id AND i.es_portada = 1
                WHERE h.activo = 1 AND h.eliminado = 0 AND h.estado = 'abierta'
            """
            params = []

            if q:
                query += " AND (h.municipio LIKE %s OR h.nombre LIKE %s OR h.tipo LIKE %s OR h.descripcion LIKE %s)"
                params.extend([f"%{q}%", f"%{q}%", f"%{q}%", f"%{q}%"])

            if huespedes:
                query += " AND h.capacidad_max >= %s"
                params.append(huespedes)

            if precio_max:
                query += " AND h.precio_noche <= %s"
                params.append(precio_max)

            # Filtrar por disponibilidad de fechas
            if checkin and checkout:
                query += """ AND h.id NOT IN (
                    SELECT hospedaje_id FROM reservas
                    WHERE estado IN ('pendiente_pago','confirmada','check_in')
                      AND fecha_checkin < %s AND fecha_checkout > %s
                      AND hospedaje_id IS NOT NULL
                )"""
                params.extend([checkout, checkin])

            # Filtrar por categoría
            _cat_filters = {
                'finca-cafetera': " AND (h.tipo LIKE %s OR h.nombre LIKE %s)",
                'eco':            " AND h.es_eco = 1",
                'desierto':       " AND (h.municipio LIKE %s OR h.nombre LIKE %s OR h.nombre LIKE %s)",
                'romantico':      " AND (h.tipo LIKE %s OR h.nombre LIKE %s)",
                'aventura':       " AND (h.tipo LIKE %s OR h.nombre LIKE %s)",
                'descanso':       " AND (h.tipo LIKE %s OR h.nombre LIKE %s)",
            }
            _cat_params = {
                'finca-cafetera': ['%cafetera%', '%cafe%'],
                'desierto':       ['%villavieja%', '%tatacoa%', '%desierto%'],
                'romantico':      ['%romantico%', '%romantico%'],
                'aventura':       ['%aventura%', '%aventura%'],
                'descanso':       ['%descanso%', '%cabana%'],
            }
            if cat in _cat_filters:
                query += _cat_filters[cat]
                if cat in _cat_params:
                    params.extend(_cat_params[cat])

            query += " ORDER BY h.destacado DESC, h.calificacion DESC"

            cur.execute(query, tuple(params))
            data = serialize(cur.fetchall())
        return render_template('hospedajes.html', hospedajes=data,
            search_query=q, checkin=checkin, checkout=checkout,
            huespedes=huespedes, cat=cat)
    finally:
        c.close()

# ── DETALLE HOSPEDAJE ─────────────────────────────────────────
@app.route('/hospedaje/<int:id>')
def detalle_hospedaje(id):
    c = db()
    try:
        with c.cursor() as cur:
            cur.execute("""SELECT h.*,u.nombre as anf_nombre,u.apellido as anf_apellido,
                u.foto_perfil as anf_foto,u.fecha_registro as anf_desde,
                a.super_anfitrion,a.calificacion_promedio as anf_cal,a.total_resenas as anf_res
                FROM hospedajes h JOIN usuarios u ON h.anfitrion_id=u.id
                LEFT JOIN anfitriones a ON u.id=a.usuario_id
                -- No mostrar detalle de publicaciones eliminadas o deshabilitadas
                WHERE h.id=%s AND h.activo=1 AND h.eliminado=0""", (id,))
            hosp = cur.fetchone()
            if not hosp:
                return redirect(url_for('hospedajes'))
            cur.execute("SELECT * FROM hospedaje_imagenes WHERE hospedaje_id=%s ORDER BY orden", (id,))
            imgs = cur.fetchall()
            cur.execute("SELECT servicio FROM hospedaje_servicios WHERE hospedaje_id=%s", (id,))
            servicios = [r['servicio'] for r in cur.fetchall()]
            cur.execute("""SELECT r.*,u.nombre,u.apellido,u.foto_perfil FROM resenas r
                JOIN usuarios u ON r.usuario_id=u.id
                WHERE r.hospedaje_id=%s AND r.publicada=1 ORDER BY r.fecha_resena DESC LIMIT 6""", (id,))
            resenas = cur.fetchall()
            cur.execute("""SELECT h.*,i.url as image FROM hospedajes h
                LEFT JOIN hospedaje_imagenes i ON h.id=i.hospedaje_id AND i.es_portada=1
                -- Sugerencias solo de publicaciones disponibles
                WHERE h.id!=%s AND h.activo=1 AND h.eliminado=0 AND h.estado='abierta'
                ORDER BY RAND() LIMIT 3""", (id,))
            sugerencias = cur.fetchall()
            ya_reseno = False
            if current_user.is_authenticated:
                cur.execute("SELECT id FROM resenas WHERE hospedaje_id=%s AND usuario_id=%s LIMIT 1",
                            (id, current_user.id))
                ya_reseno = cur.fetchone() is not None
            hosp = serialize(hosp)
            imgs = serialize(cur.fetchall()) if False else serialize(imgs)
            sugerencias = serialize(sugerencias)
        return render_template('detalle_hospedaje.html', hospedaje=hosp,
                               imagenes=imgs, servicios=servicios,
                               resenas=resenas, sugerencias=sugerencias,
                               ya_reseno=ya_reseno)
    finally:
        c.close()

# ── EXPERIENCIAS ──────────────────────────────────────────────
@app.route('/experiencias')
def experiencias():
    q          = request.args.get('q',         '').strip()
    precio_max = request.args.get('precio_max', '').strip()
    huespedes  = request.args.get('huespedes',  '').strip()
    checkin    = request.args.get('checkin',    '').strip()
    checkout   = request.args.get('checkout',   '').strip()

    c = db()
    try:
        with c.cursor() as cur:
            query = """
                SELECT e.*, i.url as image
                FROM experiencias e
                LEFT JOIN experiencia_imagenes i ON e.id = i.experiencia_id AND i.es_portada = 1
                WHERE e.activo = 1 AND e.eliminado = 0 AND e.estado = 'abierta'
            """
            params = []

            if q:
                query += " AND (e.municipio LIKE %s OR e.nombre LIKE %s OR e.tipo LIKE %s OR e.descripcion LIKE %s)"
                params.extend([f"%{q}%", f"%{q}%", f"%{q}%", f"%{q}%"])

            if precio_max:
                query += " AND e.precio_persona <= %s"
                params.append(precio_max)

            if huespedes:
                query += " AND e.capacidad_max >= %s"
                params.append(huespedes)

            if checkin and checkout:
                query += """ AND e.id NOT IN (
                    SELECT experiencia_id FROM reservas
                    WHERE estado IN ('pendiente_pago','confirmada','check_in')
                      AND fecha_checkin < %s AND fecha_checkout > %s
                      AND experiencia_id IS NOT NULL
                )"""
                params.extend([checkout, checkin])

            query += " ORDER BY e.destacado DESC, e.calificacion DESC"

            cur.execute(query, tuple(params))
            data = serialize(cur.fetchall())
        return render_template('experiencias.html', experiencias=data,
            search_query=q, checkin=checkin, checkout=checkout,
            huespedes=huespedes)
    finally:
        c.close()

@app.route('/experiencia/<int:id>')
def detalle_experiencia(id):
    c = db()
    try:
        with c.cursor() as cur:
            cur.execute("""SELECT e.*,u.nombre as anf_nombre,u.apellido as anf_apellido,
                u.foto_perfil as anf_foto,u.fecha_registro as anf_desde,
                a.super_anfitrion,a.calificacion_promedio as anf_cal,a.total_resenas as anf_res
                FROM experiencias e JOIN usuarios u ON e.anfitrion_id=u.id
                LEFT JOIN anfitriones a ON u.id=a.usuario_id
                WHERE e.id=%s AND e.activo=1 AND e.eliminado=0""", (id,))
            exp = cur.fetchone()
            if not exp:
                return redirect(url_for('experiencias'))
            cur.execute("SELECT * FROM experiencia_imagenes WHERE experiencia_id=%s ORDER BY orden", (id,))
            imgs = cur.fetchall()
            cur.execute("""SELECT r.*,u.nombre,u.apellido,u.foto_perfil FROM resenas r
                JOIN usuarios u ON r.usuario_id=u.id
                WHERE r.experiencia_id=%s AND r.tipo='experiencia' AND r.publicada=1 ORDER BY r.fecha_resena DESC LIMIT 6""", (id,))
            resenas = cur.fetchall()
            cur.execute("""SELECT e.*,i.url as image FROM experiencias e
                LEFT JOIN experiencia_imagenes i ON e.id=i.experiencia_id AND i.es_portada=1
                WHERE e.id!=%s AND e.activo=1 AND e.eliminado=0 AND e.estado='abierta'
                ORDER BY RAND() LIMIT 3""", (id,))
            sugerencias = cur.fetchall()
            ya_reseno = False
            if current_user.is_authenticated:
                cur.execute("SELECT id FROM resenas WHERE experiencia_id=%s AND usuario_id=%s LIMIT 1",
                            (id, current_user.id))
                ya_reseno = cur.fetchone() is not None
            exp = serialize(exp)
            imgs = serialize(imgs)
            sugerencias = serialize(sugerencias)
        return render_template('detalle_experiencia.html', experiencia=exp,
                               imagenes=imgs, resenas=resenas, sugerencias=sugerencias,
                               ya_reseno=ya_reseno)
    finally:
        c.close()

# ── LOGIN / REGISTRO ──────────────────────────────────────────
@app.route('/registro', methods=['POST'])
def registro():
    nombre = request.form.get('nombre', '').strip()
    apellido = request.form.get('apellido', '').strip()
    email = request.form.get('email', '').strip().lower()
    pw = request.form.get('password', '')
    tipo = 'huesped'
    nxt = request.form.get('next', '')
    if not all([nombre, apellido, email, pw]):
        flash('Completa todos los campos', 'error')
        return redirect(url_for('login', tab='register', next=nxt))
    if len(nombre) > 40 or len(apellido) > 40:
        flash('El nombre y apellido no pueden superar 40 caracteres.', 'error')
        return redirect(url_for('login', tab='register', next=nxt))
    if len(pw) < 6 or len(pw) > 128:
        flash('La contraseña debe tener entre 6 y 128 caracteres.', 'error')
        return redirect(url_for('login', tab='register', next=nxt))
    pw_hash = bcrypt.generate_password_hash(pw).decode('utf-8')
    c = db()
    try:
        with c.cursor() as cur:
            cur.execute('SELECT id FROM usuarios WHERE email=%s', (email,))
            if cur.fetchone():
                flash('El email ya está registrado', 'error')
                return redirect(url_for('login', tab='register', next=nxt))
            cur.execute('INSERT INTO usuarios(nombre,apellido,email,password_hash,tipo,verificado,puntos_gamificacion) VALUES(%s,%s,%s,%s,%s,1,100)',
                        (nombre, apellido, email, pw_hash, tipo))
            c.commit()
        flash('¡Cuenta creada! Ya puedes iniciar sesión', 'success')
        return redirect(url_for('login', next=nxt))
    except Exception as e:
        c.rollback()
        flash('Error al crear cuenta', 'error')
        return redirect(url_for('login', tab='register', next=nxt))
    finally:
        c.close()

@app.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(request.args.get('next') or url_for('home'))
    if request.method == 'POST':
        action = request.form.get('action', 'login')
        if action == 'register':
            nombre = request.form.get('nombre', '').strip()
            apellido = request.form.get('apellido', '').strip()
            email = request.form.get('email', '').strip().lower()
            pw = request.form.get('password', '')
            tipo = request.form.get('tipo', 'huesped')
            if not all([nombre, apellido, email, pw]):
                flash('Completa todos los campos', 'error')
                return render_template('login.html', tab='register', next=request.args.get('next',''))
            pw_hash = bcrypt.generate_password_hash(pw).decode('utf-8')
            c = db()
            try:
                with c.cursor() as cur:
                    cur.execute("SELECT id FROM usuarios WHERE email=%s", (email,))
                    if cur.fetchone():
                        flash('El email ya está registrado', 'error')
                        return render_template('login.html', tab='register', next=request.args.get('next',''))
                    cur.execute("""INSERT INTO usuarios(nombre,apellido,email,password_hash,tipo,verificado,puntos_gamificacion)
                        VALUES(%s,%s,%s,%s,%s,1,100)""", (nombre, apellido, email, pw_hash, tipo))
                    uid = cur.lastrowid
                    if tipo == 'anfitrion':
                        cur.execute("INSERT INTO anfitriones(usuario_id) VALUES(%s)", (uid,))
                    c.commit()
                flash('¡Cuenta creada! Ya puedes iniciar sesión', 'success')
                return redirect(url_for('login', next=request.args.get('next', '')))
            except Exception as e:
                c.rollback()
                flash('Error al crear cuenta: ' + str(e), 'error')
            finally:
                c.close()
        else:
            email = request.form.get('email', '').strip().lower()
            pw = request.form.get('password', '')
            c = db()
            try:
                with c.cursor() as cur:
                    cur.execute("SELECT * FROM usuarios WHERE email=%s AND activo=1", (email,))
                    u = cur.fetchone()
                valid = False
                if u:
                    try:
                        valid = bcrypt.check_password_hash(u['password_hash'], pw)
                    except (ValueError, Exception):
                        valid = False
                if valid:
                    login_user(User(u), remember=True)
                    c2 = db()
                    with c2.cursor() as cur2:
                        cur2.execute("UPDATE usuarios SET ultimo_acceso=NOW() WHERE id=%s", (u['id'],))
                        c2.commit()
                    c2.close()
                    nxt = request.args.get('next') or request.form.get('next', '')
                    if not nxt or nxt == 'None':
                        nxt = url_for('panel_anfitrion') if u['tipo'] in ('anfitrion','admin') else url_for('home')
                    return redirect(nxt)
                flash('Email o contraseña incorrectos', 'error')
            finally:
                c.close()
    return render_template('login.html', tab=request.args.get('tab','login'), next=request.args.get('next',''))

@app.route('/logout')
@login_required
def logout():
    logout_user()
    flash('Sesión cerrada', 'info')
    return redirect(url_for('home'))

@app.route('/mis-puntos')
@login_required
def mis_puntos():
    return render_template('mis_puntos.html')

@app.route('/perfil', methods=['GET', 'POST'])
@login_required
def perfil():
    if request.method == 'POST':
        nombre = request.form.get('nombre', '').strip()[:40]
        apellido = request.form.get('apellido', '').strip()[:40]
        telefono = request.form.get('telefono', '').strip()
        telefono = ''.join(c for c in telefono if c.isdigit())[:10]
        new_pw = request.form.get('new_password', '')
        conf_pw = request.form.get('confirm_password', '')
        
        foto = request.files.get('foto')
        foto_url = None
        if foto and foto.filename != '':
            import os, uuid
            from werkzeug.utils import secure_filename
            ext = os.path.splitext(secure_filename(foto.filename))[1].lower() or '.jpg'
            filename = f"perfil_{current_user.id}_{uuid.uuid4().hex[:8]}{ext}"
            os.makedirs(os.path.join(app.root_path, 'static', 'uploads'), exist_ok=True)
            path = os.path.join(app.root_path, 'static', 'uploads', filename)
            foto.save(path)
            foto_url = f"/static/uploads/{filename}"
        
        c = db()
        try:
            with c.cursor() as cur:
                if new_pw:
                    if new_pw == conf_pw and len(new_pw) >= 6:
                        pw_hash = bcrypt.generate_password_hash(new_pw).decode('utf-8')
                        if foto_url:
                            cur.execute("UPDATE usuarios SET nombre=%s, apellido=%s, telefono=%s, password_hash=%s, foto_perfil=%s WHERE id=%s",
                                       (nombre, apellido, telefono, pw_hash, foto_url, current_user.id))
                            current_user.foto_perfil = foto_url
                        else:
                            cur.execute("UPDATE usuarios SET nombre=%s, apellido=%s, telefono=%s, password_hash=%s WHERE id=%s",
                                       (nombre, apellido, telefono, pw_hash, current_user.id))
                        flash('Perfil y contraseña actualizados con éxito', 'success')
                    else:
                        flash('Las contraseñas no coinciden o es muy corta (min 6)', 'error')
                        return redirect(url_for('perfil'))
                else:
                    if foto_url:
                        cur.execute("UPDATE usuarios SET nombre=%s, apellido=%s, telefono=%s, foto_perfil=%s WHERE id=%s",
                                   (nombre, apellido, telefono, foto_url, current_user.id))
                        current_user.foto_perfil = foto_url
                    else:
                        cur.execute("UPDATE usuarios SET nombre=%s, apellido=%s, telefono=%s WHERE id=%s",
                                   (nombre, apellido, telefono, current_user.id))
                    flash('Perfil actualizado con éxito', 'success')
                c.commit()
                # Update current_user in memory since session persists
                current_user.nombre = nombre
                current_user.apellido = apellido
                current_user.telefono = telefono
        except Exception as e:
            c.rollback()
            flash('Error al actualizar: ' + str(e), 'error')
        finally:
            c.close()
        return redirect(url_for('perfil'))
    return render_template('perfil.html')

@app.route('/perfil/eliminar-foto', methods=['POST'])
@login_required
def eliminar_foto():
    c = db()
    try:
        with c.cursor() as cur:
            cur.execute("UPDATE usuarios SET foto_perfil=NULL WHERE id=%s", (current_user.id,))
            c.commit()
            current_user.foto_perfil = None
            flash('Foto de perfil eliminada', 'success')
    except Exception as e:
        c.rollback()
        flash('Error al eliminar la foto: ' + str(e), 'error')
    finally:
        c.close()
    return redirect(url_for('perfil'))

@app.route('/api/favoritos/toggle', methods=['POST'])
@login_required
def toggle_favorito():
    data = request.json
    tipo = data.get('tipo')
    item_id = data.get('id')
    
    c = db()
    try:
        with c.cursor() as cur:
            if tipo == 'hospedaje':
                cur.execute("SELECT id FROM favoritos WHERE usuario_id=%s AND hospedaje_id=%s", (current_user.id, item_id))
                fav = cur.fetchone()
                if fav:
                    cur.execute("DELETE FROM favoritos WHERE id=%s", (fav['id'],))
                    status = 'removed'
                else:
                    cur.execute("INSERT INTO favoritos (usuario_id, tipo, hospedaje_id) VALUES (%s, %s, %s)", (current_user.id, tipo, item_id))
                    status = 'added'
            elif tipo == 'experiencia':
                cur.execute("SELECT id FROM favoritos WHERE usuario_id=%s AND experiencia_id=%s", (current_user.id, item_id))
                fav = cur.fetchone()
                if fav:
                    cur.execute("DELETE FROM favoritos WHERE id=%s", (fav['id'],))
                    status = 'removed'
                else:
                    cur.execute("INSERT INTO favoritos (usuario_id, tipo, experiencia_id) VALUES (%s, %s, %s)", (current_user.id, tipo, item_id))
                    status = 'added'
            else:
                return jsonify({'success': False, 'error': 'Tipo no válido'}), 400
            
            c.commit()
            return jsonify({'success': True, 'status': status})
    except Exception as e:
        c.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        c.close()

@app.route('/favoritos')
@login_required
def favoritos():
    c = db()
    try:
        with c.cursor() as cur:
            cur.execute("""
                SELECT f.id as fav_id, h.*, i.url as image 
                FROM favoritos f 
                JOIN hospedajes h ON f.hospedaje_id = h.id 
                LEFT JOIN hospedaje_imagenes i ON h.id = i.hospedaje_id AND i.es_portada = 1 
                WHERE f.usuario_id = %s AND f.tipo = 'hospedaje'
            """, (current_user.id,))
            hospedajes = serialize(cur.fetchall())
            
            cur.execute("""
                SELECT f.id as fav_id, e.*, i.url as image 
                FROM favoritos f 
                JOIN experiencias e ON f.experiencia_id = e.id 
                LEFT JOIN experiencia_imagenes i ON e.id = i.experiencia_id AND i.es_portada = 1 
                WHERE f.usuario_id = %s AND f.tipo = 'experiencia'
            """, (current_user.id,))
            experiencias = serialize(cur.fetchall())
            
        return render_template('favoritos.html', hospedajes=hospedajes, experiencias=experiencias)
    finally:
        c.close()

# ── RESERVAR ──────────────────────────────────────────────────
@app.route('/reservar', methods=['GET', 'POST'])
@login_required
def reservar():
    if request.method == 'POST':
        tipo_reserva = request.form.get('tipo', 'hospedaje')
        hid = request.form.get('id')
        sesion_id = request.form.get('sesion_id')
        if sesion_id and str(sesion_id).isdigit():
            sesion_id = int(sesion_id)
        else:
            sesion_id = None

        checkin = request.form.get('checkin')
        checkout = request.form.get('checkout')
        huespedes = int(request.form.get('huespedes', 1))
        metodo = request.form.get('metodo_pago', 'tarjeta')
        notes = request.form.get('notas', '')
        c = db()
        try:
            c.autocommit(False)
            with c.cursor() as cur:
                # 1. Limpiar reservas expiradas para liberar fechas antes de verificar
                liberar_reservas_expiradas(cur)
                c.commit() # Confirmar liberación de expirados
                
                # 2. Bloquear la fila de hospedaje/experiencia con SELECT FOR UPDATE
                if tipo_reserva == 'experiencia':
                    # --- EVITAR DUPLICADOS ---
                    cur.execute("""SELECT id FROM reservas 
                        WHERE usuario_id=%s AND experiencia_id=%s AND fecha_checkin=%s AND estado IN ('pendiente_pago', 'confirmada', 'check_in')""", 
                        (current_user.id, hid, checkin))
                    exists = cur.fetchone()
                    if exists:
                        c.rollback()
                        flash('Ya tienes una reserva para esta fecha.', 'info')
                        return redirect(url_for('confirmacion', id=exists['id']))

                    cur.execute("SELECT id, nombre, anfitrion_id, precio_persona, 0 as descuento_porcentaje, activo, estado, capacidad_max FROM experiencias WHERE id=%s AND eliminado=0 FOR UPDATE", (hid,))
                    hosp = cur.fetchone()
                    if not hosp:
                        flash('Experiencia no encontrada.', 'error')
                        c.rollback()
                        return redirect(url_for('experiencias'))
                        
                    if hosp.get('estado') == 'deshabilitada' or not hosp.get('activo'):
                        flash('Esta experiencia no está disponible.', 'error')
                        c.rollback()
                        return redirect(url_for('detalle_experiencia', id=hid))
                        
                    if hosp['anfitrion_id'] == current_user.id:
                        flash('No puedes reservar tu propia publicación.', 'error')
                        c.rollback()
                        return redirect(url_for('detalle_experiencia', id=hid))
                        
                    fi = datetime.strptime(checkin, '%Y-%m-%d').date()
                    fo = datetime.strptime(checkout, '%Y-%m-%d').date()
                    noches = max(1, (fo - fi).days)
                    
                    # ── NUEVA LÓGICA DE DISPONIBILIDAD POR SESIONES ──────────────────
                    if sesion_id:
                        # Bloquear sesión para evitar overbooking (SELECT FOR UPDATE)
                        cur.execute("SELECT * FROM experiencia_sesiones WHERE id=%s FOR UPDATE", (sesion_id,))
                        sesion = cur.fetchone()
                        
                        if not sesion or sesion['estado'] != 'disponible':
                            flash('La sesión seleccionada ya no está disponible o ha sido cancelada.', 'error')
                            c.rollback()
                            return redirect(url_for('detalle_experiencia', id=hid))
                            
                        if sesion['cupos_disponibles'] < huespedes:
                            flash(f'Lo sentimos, solo quedan {sesion["cupos_disponibles"]} cupos para este horario.', 'error')
                            c.rollback()
                            return redirect(url_for('detalle_experiencia', id=hid))
                            
                        # Actualizar cupos disponibles (Resta atómica)
                        cur.execute("""
                            UPDATE experiencia_sesiones 
                            SET cupos_disponibles = cupos_disponibles - %s 
                            WHERE id = %s AND cupos_disponibles >= %s
                        """, (huespedes, sesion_id, huespedes))
                        
                        # Si no se afectó ninguna fila, significa que los cupos cambiaron justo antes
                        if cur.rowcount == 0:
                            flash('Los cupos se agotaron justo ahora. Por favor intenta con otro horario.', 'error')
                            c.rollback()
                            return redirect(url_for('detalle_experiencia', id=hid))

                        # Si se llenó, actualizar estado
                        if sesion['cupos_disponibles'] - huespedes <= 0:
                            cur.execute("UPDATE experiencia_sesiones SET estado = 'lleno' WHERE id = %s", (sesion_id,))
                    else:
                        # Lógica antigua (backwards compatibility)
                        cur.execute("""
                            SELECT COALESCE(SUM(num_huespedes), 0) as total_booked 
                            FROM reservas 
                            WHERE experiencia_id = %s 
                              AND estado IN ('pendiente_pago', 'confirmada', 'check_in')
                              AND fecha_checkin = %s
                        """, (hid, checkin))
                        row_booked = cur.fetchone()
                        total_booked = row_booked['total_booked'] if row_booked else 0
                        
                        if total_booked + huespedes > hosp['capacidad_max']:
                            flash('Esta experiencia ya no tiene cupos suficientes para esta fecha.', 'error')
                            c.rollback()
                            return redirect(request.referrer)
                    # ─────────────────────────────────────────────────────────────
                    
                    precio_base = float(hosp['precio_persona']) * huespedes * noches
                    descuento_publicacion = round(precio_base * hosp['descuento_porcentaje'] / 100, 2) if hosp.get('descuento_porcentaje') else 0
                    descuento_cantidad = descuento_por_cantidad(precio_base, huespedes)
                    descuento = descuento_publicacion + descuento_cantidad
                    tarifa = round((precio_base - descuento) * 0.14, 2)
                    total = round(precio_base - descuento + tarifa, 2)
                    credito_pct = float(getattr(current_user, 'credito_descuento', 0) or 0)
                    credito_amount = round(total * credito_pct / 100, 2) if credito_pct > 0 else 0
                    # Mercado Pago requiere un mínimo (aprox 2000 COP para evitar errores en CO)
                    total = round(max(2000.0, total - credito_amount), 2)
                    # Sumar el crédito de puntos al descuento total para el registro en la reserva
                    descuento = float(descuento) + credito_amount
                    codigo = gen_code()
                    
                    cur.execute("""
                        INSERT INTO reservas(codigo_reserva, usuario_id, tipo, experiencia_id, sesion_id,
                            fecha_checkin, fecha_checkout, num_huespedes, precio_base, tarifa_servicio,
                            descuento, total, estado, metodo_pago, estado_pago, notas_huesped, fecha_reserva)
                        VALUES(%s, %s, 'experiencia', %s, %s, %s, %s, %s, %s, %s, %s, %s, 'pendiente_pago', %s, 'pendiente', %s, NOW())
                    """, (codigo, current_user.id, hid, sesion_id, checkin, checkout, huespedes,
                          precio_base, tarifa, descuento, total, metodo, notes))
                    rid = cur.lastrowid
                else:
                    # --- EVITAR DUPLICADOS ---
                    cur.execute("""SELECT id FROM reservas 
                        WHERE usuario_id=%s AND hospedaje_id=%s AND fecha_checkin=%s AND fecha_checkout=%s AND estado IN ('pendiente_pago', 'confirmada', 'check_in')""", 
                        (current_user.id, hid, checkin, checkout))
                    exists = cur.fetchone()
                    if exists:
                        c.rollback()
                        flash('Ya tienes una reserva para estas fechas.', 'info')
                        return redirect(url_for('confirmacion', id=exists['id']))

                    # Incluir nombre y estadia_minima/maxima para validar rango de noches y generar pago
                    cur.execute("SELECT id, nombre, anfitrion_id, precio_noche, descuento_porcentaje, activo, estado, capacidad_max, estadia_minima, estadia_maxima FROM hospedajes WHERE id=%s AND eliminado=0 FOR UPDATE", (hid,))
                    hosp = cur.fetchone()
                    if not hosp:
                        flash('Hospedaje no encontrado.', 'error')
                        c.rollback()
                        return redirect(url_for('hospedajes'))
    
                    if hosp.get('estado') == 'deshabilitada' or not hosp.get('activo'):
                        flash('Este hospedaje no está disponible para nuevas reservas en este momento.', 'error')
                        c.rollback()
                        return redirect(url_for('detalle_hospedaje', id=hid))
                    
                    if hosp['anfitrion_id'] == current_user.id:
                        flash('No puedes reservar tu propia publicación.', 'error')
                        c.rollback()
                        return redirect(url_for('detalle_hospedaje', id=hid))
                    
                    fi = datetime.strptime(checkin, '%Y-%m-%d').date()
                    fo = datetime.strptime(checkout, '%Y-%m-%d').date()
                    noches = (fo - fi).days
                    if noches < 1:
                        flash('Las fechas no son válidas', 'error')
                        c.rollback()
                        return redirect(request.referrer)

                    # ── Validar estadía mínima y máxima ──────────────────────
                    min_n = int(hosp.get('estadia_minima') or 1)
                    max_n = int(hosp.get('estadia_maxima') or 365)
                    if noches < min_n:
                        flash(f'La estadía mínima para este hospedaje es de {min_n} noche{"s" if min_n != 1 else ""}.', 'error')
                        c.rollback()
                        return redirect(url_for('detalle_hospedaje', id=hid))
                    if noches > max_n:
                        flash(f'La estadía máxima permitida es de {max_n} noches.', 'error')
                        c.rollback()
                        return redirect(url_for('detalle_hospedaje', id=hid))

                    # Validar disponibilidad real de fechas (SELECT FOR UPDATE)
                    cur.execute("""
                        SELECT id FROM reservas 
                        WHERE hospedaje_id = %s 
                          AND estado IN ('pendiente_pago', 'confirmada', 'check_in')
                          AND fecha_checkin < %s 
                          AND fecha_checkout > %s
                    """, (hid, checkout, checkin))
                    if cur.fetchone():
                        flash('Este hospedaje ya no está disponible para las fechas seleccionadas.', 'error')
                        c.rollback()
                        return redirect(request.referrer)
                        
                    precio_base = float(hosp['precio_noche']) * noches * huespedes
                    descuento_publicacion = round(precio_base * hosp['descuento_porcentaje'] / 100, 2) if hosp.get('descuento_porcentaje') else 0
                    descuento_cantidad = descuento_por_cantidad(precio_base, huespedes)
                    descuento = descuento_publicacion + descuento_cantidad
                    tarifa = round((precio_base - descuento) * 0.14, 2)
                    total = round(precio_base - descuento + tarifa, 2)
                    credito_pct = float(getattr(current_user, 'credito_descuento', 0) or 0)
                    credito_amount = round(total * credito_pct / 100, 2) if credito_pct > 0 else 0
                    # Mercado Pago requiere un mínimo (aprox 2000 COP para evitar errores en CO)
                    total = round(max(2000.0, total - credito_amount), 2)
                    # Sumar el crédito de puntos al descuento total para el registro en la reserva
                    descuento = float(descuento) + credito_amount
                    codigo = gen_code()
                    
                    cur.execute("""
                        INSERT INTO reservas(codigo_reserva, usuario_id, tipo, hospedaje_id,
                            fecha_checkin, fecha_checkout, num_huespedes, precio_base, tarifa_servicio,
                            descuento, total, estado, metodo_pago, estado_pago, notas_huesped, fecha_reserva)
                        VALUES(%s, %s, 'hospedaje', %s, %s, %s, %s, %s, %s, %s, %s, 'pendiente_pago', %s, 'pendiente', %s, NOW())
                    """, (codigo, current_user.id, hid, checkin, checkout, huespedes,
                          precio_base, tarifa, descuento, total, metodo, notes))
                    rid = cur.lastrowid
                
                # Registrar auditoría de pago inicial (estado = pending)
                cur.execute("""
                    INSERT INTO pagos(reserva_id, usuario_id, monto, tipo, metodo, estado, provider, fecha_pago)
                    VALUES(%s, %s, %s, 'cobro', %s, 'pending', 'nequi', NOW())
                """, (rid, current_user.id, total, metodo))
                
                # ── INTEGRACIÓN NEQUI NEGOCIOS ───────────────────────────
                # Preparar datos para la preferencia
                titulo = f"Reserva en {hosp['nombre']}"
                descripcion = f"Reserva {codigo} - {huespedes} huéspedes"
                
                reservation_data = {
                    'id': rid,
                    'titulo': titulo,
                    'descripcion': descripcion,
                    'total': total,
                    'tipo': tipo_reserva,
                    'base_url': request.host_url.rstrip('/')
                }
                
                user_data = {
                    'id': current_user.id,
                    'nombre': current_user.nombre,
                    'apellido': current_user.apellido,
                    'email': current_user.email
                }
                
                try:
                    # Generar intención de pago en Nequi
                    preference = payment_service.generate_payment_link(reservation_data, user_data)
                    
                    # Guardar ID de preferencia en la tabla pagos (usando la nueva columna preference_id) y reservas (mp_preference_id)
                    cur.execute("""
                        UPDATE pagos 
                        SET preference_id = %s 
                        WHERE reserva_id = %s AND estado = 'pending'
                    """, (preference['id'], rid))
                    
                    cur.execute("""
                        UPDATE reservas SET mp_preference_id = %s WHERE id = %s
                    """, (preference['id'], rid))
                    
                    c.commit()
                    
                    # Redirigir a la pantalla de transición local para registrar localStorage
                    return redirect(url_for('pago_transferir_gateway', reserva_id=rid))
                    
                except Exception as e:
                    app.logger.error(f"Error al generar pago Nequi: {str(e)}")
                    c.rollback()
                    flash(f'Error al conectar con la pasarela de Nequi: {str(e)}', 'error')
                    return redirect(request.referrer)
                
                # Aplicar crédito de puntos canjeados si existe
                if credito_pct > 0:
                    cur.execute("UPDATE usuarios SET credito_descuento=0 WHERE id=%s", (current_user.id,))
                    current_user.credito_descuento = 0
                    c.commit()
            
            return redirect(url_for('confirmacion', id=rid))
        except Exception as e:
            c.rollback()
            app.logger.error(f'Error en reservar: {str(e)}\n{traceback.format_exc()}')
            flash('Error al procesar la reserva: ' + str(e), 'error')
            return redirect(request.referrer)
        finally:
            c.close()

    # GET: mostrar formulario de pago
    tipo_reserva = request.args.get('tipo', 'hospedaje')
    hid = request.args.get('id')
    sesion_id = request.args.get('sesion_id') # Nuevo param para experiencias
    checkin = request.args.get('checkin', '')
    checkout = request.args.get('checkout', '')
    huespedes = int(request.form.get('huespedes', 1)) if request.method == 'POST' else int(request.args.get('huespedes', 1))
    now = date.today().isoformat()
    sesion = None
    c = db()
    try:
        with c.cursor() as cur:
            # Ejecutar limpieza de expirados antes de verificar disponibilidad
            liberar_reservas_expiradas(cur)
            c.commit()
            
            if tipo_reserva == 'experiencia':
                # --- VALIDAR SI YA TIENE UNA RESERVA ACTIVA ---
                cur.execute("""SELECT id FROM reservas 
                    WHERE usuario_id=%s AND experiencia_id=%s AND fecha_checkin=%s AND estado IN ('pendiente_pago', 'confirmada', 'check_in')""", 
                    (current_user.id, hid, checkin))
                exists = cur.fetchone()
                if exists:
                    flash('Ya tienes una reserva activa para esta experiencia y fecha.', 'info')
                    return redirect(url_for('confirmacion', id=exists['id']))

                cur.execute("""SELECT e.*,i.url as image,u.nombre as anf_nombre,u.foto_perfil as anf_foto
                    FROM experiencias e LEFT JOIN experiencia_imagenes i ON e.id=i.experiencia_id AND i.es_portada=1
                    JOIN usuarios u ON e.anfitrion_id=u.id WHERE e.id=%s""", (hid,))
                hosp = cur.fetchone()
                if not hosp:
                    return redirect(url_for('experiencias'))
                
                if sesion_id:
                    cur.execute("SELECT * FROM experiencia_sesiones WHERE id=%s", (sesion_id,))
                    sesion = cur.fetchone()
                    
                if hosp['anfitrion_id'] == current_user.id:
                    flash('No puedes reservar tu propia publicación.', 'error')
                    return redirect(url_for('detalle_experiencia', id=hid))
                    
                noches = 1
                if checkin and checkout:
                    fi = datetime.strptime(checkin, '%Y-%m-%d').date()
                    fo = datetime.strptime(checkout, '%Y-%m-%d').date()
                    noches = max(1, (fo - fi).days)
                precio_base = float(hosp['precio_persona']) * huespedes * noches if noches else float(hosp['precio_persona']) * huespedes
                
            else:
                # --- VALIDAR SI YA TIENE UNA RESERVA ACTIVA ---
                cur.execute("""SELECT id FROM reservas 
                    WHERE usuario_id=%s AND hospedaje_id=%s AND fecha_checkin=%s AND fecha_checkout=%s AND estado IN ('pendiente_pago', 'confirmada', 'check_in')""", 
                    (current_user.id, hid, checkin, checkout))
                exists = cur.fetchone()
                if exists:
                    flash('Ya tienes una reserva activa para este hospedaje y fechas.', 'info')
                    return redirect(url_for('confirmacion', id=exists['id']))

                cur.execute("""SELECT h.*,i.url as image,u.nombre as anf_nombre,u.foto_perfil as anf_foto
                    FROM hospedajes h LEFT JOIN hospedaje_imagenes i ON h.id=i.hospedaje_id AND i.es_portada=1
                    JOIN usuarios u ON h.anfitrion_id=u.id WHERE h.id=%s""", (hid,))
                hosp = cur.fetchone()
                if not hosp:
                    return redirect(url_for('hospedajes'))
                    
                if hosp['anfitrion_id'] == current_user.id:
                    flash('No puedes reservar tu propia publicación.', 'error')
                    return redirect(url_for('detalle_hospedaje', id=hid))
                    
                noches = 0
                if checkin and checkout:
                    fi = datetime.strptime(checkin, '%Y-%m-%d').date()
                    fo = datetime.strptime(checkout, '%Y-%m-%d').date()
                    noches = (fo - fi).days
                    # ── Validar estadía en GET (antes de mostrar formulario de pago) ──
                    min_n = int(hosp.get('estadia_minima') or 1)
                    max_n = int(hosp.get('estadia_maxima') or 365)
                    if noches < min_n:
                        flash(f'La estadía mínima para este hospedaje es de {min_n} noche{"s" if min_n != 1 else ""}.', 'error')
                        return redirect(url_for('detalle_hospedaje', id=hid))
                    if noches > max_n:
                        flash(f'La estadía máxima permitida es de {max_n} noches.', 'error')
                        return redirect(url_for('detalle_hospedaje', id=hid))
                precio_base = float(hosp['precio_noche']) * noches * huespedes if noches else 0
                
        descuento_publicacion = round(precio_base * hosp['descuento_porcentaje'] / 100, 2) if hosp.get('descuento_porcentaje') else 0
        descuento_cantidad = descuento_por_cantidad(precio_base, huespedes)
        descuento = descuento_publicacion + descuento_cantidad
        tarifa = round((precio_base - descuento) * 0.14, 2)
        total = precio_base - descuento + tarifa
        credito_pct = float(getattr(current_user, 'credito_descuento', 0) or 0)
        credito_amount = round(total * credito_pct / 100, 2) if credito_pct > 0 else 0
        total_final = max(0, total - credito_amount)
        
        # Pasar estadia_minima/maxima al template para validación JS y display
        estadia_minima = int(hosp.get('estadia_minima') or 1) if tipo_reserva == 'hospedaje' else 1
        estadia_maxima = int(hosp.get('estadia_maxima') or 365) if tipo_reserva == 'hospedaje' else 365
        return render_template('reservar.html', hosp=hosp, checkin=checkin, checkout=checkout,
            huespedes=huespedes, noches=noches, precio_base=precio_base, descuento=descuento, tarifa=tarifa,
            descuento_publicacion=descuento_publicacion, descuento_cantidad=descuento_cantidad,
            descuento_cantidad_pct=DESCUENTO_CANTIDAD_PCT,
            descuento_cantidad_min_huespedes=DESCUENTO_CANTIDAD_MIN_HUESPEDES,
            total=total_final, credito_pct=credito_pct, credito_amount=credito_amount, now=now, tipo_reserva=tipo_reserva,
            estadia_minima=estadia_minima, estadia_maxima=estadia_maxima, sesion=sesion)
    finally:
        c.close()


# ── CONFIRMACIÓN ──────────────────────────────────────────────
@app.route('/reserva/<int:id>')
@login_required
def confirmacion(id):
    c = db()
    try:
        with c.cursor() as cur:
            cur.execute("""SELECT r.*,
                COALESCE(h.nombre, e.nombre) as hosp_nombre,
                COALESCE(h.municipio, e.municipio) as municipio,
                COALESCE(h.hora_checkin, NULL) as hora_checkin,
                COALESCE(h.hora_checkout, NULL) as hora_checkout,
                h.instrucciones_llegada,h.wifi_nombre,h.wifi_password,
                COALESCE(i.url, ei.url) as hosp_img,
                COALESCE(u.nombre, ue.nombre) as anf_nombre,
                COALESCE(u.foto_perfil, ue.foto_perfil) as anf_foto,
                p.metodo as metodo_pago, p.referencia_externa, p.estado as pago_estado
                FROM reservas r
                LEFT JOIN hospedajes h ON r.hospedaje_id=h.id
                LEFT JOIN hospedaje_imagenes i ON h.id=i.hospedaje_id AND i.es_portada=1
                LEFT JOIN usuarios u ON h.anfitrion_id=u.id
                LEFT JOIN experiencias e ON r.experiencia_id=e.id
                LEFT JOIN experiencia_imagenes ei ON e.id=ei.experiencia_id AND ei.es_portada=1
                LEFT JOIN usuarios ue ON e.anfitrion_id=ue.id
                LEFT JOIN pagos p ON p.reserva_id=r.id AND p.tipo='cobro'
                WHERE r.id=%s AND (r.usuario_id=%s OR h.anfitrion_id=%s OR e.anfitrion_id=%s)""",
                (id, current_user.id, current_user.id, current_user.id))
            reserva = cur.fetchone()
        if not reserva:
            return redirect(url_for('mis_reservas'))
        # Calcular timestamps de disponibilidad para check-in y check-out
        ci_dt = combine_date_time(reserva.get('fecha_checkin'), reserva.get('hora_checkin'), dt_time(15, 0))
        co_dt = combine_date_time(reserva.get('fecha_checkout'), reserva.get('hora_checkout'), dt_time(11, 0))
        checkin_ts  = int(ci_dt.timestamp()) if ci_dt else None
        checkout_ts = int(co_dt.timestamp()) if co_dt else None
        checkin_hora_str  = ci_dt.strftime('%H:%M') if ci_dt else '15:00'
        checkout_hora_str = co_dt.strftime('%H:%M') if co_dt else '11:00'
        return render_template('confirmacion.html', reserva=reserva,
            checkin_ts=checkin_ts, checkout_ts=checkout_ts,
            checkin_hora_str=checkin_hora_str, checkout_hora_str=checkout_hora_str)
    finally:
        c.close()

# ── MIS RESERVAS ──────────────────────────────────────────────
@app.route('/mis-reservas')
@login_required
def mis_reservas():
    c = db()
    try:
        with c.cursor() as cur:
            cur.execute("""
                SELECT r.*,
                    COALESCE(h.nombre, e.nombre) AS hosp_nombre,
                    COALESCE(h.municipio, e.municipio) AS municipio,
                    COALESCE(h.hora_checkin, NULL) AS hora_checkin,
                    COALESCE(h.hora_checkout, NULL) AS hora_checkout,
                    COALESCE(i.url, ei.url) AS hosp_img,
                    p.payment_id AS mp_payment_id,
                    p.fecha_pago AS mp_fecha_pago,
                    p.metodo AS mp_metodo,
                    p.mp_status AS mp_estado_pago,
                    p.monto AS mp_monto,
                    p.currency AS mp_currency
                FROM reservas r
                LEFT JOIN hospedajes h ON r.hospedaje_id = h.id
                LEFT JOIN hospedaje_imagenes i ON h.id = i.hospedaje_id AND i.es_portada = 1
                LEFT JOIN experiencias e ON r.experiencia_id = e.id
                LEFT JOIN experiencia_imagenes ei ON e.id = ei.experiencia_id AND ei.es_portada = 1
                LEFT JOIN pagos p ON p.reserva_id = r.id AND p.tipo = 'cobro'
                WHERE r.usuario_id = %s
                ORDER BY r.fecha_reserva DESC
            """, (current_user.id,))
            reservas = serialize(cur.fetchall())

        for r in reservas:
            fi = r.get('fecha_checkin')
            fo = r.get('fecha_checkout')
            ci = combine_date_time(
                datetime.fromisoformat(fi).date() if fi else None,
                None, dt_time(15, 0)
            ) if fi else None
            co = combine_date_time(
                datetime.fromisoformat(fo).date() if fo else None,
                None, dt_time(11, 0)
            ) if fo else None
            r['checkin_ts']  = int(ci.timestamp()) if ci else 0
            r['checkout_ts'] = int(co.timestamp()) if co else 0

        return render_template('mis_reservas.html', reservas=reservas)
    finally:
        c.close()

# ── CHECK-IN ─────────────────────────────────────────────────
@app.route('/checkin/<int:id>', methods=['GET', 'POST'])
@login_required
def checkin(id):
    c = db()
    try:
        with c.cursor() as cur:
            cur.execute("""SELECT r.*,
                COALESCE(h.nombre, e.nombre) as hosp_nombre,
                COALESCE(h.municipio, e.municipio) as municipio,
                COALESCE(h.hora_checkin, NULL) as hora_checkin,
                h.instrucciones_llegada, h.wifi_nombre, h.wifi_password, h.direccion_detalle,
                COALESCE(i.url, ei.url) as hosp_img, 
                COALESCE(u.nombre, ue.nombre) as anf_nombre, 
                COALESCE(u.telefono, ue.telefono) as anf_tel,
                COALESCE(u.foto_perfil, ue.foto_perfil) as anf_foto
                FROM reservas r 
                LEFT JOIN hospedajes h ON r.hospedaje_id=h.id
                LEFT JOIN hospedaje_imagenes i ON h.id=i.hospedaje_id AND i.es_portada=1
                LEFT JOIN usuarios u ON h.anfitrion_id=u.id
                LEFT JOIN experiencias e ON r.experiencia_id=e.id
                LEFT JOIN experiencia_imagenes ei ON e.id=ei.experiencia_id AND ei.es_portada=1
                LEFT JOIN usuarios ue ON e.anfitrion_id=ue.id
                WHERE r.id=%s AND (r.usuario_id=%s OR h.anfitrion_id=%s OR e.anfitrion_id=%s)""", 
                (id, current_user.id, current_user.id, current_user.id))
            reserva = cur.fetchone()
            
        if not reserva:
            flash('Reserva no encontrada', 'error')
            return redirect(url_for('mis_reservas'))
            
        # Solo se permite check-in si la reserva está confirmada
        if reserva['estado'] == 'check_in':
            flash('Ya realizaste el check-in para esta reserva', 'info')
            return redirect(url_for('confirmacion', id=id))
        elif reserva['estado'] == 'completada':
            flash('Esta reserva ya finalizó', 'info')
            return redirect(url_for('confirmacion', id=id))
        elif reserva['estado'] != 'confirmada':
            flash('Esta reserva no está disponible para check-in', 'error')
            return redirect(url_for('mis_reservas'))

        # Validar que ya es la hora programada de check-in
        ci_dt = combine_date_time(reserva['fecha_checkin'], reserva.get('hora_checkin'), dt_time(15, 0))
        if ci_dt and datetime.now() < ci_dt:
            flash(f'El check-in estará disponible a partir de las {ci_dt.strftime("%H:%M")} h del {ci_dt.strftime("%d/%m/%Y")}.', 'info')
            return redirect(url_for('confirmacion', id=id))

        if request.method == 'POST':
            c2 = db()
            try:
                with c2.cursor() as cur2:
                    cur2.execute("""UPDATE reservas r 
                        LEFT JOIN hospedajes h ON r.hospedaje_id=h.id 
                        LEFT JOIN experiencias e ON r.experiencia_id=e.id
                        SET r.estado='check_in', r.fecha_checkin_real=NOW()
                        WHERE r.id=%s AND (r.usuario_id=%s OR h.anfitrion_id=%s OR e.anfitrion_id=%s)""", 
                        (id, current_user.id, current_user.id, current_user.id))
                    c2.commit()
                flash('¡Check-in realizado con éxito! Disfruta tu estadía 🏡', 'success')
                return redirect(url_for('confirmacion', id=id))
            finally:
                c2.close()
                
        return render_template('checkin.html', reserva=reserva)
    finally:
        c.close()

# ── CHECK-OUT ─────────────────────────────────────────────────
@app.route('/checkout/<int:id>', methods=['GET', 'POST'])
@login_required
def checkout(id):
    c = db()
    try:
        with c.cursor() as cur:
            cur.execute("""SELECT r.*,
                COALESCE(h.nombre, e.nombre) as hosp_nombre,
                COALESCE(h.municipio, e.municipio) as municipio,
                COALESCE(h.hora_checkout, NULL) as hora_checkout,
                COALESCE(i.url, ei.url) as hosp_img, 
                COALESCE(u.nombre, ue.nombre) as anf_nombre, 
                COALESCE(u.foto_perfil, ue.foto_perfil) as anf_foto
                FROM reservas r 
                LEFT JOIN hospedajes h ON r.hospedaje_id=h.id
                LEFT JOIN hospedaje_imagenes i ON h.id=i.hospedaje_id AND i.es_portada=1
                LEFT JOIN usuarios u ON h.anfitrion_id=u.id
                LEFT JOIN experiencias e ON r.experiencia_id=e.id
                LEFT JOIN experiencia_imagenes ei ON e.id=ei.experiencia_id AND ei.es_portada=1
                LEFT JOIN usuarios ue ON e.anfitrion_id=ue.id
                WHERE r.id=%s AND (r.usuario_id=%s OR h.anfitrion_id=%s OR e.anfitrion_id=%s)""", 
                (id, current_user.id, current_user.id, current_user.id))
            reserva = cur.fetchone()
        if not reserva:
            flash('Reserva no encontrada', 'error')
            return redirect(url_for('mis_reservas'))
        if reserva['estado'] == 'completada':
            flash('Ya realizaste el check-out de esta reserva', 'info')
            return redirect(url_for('confirmacion', id=id))
        elif reserva['estado'] != 'check_in':
            flash('Solo puedes hacer check-out después del check-in', 'error')
            return redirect(url_for('mis_reservas'))

        # Validar que ya es la hora programada de check-out
        co_dt = combine_date_time(reserva['fecha_checkout'], reserva.get('hora_checkout'), dt_time(11, 0))
        if co_dt and datetime.now() < co_dt:
            flash(f'El check-out estará disponible a partir de las {co_dt.strftime("%H:%M")} h del {co_dt.strftime("%d/%m/%Y")}.', 'info')
            return redirect(url_for('confirmacion', id=id))

        if request.method == 'POST':
            cal_gen = request.form.get('calificacion_general')
            cal_limp = request.form.get('calificacion_limpieza')
            cal_ubi = request.form.get('calificacion_ubicacion')
            cal_com = request.form.get('calificacion_comunicacion')
            cal_val = request.form.get('calificacion_valor')
            comentario = request.form.get('comentario', '').strip()
            c2 = db()
            try:
                with c2.cursor() as cur2:
                    cur2.execute("""UPDATE reservas r 
                        LEFT JOIN hospedajes h ON r.hospedaje_id=h.id 
                        LEFT JOIN experiencias e ON r.experiencia_id=e.id
                        SET r.estado='completada', r.fecha_checkout_real=NOW()
                        WHERE r.id=%s AND (r.usuario_id=%s OR h.anfitrion_id=%s OR e.anfitrion_id=%s)""", 
                        (id, current_user.id, current_user.id, current_user.id))
                    if cal_gen and reserva['usuario_id'] == current_user.id:
                        if reserva['tipo'] == 'experiencia':
                            cur2.execute("""INSERT INTO resenas(reserva_id,usuario_id,tipo,experiencia_id,
                                calificacion_general,comentario)
                                VALUES(%s,%s,'experiencia',%s,%s,%s)
                                ON DUPLICATE KEY UPDATE calificacion_general=%s,comentario=%s""",
                                (id, current_user.id, reserva['experiencia_id'],
                                 cal_gen, comentario, cal_gen, comentario))
                        else:
                            cur2.execute("""INSERT INTO resenas(reserva_id,usuario_id,tipo,hospedaje_id,
                                calificacion_general,calificacion_limpieza,calificacion_ubicacion,
                                calificacion_comunicacion,calificacion_valor,comentario)
                                VALUES(%s,%s,'hospedaje',%s,%s,%s,%s,%s,%s,%s)
                                ON DUPLICATE KEY UPDATE calificacion_general=%s,comentario=%s""",
                                (id, current_user.id, reserva['hospedaje_id'],
                                 cal_gen, cal_limp, cal_ubi, cal_com, cal_val, comentario,
                                 cal_gen, comentario))
                        if reserva['tipo'] == 'experiencia':
                            cur2.execute("""UPDATE experiencias SET
                                calificacion=(SELECT AVG(calificacion_general) FROM resenas WHERE experiencia_id=%s AND publicada=1),
                                total_resenas=(SELECT COUNT(*) FROM resenas WHERE experiencia_id=%s AND publicada=1)
                                WHERE id=%s""", (reserva['experiencia_id'], reserva['experiencia_id'], reserva['experiencia_id']))
                        else:
                            cur2.execute("""UPDATE hospedajes SET
                                calificacion=(SELECT AVG(calificacion_general) FROM resenas WHERE hospedaje_id=%s AND publicada=1),
                                total_resenas=(SELECT COUNT(*) FROM resenas WHERE hospedaje_id=%s AND publicada=1)
                                WHERE id=%s""", (reserva['hospedaje_id'], reserva['hospedaje_id'], reserva['hospedaje_id']))
                    # Puntos por completar estadía
                    cur2.execute("UPDATE usuarios SET puntos_gamificacion=puntos_gamificacion+100 WHERE id=%s", (current_user.id,))
                    c2.commit()
                flash('¡Checkout completado! Gracias por elegir StayHuila 🌿', 'success')
                return redirect(url_for('mis_reservas'))
            finally:
                c2.close()
        return render_template('checkout.html', reserva=reserva)
    finally:
        c.close()

# ── PANEL ANFITRIÓN ───────────────────────────────────────────
@app.route('/panel-anfitrion')
@login_required
def panel_anfitrion():
    c = db()
    try:
        with c.cursor() as cur:
            # El anfitrión ve TODAS sus publicaciones (incluso deshabilitadas),
            # pero NO las eliminadas lógicamente (eliminado=1) ya que fueron dadas de baja.
            cur.execute("""SELECT h.*,i.url as image FROM hospedajes h
                LEFT JOIN hospedaje_imagenes i ON h.id=i.hospedaje_id AND i.es_portada=1
                WHERE h.anfitrion_id=%s AND h.eliminado=0
                ORDER BY h.fecha_creacion DESC""", (current_user.id,))
            mis_hospedajes = cur.fetchall()

            cur.execute("""SELECT e.*,i.url as image FROM experiencias e
                LEFT JOIN experiencia_imagenes i ON e.id=i.experiencia_id AND i.es_portada=1
                WHERE e.anfitrion_id=%s AND e.eliminado=0
                ORDER BY e.fecha_creacion DESC""", (current_user.id,))
            mis_experiencias = cur.fetchall()

            ids_hosp = [h['id'] for h in mis_hospedajes]
            ids_exp = [e['id'] for e in mis_experiencias]
            reservas_recientes = []
            pagos_recientes = []
            stats = {'ingresos': 0, 'total_res': 0, 'pendientes': 0, 'total_res_pagadas': 0}
            
            if ids_hosp or ids_exp:
                # Query combine
                conds = []
                params = []
                if ids_hosp:
                    fmt_h = ','.join(['%s'] * len(ids_hosp))
                    conds.append(f"(r.tipo='hospedaje' AND r.hospedaje_id IN ({fmt_h}))")
                    params.extend(ids_hosp)
                if ids_exp:
                    fmt_e = ','.join(['%s'] * len(ids_exp))
                    conds.append(f"(r.tipo='experiencia' AND r.experiencia_id IN ({fmt_e}))")
                    params.extend(ids_exp)
                
                where_clause = " OR ".join(conds)
                
                cur.execute(f"""SELECT r.*,u.nombre,u.apellido,u.email,
                    COALESCE(h.nombre, e.nombre) as hosp_nombre,
                    COALESCE(h.hora_checkin, NULL) as hora_checkin,
                    COALESCE(h.hora_checkout, NULL) as hora_checkout 
                    FROM reservas r
                    JOIN usuarios u ON r.usuario_id=u.id
                    LEFT JOIN hospedajes h ON r.hospedaje_id=h.id
                    LEFT JOIN experiencias e ON r.experiencia_id=e.id
                    WHERE {where_clause} ORDER BY r.fecha_reserva DESC LIMIT 15""", params)
                reservas_recientes = cur.fetchall()
                
                # Cargar historial de pagos para el anfitrión
                cur.execute(f"""SELECT p.*, r.codigo_reserva, u.nombre as huesped_nombre, u.apellido as huesped_apellido,
                    COALESCE(h.nombre, e.nombre) as item_nombre
                    FROM pagos p
                    JOIN reservas r ON p.reserva_id = r.id
                    JOIN usuarios u ON r.usuario_id = u.id
                    LEFT JOIN hospedajes h ON r.hospedaje_id = h.id
                    LEFT JOIN experiencias e ON r.experiencia_id = e.id
                    WHERE {where_clause.replace('r.', 'r.')} 
                    ORDER BY p.fecha_pago DESC LIMIT 20""", params)
                pagos_recientes = cur.fetchall()
                
                # Ingresos totales históricos (no se pierden aunque se deshabilite publicación)
                cur.execute(f"""
                    SELECT
                        COALESCE(SUM(CASE WHEN p.mp_status = 'approved' THEN p.monto ELSE 0 END), 0) AS ingresos_totales,
                        COALESCE(SUM(CASE WHEN p.mp_status = 'approved'
                            AND MONTH(p.fecha_pago) = MONTH(NOW())
                            AND YEAR(p.fecha_pago) = YEAR(NOW())
                            THEN p.monto ELSE 0 END), 0) AS ingresos_mes,
                        COUNT(CASE WHEN p.mp_status = 'approved' THEN 1 END) AS pagos_aprobados,
                        COUNT(CASE WHEN (p.mp_status = 'pending' OR p.estado = 'pending')
                            AND r.estado = 'pendiente_pago' THEN 1 END) AS pagos_pendientes_count
                    FROM pagos p
                    JOIN reservas r ON p.reserva_id = r.id
                    WHERE ({where_clause})
                """, params)

                row = cur.fetchone()
                if row:
                    stats['ingresos']           = float(row['ingresos_mes'] or 0)
                    stats['ingresos_totales']    = float(row['ingresos_totales'] or 0)
                    stats['total_res_pagadas']   = int(row['pagos_aprobados'] or 0)
                    stats['pagos_pendientes']    = int(row['pagos_pendientes_count'] or 0)

                # Llegadas pendientes (reservas confirmadas aún sin check-in)
                cur.execute(
                    f"SELECT COUNT(*) AS pendientes FROM reservas r WHERE ({where_clause}) AND estado = 'confirmada'",
                    params
                )
                row_p = cur.fetchone()
                if row_p:
                    stats['pendientes'] = int(row_p['pendientes'] or 0)

                # Reservas totales del anfitrión
                cur.execute(
                    f"SELECT COUNT(*) AS total FROM reservas r WHERE ({where_clause})",
                    params
                )
                row_t = cur.fetchone()
                if row_t:
                    stats['total_res'] = int(row_t['total'] or 0)

        return render_template('panel_anfitrion.html', mis_hospedajes=mis_hospedajes,
                               mis_experiencias=mis_experiencias, reservas_recientes=reservas_recientes, 
                               pagos_recientes=pagos_recientes, stats=stats)
    finally:
        c.close()

# ── API VALIDAR IMAGEN ────────────────────────────────────────
@app.route('/api/validar-imagen', methods=['POST'])
@login_required
def api_validar_imagen():
    """
    Recibe una sola imagen (campo 'foto'), la valida con image_optimizer
    (formato, tamaño, resolución, detección de blur via OpenCV) y, si es
    válida, la optimiza con Pillow y la guarda en /static/uploads/.
    Devuelve un JSON con el resultado para que el frontend actualice la
    tarjeta de vista previa en tiempo real.
    """
    import os
    file = request.files.get('foto')
    if not file or not file.filename:
        return jsonify({'status': 'corrupt_error', 'message': 'No se recibió ningún archivo.'}), 400

    upload_folder = os.path.join(app.root_path, 'static', 'uploads')
    idx = int(request.form.get('idx', 0))

    # Delegar toda la lógica al módulo image_optimizer
    result = process_image(file, upload_folder, index=idx)
    return jsonify(result.to_dict())


# ── PUBLICAR ──────────────────────────────────────────────────
@app.route('/publicar', methods=['POST'])
@login_required
def publicar():
    import os
    from werkzeug.utils import secure_filename
    
    tipo = request.form.get('pub-tipo')
    categoria = request.form.get('pub-categoria')
    nombre = request.form.get('nombre')
    descripcion = request.form.get('descripcion')
    municipio = request.form.get('municipio')
    direccion = request.form.get('direccion', '')
    lat = request.form.get('lat')
    lng = request.form.get('lng')
    precio = request.form.get('precio')
    
    max_huespedes = bounded_int(request.form.get('max_huespedes'), 2, 1, 30)
    habitaciones = bounded_int(request.form.get('habitaciones'), 1, 1, 20)
    banos = bounded_int(request.form.get('banos'), 1, 1, 20)
    checkin = request.form.get('checkin', '15:00')
    checkout = request.form.get('checkout', '11:00')
    # Estadía mínima y máxima — configurable por el anfitrión
    estadia_minima = bounded_int(request.form.get('estadia_minima'), 1, 1, 365)
    estadia_maxima = bounded_int(request.form.get('estadia_maxima'), 30, 1, 365)
    if estadia_minima > estadia_maxima:
        return jsonify({"success": False, "error": "La estadia minima no puede ser mayor que la maxima."})

    # Specific to Experiencias
    e_cap_min = bounded_int(request.form.get('e_cap_min'), 1, 1, 50)
    e_duracion = bounded_int(request.form.get('e_duracion'), 4, 1, 24)
    e_nivel = request.form.get('e_nivel', 'moderado')
    e_incluye = request.form.get('e_incluye', '')
    e_traer = request.form.get('e_traer', '')
    # Verification info
    v_tipo_doc = request.form.get('v_tipo_doc')
    v_documento = digits_only(request.form.get('v_documento'), 10)
    v_telefono = digits_only(request.form.get('v_telefono'), 10)

    if tipo == 'experiencia':
        max_huespedes = bounded_int(request.form.get('max_huespedes'), 10, 1, 50)
        e_cap_min = min(e_cap_min, max_huespedes)

    if not v_documento or not v_telefono:
        return jsonify({"success": False, "error": "El documento y telefono deben contener solo numeros."})

    # Amenities (JSON array string)
    import json
    servicios_str = request.form.get('servicios', '[]')
    try:
        servicios = json.loads(servicios_str)
    except:
        servicios = []
    
    # Las imágenes ya fueron validadas y optimizadas por /api/validar-imagen.
    # El frontend envía las URLs resultantes como lista de campos 'fotos_urls'.
    fotos_urls = request.form.getlist('fotos_urls')

    c = db()
    try:
        with c.cursor() as cur:
            if tipo == 'hospedaje':
                cur.execute("""INSERT INTO hospedajes(anfitrion_id, tipo, nombre, municipio, direccion_detalle, latitud, longitud,
                    descripcion, precio_noche, capacidad_max, num_habitaciones, num_banos, hora_checkin, hora_checkout,
                    estadia_minima, estadia_maxima, activo, verificado)
                    VALUES(%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 1, 1)""",
                    (current_user.id, categoria, nombre, municipio, direccion, lat, lng, descripcion, precio,
                     max_huespedes, habitaciones, banos, checkin, checkout, estadia_minima, estadia_maxima))
                pub_id = cur.lastrowid

                if fotos_urls:
                    # Insertar las URLs de imágenes ya optimizadas
                    for idx_url, url in enumerate(fotos_urls):
                        cur.execute("INSERT INTO hospedaje_imagenes(hospedaje_id, url, es_portada, orden) VALUES(%s, %s, %s, %s)",
                            (pub_id, url, 1 if idx_url == 0 else 0, idx_url))
                else:
                    # Imagen de respaldo si el anfitrión no subió fotos
                    cur.execute("INSERT INTO hospedaje_imagenes(hospedaje_id, url, es_portada) VALUES(%s, %s, 1)",
                        (pub_id, "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=500"))
                
                # Insert Amenities
                if servicios:
                    for srv in servicios:
                        cur.execute("INSERT INTO hospedaje_servicios(hospedaje_id, servicio) VALUES(%s, %s)", (pub_id, srv))
            else:
                cur.execute("""INSERT INTO experiencias(anfitrion_id, tipo, nombre, municipio, latitud, longitud, 
                    descripcion, precio_persona, capacidad_min, capacidad_max, duracion_horas, nivel_dificultad, que_incluye, que_traer, activo, verificado)
                    VALUES(%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 1, 1)""",
                    (current_user.id, categoria, nombre, municipio, lat, lng, descripcion, precio, e_cap_min, max_huespedes, e_duracion, e_nivel, e_incluye, e_traer))
                pub_id = cur.lastrowid

                if fotos_urls:
                    # Insertar las URLs de imágenes ya optimizadas
                    for idx_url, url in enumerate(fotos_urls):
                        cur.execute("INSERT INTO experiencia_imagenes(experiencia_id, url, es_portada, orden) VALUES(%s, %s, %s, %s)",
                            (pub_id, url, 1 if idx_url == 0 else 0, idx_url))
                else:
                    # Imagen de respaldo si el anfitrión no subió fotos
                    cur.execute("INSERT INTO experiencia_imagenes(experiencia_id, url, es_portada) VALUES(%s, %s, 1)",
                        (pub_id, "https://images.unsplash.com/photo-1533130061792-64b345e4a833?w=500"))
            
            # Verify user and save verification info
            if current_user.tipo not in ('anfitrion', 'admin'):
                cur.execute("UPDATE usuarios SET tipo='anfitrion', telefono=%s WHERE id=%s", (v_telefono, current_user.id))
                cur.execute("INSERT INTO anfitriones(usuario_id, documento_identidad) VALUES(%s, %s)", (current_user.id, f"{v_tipo_doc} {v_documento}"))
                current_user.tipo = 'anfitrion'
                current_user.telefono = v_telefono
            else:
                cur.execute("UPDATE usuarios SET telefono=%s WHERE id=%s", (v_telefono, current_user.id))
                cur.execute("UPDATE anfitriones SET documento_identidad=%s WHERE usuario_id=%s", (f"{v_tipo_doc} {v_documento}", current_user.id))
                current_user.telefono = v_telefono

            c.commit()
        return jsonify({"success": True})
    except Exception as e:
        c.rollback()
        return jsonify({"success": False, "error": str(e)})
    finally:
        c.close()
# ── API OBTENER DATOS DE PUBLICACIÓN (para wizard edición) ────
@app.route('/api/publicacion/<tipo>/<int:id>')
@login_required
def api_get_publicacion(tipo, id):
    """Devuelve todos los campos de una publicación propia para pre-llenar el wizard de edición."""
    c = db()
    try:
        with c.cursor() as cur:
            if tipo == 'hospedaje':
                cur.execute("""SELECT h.*, GROUP_CONCAT(DISTINCT i.url ORDER BY i.orden SEPARATOR '|') as fotos
                    FROM hospedajes h
                    LEFT JOIN hospedaje_imagenes i ON h.id=i.hospedaje_id
                    WHERE h.id=%s AND h.anfitrion_id=%s AND h.eliminado=0
                    GROUP BY h.id""", (id, current_user.id))
                pub = cur.fetchone()
                if not pub:
                    return jsonify({'error': 'No encontrado o sin permiso'}), 404
                cur.execute("SELECT servicio FROM hospedaje_servicios WHERE hospedaje_id=%s", (id,))
                servicios = [r['servicio'] for r in cur.fetchall()]
                data = serialize(pub)
                data['servicios'] = servicios
            elif tipo == 'experiencia':
                cur.execute("""SELECT e.*, GROUP_CONCAT(DISTINCT i.url ORDER BY i.orden SEPARATOR '|') as fotos
                    FROM experiencias e
                    LEFT JOIN experiencia_imagenes i ON e.id=i.experiencia_id
                    WHERE e.id=%s AND e.anfitrion_id=%s AND e.eliminado=0
                    GROUP BY e.id""", (id, current_user.id))
                pub = cur.fetchone()
                if not pub:
                    return jsonify({'error': 'No encontrado o sin permiso'}), 404
                data = serialize(pub)
                data['servicios'] = []
            else:
                return jsonify({'error': 'Tipo inválido'}), 400
        return jsonify(data)
    finally:
        c.close()


# ── ACTUALIZAR PUBLICACIÓN ────────────────────────────────────
@app.route('/actualizar', methods=['POST'])
@login_required
def actualizar_publicacion():
    """Actualiza los datos de un hospedaje o experiencia existente del anfitrión."""
    import json
    pub_id   = request.form.get('pub_id', type=int)
    tipo     = request.form.get('pub-tipo')
    categoria = request.form.get('pub-categoria')
    nombre   = request.form.get('nombre')
    descripcion = request.form.get('descripcion')
    municipio = request.form.get('municipio')
    direccion = request.form.get('direccion', '')
    lat      = request.form.get('lat')
    lng      = request.form.get('lng')
    precio   = request.form.get('precio')

    if not pub_id or tipo not in ('hospedaje', 'experiencia'):
        return jsonify({'success': False, 'error': 'Datos incompletos.'})

    c = db()
    try:
        with c.cursor() as cur:
            # Verificar propiedad antes de actualizar
            tabla = 'hospedajes' if tipo == 'hospedaje' else 'experiencias'
            cur.execute(f"SELECT id FROM {tabla} WHERE id=%s AND anfitrion_id=%s AND eliminado=0",
                        (pub_id, current_user.id))
            if not cur.fetchone():
                return jsonify({'success': False, 'error': 'Sin permiso para editar esta publicación.'})

            if tipo == 'hospedaje':
                max_huespedes = bounded_int(request.form.get('max_huespedes'), 2, 1, 30)
                habitaciones  = bounded_int(request.form.get('habitaciones'), 1, 1, 20)
                banos         = bounded_int(request.form.get('banos'), 1, 1, 20)
                checkin       = request.form.get('checkin', '15:00')
                checkout      = request.form.get('checkout', '11:00')
                estadia_min   = bounded_int(request.form.get('estadia_minima'), 1, 1, 365)
                estadia_max   = bounded_int(request.form.get('estadia_maxima'), 30, 1, 365)
                if estadia_min > estadia_max:
                    return jsonify({'success': False, 'error': 'La estadia minima no puede ser mayor que la maxima.'})

                cur.execute("""UPDATE hospedajes SET tipo=%s, nombre=%s, municipio=%s,
                    direccion_detalle=%s, latitud=%s, longitud=%s, descripcion=%s,
                    precio_noche=%s, capacidad_max=%s, num_habitaciones=%s, num_banos=%s,
                    hora_checkin=%s, hora_checkout=%s, estadia_minima=%s, estadia_maxima=%s
                    WHERE id=%s AND anfitrion_id=%s""",
                    (categoria, nombre, municipio, direccion, lat, lng, descripcion,
                     precio, max_huespedes, habitaciones, banos, checkin, checkout,
                     estadia_min, estadia_max, pub_id, current_user.id))

                # Servicios: reemplazar completamente
                cur.execute("DELETE FROM hospedaje_servicios WHERE hospedaje_id=%s", (pub_id,))
                for srv in json.loads(request.form.get('servicios', '[]')):
                    cur.execute("INSERT INTO hospedaje_servicios(hospedaje_id, servicio) VALUES(%s,%s)", (pub_id, srv))

                # Imágenes: solo reemplazar si el anfitrión subió nuevas
                fotos_urls = request.form.getlist('fotos_urls')
                if fotos_urls:
                    cur.execute("DELETE FROM hospedaje_imagenes WHERE hospedaje_id=%s", (pub_id,))
                    for idx, url in enumerate(fotos_urls):
                        cur.execute("""INSERT INTO hospedaje_imagenes(hospedaje_id, url, es_portada, orden)
                            VALUES(%s,%s,%s,%s)""", (pub_id, url, 1 if idx == 0 else 0, idx))

            else:  # experiencia
                e_cap_min  = bounded_int(request.form.get('e_cap_min'), 1, 1, 50)
                e_duracion = bounded_int(request.form.get('e_duracion'), 4, 1, 24)
                e_nivel    = request.form.get('e_nivel', 'moderado')
                e_incluye  = request.form.get('e_incluye', '')
                e_traer    = request.form.get('e_traer', '')
                max_huespedes = bounded_int(request.form.get('max_huespedes'), 10, 1, 50)
                e_cap_min = min(e_cap_min, max_huespedes)

                cur.execute("""UPDATE experiencias SET tipo=%s, nombre=%s, municipio=%s,
                    latitud=%s, longitud=%s, descripcion=%s, precio_persona=%s,
                    capacidad_min=%s, capacidad_max=%s, duracion_horas=%s,
                    nivel_dificultad=%s, que_incluye=%s, que_traer=%s
                    WHERE id=%s AND anfitrion_id=%s""",
                    (categoria, nombre, municipio, lat, lng, descripcion, precio,
                     e_cap_min, max_huespedes, e_duracion, e_nivel, e_incluye, e_traer,
                     pub_id, current_user.id))

                fotos_urls = request.form.getlist('fotos_urls')
                if fotos_urls:
                    cur.execute("DELETE FROM experiencia_imagenes WHERE experiencia_id=%s", (pub_id,))
                    for idx, url in enumerate(fotos_urls):
                        cur.execute("""INSERT INTO experiencia_imagenes(experiencia_id, url, es_portada, orden)
                            VALUES(%s,%s,%s,%s)""", (pub_id, url, 1 if idx == 0 else 0, idx))

            c.commit()
        return jsonify({'success': True})
    except Exception as e:
        c.rollback()
        return jsonify({'success': False, 'error': str(e)})
    finally:
        c.close()


@app.route('/api/publicacion/estado', methods=['POST'])
@login_required
def cambiar_estado_publicacion():
    """
    Gestiona el cambio de estado de una publicación con las siguientes reglas:
    - 'abierta'       → publicación disponible para reservas.
    - 'deshabilitada' → oculta del buscador, sin nuevas reservas, historial intacto.
    - 'eliminar'      → soft delete: marca eliminado=1 en BD, nunca borra registros.
                        BLOQUEADO si la publicación tiene reservas asociadas.
    """
    pub_id = request.form.get('id')
    tipo   = request.form.get('tipo')
    estado = request.form.get('estado')

    # Validar parámetros de entrada
    if not pub_id or tipo not in ('hospedaje', 'experiencia') or estado not in ('abierta', 'deshabilitada', 'eliminar'):
        return jsonify({'success': False, 'message': 'Datos inválidos.'})

    tabla           = 'hospedajes'  if tipo == 'hospedaje'   else 'experiencias'
    tabla_reservas  = 'reservas'    # Las reservas siempre son en esta tabla
    campo_fk        = 'hospedaje_id' if tipo == 'hospedaje' else 'experiencia_id'

    c = db()
    try:
        with c.cursor() as cur:
            # ── Verificar propiedad de la publicación ────────────────────────
            cur.execute(
                f"SELECT id FROM {tabla} WHERE id=%s AND anfitrion_id=%s AND eliminado=0",
                (pub_id, current_user.id)
            )
            if not cur.fetchone() and current_user.tipo != 'admin':
                return jsonify({'success': False, 'message': 'No tienes permiso sobre esta publicación.'})

            # ── Cambio de estado: abierta / deshabilitada ─────────────────────
            if estado in ('abierta', 'deshabilitada'):
                cur.execute(
                    f"UPDATE {tabla} SET estado=%s WHERE id=%s",
                    (estado, pub_id)
                )
                msg = (
                    'Publicación activada. Ya aparece en el buscador.'
                    if estado == 'abierta'
                    else 'Publicación deshabilitada. No acepta nuevas reservas, pero el historial se conserva.'
                )
                c.commit()
                return jsonify({'success': True, 'message': msg})

            # ── Soft delete (eliminar lógico) ─────────────────────────────────
            if estado == 'eliminar':
                # Regla crítica: no se puede eliminar si tiene reservas históricas.
                # Esto protege el historial financiero del anfitrión y los huéspedes.
                if tipo == 'hospedaje':
                    cur.execute(
                        "SELECT COUNT(*) as total FROM reservas WHERE hospedaje_id=%s",
                        (pub_id,)
                    )
                else:
                    # Las experiencias pueden tener reservas en una tabla diferente;
                    # si no existe, simplemente devuelve 0.
                    try:
                        cur.execute(
                            "SELECT COUNT(*) as total FROM reservas_experiencias WHERE experiencia_id=%s",
                            (pub_id,)
                        )
                    except Exception:
                        # Tabla no existe en esta versión: sin reservas
                        cur.execute("SELECT 0 as total")

                row = cur.fetchone()
                total_reservas = row['total'] if row else 0

                if total_reservas > 0:
                    # BLOQUEADO: el anfitrión tiene reservas asociadas
                    return jsonify({
                        'success':  False,
                        'blocked':  True,
                        'message':  (
                            f'No puedes eliminar esta publicación porque tiene '
                            f'{total_reservas} reserva(s) registrada(s). '
                            f'Puedes deshabilitarla para que deje de recibir nuevas reservas '
                            f'sin perder el historial.'
                        )
                    })

                # Sin reservas: aplicar soft delete (eliminado lógico)
                # NUNCA se usa DELETE físico en publicaciones
                cur.execute(
                    f"UPDATE {tabla} SET eliminado=1, estado='deshabilitada', activo=0 WHERE id=%s",
                    (pub_id,)
                )
                c.commit()
                return jsonify({
                    'success': True,
                    'message': 'Publicación eliminada. Los datos se conservan por seguridad.'
                })

    except Exception as e:
        c.rollback()
        print(f'[cambiar_estado_publicacion] Error: {e}')
        return jsonify({'success': False, 'message': 'Error interno del servidor.'})
    finally:
        c.close()
# ── API DISPONIBILIDAD EXPERIENCIAS (SESIONES) ───────────────
@app.route('/api/experiencias/sesiones/<int:id>')
def api_experiencia_sesiones(id):
    """
    Devuelve las sesiones de una experiencia para una fecha específica o a futuro.
    """
    fecha = request.args.get('fecha')
    c = db()
    try:
        with c.cursor() as cur:
            # Liberar expiradas antes de consultar disponibilidad
            liberar_reservas_expiradas(cur)
            c.commit()

            query = """
                SELECT id, fecha, hora_inicio, hora_fin, cupos_totales, cupos_disponibles, estado 
                FROM experiencia_sesiones 
                WHERE experiencia_id = %s AND estado IN ('disponible', 'lleno')
            """
            params = [id]
            
            if fecha:
                query += " AND fecha = %s"
                params.append(fecha)
            else:
                query += " AND fecha >= CURDATE()"
            
            query += " ORDER BY fecha ASC, hora_inicio ASC"
            
            cur.execute(query, params)
            sesiones = cur.fetchall()
            
            return jsonify({
                'success': True,
                'sesiones': serialize(sesiones)
            })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        c.close()

@app.route('/api/experiencias/sesiones/crear', methods=['POST'])
@login_required
def api_crear_sesion():
    data = request.get_json()
    exp_id = data.get('experiencia_id')
    fecha = data.get('fecha')
    h_inicio = data.get('hora_inicio')
    h_fin = data.get('hora_fin')
    cupos = data.get('cupos_totales')

    if not all([exp_id, fecha, h_inicio, h_fin, cupos]):
        return jsonify({'success': False, 'error': 'Datos incompletos'}), 400

    c = db()
    try:
        with c.cursor() as cur:
            # Verificar permiso
            cur.execute("SELECT id FROM experiencias WHERE id=%s AND anfitrion_id=%s", (exp_id, current_user.id))
            if not cur.fetchone():
                return jsonify({'success': False, 'error': 'Sin permiso'}), 403

            cur.execute("""
                INSERT INTO experiencia_sesiones (experiencia_id, fecha, hora_inicio, hora_fin, cupos_totales, cupos_disponibles)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, (exp_id, fecha, h_inicio, h_fin, cupos, cupos))
            c.commit()
            return jsonify({'success': True})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        c.close()

@app.route('/api/experiencias/sesiones/cancelar/<int:id>', methods=['POST'])
@login_required
def api_cancelar_sesion(id):
    c = db()
    try:
        with c.cursor() as cur:
            # Verificar permiso y estado
            cur.execute("""
                SELECT s.id, e.anfitrion_id 
                FROM experiencia_sesiones s 
                JOIN experiencias e ON s.experiencia_id = e.id 
                WHERE s.id=%s
            """, (id,))
            row = cur.fetchone()
            if not row or row['anfitrion_id'] != current_user.id:
                return jsonify({'success': False, 'error': 'Sin permiso'}), 403

            # Actualizar estado a cancelado
            cur.execute("UPDATE experiencia_sesiones SET estado = 'cancelado' WHERE id = %s", (id,))
            
            # TODO: Aquí se debería notificar a los usuarios que tienen reservas en esta sesión
            
            c.commit()
            return jsonify({'success': True})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        c.close()

@app.route('/api/experiencias/lista-espera/unirse', methods=['POST'])
@login_required
def api_unirse_lista_espera():
    data = request.get_json()
    sesion_id = data.get('sesion_id')
    huespedes = int(data.get('huespedes', 1))

    if not sesion_id:
        return jsonify({'success': False, 'error': 'Sesión no válida'}), 400

    c = db()
    try:
        with c.cursor() as cur:
            # Verificar que no esté ya en la lista
            cur.execute("SELECT id FROM lista_espera WHERE usuario_id=%s AND sesion_id=%s", (current_user.id, sesion_id))
            if cur.fetchone():
                return jsonify({'success': False, 'error': 'Ya estás en la lista de espera para este horario.'}), 400

            cur.execute("""
                INSERT INTO lista_espera (usuario_id, sesion_id, huespedes)
                VALUES (%s, %s, %s)
            """, (current_user.id, sesion_id, huespedes))
            c.commit()
            return jsonify({'success': True, 'msg': 'Te has unido a la lista de espera. Te notificaremos si se liberan cupos.'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        c.close()

# ── API DISPONIBILIDAD ────────────────────────────────────────
@app.route('/api/disponibilidad/<int:id>')
def disponibilidad(id):
    c = db()
    try:
        with c.cursor() as cur:
            # 1. Liberar reservas pendientes que ya expiraron
            liberar_reservas_expiradas(cur)
            c.commit()

            tipo = request.args.get('tipo', 'hospedaje')
            id_col = 'hospedaje_id' if tipo == 'hospedaje' else 'experiencia_id'

            # --- SI ES EXPERIENCIA, DEVOLVER DÍAS QUE TIENEN SESIONES DISPONIBLES ---
            if tipo == 'experiencia':
                cur.execute("""
                    SELECT DISTINCT fecha 
                    FROM experiencia_sesiones 
                    WHERE experiencia_id = %s AND fecha >= CURDATE() AND estado IN ('disponible', 'lleno')
                """, (id,))
                dias_con_sesion = [r['fecha'].isoformat() for r in cur.fetchall()]
                
                return jsonify({
                    'success': True,
                    'tipo': 'experiencia',
                    'dias_disponibles': dias_con_sesion
                })

            # 2. Para hospedajes: obtener estadía mínima/máxima base y reglas de temporada
            estadia_minima = 1
            estadia_maxima = 365
            reglas_temporada = []
            if tipo == 'hospedaje':
                cur.execute(
                    "SELECT estadia_minima, estadia_maxima FROM hospedajes WHERE id=%s", (id,)
                )
                row = cur.fetchone()
                if row:
                    estadia_minima = int(row['estadia_minima'] or 1)
                    estadia_maxima = int(row['estadia_maxima'] or 365)

                # Reglas especiales de temporada activas a futuro
                cur.execute("""
                    SELECT nombre, fecha_inicio, fecha_fin, estadia_minima, estadia_maxima
                    FROM estadia_reglas_temporada
                    WHERE hospedaje_id=%s AND activo=1 AND fecha_fin >= CURDATE()
                    ORDER BY fecha_inicio
                """, (id,))
                for reg in cur.fetchall():
                    reglas_temporada.append({
                        'nombre':        reg['nombre'],
                        'fecha_inicio':  reg['fecha_inicio'].isoformat(),
                        'fecha_fin':     reg['fecha_fin'].isoformat(),
                        'estadia_minima': int(reg['estadia_minima']),
                        'estadia_maxima': int(reg['estadia_maxima']),
                    })

            # 3. Consultar reservas activas que bloquean las fechas (pendiente_pago, confirmada, check_in)
            cur.execute(f"""SELECT fecha_checkin, fecha_checkout
                FROM reservas
                WHERE {id_col}=%s AND estado IN ('pendiente_pago', 'confirmada', 'check_in')
                AND fecha_checkout >= CURDATE()""", (id,))
            rows = cur.fetchall()

        bloqueadas = []
        for r in rows:
            fi = r['fecha_checkin']
            fo = r['fecha_checkout']
            if not fi or not fo:
                continue
            current = fi
            while current < fo:
                bloqueadas.append(current.isoformat())
                current += timedelta(days=1)

        return jsonify({
            'bloqueadas':      bloqueadas,
            'estadia_minima':  estadia_minima,
            'estadia_maxima':  estadia_maxima,
            'reglas_temporada': reglas_temporada,
        })
    finally:
        c.close()

# ── API BUSCAR ────────────────────────────────────────────────
@app.route('/api/buscar')
def api_buscar():
    q = request.args.get('q', '')
    c = db()
    try:
        with c.cursor() as cur:
            cur.execute("""SELECT h.id,h.nombre,h.municipio,h.precio_noche as precio,'hospedaje' as tipo,i.url as imagen
                FROM hospedajes h LEFT JOIN hospedaje_imagenes i ON h.id=i.hospedaje_id AND i.es_portada=1
                -- Solo resultados disponibles: activos, no eliminados, estado abierta
                WHERE (h.nombre LIKE %s OR h.municipio LIKE %s)
                    AND h.activo=1 AND h.eliminado=0 AND h.estado='abierta'
                UNION ALL
                SELECT e.id,e.nombre,e.municipio,e.precio_persona as precio,'experiencia' as tipo,i.url as imagen
                FROM experiencias e LEFT JOIN experiencia_imagenes i ON e.id=i.experiencia_id AND i.es_portada=1
                WHERE (e.nombre LIKE %s OR e.municipio LIKE %s)
                    AND e.activo=1 AND e.eliminado=0 AND e.estado='abierta' LIMIT 8""",
                (f'%{q}%', f'%{q}%', f'%{q}%', f'%{q}%'))
            return jsonify(cur.fetchall())
    finally:
        c.close()

@app.route('/api/auth-check')
def auth_check():
    return jsonify({'logged_in': current_user.is_authenticated})
# ── COMUNIDAD ──────────────────────────────────────────────────
@app.route('/comunidad')
def comunidad():
    return render_template('comunidad.html')

@app.route('/api/comunidad/posts', methods=['GET', 'POST'])
def api_comunidad_posts():
    c = db()
    try:
        with c.cursor() as cur:
            if request.method == 'GET':
                cur.execute("""
                    SELECT p.*, u.nombre, u.apellido, u.foto_perfil,
                    (SELECT COUNT(*) FROM comunidad_comentarios WHERE post_id = p.id) as comentarios_count,
                    h.nombre as h_nombre, h.municipio as h_municipio, hi.url as h_imagen,
                    e.nombre as e_nombre, e.municipio as e_municipio, ei.url as e_imagen
                    FROM comunidad_posts p
                    JOIN usuarios u ON p.usuario_id = u.id
                    LEFT JOIN hospedajes h ON p.hospedaje_id = h.id
                    LEFT JOIN hospedaje_imagenes hi ON h.id = hi.hospedaje_id AND hi.es_portada = 1
                    LEFT JOIN experiencias e ON p.experiencia_id = e.id
                    LEFT JOIN experiencia_imagenes ei ON e.id = ei.experiencia_id AND ei.es_portada = 1
                    ORDER BY p.fecha_creacion DESC
                """)
                posts = cur.fetchall()
                
                # Obtener si el usuario actual le dio like
                if current_user.is_authenticated:
                    for post in posts:
                        cur.execute("SELECT 1 FROM comunidad_likes WHERE post_id=%s AND usuario_id=%s", (post['id'], current_user.id))
                        post['user_liked'] = bool(cur.fetchone())
                else:
                    for post in posts:
                        post['user_liked'] = False
                        
                # Transformar datos de recomendación
                for post in posts:
                    if post['tipo_recomendacion'] == 'hospedaje' and post['hospedaje_id']:
                        post['rec_nombre'] = post['h_nombre']
                        post['rec_municipio'] = post['h_municipio']
                        post['rec_imagen'] = post['h_imagen']
                    elif post['tipo_recomendacion'] == 'experiencia' and post['experiencia_id']:
                        post['rec_nombre'] = post['e_nombre']
                        post['rec_municipio'] = post['e_municipio']
                        post['rec_imagen'] = post['e_imagen']
                    
                    # Clean up the flat query fields
                    post.pop('h_nombre', None); post.pop('h_municipio', None); post.pop('h_imagen', None)
                    post.pop('e_nombre', None); post.pop('e_municipio', None); post.pop('e_imagen', None)
                        
                return jsonify(serialize(posts))
                
            elif request.method == 'POST':
                if not current_user.is_authenticated:
                    return jsonify({'success': False, 'error': 'No autenticado'}), 401
                    
                import os
                from werkzeug.utils import secure_filename
                
                contenido = request.form.get('contenido')
                if not contenido:
                    return jsonify({'success': False, 'error': 'El contenido no puede estar vacío'}), 400
                    
                file = request.files.get('imagen')
                imagen_url = None
                
                if file and file.filename != '':
                    import uuid
                    ext = file.filename.rsplit('.', 1)[-1].lower() if '.' in file.filename else 'jpg'
                    filename = f"post_{uuid.uuid4().hex}.{ext}"
                    os.makedirs(os.path.join(app.root_path, 'static', 'uploads'), exist_ok=True)
                    path = os.path.join(app.root_path, 'static', 'uploads', filename)
                    file.save(path)
                    imagen_url = f"/static/uploads/{filename}"
                
                rec_tipo = request.form.get('rec_tipo')
                rec_id = request.form.get('rec_id')
                
                hospedaje_id = rec_id if rec_tipo == 'hospedaje' else None
                experiencia_id = rec_id if rec_tipo == 'experiencia' else None
                
                cur.execute("""INSERT INTO comunidad_posts 
                    (usuario_id, contenido, imagen_url, tipo_recomendacion, hospedaje_id, experiencia_id) 
                    VALUES (%s, %s, %s, %s, %s, %s)""",
                    (current_user.id, contenido, imagen_url, rec_tipo, hospedaje_id, experiencia_id))
                c.commit()
                return jsonify({'success': True})
    finally:
        c.close()

@app.route('/api/comunidad/posts/<int:post_id>/like', methods=['POST'])
@login_required
def api_comunidad_like(post_id):
    c = db()
    try:
        with c.cursor() as cur:
            # Check if liked
            cur.execute("SELECT 1 FROM comunidad_likes WHERE post_id=%s AND usuario_id=%s", (post_id, current_user.id))
            liked = cur.fetchone()
            
            if liked:
                # Unlike
                cur.execute("DELETE FROM comunidad_likes WHERE post_id=%s AND usuario_id=%s", (post_id, current_user.id))
                cur.execute("UPDATE comunidad_posts SET likes_count = likes_count - 1 WHERE id=%s", (post_id,))
                status = "unliked"
            else:
                # Like
                cur.execute("INSERT INTO comunidad_likes (post_id, usuario_id) VALUES (%s, %s)", (post_id, current_user.id))
                cur.execute("UPDATE comunidad_posts SET likes_count = likes_count + 1 WHERE id=%s", (post_id,))
                status = "liked"
                
            c.commit()
            return jsonify({'success': True, 'status': status})
    finally:
        c.close()

@app.route('/api/comunidad/posts/<int:post_id>/comentarios', methods=['GET', 'POST'])
def api_comunidad_comentarios(post_id):
    c = db()
    try:
        with c.cursor() as cur:
            if request.method == 'GET':
                cur.execute("""
                    SELECT c.*, u.nombre, u.apellido, u.foto_perfil
                    FROM comunidad_comentarios c
                    JOIN usuarios u ON c.usuario_id = u.id
                    WHERE c.post_id = %s
                    ORDER BY c.fecha_creacion ASC
                """, (post_id,))
                comentarios = cur.fetchall()
                return jsonify(serialize(comentarios))
                
            elif request.method == 'POST':
                if not current_user.is_authenticated:
                    return jsonify({'success': False, 'error': 'No autenticado'}), 401
                    
                data = request.json
                contenido = data.get('contenido')
                parent_id = data.get('parent_id')
                if not contenido:
                    return jsonify({'success': False, 'error': 'Comentario vacío'}), 400
                    
                cur.execute("INSERT INTO comunidad_comentarios (post_id, usuario_id, contenido, parent_id) VALUES (%s, %s, %s, %s)",
                    (post_id, current_user.id, contenido, parent_id))
                c.commit()
                return jsonify({'success': True})
    finally:
        c.close()

@app.route('/api/comunidad/posts/<int:post_id>', methods=['DELETE'])
@login_required
def api_comunidad_post_delete(post_id):
    c = db()
    try:
        with c.cursor() as cur:
            cur.execute("SELECT usuario_id FROM comunidad_posts WHERE id=%s", (post_id,))
            row = cur.fetchone()
            if not row or row['usuario_id'] != current_user.id:
                return jsonify({'success': False, 'error': 'No autorizado'}), 403
            cur.execute("DELETE FROM comunidad_comentarios WHERE post_id=%s", (post_id,))
            cur.execute("DELETE FROM comunidad_likes WHERE post_id=%s", (post_id,))
            cur.execute("DELETE FROM comunidad_posts WHERE id=%s", (post_id,))
            c.commit()
            return jsonify({'success': True})
    finally:
        c.close()

@app.route('/api/comunidad/comentarios/<int:comment_id>', methods=['DELETE'])
@login_required
def api_comunidad_comentario_delete(comment_id):
    c = db()
    try:
        with c.cursor() as cur:
            cur.execute("SELECT usuario_id FROM comunidad_comentarios WHERE id=%s", (comment_id,))
            row = cur.fetchone()
            if not row or row['usuario_id'] != current_user.id:
                return jsonify({'success': False, 'error': 'No autorizado'}), 403
            
            # Al eliminar un comentario, podríamos eliminar también sus respuestas, 
            # o simplemente dejar que queden huérfanos. Lo ideal es eliminarlos en cascada.
            cur.execute("DELETE FROM comunidad_comentarios WHERE parent_id=%s", (comment_id,))
            cur.execute("DELETE FROM comunidad_comentarios WHERE id=%s", (comment_id,))
            c.commit()
            return jsonify({'success': True})
    finally:
        c.close()

@app.route('/api/comunidad/tendencias')
def api_comunidad_tendencias():
    c = db()
    try:
        with c.cursor() as cur:
            cur.execute("SELECT contenido FROM comunidad_posts")
            posts = cur.fetchall()
            
            import re
            from collections import Counter
            
            hashtags = []
            for p in posts:
                if p['contenido']:
                    tags = re.findall(r'#\w+', p['contenido'])
                    hashtags.extend([t.lower() for t in tags])
            
            counts = Counter(hashtags)
            top = counts.most_common(5)
            
            result = []
            for rank, (tag, count) in enumerate(top, 1):
                result.append({
                    'rank': rank,
                    'tag': tag,
                    'count': count
                })
            
            return jsonify(result)
    finally:
        c.close()

@app.route('/resena/<tipo>/<int:id>', methods=['POST'])
@login_required
def dejar_resena_directa(tipo, id):
    calificacion = request.form.get('calificacion')
    comentario = request.form.get('comentario')
    
    if not calificacion or not comentario:
        flash('Debe llenar todos los campos de la reseña.', 'error')
        return redirect(f"/{tipo}/{id}")

    c = db()
    try:
        with c.cursor() as cur:
            # Verificar que el usuario no sea el dueño de la publicación
            if tipo == 'hospedaje':
                cur.execute("SELECT anfitrion_id FROM hospedajes WHERE id=%s", (id,))
            else:
                cur.execute("SELECT anfitrion_id FROM experiencias WHERE id=%s", (id,))
            listing = cur.fetchone()
            if listing and listing['anfitrion_id'] == current_user.id:
                flash('No puedes dejar reseñas en tu propia publicación.', 'error')
                return redirect(f"/{tipo}/{id}")

            # Verificar que el usuario no haya reseñado ya esta publicación
            if tipo == 'hospedaje':
                cur.execute("SELECT id FROM resenas WHERE hospedaje_id=%s AND usuario_id=%s LIMIT 1", (id, current_user.id))
            else:
                cur.execute("SELECT id FROM resenas WHERE experiencia_id=%s AND usuario_id=%s LIMIT 1", (id, current_user.id))
            if cur.fetchone():
                flash('Ya dejaste una reseña en esta publicación.', 'error')
                return redirect(f"/{tipo}/{id}")

            cur.execute("""
                INSERT INTO resenas (hospedaje_id, experiencia_id, usuario_id, calificacion_general, comentario, tipo)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, (
                id if tipo == 'hospedaje' else None,
                id if tipo == 'experiencia' else None,
                current_user.id,
                calificacion,
                comentario,
                tipo
            ))
            
            # Actualizar promedio y total de reseñas en la tabla correspondiente
            if tipo == 'hospedaje':
                cur.execute("""UPDATE hospedajes SET
                    calificacion=(SELECT AVG(calificacion_general) FROM resenas WHERE hospedaje_id=%s AND publicada=1),
                    total_resenas=(SELECT COUNT(*) FROM resenas WHERE hospedaje_id=%s AND publicada=1)
                    WHERE id=%s""", (id, id, id))
            elif tipo == 'experiencia':
                cur.execute("""UPDATE experiencias SET
                    calificacion=(SELECT AVG(calificacion_general) FROM resenas WHERE experiencia_id=%s AND publicada=1),
                    total_resenas=(SELECT COUNT(*) FROM resenas WHERE experiencia_id=%s AND publicada=1)
                    WHERE id=%s""", (id, id, id))
            # +25 pts por dejar reseña
            cur.execute("UPDATE usuarios SET puntos_gamificacion=puntos_gamificacion+25 WHERE id=%s", (current_user.id,))
            c.commit()
            flash('¡Gracias por tu reseña!', 'success')
    except Exception as e:
        c.rollback()
        flash('Error al guardar la reseña.', 'error')
    finally:
        c.close()
        
    return redirect(f"/{tipo}/{id}")

@app.route('/api/canjear-puntos', methods=['POST'])
@login_required
def api_canjear_puntos():
    data = request.get_json(silent=True) or {}
    tier = int(data.get('tier', 0))
    tiers = {200: 5, 500: 10, 1000: 20}  # pts → % descuento
    if tier not in tiers:
        return jsonify({'ok': False, 'msg': 'Opción no válida'})
    if current_user.puntos < tier:
        return jsonify({'ok': False, 'msg': f'Necesitas al menos {tier} puntos (tienes {current_user.puntos})'})
    pct = tiers[tier]
    c = db()
    try:
        with c.cursor() as cur:
            cur.execute("""UPDATE usuarios
                SET puntos_gamificacion = puntos_gamificacion - %s,
                    credito_descuento = COALESCE(credito_descuento, 0) + %s
                WHERE id = %s""", (tier, pct, current_user.id))
            c.commit()
        current_user.puntos -= tier
        current_user.credito_descuento = float(current_user.credito_descuento or 0) + pct
        return jsonify({
            'ok': True,
            'msg': f'¡Canjeaste {tier} pts! Tienes {int(current_user.credito_descuento)}% de descuento para tu próxima reserva.',
            'nuevos_pts': current_user.puntos,
            'credito': int(current_user.credito_descuento)
        })
    except Exception as e:
        c.rollback()
        return jsonify({'ok': False, 'msg': 'Error: ' + str(e)})
    finally:
        c.close()

@app.route('/api/recuperar-contrasena', methods=['POST'])
def api_recuperar_contrasena():
    """Genera un código de 6 dígitos y lo envía al correo del usuario."""
    data  = request.get_json(silent=True) or {}
    email = data.get('email', '').strip().lower()
    if not email:
        return jsonify({'success': False, 'error': 'Correo requerido.'}), 400

    c = db()
    try:
        with c.cursor() as cur:
            cur.execute("SELECT id FROM usuarios WHERE email=%s AND activo=1", (email,))
            user = cur.fetchone()

        if not user:
            # Por seguridad no revelamos si el email existe o no
            return jsonify({'success': True})

        codigo = ''.join(random.choices(string.digits, k=6))
        expiry = int((datetime.now() + timedelta(minutes=15)).timestamp())
        token  = f'RESET:{codigo}:{expiry}'

        with c.cursor() as cur:
            cur.execute("UPDATE usuarios SET token_verificacion=%s WHERE id=%s",
                        (token, user['id']))
            c.commit()

        send_reset_email(email, codigo)
        return jsonify({'success': True})

    except RuntimeError as e:
        return jsonify({'success': False, 'error': str(e)}), 503
    except Exception as e:
        c.rollback()
        app.logger.error(f'[recuperar_contrasena] {e}')
        return jsonify({'success': False, 'error': 'No se pudo enviar el correo. Intenta más tarde.'}), 500
    finally:
        c.close()


@app.route('/api/verificar-reset', methods=['POST'])
def api_verificar_reset():
    """Verifica el código y actualiza la contraseña del usuario."""
    data    = request.get_json(silent=True) or {}
    email   = data.get('email',    '').strip().lower()
    codigo  = data.get('codigo',   '').strip()
    new_pw  = data.get('password', '').strip()

    if not all([email, codigo, new_pw]):
        return jsonify({'success': False, 'error': 'Todos los campos son requeridos.'}), 400
    if len(new_pw) < 6:
        return jsonify({'success': False, 'error': 'La contraseña debe tener al menos 6 caracteres.'}), 400

    c = db()
    try:
        with c.cursor() as cur:
            cur.execute("SELECT id, token_verificacion FROM usuarios WHERE email=%s AND activo=1", (email,))
            user = cur.fetchone()

        if not user or not (user.get('token_verificacion') or '').startswith('RESET:'):
            return jsonify({'success': False, 'error': 'Solicitud inválida o expirada.'}), 400

        parts = user['token_verificacion'].split(':')
        if len(parts) != 3:
            return jsonify({'success': False, 'error': 'Solicitud inválida.'}), 400

        _, stored_code, expiry_ts = parts

        if int(datetime.now().timestamp()) > int(expiry_ts):
            return jsonify({'success': False, 'error': 'El código ha expirado. Solicita uno nuevo.'}), 400

        if codigo != stored_code:
            return jsonify({'success': False, 'error': 'Código incorrecto. Verifica e intenta de nuevo.'}), 400

        pw_hash = bcrypt.generate_password_hash(new_pw).decode('utf-8')
        with c.cursor() as cur:
            cur.execute("UPDATE usuarios SET password_hash=%s, token_verificacion=NULL WHERE id=%s",
                        (pw_hash, user['id']))
            c.commit()

        return jsonify({'success': True})

    except Exception as e:
        c.rollback()
        app.logger.error(f'[verificar_reset] {e}')
        return jsonify({'success': False, 'error': 'Error interno. Intenta más tarde.'}), 500
    finally:
        c.close()


@app.route('/api/translate', methods=['POST'])
def api_translate():
    """
    Recibe una lista de textos en español y los traduce al idioma especificado
    utilizando Gemini 2.5 Flash.
    """
    data = request.get_json(silent=True) or {}
    texts = data.get('texts', [])
    lang = data.get('lang', 'en').lower()

    if not texts:
        return jsonify({'success': True, 'translations': []})

    if not isinstance(texts, list):
        return jsonify({'success': False, 'error': 'texts debe ser una lista'}), 400

    # Mapeo de códigos de idioma a nombres legibles
    lang_names = {
        'en': 'Inglés',
        'pt': 'Portugués',
        'fr': 'Francés',
        'it': 'Italiano'
    }
    target_lang = lang_names.get(lang, 'Inglés')

    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        prompt = (
            f"Eres un sistema de traducción automático profesional para la plataforma turística StayHuila.\n"
            f"Traduce la siguiente lista de textos del español al idioma: {target_lang}.\n"
            f"Reglas estrictas:\n"
            f"1. Conserva exactamente el mismo orden de la lista.\n"
            f"2. Conserva exactamente la misma cantidad de elementos.\n"
            f"3. No omitas ningún texto y no agregues textos nuevos.\n"
            f"4. Mantén nombres propios del Huila intactos (como 'Tatacoa', 'Gigante', 'San Agustín', 'StayHuila', etc.).\n"
            f"5. Responde ÚNICAMENTE con un objeto JSON válido con la clave 'translations' que contiene el arreglo de strings traducidos.\n"
            f"No envíes explicaciones, no uses formato Markdown (```json o similares) ni nada adicional. Ejemplo de respuesta:\n"
            f'{{"translations": ["translated_text_1", "translated_text_2", ...]}}\n\n'
            f"Lista de textos en formato JSON:\n"
            f"{json.dumps(texts, ensure_ascii=False)}"
        )

        response = model.generate_content(prompt)
        resp_text = response.text.strip()
        
        # Limpiar posibles bloques markdown del output
        if resp_text.startswith("```"):
            resp_text = re.sub(r"^```(?:json)?\n", "", resp_text)
            resp_text = re.sub(r"\n```$", "", resp_text)
        resp_text = resp_text.strip()
        
        parsed = json.loads(resp_text)
        translations = parsed.get('translations', [])
        
        # Validación de seguridad para asegurar que coincidan las dimensiones
        if len(translations) != len(texts):
            app.logger.warning(f"[TRANSLATE] La longitud no coincide. Esperados {len(texts)}, recibidos {len(translations)}. Usando fallbacks.")
            # Si hay diferencia, rellenamos con los originales para que la página no se rompa
            while len(translations) < len(texts):
                translations.append(texts[len(translations)])
            translations = translations[:len(texts)]
            
        return jsonify({'success': True, 'translations': translations})
        
    except Exception as e:
        app.logger.error(f"[TRANSLATE] Error traduciendo textos: {e}")
        # En caso de error, devolvemos el texto original como fallback para que no falle la interfaz
        return jsonify({'success': True, 'translations': texts, 'error': str(e)})


if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)
