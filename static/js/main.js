document.addEventListener('DOMContentLoaded', () => {
    const navbar = document.getElementById('navbar');
    const categories = document.querySelector('.categories');
    
    // Scroll effect for navbar
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
            const navHeight = navbar.offsetHeight;
            categories.style.top = `${navHeight}px`;
        } else {
            navbar.classList.remove('scrolled');
            categories.style.top = '0px';
        }
    });

    // Favorite button toggle
    const favBtns = document.querySelectorAll('.favorite-btn');
    favBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // prevent clicking the card
            btn.classList.toggle('active');
            const icon = btn.querySelector('i');
            if(btn.classList.contains('active')) {
                icon.classList.remove('ph');
                icon.classList.add('ph-fill');
                icon.style.color = '#FF5A5F';
            } else {
                icon.classList.remove('ph-fill');
                icon.classList.add('ph');
                icon.style.color = 'rgba(255,255,255,0.8)';
            }
        });
    });

    // Category click active state
    const categoryItems = document.querySelectorAll('.category-item');
    categoryItems.forEach(item => {
        item.addEventListener('click', () => {
            categoryItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
        });
    });
});
