from flask import Blueprint, request, jsonify
import pymysql
import os
import json
import re
import logging
import google.generativeai as genai

# Crear un Blueprint para las rutas del Asistente IA
asistente_bp = Blueprint('asistente', __name__)

# Configuración de Conexión a BD local (StayHuila)
DB = dict(host='localhost', user='root', password='', database='StayHuila',
          charset='utf8mb4', cursorclass=pymysql.cursors.DictCursor)

def db():
    return pymysql.connect(**DB)

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

API_KEY = os.environ.get("GEMINI_API_KEY", "AIzaSyCmOKSELF5XKcU1wESXz130Y0Slh750j28")
genai.configure(api_key=API_KEY)

SYSTEM_INSTRUCTION = """
Eres el asistente virtual de turismo 'StayHuila IA'. Tu trabajo es entender lo que el usuario quiere y extraer los datos de búsqueda en formato JSON.

Puedes buscar TANTO hospedajes COMO experiencias. Si el usuario menciona actividades como senderismo, caminata, desierto, astronomía, kayak, avistamiento, etc., se trata de una EXPERIENCIA.
Si menciona cabaña, finca, hotel, alojamiento, habitación, etc., es un HOSPEDAJE. Si no queda claro, usa "ambos".

Municipios del Huila conocidos: Neiva, San Agustín, Villavieja, Pitalito, Yaguará, Rivera, Garzón, Campoalegre, La Plata, Isnos, Palestina, Saladoblanco, Guadalupe, Colombia, Suaza, Timaná.

Palabras clave de experiencias y sus relaciones:
- "desierto", "tatacoa" → municipio Villavieja, tipo: senderismo/caminata por el desierto
- "caminata", "senderismo", "trekking" → tipo: senderismo
- "astronomía", "estrellas" → tipo: astronomía
- "cascada", "agua" → tipo: cascadas
- "kayak", "rafting", "rio" → tipo: deportes acuáticos
- "caballo", "equitación", "cabalgata" → tipo: cabalgata
- "cultura", "arqueológico", "macizo", "estatuas" → municipio San Agustín, tipo: cultura
- "finca", "campo" → hospedaje tipo finca
- "cabaña", "rustico" → hospedaje tipo cabaña

DEBES RESPONDER ÚNICAMENTE EN FORMATO JSON VÁLIDO con esta estructura:
{
  "intencion": "hospedaje", "experiencia" o "ambos",
  "ubicacion": "nombre del municipio si se menciona, o null",
  "personas": número entero o null,
  "habitaciones": número entero o null,
  "presupuesto_maximo": número en COP o null,
  "servicios": ["wifi", "piscina", "desayuno"] (servicios mencionados, puede ser []),
  "palabras_clave": ["lista de palabras clave para buscar en nombres y descripciones"],
  "tipo_actividad": "senderismo, caminata, astronomía, cascadas, kayak, cultura, etc. o null",
  "mensaje_respuesta": "Un mensaje amable y corto diciendo qué vas a buscar."
}
"""

def get_model():
    model_names = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-flash-latest', 'gemini-pro']
    for name in model_names:
        try:
            model = genai.GenerativeModel(name, system_instruction=SYSTEM_INSTRUCTION)
            logger.info(f"Modelo iniciado: {name}")
            return model
        except Exception as e:
            logger.warning(f"No se pudo inicializar {name}: {e}")
    logger.error("No se pudo inicializar ningún modelo.")
    return None

modelo = get_model()

def extraer_json(texto):
    """Extrae el bloque JSON de una respuesta de texto que puede contener Markdown."""
    try:
        return json.loads(texto)
    except:
        match = re.search(r'```json\s*(.*?)\s*```', texto, re.DOTALL)
        if match:
            try: return json.loads(match.group(1))
            except: pass
        match = re.search(r'(\{.*?\})', texto, re.DOTALL)
        if match:
            try: return json.loads(match.group(1))
            except: pass
    return None


