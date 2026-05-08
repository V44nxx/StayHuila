document.addEventListener('click', function(event) {
    var dropdown = document.getElementById('user-dropdown');
    if (dropdown && dropdown.classList.contains('show')) {
        dropdown.classList.remove('show');
    }
});

document.addEventListener('DOMContentLoaded', () => {
    // Leer los datos del script JSON
    const dataScript = document.getElementById('hospedajes-data');
    let hospedajes = [];
    if (dataScript) {
        hospedajes = JSON.parse(dataScript.textContent);
    }

    // Inicializar el mapa en el Huila
    const map = L.map('interactive-map').setView([2.5, -75.5], 8);

    // Capa de mapa (CartoDB Positron es más elegante y limpio)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 20
    }).addTo(map);

    let markers = [];

    // Crear marcadores personalizados con la imagen
    hospedajes.forEach(hospedaje => {
        if (hospedaje.lat && hospedaje.lng) {
            // HTML del Custom Marker (Círculo con foto)
            const customIcon = L.divIcon({
                className: 'custom-map-marker-container',
                html: `<div class="custom-map-marker"><img src="${hospedaje.image}" alt="${hospedaje.name}"></div>`,
                iconSize: [50, 50],
                iconAnchor: [25, 25],
                popupAnchor: [0, -25]
            });

            // HTML del Popup Elegante
            const popupHTML = `
                <div class="popup-card">
                    <img src="${hospedaje.image}" class="popup-img" alt="${hospedaje.name}">
                    <div class="popup-info">
                        <h4 class="popup-title">${hospedaje.name}</h4>
                        <div class="popup-rating"><i class="ph-fill ph-star" style="color: #F59E0B;"></i> ${hospedaje.rating} (${hospedaje.reviews} reseñas)</div>
                        <div class="popup-price">$${hospedaje.price.toLocaleString('es-CO')} COP / noche</div>
                    </div>
                </div>
            `;

            // Añadir marcador
            const marker = L.marker([hospedaje.lat, hospedaje.lng], { icon: customIcon })
                .addTo(map)
                .bindPopup(popupHTML);
            
            markers.push({ id: hospedaje.id, marker: marker });

            // Resaltar la tarjeta correspondiente al hacer hover en el mapa
            marker.on('mouseover', function() {
                const card = document.getElementById(`card-${hospedaje.id}`);
                if(card) {
                    card.style.transform = 'scale(1.02)';
                    card.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)';
                    card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            });

            marker.on('mouseout', function() {
                const card = document.getElementById(`card-${hospedaje.id}`);
                if(card) {
                    card.style.transform = 'scale(1)';
                    card.style.boxShadow = 'none';
                }
            });
        }
    });

    // Si hay marcadores, ajustar la vista del mapa para que quepan todos
    if (markers.length > 0) {
        const group = new L.featureGroup(markers.map(m => m.marker));
        map.fitBounds(group.getBounds(), { padding: [50, 50] });
    }
});
