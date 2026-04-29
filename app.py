from flask import Flask, render_template

app = Flask(__name__)

# Datos de prueba para simular la base de datos de hospedajes
hospedajes_db = [
    {
        "id": 1,
        "name": "Cabaña en las nubes",
        "type": "Cabaña",
        "location": "San Agustín, Huila",
        "details": "Vista a la montaña • A 2km del parque",
        "price": 180000,
        "rating": 4.98,
        "reviews": 124,
        "image": "https://images.unsplash.com/photo-1518136247453-74e7b5265980?auto=format&fit=crop&q=80&w=800",
        "badge": "SuperAnfitrión",
        "discount": "-15% Hoy",
        "is_eco": False,
        "lat": 1.8833,
        "lng": -76.2667
    },
    {
        "id": 2,
        "name": "Glamping bajo las estrellas",
        "type": "Glamping",
        "location": "Villavieja (Desierto de la Tatacoa)",
        "details": "Aire acondicionado • Telescopio",
        "price": 220000,
        "rating": 4.95,
        "reviews": 89,
        "image": "https://images.unsplash.com/photo-1542315132-ce2bf3e5302f?auto=format&fit=crop&q=80&w=800",
        "badge": "",
        "discount": "",
        "is_eco": False,
        "lat": 3.2322,
        "lng": -75.1436
    },
    {
        "id": 3,
        "name": "Finca Cafetera Tradicional",
        "type": "Finca",
        "location": "Pitalito, Huila",
        "details": "Incluye tour de café • Desayuno típico",
        "price": 150000,
        "rating": 4.89,
        "reviews": 201,
        "image": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800",
        "badge": "",
        "discount": "",
        "is_eco": True,
        "lat": 1.8537,
        "lng": -76.0506
    },
    {
        "id": 4,
        "name": "Refugio frente al río",
        "type": "Cabaña",
        "location": "Yaguará, Huila",
        "details": "Acceso al embalse • Kayak incluido",
        "price": 250000,
        "rating": 5.0,
        "reviews": 42,
        "image": "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&q=80&w=800",
        "badge": "",
        "discount": "",
        "is_eco": False,
        "lat": 2.6667,
        "lng": -75.3167
    },
    {
        "id": 5,
        "name": "Eco-Lodge La Cascada",
        "type": "Lodge",
        "location": "Rivera, Huila",
        "details": "Termales privados • Masajes",
        "price": 300000,
        "rating": 4.92,
        "reviews": 56,
        "image": "https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&q=80&w=800",
        "badge": "Nuevo",
        "discount": "",
        "is_eco": True,
        "lat": 2.7778,
        "lng": -75.2556
    },
    {
        "id": 6,
        "name": "Casa Colonial Centro Histórico",
        "type": "Casa",
        "location": "Garzón, Huila",
        "details": "Arquitectura colonial • Cerca a la plaza",
        "price": 120000,
        "rating": 4.75,
        "reviews": 18,
        "image": "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=800",
        "badge": "",
        "discount": "-10% Hoy",
        "is_eco": False,
        "lat": 2.1950,
        "lng": -75.6278
    }
]

@app.route('/')
def home():
    # Mostrar solo los primeros 4 como recomendaciones
    recomendaciones = hospedajes_db[:4]
    return render_template('index.html', hospedajes=recomendaciones)

@app.route('/hospedajes')
def hospedajes():
    return render_template('hospedajes.html', hospedajes=hospedajes_db)

if __name__ == '__main__':
    app.run(debug=True)
