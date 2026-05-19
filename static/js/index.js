document.addEventListener('click', function (event) {
    var dropdown = document.getElementById('user-dropdown');
    if (dropdown && dropdown.classList.contains('show')) {
        dropdown.classList.remove('show');
    }
});

/* ── Búsqueda del hero ── */
function doSearch() {
    var q       = (document.getElementById('sh-q')       || {}).value || '';
    var checkin = (document.getElementById('sh-checkin') || {}).value || '';
    var checkout= (document.getElementById('sh-checkout')|| {}).value || '';
    var guests  = (document.getElementById('sh-guests')  || {}).value || '';

    if (checkin && checkout && checkin >= checkout) {
        alert('La fecha de salida debe ser posterior a la de llegada.');
        return;
    }

    var params = new URLSearchParams();
    if (q.trim())  params.set('q', q.trim());
    if (checkin)   params.set('checkin', checkin);
    if (checkout)  params.set('checkout', checkout);
    if (guests)    params.set('huespedes', guests);

    window.location.href = '/hospedajes?' + params.toString();
}

document.addEventListener('DOMContentLoaded', function () {
    var submitBtn = document.getElementById('sh-submit');
    if (submitBtn) submitBtn.addEventListener('click', doSearch);

    var qInput = document.getElementById('sh-q');
    if (qInput) qInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') doSearch();
    });

    // Validar checkout > checkin en tiempo real
    var ciInput = document.getElementById('sh-checkin');
    var coInput = document.getElementById('sh-checkout');
    if (ciInput && coInput) {
        ciInput.addEventListener('change', function () {
            if (coInput.value && coInput.value <= ciInput.value) coInput.value = '';
            coInput.min = ciInput.value;
        });
    }

    // Fecha mínima = hoy
    var today = new Date().toISOString().split('T')[0];
    if (ciInput) ciInput.min = today;
    if (coInput) coInput.min = today;

    /* ── Categorías ── */
    document.querySelectorAll('.category-item[data-cat]').forEach(function (item) {
        item.addEventListener('click', function () {
            document.querySelectorAll('.category-item').forEach(function (i) {
                i.classList.remove('active');
            });
            this.classList.add('active');
            var cat = this.dataset.cat;
            window.location.href = cat ? '/hospedajes?cat=' + cat : '/hospedajes';
        });
    });
});
