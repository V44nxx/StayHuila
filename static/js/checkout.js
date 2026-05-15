document.addEventListener('click', function(event) {
    var dropdown = document.getElementById('user-dropdown');
    if (dropdown && dropdown.classList.contains('show')) {
        dropdown.classList.remove('show');
    }
});

function toggleCheck(el){ 
    setTimeout(()=>{
        el.classList.toggle('done',el.querySelector('input').checked);
        checkAllDone();
    }, 50); 
}

function checkAllDone() {
    const checkboxes = document.querySelectorAll('.checklist input[type="checkbox"]');
    const allChecked = Array.from(checkboxes).every(cb => cb.checked);
    const btn = document.querySelector('.btn-co');
    if (btn) {
        if (allChecked) {
            btn.removeAttribute('disabled');
            btn.style.opacity = '1';
            btn.style.cursor = 'pointer';
            btn.innerHTML = '<i class="ph-fill ph-sign-out"></i> Confirmar Check-out y enviar reseña';
        } else {
            btn.setAttribute('disabled', 'true');
            btn.style.opacity = '0.5';
            btn.style.cursor = 'not-allowed';
            btn.innerHTML = '<i class="ph-fill ph-check-square"></i> Completa la lista de salida primero';
        }
    }
}

// Initial state
document.addEventListener('DOMContentLoaded', () => {
    checkAllDone();
});
function countChars(el){ document.getElementById('char-count').textContent = el.value.length; }
