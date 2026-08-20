// ===========================================
//  DETALLE HOSPEDAJE - StayHuila
// ===========================================

const DATA = JSON.parse(document.getElementById('experiencia-data').textContent);

// ─── GALERÍA / LIGHTBOX ─────────────────────────────────────
let currentLbIdx = 0;

function openLightbox(idx) {
    currentLbIdx = idx;
    const lb = document.getElementById('lightbox');
    lb.classList.add('active');
    updateLbImg();
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    document.getElementById('lightbox').classList.remove('active');
    document.body.style.overflow = '';
}

function changeLbImg(dir) {
    currentLbIdx = (currentLbIdx + dir + DATA.images.length) % DATA.images.length;
    updateLbImg();
}

function updateLbImg() {
    document.getElementById('lb-img').src = DATA.images[currentLbIdx];
    document.getElementById('lb-counter').textContent =
        `${currentLbIdx + 1} / ${DATA.images.length}`;
}

document.addEventListener('keydown', e => {
    const lb = document.getElementById('lightbox');
    if (!lb.classList.contains('active')) return;
    if (e.key === 'ArrowRight') changeLbImg(1);
    if (e.key === 'ArrowLeft') changeLbImg(-1);
    if (e.key === 'Escape') closeLightbox();
});


// ─── DESCRIPCIÓN expandible ─────────────────────────────────
function toggleDesc() {
    const text = document.getElementById('desc-text');
    const btn = document.getElementById('read-more-btn');
    text.classList.toggle('expanded');
    if (text.classList.contains('expanded')) {
        btn.innerHTML = 'Mostrar menos <i class="ph ph-caret-up"></i>';
    } else {
        btn.innerHTML = 'Mostrar más <i class="ph ph-caret-down"></i>';
    }
}


// ─── BOOKING WIDGET ─────────────────────────────────────────
let guestCount = 1;
let selectedSesionId = null;
let hasCustomSessions = false;
let availableDates = new Set(); // Declaración única con Set

function changeGuests(delta) {
    let currentMax = DATA.max_guests || 10;
    
    // Si hay una sesión seleccionada específica, el máximo real son sus cupos disponibles
    if (selectedSesionId && selectedSesionId !== 'general') {
        const sesionEl = document.querySelector(`.sesion-item[data-id="${selectedSesionId}"]`);
        if (sesionEl) {
            currentMax = parseInt(sesionEl.getAttribute('data-cups')) || currentMax;
        }
    } else if (hasCustomSessions) {
        // Si hay sesiones cargadas pero no seleccionada
        const sesiones = document.querySelectorAll('.sesion-item:not(.disabled)');
        if (sesiones.length > 0) {
            let maxAvail = 0;
            sesiones.forEach(s => {
                const cups = parseInt(s.getAttribute('data-cups')) || 0;
                if (cups > maxAvail) maxAvail = cups;
            });
            currentMax = maxAvail;
        }
    }

    const nextCount = guestCount + delta;

    if (delta > 0 && nextCount > currentMax) {
        if (currentMax === 0) {
            showToast("No hay cupos disponibles para esta fecha.", "error");
        } else {
            showToast(`Lo sentimos, solo hay ${currentMax} cupos disponibles.`, 'info');
        }
        guestCount = currentMax > 0 ? currentMax : 1;
    } else if (nextCount < 1) {
        guestCount = 1;
    } else {
        guestCount = nextCount;
    }

    // Asegurar que guestCount no supere currentMax si currentMax > 0
    if (currentMax > 0 && guestCount > currentMax) guestCount = currentMax;

    const guestCountEl = document.getElementById('guest-count');
    if (guestCountEl) {
        guestCountEl.textContent = guestCount;
    }
    
    // Actualizar el texto del límite en la UI
    const maxLabel = document.getElementById('bw-max-text') || document.querySelector('.bw-max');
    if (maxLabel) {
        maxLabel.textContent = `Máx. ${currentMax} personas`;
        maxLabel.style.color = currentMax === 0 ? '#b91c1c' : '';
    }

    // Deshabilitar botones si se llega al límite
    const btnPlus = document.querySelector('button[onclick="changeGuests(1)"]');
    const btnMinus = document.querySelector('button[onclick="changeGuests(-1)"]');
    if (btnPlus) btnPlus.disabled = (currentMax > 0 && guestCount >= currentMax);
    if (btnMinus) btnMinus.disabled = (guestCount <= 1);

    // Actualizar estado del botón de reserva
    const reserveBtn = document.getElementById('bw-reserve-btn');
    const checkinVal = checkinInput ? checkinInput.value : '';
    
    if (reserveBtn) {
        if (!checkinVal) {
            reserveBtn.disabled = true;
            reserveBtn.style.opacity = '0.5';
            reserveBtn.style.cursor = 'not-allowed';
            reserveBtn.textContent = 'Selecciona fecha';
        } else if (hasCustomSessions && !selectedSesionId) {
            reserveBtn.disabled = true;
            reserveBtn.style.opacity = '0.5';
            reserveBtn.style.cursor = 'not-allowed';
            reserveBtn.textContent = 'Selecciona horario';
        } else if (currentMax === 0 || guestCount < 1) {
            reserveBtn.disabled = true;
            reserveBtn.style.opacity = '0.5';
            reserveBtn.style.cursor = 'not-allowed';
            reserveBtn.textContent = 'No disponible';
        } else {
            reserveBtn.disabled = false;
            reserveBtn.style.opacity = '1';
            reserveBtn.style.cursor = 'pointer';
            reserveBtn.textContent = 'Reservar';
        }
    }

    calcPrice();
}

