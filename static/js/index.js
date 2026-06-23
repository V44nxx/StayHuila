/* ── Cerrar dropdown al hacer clic fuera ── */
document.addEventListener('click', function (event) {
    var dropdown = document.getElementById('user-dropdown');
    if (dropdown && dropdown.classList.contains('show')) {
        dropdown.classList.remove('show');
    }
});

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

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
    var q = document.getElementById('sh-q') ? document.getElementById('sh-q').value.trim() : '';
    var params = new URLSearchParams();
    if (q) params.set('q', q);
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

            });
        });
    }

    /* ── Botón buscar ── */
    var submitBtn = document.getElementById('sh-submit');
    if (submitBtn) submitBtn.addEventListener('click', doSearch);

    /* ── Enter en el campo de texto + sugerencias ── */
    var qInput = document.getElementById('sh-q');
    var sugBox = document.getElementById('search-suggestions');
    var searchTimeout = null;

    function renderSuggestions(items) {
        if (!sugBox) return;
        if (!items.length) { sugBox.style.display = 'none'; return; }
        sugBox.innerHTML = '';
        items.slice(0, 6).forEach(function(item) {
            var div = document.createElement('div');
            div.style.cssText = 'display:flex;align-items:center;gap:0.7rem;padding:0.7rem 1rem;cursor:pointer;border-bottom:1px solid #f0f0f0;';
            div.onmouseenter = function() { this.style.background = '#f9fafb'; };
            div.onmouseleave = function() { this.style.background = 'white'; };
            div.onclick = function() {
                qInput.value = item.nombre;
                sugBox.style.display = 'none';
                doSearch();
            };
            var badge = item.tipo === 'hospedaje' ? 'Hospedaje' : 'Experiencia';
            var badgeColor = item.tipo === 'hospedaje' ? '#2C4A3B' : '#F59E0B';
            div.innerHTML = '<img src="' + (item.imagen || 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=60') + '" style="width:36px;height:36px;border-radius:8px;object-fit:cover;flex-shrink:0;">' +
                '<div style="flex:1;min-width:0;"><strong style="font-size:0.9rem;color:var(--text-main);display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + escapeHtml(item.nombre) + '</strong>' +
                '<span style="font-size:0.78rem;color:var(--text-muted);">' + escapeHtml(item.municipio) + ' · <span style="color:' + badgeColor + ';font-weight:600;">' + badge + '</span></span></div>';
            sugBox.appendChild(div);
        });
        sugBox.style.display = 'block';
    }

    if (qInput) {
        qInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') { sugBox.style.display = 'none'; doSearch(); }
            if (e.key === 'Escape') { sugBox.style.display = 'none'; }
        });
        qInput.addEventListener('input', function () {
            clearTimeout(searchTimeout);
            var val = this.value.trim();
            if (!val) { sugBox.style.display = 'none'; return; }
            searchTimeout = setTimeout(function () {
                fetch('/api/buscar?q=' + encodeURIComponent(val))
                    .then(function(r) { return r.json(); })
                    .then(function(data) { renderSuggestions(data); })
                    .catch(function() {});
            }, 250);
        });
        // Cerrar sugerencias al hacer clic fuera
        document.addEventListener('click', function(e) {
            if (sugBox && !qInput.contains(e.target) && !sugBox.contains(e.target)) {
                sugBox.style.display = 'none';
            }
        });
    }

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
