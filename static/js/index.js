/* ── index.js — Buscador Unificado con Recomendaciones en Tiempo Real | StayHuila ── */

/* ── Cerrar dropdown al hacer clic fuera ── */
document.addEventListener('click', function (event) {
    var dropdown = document.getElementById('user-dropdown');
    if (dropdown && dropdown.classList.contains('show')) {
        dropdown.classList.remove('show');
    }
});

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function formatMoney(num) {
    if (!num) return '0';
    return Math.round(num).toLocaleString('es-CO');
}

/* ── Guardar el HTML original de la cuadrícula ── */
let _initialGridHTML = null;
let _cachedRecommendations = null;

/* ── Función para reiniciar búsqueda a la vista completa ── */
window.resetSearch = function () {
    const qInput = document.getElementById('sh-q');
    const sugBox = document.getElementById('search-suggestions');
    if (qInput) qInput.value = '';
    if (sugBox) sugBox.style.display = 'none';

    // Desmarcar categorías activas
    document.querySelectorAll('.category-item').forEach(i => i.classList.remove('active'));
    const allCatBtn = document.querySelector('.category-item[data-cat=""]');
    if (allCatBtn) allCatBtn.classList.add('active');

    // Restaurar el HTML original si existe
    const container = document.getElementById('hospedajes');
    if (container && _initialGridHTML) {
        container.innerHTML = _initialGridHTML;
    } else {
        fetchSearchResults('');
    }
};

/* ── Renderizado de Resultados en la Cuadrícula Principal ── */
function renderListings(items, queryStr) {
    const container = document.getElementById('hospedajes');
    if (!container) return;

    if (!_initialGridHTML) {
        _initialGridHTML = container.innerHTML;
    }

    if (!items || items.length === 0) {
        const queryDisplay = escapeHtml(queryStr || 'tu búsqueda');
        container.innerHTML = `
            <div class="no-results-state" style="grid-column: 1 / -1; text-align: center; padding: 3.5rem 1.5rem; background: white; border-radius: 16px; border: 1.5px dashed var(--border); margin: 1rem 0;">
                <div style="width:70px; height:70px; background: rgba(44, 74, 59, 0.08); border-radius: 50%; display:flex; align-items:center; justify-content:center; margin: 0 auto 1.2rem;">
                    <i class="ph ph-magnifying-glass" style="font-size: 2.2rem; color: var(--primary);"></i>
                </div>
                <h3 style="font-size: 1.25rem; color: var(--text-main); margin-bottom: 0.5rem; font-weight: 700;">
                    No se encontraron publicaciones relacionadas con "${queryDisplay}"
                </h3>
                <p style="color: var(--text-muted); font-size: 0.9rem; max-width: 460px; margin: 0 auto 1.5rem; line-height: 1.5;">
                    Intenta buscar con otros términos como <strong>Cabaña</strong>, <strong>Tatacoa</strong>, <strong>Café</strong>, <strong>Rafting</strong> o explora las categorías en la barra lateral.
                </p>
                <button id="clear-search-btn" onclick="resetSearch()" style="background: var(--primary); color: white; border: none; padding: 0.65rem 1.6rem; border-radius: 50px; font-weight: 600; cursor: pointer; font-size: 0.9rem; transition: all 0.2s; box-shadow: 0 4px 12px rgba(44,74,59,0.2);">
                    <i class="ph ph-arrow-counter-clockwise"></i> Ver todas las publicaciones
                </button>
            </div>
        `;
        return;
    }

    let html = '';
    items.forEach(function (item) {
        const isHosp = item.tipo === 'hospedaje';
        const url = isHosp ? `/hospedaje/${item.id}` : `/experiencia/${item.id}`;
        const imgUrl = item.imagen || (isHosp ? 'https://images.unsplash.com/photo-1518136247453-74e7b5265980?w=600' : 'https://images.unsplash.com/photo-1533130061792-64b345e4a833?w=500');
        const badgeTxt = isHosp ? '🏠 Hospedaje' : '✨ Experiencia';
        const badgeBg = isHosp ? '#2C4A3B' : '#D97706';
        const priceUnit = isHosp ? 'noche' : 'persona';
        const rating = item.calificacion ? Number(item.calificacion).toFixed(1) : '5.0';
        const totalReviews = item.total_resenas || 0;
        const ecoBadge = item.es_eco ? `<div class="badge eco-badge"><i class="ph-fill ph-leaf"></i> 100% Sostenible</div>` : '';
        const discBadge = item.descuento_porcentaje ? `<div class="discount-badge">-${item.descuento_porcentaje}% Hoy</div>` : '';

        html += `
            <article class="listing-card" onclick="window.location.href='${url}'" style="cursor:pointer;">
                <div class="image-wrapper">
                    <img src="${imgUrl}" alt="${escapeHtml(item.nombre)}">
                    <div class="badge" style="background:${badgeBg}; color:white; font-size:0.75rem; font-weight:700; top:12px; left:12px; position:absolute; padding:4px 10px; border-radius:20px; box-shadow:0 2px 6px rgba(0,0,0,0.2);">
                        ${badgeTxt}
                    </div>
                    ${ecoBadge}
                    ${discBadge}
                </div>
                <div class="listing-info">
                    <div class="listing-header">
                        <h3 style="font-size:1.05rem; font-weight:700;">${escapeHtml(item.nombre)}</h3>
                        <span class="rating"><i class="ph-fill ph-star" style="color:#F59E0B;"></i> ${rating} (${totalReviews})</span>
                    </div>
                    <p class="location"><i class="ph ph-map-pin" style="font-size:.85rem"></i> ${escapeHtml(item.municipio)}</p>
                    <p class="details">${escapeHtml(item.descripcion_corta || item.categoria_nombre || item.tipo)}</p>
                    <p class="price"><strong>$${formatMoney(item.precio)} COP</strong> ${priceUnit}</p>
                    <a href="${url}" class="book-now-btn" style="text-align:center;display:block;text-decoration:none;">Ver detalles</a>
                </div>
            </article>
        `;
    });

    container.innerHTML = html;
}

