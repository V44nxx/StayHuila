/* ── Cerrar dropdown al hacer clic fuera ── */
document.addEventListener('click', function (event) {
    var dropdown = document.getElementById('user-dropdown');
    if (dropdown && dropdown.classList.contains('show')) {
        dropdown.classList.remove('show');
    }
});

/* ── Tipo activo (hospedaje por defecto) ── */
var _selectedTipo = 'hospedaje';

/* ── Estilos de los botones de tipo ── */
var _tipoStyles = {
    active:   { background: 'white', color: '#2C4A3B', border: 'none',
                boxShadow: '0 2px 8px rgba(0,0,0,.15)', fontWeight: '700' },
    inactive: { background: 'rgba(255,255,255,.18)', color: 'white',
                border: '2px solid rgba(255,255,255,.6)', boxShadow: '', fontWeight: '600' }
};
function _applyTipoStyle(btn, active) {
    var s = active ? _tipoStyles.active : _tipoStyles.inactive;
    btn.style.background  = s.background;
    btn.style.color       = s.color;
    btn.style.border      = s.border;
    btn.style.boxShadow   = s.boxShadow;
    btn.style.fontWeight  = s.fontWeight;
}

/* ── Función principal de búsqueda ── */
function doSearch() {
    var q        = document.getElementById('sh-q')       ? document.getElementById('sh-q').value.trim()       : '';
    var checkin  = document.getElementById('sh-checkin') ? document.getElementById('sh-checkin').value         : '';
    var checkout = document.getElementById('sh-checkout')? document.getElementById('sh-checkout').value        : '';
    var guests   = document.getElementById('sh-guests')  ? document.getElementById('sh-guests').value          : '';

    if (checkin && checkout && checkin >= checkout) {
        alert('La fecha de salida debe ser posterior a la de llegada.');
        return;
    }

    var params = new URLSearchParams();
    if (q)        params.set('q',        q);
    if (checkin)  params.set('checkin',  checkin);
    if (checkout) params.set('checkout', checkout);
    if (guests)   params.set('huespedes', guests);

    var dest = _selectedTipo === 'experiencia' ? '/experiencias' : '/hospedajes';
    window.location.href = dest + (params.toString() ? '?' + params.toString() : '');
}

document.addEventListener('DOMContentLoaded', function () {

    /* ── Tipo toggle ── */
    var tipoBtns = document.querySelectorAll('.sh-tipo');
    if (tipoBtns.length) {
        // Estado inicial: hospedaje activo
        tipoBtns.forEach(function (btn) {
            _applyTipoStyle(btn, btn.dataset.tipo === 'hospedaje');
            btn.addEventListener('click', function () {
                _selectedTipo = this.dataset.tipo;
                tipoBtns.forEach(function (b) { _applyTipoStyle(b, false); });
                _applyTipoStyle(this, true);

                // Mostrar/ocultar campos de fecha según tipo
                var dateFields = document.querySelectorAll('.sh-date-field');
                dateFields.forEach(function (f) {
                    f.style.display = _selectedTipo === 'experiencia' ? 'none' : '';
                });
                var dateDividers = document.querySelectorAll('.sh-date-divider');
                dateDividers.forEach(function (d) {
                    d.style.display = _selectedTipo === 'experiencia' ? 'none' : '';
                });
            });
        });
    }

    /* ── Botón buscar ── */
    var submitBtn = document.getElementById('sh-submit');
    if (submitBtn) submitBtn.addEventListener('click', doSearch);

    /* ── Enter en el campo de texto ── */
    var qInput = document.getElementById('sh-q');
    if (qInput) qInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') doSearch();
    });

    /* ── Validación de fechas ── */
    var ciInput = document.getElementById('sh-checkin');
    var coInput = document.getElementById('sh-checkout');
    var today = new Date().toISOString().split('T')[0];
    if (ciInput) {
        ciInput.min = today;
        ciInput.addEventListener('change', function () {
            if (coInput && coInput.value && coInput.value <= ciInput.value) {
                coInput.value = '';
            }
            if (coInput) coInput.min = ciInput.value || today;
        });
    }
    if (coInput) coInput.min = today;

    /* ── Categorías — filtran directamente en la página ── */
    document.querySelectorAll('.category-item[data-cat]').forEach(function (item) {
        item.addEventListener('click', function () {
            document.querySelectorAll('.category-item').forEach(function (i) {
                i.classList.remove('active');
            });
            this.classList.add('active');
            var cat = this.dataset.cat; // ya es el nombre exacto de la categoría

            // Si filterCategory está disponible en la página, filtrar en línea
            if (typeof filterCategory === 'function') {
                filterCategory(cat);
            } else {
                // Fallback: navegar si la función no está disponible
                window.location.href = cat ? '/hospedajes?cat=' + encodeURIComponent(cat) : '/hospedajes';
            }
        });
    });
});
