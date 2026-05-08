document.addEventListener('click', function(event) {
    var dropdown = document.getElementById('user-dropdown');
    if (dropdown && dropdown.classList.contains('show')) {
        dropdown.classList.remove('show');
    }
});

function toggleCheck(el){ setTimeout(()=>el.classList.toggle('done',el.querySelector('input').checked),50); }
function countChars(el){ document.getElementById('char-count').textContent = el.value.length; }
