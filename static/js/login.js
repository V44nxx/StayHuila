/* ── Tab switching ── */
function switchTab(t){
    document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c=>c.classList.remove('active'));
    document.getElementById('tab-'+t).classList.add('active');
    document.getElementById('content-'+t).classList.add('active');
    document.querySelector('.tabs').style.display = '';
}

/* ── Recuperación de contraseña ── */
let _resetEmail = '';

function showForgot(){
    document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c=>c.classList.remove('active'));
    document.querySelector('.tabs').style.display = 'none';
    document.getElementById('content-forgot').classList.add('active');
    document.getElementById('forgot-step1').style.display = '';
    document.getElementById('forgot-step2').style.display = 'none';
    document.getElementById('forgot-email').value = '';
    document.getElementById('forgot-error1').style.display = 'none';
}

function backToLogin(){
    document.querySelector('.tabs').style.display = '';
    switchTab('login');
}

function resetToStep1(){
    document.getElementById('forgot-step2').style.display = 'none';
    document.getElementById('forgot-step1').style.display = '';
    document.getElementById('forgot-error1').style.display = 'none';
}

function setBtn(id, loading){
    const btn = document.getElementById(id);
    if(loading){
        btn.disabled = true;
        btn.style.opacity = '.65';
        btn.style.cursor  = 'wait';
    } else {
        btn.disabled = false;
        btn.style.opacity = '';
        btn.style.cursor  = '';
    }
}

async function sendResetCode(resend){
    const emailEl = document.getElementById('forgot-email');
    const errEl   = document.getElementById('forgot-error1');
    errEl.style.display = 'none';

    const email = resend ? _resetEmail : emailEl.value.trim();
    if(!email){ errEl.textContent = 'Ingresa tu correo electrónico.'; errEl.style.display=''; return; }

    setBtn('btn-send-code', true);
    try {
        const res  = await fetch('/api/recuperar-contrasena', {
            method:'POST', headers:{'Content-Type':'application/json'},
            body: JSON.stringify({email})
        });
        const data = await res.json();
        if(!res.ok || !data.success){
            errEl.textContent = data.error || 'Error al enviar el código.';
            errEl.style.display = '';
        } else {
            _resetEmail = email;
            document.getElementById('forgot-step2-sub').textContent =
                `Ingresa el código de 6 dígitos enviado a ${email}`;
            document.getElementById('forgot-codigo').value = '';
            document.getElementById('forgot-pw').value     = '';
            document.getElementById('forgot-pw2').value    = '';
            document.getElementById('forgot-error2').style.display = 'none';
            document.getElementById('forgot-step1').style.display = 'none';
            document.getElementById('forgot-step2').style.display = '';
            if(resend) showToast('Código reenviado a tu correo.', 'success');
        }
    } catch(e){
        errEl.textContent = 'No se pudo conectar al servidor.';
        errEl.style.display = '';
    } finally {
        setBtn('btn-send-code', false);
    }
}

async function verifyResetCode(){
    const codigo = document.getElementById('forgot-codigo').value.trim();
    const pw     = document.getElementById('forgot-pw').value;
    const pw2    = document.getElementById('forgot-pw2').value;
    const errEl  = document.getElementById('forgot-error2');
    errEl.style.display = 'none';

    if(!codigo || codigo.length !== 6){ errEl.textContent='Ingresa el código de 6 dígitos.'; errEl.style.display=''; return; }
    if(!pw || pw.length < 6)          { errEl.textContent='La contraseña debe tener al menos 6 caracteres.'; errEl.style.display=''; return; }
    if(pw !== pw2)                     { errEl.textContent='Las contraseñas no coinciden.'; errEl.style.display=''; return; }

    setBtn('btn-verify-code', true);
    try {
        const res  = await fetch('/api/verificar-reset', {
            method:'POST', headers:{'Content-Type':'application/json'},
            body: JSON.stringify({email: _resetEmail, codigo, password: pw})
        });
        const data = await res.json();
        if(!res.ok || !data.success){
            errEl.textContent = data.error || 'Error al cambiar la contraseña.';
            errEl.style.display = '';
        } else {
            showToast('¡Contraseña actualizada! Ya puedes iniciar sesión.', 'success');
            setTimeout(()=>{ backToLogin(); }, 1800);
        }
    } catch(e){
        errEl.textContent = 'No se pudo conectar al servidor.';
        errEl.style.display = '';
    } finally {
        setBtn('btn-verify-code', false);
    }
}
function togglePw(id,icon){
    const inp=document.getElementById(id);
    if(inp.type==='password'){inp.type='text';icon.className='ph ph-eye-slash pw-toggle';}
    else{inp.type='password';icon.className='ph ph-eye pw-toggle';}
}
function selectTipo(t){
    document.getElementById('card-huesped').classList.toggle('selected',t==='huesped');
    document.getElementById('card-anfitrion').classList.toggle('selected',t==='anfitrion');
    document.querySelector(`input[value="${t}"]`).checked=true;
}

/* ── Image Slider ── */
// Lista de imágenes: agrega aquí los nombres de los archivos que pongas
// en  static/images/slider/
const SLIDER_IMAGES = [
    '/static/images/slider/slide1.jpg',
    '/static/images/slider/slide2.jpg',
    '/static/images/slider/slide3.jpg',
    '/static/images/slider/slide4.jpg',
];

(function initSlider(){
    const track   = document.getElementById('sliderTrack');
    const fallback= document.getElementById('sliderFallback');
    const dotsEl  = document.getElementById('sliderDots');
    const prevBtn = document.getElementById('sliderPrev');
    const nextBtn = document.getElementById('sliderNext');

    if(!SLIDER_IMAGES.length){
        // Sin imágenes: mostrar fallback degradado y ocultar controles
        fallback.style.display='block';
        track.style.display='none';
        prevBtn.style.display='none';
        nextBtn.style.display='none';
        return;
    }
    fallback.style.display='none';

    let current = 0;
    let timer;
    const INTERVAL = 5000; // ms entre slides automáticos

    // Crear slides
    SLIDER_IMAGES.forEach((src, i)=>{
        const slide = document.createElement('div');
        slide.className = 'slider-slide';
        slide.style.backgroundImage = `url('${src}')`;
        track.appendChild(slide);

        // Punto indicador
        const dot = document.createElement('button');
        dot.className = 'slider-dot' + (i===0?' active':'');
        dot.setAttribute('aria-label','Ir a slide '+(i+1));
        dot.onclick = ()=>{ goTo(i); resetTimer(); };
        dotsEl.appendChild(dot);
    });

    function update(){
        track.style.transform = `translateX(-${current*100}%)`;
        dotsEl.querySelectorAll('.slider-dot').forEach((d,i)=>{
            d.classList.toggle('active', i===current);
        });
    }

    function goTo(n){
        current = (n + SLIDER_IMAGES.length) % SLIDER_IMAGES.length;
        update();
    }

    function resetTimer(){
        clearInterval(timer);
        timer = setInterval(()=>goTo(current+1), INTERVAL);
    }

    window.sliderMove = function(dir){ goTo(current+dir); resetTimer(); };

    update();
    resetTimer();
})();
