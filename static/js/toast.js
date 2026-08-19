window.showToast = function(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let iconClass = 'ph-fill ph-info';
    if (type === 'error') iconClass = 'ph-fill ph-warning-circle';
    if (type === 'success') iconClass = 'ph-fill ph-check-circle';
    
    const icon = document.createElement('i');
    icon.className = iconClass;
    const text = document.createElement('span');
    text.textContent = message;
    toast.append(icon, text);

    // Permite cerrar al hacer clic
    toast.style.cursor = 'pointer';
    toast.addEventListener('click', () => {
        toast.classList.remove('show');
        toast.classList.add('hide');
        setTimeout(() => { if (toast.parentElement) toast.remove(); }, 300);
    });

    container.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Auto-remover tras 3.2s
    setTimeout(() => {
        if (toast.parentElement) {
            toast.classList.remove('show');
            toast.classList.add('hide');
            setTimeout(() => {
                if (toast.parentElement) toast.remove();
            }, 350);
        }
    }, 3200);
};

// ── INTERCEPTOR GLOBAL DE ERRORES DE IMAGEN (StayHuila Fallback Shield) ───────
// Captura cualquier error de carga en etiquetas <img> (incluso dinámicas) y
// reemplaza la URL rota por el placeholder WebP local correspondiente.
document.addEventListener('error', function(e) {
    if (e.target && e.target.tagName === 'IMG') {
        const img = e.target;
        if (img.dataset.fallbackApplied) return;
        img.dataset.fallbackApplied = 'true';

        const src = (img.getAttribute('src') || '').toLowerCase();
        const alt = (img.getAttribute('alt') || '').toLowerCase();
        const cls = (img.className || '').toLowerCase();

        // 1. Detección de Avatar / Perfil
        if (cls.includes('avatar') || cls.includes('perfil') || src.includes('perfil') || src.includes('ui-avatars') || alt.includes('avatar')) {
            img.src = '/static/images/default_avatar.webp';
            return;
        }

        // 2. Detección de Logo
        if (cls.includes('logo') || src.includes('logo') || alt.includes('logo')) {
            img.src = '/static/images/logo.webp';
            return;
        }

        // 3. Detección de Experiencia
        if (cls.includes('exp') || src.includes('experiencia') || alt.includes('experiencia') || window.location.pathname.includes('experiencia')) {
            img.src = src.includes('thumb') ? '/static/images/default_experiencia_thumb.webp' : '/static/images/default_experiencia.webp';
            return;
        }

        // 4. Hospedajes / Publicaciones en general
        img.src = src.includes('thumb') ? '/static/images/default_hospedaje_thumb.webp' : '/static/images/default_hospedaje.webp';
    }
}, true);