const checkinInput = document.getElementById('bw-checkin');

// Fecha mínima = hoy
const today = new Date();
const todayStr = today.toISOString().split('T')[0];

if (checkinInput) {
    checkinInput.min = todayStr;

    checkinInput.addEventListener('change', () => {
        if (checkinInput.value) {
            loadSesiones(checkinInput.value);
            syncCalendar();
        } else {
            const container = document.getElementById('sesiones-container');
            if (container) container.style.display = 'none';
            selectedSesionId = null;
            changeGuests(0);
        }
        calcPrice();
    });
}

/** Carga las sesiones de un día específico */
async function loadSesiones(fecha) {
    const container = document.getElementById('sesiones-container');
    const list = document.getElementById('sesion-list');
    const inputSesion = document.getElementById('sesion-id');
    
    if (container) container.style.display = 'block';
    if (list) list.innerHTML = '<div class="no-sesiones"><i class="ph ph-circle-notch ph-spin"></i> Buscando horarios...</div>';
    if (inputSesion) inputSesion.value = '';
    selectedSesionId = null;
    hasCustomSessions = false;

    // Resetear el texto del límite en la UI al máximo general
    const maxLabel = document.getElementById('bw-max-text') || document.querySelector('.bw-max');
    if (maxLabel) {
        maxLabel.textContent = `Máx. ${DATA.max_guests} personas`;
    }

    try {
        const res = await fetch(`/api/experiencias/sesiones/${DATA.id}?fecha=${fecha}`);
        const data = await res.json();
        
        if (data.success && data.sesiones && data.sesiones.length > 0) {
            hasCustomSessions = true;
            if (list) list.innerHTML = '';
            
            data.sesiones.forEach(s => {
                const item = document.createElement('div');
                const isFull = s.cupos_disponibles <= 0 || s.estado !== 'disponible';
                item.className = `sesion-item ${isFull ? 'disabled' : ''}`;
                item.setAttribute('data-id', s.id);
                item.setAttribute('data-cups', s.cupos_disponibles);
                
                let badgeClass = 'badge-disponible';
                let badgeText = 'Disponible';
                if (isFull) {
                    badgeClass = 'badge-lleno';
                    badgeText = 'No disponible';
                } else if (s.cupos_disponibles <= 2) {
                    badgeClass = 'badge-pocos';
                    badgeText = `Últimos ${s.cupos_disponibles} cupos`;
                }

                item.innerHTML = `
                    <div class="sesion-info">
                        <span class="sesion-time"><i class="ph ph-clock"></i> ${s.hora_inicio} - ${s.hora_fin}</span>
                        <span class="sesion-cups" style="color: ${isFull ? '#b91c1c' : '#15803d'}">${s.cupos_disponibles} cupos libres</span>
                    </div>
                    <div style="display:flex; flex-direction:column; align-items:flex-end; gap:4px;">
                        <span class="sesion-badge ${badgeClass}">${badgeText}</span>
                        ${isFull && s.estado === 'lleno' ? `
                            <button onclick="event.stopPropagation(); joinWaitingList(${s.id})" style="font-size:0.7rem; background:none; border:1px solid #b91c1c; color:#b91c1c; padding:2px 6px; border-radius:4px; cursor:pointer;">Unirse a lista de espera</button>
                        ` : ''}
                    </div>
                `;

                if (!isFull) {
                    item.onclick = () => selectSesion(s.id, item);
                }
                if (list) list.appendChild(item);
            });
            // Si solo hay una sesión y está disponible, seleccionarla automáticamente
            const availableItems = list ? list.querySelectorAll('.sesion-item:not(.disabled)') : [];
            if (availableItems.length === 1) {
                availableItems[0].click();
            } else {
                changeGuests(0);
            }
        } else {
            // Si no hay sesiones personalizadas creadas, permitir reserva con horario habitual
            hasCustomSessions = false;
            selectedSesionId = 'general';
            if (inputSesion) inputSesion.value = '';
            if (container) container.style.display = 'none';
            changeGuests(0);
        }
    } catch (err) {
        console.error('Error cargando sesiones:', err);
        hasCustomSessions = false;
        selectedSesionId = 'general';
        if (container) container.style.display = 'none';
        changeGuests(0);
    }
}

