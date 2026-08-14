/* ── index.js — Buscador E-Commerce Inteligente | StayHuila ── */

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

let _initialGridHTML = null;
let _cachedRecommendations = null;
let _currentSuggestionsData = [];
let _selectedIndex = -1;

/* ── Palabras clave de Experiencias ── */
const experienceKeywords = [
    'show', 'experiencia', 'tour', 'tours', 'actividad', 'astronomia', 'astronomía',
    'rafting', 'catacion', 'catación', 'cafe', 'café', 'senderismo', 'cabalgata',
    'parapente', 'fiesta', 'dj', 'musica', 'música', 'baile', 'gastronomia',
    'gastronomía', 'ecoturismo', 'aventura', 'degustacion', 'degustación',
    'degustar', 'taller', 'paseo', 'caminata', 'bici', 'bicicleta', 'cuatrimoto',
    'kayak', 'canotaje', 'espeleologia', 'espeleología', 'tatacoa tour'
];

/* ── Determinar destino de búsqueda al presionar ENTER o buscar ── */
function getSearchDestination(query, items) {
    const qLower = (query || '').toLowerCase().trim();
    if (!qLower) return '/hospedajes';

    const isExpKeyword = experienceKeywords.some(kw => qLower.includes(kw));
    if (isExpKeyword) {
        return '/experiencias?q=' + encodeURIComponent(query);
    }

    if (items && items.length > 0) {
        const expCount = items.filter(i => i.tipo === 'experiencia').length;
        const hospCount = items.filter(i => i.tipo === 'hospedaje').length;
        if (expCount > hospCount) {
            return '/experiencias?q=' + encodeURIComponent(query);
        }
    }

    return '/hospedajes?q=' + encodeURIComponent(query);
}

/* ── Reiniciar búsqueda a la vista original ── */
window.resetSearch = function () {
    const qInput = document.getElementById('sh-q');
    const sugBox = document.getElementById('search-suggestions');
    if (qInput) qInput.value = '';
    if (sugBox) sugBox.style.display = 'none';

    document.querySelectorAll('.category-item').forEach(i => i.classList.remove('active'));
    const allCatBtn = document.querySelector('.category-item[data-cat=""]');
    if (allCatBtn) allCatBtn.classList.add('active');

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

/* ── Fetch API Buscar ── */
function fetchSearchResults(queryStr) {
    const q = (queryStr || '').trim();
    const sugBox = document.getElementById('search-suggestions');
    if (sugBox) sugBox.style.display = 'none';

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
            // Redirigir a la página de Experiencias o Hospedajes correspondiente
            const dest = getSearchDestination(q, data);
            window.location.href = dest;
        })
        .catch(err => {
            console.error('Error en búsqueda:', err);
            window.location.href = '/hospedajes?q=' + encodeURIComponent(q);
        });
}

