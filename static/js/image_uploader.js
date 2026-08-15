/**
 * image_uploader.js — Módulo de carga y validación de imágenes en tiempo real | StayHuila
 * ==========================================================================================
 * Responsabilidades:
 *   1. Detectar selección de archivos vía clic o drag-and-drop.
 *   2. Validar en el cliente (formato, tamaño) ANTES de enviar al servidor.
 *   3. Enviar cada imagen a /api/validar-imagen para validación avanzada en el servidor
 *      (resolución, blur con OpenCV, optimización con Pillow).
 *   4. Mostrar tarjetas de vista previa con badge de estado en tiempo real.
 *   5. Gestionar la lista de imágenes válidas listas para publicar.
 *   6. Permitir eliminar imágenes individuales de la selección.
 *
 * Integración con el formulario del wizard:
 *   - Las URLs de imágenes optimizadas se almacenan en el array `ImageUploader.validUrls`.
 *   - Al enviar el formulario, en lugar de enviar archivos crudos, se envían estas URLs
 *     mediante campos ocultos (las imágenes ya están guardadas en /static/uploads/).
 */

const ImageUploader = (() => {
    // ── Estado interno del módulo ─────────────────────────────────────────────
    let _validUrls     = [];   // Array de URLs de imágenes exitosamente optimizadas
    let _pendingCount  = 0;    // Número de validaciones en curso
    let _totalSelected = 0;    // Total de archivos seleccionados en este batch
    let _isInitialized = false; // Evita registrar múltiples listeners en init()

    // ── Referencias al DOM (se inicializan en init()) ─────────────────────────
    let _zone, _input, _grid, _summary, _progressWrap, _progressFill, _progressLabel;

    // ── Constantes de validación client-side ──────────────────────────────────
    const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/jfif', 'image/pjpeg'];
    const ALLOWED_EXTS  = ['jpg', 'jpeg', 'png', 'webp', 'jfif'];
    const MAX_SIZE_BYTES = 15 * 1024 * 1024; // 15 MB (igual que el servidor)

    // ── TEXTOS DE BADGE POR ESTADO ────────────────────────────────────────────
    const BADGE_CONFIG = {
        loading:           { cls: 'badge-loading', icon: 'ph-circle-notch',  text: 'Procesando...' },
        ok:                { cls: 'badge-ok',      icon: 'ph-check-circle',   text: 'Imagen válida' },
        blurry:            { cls: 'badge-blurry',  icon: 'ph-warning',        text: 'Imagen borrosa' },
        resolution_error:  { cls: 'badge-error',   icon: 'ph-x-circle',       text: 'Resolución muy baja' },
        format_error:      { cls: 'badge-error',   icon: 'ph-x-circle',       text: 'Formato no permitido' },
        size_error:        { cls: 'badge-error',   icon: 'ph-x-circle',       text: 'Archivo muy pesado' },
        corrupt_error:     { cls: 'badge-error',   icon: 'ph-x-circle',       text: 'Archivo dañado' },
        client_format:     { cls: 'badge-error',   icon: 'ph-x-circle',       text: 'Formato no permitido' },
        client_size:       { cls: 'badge-error',   icon: 'ph-x-circle',       text: 'Archivo muy pesado' },
    };

    function _ensureDom() {
        if (!_zone) _zone = document.getElementById('img-upload-zone');
        if (!_input) _input = document.getElementById('img-upload-input');
        if (!_grid) _grid = document.getElementById('img-preview-grid');
        if (!_summary) _summary = document.getElementById('img-validation-summary');
        if (!_progressWrap) _progressWrap = document.getElementById('img-progress-wrap');
        if (!_progressFill) _progressFill = document.getElementById('img-progress-fill');
        if (!_progressLabel) _progressLabel = document.getElementById('img-progress-label');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // INIT — Conecta el módulo a los elementos del DOM del paso 6 del wizard
    // ─────────────────────────────────────────────────────────────────────────
    function init() {
        _ensureDom();

        if (!_zone || !_input) return;  // El paso 6 no está en el DOM aún

        // Remover event listeners anteriores para evitar acumulaciones
        _zone.removeEventListener('dragover', _onDragOver);
        _zone.removeEventListener('dragleave', _onDragLeave);
        _zone.removeEventListener('drop', _onDrop);
        if (_input) _input.removeEventListener('change', _onInputChange);

        _zone.addEventListener('dragover', _onDragOver);
        _zone.addEventListener('dragleave', _onDragLeave);
        _zone.addEventListener('drop', _onDrop);
        if (_input) _input.addEventListener('change', _onInputChange);
    }

    function _onDragOver(e) {
        e.preventDefault();
        _ensureDom();
        if (_zone) _zone.classList.add('drag-active');
    }

    function _onDragLeave(e) {
        _ensureDom();
        if (_zone) _zone.classList.remove('drag-active');
    }

    function _onDrop(e) {
        e.preventDefault();
        _ensureDom();
        if (_zone) _zone.classList.remove('drag-active');
        if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            _handleFiles(e.dataTransfer.files);
        }
    }

    function _onInputChange(e) {
        if (e && e.target && e.target.files && e.target.files.length > 0) {
            _handleFiles(e.target.files);
            e.target.value = '';
        }
    }

    function handleInputChange(e) {
        _onInputChange(e);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // _handleFiles — Punto de entrada cuando el usuario selecciona archivos
    // ─────────────────────────────────────────────────────────────────────────
    function _handleFiles(fileList) {
        _ensureDom();
        const files = Array.from(fileList);
        if (files.length === 0) return;

        _totalSelected  = files.length;
        _pendingCount   = files.length;

        // Mostrar barra de progreso
        _showProgress(0, files.length);

        files.forEach((file, idx) => {
            // 1. Validaciones rápidas en el cliente
            const clientStatus = _clientValidate(file);

            if (clientStatus !== 'ok') {
                // Crear tarjeta con error inmediato sin llamar al servidor
                const cardEl = _createPreviewCard(file, idx);
                _updateCard(cardEl, clientStatus, _getClientMessage(clientStatus, file), null);
                _pendingCount--;
                _updateProgress(files.length - _pendingCount, files.length);
                _updateSummary();
                return;
            }

            // 2. Crear tarjeta con vista previa inmediata
            const cardEl = _createPreviewCard(file, idx);
            _updateCard(cardEl, 'loading', 'Procesando...', null);

            // 3. Enviar al servidor para validación avanzada + optimización
            _sendToServer(file, cardEl, idx, files.length);
        });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // _clientValidate — Validación rápida en el navegador (sin red)
    // ─────────────────────────────────────────────────────────────────────────
    function _clientValidate(file) {
        const ext = file.name ? file.name.split('.').pop().toLowerCase() : '';
        const isTypeValid = ALLOWED_TYPES.includes(file.type) || ALLOWED_EXTS.includes(ext) || (file.type && file.type.startsWith('image/'));
        if (!isTypeValid) return 'client_format';
        if (file.size > MAX_SIZE_BYTES) return 'client_size';
        return 'ok';
    }

    function _getClientMessage(status, file) {
        if (status === 'client_format')
            return `Formato "${file.type || file.name.split('.').pop()}" no permitido. Usa JPG, JPEG, PNG, WEBP o JFIF.`;
        if (status === 'client_size')
            return `El archivo pesa ${(file.size / (1024*1024)).toFixed(1)} MB. Máximo permitido: 15 MB.`;
        return 'Error de validación.';
    }

    // ─────────────────────────────────────────────────────────────────────────
    // _createPreviewCard — Crea la tarjeta de previsualización en el grid
    // ─────────────────────────────────────────────────────────────────────────
    function _createPreviewCard(file, idx) {
        _ensureDom();
        const card = document.createElement('div');
        card.className = 'img-preview-card status-loading';
        card.dataset.idx = idx;

        let imgSrc = '';
        try {
            imgSrc = URL.createObjectURL(file);
        } catch(e) {
            imgSrc = '';
        }

        // Estructura con previsualización inmediata
        card.innerHTML = `
            <img src="${imgSrc}" alt="${file.name || 'Vista previa'}">
            <span class="img-preview-badge badge-loading">
                <span class="img-spinner"></span>
                Procesando...
            </span>
            <button type="button" class="img-preview-remove" title="Quitar imagen">
                <i class="ph ph-x"></i>
            </button>
            <div class="img-preview-tooltip">Verificando imagen...</div>
        `;

        // Botón eliminar
        card.querySelector('.img-preview-remove').addEventListener('click', ev => {
            ev.stopPropagation();
            try { if (imgSrc && imgSrc.startsWith('blob:')) URL.revokeObjectURL(imgSrc); } catch(e) {}
            const url = card.dataset.validUrl;
            if (url) {
                _validUrls = _validUrls.filter(u => u !== url);
            }
            card.remove();
            _updateSummary();
        });

        if (_grid) {
            _grid.appendChild(card);
        } else {
            console.error('StayHuila: No se encontró el contenedor #img-preview-grid');
        }
        return card;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // _updateCard — Actualiza badge, borde y tooltip de una tarjeta
    // ─────────────────────────────────────────────────────────────────────────
    function _updateCard(card, status, message, savedUrl) {
        const cfg = BADGE_CONFIG[status] || BADGE_CONFIG['corrupt_error'];

        // Actualizar clase de estado del borde
        card.className = card.className.replace(/status-\S+/, '').trim();
        card.classList.add(`status-${status}`);

        // Actualizar badge
        const badge = card.querySelector('.img-preview-badge');
        if (badge) {
            badge.className = `img-preview-badge ${cfg.cls}`;
            badge.innerHTML = `<i class="ph-fill ${cfg.icon}"></i> ${cfg.text}`;
        }

        // Actualizar tooltip
        const tooltip = card.querySelector('.img-preview-tooltip');
        if (tooltip) tooltip.textContent = message;

        // Si es la primera imagen válida → mostrar etiqueta "Portada"
        if (status === 'ok' && savedUrl) {
            card.dataset.validUrl = savedUrl;
            _validUrls.push(savedUrl);

            // Reemplazar preview local por la imagen ya optimizada del servidor
            const img = card.querySelector('img');
            if (img) {
                img.src = savedUrl + '?t=' + Date.now();
            }

            // Agregar etiqueta "Portada" a la primera imagen válida
            if (_validUrls.length === 1 && !card.querySelector('.img-preview-cover-tag')) {
                const tag = document.createElement('span');
                tag.className = 'img-preview-cover-tag';
                tag.textContent = '★ Portada';
                card.appendChild(tag);
            }
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // _sendToServer — POST a /api/validar-imagen con FormData
    // ─────────────────────────────────────────────────────────────────────────
    function _sendToServer(file, cardEl, idx, total) {
        const fd = new FormData();
        fd.append('foto', file);
        fd.append('idx', idx);

        fetch('/api/validar-imagen', {
            method: 'POST',
            body: fd,
        })
        .then(res => res.json())
        .then(data => {
            _updateCard(cardEl, data.status, data.message, data.saved_url || null);
        })
        .catch(() => {
            _updateCard(cardEl, 'corrupt_error', 'Error de conexión al validar la imagen.', null);
        })
        .finally(() => {
            _pendingCount--;
            _updateProgress(total - _pendingCount, total);
            _updateSummary();
        });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // _showProgress / _updateProgress — Barra de progreso
    // ─────────────────────────────────────────────────────────────────────────
    function _showProgress(done, total) {
        if (!_progressWrap) return;
        _progressWrap.classList.add('visible');
        _progressFill.style.width  = `${Math.round((done / total) * 100)}%`;
        _progressLabel.textContent = `Validando imagen ${done} de ${total}...`;
    }

    function _updateProgress(done, total) {
        if (!_progressWrap) return;
        const pct = Math.round((done / total) * 100);
        _progressFill.style.width  = `${pct}%`;
        _progressLabel.textContent = done < total
            ? `Validando imagen ${done} de ${total}...`
            : `${total} imagen(es) procesada(s)`;
        if (done >= total) {
            setTimeout(() => _progressWrap.classList.remove('visible'), 2000);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // _updateSummary — Actualiza el bloque resumen debajo del grid
    // ─────────────────────────────────────────────────────────────────────────
    function _updateSummary() {
        if (!_summary) return;
        const cards     = _grid.querySelectorAll('.img-preview-card');
        const okCards   = _grid.querySelectorAll('.img-preview-card.status-ok');
        const errCards  = _grid.querySelectorAll('.img-preview-card[class*="status-"]:not(.status-ok):not(.status-blurry):not(.status-loading)');
        const warnCards = _grid.querySelectorAll('.img-preview-card.status-blurry');

        if (cards.length === 0) {
            _summary.classList.remove('visible');
            return;
        }

        _summary.classList.add('visible');

        if (errCards.length > 0 || warnCards.length > 0) {
            if (errCards.length > 0) {
                _summary.className = 'img-validation-summary visible has-errors';
                _summary.innerHTML = `<i class="ph-fill ph-x-circle"></i>
                    ${errCards.length} imagen(es) rechazada(s). ${okCards.length} válida(s) lista(s) para publicar.`;
            } else {
                _summary.className = 'img-validation-summary visible has-warnings';
                _summary.innerHTML = `<i class="ph-fill ph-warning"></i>
                    ${warnCards.length} imagen(es) borrosa(s). Considera reemplazarlas.`;
            }
        } else if (okCards.length > 0) {
            _summary.className = 'img-validation-summary visible all-ok';
            _summary.innerHTML = `<i class="ph-fill ph-check-circle"></i>
                ¡Todo listo! ${okCards.length} imagen(es) optimizada(s) y lista(s) para publicar.`;
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // reset — Limpia el estado al cerrar/reiniciar el wizard
    // ─────────────────────────────────────────────────────────────────────────
    function reset() {
        _validUrls     = [];
        _pendingCount  = 0;
        _totalSelected = 0;
        _isInitialized = false;
        if (_grid)    _grid.innerHTML    = '';
        if (_summary) _summary.classList.remove('visible');
        if (_progressWrap) _progressWrap.classList.remove('visible');
    }

    function loadExistingUrls(urls) {
        if (!Array.isArray(urls) || urls.length === 0) return;
        init();
        _validUrls = [...urls];
        if (_grid) {
            urls.forEach((url, idx) => {
                const cardId = 'card-exist-' + idx + '-' + Date.now();
                const card = document.createElement('div');
                card.className = 'img-preview-card';
                card.id = cardId;
                card.dataset.url = url;
                card.innerHTML = `
                    <img src="${url}" alt="Vista previa">
                    <div class="img-preview-overlay">
                        <span class="img-preview-badge badge-ok">
                            <i class="ph ph-check-circle"></i> Imagen cargada
                        </span>
                        <button type="button" class="img-preview-remove" title="Eliminar imagen" onclick="event.stopPropagation(); ImageUploader.removeCard('${cardId}', '${url}')">
                            <i class="ph ph-trash"></i>
                        </button>
                    </div>
                `;
                _grid.appendChild(card);
            });
        }
        _updateSummary();
    }

    function removeCard(cardId, url) {
        if (url) {
            _validUrls = _validUrls.filter(u => u !== url);
        }
        const card = document.getElementById(cardId);
        if (card) card.remove();
        _updateSummary();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // API pública del módulo
    // ─────────────────────────────────────────────────────────────────────────
    return {
        init,
        reset,
        loadExistingUrls,
        removeCard,
        handleInputChange,
        /** Devuelve el array de URLs de imágenes válidas y optimizadas. */
        getValidUrls: () => [..._validUrls],
        /** True si aún hay validaciones en curso. */
        isProcessing: () => _pendingCount > 0,
    };
})();

// Inicializar cuando el DOM esté listo
// (el wizard llama a ImageUploader.init() cuando llega al paso 6)
