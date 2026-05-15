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

    // ── Referencias al DOM (se inicializan en init()) ─────────────────────────
    let _zone, _input, _grid, _summary, _progressWrap, _progressFill, _progressLabel;

    // ── Constantes de validación client-side ──────────────────────────────────
    const ALLOWED_TYPES  = ['image/jpeg', 'image/jpg', 'image/png'];
    const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

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

    // ─────────────────────────────────────────────────────────────────────────
    // INIT — Conecta el módulo a los elementos del DOM del paso 6 del wizard
    // ─────────────────────────────────────────────────────────────────────────
    function init() {
        _zone         = document.getElementById('img-upload-zone');
        _input        = document.getElementById('img-upload-input');
        _grid         = document.getElementById('img-preview-grid');
        _summary      = document.getElementById('img-validation-summary');
        _progressWrap = document.getElementById('img-progress-wrap');
        _progressFill = document.getElementById('img-progress-fill');
        _progressLabel= document.getElementById('img-progress-label');

        if (!_zone || !_input) return;  // El paso 6 no está en el DOM aún

        // Abrir selector de archivos al hacer clic en la zona
        _zone.addEventListener('click', () => _input.click());

        // Selección manual de archivos
        _input.addEventListener('change', e => _handleFiles(e.target.files));

        // Drag & Drop — efectos visuales
        _zone.addEventListener('dragover', e => {
            e.preventDefault();
            _zone.classList.add('drag-active');
        });
        _zone.addEventListener('dragleave', () => _zone.classList.remove('drag-active'));
        _zone.addEventListener('drop', e => {
            e.preventDefault();
            _zone.classList.remove('drag-active');
            _handleFiles(e.dataTransfer.files);
        });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // _handleFiles — Punto de entrada cuando el usuario selecciona archivos
    // ─────────────────────────────────────────────────────────────────────────
    function _handleFiles(fileList) {
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

            // 2. Crear tarjeta con skeleton mientras se procesa en el servidor
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
        if (!ALLOWED_TYPES.includes(file.type)) return 'client_format';
        if (file.size > MAX_SIZE_BYTES)          return 'client_size';
        return 'ok';
    }

    function _getClientMessage(status, file) {
        if (status === 'client_format')
            return `Formato "${file.type || file.name.split('.').pop()}" no permitido. Usa JPG o PNG.`;
        if (status === 'client_size')
            return `El archivo pesa ${(file.size / (1024*1024)).toFixed(1)} MB. Máximo permitido: 5 MB.`;
        return 'Error de validación.';
    }

    // ─────────────────────────────────────────────────────────────────────────
    // _createPreviewCard — Crea la tarjeta de previsualización en el grid
    // ─────────────────────────────────────────────────────────────────────────
    function _createPreviewCard(file, idx) {
        const card = document.createElement('div');
        card.className = 'img-preview-card status-loading';
        card.dataset.idx = idx;

        // Skeleton inicial
        card.innerHTML = `
            <div class="img-preview-skeleton"></div>
            <span class="img-preview-badge badge-loading">
                <span class="img-spinner"></span>
                Procesando...
            </span>
            <button type="button" class="img-preview-remove" title="Quitar imagen">
                <i class="ph ph-x"></i>
            </button>
            <div class="img-preview-tooltip">Verificando imagen...</div>
        `;

        // Si el archivo pasa cliente-check, mostrar preview local mientras el servidor responde
        if (_clientValidate(file) === 'ok') {
            const reader = new FileReader();
            reader.onload = e => {
                const skeleton = card.querySelector('.img-preview-skeleton');
                if (skeleton) {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.alt = file.name;
                    skeleton.replaceWith(img);
                }
            };
            reader.readAsDataURL(file);
        }

        // Botón eliminar
        card.querySelector('.img-preview-remove').addEventListener('click', ev => {
            ev.stopPropagation();
            // Si tenía URL válida, quitarla del array
            const url = card.dataset.validUrl;
            if (url) {
                _validUrls = _validUrls.filter(u => u !== url);
            }
            card.remove();
            _updateSummary();
        });

        _grid.appendChild(card);
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
            const existing = card.querySelector('img');
            if (existing) {
                existing.src = savedUrl + '?t=' + Date.now();
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
        if (_grid)    _grid.innerHTML    = '';
        if (_summary) _summary.classList.remove('visible');
        if (_progressWrap) _progressWrap.classList.remove('visible');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // API pública del módulo
    // ─────────────────────────────────────────────────────────────────────────
    return {
        init,
        reset,
        /** Devuelve el array de URLs de imágenes válidas y optimizadas. */
        getValidUrls: () => [..._validUrls],
        /** True si aún hay validaciones en curso. */
        isProcessing: () => _pendingCount > 0,
    };
})();

// Inicializar cuando el DOM esté listo
// (el wizard llama a ImageUploader.init() cuando llega al paso 6)
