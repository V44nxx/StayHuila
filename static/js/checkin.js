document.addEventListener('click', function(event) {
    var dropdown = document.getElementById('user-dropdown');
    if (dropdown && dropdown.classList.contains('show')) {
        dropdown.classList.remove('show');
    }
});

function toggleCheck(el){
    setTimeout(()=>{ 
        el.classList.toggle('done', el.querySelector('input').checked); 
        checkAllDone();
    }, 50);
}

function checkAllDone() {
    const checkboxes = document.querySelectorAll('.checklist input[type="checkbox"]');
    const allChecked = Array.from(checkboxes).every(cb => cb.checked);
    const btn = document.getElementById('ci-btn') || document.querySelector('.btn-ci');
    if (btn) {
        if (allChecked) {
            btn.removeAttribute('disabled');
            btn.style.opacity = '1';
            btn.style.cursor = 'pointer';
            btn.innerHTML = '<i class="ph-fill ph-sign-in"></i> Confirmar Check-in';
        } else {
            btn.setAttribute('disabled', 'true');
            btn.style.opacity = '0.5';
            btn.style.cursor = 'not-allowed';
            btn.innerHTML = '<i class="ph-fill ph-check-square"></i> Completa la lista de llegada primero';
        }
    }
}

// Initial state
document.addEventListener('DOMContentLoaded', () => {
    checkAllDone();
});
function copyWifi(pw){
    navigator.clipboard.writeText(pw).then(()=>{ showToast('Contraseña WiFi copiada ✓'); });
}
// Countdown
function updateCountdown(checkoutDate){
    const checkout = new Date(checkoutDate);
    const now = new Date();
    const diff = checkout - now;
    if(diff <= 0){ document.getElementById('countdown').innerHTML='<div class="cd-box"><div class="cd-num">—</div><div class="cd-label">Finalizada</div></div>'; return; }
    const days = Math.floor(diff/(1000*60*60*24));
    const hours = Math.floor((diff%(1000*60*60*24))/(1000*60*60));
    const mins = Math.floor((diff%(1000*60*60))/(1000*60));
    document.getElementById('countdown').innerHTML=`
        <div class="cd-box"><div class="cd-num">${days}</div><div class="cd-label">DÍAS</div></div>
        <div class="cd-box"><div class="cd-num">${hours}</div><div class="cd-label">HORAS</div></div>
        <div class="cd-box"><div class="cd-num">${mins}</div><div class="cd-label">MINUTOS</div></div>`;
}