def buscar_hospedajes(cur, filtros):
    """Construye y ejecuta la consulta de hospedajes con todos los filtros."""
    query = """
        SELECT h.id, h.nombre, h.municipio, h.precio_noche as precio,
               h.descripcion, i.url as imagen, 'hospedaje' as tipo_resultado,
               h.calificacion
        FROM hospedajes h
        LEFT JOIN hospedaje_imagenes i ON h.id = i.hospedaje_id AND i.es_portada = 1
        WHERE h.activo = 1
    """
    params = []

    # Filtro por ubicación/municipio
    if filtros.get('ubicacion'):
        query += " AND (h.municipio LIKE %s OR h.nombre LIKE %s)"
        params += [f"%{filtros['ubicacion']}%", f"%{filtros['ubicacion']}%"]

    # Filtro por palabras clave (nombre o descripción)
    for kw in (filtros.get('palabras_clave') or []):
        query += " AND (h.nombre LIKE %s OR h.descripcion LIKE %s)"
        params += [f"%{kw}%", f"%{kw}%"]

    # Filtro tipo de actividad como keyword en nombre/descripción
    if filtros.get('tipo_actividad'):
        query += " AND (h.nombre LIKE %s OR h.descripcion LIKE %s)"
        params += [f"%{filtros['tipo_actividad']}%", f"%{filtros['tipo_actividad']}%"]

    # Filtro por capacidad
    if filtros.get('personas'):
        query += " AND h.capacidad_max >= %s"
        params.append(filtros['personas'])

    # Filtro por presupuesto
    if filtros.get('presupuesto_maximo'):
        query += " AND h.precio_noche <= %s"
        params.append(filtros['presupuesto_maximo'])

    # Filtro por servicios (buscar en descripción o campos de servicio)
    for srv in (filtros.get('servicios') or []):
        query += " AND (h.descripcion LIKE %s OR h.nombre LIKE %s)"
        params += [f"%{srv}%", f"%{srv}%"]

    query += " ORDER BY h.calificacion DESC LIMIT 5"
    cur.execute(query, tuple(params))
    return cur.fetchall()


def buscar_experiencias(cur, filtros):
    """Construye y ejecuta la consulta de experiencias con todos los filtros."""
    query = """
        SELECT e.id, e.nombre, e.municipio, e.precio_persona as precio,
               e.descripcion, i.url as imagen, 'experiencia' as tipo_resultado,
               e.calificacion
        FROM experiencias e
        LEFT JOIN experiencia_imagenes i ON e.id = i.experiencia_id AND i.es_portada = 1
        WHERE e.activo = 1
    """
    params = []

    # Filtro por ubicación/municipio
    if filtros.get('ubicacion'):
        query += " AND (e.municipio LIKE %s OR e.nombre LIKE %s)"
        params += [f"%{filtros['ubicacion']}%", f"%{filtros['ubicacion']}%"]

    # Palabras clave en nombre y descripción
    for kw in (filtros.get('palabras_clave') or []):
        query += " AND (e.nombre LIKE %s OR e.descripcion LIKE %s)"
        params += [f"%{kw}%", f"%{kw}%"]

    # Tipo de actividad como keyword
    if filtros.get('tipo_actividad'):
        query += " AND (e.nombre LIKE %s OR e.descripcion LIKE %s)"
        params += [f"%{filtros['tipo_actividad']}%", f"%{filtros['tipo_actividad']}%"]

    # Filtro por presupuesto
    if filtros.get('presupuesto_maximo'):
        query += " AND e.precio_persona <= %s"
        params.append(filtros['presupuesto_maximo'])

    query += " ORDER BY e.calificacion DESC LIMIT 5"
    cur.execute(query, tuple(params))
    return cur.fetchall()


