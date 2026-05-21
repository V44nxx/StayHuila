$content = Get-Content 'static/css/hospedajes.css'
$new_responsive = '/* Responsive para tablet y móviles */
@media (max-width: 1024px) {
    .hospedajes-layout {
        flex-direction: column;
        margin-top: 110px;
        height: auto;
        overflow: visible;
    }
    
    .hospedajes-map {
        height: 250px;
        position: sticky;
        top: 80px;
        order: 1;
        width: 100%;
        flex: none;
        z-index: 100;
    }
    
    .hospedajes-list {
        order: 2;
        padding: 1.5rem 1rem;
        width: 100%;
        flex: none;
        overflow-y: visible;
    }

    .hospedajes-header h1 {
        font-size: 1.6rem;
    }

    .grid-half {
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 1.2rem;
    }
}

@media (max-width: 768px) {
    .hospedajes-layout {
        margin-top: 90px;
    }
    .hospedajes-map {
        height: 200px;
    }
    .hospedajes-header h1 {
        font-size: 1.4rem;
    }
}'
$head = $content[0..245]
$new_content = $head + $new_responsive
$new_content | Set-Content 'static/css/hospedajes.css'
