$content = Get-Content 'static/css/style.css'
$head = $content[0..761]
$tail = $content[809..($content.Length-1)]
$responsive = Get-Content 'static/css/responsive_fix.css'
$new_content = $head + $responsive + $tail
$new_content | Set-Content 'static/css/style.css'
