let isPanelOpen = false;
let isListening = false;
let recognition = null;
let synthesis = window.speechSynthesis;

// Inicializar Web Speech API
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'es-CO'; // Español Colombia

    recognition.onstart = function() {
        isListening = true;
        document.getElementById('ai-mic-btn').classList.add('active');
        document.getElementById('ai-assistant-btn').classList.add('listening');
    };

    recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript;
        document.getElementById('ai-text-input').value = transcript;
        sendMessage(); // Enviar automáticamente después de hablar
    };

    recognition.onerror = function(event) {
        console.error("Error en reconocimiento de voz: ", event.error);
        stopListening();
    };

    recognition.onend = function() {
        stopListening();
    };
} else {
    console.warn("La API de reconocimiento de voz no está soportada en este navegador.");
}

function toggleAssistant() {
    const panel = document.getElementById('ai-assistant-panel');
    isPanelOpen = !isPanelOpen;
    if (isPanelOpen) {
        panel.classList.remove('hidden');
        document.getElementById('ai-text-input').focus();
    } else {
        panel.classList.add('hidden');
        stopListening();
    }
}

function toggleVoice() {
    if (!recognition) {
        alert("Tu navegador no soporta búsqueda por voz.");
        return;
    }
    
    if (isListening) {
        recognition.stop();
    } else {
        recognition.start();
    }
}

function stopListening() {
    isListening = false;
    document.getElementById('ai-mic-btn').classList.remove('active');
    document.getElementById('ai-assistant-btn').classList.remove('listening');
}