async function joinWaitingList(sesionId) {
    try {
        const authRes = await fetch('/api/auth-check');
        const authData = await authRes.json();
        if (!authData.logged_in) {
            showToast('Debes iniciar sesión para unirte a la lista de espera.', 'error');
            return;
        }

        const res = await fetch('/api/experiencias/lista-espera/unirse', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sesion_id: sesionId, huespedes: guestCount })
        });
        const data = await res.json();
        if (data.success) {
            showToast(data.msg, 'success');
        } else {
            showToast(data.error || 'Error al unirse a la lista.', 'error');
        }
    } catch (err) {
        showToast('Error de conexión.', 'error');
    }
}

function selectSesion(id, el) {
    document.querySelectorAll('.sesion-item').forEach(i => i.classList.remove('selected'));
    if (el) el.classList.add('selected');
    const inputSesion = document.getElementById('sesion-id');
    if (inputSesion) inputSesion.value = id;
    selectedSesionId = id;
    
    // Validar huéspedes contra cupos
    if (el) {
        const available = parseInt(el.getAttribute('data-cups')) || DATA.max_guests;
        const maxLabel = document.getElementById('bw-max-text') || document.querySelector('.bw-max');
        if (maxLabel) {
            maxLabel.textContent = `Máx. ${available} personas`;
        }

        if (guestCount > available) {
            showToast(`Ajustamos el número de personas a ${available} (cupo máximo de este horario).`, 'info');
            guestCount = available;
            const guestCountEl = document.getElementById('guest-count');
            if (guestCountEl) guestCountEl.textContent = guestCount;
        }
    }
    
    changeGuests(0); 
    calcPrice();
}

function calcPrice() {
    const summary = document.getElementById('price-summary');
    if (!summary) return;
    
    if (!checkinInput || !checkinInput.value || (hasCustomSessions && !selectedSesionId)) {
        summary.style.display = 'none';
        return;
    }

    const base = DATA.price * guestCount; 
    const discountAmt = DATA.discount ? Math.round(base * DATA.discount / 100) : 0;
    const fee = Math.round((base - discountAmt) * 0.14);
    const total = base - discountAmt + fee;

    const fmt = n => '$' + n.toLocaleString('es-CO') + ' COP';

    const nightsEl = document.getElementById('ps-nights');
    if (nightsEl) nightsEl.textContent = `${guestCount} persona${guestCount !== 1 ? 's' : ''}`;
    
    const baseEl = document.getElementById('ps-base');
    if (baseEl) baseEl.textContent = fmt(base);
    
    const discEl = document.getElementById('ps-disc');
    if (discEl) discEl.textContent = '-' + fmt(discountAmt);
    
    const feeEl = document.getElementById('ps-fee');
    if (feeEl) feeEl.textContent = fmt(fee);
    
    const totalEl = document.getElementById('ps-total');
    if (totalEl) totalEl.textContent = fmt(total);
    
    summary.style.display = 'flex';
}

