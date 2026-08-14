/* ── index.js — Autocompletado y Sugerencias de Texto Estilo Amazon | StayHuila ── */

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
let _currentListingsData = [];
let _selectedIndex = -1;

/* ── Palabras clave asociadas a Experiencias ── */
const experienceKeywords = [
    'show', 'experiencia', 'tour', 'tours', 'actividad', 'astronomia', 'astronomía',
    'rafting', 'catacion', 'catación', 'cafe', 'café', 'senderismo', 'cabalgata',
    'parapente', 'fiesta', 'dj', 'musica', 'música', 'baile', 'gastronomia',
    'gastronomía', 'ecoturismo', 'aventura', 'degustacion', 'degustación',
    'degustar', 'taller', 'paseo', 'caminata', 'bici', 'bicicleta', 'cuatrimoto',
    'kayak', 'canotaje', 'espeleologia', 'espeleología', 'tatacoa tour'
];

function getSearchDestination(query, items) {
    const qLower = (query || '').toLowerCase().trim();
    if (!qLower) return null; // No navegar si está vacío

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

/* ── Reiniciar búsqueda ── */
window.resetSearch = function () {
    const qInput = document.getElementById('sh-q');
    const sugBox = document.getElementById('search-suggestions');
    const clearBtn = document.getElementById('sh-clear');

    if (qInput) qInput.value = '';
    if (clearBtn) clearBtn.style.display = 'none';
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

/* ── Renderizado de Cuadrícula Principal ── */
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
            const listings = Array.isArray(data) ? data : (data.publicaciones || []);
            const dest = getSearchDestination(q, listings);
            if (dest) window.location.href = dest;
        })
        .catch(err => {
            console.error('Error en búsqueda:', err);
            window.location.href = '/hospedajes?q=' + encodeURIComponent(q);
        });
}

/* ── Highlight de coincidencias de texto ── */
function highlightMatch(text, query) {
    if (!text) return '';
    if (!query) return escapeHtml(text);
    const escapedText = escapeHtml(text);
    const escapedQuery = escapeHtml(query).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    return escapedText.replace(regex, '<strong>$1</strong>');
}

