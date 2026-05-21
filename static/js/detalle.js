// ===========================================
//  DETALLE HOSPEDAJE - StayHuila
// ===========================================

const DATA = JSON.parse(document.getElementById('hospedaje-data').textContent);

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

function changeGuests(delta) {
    guestCount = Math.max(1, Math.min(DATA.max_guests, guestCount + delta));
    document.getElementById('guest-count').textContent = guestCount;
    calcPrice();
}

const checkinInput = document.getElementById('bw-checkin');
const checkoutInput = document.getElementById('bw-checkout');

// Fecha mínima = hoy
const today = new Date();
const todayStr = today.toISOString().split('T')[0];

if (checkinInput && checkoutInput) {
    checkinInput.min = todayStr;
    checkoutInput.min = todayStr;

    checkinInput.addEventListener('change', () => {
        if (checkinInput.value) {
            const nextDay = new Date(checkinInput.value);
            nextDay.setDate(nextDay.getDate() + 1);
            checkoutInput.min = nextDay.toISOString().split('T')[0];
            if (checkoutInput.value && checkoutInput.value <= checkinInput.value) {
                checkoutInput.value = '';
            }
        }
        calcPrice();
        syncCalendar();
    });

    checkoutInput.addEventListener('change', () => {
        calcPrice();
        syncCalendar();
    });
}

/** Muestra u oculta la alerta de estadía con un mensaje. */
function setEstadiaAlert(msg) {
    const alertEl = document.getElementById('estadia-alert');
    const msgEl   = document.getElementById('estadia-alert-msg');
    if (!alertEl || !msgEl) return;
    if (msg) {
        msgEl.textContent = msg;
        alertEl.style.display = 'block';
    } else {
        alertEl.style.display = 'none';
        msgEl.textContent = '';
    }
}

function calcPrice() {
    const summary = document.getElementById('price-summary');
    if (!checkinInput.value || !checkoutInput.value) {
        summary.style.display = 'none';
        setEstadiaAlert('');
        return;
    }
    const ci = new Date(checkinInput.value);
    const co = new Date(checkoutInput.value);
    const nights = Math.round((co - ci) / (1000 * 60 * 60 * 24));
    if (nights <= 0) { summary.style.display = 'none'; return; }

    // ── Validar estadía mínima y máxima (con reglas de temporada) ────────────
    const regla = getReglaActiva(checkinInput.value, checkoutInput.value);
    const minN = regla ? regla.estadia_minima : estadiaMin;
    const maxN = regla ? regla.estadia_maxima : estadiaMax;
    if (nights < minN) {
        setEstadiaAlert(`La estadía mínima${regla ? ' en ' + regla.nombre : ''} es de ${minN} noche${minN !== 1 ? 's' : ''}.`);
        summary.style.display = 'none';
        return;
    }
    if (nights > maxN) {
        setEstadiaAlert(`La estadía máxima permitida${regla ? ' en ' + regla.nombre : ''} es de ${maxN} noches.`);
        summary.style.display = 'none';
        return;
    }
    setEstadiaAlert('');  // Sin error — limpiar alerta

    // Detectar si es fin de semana (precio mayor)
    const isWeekend = ci.getDay() === 5 || ci.getDay() === 6;
    const pricePerNight = isWeekend ? DATA.price_weekend : DATA.price;

    const base = pricePerNight * nights * guestCount;
    const discountAmt = DATA.discount ? Math.round(base * DATA.discount / 100) : 0;
    const fee = Math.round((base - discountAmt) * 0.14);
    const total = base - discountAmt + fee;

    const fmt = n => '$' + n.toLocaleString('es-CO') + ' COP';

    document.getElementById('ps-nights').textContent = `${nights} noche${nights !== 1 ? 's' : ''} × ${guestCount} persona${guestCount !== 1 ? 's' : ''}`;
    document.getElementById('ps-base').textContent = fmt(base);
    const discEl = document.getElementById('ps-disc');
    if (discEl) discEl.textContent = '-' + fmt(discountAmt);
    document.getElementById('ps-fee').textContent = fmt(fee);
    document.getElementById('ps-total').textContent = fmt(total);
    summary.style.display = 'flex';
}