// Formulario → redireccionar a página de reserva (o login si no hay sesión)
const bwForm = document.getElementById('bw-form');
if (bwForm) {
    bwForm.addEventListener('submit', e => {
        e.preventDefault();
        if (!checkinInput || !checkinInput.value) {
            showToast('Por favor selecciona una fecha');
            return;
        }
        if (hasCustomSessions && (!selectedSesionId || selectedSesionId === 'general')) {
            showToast('Por favor selecciona un horario (sesión)');
            return;
        }
        
        const params = new URLSearchParams({
            id: DATA.id,
            tipo: 'experiencia',
            checkin: checkinInput.value,
            checkout: checkinInput.value, // Las experiencias son el mismo día
            huespedes: guestCount
        });
        
        if (selectedSesionId && selectedSesionId !== 'general') {
            params.append('sesion_id', selectedSesionId);
        }
        
        const reservarUrl = '/reservar?' + params.toString();
        // Verificar si hay sesión activa
        fetch('/api/auth-check')
            .then(r => r.json())
            .then(data => {
                if (data.logged_in) {
                    window.location.href = reservarUrl;
                } else {
                    window.location.href = '/login?next=' + encodeURIComponent(reservarUrl);
                }
            })
            .catch(() => {
                window.location.href = '/login?next=' + encodeURIComponent(reservarUrl);
            });
    });
}

// Acciones rápidas
const btnCompartir = document.getElementById('btn-compartir');
if (btnCompartir) {
    btnCompartir.addEventListener('click', () => {
        if (navigator.share) {
            navigator.share({ title: DATA.name, url: window.location.href });
        } else {
            navigator.clipboard.writeText(window.location.href);
            showToast('Enlace copiado al portapapeles');
        }
    });
}

let isFav = false;
const btnFav = document.getElementById('btn-favorito');
if (btnFav) {
    btnFav.addEventListener('click', function () {
        isFav = !isFav;
        this.innerHTML = isFav
            ? '<i class="ph-fill ph-heart" style="color:#FF5A5F"></i> Guardado'
            : '<i class="ph ph-heart"></i> Guardar';
    });
}


// ─── CALENDARIO INTERACTIVO ──────────────────────────────────
let calYear = today.getFullYear();
let calMonth = today.getMonth();
let selDate = null;

// Cargar fechas disponibles desde la API
fetch(`/api/disponibilidad/${DATA.id}?tipo=experiencia`)
    .then(r => r.json())
    .then(data => {
        if (data.success && data.dias_disponibles && data.dias_disponibles.length > 0) {
            availableDates = new Set(data.dias_disponibles);
        }
        renderCalendars();
    })
    .catch(() => renderCalendars());

function renderCalendars() {
    const container = document.getElementById('calendar-container');
    if (!container) return;
    container.innerHTML = '';
    for (let m = 0; m < 2; m++) {
        const d = new Date(calYear, calMonth + m, 1);
        container.appendChild(buildMonth(d.getFullYear(), d.getMonth()));
    }
}

