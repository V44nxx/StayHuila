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
    const categories = document.querySelectorAll('.category-item');
    categories.forEach(category => {
        category.addEventListener('click', () => {
            // Remove active class from all
            categories.forEach(c => c.classList.remove('active'));
            // Add active class to clicked
            category.classList.add('active');
            
            // Simulate a loading state or filtering action
            const listings = document.querySelector('.listings-container');
            listings.style.opacity = '0.5';
            setTimeout(() => {
                listings.style.opacity = '1';
            }, 300);
        });
    });

    // 3. Favorite Buttons Toggle
    const favoriteBtns = document.querySelectorAll('.favorite-btn');
    favoriteBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            btn.classList.toggle('active');
            
            // Optional: change icon from outline to fill
            const icon = btn.querySelector('i');
            if(btn.classList.contains('active')) {
                icon.classList.remove('ph');
                icon.classList.add('ph-fill');
            } else {
                icon.classList.remove('ph-fill');
                icon.classList.add('ph');
            }
        });
    });

    // 4. Floating Map Button
    const mapBtn = document.querySelector('.floating-map-btn');
    if (mapBtn) {
        mapBtn.addEventListener('click', () => {
            showToast('Abriendo el mapa interactivo de Google Maps... (Mockup)');
        });
    }

    // 5. Book Now Buttons
    const bookBtns = document.querySelectorAll('.book-now-btn');
    bookBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            showToast('Redirigiendo a la pasarela de pago para el anticipo... (Mockup)');
        });
    });



    // 7. Voice Search Button (Hero)
    const voiceHeroBtn = document.querySelector('.voice-search-btn');
    if (voiceHeroBtn) {
        voiceHeroBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showToast('Escuchando... ¿A dónde te gustaría viajar en el Huila? (Mockup Voz)');
        });
    }
});
