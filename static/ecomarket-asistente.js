/* EcoMarket — Asistente virtual "Eco" (widget flotante) */
(function () {
    'use strict';

    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let panel, messagesEl, inputEl, chipsEl, btn;
    let abierto = false;
    let saludoMostrado = false;

    const T = {
        es: { title: 'Eco · Asistente', placeholder: 'Escribe tu pregunta...', send: 'Enviar', close: 'Cerrar', ai: 'Eco', typing: 'Eco está escribiendo…' },
        en: { title: 'Eco · Assistant', placeholder: 'Type your question...', send: 'Send', close: 'Close', ai: 'Eco', typing: 'Eco is typing…' },
        pt: { title: 'Eco · Assistente', placeholder: 'Escreva sua pergunta...', send: 'Enviar', close: 'Fechar', ai: 'Eco', typing: 'Eco está digitando…' },
        fr: { title: 'Eco · Assistant', placeholder: 'Posez votre question...', send: 'Envoyer', close: 'Fermer', ai: 'Eco', typing: 'Eco écrit…' },
        de: { title: 'Eco · Assistent', placeholder: 'Frage eingeben...', send: 'Senden', close: 'Schließen', ai: 'Eco', typing: 'Eco schreibt…' },
        it: { title: 'Eco · Assistente', placeholder: 'Scrivi la tua domanda...', send: 'Invia', close: 'Chiudi', ai: 'Eco', typing: 'Eco sta scrivendo…' }
    };
    const lang = () => (window.EcoI18n && EcoI18n.currentLang) || 'es';
    const t = () => T[lang()] || T.es;

    function build() {
        // Botón flotante
        btn = document.createElement('button');
        btn.id = 'asistenteBtn';
        btn.setAttribute('aria-label', t().title);
        btn.innerHTML = '<i class="bi bi-robot"></i><span class="asistente-dot"></span>';
        document.body.appendChild(btn);

        // Panel
        panel = document.createElement('div');
        panel.id = 'asistentePanel';
        panel.setAttribute('role', 'dialog');
        panel.setAttribute('aria-label', t().title);
        panel.innerHTML = `
            <div class="asistente-header">
                <div class="asistente-avatar"><img src="/static/assets/mascota.svg" alt="Eco" style="width:32px;height:32px;object-fit:contain"></div>
                <div>
                    <strong>${t().title}</strong>
                    <small><span class="asistente-status"></span> ${t().ai}</small>
                </div>
                <button class="asistente-close" aria-label="${t().close}"><i class="bi bi-x-lg"></i></button>
            </div>
            <div class="asistente-msgs" id="asistenteMsgs"></div>
            <div class="asistente-chips" id="asistenteChips"></div>
            <form class="asistente-form" id="asistenteForm">
                <input type="text" id="asistenteInput" placeholder="${t().placeholder}" maxlength="500" autocomplete="off">
                <button type="submit" aria-label="${t().send}"><i class="bi bi-send"></i></button>
            </form>`;
        document.body.appendChild(panel);

        messagesEl = document.getElementById('asistenteMsgs');
        inputEl = document.getElementById('asistenteInput');
        chipsEl = document.getElementById('asistenteChips');

        btn.addEventListener('click', toggle);
        panel.querySelector('.asistente-close').addEventListener('click', toggle);
        document.getElementById('asistenteForm').addEventListener('submit', onSubmit);

        // Esc para cerrar
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape' && abierto) toggle();
        });
    }

    function toggle() {
        abierto = !abierto;
        panel.classList.toggle('open', abierto);
        btn.classList.toggle('open', abierto);
        if (abierto) {
            if (!saludoMostrado) mostrarSaludo();
            setTimeout(() => inputEl.focus(), 250);
        }
    }

    function addMsg(html, who) {
        const div = document.createElement('div');
        div.className = 'asistente-msg ' + who;
        div.innerHTML = html;
        messagesEl.appendChild(div);
        messagesEl.scrollTop = messagesEl.scrollHeight;
        return div;
    }

    function linkify(text) {
        // Links /ruta -> <a>
        return text.replace(/(\/\w[\w\-\/?=&%]*)/g, '<a href="$1" class="asistente-link">$1</a>');
    }

    function mostrarSaludo() {
        saludoMostrado = true;
        addMsg('¡Hola! 👋 Soy <strong>Eco</strong>, tu asistente virtual. Puedo ayudarte con compras, ventas, cupones y consejos ecológicos. ¿En qué te ayudo?', 'bot');
        renderChips(['¿Cómo funciona?', 'Quiero vender', 'Consejos ecológicos', 'Cupones']);
    }

    function renderChips(items) {
        chipsEl.innerHTML = '';
        items.forEach(s => {
            const c = document.createElement('button');
            c.type = 'button';
            c.className = 'asistente-chip';
            c.textContent = s;
            c.addEventListener('click', () => {
                inputEl.value = s;
                onSubmit(new Event('submit', { cancelable: true }));
            });
            chipsEl.appendChild(c);
        });
    }

    function typing(on) {
        let el = document.getElementById('asistenteTyping');
        if (on && !el) {
            el = document.createElement('div');
            el.id = 'asistenteTyping';
            el.className = 'asistente-msg bot typing';
            el.innerHTML = '<span></span><span></span><span></span>';
            messagesEl.appendChild(el);
            messagesEl.scrollTop = messagesEl.scrollHeight;
        } else if (!on && el) {
            el.remove();
        }
    }

    async function onSubmit(e) {
        e.preventDefault();
        const texto = inputEl.value.trim();
        if (!texto) return;
        inputEl.value = '';
        addMsg(escapeHtml(texto), 'user');
        chipsEl.innerHTML = '';
        typing(true);
        try {
            const r = await fetch('/api/asistente', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mensaje: texto })
            });
            const d = await r.json();
            typing(false);
            addMsg(d.respuesta || '', 'bot');
            if (d.sugerencias && d.sugerencias.length) renderChips(d.sugerencias);
        } catch (err) {
            typing(false);
            addMsg('Ups, tuve un problema para responder. Intenta de nuevo. 🙏', 'bot');
        }
    }

    function escapeHtml(s) {
        return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', build);
    } else {
        build();
    }
})();
