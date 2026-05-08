import glob
import re

new_user_menu = """        <div class="user-menu">
            <div class="language-selector">
                <i class="ph ph-globe"></i> ES
            </div>
            {% if current_user.is_authenticated %}
                {% if current_user.tipo in ['anfitrion','admin'] %}
                <a href="/panel-anfitrion" class="host-btn" style="text-decoration:none;">Panel Anfitrión</a>
                {% endif %}
                <div class="profile-btn" style="position:relative;" onclick="document.getElementById('user-dropdown').classList.toggle('show'); event.stopPropagation();">
                    <div class="gamification-points"><i class="ph-fill ph-coin"></i> {{ current_user.puntos }} pts</div>
                    <i class="ph ph-list"></i>
                    <img src="{{ current_user.foto_perfil or 'https://ui-avatars.com/api/?name=' ~ current_user.nombre ~ '&background=random' }}" alt="Avatar" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover; margin-left: 5px;">
                    
                    <!-- Dropdown -->
                    <div class="profile-dropdown" id="user-dropdown" onclick="event.stopPropagation()">
                        <div class="dropdown-header">
                            <strong>{{ current_user.nombre }} {{ current_user.apellido }}</strong>
                            <span>{{ current_user.email }}</span>
                        </div>
                        <a href="/perfil" class="dropdown-item"><i class="ph ph-user"></i> Mi Perfil</a>
                        <a href="/mis-reservas" class="dropdown-item"><i class="ph ph-calendar-check"></i> Mis Reservas</a>
                        <a href="/favoritos" class="dropdown-item"><i class="ph ph-heart"></i> Mis Favoritos</a>
                        <div class="dropdown-divider"></div>
                        <a href="/logout" class="dropdown-item danger"><i class="ph ph-sign-out"></i> Cerrar Sesión</a>
                    </div>
                </div>
            {% else %}
                <button class="host-btn" onclick="window.location.href='/login?tab=register'">Pon tu espacio en StayHuila</button>
                <div class="profile-btn" onclick="window.location.href='/login'">
                    <i class="ph ph-list"></i>
                    <i class="ph-fill ph-user-circle"></i>
                </div>
            {% endif %}
        </div>
    </header>
    
    <script>
        document.addEventListener('click', function(event) {
            var dropdown = document.getElementById('user-dropdown');
            if (dropdown && dropdown.classList.contains('show')) {
                dropdown.classList.remove('show');
            }
        });
    </script>"""

for html_file in glob.glob(r'c:\xampp\htdocs\StayHuila\templates\*.html'):
    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if '<div class="user-menu">' in content:
        content = re.sub(r'<div class="user-menu">.*?</header>\s*(<script>.*?var dropdown = document.*?<\/script>)?', new_user_menu, content, flags=re.DOTALL)
        with open(html_file, 'w', encoding='utf-8') as f:
            f.write(content)
            
print("Actualizado plantillas HTML con script para cerrar dropdown")
