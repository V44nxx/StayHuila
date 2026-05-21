$content = Get-Content 'static/css/mis_reservas.css'
$new_responsive = '@media (max-width: 768px) {
    .mr-page { padding: 5rem 1rem 2rem; }
    .mr-header { flex-direction: column; align-items: flex-start; gap: 0.5rem; }
    .mr-header h1 { font-size: 1.6rem; }
    .rc-img { width: 100%; height: 180px; }
    .rc-body { flex-direction: column; }
    .rc-top { flex-direction: column; gap: 0.5rem; }
    .rc-price { margin-left: 0; align-self: flex-start; margin-top: 0.5rem; }
    .filters { gap: 0.4rem; }
    .filter-btn { padding: 0.4rem 0.8rem; font-size: 0.8rem; }
}'
$head = $content[0..43]
$new_content = $head + $new_responsive
$new_content | Set-Content 'static/css/mis_reservas.css'
