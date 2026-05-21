window.showToast = function(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let iconClass = 'ph-info';
    if (type === 'error') iconClass = 'ph-warning-circle';
    if (type === 'success') iconClass = 'ph-check-circle';
    
    const icon = document.createElement('i');
    icon.className = `ph ${iconClass}`;
    const text = document.createElement('span');
    text.textContent = message;
    toast.append(icon, text);
    container.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        toast.classList.add('hide');
        setTimeout(() => {
            if(toast.parentElement) toast.remove();
        }, 400);
    }, 3500);
};
