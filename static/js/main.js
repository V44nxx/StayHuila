document.addEventListener('DOMContentLoaded', () => {
    // 1. Navbar Scroll Effect
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // 2. Categories Selection
    // Handled in index.html with dynamic filtering

    // 3. Favorite Buttons Toggle
    const favoriteBtns = document.querySelectorAll('.favorite-btn, #btn-favorito');
    favoriteBtns.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            let id = btn.getAttribute('data-id');
            let tipo = btn.getAttribute('data-tipo');

            if(!id) {
                // Try to infer from closest card or URL
                const card = btn.closest('.listing-card');
                if(card && card.id) {
                    const parts = card.id.split('-');
                    // Format could be card-12 or card-h-12
                    id = parts[parts.length - 1];
                    if (window.location.pathname.includes('experiencias')) {
                        tipo = 'experiencia';
                    } else {
                        tipo = 'hospedaje';
                    }
                } else if(window.location.pathname.startsWith('/hospedaje/')) {
                    id = window.location.pathname.split('/')[2];
                    tipo = 'hospedaje';
                } else if(window.location.pathname.startsWith('/experiencia/')) {
                    id = window.location.pathname.split('/')[2];
                    tipo = 'experiencia';
                }
            }
            
            if(!id || !tipo) return;

            try {
                const res = await fetch('/api/favoritos/toggle', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: id, tipo: tipo })
                });
                
                // If not authenticated or other HTML response (like redirect to login)
                if(!res.ok && res.redirected) {
                    window.location.href = res.url;
                    return;
                }
                
                const data = await res.json();
                
                if(data.success) {
                    btn.classList.toggle('active');
                    const icon = btn.querySelector('i');
                    if(data.status === 'added') {
                        icon.classList.remove('ph');
                        icon.classList.add('ph-fill');
                        icon.style.color = '#ff385c';
                        if(btn.id === 'btn-favorito') btn.innerHTML = '<i class="ph-fill ph-heart" style="color: #ff385c;"></i> Guardado';
                    } else {
                        icon.classList.remove('ph-fill');
                        icon.classList.add('ph');
                        icon.style.color = '';
                        if(btn.id === 'btn-favorito') btn.innerHTML = '<i class="ph ph-heart"></i> Guardar';
                    }
                } else {
                    if(data.error === 'No autenticado' || res.status === 401) {
                        window.location.href = '/login';
                    } else if (data.error) {
                        alert(data.error);
                    } else {
                        window.location.href = '/login';
                    }
                }
            } catch(error) {
                console.error("Error al guardar favorito:", error);
                // Posiblemente no esté logueado y devuelva el HTML del login
                window.location.href = '/login';
            }
        });
    });

    // 4. Floating Map Button (Moved to inline script for Leaflet)
    const mapBtn = document.querySelector('.floating-map-btn');
    if (mapBtn) {
        // Handled in index.html now
    }

    // 5. Book Now Buttons
    const bookBtns = document.querySelectorAll('.book-now-btn');
    bookBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            showToast('Redirigiendo a la pasarela de pago para el anticipo... (Mockup)');
        });
    });




});
