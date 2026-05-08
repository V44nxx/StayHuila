from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from flask_bcrypt import Bcrypt
import pymysql
from datetime import datetime, date, timedelta
from decimal import Decimal
import random, string

app = Flask(__name__)
app.secret_key = 'stayhuila_secret_2024_xk9'
bcrypt = Bcrypt(app)
login_manager = LoginManager(app)
login_manager.login_view = 'login'
login_manager.login_message = 'Inicia sesión para continuar'
login_manager.login_message_category = 'info'

DB = dict(host='localhost', user='root', password='', database='StayHuila',
          charset='utf8mb4', cursorclass=pymysql.cursors.DictCursor)

def db():
    return pymysql.connect(**DB)

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
    if isinstance(obj, Decimal):
        return float(obj)
    return obj

class User(UserMixin):
    def __init__(self, d):
        self.id = d['id']; self.nombre = d['nombre']; self.apellido = d['apellido']
        self.email = d['email']; self.tipo = d['tipo']; self.puntos = d['puntos_gamificacion']
        self.foto = d.get('foto_perfil')

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

# ── HOME ──────────────────────────────────────────────────────
@app.route('/')
def home():
    c = db()
    try:
        with c.cursor() as cur:
            cur.execute("""SELECT h.*,i.url as image FROM hospedajes h
                LEFT JOIN hospedaje_imagenes i ON h.id=i.hospedaje_id AND i.es_portada=1
                WHERE h.activo=1 AND h.verificado=1 ORDER BY h.destacado DESC,h.calificacion DESC LIMIT 6""")
            hospedajes = serialize(cur.fetchall())
        return render_template('index.html', hospedajes=hospedajes)
    finally:
        c.close()

# ── HOSPEDAJES ────────────────────────────────────────────────
@app.route('/hospedajes')
def hospedajes():
    c = db()
    try:
        with c.cursor() as cur:
            cur.execute("""SELECT h.*,i.url as image FROM hospedajes h
                LEFT JOIN hospedaje_imagenes i ON h.id=i.hospedaje_id AND i.es_portada=1
                WHERE h.activo=1 ORDER BY h.calificacion DESC""")
            data = serialize(cur.fetchall())
        return render_template('hospedajes.html', hospedajes=data)
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
                LEFT JOIN anfitriones a ON u.id=a.usuario_id WHERE h.id=%s AND h.activo=1""", (id,))
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
                WHERE h.id!=%s AND h.activo=1 ORDER BY RAND() LIMIT 3""", (id,))
            sugerencias = cur.fetchall()
            hosp = serialize(hosp)
            imgs = serialize(cur.fetchall()) if False else serialize(imgs)
            resenas = serialize(resenas)
            sugerencias = serialize(sugerencias)
        return render_template('detalle_hospedaje.html', hospedaje=hosp,
                               imagenes=imgs, servicios=servicios,
                               resenas=resenas, sugerencias=sugerencias)
    finally:
        c.close()