// Formulario → redireccionar a página de reserva (o login si no hay sesión)
const bwForm = document.getElementById('bw-form');
if (bwForm) {
    bwForm.addEventListener('submit', e => {
        e.preventDefault();
        if (!checkinInput.value || !checkoutInput.value) {
            showToast('Por favor selecciona las fechas de llegada y salida');
            return;
        }
        // Validar estadía antes de redirigir
        const ci2 = new Date(checkinInput.value);
        const co2 = new Date(checkoutInput.value);
        const nights2 = Math.round((co2 - ci2) / (1000 * 60 * 60 * 24));
        const regla2 = getReglaActiva(checkinInput.value, checkoutInput.value);
        const minN2 = regla2 ? regla2.estadia_minima : estadiaMin;
        const maxN2 = regla2 ? regla2.estadia_maxima : estadiaMax;
        if (nights2 < minN2) {
            showToast(`La estadía mínima${regla2 ? ' en ' + regla2.nombre : ''} es de ${minN2} noche${minN2 !== 1 ? 's' : ''}.`, 'error');
            return;
        }
        if (nights2 > maxN2) {
            showToast(`La estadía máxima permitida${regla2 ? ' en ' + regla2.nombre : ''} es de ${maxN2} noches.`, 'error');
            return;
        }
        const params = new URLSearchParams({
            id: DATA.id,
            checkin: checkinInput.value,
            checkout: checkoutInput.value,
            huespedes: guestCount
        });
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
document.getElementById('btn-compartir').addEventListener('click', () => {
    if (navigator.share) {
        navigator.share({ title: DATA.name, url: window.location.href });
    } else {
        navigator.clipboard.writeText(window.location.href);
        showToast('Enlace copiado al portapapeles');
    }
});

let isFav = false;
document.getElementById('btn-favorito').addEventListener('click', function () {
    isFav = !isFav;
    this.innerHTML = isFav
        ? '<i class="ph-fill ph-heart" style="color:#FF5A5F"></i> Guardado'
        : '<i class="ph ph-heart"></i> Guardar';
});


// ─── CALENDARIO INTERACTIVO ──────────────────────────────────
let calYear = today.getFullYear();
let calMonth = today.getMonth();
let selStart = null;
let selEnd = null;
let blockedDates = new Set();

// Estadía mínima y máxima — inicia desde DATA (Jinja), luego la API puede sobreescribirla
// con reglas de temporada activas para las fechas seleccionadas.
let estadiaMin = DATA.estadia_minima || 1;
let estadiaMax = DATA.estadia_maxima || 365;
let reglasTemporada = [];

// Cargar fechas bloqueadas + reglas de estadía desde la API
fetch(`/api/disponibilidad/${DATA.id}`)
    .then(r => r.json())
    .then(data => {
        blockedDates = new Set(data.bloqueadas);
        // Estadía base (puede diferir si el backend tiene un valor distinto)
        if (data.estadia_minima) estadiaMin = data.estadia_minima;
        if (data.estadia_maxima) estadiaMax = data.estadia_maxima;
        if (data.reglas_temporada) reglasTemporada = data.reglas_temporada;
        renderCalendars();
    })
    .catch(() => renderCalendars());

/**
 * Devuelve la regla de temporada aplicable a un rango de fechas dado (si existe).
 * Prioriza la primera regla cuya ventana se superpone con checkin-checkout.
 */
function getReglaActiva(checkinStr, checkoutStr) {
    if (!reglasTemporada.length || !checkinStr || !checkoutStr) return null;
    for (const r of reglasTemporada) {
        if (checkinStr <= r.fecha_fin && checkoutStr >= r.fecha_inicio) return r;
    }
    return null;
}

function renderCalendars() {
    const container = document.getElementById('calendar-container');
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
        } else if (blockedDates.has(dateStr)) {
            el.classList.add('blocked');
        } else {
            if (dateStr === todayStr) el.classList.add('today');
            applyRangeClass(el, dateStr);
            el.addEventListener('click', () => handleDayClick(dateStr));
        }

        grid.appendChild(el);
    }

    div.appendChild(grid);
    return div;
}

function applyRangeClass(el, dateStr) {
    if (selStart && selEnd) {
        if (dateStr === selStart && dateStr === selEnd) { el.classList.add('selected-start', 'selected-end'); }
        else if (dateStr === selStart) el.classList.add('selected-start');
        else if (dateStr === selEnd) el.classList.add('selected-end');
        else if (dateStr > selStart && dateStr < selEnd) el.classList.add('selected-range');
    } else if (selStart && dateStr === selStart) {
        el.classList.add('selected-start', 'selected-end');
    }
}

function handleDayClick(dateStr) {
    if (!selStart || (selStart && selEnd)) {
        selStart = dateStr; selEnd = null;
    } else {
        if (dateStr < selStart) { selEnd = selStart; selStart = dateStr; }
        else { selEnd = dateStr; }
        // Sincronizar con el widget de reserva
        checkinInput.value = selStart;
        checkoutInput.value = selEnd;
        calcPrice();
    }
    renderCalendars();
}

function shiftCal(dir) {
    calMonth += dir;
    if (calMonth < 0) { calMonth = 11; calYear--; }
    if (calMonth > 11) { calMonth = 0; calYear++; }
    renderCalendars();
}

function syncCalendar() {
    if (checkinInput.value) selStart = checkinInput.value;
    if (checkoutInput.value) selEnd = checkoutInput.value;
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

    // Forzar redibujado para evitar que el mapa salga gris
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
