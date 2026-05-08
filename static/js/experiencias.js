document.addEventListener('click', function(event) {
    var dropdown = document.getElementById('user-dropdown');
    if (dropdown && dropdown.classList.contains('show')) {
        dropdown.classList.remove('show');
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const dataScript = document.getElementById('experiencias-data');
    let experiencias = [];
    if (dataScript) {
        experiencias = JSON.parse(dataScript.textContent);
    }

    const map = L.map('interactive-map').setView([2.5, -75.5], 8);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 20
    }).addTo(map);

    let markers = [];

    experiencias.forEach(exp => {
        // En la base de datos las columnas se llaman latitud y longitud
        let lat = exp.latitud || exp.lat;
        let lng = exp.longitud || exp.lng;
        
        if (lat && lng) {
            const customIcon = L.divIcon({
                className: 'custom-map-marker-container',
                html: `<div class="custom-map-marker"><img src="${exp.image || 'https://images.unsplash.com/photo-1533130061792-64b345e4a833?w=500'}" alt="${exp.nombre}"></div>`,
                iconSize: [50, 50],
                iconAnchor: [25, 25],
                popupAnchor: [0, -25]
            });

            const price = exp.precio_persona || exp.precio || 0;
            const rating = exp.calificacion || '5.0';
            const reviews = exp.total_resenas || 0;

            const popupHTML = `
                <div class="popup-card">
                    <img src="${exp.image || 'https://images.unsplash.com/photo-1533130061792-64b345e4a833?w=500'}" class="popup-img" alt="${exp.nombre}">
                    <div class="popup-info">
                        <h4 class="popup-title">${exp.nombre}</h4>
                        <div class="popup-rating"><i class="ph-fill ph-star" style="color: #F59E0B;"></i> ${rating} (${reviews} reseñas)</div>
                        <div class="popup-price">$${parseFloat(price).toLocaleString('es-CO')} COP / persona</div>
                    </div>
                </div>
            `;

            const marker = L.marker([lat, lng], { icon: customIcon })
                .addTo(map)
                .bindPopup(popupHTML);
            
            markers.push({ id: exp.id, marker: marker });

            marker.on('mouseover', function() {
                const card = document.getElementById(`card-${exp.id}`);
                if(card) {
                    card.style.transform = 'scale(1.02)';
                    card.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)';
                    card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            });

            marker.on('mouseout', function() {
                const card = document.getElementById(`card-${exp.id}`);
                if(card) {
                    card.style.transform = 'scale(1)';
                    card.style.boxShadow = 'none';
                }
            });
        }
    });

    if (markers.length > 0) {
        const group = new L.featureGroup(markers.map(m => m.marker));
        map.fitBounds(group.getBounds(), { padding: [50, 50] });
    }
});
