document.addEventListener('click', function(event) {
    var dropdown = document.getElementById('user-dropdown');
    if (dropdown && dropdown.classList.contains('show')) {
        dropdown.classList.remove('show');
    }
});

function filter(estado, btn){
    document.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.reserva-card').forEach(c=>{
        if(estado==='all' || c.dataset.estado===estado) c.style.display='block';
        else c.style.display='none';
    });
}
