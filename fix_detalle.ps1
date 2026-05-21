$content = Get-Content 'static/css/detalle.css'
$new_responsive = '/* Responsive */
@media (max-width: 1024px) {
    .detalle-hero, .detalle-layout, .sugerencias-section {
        padding-left: 2rem; padding-right: 2rem;
    }
    .breadcrumb-bar { padding-left: 2rem; padding-top: 110px; }
    .detalle-layout { grid-template-columns: 1fr; gap: 2rem; }
    .detalle-right { position: static; width: 100%; max-width: 500px; margin: 0 auto; }
    .galeria-grid { height: 380px; }
    .resenas-grid { grid-template-columns: 1fr; }
    .sugerencias-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 768px) {
    .detalle-hero, .detalle-layout, .sugerencias-section {
        padding-left: 1rem; padding-right: 1rem;
    }
    .breadcrumb-bar { padding-left: 1rem; padding-top: 90px; }
    .detalle-titulo { font-size: 1.6rem; }
    .galeria-grid { grid-template-columns: 1fr; height: 280px; border-radius: 12px; }
    .galeria-side { display: none; }
    .rating-breakdown { grid-template-columns: 1fr; }
    .amenidades-grid { grid-template-columns: 1fr; }
    .sugerencias-grid { grid-template-columns: 1fr; }
    .detalle-title-row { flex-direction: column; gap: 0.5rem; }
    .host-row { align-items: flex-start; }
    .hosted-by { font-size: 1.2rem; }
}

@media (max-width: 480px) {
    .galeria-grid { height: 220px; }
    .detalle-titulo { font-size: 1.4rem; }
    .section-title { font-size: 1.2rem; }
}'
$head = $content[0..536]
$new_content = $head + $new_responsive
$new_content | Set-Content 'static/css/detalle.css'
