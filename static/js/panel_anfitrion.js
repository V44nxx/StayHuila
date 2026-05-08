        document.addEventListener('click', function (event) {
            var dropdown = document.getElementById('user-dropdown');
            if (dropdown && dropdown.classList.contains('show')) {
                dropdown.classList.remove('show');
            }
        });

        // WIZARD LOGIC
        let currentStep = 1;
        const totalSteps = 5;

        const categoriesData = {
            hospedaje: [
                "Finca", "Cabaña", "Glamping", "Habitación privada", "Hotel boutique", "Casa entera"
            ],
            experiencia: [
                "Aventura", "Cultural", "Gastronomía", "Naturaleza", "Deportes", "Bienestar", "Arte", "Noche"
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

            // Toggle form fields for step 3 and 4
            const hFields3 = document.getElementById('fields-hospedaje-3');
            const eFields3 = document.getElementById('fields-experiencia-3');
            const hFields4 = document.getElementById('fields-hospedaje-4');
            const eFields4 = document.getElementById('fields-experiencia-4');
            const lblDin = document.querySelector('.lbl-tipo-dinamico');

            if(tipo === 'hospedaje') {
                if(hFields3) hFields3.style.display = 'grid';
                if(eFields3) eFields3.style.display = 'none';
                if(hFields4) hFields4.style.display = 'block';
                if(eFields4) eFields4.style.display = 'none';
                if(lblDin) lblDin.textContent = 'del alojamiento';
            } else if (tipo === 'experiencia') {
                if(hFields3) hFields3.style.display = 'none';
                if(eFields3) eFields3.style.display = 'grid';
                if(hFields4) hFields4.style.display = 'none';
                if(eFields4) eFields4.style.display = 'block';
                if(lblDin) lblDin.textContent = 'de la experiencia';
            } else {
                if(hFields3) hFields3.style.display = 'none';
                if(eFields3) eFields3.style.display = 'none';
                if(hFields4) hFields4.style.display = 'none';
                if(eFields4) eFields4.style.display = 'none';
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
                // Eliminar la otra opción y bloquear el selector
                Array.from(pubTipo.options).forEach(opt => {
                    if (opt.value !== tipo && opt.value !== "") {
                        opt.remove();
                    }
                });
                pubTipo.disabled = true; // Para que no despliegue el menú o no se sienta editable
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
            
            function updateLocationData(lat, lng) {
                document.getElementById('pub-lat').value = lat;
                document.getElementById('pub-lng').value = lng;
                
                document.getElementById('pub-municipio').value = 'Buscando...';
                document.getElementById('pub-direccion').value = 'Buscando...';

                fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`)
                    .then(res => res.json())
                    .then(data => {
                        if(data && data.address) {
                            let muni = data.address.city || data.address.town || data.address.village || data.address.county || 'Huila';
                            let lugar = data.address.road || data.address.suburb || data.address.neighbourhood || data.display_name.split(',')[0];
                            document.getElementById('pub-municipio').value = muni;
                            document.getElementById('pub-direccion').value = lugar || muni;
                        } else {
                            document.getElementById('pub-municipio').value = 'Huila';
                            document.getElementById('pub-direccion').value = 'Ubicación seleccionada en mapa';
                        }
                    }).catch(e => {
                        document.getElementById('pub-municipio').value = 'Huila';
                        document.getElementById('pub-direccion').value = 'Ubicación seleccionada en mapa';
                    });
            }
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
                        showToast("No pudimos obtener tu ubicación. Por favor, selecciona el lugar manualmente en el mapa.");
                    }
                );
            } else {
                showToast("Tu navegador no soporta geolocalización.");
            }
        }

        function nextStep() {
            // HTML5 Validation before proceeding
            const currentStepEl = document.getElementById('step-' + currentStep);
            const inputs = currentStepEl.querySelectorAll('input, select, textarea');
            let isValid = true;
            for (let input of inputs) {
                if (!input.reportValidity()) {
                    isValid = false;
                    break;
                }
            }
            if (!isValid) return;

            if (currentStep < totalSteps) {
                currentStep++;
                updateWizard();
                
                if (currentStep === 2) {
                    if (!wizardMap) {
                        initWizardMap();
                    } else {
                        setTimeout(() => wizardMap.invalidateSize(), 100);
                    }
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
            document.getElementById('btn-next').innerHTML = '<i class="ph-bold ph-spinner ph-spin"></i> Publicando...';
            
            const formData = new FormData();
            const pubTipo = document.getElementById('pub-tipo').value;
            formData.append('pub-tipo', pubTipo);
            formData.append('pub-categoria', document.getElementById('pub-categoria').value);
            
            // Paso 2
            const step2Inputs = document.getElementById('step-2').querySelectorAll('input, select, textarea');
            // 0: Nombre (input), 1: Descripcion (textarea), 2: pub-municipio (input), 3: pub-direccion (input), 4: pub-lat, 5: pub-lng
            formData.append('nombre', step2Inputs[0].value);
            formData.append('descripcion', step2Inputs[1].value);
            formData.append('municipio', document.getElementById('pub-municipio').value);
            formData.append('direccion', document.getElementById('pub-direccion').value);
            formData.append('lat', document.getElementById('pub-lat').value);
            formData.append('lng', document.getElementById('pub-lng').value);
            
            // Paso 3 & 4
            if(pubTipo === 'hospedaje') {
                formData.append('max_huespedes', document.getElementById('h-huespedes').value);
                formData.append('habitaciones', document.getElementById('h-habitaciones').value);
                formData.append('banos', document.getElementById('h-banos').value);
                formData.append('precio', document.getElementById('h-precio').value);
                formData.append('checkin', document.getElementById('h-checkin').value);
                formData.append('checkout', document.getElementById('h-checkout').value);
            } else {
                formData.append('e_cap_min', document.getElementById('e-cap-min').value);
                formData.append('max_huespedes', document.getElementById('e-cap-max').value);
                formData.append('e_duracion', document.getElementById('e-duracion').value);
                formData.append('e_nivel', document.getElementById('e-nivel').value);
                formData.append('precio', document.getElementById('e-precio').value);
                formData.append('e_incluye', document.getElementById('e-incluye').value);
                formData.append('e_traer', document.getElementById('e-traer').value);
            }
            
            // Paso 5 - Archivos
            const fileInput = document.getElementById('file-input');
            if(fileInput && fileInput.files.length > 0) {
                for (let i = 0; i < fileInput.files.length; i++) {
                    formData.append('fotos', fileInput.files[i]);
                }
            }

            fetch('/publicar', {
                method: 'POST',
                body: formData
            })
            .then(res => res.json())
            .then(data => {
                if(data.success) {
                    showToast('¡Felicidades! Tu publicación ha sido creada y estará visible en StayHuila pronto.');
                    closeWizard();
                    window.location.reload();
                } else {
                    showToast('Error al publicar: ' + data.error, 'error', 'error');
                    document.getElementById('btn-next').innerHTML = 'Reintentar Publicar <i class="ph-bold ph-check"></i>';
                }
            })
            .catch(err => {
                showToast('Ocurrió un error en la conexión.', 'error', 'error');
                document.getElementById('btn-next').innerHTML = 'Reintentar <i class="ph-bold ph-check"></i>';
            });
        }

        // Configurar subida de archivos real
        const fileInput = document.getElementById('file-input');
        const fileBox = document.querySelector('.file-upload-box');
        
        if(fileBox && fileInput) {
            fileBox.addEventListener('click', () => {
                fileInput.click();
            });
            
            fileInput.addEventListener('change', (e) => {
                if(e.target.files.length > 0) {
                    fileBox.querySelector('h3').textContent = e.target.files.length + " archivo(s) seleccionado(s)";
                    fileBox.style.borderColor = "var(--primary)";
                    fileBox.style.background = "#eefcf6";
                } else {
                    fileBox.querySelector('h3').textContent = "Haz clic para subir fotos";
                    fileBox.style.borderColor = "var(--border)";
                    fileBox.style.background = "#f9f9f9";
                }
            });
        }
