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
            // Renderizar tarjetas
            let cardsHtml = '<div class="ai-results-container">';
            data.resultados.forEach(res => {
                cardsHtml += `
                    <a href="/hospedaje/${res.id}" class="ai-result-card">
                        <img src="${res.imagen || 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=500'}" class="ai-result-img" alt="${res.nombre}">
                        <div class="ai-result-info">
                            <h4 class="ai-result-title">${res.nombre}</h4>
                            <p class="ai-result-price">$${res.precio.toLocaleString()} COP</p>
                        </div>
                    </a>
                `;
            });
            cardsHtml += '</div>';
            appendMessage(cardsHtml, 'bot', true);
            
            // Preguntar si quiere ver más
            const tieneFiltros = data.filtros && (data.filtros.ubicacion || data.filtros.personas || data.filtros.presupuesto_maximo);
            const intencion = data.filtros.intencion || 'hospedaje';
            const baseUrl = intencion === 'experiencia' ? '/experiencias' : '/hospedajes';
            const btnLabel = intencion === 'experiencia' ? 'Ver todas las experiencias' : 'Ver todos los hospedajes';
            
            if (tieneFiltros) {
                const pregunta = `¿Te gustaría ver más ${intencion === 'experiencia' ? 'experiencias' : 'opciones'} similares en nuestro catálogo completo?`;
                appendMessage(pregunta, 'bot');
                speakText(pregunta);
                
                // Crear botón de redirección
                const params = new URLSearchParams();
                if (data.filtros.ubicacion) params.append('q', data.filtros.ubicacion);
                if (data.filtros.personas && intencion === 'hospedaje') params.append('huespedes', data.filtros.personas);
                if (data.filtros.presupuesto_maximo) params.append('precio_max', data.filtros.presupuesto_maximo);
                
                const btnHtml = `
                    <div style="margin-top:10px; display:flex; gap:10px;">
                        <a href="${baseUrl}?${params.toString()}" class="ai-action-btn primary">
                            <i class="fas fa-search-plus"></i> ${btnLabel}
                        </a>
                    </div>
                `;
                appendMessage(btnHtml, 'bot', true);
            }
        } else {
            const intencion = (data.filtros && data.filtros.intencion) || 'hospedaje';
            const baseUrl = intencion === 'experiencia' ? '/experiencias' : '/hospedajes';
            const noRes = `No encontré ${intencion === 'experiencia' ? 'experiencias' : 'opciones'} que coincidan exactamente, pero puedes ver todo nuestro catálogo.`;
            appendMessage(noRes, 'bot');
            speakText(noRes);
            let catalogBtn = `<div style="margin-top:10px"><a href="${baseUrl}" class="ai-action-btn secondary">Ver catálogo general</a></div>`;
            appendMessage(catalogBtn, 'bot', true);
        }

        
    } catch (error) {


        console.error("Error conectando con el backend:", error);
        removeTypingIndicator();
        appendMessage("Hubo un error de conexión con el servidor.", 'bot');
    }
}
