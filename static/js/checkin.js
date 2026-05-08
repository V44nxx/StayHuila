document.addEventListener('click', function(event) {
    var dropdown = document.getElementById('user-dropdown');
    if (dropdown && dropdown.classList.contains('show')) {
        dropdown.classList.remove('show');
    }
});

function toggleCheck(el){
    setTimeout(()=>{ el.classList.toggle('done', el.querySelector('input').checked); }, 50);
}
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
