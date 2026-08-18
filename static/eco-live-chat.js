// Live Chat - Chat en vivo
class EcoLiveChat {
    constructor() {
        this.isOpen = false;
        this.init();
    }

    init() {
        this.createChatWidget();
        this.addChatButton();
        this.addChatMessages();
    }

    createChatWidget() {
        const chatWidget = document.createElement('div');
        chatWidget.className = 'live-chat-widget';
        chatWidget.innerHTML = `
            <div class="chat-header">
                <h4>💬 Chat en vivo</h4>
                <button class="close-chat">&times;</button>
            </div>
            <div class="chat-messages">
                <div class="message bot">
                    <span class="message-content">¡Hola! ¿En qué puedo ayudarte hoy?</span>
                </div>
            </div>
            <div class="chat-input">
                <input type="text" placeholder="Escribe tu mensaje...">
                <button class="send-message">Enviar</button>
            </div>
        `;
        document.body.appendChild(chatWidget);

        chatWidget.querySelector('.close-chat').addEventListener('click', () => {
            this.toggleChat();
        });

        chatWidget.querySelector('.send-message').addEventListener('click', () => {
            this.sendMessage();
        });

        chatWidget.querySelector('input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
    }

    addChatButton() {
        const chatButton = document.createElement('button');
        chatButton.className = 'chat-button';
        chatButton.innerHTML = '💬';
        document.body.appendChild(chatButton);

        chatButton.addEventListener('click', () => {
            this.toggleChat();
        });
    }

    toggleChat() {
        const widget = document.querySelector('.live-chat-widget');
        const button = document.querySelector('.chat-button');
        
        this.isOpen = !this.isOpen;
        
        if (this.isOpen) {
            widget.style.display = 'block';
            button.style.display = 'none';
        } else {
            widget.style.display = 'none';
            button.style.display = 'block';
        }
    }

    sendMessage() {
        const input = document.querySelector('.chat-input input');
        const message = input.value.trim();
        
        if (!message) return;

        this.addMessage(message, 'user');
        input.value = '';

        // Simular respuesta del bot
        setTimeout(() => {
            this.addMessage(this.getBotResponse(message), 'bot');
        }, 1000);
    }

    addMessage(text, type) {
        const messagesContainer = document.querySelector('.chat-messages');
        const message = document.createElement('div');
        message.className = `message ${type}`;
        message.innerHTML = `<span class="message-content">${text}</span>`;
        messagesContainer.appendChild(message);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    getBotResponse(userMessage) {
        const responses = [
            '¡Gracias por tu mensaje! Te ayudaré enseguida.',
            'Entiendo, déjame buscar información sobre eso.',
            '¡Claro! Puedo ayudarte con cualquier pregunta sobre nuestros productos.',
            'Perfecto, ¿hay algo más en lo que pueda ayudarte?',
            'Gracias por contactarnos. Un especialista te atenderá pronto.'
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    addChatMessages() {
        // Mensajes predeterminados
        const quickReplies = [
            '¿Cuáles son los métodos de pago?',
            '¿Tienen envío gratis?',
            '¿Cómo puedo devolver un producto?'
        ];

        const messagesContainer = document.querySelector('.chat-messages');
        const quickRepliesContainer = document.createElement('div');
        quickRepliesContainer.className = 'quick-replies';

        quickReplies.forEach(reply => {
            const button = document.createElement('button');
            button.className = 'quick-reply';
            button.textContent = reply;
            button.addEventListener('click', () => {
                document.querySelector('.chat-input input').value = reply;
                this.sendMessage();
            });
            quickRepliesContainer.appendChild(button);
        });

        messagesContainer.appendChild(quickRepliesContainer);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new EcoLiveChat();
});