function buildMonth(year, month) {
    const names = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
    const dayNames = ['Do','Lu','Ma','Mi','Ju','Vi','Sa'];

    const div = document.createElement('div');
    div.className = 'calendar-month';

    // Header
    const hdr = document.createElement('div');
    hdr.className = 'cal-header';

    let prevBtn = '';
    if (year === calYear && month === calMonth) {
        prevBtn = `<button class="cal-nav-btn" onclick="shiftCal(-1)"><i class="ph ph-caret-left"></i></button>`;
    } else {
        prevBtn = `<span style="width:32px"></span>`;
    }
    const nextBtn = (month === calMonth + 1 || (calMonth === 11 && month === 0))
        ? `<button class="cal-nav-btn" onclick="shiftCal(1)"><i class="ph ph-caret-right"></i></button>`
        : `<span style="width:32px"></span>`;

    hdr.innerHTML = `${prevBtn}<span>${names[month]} ${year}</span>${nextBtn}`;
    div.appendChild(hdr);

    // Grid
    const grid = document.createElement('div');
    grid.className = 'cal-grid';

    dayNames.forEach(n => {
        const el = document.createElement('div');
        el.className = 'cal-day-name';
        el.textContent = n;
        grid.appendChild(el);
    });

    const firstDay = new Date(year, month, 1).getDay();
    for (let i = 0; i < firstDay; i++) {
        const blank = document.createElement('div');
        blank.className = 'cal-day empty';
        grid.appendChild(blank);
    }

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
        const el = document.createElement('div');
        el.className = 'cal-day';
        el.textContent = day;

        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dateObj = new Date(year, month, day);

        if (dateObj < new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
            el.classList.add('past');
        } else if (availableDates.size > 0 && !availableDates.has(dateStr)) {
            el.classList.add('blocked');
        } else {
            if (dateStr === todayStr) el.classList.add('today');
            if (selDate === dateStr) el.classList.add('selected-start', 'selected-end');
            el.addEventListener('click', () => handleDayClick(dateStr));
        }

        grid.appendChild(el);
    }

    div.appendChild(grid);
    return div;
}

function handleDayClick(dateStr) {
    selDate = dateStr;
    // Sincronizar con el widget de reserva
    checkinInput.value = dateStr;
    loadSesiones(dateStr);
    calcPrice();
    renderCalendars();
}

function shiftCal(dir) {
    calMonth += dir;
    if (calMonth < 0) { calMonth = 11; calYear--; }
    if (calMonth > 11) { calMonth = 0; calYear++; }
    renderCalendars();
}

function syncCalendar() {
    if (checkinInput.value) selDate = checkinInput.value;
    renderCalendars();
}


// ─── MAPA LEAFLET ────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    if (!document.getElementById('detalle-map')) return;

    const map = L.map('detalle-map', { zoomControl: true }).setView([DATA.lat, DATA.lng], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
    }).addTo(map);

    // Forzar redibujado
    setTimeout(() => {
        map.invalidateSize();
    }, 400);

    // Círculo de zona (sin revelar dirección exacta, estilo Airbnb)
    L.circle([DATA.lat, DATA.lng], {
        radius: 500,
        color: 'var(--primary, #2C4A3B)',
        fillColor: 'var(--primary, #2C4A3B)',
        fillOpacity: 0.15,
        weight: 2
    }).addTo(map);

    // Marker personalizado
    const icon = L.divIcon({
        className: '',
        html: `<div style="
            background:white;
            border:2px solid var(--primary, #2C4A3B);
            border-radius:50%;
            width:48px;height:48px;
            display:flex;align-items:center;justify-content:center;
            box-shadow:0 4px 15px rgba(0,0,0,0.2);
            overflow:hidden;
        "><img src="${DATA.images && DATA.images.length > 0 ? DATA.images[0] : ''}" style="width:100%;height:100%;object-fit:cover;" onerror="this.style.display='none'"></div>`,
        iconSize: [48, 48],
        iconAnchor: [24, 24]
    });

    L.marker([DATA.lat, DATA.lng], { icon })
        .addTo(map)
        .bindPopup(`<b>${DATA.name}</b>`)
        .openPopup();
});


// ─── NAVBAR scroll ───────────────────────────────────────────
// Ya está sólida, no necesita cambio on scroll

document.addEventListener('click', function (event) {
    var dropdown = document.getElementById('user-dropdown');
    if (dropdown && dropdown.classList.contains('show')) {
        dropdown.classList.remove('show');
    }
});
