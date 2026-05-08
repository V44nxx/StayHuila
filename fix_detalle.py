with open(r'c:\xampp\htdocs\StayHuila\templates\detalle_hospedaje.html', 'r', encoding='utf-8') as f:
    t = f.read()

replacements = [
    ('hospedaje.name', 'hospedaje.nombre'),
    ('hospedaje.rating', 'hospedaje.calificacion'),
    ('hospedaje.reviews', 'hospedaje.total_resenas'),
    ('hospedaje.host_super', 'hospedaje.super_anfitrion'),
    ('hospedaje.location', 'hospedaje.municipio ~ ", Huila"'),
    ('hospedaje.type', 'hospedaje.tipo'),
    ('hospedaje.guests', 'hospedaje.capacidad_max'),
    ('hospedaje.bedrooms', 'hospedaje.num_habitaciones'),
    ('hospedaje.beds', 'hospedaje.num_habitaciones'),
    ('hospedaje.bathrooms', 'hospedaje.num_banos'),
    ('hospedaje.policy', 'hospedaje.politica_cancelacion'),
    ('hospedaje.checkin_time', 'hospedaje.hora_checkin'),
    ('hospedaje.checkout_time', 'hospedaje.hora_checkout'),
    ('hospedaje.description', 'hospedaje.descripcion'),
    ('hospedaje.price', 'hospedaje.precio_noche'),
    ('hospedaje.discount', 'hospedaje.descuento_porcentaje'),
    ('hospedaje.is_eco', 'hospedaje.es_eco'),
    ('hospedaje.amenities', 'servicios'),
]

for old, new in replacements:
    t = t.replace('{{ ' + old + ' }}', '{{ ' + new + ' }}')
    t = t.replace('hospedaje.' + old.split('.')[-1], 'hospedaje.' + new.split('.')[-1] if '.' in new else new)

# simpler direct replacements
t = t.replace('hospedaje.nombre', 'hospedaje.nombre')

# Fix gallery: imagenes is list of dicts with .url
t = t.replace(
    '{% for img in hospedaje.images[1:5] %}',
    '{% for img_obj in imagenes[1:5] %}'
)
t = t.replace('src="{{ img }}"', 'src="{{ img_obj.url }}"')
t = t.replace('hospedaje.images[0]', 'imagenes[0].url if imagenes else ""')
t = t.replace('hospedaje.images|length', 'imagenes|length')
t = t.replace('hospedaje.images', 'imagenes | map(attribute="url") | list')

# host fields
t = t.replace('hospedaje.host_name', 'hospedaje.anf_nombre ~ " " ~ hospedaje.anf_apellido')
t = t.replace('hospedaje.host_img', 'hospedaje.anf_foto or "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"')
t = t.replace('hospedaje.host_since', '"2021"')
t = t.replace('hospedaje.host_reviews', 'hospedaje.anf_res or hospedaje.total_resenas')
t = t.replace('hospedaje.host_rating', 'hospedaje.anf_cal or hospedaje.calificacion')
t = t.replace('hospedaje.host_super', 'hospedaje.super_anfitrion')

# JS data block fixes
t = t.replace('"price_weekend": {{ hospedaje.precio_fin_semana or hospedaje.precio_noche }}',
              '"price_weekend": {{ hospedaje.precio_fin_semana or hospedaje.precio_noche or hospedaje.precio_noche }}')

# sugerencias fields
t = t.replace('s.image', 's.image or ""')
t = t.replace('s.name', 's.nombre')
t = t.replace('s.rating', 's.calificacion')
t = t.replace('s.location', 's.municipio ~ ", Huila"')
t = t.replace('s.details', 's.descripcion_corta or s.tipo')
t = t.replace('s.price', 's.precio_noche')
t = t.replace('s.is_eco', 's.es_eco')
t = t.replace('s.badge', '""')

with open(r'c:\xampp\htdocs\StayHuila\templates\detalle_hospedaje.html', 'w', encoding='utf-8') as f:
    f.write(t)
print('Done - detalle_hospedaje.html updated')
