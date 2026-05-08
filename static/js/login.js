/* ── Tab switching ── */
function switchTab(t){
    document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c=>c.classList.remove('active'));
    document.getElementById('tab-'+t).classList.add('active');
    document.getElementById('content-'+t).classList.add('active');
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
