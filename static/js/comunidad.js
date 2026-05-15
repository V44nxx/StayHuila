// comunidad.js

/* ── Estado global ────────────────────────────────────────────── */
let selectedImageFile = null;
let selectedRec = null; // { tipo, id, nombre, municipio, imagen }
let currentTab = 'feed';
let postsLoaded = false;
let exploreLoaded = false;

/* ── Utilidades ───────────────────────────────────────────────── */
function formatDate(isoString) {
    if (!isoString) return '';
    const date = new Date(isoString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60)     return 'Hace un momento';
    if (diff < 3600)   return `Hace ${Math.floor(diff/60)} min`;
    if (diff < 86400)  return `Hace ${Math.floor(diff/3600)} h`;
    if (diff < 172800) return 'Ayer';
    return date.toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' });
}

function getAvatar(obj) {
    const name = (obj.nombre || '') + ' ' + (obj.apellido || '');
    return obj.foto_perfil || `https://ui-avatars.com/api/?name=${encodeURIComponent(name.trim())}&background=random`;
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

/* ── Tabs ─────────────────────────────────────────────────────── */
function switchTab(name, el) {
    currentTab = name;
    ['feed','explore','hospedajes','experiencias'].forEach(t => {
        document.getElementById(`section-${t}`).style.display = t === name ? 'flex' : 'none';
        document.getElementById(`section-${t}`).style.flexDirection = 'column';
    });

    // Marcar activo en los tabs del header (ELIMINADO)

    // Marcar activo en nav-menu sidebar
    document.querySelectorAll('.nav-menu a').forEach(a => a.classList.remove('active'));
    if (el) el.classList.add('active');

    if (name === 'feed' && !postsLoaded) loadPosts();
    if (name === 'explore' && !exploreLoaded) loadExplore();
    if (name === 'hospedajes') loadFeedByType('hospedajes');
    if (name === 'experiencias') loadFeedByType('experiencias');
}

/* ── Crear Post ───────────────────────────────────────────────── */
function previewImage(event) {
    const file = event.target.files[0];
    if (!file) return;
    selectedImageFile = file;
    const reader = new FileReader();
    reader.onload = e => {
        document.getElementById('preview-img').src = e.target.result;
        document.getElementById('image-preview').style.display = 'block';
    };
    reader.readAsDataURL(file);
}

function removeImage() {
    selectedImageFile = null;
    document.getElementById('post-image-input').value = '';
    document.getElementById('image-preview').style.display = 'none';
    document.getElementById('preview-img').src = '';
}

/* ── Modal de Recomendación ───────────────────────────────────── */
function openRecModal() {
    document.getElementById('rec-modal-overlay').classList.add('show');
    document.getElementById('rec-search-input').focus();
    document.body.style.overflow = 'hidden';
}

function closeRecModal() {
    document.getElementById('rec-modal-overlay').classList.remove('show');
    document.body.style.overflow = '';
}

function removeRec() {
    selectedRec = null;
    document.getElementById('rec-preview').style.display = 'none';
}

let recSearchTimeout = null;
function searchRec(q) {
    clearTimeout(recSearchTimeout);
    if (!q.trim()) {
        document.getElementById('rec-results').innerHTML = `
            <p style="text-align:center; color:var(--text-muted); padding:2rem 0;">
                <i class="ph ph-magnifying-glass" style="font-size:2rem; display:block; margin-bottom:0.5rem;"></i>
                Escribe para buscar
            </p>`;
        return;
    }
    recSearchTimeout = setTimeout(() => {
        document.getElementById('rec-results').innerHTML = '<p style="text-align:center; padding:1.5rem;"><i class="ph ph-spinner ph-spin"></i></p>';
        fetch(`/api/buscar?q=${encodeURIComponent(q)}`)
        .then(r => r.json())
        .then(data => {
            const container = document.getElementById('rec-results');
            if (!data.length) {
                container.innerHTML = '<p style="text-align:center; color:var(--text-muted); padding:2rem 0;">Sin resultados</p>';
                return;
            }
            container.innerHTML = '';
            data.forEach(item => {
                const div = document.createElement('div');
                div.className = 'rec-result-item';
                div.innerHTML = `
                    <img src="${item.imagen || 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=100'}" alt="${escapeHtml(item.nombre)}">
                    <div class="rec-item-info">
                        <h4>${escapeHtml(item.nombre)}</h4>
                        <p><i class="ph ph-map-pin"></i> ${escapeHtml(item.municipio)}</p>
                    </div>
                    <span class="rec-badge ${item.tipo}">${item.tipo === 'hospedaje' ? 'Hospedaje' : 'Experiencia'}</span>
                `;
                div.onclick = () => selectRec(item);
                container.appendChild(div);
            });
        });
    }, 350);
}

function selectRec(item) {
    selectedRec = item;
    document.getElementById('rec-preview-name').textContent = item.nombre;
    document.getElementById('rec-preview-desc').textContent = `${item.municipio} · ${item.tipo === 'hospedaje' ? 'Hospedaje' : 'Experiencia'}`;
    document.getElementById('rec-preview-img').src = item.imagen || 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=200';
    document.getElementById('rec-preview').style.display = 'block';
    closeRecModal();
}

/* ── Publicar ─────────────────────────────────────────────────── */
function submitPost() {
    const content = document.getElementById('post-content').value.trim();
    if (!content && !selectedImageFile) {
        showToast('Escribe algo o selecciona una imagen para publicar.');
        return;
    }

    const btn = document.getElementById('btn-submit-post');
    btn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Publicando...';
    btn.disabled = true;

    const formData = new FormData();
    formData.append('contenido', content);
    if (selectedImageFile) formData.append('imagen', selectedImageFile);
    if (selectedRec) {
        formData.append('rec_tipo', selectedRec.tipo);
        formData.append('rec_id', selectedRec.id);
    }

    fetch('/api/comunidad/posts', { method: 'POST', body: formData })
    .then(r => r.json())
    .then(data => {
        if (data.success) {
            document.getElementById('post-content').value = '';
            removeImage();
            removeRec();
            postsLoaded = false;
            loadPosts();
            loadTendencias();
        } else {
            showToast(data.error || 'Ocurrió un error.', 'error', 'error');
        }
    })
    .catch(() => showToast('Error de conexión.'), 'error', 'error')
    .finally(() => {
        btn.innerHTML = 'Publicar';
        btn.disabled = false;
    });
}

/* ── Like ─────────────────────────────────────────────────────── */
function toggleLike(postId) {
    if (!CURRENT_USER.id) { window.location.href = '/login'; return; }
    fetch(`/api/comunidad/posts/${postId}/like`, { method: 'POST' })
    .then(r => r.json())
    .then(data => {
        if (!data.success) return;
        const btn = document.getElementById(`like-btn-${postId}`);
        const cnt = document.getElementById(`like-count-${postId}`);
        let n = parseInt(cnt.textContent);
        if (data.status === 'liked') {
            btn.classList.add('liked');
            btn.querySelector('i').className = 'ph-fill ph-heart';
            cnt.textContent = n + 1;
        } else {
            btn.classList.remove('liked');
            btn.querySelector('i').className = 'ph ph-heart';
            cnt.textContent = Math.max(0, n - 1);
        }
    });
}

/* ── Comentarios ──────────────────────────────────────────────── */
function toggleComments(postId) {
    const sec = document.getElementById(`comments-section-${postId}`);
    if (sec.style.display === 'none' || sec.style.display === '') {
        sec.style.display = 'block';
        loadComments(postId);
    } else {
        sec.style.display = 'none';
    }
}

function loadComments(postId) {
    const list = document.getElementById(`comments-list-${postId}`);
    list.innerHTML = '<div style="text-align:center; padding:1rem;"><i class="ph ph-spinner ph-spin"></i></div>';
    fetch(`/api/comunidad/posts/${postId}/comentarios`)
    .then(r => r.json())
    .then(data => {
        list.innerHTML = '';
        if (!data.length) {
            list.innerHTML = '<p style="text-align:center; color:var(--text-muted); font-size:0.88rem; padding:0.5rem 0;">Sé el primero en comentar.</p>';
            return;
        }

        const map = {};
        const roots = [];
        data.forEach(c => map[c.id] = {...c, replies: []});
        data.forEach(c => {
            if (c.parent_id && map[c.parent_id]) {
                map[c.parent_id].replies.push(map[c.id]);
            } else {
                roots.push(map[c.id]);
            }
        });

        function renderComment(c, isReply = false) {
            const delBtn = c.usuario_id === CURRENT_USER.id ? 
                `<button onclick="deleteComment(${c.id}, ${postId})" style="background:none;border:none;color:red;cursor:pointer;font-size:0.9rem;padding:0;margin-left:10px;" title="Eliminar"><i class="ph ph-trash"></i></button>` : '';
            const replyBtn = CURRENT_USER.id && !isReply ? 
                `<button onclick="showReplyInput(${c.id})" style="background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:0.8rem;font-weight:600;margin-left:10px;padding:0;">Responder</button>` : '';

            const wrapper = document.createElement('div');
            wrapper.style.marginLeft = isReply ? '3rem' : '0';
            wrapper.style.marginBottom = isReply ? '0.5rem' : '1rem';
            wrapper.style.position = 'relative';

            wrapper.innerHTML = `
                <div class="comment" style="margin-bottom: 0.3rem;">
                    <img src="${getAvatar(c)}" alt="${escapeHtml(c.nombre)}">
                    <div class="comment-bubble" style="width: 100%;">
                        <div style="display:flex;justify-content:space-between;align-items:flex-start;">
                            <strong>${escapeHtml(c.nombre)} ${escapeHtml(c.apellido)}</strong>
                            ${delBtn}
                        </div>
                        <p style="margin-top:0.2rem;">${escapeHtml(c.contenido)}</p>
                        <div style="margin-top:0.3rem;display:flex;align-items:center;">
                            <span class="comment-time">${formatDate(c.fecha_creacion)}</span>
                            ${replyBtn}
                        </div>
                    </div>
                </div>
                <div id="reply-input-${c.id}" style="display:none; margin-left: 2.5rem; margin-top: 0.5rem; flex-direction: row; gap: 0.5rem; align-items: center;">
                    <input type="text" id="reply-text-${c.id}" placeholder="Escribe una respuesta..."
                           style="flex:1; border:1px solid var(--border); border-radius:20px; padding:0.4rem 1rem; font-size:0.9rem; outline:none;"
                           onkeypress="if(event.key==='Enter') submitComment(${postId}, ${c.id})">
                    <button onclick="submitComment(${postId}, ${c.id})" style="background:var(--primary);color:white;border:none;border-radius:50%;width:30px;height:30px;cursor:pointer;"><i class="ph ph-paper-plane-right"></i></button>
                </div>
            `;
            list.appendChild(wrapper);

            if (c.replies.length > 0) {
                c.replies.forEach(r => renderComment(r, true));
            }
        }

        roots.forEach(c => renderComment(c, false));
    });
}

function showReplyInput(commentId) {
    const el = document.getElementById(`reply-input-${commentId}`);
    if (el.style.display === 'none') {
        el.style.display = 'flex';
        document.getElementById(`reply-text-${commentId}`).focus();
    } else {
        el.style.display = 'none';
    }
}

function submitComment(postId, parentId = null) {
    if (!CURRENT_USER.id) { window.location.href = '/login'; return; }
    let input;
    if (parentId) {
        input = document.getElementById(`reply-text-${parentId}`);
    } else {
        input = document.getElementById(`comment-input-${postId}`);
    }
    
    const content = input.value.trim();
    if (!content) return;

    fetch(`/api/comunidad/posts/${postId}/comentarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contenido: content, parent_id: parentId })
    })
    .then(r => r.json())
    .then(data => {
        if (data.success) {
            input.value = '';
            if (parentId) {
                document.getElementById(`reply-input-${parentId}`).style.display = 'none';
            }
            const cnt = document.getElementById(`comment-count-${postId}`);
            cnt.textContent = parseInt(cnt.textContent) + 1;
            loadComments(postId);
        } else {
            showToast(data.error || 'Error al comentar', 'error', 'error');
        }
    });
}

function deleteComment(commentId, postId) {
    if (!confirm("¿Estás seguro de que deseas eliminar este comentario?")) return;
    fetch(`/api/comunidad/comentarios/${commentId}`, { method: 'DELETE' })
    .then(r => r.json())
    .then(data => {
        if (data.success) {
            const cnt = document.getElementById(`comment-count-${postId}`);
            cnt.textContent = Math.max(0, parseInt(cnt.textContent) - 1);
            loadComments(postId);
            showToast('Comentario eliminado.');
        } else {
            showToast(data.error || 'Error al eliminar', 'error', 'error');
        }
    });
}

function deletePost(postId) {
    if (!confirm("¿Estás seguro de que deseas eliminar esta publicación?")) return;
    fetch(`/api/comunidad/posts/${postId}`, { method: 'DELETE' })
    .then(r => r.json())
    .then(data => {
        if (data.success) {
            const el = document.getElementById(`post-${postId}`);
            if (el) el.remove();
            showToast('Publicación eliminada correctamente.');
        } else {
            showToast(data.error || 'Error al eliminar', 'error', 'error');
        }
    });
}

/* ── Render de un Post ────────────────────────────────────────── */
function renderPost(post) {
    const div = document.createElement('div');
    div.className = 'post-card';
    div.id = `post-${post.id}`;

    const likedClass = post.user_liked ? 'liked' : '';
    const likeIcon   = post.user_liked ? 'ph-fill ph-heart' : 'ph ph-heart';

    // Tarjeta de recomendación
    let recHTML = '';
    if (post.tipo_recomendacion && (post.hospedaje_id || post.experiencia_id)) {
        const recId    = post.hospedaje_id || post.experiencia_id;
        const recTipo  = post.tipo_recomendacion;
        const recUrl   = recTipo === 'hospedaje' ? `/hospedaje/${recId}` : `/experiencia/${recId}`;
        const recImg   = post.rec_imagen || 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=200';
        const recNombre= post.rec_nombre || 'Lugar recomendado';
        const recMun   = post.rec_municipio || '';
        const recType  = recTipo === 'hospedaje' ? 'Hospedaje' : 'Experiencia';

        recHTML = `
            <a class="post-rec-card" href="${recUrl}">
                <img src="${escapeHtml(recImg)}" alt="${escapeHtml(recNombre)}">
                <div class="post-rec-info">
                    <span class="rec-type"><i class="ph ph-map-pin"></i> ${recType} recomendado</span>
                    <h4>${escapeHtml(recNombre)}</h4>
                    <p><i class="ph ph-map-pin"></i> ${escapeHtml(recMun)}, Huila &nbsp;·&nbsp; Ver más →</p>
                </div>
            </a>`;
    }

    const commentInput = CURRENT_USER.id ? `
        <div class="create-comment">
            <img src="${getAvatar(CURRENT_USER)}" alt="Tú">
            <input type="text" id="comment-input-${post.id}" placeholder="Escribe un comentario..."
                   onkeypress="if(event.key==='Enter') submitComment(${post.id})">
            <button onclick="submitComment(${post.id})"><i class="ph ph-paper-plane-right"></i></button>
        </div>` : '';

    const deletePostBtn = post.usuario_id === CURRENT_USER.id ? 
        `<button onclick="deletePost(${post.id})" style="background:none; border:none; color:#ef4444; font-size:1.1rem; cursor:pointer;" title="Eliminar post"><i class="ph ph-trash"></i></button>` : '';

    div.innerHTML = `
        <div class="post-header">
            <img src="${getAvatar(post)}" alt="${escapeHtml(post.nombre)}">
            <div class="post-meta" style="flex:1;">
                <strong>${escapeHtml(post.nombre)} ${escapeHtml(post.apellido)}</strong>
                <span>${formatDate(post.fecha_creacion)}</span>
            </div>
            ${deletePostBtn}
        </div>
        ${post.contenido ? `<div class="post-content">${escapeHtml(post.contenido)}</div>` : ''}
        ${post.imagen_url ? `<img src="${post.imagen_url}" class="post-image" alt="Foto del post">` : ''}
        ${recHTML}

        <div class="post-actions">
            <button class="${likedClass}" id="like-btn-${post.id}" onclick="toggleLike(${post.id})">
                <i class="${likeIcon}"></i>
                <span id="like-count-${post.id}">${post.likes_count}</span> Me gusta
            </button>
            <button onclick="toggleComments(${post.id})">
                <i class="ph ph-chat-circle"></i>
                <span id="comment-count-${post.id}">${post.comentarios_count}</span> Comentar
            </button>
            <button onclick="sharePost(${post.id})">
                <i class="ph ph-share-network"></i> Compartir
            </button>
        </div>

        <div class="comments-section" id="comments-section-${post.id}">
            <div class="comments-list" id="comments-list-${post.id}"></div>
            ${commentInput}
        </div>`;
    return div;
}

function sharePost(postId) {
    if (navigator.share) {
        navigator.share({ title: 'StayHuila', url: window.location.href });
    } else {
        navigator.clipboard.writeText(window.location.href);
        showToast('¡Enlace copiado al portapapeles!');
    }
}

/* ── Cargar Feed Principal ────────────────────────────────────── */
function loadPosts() {
    const container = document.getElementById('posts-container');
    container.innerHTML = '<div style="text-align:center;padding:3rem;color:var(--text-muted);"><i class="ph ph-spinner ph-spin" style="font-size:2rem;"></i><p>Cargando...</p></div>';
    
    fetch('/api/comunidad/posts')
    .then(r => r.json())
    .then(data => {
        postsLoaded = true;
        container.innerHTML = '';
        if (!data.length) {
            container.innerHTML = `
                <div style="text-align:center;padding:3rem;background:var(--card-bg);border-radius:16px;">
                    <i class="ph ph-chats" style="font-size:3rem;display:block;margin-bottom:1rem;color:var(--text-muted);"></i>
                    <h3 style="color:var(--text-main)">¡Sé el primero en publicar!</h3>
                    <p style="color:var(--text-muted)">Comparte una foto o recomendación del Huila.</p>
                </div>`;
            return;
        }
        data.forEach(p => container.appendChild(renderPost(p)));
    })
    .catch(() => {
        document.getElementById('posts-container').innerHTML = '<p style="color:red;text-align:center;">Error al cargar. Recarga la página.</p>';
    });
}

/* ── Cargar Explorar (grid de imágenes) ───────────────────────── */
function loadExplore() {
    fetch('/api/comunidad/posts')
    .then(r => r.json())
    .then(data => {
        exploreLoaded = true;
        const grid = document.getElementById('explore-grid');
        const withImg = data.filter(p => p.imagen_url);
        if (!withImg.length) {
            grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--text-muted);padding:3rem;">Aún no hay fotos publicadas.</p>';
            return;
        }
        grid.innerHTML = '';
        withImg.forEach(p => {
            const card = document.createElement('div');
            card.className = 'explore-card';
            card.innerHTML = `
                <img src="${p.imagen_url}" alt="Post">
                <div class="explore-card-overlay">
                    <strong>${escapeHtml(p.nombre)} ${escapeHtml(p.apellido)}</strong>
                    <span><i class="ph-fill ph-heart"></i> ${p.likes_count} · <i class="ph ph-chat-circle"></i> ${p.comentarios_count}</span>
                </div>`;
            card.onclick = () => {
                switchTab('feed', null);
                setTimeout(() => {
                    const el = document.getElementById(`post-${p.id}`);
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 400);
            };
            grid.appendChild(card);
        });
    });
}

/* ── Feed filtrado por recomendaciones de tipo ────────────────── */
function loadFeedByType(tipo) {
    const containerId = `${tipo}-feed-container`;
    const container = document.getElementById(containerId);
    container.innerHTML = '<div style="text-align:center;padding:3rem;color:var(--text-muted);"><i class="ph ph-spinner ph-spin" style="font-size:2rem;"></i></div>';

    fetch('/api/comunidad/posts')
    .then(r => r.json())
    .then(data => {
        // Filtrar posts que recomiendan ese tipo
        const singular = tipo === 'hospedajes' ? 'hospedaje' : 'experiencia';
        const filtered = data.filter(p => p.tipo_recomendacion === singular);
        container.innerHTML = '';
        if (!filtered.length) {
            container.innerHTML = `
                <div style="text-align:center;padding:3rem;background:var(--card-bg);border-radius:16px;">
                    <i class="ph ph-map-pin" style="font-size:3rem;display:block;margin-bottom:1rem;color:var(--text-muted);"></i>
                    <h3 style="color:var(--text-main)">Aún no hay recomendaciones</h3>
                    <p style="color:var(--text-muted)">Sé el primero en recomendar un ${singular} del Huila.</p>
                </div>`;
            return;
        }
        filtered.forEach(p => container.appendChild(renderPost(p)));
    });
}

/* ── Lugares populares en la sidebar ─────────────────────────── */
function loadPopularPlaces() {
    fetch('/api/buscar?q=')
    .then(r => r.json())
    .then(data => {
        const container = document.getElementById('popular-places');
        if (!container) return;
        const shown = data.slice(0, 4);
        container.innerHTML = '';
        shown.forEach(item => {
            const url = item.tipo === 'hospedaje' ? `/hospedaje/${item.id}` : `/experiencia/${item.id}`;
            const div = document.createElement('div');
            div.style.cssText = 'display:flex;gap:0.7rem;align-items:center;margin-bottom:0.8rem;cursor:pointer;';
            div.onclick = () => window.location.href = url;
            div.innerHTML = `
                <img src="${item.imagen || 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=80'}" 
                     style="width:44px;height:44px;border-radius:8px;object-fit:cover;">
                <div style="flex:1;">
                    <strong style="display:block;font-size:0.88rem;color:var(--text-main)">${escapeHtml(item.nombre)}</strong>
                    <span style="font-size:0.78rem;color:var(--text-muted)">${escapeHtml(item.municipio)}</span>
                </div>`;
            container.appendChild(div);
        });
    })
    .catch(() => {});
}

/* ── Tendencias (Hashtags) ────────────────────────────────────── */
function loadTendencias() {
    fetch('/api/comunidad/tendencias')
    .then(r => r.json())
    .then(data => {
        const container = document.getElementById('tendencias-container');
        if (!container) return;
        
        if (!data.length) {
            container.innerHTML = '<p style="color:var(--text-muted);font-size:0.9rem;text-align:center;padding:1rem;">Aún no hay tendencias.<br>¡Usa un # en tu próximo post!</p>';
            return;
        }
        
        container.innerHTML = '';
        data.forEach(t => {
            container.innerHTML += `
                <div class="trending-topic" onclick="switchTab('feed', null); document.getElementById('post-content').value='${t.tag} '; document.getElementById('post-content').focus();" style="cursor:pointer;">
                    <span>${t.rank} · Tendencia en Huila</span>
                    <strong>${escapeHtml(t.tag)}</strong>
                    <span>${t.count} post${t.count !== 1 ? 's' : ''}</span>
                </div>
            `;
        });
    })
    .catch(() => {});
}

/* ── Init ─────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
    // Cerrar modals al hacer clic fuera
    document.getElementById('rec-modal-overlay').addEventListener('click', function(e) {
        if (e.target === this) closeRecModal();
    });

    // Tab inicial: feed
    switchTab('feed', document.querySelector('.nav-menu a.active'));
    loadPopularPlaces();
    loadTendencias();
});