/* ── Renderizado Estilo E-Commerce de Recomendaciones ── */
function renderSuggestions(items, queryStr, isInitial = false) {
    const sugBox = document.getElementById('search-suggestions');
    if (!sugBox) return;

    _currentSuggestionsData = items || [];
    _selectedIndex = -1;

    let html = '';

    if (queryStr && queryStr.trim()) {
        const qEscaped = escapeHtml(queryStr.trim());
        const qEncoded = encodeURIComponent(queryStr.trim());

        html += `
            <div style="padding: 0.5rem 1rem 0.3rem; font-size: 0.72rem; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px; background: #F8FAFC; border-bottom: 1px solid #E2E8F0;">
                🔍 RECOMENDACIONES DE BÚSQUEDA
            </div>
            
            <div class="sug-action-item" onclick="window.location.href='/experiencias?q=${qEncoded}'" 
                 style="display:flex;align-items:center;gap:0.75rem;padding:0.7rem 1rem;cursor:pointer;border-bottom:1px solid #F1F5F9;transition:background 0.15s;"
                 onmouseenter="this.style.background='#FEF3C7'" onmouseleave="this.style.background='white'">
                <div style="width:32px;height:32px;border-radius:50%;background:#FEF3C7;color:#D97706;display:flex;align-items:center;justify-content:center;">
                    <i class="ph-fill ph-shooting-star"></i>
                </div>
                <div style="flex:1;">
                    <span style="font-size:0.88rem;color:#1E293B;">Buscar "<strong>${qEscaped}</strong>" en <strong>Experiencias</strong></span>
                </div>
                <i class="ph ph-arrow-right" style="color:#D97706;"></i>
            </div>

            <div class="sug-action-item" onclick="window.location.href='/hospedajes?q=${qEncoded}'" 
                 style="display:flex;align-items:center;gap:0.75rem;padding:0.7rem 1rem;cursor:pointer;border-bottom:1px solid #F1F5F9;transition:background 0.15s;"
                 onmouseenter="this.style.background='#E8F5E9'" onmouseleave="this.style.background='white'">
                <div style="width:32px;height:32px;border-radius:50%;background:#E8F5E9;color:#2C4A3B;display:flex;align-items:center;justify-content:center;">
                    <i class="ph-fill ph-house-line"></i>
                </div>
                <div style="flex:1;">
                    <span style="font-size:0.88rem;color:#1E293B;">Buscar "<strong>${qEscaped}</strong>" en <strong>Hospedajes</strong></span>
                </div>
                <i class="ph ph-arrow-right" style="color:#2C4A3B;"></i>
            </div>
        `;
    }

    if (items && items.length > 0) {
        html += `
            <div style="padding: 0.5rem 1rem 0.3rem; font-size: 0.72rem; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px; background: #F8FAFC; border-bottom: 1px solid #E2E8F0; margin-top:0.2rem;">
                ✨ PUBLICACIONES RELACIONADAS (${items.length})
            </div>
        `;

        items.slice(0, 6).forEach(function (item, idx) {
            const isHosp = item.tipo === 'hospedaje';
            const targetUrl = isHosp ? `/hospedaje/${item.id}` : `/experiencia/${item.id}`;
            const badgeTxt = isHosp ? 'Hospedaje' : 'Experiencia';
            const badgeColor = isHosp ? '#2C4A3B' : '#D97706';
            const badgeBg = isHosp ? '#E8F5E9' : '#FEF3C7';
            const imgUrl = item.imagen || (isHosp ? 'https://images.unsplash.com/photo-1518136247453-74e7b5265980?w=80' : 'https://images.unsplash.com/photo-1533130061792-64b345e4a833?w=80');

            html += `
                <div class="suggestion-item" data-index="${idx}" data-url="${targetUrl}"
                     onclick="window.location.href='${targetUrl}'"
                     style="display:flex;align-items:center;gap:0.75rem;padding:0.75rem 1rem;cursor:pointer;border-bottom:1px solid #F1F5F9;transition:all 0.15s;background:white;"
                     onmouseenter="highlightSuggestion(${idx})" onmouseleave="this.style.background='white'">
                    <img src="${imgUrl}" style="width:42px;height:42px;border-radius:10px;object-fit:cover;flex-shrink:0;box-shadow:0 2px 5px rgba(0,0,0,0.1);">
                    <div style="flex:1;min-width:0;">
                        <div style="display:flex;align-items:center;justify-content:space-between;gap:0.5rem;">
                            <strong style="font-size:0.9rem;color:#1E293B;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(item.nombre)}</strong>
                            <span style="font-size:0.7rem;font-weight:700;color:${badgeColor};background:${badgeBg};padding:2px 8px;border-radius:12px;flex-shrink:0;">${badgeTxt}</span>
                        </div>
                        <div style="font-size:0.78rem;color:#64748B;display:flex;align-items:center;justify-content:space-between;margin-top:2px;">
                            <span><i class="ph ph-map-pin" style="font-size:0.75rem;"></i> ${escapeHtml(item.municipio)}</span>
                            <strong style="color:var(--primary);font-size:0.82rem;">$${formatMoney(item.precio)} COP</strong>
                        </div>
                    </div>
                </div>
            `;
        });
    } else if (queryStr && queryStr.trim()) {
        html += `
            <div style="padding: 1rem; text-align: center; color: #64748B; font-size: 0.88rem;">
                Sin publicaciones directas para "${escapeHtml(queryStr)}"
            </div>
        `;
    }

    sugBox.innerHTML = html;
    sugBox.style.display = 'block';
}

function highlightSuggestion(index) {
    const sugBox = document.getElementById('search-suggestions');
    if (!sugBox) return;
    const items = sugBox.querySelectorAll('.suggestion-item');
    items.forEach((el, i) => {
        if (i === index) {
            el.style.background = '#F8FAFC';
            el.style.borderLeft = '3px solid var(--primary)';
        } else {
            el.style.background = 'white';
            el.style.borderLeft = 'none';
        }
    });
    _selectedIndex = index;
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

        // RECOMENDACIONES EN TIEMPO REAL AL ESCRIBIR
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
            }, 100);
        });

        // MANEJO DE TECLA ENTER Y NAVEGACIÓN
        qInput.addEventListener('keydown', function (e) {
            const suggestions = _currentSuggestionsData || [];

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (suggestions.length > 0) {
                    const nextIdx = (_selectedIndex + 1) % Math.min(suggestions.length, 6);
                    highlightSuggestion(nextIdx);
                }
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (suggestions.length > 0) {
                    const prevIdx = (_selectedIndex - 1 + Math.min(suggestions.length, 6)) % Math.min(suggestions.length, 6);
                    highlightSuggestion(prevIdx);
                }
            } else if (e.key === 'Enter') {
                e.preventDefault();

                // Si se seleccionó una publicación de la lista con las flechas:
                if (_selectedIndex >= 0 && suggestions[_selectedIndex]) {
                    const item = suggestions[_selectedIndex];
                    const targetUrl = item.tipo === 'hospedaje' ? `/hospedaje/${item.id}` : `/experiencia/${item.id}`;
                    window.location.href = targetUrl;
                    return;
                }

                // Al presionar Enter directo: redirigir a la página de Experiencias o Hospedajes según la relación de la búsqueda (ej. "show" -> /experiencias?q=show)
                const queryVal = this.value.trim();
                const destUrl = getSearchDestination(queryVal, suggestions);
                window.location.href = destUrl;
            } else if (e.key === 'Escape') {
                if (sugBox) sugBox.style.display = 'none';
            }
        });

        document.addEventListener('click', function (e) {
            if (sugBox && !qInput.contains(e.target) && !sugBox.contains(e.target)) {
                sugBox.style.display = 'none';
            }
        });
    }

    if (submitBtn) {
        submitBtn.addEventListener('click', function () {
            if (qInput) {
                const queryVal = qInput.value.trim();
                const destUrl = getSearchDestination(queryVal, _currentSuggestionsData);
                window.location.href = destUrl;
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
                const destUrl = getSearchDestination(cat, []);
                window.location.href = destUrl;
            } else {
                resetSearch();
            }
        });
    });
});
