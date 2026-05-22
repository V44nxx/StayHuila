document.addEventListener('click', function(event) {
    var dropdown = document.getElementById('user-dropdown');
    if (dropdown && dropdown.classList.contains('show')) {
        dropdown.classList.remove('show');
    }
});

function formatMoney(amount) {
    return amount.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function chGuest(d){
    guests = Math.max(1, Math.min(MAX_GUESTS, guests+d));
    document.getElementById('gc').textContent = guests;
    document.getElementById('inp-huespedes').value = guests;
    
    // Recalcular precios
    let base = 0;
    if(TIPO_RESERVA === 'experiencia'){
        base = PRECIO_UNITARIO * guests * NOCHES;
        document.getElementById('price-line-text').textContent = `$${formatMoney(PRECIO_UNITARIO)} × ${guests} persona${guests!==1?'s':''} × ${NOCHES} día${NOCHES!==1?'s':''}`;
    } else {
        base = PRECIO_UNITARIO * NOCHES * guests;
        document.getElementById('price-line-text').textContent = `$${formatMoney(PRECIO_UNITARIO)} × ${guests} persona${guests!==1?'s':''} × ${NOCHES} noche${NOCHES!==1?'s':''}`;
    }
    
    let desc = Math.round(base * (DESCUENTO_PCT / 100));
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
    let finalTotal = Math.max(0, totalBeforeCredit - creditoAmount);
    
    // Actualizar UI
    document.getElementById('price-base-val').textContent = `$${formatMoney(base)}`;
    if(document.getElementById('discount-val')){
        document.getElementById('discount-val').textContent = `-$${formatMoney(desc)}`;
        document.getElementById('discount-row').style.display = desc > 0 ? 'flex' : 'none';
    }
    const quantityDiscountRow = document.getElementById('quantity-discount-row');
    const quantityDiscountVal = document.getElementById('quantity-discount-val');
    if (quantityDiscountRow && quantityDiscountVal) {
        quantityDiscountVal.textContent = `-$${formatMoney(quantityDiscount)}`;
        quantityDiscountRow.style.display = quantityDiscount > 0 ? 'flex' : 'none';
    }
    // Actualizar línea de crédito puntos si existe en la UI
    const creditoValEl = document.getElementById('credito-puntos-val');
    if (creditoValEl) {
        creditoValEl.textContent = `-$${formatMoney(creditoAmount)}`;
    }

    document.getElementById('tarifa-val').textContent = `$${formatMoney(fee)}`;
    document.getElementById('total-val').textContent = `$${formatMoney(finalTotal)}`;
    document.getElementById('btn-total').textContent = formatMoney(finalTotal);
}
function selectMetodo(val, el){
    document.querySelectorAll('.metodo-card').forEach(c=>c.classList.remove('selected'));
    el.classList.add('selected');
    el.querySelector('input').checked = true;
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
        const d = new Date(this.value);
        d.setDate(d.getDate() + 1);
        inpCheckout.min = d.toISOString().split('T')[0];
        validarEstadiaReserva();
    });
    inpCheckout.addEventListener('change', validarEstadiaReserva);

    // Validar también al cargar (por si las fechas vienen pre-cargadas del widget)
    validarEstadiaReserva();

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
