from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from flask_bcrypt import Bcrypt
import pymysql
from datetime import datetime, date, timedelta
from decimal import Decimal
import random, string
# Módulo de validación y optimización de imágenes (OpenCV + Pillow)
from image_optimizer import process_image

app = Flask(__name__)
app.secret_key = 'stayhuila_secret_2024_xk9'
bcrypt = Bcrypt(app)
login_manager = LoginManager(app)
login_manager.login_view = 'login'
login_manager.login_message = 'Inicia sesión para continuar'
login_manager.login_message_category = 'info'

# --- INTEGRACIÓN ASISTENTE IA ---
import sys
import os
sys.path.append(os.path.join(app.root_path, 'asistente_ia'))
from asistente_api import asistente_bp
app.register_blueprint(asistente_bp)
# --------------------------------


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
        self.foto_perfil = d.get('foto_perfil')

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
    q = request.args.get('q', '').strip()
    huespedes = request.args.get('huespedes')
    precio_max = request.args.get('precio_max')
    
    c = db()
    try:
        with c.cursor() as cur:
            query = """
                SELECT h.*, i.url as image
                FROM hospedajes h
                LEFT JOIN hospedaje_imagenes i ON h.id = i.hospedaje_id AND i.es_portada = 1
                -- Filtrar: activos, no eliminados (soft delete) y en estado abierta
                WHERE h.activo = 1 AND h.eliminado = 0 AND h.estado = 'abierta'
            """
            params = []
            
            if q:
                query += " AND (h.municipio LIKE %s OR h.nombre LIKE %s OR h.tipo LIKE %s)"
                params.extend([f"%{q}%", f"%{q}%", f"%{q}%"])
            
            if huespedes:
                query += " AND h.capacidad_max >= %s"
                params.append(huespedes)
                
            if precio_max:
                query += " AND h.precio_noche <= %s"
                params.append(precio_max)
                
            query += " ORDER BY h.calificacion DESC"
            
            cur.execute(query, tuple(params))
            data = serialize(cur.fetchall())
        return render_template('hospedajes.html', hospedajes=data, search_query=q)
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
            hosp = serialize(hosp)
            imgs = serialize(cur.fetchall()) if False else serialize(imgs)
            sugerencias = serialize(sugerencias)
        return render_template('detalle_hospedaje.html', hospedaje=hosp,
                               imagenes=imgs, servicios=servicios,
                               resenas=resenas, sugerencias=sugerencias)
    finally:
        c.close()

# ── EXPERIENCIAS ──────────────────────────────────────────────
@app.route('/experiencias')
def experiencias():
    q = request.args.get('q', '').strip()
    precio_max = request.args.get('precio_max')
    
    c = db()
    try:
        with c.cursor() as cur:
            query = """
                SELECT e.*, i.url as image
                FROM experiencias e
                LEFT JOIN experiencia_imagenes i ON e.id = i.experiencia_id AND i.es_portada = 1
                -- Filtrar: activas, no eliminadas y disponibles
                WHERE e.activo = 1 AND e.eliminado = 0 AND e.estado = 'abierta'
            """
            params = []
            
            if q:
                query += " AND (e.municipio LIKE %s OR e.nombre LIKE %s OR e.tipo LIKE %s)"
                params.extend([f"%{q}%", f"%{q}%", f"%{q}%"])
            
            if precio_max:
                query += " AND e.precio_persona <= %s"
                params.append(precio_max)
                
            query += " ORDER BY e.calificacion DESC"
            
            cur.execute(query, tuple(params))
            data = serialize(cur.fetchall())
        return render_template('experiencias.html', experiencias=data, search_query=q)
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
            exp = serialize(exp)
            imgs = serialize(imgs)
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
        
        foto = request.files.get('foto')
        foto_url = None
        if foto and foto.filename != '':
            import os
            from werkzeug.utils import secure_filename
            filename = secure_filename(foto.filename)
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
        hid = request.form.get('hospedaje_id')
        checkin = request.form.get('checkin')
        checkout = request.form.get('checkout')
        huespedes = int(request.form.get('huespedes', 1))
        metodo = request.form.get('metodo_pago', 'tarjeta')
        notas = request.form.get('notas', '')
        c = db()
        try:
            with c.cursor() as cur:
                # Busca el hospedaje: no eliminado. Verificar activo y estado abierta por separado
                # para dar mensajes específicos al usuario
                cur.execute("SELECT * FROM hospedajes WHERE id=%s AND eliminado=0", (hid,))
                hosp = cur.fetchone()
                if not hosp:
                    flash('Hospedaje no encontrado.', 'error')
                    return redirect(url_for('hospedajes'))

                # Bloquear nuevas reservas si la publicación está deshabilitada
                if hosp.get('estado') == 'deshabilitada' or not hosp.get('activo'):
                    flash('Este hospedaje no está disponible para nuevas reservas en este momento.', 'error')
                    return redirect(url_for('detalle_hospedaje', id=hid))
                
                if hosp['anfitrion_id'] == current_user.id:
                    flash('No puedes reservar tu propia publicación.', 'error')
                    return redirect(url_for('detalle_hospedaje', id=hid))
                
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
            
        if hosp['anfitrion_id'] == current_user.id:
            flash('No puedes reservar tu propia publicación.', 'error')
            return redirect(url_for('detalle_hospedaje', id=hid))
            
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
    # Verification info
    v_tipo_doc = request.form.get('v_tipo_doc')
    v_documento = request.form.get('v_documento')
    v_telefono = request.form.get('v_telefono')

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
                    descripcion, precio_noche, capacidad_max, num_habitaciones, num_banos, hora_checkin, hora_checkout, activo, verificado)
                    VALUES(%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 1, 1)""",
                    (current_user.id, categoria, nombre, municipio, direccion, lat, lng, descripcion, precio, max_huespedes, habitaciones, banos, checkin, checkout))
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
                    
            c.commit()
            flash('¡Gracias por tu reseña!', 'success')
    except Exception as e:
        c.rollback()
        flash('Error al guardar la reseña.', 'error')
    finally:
        c.close()
        
    return redirect(f"/{tipo}/{id}")

if __name__ == '__main__':
    app.run(debug=True)