# ── EXPERIENCIAS ──────────────────────────────────────────────
@app.route('/experiencias')
def experiencias():
    c = db()
    try:
        with c.cursor() as cur:
            cur.execute("""SELECT e.*,i.url as image FROM experiencias e
                LEFT JOIN experiencia_imagenes i ON e.id=i.experiencia_id AND i.es_portada=1
                WHERE e.activo=1 ORDER BY e.calificacion DESC""")
            data = serialize(cur.fetchall())
        return render_template('experiencias.html', experiencias=data)
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
                LEFT JOIN anfitriones a ON u.id=a.usuario_id WHERE e.id=%s AND e.activo=1""", (id,))
            exp = cur.fetchone()
            if not exp:
                return redirect(url_for('experiencias'))
            cur.execute("SELECT * FROM experiencia_imagenes WHERE experiencia_id=%s ORDER BY orden", (id,))
            imgs = cur.fetchall()
            cur.execute("""SELECT r.*,u.nombre,u.apellido,u.foto_perfil FROM resenas r
                JOIN usuarios u ON r.usuario_id=u.id
                WHERE r.hospedaje_id=%s AND r.tipo='experiencia' AND r.publicada=1 ORDER BY r.fecha_resena DESC LIMIT 6""", (id,))
            resenas = cur.fetchall()
            cur.execute("""SELECT e.*,i.url as image FROM experiencias e
                LEFT JOIN experiencia_imagenes i ON e.id=i.experiencia_id AND i.es_portada=1
                WHERE e.id!=%s AND e.activo=1 ORDER BY RAND() LIMIT 3""", (id,))
            sugerencias = cur.fetchall()
            exp = serialize(exp)
            imgs = serialize(imgs)
            resenas = serialize(resenas)
            sugerencias = serialize(sugerencias)
        return render_template('detalle_experiencia.html', experiencia=exp,
                               imagenes=imgs, resenas=resenas, sugerencias=sugerencias)
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

@app.route('/perfil', methods=['GET', 'POST'])
@login_required
def perfil():
    if request.method == 'POST':
        nombre = request.form.get('nombre', '').strip()
        apellido = request.form.get('apellido', '').strip()
        telefono = request.form.get('telefono', '').strip()
        new_pw = request.form.get('new_password', '')
        conf_pw = request.form.get('confirm_password', '')
        
        c = db()
        try:
            with c.cursor() as cur:
                if new_pw:
                    if new_pw == conf_pw and len(new_pw) >= 6:
                        pw_hash = bcrypt.generate_password_hash(new_pw).decode('utf-8')
                        cur.execute("UPDATE usuarios SET nombre=%s, apellido=%s, telefono=%s, password_hash=%s WHERE id=%s",
                                   (nombre, apellido, telefono, pw_hash, current_user.id))
                        flash('Perfil y contraseña actualizados con éxito', 'success')
                    else:
                        flash('Las contraseñas no coinciden o es muy corta (min 6)', 'error')
                        return redirect(url_for('perfil'))
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

@app.route('/favoritos')
@login_required
def favoritos():
    # Placeholder: currently there's no favorites table, so we just flash a message and redirect to hospedajes
    flash('La función de favoritos estará disponible muy pronto.', 'info')
    return redirect(url_for('hospedajes'))

# ── RESERVAR ──────────────────────────────────────────────────
@app.route('/reservar', methods=['GET', 'POST'])
@login_required
def reservar():
    if request.method == 'POST':
        hid = request.form.get('hospedaje_id')
        checkin = request.form.get('checkin')
        checkout = request.form.get('checkout')
        huespedes = int(request.form.get('huespedes', 1))
        metodo = request.form.get('metodo_pago', 'tarjeta')
        notas = request.form.get('notas', '')
        c = db()
        try:
            with c.cursor() as cur:
                cur.execute("SELECT * FROM hospedajes WHERE id=%s AND activo=1", (hid,))
                hosp = cur.fetchone()
                if not hosp:
                    flash('Hospedaje no encontrado', 'error')
                    return redirect(url_for('hospedajes'))
                fi = datetime.strptime(checkin, '%Y-%m-%d').date()
                fo = datetime.strptime(checkout, '%Y-%m-%d').date()
                noches = (fo - fi).days
                if noches < 1:
                    flash('Las fechas no son válidas', 'error')
                    return redirect(request.referrer)
                # Verificar disponibilidad
                cur.execute("""SELECT id FROM reservas WHERE hospedaje_id=%s AND estado NOT IN ('cancelada')
                    AND NOT (fecha_checkout <= %s OR fecha_checkin >= %s)""", (hid, checkin, checkout))
                if cur.fetchone():
                    flash('Las fechas seleccionadas no están disponibles', 'error')
                    return redirect(request.referrer)
                precio_base = float(hosp['precio_noche']) * noches
                descuento = round(precio_base * hosp['descuento_porcentaje'] / 100, 2) if hosp['descuento_porcentaje'] else 0
                tarifa = round((precio_base - descuento) * 0.14, 2)
                total = precio_base - descuento + tarifa
                codigo = gen_code()
                cur.execute("""INSERT INTO reservas(codigo_reserva,usuario_id,tipo,hospedaje_id,
                    fecha_checkin,fecha_checkout,num_huespedes,precio_base,tarifa_servicio,
                    descuento,total,estado,metodo_pago,estado_pago,notas_huesped,fecha_confirmacion)
                    VALUES(%s,%s,'hospedaje',%s,%s,%s,%s,%s,%s,%s,%s,'confirmada',%s,'pagado',%s,NOW())""",
                    (codigo, current_user.id, hid, checkin, checkout, huespedes,
                     precio_base, tarifa, descuento, total, metodo, notas))
                rid = cur.lastrowid
                # Bloquear disponibilidad
                cur.execute("""INSERT INTO hospedaje_disponibilidad(hospedaje_id,fecha_inicio,fecha_fin,motivo)
                    VALUES(%s,%s,%s,'reservado')""", (hid, checkin, checkout))
                # Puntos gamificación
                cur.execute("UPDATE usuarios SET puntos_gamificacion=puntos_gamificacion+50 WHERE id=%s", (current_user.id,))
                c.commit()
            return redirect(url_for('confirmacion', id=rid))
        except Exception as e:
            c.rollback()
            flash('Error al procesar la reserva: ' + str(e), 'error')
            return redirect(request.referrer)
        finally:
            c.close()

    # GET: mostrar formulario de pago
    hid = request.args.get('id')
    checkin = request.args.get('checkin', '')
    checkout = request.args.get('checkout', '')
    huespedes = int(request.args.get('huespedes', 1))
    now = date.today().isoformat()
    c = db()
    try:
        with c.cursor() as cur:
            cur.execute("""SELECT h.*,i.url as image,u.nombre as anf_nombre,u.foto_perfil as anf_foto
                FROM hospedajes h LEFT JOIN hospedaje_imagenes i ON h.id=i.hospedaje_id AND i.es_portada=1
                JOIN usuarios u ON h.anfitrion_id=u.id WHERE h.id=%s""", (hid,))
            hosp = cur.fetchone()
        if not hosp:
            return redirect(url_for('hospedajes'))
        noches = 0
        if checkin and checkout:
            fi = datetime.strptime(checkin, '%Y-%m-%d').date()
            fo = datetime.strptime(checkout, '%Y-%m-%d').date()
            noches = (fo - fi).days
        precio_base = float(hosp['precio_noche']) * noches if noches else 0
        descuento = round(precio_base * hosp['descuento_porcentaje'] / 100, 2) if hosp.get('descuento_porcentaje') else 0
        tarifa = round((precio_base - descuento) * 0.14, 2)
        total = precio_base - descuento + tarifa
        return render_template('reservar.html', hosp=hosp, checkin=checkin, checkout=checkout,
                               huespedes=huespedes, noches=noches, precio_base=precio_base,
                               descuento=descuento, tarifa=tarifa, total=total, now=now)
    finally:
        c.close()

# ── CONFIRMACIÓN ──────────────────────────────────────────────
@app.route('/reserva/<int:id>')
@login_required
def confirmacion(id):
    c = db()
    try:
        with c.cursor() as cur:
            cur.execute("""SELECT r.*,h.nombre as hosp_nombre,h.municipio,h.hora_checkin,h.hora_checkout,
                h.instrucciones_llegada,h.wifi_nombre,h.wifi_password,
                i.url as hosp_img, u.nombre as anf_nombre, u.foto_perfil as anf_foto
                FROM reservas r JOIN hospedajes h ON r.hospedaje_id=h.id
                LEFT JOIN hospedaje_imagenes i ON h.id=i.hospedaje_id AND i.es_portada=1
                JOIN usuarios u ON h.anfitrion_id=u.id
                WHERE r.id=%s AND r.usuario_id=%s""", (id, current_user.id))
            reserva = cur.fetchone()
        if not reserva:
            return redirect(url_for('mis_reservas'))
        return render_template('confirmacion.html', reserva=reserva)
    finally:
        c.close()

# ── MIS RESERVAS ──────────────────────────────────────────────
@app.route('/mis-reservas')
@login_required
def mis_reservas():
    c = db()
    try:
        with c.cursor() as cur:
            cur.execute("""SELECT r.*,h.nombre as hosp_nombre,h.municipio,h.hora_checkin,h.hora_checkout,
                i.url as hosp_img FROM reservas r JOIN hospedajes h ON r.hospedaje_id=h.id
                LEFT JOIN hospedaje_imagenes i ON h.id=i.hospedaje_id AND i.es_portada=1
                WHERE r.usuario_id=%s ORDER BY r.fecha_reserva DESC""", (current_user.id,))
            reservas = cur.fetchall()
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
            cur.execute("""SELECT r.*,h.nombre as hosp_nombre,h.municipio,h.hora_checkin,
                h.instrucciones_llegada,h.wifi_nombre,h.wifi_password,h.direccion_detalle,
                i.url as hosp_img,u.nombre as anf_nombre,u.telefono as anf_tel,u.foto_perfil as anf_foto
                FROM reservas r JOIN hospedajes h ON r.hospedaje_id=h.id
                LEFT JOIN hospedaje_imagenes i ON h.id=i.hospedaje_id AND i.es_portada=1
                JOIN usuarios u ON h.anfitrion_id=u.id
                WHERE r.id=%s AND r.usuario_id=%s""", (id, current_user.id))
            reserva = cur.fetchone()
        if not reserva:
            flash('Reserva no encontrada', 'error')
            return redirect(url_for('mis_reservas'))
        if reserva['estado'] not in ('confirmada', 'checkin'):
            flash('Esta reserva no está disponible para check-in', 'error')
            return redirect(url_for('mis_reservas'))
        if request.method == 'POST':
            c2 = db()
            try:
                with c2.cursor() as cur2:
                    cur2.execute("""UPDATE reservas SET estado='checkin',fecha_checkin_real=NOW()
                        WHERE id=%s AND usuario_id=%s""", (id, current_user.id))
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
            cur.execute("""SELECT r.*,h.nombre as hosp_nombre,h.municipio,h.hora_checkout,
                i.url as hosp_img,u.nombre as anf_nombre,u.foto_perfil as anf_foto
                FROM reservas r JOIN hospedajes h ON r.hospedaje_id=h.id
                LEFT JOIN hospedaje_imagenes i ON h.id=i.hospedaje_id AND i.es_portada=1
                JOIN usuarios u ON h.anfitrion_id=u.id
                WHERE r.id=%s AND r.usuario_id=%s""", (id, current_user.id))
            reserva = cur.fetchone()
        if not reserva:
            flash('Reserva no encontrada', 'error')
            return redirect(url_for('mis_reservas'))
        if reserva['estado'] != 'checkin':
            flash('Solo puedes hacer checkout después del check-in', 'error')
            return redirect(url_for('mis_reservas'))
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
                    cur2.execute("""UPDATE reservas SET estado='completada',fecha_checkout_real=NOW()
                        WHERE id=%s AND usuario_id=%s""", (id, current_user.id))
                    if cal_gen:
                        cur2.execute("""INSERT INTO resenas(reserva_id,usuario_id,tipo,hospedaje_id,
                            calificacion_general,calificacion_limpieza,calificacion_ubicacion,
                            calificacion_comunicacion,calificacion_valor,comentario)
                            VALUES(%s,%s,'hospedaje',%s,%s,%s,%s,%s,%s,%s)
                            ON DUPLICATE KEY UPDATE calificacion_general=%s,comentario=%s""",
                            (id, current_user.id, reserva['hospedaje_id'],
                             cal_gen, cal_limp, cal_ubi, cal_com, cal_val, comentario,
                             cal_gen, comentario))
                        # Actualizar calificación promedio del hospedaje
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
            cur.execute("""SELECT h.*,i.url as image FROM hospedajes h
                LEFT JOIN hospedaje_imagenes i ON h.id=i.hospedaje_id AND i.es_portada=1
                WHERE h.anfitrion_id=%s ORDER BY h.fecha_creacion DESC""", (current_user.id,))
            mis_hospedajes = cur.fetchall()

            cur.execute("""SELECT e.*,i.url as image FROM experiencias e
                LEFT JOIN experiencia_imagenes i ON e.id=i.experiencia_id AND i.es_portada=1
                WHERE e.anfitrion_id=%s ORDER BY e.fecha_creacion DESC""", (current_user.id,))
            mis_experiencias = cur.fetchall()

            ids = [h['id'] for h in mis_hospedajes]
            reservas_recientes = []
            stats = {'ingresos': 0, 'total_res': 0, 'pendientes': 0}
            if ids:
                fmt = ','.join(['%s'] * len(ids))
                cur.execute(f"""SELECT r.*,u.nombre,u.apellido,u.email,h.nombre as hosp_nombre,
                    h.hora_checkin,h.hora_checkout FROM reservas r
                    JOIN usuarios u ON r.usuario_id=u.id
                    JOIN hospedajes h ON r.hospedaje_id=h.id
                    WHERE r.hospedaje_id IN ({fmt}) ORDER BY r.fecha_reserva DESC LIMIT 15""", ids)
                reservas_recientes = cur.fetchall()
                cur.execute(f"""SELECT COALESCE(SUM(total),0) as ingresos,
                    COUNT(*) as total_res,
                    SUM(CASE WHEN estado='confirmada' THEN 1 ELSE 0 END) as pendientes
                    FROM reservas WHERE hospedaje_id IN ({fmt})
                    AND estado NOT IN ('cancelada')""", ids)
                stats = cur.fetchone()
        return render_template('panel_anfitrion.html', mis_hospedajes=mis_hospedajes,
                               mis_experiencias=mis_experiencias, reservas_recientes=reservas_recientes, stats=stats)
    finally:
        c.close()

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
    
    max_huespedes = request.form.get('max_huespedes', 2)
    habitaciones = request.form.get('habitaciones', 1)
    banos = request.form.get('banos', 1)
    checkin = request.form.get('checkin', '15:00')
    checkout = request.form.get('checkout', '11:00')

    # Specific to Experiencias
    e_cap_min = request.form.get('e_cap_min', 1)
    e_duracion = request.form.get('e_duracion', 4)
    e_nivel = request.form.get('e_nivel', 'moderado')
    e_incluye = request.form.get('e_incluye', '')
    e_traer = request.form.get('e_traer', '')
    
    files = request.files.getlist('fotos')
    
    c = db()
    try:
        with c.cursor() as cur:
            if tipo == 'hospedaje':
                cur.execute("""INSERT INTO hospedajes(anfitrion_id, tipo, nombre, municipio, direccion_detalle, latitud, longitud, 
                    descripcion, precio_noche, capacidad_max, num_habitaciones, num_banos, hora_checkin, hora_checkout, activo, verificado)
                    VALUES(%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 1, 0)""",
                    (current_user.id, categoria, nombre, municipio, direccion, lat, lng, descripcion, precio, max_huespedes, habitaciones, banos, checkin, checkout))
                pub_id = cur.lastrowid
                
                if files and files[0].filename != '':
                    for idx, f in enumerate(files):
                        if f.filename:
                            filename = secure_filename(f.filename)
                            os.makedirs(os.path.join(app.root_path, 'static', 'uploads'), exist_ok=True)
                            path = os.path.join(app.root_path, 'static', 'uploads', filename)
                            f.save(path)
                            url = f"/static/uploads/{filename}"
                            cur.execute("INSERT INTO hospedaje_imagenes(hospedaje_id, url, es_portada, orden) VALUES(%s, %s, %s, %s)",
                                (pub_id, url, 1 if idx == 0 else 0, idx))
                else:
                    cur.execute("INSERT INTO hospedaje_imagenes(hospedaje_id, url, es_portada) VALUES(%s, %s, 1)", 
                        (pub_id, "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=500"))
            else:
                cur.execute("""INSERT INTO experiencias(anfitrion_id, tipo, nombre, municipio, latitud, longitud, 
                    descripcion, precio_persona, capacidad_min, capacidad_max, duracion_horas, nivel_dificultad, que_incluye, que_traer, activo, verificado)
                    VALUES(%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 1, 0)""",
                    (current_user.id, categoria, nombre, municipio, lat, lng, descripcion, precio, e_cap_min, max_huespedes, e_duracion, e_nivel, e_incluye, e_traer))
                pub_id = cur.lastrowid
                
                if files and files[0].filename != '':
                    for idx, f in enumerate(files):
                        if f.filename:
                            filename = secure_filename(f.filename)
                            os.makedirs(os.path.join(app.root_path, 'static', 'uploads'), exist_ok=True)
                            path = os.path.join(app.root_path, 'static', 'uploads', filename)
                            f.save(path)
                            url = f"/static/uploads/{filename}"
                            cur.execute("INSERT INTO experiencia_imagenes(experiencia_id, url, es_portada, orden) VALUES(%s, %s, %s, %s)",
                                (pub_id, url, 1 if idx == 0 else 0, idx))
                else:
                    cur.execute("INSERT INTO experiencia_imagenes(experiencia_id, url, es_portada) VALUES(%s, %s, 1)", 
                        (pub_id, "https://images.unsplash.com/photo-1533130061792-64b345e4a833?w=500"))
            
            if current_user.tipo not in ('anfitrion', 'admin'):
                cur.execute("UPDATE usuarios SET tipo='anfitrion' WHERE id=%s", (current_user.id,))
                cur.execute("INSERT INTO anfitriones(usuario_id) VALUES(%s)", (current_user.id,))
                current_user.tipo = 'anfitrion'

            c.commit()
        return jsonify({"success": True})
    except Exception as e:
        c.rollback()
        return jsonify({"success": False, "error": str(e)})
    finally:
        c.close()

# ── API DISPONIBILIDAD ────────────────────────────────────────
@app.route('/api/disponibilidad/<int:id>')
def disponibilidad(id):
    c = db()
    try:
        with c.cursor() as cur:
            cur.execute("""SELECT fecha_checkin,fecha_checkout FROM reservas
                WHERE hospedaje_id=%s AND estado NOT IN ('cancelada')
                AND fecha_checkout >= CURDATE()""", (id,))
            rows = cur.fetchall()
        bloqueadas = []
        for r in rows:
            fi = r['fecha_checkin']
            fo = r['fecha_checkout']
            current = fi
            while current < fo:
                bloqueadas.append(current.isoformat())
                from datetime import timedelta
                current += timedelta(days=1)
        return jsonify({'bloqueadas': bloqueadas})
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
                WHERE (h.nombre LIKE %s OR h.municipio LIKE %s) AND h.activo=1
                UNION ALL
                SELECT e.id,e.nombre,e.municipio,e.precio_persona as precio,'experiencia' as tipo,i.url as imagen
                FROM experiencias e LEFT JOIN experiencia_imagenes i ON e.id=i.experiencia_id AND i.es_portada=1
                WHERE (e.nombre LIKE %s OR e.municipio LIKE %s) AND e.activo=1 LIMIT 8""",
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
                    filename = secure_filename(file.filename)
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
                if not contenido:
                    return jsonify({'success': False, 'error': 'Comentario vacío'}), 400
                    
                cur.execute("INSERT INTO comunidad_comentarios (post_id, usuario_id, contenido) VALUES (%s, %s, %s)",
                    (post_id, current_user.id, contenido))
                c.commit()
                return jsonify({'success': True})
    finally:
        c.close()

if __name__ == '__main__':
    app.run(debug=True)