def busqueda_fallback(cur, mensaje_usuario):
    """
    Búsqueda de respaldo cuando los filtros IA no retornan resultados.
    Extrae palabras significativas del mensaje y busca en toda la BD.
    """
    # Palabras comunes que no son útiles para buscar
    stop_words = {'quiero', 'busco', 'que', 'me', 'una', 'un', 'en', 'de', 'para',
                  'con', 'por', 'los', 'las', 'hay', 'algo', 'alguna', 'algún',
                  'donde', 'como', 'busca', 'encuentra', 'puedo', 'ir', 'ver'}
    
    palabras = [p.strip('.,!?') for p in mensaje_usuario.lower().split()
                if len(p) > 3 and p not in stop_words]
    
    resultados = []
    for palabra in palabras[:4]:  # Limitar a 4 palabras para no sobrecargar
        cur.execute("""
            SELECT h.id, h.nombre, h.municipio, h.precio_noche as precio,
                   i.url as imagen, 'hospedaje' as tipo_resultado, h.calificacion
            FROM hospedajes h
            LEFT JOIN hospedaje_imagenes i ON h.id = i.hospedaje_id AND i.es_portada = 1
            WHERE h.activo = 1 AND (h.nombre LIKE %s OR h.descripcion LIKE %s OR h.municipio LIKE %s)
            LIMIT 3
        """, (f"%{palabra}%", f"%{palabra}%", f"%{palabra}%"))
        resultados.extend(cur.fetchall())

        cur.execute("""
            SELECT e.id, e.nombre, e.municipio, e.precio_persona as precio,
                   i.url as imagen, 'experiencia' as tipo_resultado, e.calificacion
            FROM experiencias e
            LEFT JOIN experiencia_imagenes i ON e.id = i.experiencia_id AND i.es_portada = 1
            WHERE e.activo = 1 AND (e.nombre LIKE %s OR e.descripcion LIKE %s OR e.municipio LIKE %s)
            LIMIT 3
        """, (f"%{palabra}%", f"%{palabra}%", f"%{palabra}%"))
        resultados.extend(cur.fetchall())

    # Eliminar duplicados por id+tipo
    seen = set()
    unique = []
    for r in resultados:
        key = (r['id'], r['tipo_resultado'])
        if key not in seen:
            seen.add(key)
            unique.append(r)
    return unique[:6]


@asistente_bp.route('/api/asistente', methods=['POST'])
def chat_asistente():
    try:
        data = request.get_json()
        mensaje_usuario = data.get('mensaje', '')

        if not mensaje_usuario:
            return jsonify({"error": "Mensaje vacío"}), 400

        logger.info(f"Procesando mensaje: {mensaje_usuario}")

        if not modelo:
            return jsonify({"error": "Modelo no configurado"}), 500

        # 1. Enviar el mensaje a Gemini para extracción de entidades
        try:
            respuesta_gemini = modelo.generate_content(mensaje_usuario)
            texto_respuesta = respuesta_gemini.text.strip()
            logger.info(f"Respuesta Gemini: {texto_respuesta}")
        except Exception as ge:
            logger.error(f"Error en Gemini API: {ge}")
            return jsonify({"error": "Error en el servicio de IA"}), 500

        filtros = extraer_json(texto_respuesta)

        if not filtros:
            logger.error(f"No se pudo extraer JSON de: {texto_respuesta}")
            return jsonify({"error": "Error al interpretar la respuesta de la IA"}), 500

        intencion = filtros.get('intencion', 'ambos')

        # 2. Buscar en BD según intención
        c = db()
        resultados = []

        try:
            with c.cursor() as cur:
                if intencion == 'hospedaje':
                    resultados = buscar_hospedajes(cur, filtros)
                elif intencion == 'experiencia':
                    resultados = buscar_experiencias(cur, filtros)
                else:
                    # "ambos" o no determinado → buscar en los dos
                    hosp = buscar_hospedajes(cur, filtros)
                    exp  = buscar_experiencias(cur, filtros)
                    resultados = hosp + exp

                # Si no encontramos nada, hacer búsqueda de respaldo
                if not resultados:
                    logger.info("Sin resultados con filtros IA, activando fallback.")
                    resultados = busqueda_fallback(cur, mensaje_usuario)

                # Serializar decimales
                for r in resultados:
                    if r.get('precio'):
                        r['precio'] = float(r['precio'])
                    if r.get('calificacion'):
                        r['calificacion'] = float(r['calificacion'])

        finally:
            c.close()

        return jsonify({
            "mensaje_respuesta": filtros.get('mensaje_respuesta', "¡Listo! Aquí tienes algunas opciones."),
            "filtros": filtros,
            "resultados": resultados
        })

    except Exception as e:
        logger.error(f"Error en el asistente: {e}")
        return jsonify({"error": str(e)}), 500
