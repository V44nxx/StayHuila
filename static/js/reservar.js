document.addEventListener('click', function(event) {
    var dropdown = document.getElementById('user-dropdown');
    if (dropdown && dropdown.classList.contains('show')) {
        dropdown.classList.remove('show');
    }
});

function formatMoney(amount) {
    return Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function getNights() {
    if (typeof TIPO_RESERVA !== 'undefined' && TIPO_RESERVA === 'experiencia') {
        return 1;
    }
    const inpCheckin = document.getElementById('inp-checkin');
    const inpCheckout = document.getElementById('inp-checkout');
    if (!inpCheckin || !inpCheckout || !inpCheckin.value || !inpCheckout.value) {
        return typeof NOCHES !== 'undefined' ? NOCHES : 1;
    }
    const ci = new Date(inpCheckin.value);
    const co = new Date(inpCheckout.value);
    const diff = Math.round((co - ci) / (1000 * 60 * 60 * 24));
    return Math.max(1, diff);
}

function chGuest(d){
    const maxG = typeof MAX_GUESTS !== 'undefined' ? MAX_GUESTS : 10;
    guests = Math.max(1, Math.min(maxG, guests + d));
    const gc = document.getElementById('gc');
    if (gc) gc.textContent = guests;
    const inpH = document.getElementById('inp-huespedes');
    if (inpH) inpH.value = guests;
    
    recalcularTotales();
}

function recalcularTotales() {
    const nights = getNights();
    const precioUnit = typeof PRECIO_UNITARIO !== 'undefined' ? PRECIO_UNITARIO : 0;
    const descPct = typeof DESCUENTO_PCT !== 'undefined' ? DESCUENTO_PCT : 0;

    let base = 0;
    const priceLineText = document.getElementById('price-line-text');
    if (typeof TIPO_RESERVA !== 'undefined' && TIPO_RESERVA === 'experiencia') {
        base = precioUnit * guests * nights;
        if (priceLineText) {
            priceLineText.textContent = `$${formatMoney(precioUnit)} × ${guests} persona${guests !== 1 ? 's' : ''} × ${nights} día${nights !== 1 ? 's' : ''}`;
        }
    } else {
        base = precioUnit * nights * guests;
        if (priceLineText) {
            priceLineText.textContent = `$${formatMoney(precioUnit)} × ${guests} persona${guests !== 1 ? 's' : ''} × ${nights} noche${nights !== 1 ? 's' : ''}`;
        }
    }
    
    let desc = Math.round(base * (descPct / 100));
    let quantityDiscount = 0;
    if (typeof DESCUENTO_CANTIDAD_PCT !== 'undefined'
        && typeof DESCUENTO_CANTIDAD_MIN_HUESPEDES !== 'undefined'
        && guests >= DESCUENTO_CANTIDAD_MIN_HUESPEDES) {
        quantityDiscount = Math.round(base * (DESCUENTO_CANTIDAD_PCT / 100));
    }
    let subtotal = base - desc - quantityDiscount;
    let fee = Math.round(subtotal * 0.14);
    let totalBeforeCredit = subtotal + fee;
    
    // Aplicar crédito de puntos canjeados
    let creditoAmount = 0;
    if (typeof CREDITO_PCT !== 'undefined' && CREDITO_PCT > 0) {
        creditoAmount = Math.round(totalBeforeCredit * (CREDITO_PCT / 100));
    }
    let finalTotal = Math.max(2000, totalBeforeCredit - creditoAmount);
    
    // Actualizar UI
    const priceBaseVal = document.getElementById('price-base-val');
    if (priceBaseVal) priceBaseVal.textContent = `$${formatMoney(base)}`;
    
    const discVal = document.getElementById('discount-val');
    const discRow = document.getElementById('discount-row');
    if (discVal) discVal.textContent = `-$${formatMoney(desc)}`;
    if (discRow) discRow.style.display = desc > 0 ? 'flex' : 'none';
    
    const quantityDiscountRow = document.getElementById('quantity-discount-row');
    const quantityDiscountVal = document.getElementById('quantity-discount-val');
    if (quantityDiscountRow && quantityDiscountVal) {
        quantityDiscountVal.textContent = `-$${formatMoney(quantityDiscount)}`;
        quantityDiscountRow.style.display = quantityDiscount > 0 ? 'flex' : 'none';
    }
    
    const creditoValEl = document.getElementById('credito-puntos-val');
    if (creditoValEl) {
        creditoValEl.textContent = `-$${formatMoney(creditoAmount)}`;
    }

    const tarifaVal = document.getElementById('tarifa-val');
    if (tarifaVal) tarifaVal.textContent = `$${formatMoney(fee)}`;
    
    const totalVal = document.getElementById('total-val');
    if (totalVal) totalVal.textContent = `$${formatMoney(finalTotal)}`;
    
    const btnTotal = document.getElementById('btn-total');
    if (btnTotal) btnTotal.textContent = formatMoney(finalTotal);
}

function selectMetodo(val, el){
    document.querySelectorAll('.metodo-card').forEach(c=>c.classList.remove('selected'));
    if (el) {
        el.classList.add('selected');
        const inp = el.querySelector('input');
        if (inp) inp.checked = true;
    }
}

// Ensure the code inside is executed after the DOM is fully loaded to access element properties properly
document.addEventListener('DOMContentLoaded', () => {
    const now = new Date().toISOString().split('T')[0];
    const inpCheckin  = document.getElementById('inp-checkin');
    const inpCheckout = document.getElementById('inp-checkout');
    if (!inpCheckin || !inpCheckout) return;

    inpCheckin.min  = now;
    inpCheckout.min = now;

    inpCheckin.addEventListener('change', function () {
        if (typeof TIPO_RESERVA !== 'undefined' && TIPO_RESERVA === 'experiencia') {
            inpCheckout.value = this.value;
        } else {
            const d = new Date(this.value);
            d.setDate(d.getDate() + 1);
            inpCheckout.min = d.toISOString().split('T')[0];
            if (inpCheckout.value && inpCheckout.value <= this.value) {
                inpCheckout.value = d.toISOString().split('T')[0];
            }
        }
        
        const sumIn = document.getElementById('sum-checkin');
        if (sumIn) sumIn.textContent = this.value;
        
        validarEstadiaReserva();
        recalcularTotales();
    });

    inpCheckout.addEventListener('change', function () {
        const sumOut = document.getElementById('sum-checkout');
        if (sumOut) sumOut.textContent = this.value;
        validarEstadiaReserva();
        recalcularTotales();
    });

    // Validar también al cargar (por si las fechas vienen pre-cargadas del widget)
    validarEstadiaReserva();
    recalcularTotales();

    // Bloquear submit si hay violación de estadía
    const form = document.getElementById('reserva-form');
    if (form) {
        form.addEventListener('submit', function (e) {
            if (!validarEstadiaReserva()) {
                e.preventDefault();
            }
        });
    }
});

/**
 * Valida que las noches estén dentro de ESTADIA_MIN / ESTADIA_MAX.
 * Muestra/oculta la alerta visual y devuelve true si es válido.
 * Solo aplica a hospedajes (TIPO_RESERVA === 'hospedaje').
 */
function validarEstadiaReserva() {
    if (typeof TIPO_RESERVA === 'undefined' || TIPO_RESERVA !== 'hospedaje') return true;
    if (typeof ESTADIA_MIN === 'undefined' || typeof ESTADIA_MAX === 'undefined') return true;

    const alertEl = document.getElementById('estadia-reserva-alert');
    const msgEl   = document.getElementById('estadia-reserva-msg');
    const checkin  = document.getElementById('inp-checkin');
    const checkout = document.getElementById('inp-checkout');

    if (!checkin || !checkout || !checkin.value || !checkout.value) {
        if (alertEl) alertEl.style.display = 'none';
        return true;
    }

    const ci = new Date(checkin.value);
    const co = new Date(checkout.value);
    const nights = Math.round((co - ci) / (1000 * 60 * 60 * 24));

    let msg = '';
    if (nights < ESTADIA_MIN) {
        msg = `La estadía mínima para este hospedaje es de ${ESTADIA_MIN} noche${ESTADIA_MIN !== 1 ? 's' : ''}.`;
    } else if (nights > ESTADIA_MAX) {
        msg = `La estadía máxima permitida es de ${ESTADIA_MAX} noches.`;
    }

    if (alertEl && msgEl) {
        if (msg) {
            msgEl.textContent = msg;
            alertEl.style.display = 'block';
        } else {
            alertEl.style.display = 'none';
        }
    }
    if (msg && typeof showToast === 'function') showToast(msg, 'error');
    return !msg;
}
