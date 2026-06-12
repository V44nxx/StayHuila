        document.addEventListener('click', function (event) {
            var dropdown = document.getElementById('user-dropdown');
            if (dropdown && dropdown.classList.contains('show')) {
                dropdown.classList.remove('show');
            }
        });

        // WIZARD LOGIC
        let currentStep = 1;
        const totalSteps = 6;

        // ?? Modo edici?n ??
        let _editingId   = null;  // ID de la publicaci?n en edici?n (null = creaci?n)
        let _editingTipo = null;  // tipo: 'hospedaje' | 'experiencia'

        function limitDigits(input, maxLength) {
            input.value = input.value.replace(/\D/g, '').slice(0, maxLength);
        }

        function clampNumberInput(input, min, max) {
            input.value = input.value.replace(/[^\d]/g, '');
            if (input.value === '') return;
            let value = parseInt(input.value, 10);
            if (Number.isNaN(value)) value = min;
            input.value = Math.max(min, Math.min(max, value));
        }

        function validarCapacidadExperiencia() {
            const minEl = document.getElementById('e-cap-min');
            const maxEl = document.getElementById('e-cap-max');
            if (!minEl || !maxEl) return true;
            const minV = parseInt(minEl.value, 10) || 1;
            const maxV = parseInt(maxEl.value, 10) || 1;
            const invalid = minV > maxV;
            minEl.setCustomValidity(invalid ? 'La capacidad minima no puede ser mayor que la maxima.' : '');
            return !invalid;
        }

        const categoriesData = {
            hospedaje: [
                "Finca", "Caba?a", "Glamping", "Habitaci?n privada", "Hotel boutique", "Casa entera"
            ],
            experiencia: [
                "Aventura", "Cultural", "Gastronom?a", "Naturaleza", "Deportes", "Bienestar", "Arte", "Noche"
            ]
        };

        function updateCategories() {
            const tipo = document.getElementById('pub-tipo').value;
            const catGroup = document.getElementById('cat-group');
            const pubCategoria = document.getElementById('pub-categoria');
            
            if (pubCategoria) {
                pubCategoria.innerHTML = '';
                
                if (tipo && categoriesData[tipo]) {
                    if (catGroup) catGroup.style.display = 'block';
                    categoriesData[tipo].forEach(cat => {
                        let option = document.createElement('option');
                        option.value = cat;
                        option.textContent = cat;
                        pubCategoria.appendChild(option);
                    });
                } else {
                    if (catGroup) catGroup.style.display = 'none';
                }
            }

            // Toggle form fields for step 4 and 5
            const hFields4 = document.getElementById('fields-hospedaje-4');
            const eFields4 = document.getElementById('fields-experiencia-4');
            const hFields5 = document.getElementById('fields-hospedaje-5');
            const eFields5 = document.getElementById('fields-experiencia-5');
            const lblDin = document.querySelector('.lbl-tipo-dinamico');

            if(tipo === 'hospedaje') {
                if(hFields4) hFields4.style.display = 'block';
                if(eFields4) eFields4.style.display = 'none';
                if(hFields5) hFields5.style.display = 'block';
                if(eFields5) eFields5.style.display = 'none';
                if(lblDin) lblDin.textContent = 'del alojamiento';
            } else if (tipo === 'experiencia') {
                if(hFields4) hFields4.style.display = 'none';
                if(eFields4) eFields4.style.display = 'block';
                if(hFields5) hFields5.style.display = 'none';
                if(eFields5) eFields5.style.display = 'block';
                if(lblDin) lblDin.textContent = 'de la experiencia';
            } else {
                if(hFields4) hFields4.style.display = 'none';
                if(eFields4) eFields4.style.display = 'none';
                if(hFields5) hFields5.style.display = 'none';
                if(eFields5) eFields5.style.display = 'none';
                if(lblDin) lblDin.textContent = 'del anuncio';
            }
        }

        function openWizard(tipo = null) {
            const pubTipo = document.getElementById('pub-tipo');
            
            // Restaurar opciones completas
            pubTipo.innerHTML = `
                <option value="" disabled ${tipo === null ? 'selected' : ''}>Selecciona un tipo...</option>
                <option value="hospedaje" ${tipo === 'hospedaje' ? 'selected' : ''}>Hospedaje</option>
                <option value="experiencia" ${tipo === 'experiencia' ? 'selected' : ''}>Experiencia</option>
            `;

            if (tipo) {
                // Eliminar la otra opci?n y bloquear el selector
                Array.from(pubTipo.options).forEach(opt => {
                    if (opt.value !== tipo && opt.value !== "") {
                        opt.remove();
                    }
                });
                pubTipo.disabled = true; // Para que no despliegue el men? o no se sienta editable
            } else {
                pubTipo.disabled = false;
                pubTipo.value = "";
            }

            updateCategories();
            document.getElementById('wizard-modal').classList.add('show');
            document.body.style.overflow = 'hidden';
            currentStep = 1;
            updateWizard();
        }

        function closeWizard() {
            document.getElementById('wizard-modal').classList.remove('show');
            document.body.style.overflow = 'auto';
            if (typeof ImageUploader !== 'undefined') ImageUploader.reset();
            // Resetear modo edici?n
            _editingId   = null;
            _editingTipo = null;
            document.getElementById('pub-id-edit').value = '';
            const titleEl = document.getElementById('wizard-title-action');
            if (titleEl) titleEl.textContent = '/ Crear publicaci?n';
            // Restaurar campo documento como requerido
            const docEl = document.getElementById('v-documento');
            if (docEl) { docEl.removeAttribute('disabled'); docEl.setAttribute('required', ''); docEl.value = ''; }
        }

        function updateWizard() {
            // Steps visibility
            document.querySelectorAll('.wizard-step').forEach((el, index) => {
                el.classList.toggle('active', index + 1 === currentStep);
            });
            // Dots
            document.querySelectorAll('.step-dot').forEach((el, index) => {
                el.classList.toggle('active', index + 1 === currentStep);
                el.classList.toggle('completed', index + 1 < currentStep);
            });
            // Buttons
            document.getElementById('btn-prev').style.visibility = currentStep === 1 ? 'hidden' : 'visible';
            const btnNext = document.getElementById('btn-next');
            if (currentStep === totalSteps) {
                btnNext.innerHTML = 'Publicar anuncio <i class="ph-bold ph-check"></i>';
            } else {
                btnNext.innerHTML = 'Siguiente';
            }
        }

        let wizardMap = null;
        let wizardMarker = null;

        function initWizardMap() {
            if (wizardMap) return;
            
            wizardMap = L.map('wizard-map').setView([2.9273, -75.2819], 8); // Huila central
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap'
            }).addTo(wizardMap);

            wizardMarker = L.marker([2.9273, -75.2819], {draggable: true}).addTo(wizardMap);
            
            // Sync values
            document.getElementById('pub-lat').value = 2.9273;
            document.getElementById('pub-lng').value = -75.2819;

            wizardMarker.on('dragend', function(e) {
                const pos = wizardMarker.getLatLng();
                updateLocationData(pos.lat, pos.lng);
            });

            wizardMap.on('click', function(e) {
                wizardMarker.setLatLng(e.latlng);
                updateLocationData(e.latlng.lat, e.latlng.lng);
            });
        }

            
        function updateLocationData(lat, lng) {
            document.getElementById('pub-lat').value = lat;
            document.getElementById('pub-lng').value = lng;
            
            document.getElementById('pub-municipio').value = 'Buscando...';
            document.getElementById('pub-direccion').value = 'Buscando...';
            fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`)
                .then(res => res.json())
                .then(data => {
                    if (data && data.address) {
                        const a = data.address;
                        // Ciudad / municipio principal
                        const ciudad = a.city || a.town || a.village || a.municipality || a.county || a.state_district || '';
                        // Via o calle especifica (con numero si existe)
                        let via = a.road || a.pedestrian || a.path || a.footway || a.cycleway || '';
                        if (via && a.house_number) via += ' ' + a.house_number;
                        const zona = a.neighbourhood || a.suburb || a.hamlet || a.quarter || a.city_district || '';
                        // Construir direccion completa legible: via, zona, ciudad, estado, pais
                        const partes = [];
                        if (via) partes.push(via);
                        if (zona && zona !== via) partes.push(zona);
                        if (ciudad) partes.push(ciudad);
                        if (a.state && a.state !== ciudad) partes.push(a.state);
                        if (a.country) partes.push(a.country);
                        const direccionCompleta = [...new Set(partes)].join(', ') || data.display_name || '';
                        document.getElementById('pub-municipio').value = ciudad || a.state || (data.display_name ? data.display_name.split(',')[0] : '');
                        document.getElementById('pub-direccion').value = direccionCompleta;
                    } else {
                        document.getElementById('pub-municipio').value = data.display_name ? data.display_name.split(',')[0] : '';
                        document.getElementById('pub-direccion').value = data.display_name || '';
                    }
                }).catch(e => {
                    document.getElementById('pub-municipio').value = '';
                    document.getElementById('pub-direccion').value = '';
                });
        }

        function useCurrentLocation() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const lat = position.coords.latitude;
                        const lng = position.coords.longitude;
                        wizardMarker.setLatLng([lat, lng]);
                        wizardMap.setView([lat, lng], 14);
                        updateLocationData(lat, lng);
                    },
                    (err) => {
                        showToast("No pudimos obtener tu ubicaci?n. Por favor, selecciona el lugar manualmente en el mapa.");
                    }
                );
            } else {
                showToast("Tu navegador no soporta geolocalizaci?n.");
            }
        }

        function nextStep() {
            // HTML5 Validation before proceeding
            const currentStepEl = document.getElementById('step-' + currentStep);
            const inputs = currentStepEl.querySelectorAll('input, select, textarea');
            let isValid = true;
            for (let input of inputs) {
                if (input.id === 'e-cap-min' || input.id === 'e-cap-max') {
                    validarCapacidadExperiencia();
                }
                if (!input.reportValidity()) {
                    isValid = false;
                    break;
                }
            }
            if (!isValid) return;

            if (currentStep === 2) {
                const docEl = document.getElementById('v-documento');
                if (docEl && !docEl.disabled) {
                    const digits = docEl.value.replace(/\D/g, '');
                    if (digits.length !== 10) {
                        docEl.setCustomValidity('El documento debe tener exactamente 10 digitos.');
                        docEl.reportValidity();
                        docEl.setCustomValidity('');
                        return;
                    }
                }
            }

            if (currentStep < totalSteps) {
                currentStep++;
                updateWizard();
                
                if (currentStep === 3) {
                    if (!wizardMap) {
                        initWizardMap();
                    } else {
                        setTimeout(() => wizardMap.invalidateSize(), 100);
                    }
                }

                // Inicializar el m?dulo de im?genes cuando el usuario llega al paso 6
                if (currentStep === 6 && typeof ImageUploader !== 'undefined') {
                    // Peque?o delay para que el DOM del paso sea visible
                    setTimeout(() => ImageUploader.init(), 50);
                }
            } else {
                submitWizard();
            }
        }

        function prevStep() {
            if (currentStep > 1) {
                currentStep--;
                updateWizard();
            }
        }

        function submitWizard() {
            const isEditing = !!_editingId;

            if (!isEditing) {
                const validUrls = typeof ImageUploader !== 'undefined' ? ImageUploader.getValidUrls() : [];
                if (validUrls.length === 0) {
                    showToast('Debes subir al menos una imagen valida para crear la publicacion.', 'error');
                    return;
                }
            }

            const btnLabel  = isEditing ? 'Guardando...' : 'Publicando...';
            document.getElementById('btn-next').innerHTML = `<i class="ph-bold ph-spinner ph-spin"></i> ${btnLabel}`;

            const formData = new FormData();
            const pubTipo  = document.getElementById('pub-tipo').value;
            formData.append('pub-tipo', pubTipo);
            formData.append('pub-categoria', document.getElementById('pub-categoria').value);

            // Paso 2: Verificaci?n (solo relevante al crear; en edici?n se omite en backend si ya es anfitri?n)
            formData.append('v_tipo_doc', document.getElementById('v-tipo-doc').value);
            formData.append('v_documento', document.getElementById('v-documento').value);
            formData.append('v_telefono', document.getElementById('v-telefono').value);

            // Paso 3
            const step3Inputs = document.getElementById('step-3').querySelectorAll('input, select, textarea');
            formData.append('nombre', step3Inputs[0].value);
            formData.append('descripcion', step3Inputs[1].value);
            formData.append('municipio', document.getElementById('pub-municipio').value);
            formData.append('direccion', document.getElementById('pub-direccion').value);
            formData.append('lat', document.getElementById('pub-lat').value);
            formData.append('lng', document.getElementById('pub-lng').value);

            // Paso 4 & 5
            if (pubTipo === 'hospedaje') {
                formData.append('max_huespedes', document.getElementById('h-huespedes').value);
                formData.append('habitaciones',  document.getElementById('h-habitaciones').value);
                formData.append('banos',          document.getElementById('h-banos').value);
                const servicios = Array.from(document.querySelectorAll('input[name="servicios"]:checked')).map(cb => cb.value);
                formData.append('servicios', JSON.stringify(servicios));
                formData.append('precio',          document.getElementById('h-precio').value);
                formData.append('checkin',         document.getElementById('h-checkin').value);
                formData.append('checkout',        document.getElementById('h-checkout').value);
                formData.append('estadia_minima',   document.getElementById('h-estadia-min').value || 1);
                formData.append('estadia_maxima',   document.getElementById('h-estadia-max').value || 30);
            } else {
                formData.append('e_cap_min',    document.getElementById('e-cap-min').value);
                formData.append('max_huespedes', document.getElementById('e-cap-max').value);
                formData.append('e_duracion',    document.getElementById('e-duracion').value);
                formData.append('e_nivel',       document.getElementById('e-nivel').value);
                formData.append('precio',        document.getElementById('e-precio').value);
                formData.append('e_incluye',     document.getElementById('e-incluye').value);
                formData.append('e_traer',       document.getElementById('e-traer').value);
            }

            // Paso 6 - Im?genes (URLs ya optimizadas por ImageUploader)
            const validUrls = typeof ImageUploader !== 'undefined' ? ImageUploader.getValidUrls() : [];
            validUrls.forEach(url => formData.append('fotos_urls', url));

            // En modo edici?n incluir pub_id y apuntar a /actualizar
            const endpoint = isEditing ? '/actualizar' : '/publicar';
            if (isEditing) formData.append('pub_id', _editingId);

            fetch(endpoint, { method: 'POST', body: formData })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        showToast(isEditing ? '?Publicaci?n actualizada correctamente!' : '?Felicidades! Tu publicaci?n ha sido creada y estar? visible en StayHuila pronto.');
                        closeWizard();
                        window.location.reload();
                    } else {
                        showToast('Error: ' + data.error, 'error');
                        document.getElementById('btn-next').innerHTML = isEditing
                            ? 'Reintentar guardar <i class="ph-bold ph-check"></i>'
                            : 'Reintentar Publicar <i class="ph-bold ph-check"></i>';
                    }
                })
                .catch(() => {
                    showToast('Ocurri? un error en la conexi?n.', 'error');
                    document.getElementById('btn-next').innerHTML = 'Reintentar <i class="ph-bold ph-check"></i>';
                });
        }

        /** Abre el wizard pre-llenado con los datos de una publicaci?n existente para edici?n. */
        function editPublicacion(tipo, id) {
            fetch(`/api/publicacion/${tipo}/${id}`)
                .then(r => { if (!r.ok) throw new Error('Sin permiso'); return r.json(); })
                .then(data => {
                    _editingId   = id;
                    _editingTipo = tipo;

                    openWizard(tipo);  // abre el wizard y configura el tipo

                    // Actualizar t?tulo del wizard
                    const titleEl = document.getElementById('wizard-title-action');
                    if (titleEl) titleEl.textContent = '/ Editar publicaci?n';

                    // Guardar pub_id en el campo oculto
                    document.getElementById('pub-id-edit').value = id;

                    // Pre-llenar despu?s de que el DOM del wizard sea visible
                    setTimeout(() => prefillWizard(data, tipo), 120);
                })
                .catch(() => showToast('No se pudo cargar la publicaci?n.', 'error'));
        }

        /** Pre-llena todos los campos del wizard con los datos de la publicaci?n. */
        function prefillWizard(data, tipo) {
            // ? Paso 2: Verificaci?n ? (en edici?n ya est? verificado; rellenar tel?fono y poner placeholder en doc)
            const docEl = document.getElementById('v-documento');
            if (docEl) {
                docEl.value = 'Ya verificado';
                docEl.removeAttribute('required');
                docEl.setAttribute('disabled', '');
            }

            // ? Paso 3: Info b?sica ?
            const step3 = document.getElementById('step-3');
            const inputs3 = step3.querySelectorAll('input:not([type=hidden]), textarea');
            if (inputs3[0]) inputs3[0].value = data.nombre || '';
            if (inputs3[1]) inputs3[1].value = data.descripcion || '';
            document.getElementById('pub-municipio').value = data.municipio || '';
            document.getElementById('pub-direccion').value = data.direccion_detalle || '';
            document.getElementById('pub-lat').value       = data.latitud  || '';
            document.getElementById('pub-lng').value       = data.longitud || '';

            // Si el mapa ya est? inicializado, mover el marcador a la posici?n guardada
            if (wizardMap && wizardMarker && data.latitud && data.longitud) {
                wizardMarker.setLatLng([data.latitud, data.longitud]);
                wizardMap.setView([data.latitud, data.longitud], 13);
                // Re-geolocalizar desde las coordenadas guardadas para corregir municipios viejos
                updateLocationData(data.latitud, data.longitud);
            }

            if (tipo === 'hospedaje') {
                // ? Paso 4: Detalles hospedaje ?
                document.getElementById('h-huespedes').value    = data.capacidad_max    || 2;
                document.getElementById('h-habitaciones').value = data.num_habitaciones || 1;
                document.getElementById('h-banos').value        = data.num_banos        || 1;
                // Marcar servicios existentes
                document.querySelectorAll('input[name="servicios"]').forEach(cb => {
                    cb.checked = (data.servicios || []).includes(cb.value);
                });
                // ? Paso 5: Precios hospedaje ?
                document.getElementById('h-precio').value       = data.precio_noche     || '';
                document.getElementById('h-checkin').value      = data.hora_checkin     || '15:00';
                document.getElementById('h-checkout').value     = data.hora_checkout    || '11:00';
                const minEl = document.getElementById('h-estadia-min');
                const maxEl = document.getElementById('h-estadia-max');
                if (minEl) minEl.value = data.estadia_minima || 1;
                if (maxEl) maxEl.value = data.estadia_maxima || 30;
            } else {
                // ? Paso 4: Detalles experiencia ?
                document.getElementById('e-cap-min').value  = data.capacidad_min    || 1;
                document.getElementById('e-cap-max').value  = data.capacidad_max    || 10;
                document.getElementById('e-duracion').value = data.duracion_horas   || 4;
                document.getElementById('e-nivel').value    = data.nivel_dificultad || 'moderado';
                // ? Paso 5: Precios experiencia ?
                document.getElementById('e-precio').value   = data.precio_persona   || '';
                document.getElementById('e-incluye').value  = data.que_incluye      || '';
                document.getElementById('e-traer').value    = data.que_traer        || '';
            }

            // Actualizar texto del bot?n final
            document.getElementById('btn-next').innerHTML = 'Guardar cambios <i class="ph-bold ph-check"></i>';
        }

        // El m?dulo image_uploader.js maneja toda la l?gica de carga de im?genes.
        // Se inicializa autom?ticamente cuando el usuario llega al paso 6 del wizard.

        /** Valida que estadia_minima <= estadia_maxima en el wizard. */
        function validarEstadiaWizard() {
            const minEl = document.getElementById('h-estadia-min');
            const maxEl = document.getElementById('h-estadia-max');
            const errEl = document.getElementById('estadia-wizard-error');
            if (!minEl || !maxEl || !errEl) return true;
            const minV = parseInt(minEl.value) || 1;
            const maxV = parseInt(maxEl.value) || 30;
            const invalid = minV > maxV;
            errEl.style.display = invalid ? 'block' : 'none';
            minEl.setCustomValidity(invalid ? 'El m?nimo no puede ser mayor que el m?ximo.' : '');
            return !invalid;
        }

        // ??? GESTOR DE SESIONES (EXPERIENCIAS) ??????????????????????

        function openSessionManager(expId, expName) {
            document.getElementById('sm-exp-id').value = expId;
            document.getElementById('sm-experience-name').textContent = expName;
            document.getElementById('session-manager-modal').style.display = 'flex';
            document.body.style.overflow = 'hidden';
            loadSessionsManager(expId);
        }

        function closeSessionManager() {
            document.getElementById('session-manager-modal').style.display = 'none';
            document.body.style.overflow = 'auto';
            document.getElementById('create-session-form').reset();
        }

        async function loadSessionsManager(expId) {
            const list = document.getElementById('sm-sessions-list');
            list.innerHTML = '<div style="text-align:center; padding:2rem;"><i class="ph ph-circle-notch ph-spin" style="font-size:2rem; color:var(--primary);"></i><p style="margin-top:0.5rem; color:var(--text-muted);">Cargando sesiones...</p></div>';

            try {
                const res = await fetch(`/api/experiencias/sesiones/${expId}`);
                const data = await res.json();

                if (data.success && data.sesiones.length > 0) {
                    list.innerHTML = '';
                    data.sesiones.forEach(s => {
                        const item = document.createElement('div');
                        item.style.cssText = `
                            background: white; border: 1.5px solid #e2e8f0; border-radius: 12px;
                            padding: 1rem; display: flex; justify-content: space-between; align-items: center;
                            transition: all 0.2s;
                        `;
                        
                        const [y, m, d] = s.fecha.split('-').map(Number);
                        const localDate = new Date(y, m - 1, d);
                        const isPast = new Date(s.fecha + 'T' + s.hora_inicio) < new Date();
                        const statusColor = s.estado === 'disponible' ? '#15803d' : (s.estado === 'lleno' ? '#b91c1c' : '#64748b');
                        
                        item.innerHTML = `
                            <div style="display:flex; flex-direction:column; gap:0.2rem;">
                                <div style="font-weight:700; color:var(--text-main); font-size:0.95rem;">
                                    ${localDate.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })} | ${s.hora_inicio}
                                </div>
                                <div style="font-size:0.8rem; color:var(--text-muted);">
                                    <i class="ph ph-users"></i> ${s.cupos_disponibles} / ${s.cupos_totales} cupos
                                    <span style="margin-left:0.5rem; font-weight:700; color:${statusColor}; text-transform:uppercase;">. ${s.estado}</span>
                                </div>
                            </div>
                            <div style="display:flex; gap:0.5rem;">
                                ${!isPast && s.estado !== 'cancelado' ? `
                                    <button onclick="cancelSession(${s.id})" style="background:#fee2e2; color:#b91c1c; border:none; border-radius:8px; width:36px; height:36px; display:flex; align-items:center; justify-content:center; cursor:pointer;" title="Cancelar sesi?n">
                                        <i class="ph ph-calendar-x" style="font-size:1.2rem;"></i>
                                    </button>
                                ` : ''}
                            </div>
                        `;
                        list.appendChild(item);
                    });
                } else {
                    list.innerHTML = '<div style="text-align:center; padding:3rem; border:1px dashed #cbd5e1; border-radius:12px; color:var(--text-muted);">No tienes sesiones programadas. ?Crea la primera!</div>';
                }
            } catch (err) {
                list.innerHTML = '<div style="color:#b91c1c; text-align:center; padding:2rem;">Error al cargar las sesiones.</div>';
            }
        }

        async function createSession() {
            const expId = document.getElementById('sm-exp-id').value;
            const data = {
                experiencia_id: expId,
                fecha: document.getElementById('sm-fecha').value,
                hora_inicio: document.getElementById('sm-hora-inicio').value,
                hora_fin: document.getElementById('sm-hora-fin').value,
                cupos_totales: document.getElementById('sm-cupos').value
            };

            const btn = document.querySelector('#create-session-form button');
            const originalHtml = btn.innerHTML;
            btn.innerHTML = '<i class="ph ph-circle-notch ph-spin"></i> Guardando...';
            btn.disabled = true;

            try {
                const res = await fetch('/api/experiencias/sesiones/crear', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                const result = await res.json();

                if (result.success) {
                    showToast('?Sesi?n creada con ?xito!');
                    document.getElementById('create-session-form').reset();
                    loadSessionsManager(expId);
                } else {
                    showToast(result.error || 'Error al crear la sesi?n', 'error');
                }
            } catch (err) {
                showToast('Error de conexi?n', 'error');
            } finally {
                btn.innerHTML = originalHtml;
                btn.disabled = false;
            }
        }

        async function cancelSession(sesionId) {
            if (!confirm('?Est?s seguro de cancelar esta sesi?n? Se notificar? a los viajeros con reserva.')) return;

            try {
                const res = await fetch(`/api/experiencias/sesiones/cancelar/${sesionId}`, { method: 'POST' });
                const data = await res.json();

                if (data.success) {
                    showToast('Sesi?n cancelada correctamente.');
                    loadSessionsManager(document.getElementById('sm-exp-id').value);
                } else {
                    showToast(data.error || 'Error al cancelar la sesi?n', 'error');
                }
            } catch (err) {
                showToast('Error de conexi?n', 'error');
            }
        }