/* ── Renderizado Estilo Amazon de Sugerencias de Texto ── */
function renderSuggestions(sugerencias, queryStr, publicaciones = []) {
    const sugBox = document.getElementById('search-suggestions');
    if (!sugBox) return;

    _currentSuggestionsData = sugerencias || [];
    _currentListingsData = publicaciones || [];
    _selectedIndex = -1;

    let html = '';

    if (queryStr && queryStr.trim()) {
        const qEscaped = escapeHtml(queryStr.trim());

        const isExpRel = experienceKeywords.some(kw => queryStr.toLowerCase().includes(kw));
        const quickTag = isExpRel ? 'Experiencias' : 'Hospedajes';
        const quickUrl = isExpRel ? `/experiencias?q=${encodeURIComponent(queryStr.trim())}` : `/hospedajes?q=${encodeURIComponent(queryStr.trim())}`;
        const quickColor = isExpRel ? '#D97706' : '#2C4A3B';

        html += `
            <div class="suggestion-item direct-action" data-url="${quickUrl}" onclick="window.location.href='${quickUrl}'"
                 style="display:flex;align-items:center;gap:0.75rem;padding:0.8rem 1.1rem;cursor:pointer;border-bottom:1px solid #E2E8F0;background:#F8FAFC;transition:background 0.15s;"
                 onmouseenter="highlightSuggestion(0)" onmouseleave="this.style.background='#F8FAFC'">
                <i class="ph ph-magnifying-glass" style="font-size:1.15rem;color:${quickColor};"></i>
                <div style="flex:1;font-size:0.92rem;color:#1E293B;">
                    <strong>${qEscaped}</strong> <span style="font-size:0.82rem;color:#64748B;">en ${quickTag}</span>
                </div>
                <i class="ph ph-arrow-up-left" style="color:#94A3B8;font-size:1rem;"></i>
            </div>
        `;
    }

    if (sugerencias && sugerencias.length > 0) {
        sugerencias.forEach(function (sug, idx) {
            const actualIdx = (queryStr && queryStr.trim()) ? idx + 1 : idx;
            const isHosp = sug.tipo === 'hospedaje';
            const targetUrl = sug.id ? (isHosp ? `/hospedaje/${sug.id}` : `/experiencia/${sug.id}`) : (isHosp ? `/hospedajes?q=${encodeURIComponent(sug.texto)}` : `/experiencias?q=${encodeURIComponent(sug.texto)}`);
            const badgeTxt = isHosp ? 'Hospedaje' : 'Experiencia';
            const badgeColor = isHosp ? '#2C4A3B' : '#D97706';
            const badgeBg = isHosp ? '#E8F5E9' : '#FEF3C7';
            const textDisplay = sug.texto || sug.nombre || '';

            html += `
                <div class="suggestion-item" data-index="${actualIdx}" data-url="${targetUrl}"
                     onclick="window.location.href='${targetUrl}'"
                     style="display:flex;align-items:center;gap:0.75rem;padding:0.75rem 1.1rem;cursor:pointer;border-bottom:1px solid #F1F5F9;transition:all 0.15s;background:white;"
                     onmouseenter="highlightSuggestion(${actualIdx})" onmouseleave="this.style.background='white'">
                    <i class="ph ph-magnifying-glass" style="font-size:1.1rem;color:#64748B;flex-shrink:0;"></i>
                    <div style="flex:1;min-width:0;font-size:0.92rem;color:#334155;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                        ${highlightMatch(textDisplay, queryStr)}
                    </div>
                    <span style="font-size:0.72rem;font-weight:700;color:${badgeColor};background:${badgeBg};padding:2px 9px;border-radius:12px;flex-shrink:0;">
                        ${badgeTxt}
                    </span>
                </div>
            `;
        });
    } else if (queryStr && queryStr.trim()) {
        html += `
            <div style="padding: 1.1rem; text-align: center; color: #64748B; font-size: 0.88rem;">
                Sin recomendaciones exactas para "<strong>${escapeHtml(queryStr)}</strong>"
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
            el.style.background = '#F1F5F9';
            el.style.borderLeft = '3px solid var(--primary)';
        } else {
            el.style.background = el.classList.contains('direct-action') ? '#F8FAFC' : 'white';
            el.style.borderLeft = 'none';
        }
    });
    _selectedIndex = index;
}

/* ── Cargar Recomendaciones Destacadas Iniciales ── */
function loadInitialRecommendations() {
    if (_cachedRecommendations) {
        let sug = Array.isArray(_cachedRecommendations) ? _cachedRecommendations.map(p => ({ texto: p.nombre, tipo: p.tipo, id: p.id })) : (_cachedRecommendations.sugerencias || []);
        let pubs = Array.isArray(_cachedRecommendations) ? _cachedRecommendations : (_cachedRecommendations.publicaciones || []);
        renderSuggestions(sug, '', pubs);
        return;
    }

    fetch('/api/buscar?q=')
        .then(res => res.json())
        .then(data => {
            _cachedRecommendations = data;
            let sug = Array.isArray(data) ? data.map(p => ({ texto: p.nombre, tipo: p.tipo, id: p.id })) : (data.sugerencias || []);
            let pubs = Array.isArray(data) ? data : (data.publicaciones || []);
            renderSuggestions(sug, '', pubs);
        })
        .catch(err => console.error(err));
}

/* ── Inicialización de Eventos ── */
document.addEventListener('DOMContentLoaded', function () {
    const qInput = document.getElementById('sh-q');
    const sugBox = document.getElementById('search-suggestions');
    const submitBtn = document.getElementById('sh-submit');
    const clearBtn = document.getElementById('sh-clear');
    const container = document.getElementById('hospedajes');

    if (container) {
        _initialGridHTML = container.innerHTML;
    }

    function updateClearBtn() {
        if (!clearBtn || !qInput) return;
        if (qInput.value.trim().length > 0) {
            clearBtn.style.display = 'flex';
        } else {
            clearBtn.style.display = 'none';
        }
    }

    if (clearBtn && qInput) {
        clearBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            qInput.value = '';
            updateClearBtn();
            if (sugBox) sugBox.style.display = 'none';
            resetSearch();
            qInput.focus();
        });
    }

    let searchTimeout = null;

    if (qInput) {
        qInput.addEventListener('focus', function () {
            updateClearBtn();
            const val = this.value.trim();
            if (!val) {
                loadInitialRecommendations();
            } else if (sugBox && sugBox.children.length > 0) {
                sugBox.style.display = 'block';
            }
        });

        qInput.addEventListener('click', function () {
            updateClearBtn();
            const val = this.value.trim();
            if (!val) {
                loadInitialRecommendations();
            }
        });

        // AUTOCOMPLETADO Y RECOMENDACIONES EN TIEMPO REAL AL ESCRIBIR
        qInput.addEventListener('input', function () {
            updateClearBtn();
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
                        let sug = [];
                        let pubs = [];
                        if (Array.isArray(data)) {
                            pubs = data;
                            sug = data.map(item => ({ texto: item.nombre, tipo: item.tipo, id: item.id }));
                        } else {
                            pubs = data.publicaciones || [];
                            sug = data.sugerencias || [];
                        }
                        if (!sug.length && pubs.length) {
                            sug = pubs.map(p => ({ texto: p.nombre, tipo: p.tipo, id: p.id }));
                        }
                        renderSuggestions(sug, val, pubs);
                        renderListings(pubs, val);
                    })
                    .catch(err => console.error(err));
            }, 80);
        });

        // MANEJO DE ENTER Y NAVEGACIÓN TECLADO ESTILO AMAZON
        qInput.addEventListener('keydown', function (e) {
            const items = sugBox ? sugBox.querySelectorAll('.suggestion-item') : [];

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (items.length > 0) {
                    const nextIdx = (_selectedIndex + 1) % items.length;
                    highlightSuggestion(nextIdx);
                }
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (items.length > 0) {
                    const prevIdx = (_selectedIndex - 1 + items.length) % items.length;
                    highlightSuggestion(prevIdx);
                }
            } else if (e.key === 'Enter') {
                e.preventDefault();

                const queryVal = this.value.trim();

                // SI ESTÁ VACÍO: NO HACER NADA, NO REDIRIGIR NI NAVEGAR A NINGÚN LADO
                if (!queryVal) {
                    if (sugBox) sugBox.style.display = 'none';
                    return;
                }

                // Si se seleccionó una sugerencia con flechas:
                if (_selectedIndex >= 0 && items[_selectedIndex]) {
                    const targetUrl = items[_selectedIndex].dataset.url;
                    if (targetUrl) {
                        window.location.href = targetUrl;
                        return;
                    }
                }

                const destUrl = getSearchDestination(queryVal, _currentListingsData);
                if (destUrl) window.location.href = destUrl;
            } else if (e.key === 'Escape') {
                if (sugBox) sugBox.style.display = 'none';
            }
        });

        document.addEventListener('click', function (e) {
            if (sugBox && !qInput.contains(e.target) && !sugBox.contains(e.target) && clearBtn && !clearBtn.contains(e.target)) {
                sugBox.style.display = 'none';
            }
        });
    }

    if (submitBtn) {
        submitBtn.addEventListener('click', function () {
            if (qInput) {
                const queryVal = qInput.value.trim();
                // SI ESTÁ VACÍO: NO NAVEGAR NI REDIRIGIR
                if (!queryVal) return;

                const destUrl = getSearchDestination(queryVal, _currentListingsData);
                if (destUrl) window.location.href = destUrl;
            }
        });
    }

    /* ── Filtrado por Categorías en Barra Lateral ── */
    document.querySelectorAll('.category-item[data-cat]').forEach(function (item) {
        item.addEventListener('click', function () {
            document.querySelectorAll('.category-item').forEach(i => i.classList.remove('active'));
            this.classList.add('active');

            const cat = this.dataset.cat;
            if (qInput) {
                qInput.value = cat;
                updateClearBtn();
            }

            if (cat) {
                const destUrl = getSearchDestination(cat, []);
                if (destUrl) window.location.href = destUrl;
            } else {
                resetSearch();
            }
        });
    });
});
