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
        base = PRECIO_UNITARIO * NOCHES;
        document.getElementById('price-line-text').textContent = `$${formatMoney(PRECIO_UNITARIO)} × ${NOCHES} noche${NOCHES!==1?'s':''}`;
    }
    
    let desc = Math.round(base * (DESCUENTO_PCT / 100));
    let subtotal = base - desc;
    let fee = Math.round(subtotal * 0.14);
    let total = subtotal + fee;
    
    // Actualizar UI
    document.getElementById('price-base-val').textContent = `$${formatMoney(base)}`;
    if(document.getElementById('discount-val')){
        document.getElementById('discount-val').textContent = `-$${formatMoney(desc)}`;
        document.getElementById('discount-row').style.display = desc > 0 ? 'flex' : 'none';
    }
    document.getElementById('tarifa-val').textContent = `$${formatMoney(fee)}`;
    document.getElementById('total-val').textContent = `$${formatMoney(total)}`;
    document.getElementById('btn-total').textContent = formatMoney(total);
}
function selectMetodo(val, el){
    document.querySelectorAll('.metodo-card').forEach(c=>c.classList.remove('selected'));
    el.classList.add('selected');
    el.querySelector('input').checked = true;
    document.getElementById('card-fields').classList.toggle('visible', val==='tarjeta');
}
function fmtCard(inp){
    let v = inp.value.replace(/\D/g,'').substring(0,16);
    inp.value = v.replace(/(.{4})/g,'$1 ').trim();
}

// Ensure the code inside is executed after the DOM is fully loaded to access element properties properly
document.addEventListener('DOMContentLoaded', () => {
    const now = new Date().toISOString().split('T')[0];
    document.getElementById('inp-checkin').min = now;
    document.getElementById('inp-checkout').min = now;
    document.getElementById('inp-checkin').addEventListener('change',function(){
        const d = new Date(this.value); d.setDate(d.getDate()+1);
        document.getElementById('inp-checkout').min = d.toISOString().split('T')[0];
    });
});
