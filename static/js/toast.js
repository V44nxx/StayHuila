window.showToast = function(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
    
    const toast = document.createElement('div');
    toast.className = 	oast ;
    
    let iconClass = 'ph-info';
    if (type === 'error') iconClass = 'ph-warning-circle';
    if (type === 'success') iconClass = 'ph-check-circle';
    
    toast.innerHTML = <i class="ph "></i> <span></span>;
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