/* ── Fetch a API Buscar ── */
function fetchSearchResults(queryStr) {
    const q = (queryStr || '').trim();
    if (!q) {
        if (_initialGridHTML) {
            const container = document.getElementById('hospedajes');
            if (container) container.innerHTML = _initialGridHTML;
        }
        return;
    }

    fetch('/api/buscar?q=' + encodeURIComponent(q))
        .then(res => res.json())
        .then(data => {
            renderListings(data, q);
        })
        .catch(err => {
            console.error('Error en búsqueda:', err);
        });
}

/* ── Renderizado del Menú Desplegable de Recomendaciones ── */
function renderSuggestions(items, queryStr, isInitial = false) {
    const sugBox = document.getElementById('search-suggestions');
    if (!sugBox) return;

    if (!items || items.length === 0) {
        if (queryStr) {
            sugBox.innerHTML = `
                <div style="padding: 1.2rem; text-align: center; color: var(--text-muted); font-size: 0.88rem;">
                    <i class="ph ph-magnifying-glass" style="font-size: 1.5rem; color:#9CA3AF; display: block; margin-bottom: 0.4rem;"></i>
                    No hay recomendaciones directas para "<strong>${escapeHtml(queryStr)}</strong>"
                </div>
            `;
            sugBox.style.display = 'block';
        } else {
            sugBox.style.display = 'none';
        }
        return;
    }

    let headerHTML = isInitial ? 
        `<div style="padding: 0.6rem 1rem 0.4rem; font-size: 0.75rem; font-weight: 700; color: var(--primary); text-transform: uppercase; letter-spacing: 0.5px; background: #F8FAFC; border-bottom: 1px solid #E2E8F0; display:flex; align-items:center; gap:0.4rem;">
            <i class="ph-fill ph-sparkle" style="color:#F59E0B;"></i> Recomendaciones destacadas
         </div>` :
        `<div style="padding: 0.6rem 1rem 0.4rem; font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; background: #F8FAFC; border-bottom: 1px solid #E2E8F0; display:flex; align-items:center; gap:0.4rem;">
            <i class="ph ph-magnifying-glass"></i> Coincidencias encontradas (${items.length})
         </div>`;

    sugBox.innerHTML = headerHTML;

    items.slice(0, 6).forEach(function (item) {
        const div = document.createElement('div');
        div.style.cssText = 'display:flex;align-items:center;gap:0.75rem;padding:0.75rem 1rem;cursor:pointer;border-bottom:1px solid #F1F5F9;transition:all 0.15s;';
        div.onmouseenter = function () { this.style.background = '#F8FAFC'; };
        div.onmouseleave = function () { this.style.background = 'white'; };
        
        const isHosp = item.tipo === 'hospedaje';
        const targetUrl = isHosp ? `/hospedaje/${item.id}` : `/experiencia/${item.id}`;
        
        div.onclick = function (e) {
            e.stopPropagation();
            window.location.href = targetUrl;
        };

        const badgeTxt = isHosp ? 'Hospedaje' : 'Experiencia';
        const badgeColor = isHosp ? '#2C4A3B' : '#D97706';
        const badgeBg = isHosp ? '#E8F5E9' : '#FEF3C7';
        const imgUrl = item.imagen || (isHosp ? 'https://images.unsplash.com/photo-1518136247453-74e7b5265980?w=80' : 'https://images.unsplash.com/photo-1533130061792-64b345e4a833?w=80');

        div.innerHTML = `
            <img src="${imgUrl}" style="width:42px;height:42px;border-radius:10px;object-fit:cover;flex-shrink:0;box-shadow:0 2px 5px rgba(0,0,0,0.1);">
            <div style="flex:1;min-width:0;">
                <div style="display:flex;align-items:center;justify-content:space-between;gap:0.5rem;">
                    <strong style="font-size:0.9rem;color:var(--text-main);display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(item.nombre)}</strong>
                    <span style="font-size:0.7rem;font-weight:700;color:${badgeColor};background:${badgeBg};padding:2px 8px;border-radius:12px;flex-shrink:0;">${badgeTxt}</span>
                </div>
                <div style="font-size:0.78rem;color:var(--text-muted);display:flex;align-items:center;justify-content:space-between;margin-top:2px;">
                    <span><i class="ph ph-map-pin" style="font-size:0.75rem;"></i> ${escapeHtml(item.municipio)}</span>
                    <strong style="color:var(--primary);font-size:0.82rem;">$${formatMoney(item.precio)}</strong>
                </div>
            </div>
        `;
        sugBox.appendChild(div);
    });

    sugBox.style.display = 'block';
}