function handleEnter(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

function speakText(text) {
    // Detener cualquier voz actual
    if (synthesis.speaking) {
        synthesis.cancel();
    }
    
    if (text !== '') {
        const utterThis = new SpeechSynthesisUtterance(text);
        utterThis.lang = 'es-CO';
        utterThis.pitch = 1;
        utterThis.rate = 1;
        
        // Intentar seleccionar una voz femenina en español si está disponible
        const voices = synthesis.getVoices();
        const spanishVoice = voices.find(v => v.lang.startsWith('es') && v.name.toLowerCase().includes('female'));
        if (spanishVoice) {
            utterThis.voice = spanishVoice;
        }
        
        synthesis.speak(utterThis);
    }
}

function appendMessage(text, sender, isHtml = false) {
    const messagesDiv = document.getElementById('ai-messages');
    const msgDiv = document.createElement('div');
    msgDiv.className = `ai-message ${sender}`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'msg-content';
    if (isHtml) {
        contentDiv.innerHTML = text;
    } else {
        contentDiv.textContent = text;
    }
    
    msgDiv.appendChild(contentDiv);
    messagesDiv.appendChild(msgDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function showTypingIndicator() {
    const messagesDiv = document.getElementById('ai-messages');
    const msgDiv = document.createElement('div');
    msgDiv.className = 'ai-message bot ai-typing-container';
    msgDiv.id = 'ai-typing-indicator';
    
    msgDiv.innerHTML = `
        <div class="ai-typing-indicator">
            <div class="ai-typing-dot"></div>
            <div class="ai-typing-dot"></div>
            <div class="ai-typing-dot"></div>
        </div>
    `;
    
    messagesDiv.appendChild(msgDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function removeTypingIndicator() {
    const indicator = document.getElementById('ai-typing-indicator');
    if (indicator) {
        indicator.remove();
    }
}

async function sendMessage() {
    const input = document.getElementById('ai-text-input');
    const text = input.value.trim();
    
    if (!text) return;
    
    // Mostrar mensaje del usuario
    appendMessage(text, 'user');
    input.value = '';
    
    // Mostrar indicador de "escribiendo..."
    showTypingIndicator();
    
    try {
        // Enviar al backend Flask
        const response = await fetch('/api/asistente', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ mensaje: text })
        });
        
        const data = await response.json();
        removeTypingIndicator();
        
        if (data.error) {
            appendMessage("Lo siento, tuve un problema procesando tu solicitud.", 'bot');
            return;
        }
        
        // Reproducir respuesta de voz (si se encontró un mensaje estructurado)
        const mensajeVoz = data.mensaje_respuesta || "Te muestro algunas opciones.";
        appendMessage(mensajeVoz, 'bot');
        speakText(mensajeVoz);
        
        // Si la API encontró resultados
        if (data.resultados && data.resultados.length > 0) {
            const tipo = data.filtros?.intencion || 'ambos';
            
            // Agrupar por tipo para mostrar seccion
            const hospedajes = data.resultados.filter(r => r.tipo_resultado === 'hospedaje');
            const experiencias = data.resultados.filter(r => r.tipo_resultado === 'experiencia');

            function buildCards(items) {
                let html = '<div class="ai-results-container">';
                items.forEach(res => {
                    const url = res.tipo_resultado === 'experiencia'
                        ? `/experiencia/${res.id}`
                        : `/hospedaje/${res.id}`;
                    const badge = res.tipo_resultado === 'experiencia'
                        ? '<span style="background:#F59E0B;color:white;font-size:9px;padding:2px 5px;border-radius:8px;font-weight:700;">EXPERIENCIA</span>'
                        : '<span style="background:var(--primary);color:white;font-size:9px;padding:2px 5px;border-radius:8px;font-weight:700;">HOSPEDAJE</span>';
                    const precio_label = res.tipo_resultado === 'experiencia' ? '/persona' : '/noche';
                    html += `
                        <a href="${url}" class="ai-result-card">
                            <img src="${res.imagen || 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=500'}" class="ai-result-img" alt="${res.nombre}">
                            <div class="ai-result-info">
                                <div style="margin-bottom:3px;">${badge}</div>
                                <h4 class="ai-result-title">${res.nombre}</h4>
                                <p class="ai-result-price" style="color:var(--text-muted);">${res.municipio}</p>
                                <p class="ai-result-price">$${Number(res.precio).toLocaleString('es-CO')} COP${precio_label}</p>
                            </div>
                        </a>`;
                });
                html += '</div>';
                return html;
            }

            if (hospedajes.length > 0) {
                if (experiencias.length > 0) {
                    appendMessage('<strong style="font-size:0.85rem;">🏠 Hospedajes encontrados:</strong>', 'bot', true);
                }
                appendMessage(buildCards(hospedajes), 'bot', true);
            }
            if (experiencias.length > 0) {
                if (hospedajes.length > 0) {
                    appendMessage('<strong style="font-size:0.85rem;">⛺ Experiencias encontradas:</strong>', 'bot', true);
                }
                appendMessage(buildCards(experiencias), 'bot', true);
            }

            // Botón para ver todos en la página correspondiente
            const filtros = data.filtros;
            const params = new URLSearchParams();
            if (filtros?.ubicacion) params.append('q', filtros.ubicacion);

            let verMasHTML = '';
            if (tipo === 'hospedaje' || hospedajes.length > 0) {
                verMasHTML += `<a href="/hospedajes?${params}" style="display:inline-block;margin:4px 4px 0 0;background:var(--primary);color:white;padding:6px 12px;border-radius:20px;text-decoration:none;font-size:0.8rem;font-weight:600;">Ver hospedajes →</a>`;
            }
            if (tipo === 'experiencia' || experiencias.length > 0) {
                verMasHTML += `<a href="/experiencias?${params}" style="display:inline-block;margin:4px 0 0;background:var(--secondary);color:white;padding:6px 12px;border-radius:20px;text-decoration:none;font-size:0.8rem;font-weight:600;">Ver experiencias →</a>`;
            }
            if (verMasHTML) {
                appendMessage(`<div style="margin-top:4px;">${verMasHTML}</div>`, 'bot', true);
            }

        } else {
            appendMessage("No encontré opciones exactas para tu búsqueda. Intenta con otro término, municipio o tipo de actividad. 😊", 'bot');
        }
        
    } catch (error) {
        console.error("Error conectando con el backend:", error);
        removeTypingIndicator();
        appendMessage("Hubo un error de conexión con el servidor.", 'bot');
    }
}
