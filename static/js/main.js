document.addEventListener('DOMContentLoaded', () => {
    // 1. Navbar Scroll Effect
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // 2. Categories Selection
    const categories = document.querySelectorAll('.category-item');
    categories.forEach(category => {
        category.addEventListener('click', () => {
            // Remove active class from all
            categories.forEach(c => c.classList.remove('active'));
            // Add active class to clicked
            category.classList.add('active');
            
            // Simulate a loading state or filtering action
            const listings = document.querySelector('.listings-container');
            listings.style.opacity = '0.5';
            setTimeout(() => {
                listings.style.opacity = '1';
            }, 300);
        });
    });

    // 3. Favorite Buttons Toggle
    const favoriteBtns = document.querySelectorAll('.favorite-btn');
    favoriteBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            btn.classList.toggle('active');
            
            // Optional: change icon from outline to fill
            const icon = btn.querySelector('i');
            if(btn.classList.contains('active')) {
                icon.classList.remove('ph');
                icon.classList.add('ph-fill');
            } else {
                icon.classList.remove('ph-fill');
                icon.classList.add('ph');
            }
        });
    });

    // 4. Floating Map Button
    const mapBtn = document.querySelector('.floating-map-btn');
    if (mapBtn) {
        mapBtn.addEventListener('click', () => {
            alert('Abriendo el mapa interactivo de Google Maps... (Mockup)');
        });
    }

    // 5. Book Now Buttons
    const bookBtns = document.querySelectorAll('.book-now-btn');
    bookBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            alert('Redirigiendo a la pasarela de pago para el anticipo... (Mockup)');
        });
    });

    // 6. AI Chatbot Widget Logic
    const chatbotWidget = document.querySelector('.chatbot-widget');
    const closeChatBtn = document.querySelector('.close-chat');
    const iaNavBtn = document.querySelector('a[href="#"] .nav-badge')?.parentElement;
    
    // Hide initially via JS if preferred, but it's okay to show it to get user attention
    
    if (closeChatBtn && chatbotWidget) {
        closeChatBtn.addEventListener('click', () => {
            chatbotWidget.style.transform = 'translateY(150%)'; // Hide down
            setTimeout(() => {
                chatbotWidget.style.display = 'none';
            }, 300);
        });
    }

    // Open chat from Nav
    if (iaNavBtn && chatbotWidget) {
        iaNavBtn.addEventListener('click', (e) => {
            e.preventDefault();
            chatbotWidget.style.display = 'flex';
            setTimeout(() => {
                chatbotWidget.style.transform = 'translateY(0)';
            }, 10);
        });
    }

    // Chat Logic (Send message)
    const chatInput = document.querySelector('.chatbot-input input');
    const chatSendBtn = document.querySelector('.chat-send-btn');
    const chatBody = document.querySelector('.chatbot-body');

    const sendMessage = () => {
        const text = chatInput.value.trim();
        if (text !== '') {
            // Add user message
            const userMsg = document.createElement('div');
            userMsg.className = 'chat-message user';
            userMsg.style.backgroundColor = '#E36414'; // Secondary color
            userMsg.style.color = 'white';
            userMsg.style.marginLeft = 'auto';
            userMsg.style.marginRight = '0';
            userMsg.style.borderBottomLeftRadius = '15px';
            userMsg.style.borderBottomRightRadius = '0';
            userMsg.textContent = text;
            chatBody.appendChild(userMsg);
            
            chatInput.value = '';
            chatBody.scrollTop = chatBody.scrollHeight;

            // Simulate bot typing
            setTimeout(() => {
                const botMsg = document.createElement('div');
                botMsg.className = 'chat-message bot';
                botMsg.textContent = '¡Entendido! Estoy buscando las mejores opciones de hospedaje que coincidan con tus preferencias...';
                chatBody.appendChild(botMsg);
                chatBody.scrollTop = chatBody.scrollHeight;
            }, 1000);
        }
    };

    if (chatSendBtn) {
        chatSendBtn.addEventListener('click', sendMessage);
    }
    
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }

    // 7. Voice Search Button (Hero)
    const voiceHeroBtn = document.querySelector('.voice-search-btn');
    if (voiceHeroBtn) {
        voiceHeroBtn.addEventListener('click', (e) => {
            e.preventDefault();
            alert('Escuchando... ¿A dónde te gustaría viajar en el Huila? (Mockup Voz)');
        });
    }
});