/* ── Cargar Recomendaciones Destacadas Iniciales ── */
function loadInitialRecommendations() {
    if (_cachedRecommendations) {
        renderSuggestions(_cachedRecommendations, '', true);
        return;
    }

    fetch('/api/buscar?q=')
        .then(res => res.json())
        .then(data => {
            _cachedRecommendations = data;
            renderSuggestions(data, '', true);
        })
        .catch(err => console.error(err));
}

/* ── Inicialización de Eventos ── */
document.addEventListener('DOMContentLoaded', function () {
    const qInput = document.getElementById('sh-q');
    const sugBox = document.getElementById('search-suggestions');
    const submitBtn = document.getElementById('sh-submit');
    const container = document.getElementById('hospedajes');

    if (container) {
        _initialGridHTML = container.innerHTML;
    }

    let searchTimeout = null;

    if (qInput) {
        // Mostrar recomendaciones iniciales al hacer FOCUS o CLICK en el buscador
        qInput.addEventListener('focus', function () {
            const val = this.value.trim();
            if (!val) {
                loadInitialRecommendations();
            } else if (sugBox && sugBox.children.length > 0) {
                sugBox.style.display = 'block';
            }
        });

        qInput.addEventListener('click', function () {
            const val = this.value.trim();
            if (!val) {
                loadInitialRecommendations();
            }
        });

        // Búsqueda y Recomendaciones en TIEMPO REAL al escribir (input listener)
        qInput.addEventListener('input', function () {
            clearTimeout(searchTimeout);
            const val = this.value.trim();

            if (!val) {
                loadInitialRecommendations();
                resetSearch();
                return;
            }

            searchTimeout = setTimeout(function () {
                fetch('/api/buscar?q=' + encodeURIComponent(val))
                    .then(res => res.json())
                    .then(data => {
                        renderSuggestions(data, val, false);
                        renderListings(data, val);
                    })
                    .catch(err => console.error(err));
            }, 180);
        });

        qInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                if (sugBox) sugBox.style.display = 'none';
                fetchSearchResults(this.value.trim());
            }
            if (e.key === 'Escape') {
                if (sugBox) sugBox.style.display = 'none';
            }
        });

        // Ocultar recomendaciones al hacer clic fuera
        document.addEventListener('click', function (e) {
            if (sugBox && !qInput.contains(e.target) && !sugBox.contains(e.target)) {
                sugBox.style.display = 'none';
            }
        });
    }

    if (submitBtn) {
        submitBtn.addEventListener('click', function () {
            if (qInput) {
                if (sugBox) sugBox.style.display = 'none';
                fetchSearchResults(qInput.value.trim());
            }
        });
    }

    /* ── Filtrado por Categorías en Barra Lateral ── */
    document.querySelectorAll('.category-item[data-cat]').forEach(function (item) {
        item.addEventListener('click', function () {
            document.querySelectorAll('.category-item').forEach(i => i.classList.remove('active'));
            this.classList.add('active');

            const cat = this.dataset.cat;
            if (qInput) qInput.value = cat;

            if (cat) {
                fetchSearchResults(cat);
            } else {
                resetSearch();
            }
        });
    });
});
