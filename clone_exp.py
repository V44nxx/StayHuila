import os

def replace_and_copy(src, dst, replacements):
    with open(src, 'r', encoding='utf-8') as f:
        content = f.read()
    
    for old, new in replacements.items():
        content = content.replace(old, new)
        
    with open(dst, 'w', encoding='utf-8') as f:
        f.write(content)
        
html_replacements = {
    'hospedaje': 'experiencia',
    'Hospedaje': 'Experiencia',
    'hospedajes': 'experiencias',
    'Hospedajes': 'Experiencias',
    'precio_noche': 'precio_persona',
    'noche': 'persona',
    'noches': 'personas',
    'num_habitaciones': 'duracion_horas',
    'habitaciones': 'horas de duración',
    'num_camas': 'capacidad_min',
    'camas': 'capacidad mínima',
    'num_banos': 'capacidad_max',
    'baños': 'capacidad máxima',
    'detalles del hospedaje': 'detalles de la experiencia',
    'tipo de alojamiento': 'tipo de experiencia',
    'detalle.js': 'detalle_experiencia.js',
    'detalle.css': 'detalle_experiencia.css',
    '/hospedaje/': '/experiencia/'
}

js_replacements = {
    'hospedaje': 'experiencia',
    'Hospedaje': 'Experiencia',
    'noche': 'persona',
    'noches': 'personas'
}

css_replacements = {
    'hospedaje': 'experiencia',
    'Hospedaje': 'Experiencia'
}

replace_and_copy('templates/detalle_hospedaje.html', 'templates/detalle_experiencia.html', html_replacements)
replace_and_copy('static/js/detalle.js', 'static/js/detalle_experiencia.js', js_replacements)
replace_and_copy('static/css/detalle.css', 'static/css/detalle_experiencia.css', css_replacements)

print("Files duplicated and modified.")
