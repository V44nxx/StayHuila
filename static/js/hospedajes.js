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

    // Capa de mapa (OSM Estándar es más confiable)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
    }).addTo(map);

    // Forzar redibujado después de un breve delay para asegurar que el contenedor tenga tamaño
    setTimeout(() => {
        map.invalidateSize();
    }, 500);

    let markers = [];

    // Crear marcadores personalizados con la imagen
    hospedajes.forEach(hospedaje => {
        // En la BD las columnas son latitud y longitud
        const lat = hospedaje.latitud || hospedaje.lat;
        const lng = hospedaje.longitud || hospedaje.lng;

        if (lat && lng) {
            // HTML del Custom Marker (Círculo con foto)
            const customIcon = L.divIcon({
                className: 'custom-map-marker-container',
                html: `<div class="custom-map-marker"><img src="${hospedaje.image || 'https://via.placeholder.com/50'}" alt="${hospedaje.nombre}"></div>`,
                iconSize: [50, 50],
                iconAnchor: [25, 25],
                popupAnchor: [0, -25]
            });

    const popupHTML = `
        <div class="popup-card">
            <img src="${hospedaje.image || 'https://via.placeholder.com/200x120'}" class="popup-img" alt="${hospedaje.nombre}">
            <div class="popup-info">
                <h4 class="popup-title">${hospedaje.nombre}</h4>
                <div class="popup-rating"><i class="ph-fill ph-star" style="color: #F59E0B;"></i> ${hospedaje.calificacion || 0} (${hospedaje.total_resenas || 0} reseñas)</div>
                <div class="popup-price">$${(hospedaje.precio_noche || 0).toLocaleString('es-CO')} COP / noche</div>
                <a href="/hospedaje/${hospedaje.id}" style="display:block; margin-top:8px; text-align:center; background:var(--primary); color:white; text-decoration:none; padding:5px; border-radius:5px; font-size:0.8rem;">Ver detalles</a>
            </div>
        </div>
    `;

            // Añadir marcador
            const marker = L.marker([lat, lng], { icon: customIcon })
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
