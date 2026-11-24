/* EcoMarket — Asistente virtual "Eco" (widget tipo ChatGPT) */
(function () {
    'use strict';

    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let panel, messagesEl, inputEl, chipsEl, btn, statusDot;
    let abierto = false;
    let historial = [];
    let ultimoUserMsg = '';
    let typingEl = null;

    // Memoria entre sesiones (como ChatGPT recuerda contexto)
    try {
        historial = JSON.parse(localStorage.getItem('eco-chat-hist') || '[]').slice(-12);
    } catch (e) { historial = []; }
    function saveHist() {
        try { localStorage.setItem('eco-chat-hist', JSON.stringify(historial.slice(-12))); } catch (e) {}
    }

    const T = {
        es: { title: 'Eco', subtitle: 'Asistente IA', placeholder: 'Escribe tu mensaje…', send: 'Enviar', close: 'Cerrar', newChat: 'Nuevo chat', typing: 'Eco está escribiendo', copy: 'Copiar', copied: '¡Copiado!', regen: 'Regenerar', online: 'en línea' },
        en: { title: 'Eco', subtitle: 'AI Assistant', placeholder: 'Type your message…', send: 'Send', close: 'Close', newChat: 'New chat', typing: 'Eco is typing', copy: 'Copy', copied: 'Copied!', regen: 'Regenerate', online: 'online' },
        pt: { title: 'Eco', subtitle: 'Assistente IA', placeholder: 'Digite sua mensagem…', send: 'Enviar', close: 'Fechar', newChat: 'Novo chat', typing: 'Eco está digitando', copy: 'Copiar', copied: 'Copiado!', regen: 'Regenerar', online: 'online' },
        fr: { title: 'Eco', subtitle: 'Assistant IA', placeholder: 'Écrivez votre message…', send: 'Envoyer', close: 'Fermer', newChat: 'Nouveau chat', typing: 'Eco écrit', copy: 'Copier', copied: 'Copié !', regen: 'Régénérer', online: 'en ligne' },
        de: { title: 'Eco', subtitle: 'KI-Assistent', placeholder: 'Nachricht eingeben…', send: 'Senden', close: 'Schließen', newChat: 'Neuer Chat', typing: 'Eco schreibt', copy: 'Kopieren', copied: 'Kopiert!', regen: 'Neu generieren', online: 'online' },
        it: { title: 'Eco', subtitle: 'Assistente IA', placeholder: 'Scrivi il tuo messaggio…', send: 'Invia', close: 'Chiudi', newChat: 'Nuova chat', typing: 'Eco sta scrivendo', copy: 'Copia', copied: 'Copiato!', regen: 'Rigenera', online: 'online' }
    };
    const lang = () => (window.EcoI18n && EcoI18n.currentLang) || 'es';
    const t = () => T[lang()] || T.es;

    function build() {
        // Botón flotante con anillo de pulso
        btn = document.createElement('button');
        btn.id = 'asistenteBtn';
        btn.setAttribute('aria-label', t().title);
        btn.innerHTML = '<i class="bi bi-robot"></i><span class="asistente-dot"></span>';
        document.body.appendChild(btn);

        // Panel estilo chat
        panel = document.createElement('div');
        panel.id = 'asistentePanel';
        panel.setAttribute('role', 'dialog');
        panel.setAttribute('aria-label', t().title);
        panel.innerHTML = `
            <div class="asistente-header">
                <div class="asistente-avatar"><img src="/static/assets/mascota-sticker.svg" alt="Eco"></div>
                <div class="asistente-id">
                    <strong>${t().title}</strong>
                    <small><span class="asistente-status-dot" id="asistenteStatusDot"></span> ${t().subtitle} · <span class="asistente-online">${t().online}</span></small>
                </div>
                <div class="asistente-header-actions">
                    <button class="asistente-icon-btn" id="asistenteNewChat" title="${t().newChat}" aria-label="${t().newChat}"><i class="bi bi-plus-lg"></i></button>
                    <button class="asistente-icon-btn" id="asistenteClose" aria-label="${t().close}"><i class="bi bi-x-lg"></i></button>
                </div>
            </div>
            <div class="asistente-msgs" id="asistenteMsgs"></div>
            <div class="asistente-chips" id="asistenteChips"></div>
            <form class="asistente-form" id="asistenteForm">
                <input type="text" id="asistenteInput" placeholder="${t().placeholder}" maxlength="500" autocomplete="off">
                <button type="submit" class="asistente-send" aria-label="${t().send}"><i class="bi bi-send-fill"></i></button>
            </form>
            <div class="asistente-footer-note">Eco puede equivocarse · <a href="/impacto">Impacto ambiental</a></div>`;
        document.body.appendChild(panel);

        messagesEl = document.getElementById('asistenteMsgs');
        inputEl = document.getElementById('asistenteInput');
        chipsEl = document.getElementById('asistenteChips');
        statusDot = document.getElementById('asistenteStatusDot');

        btn.addEventListener('click', toggle);
        document.getElementById('asistenteClose').addEventListener('click', toggle);
        document.getElementById('asistenteNewChat').addEventListener('click', newChat);
        document.getElementById('asistenteForm').addEventListener('submit', onSubmit);

        // Auto-resize del input
        inputEl.addEventListener('input', () => {
            inputEl.style.height = 'auto';
            inputEl.style.height = Math.min(inputEl.scrollHeight, 110) + 'px';
        });

        document.addEventListener('keydown', e => {
            if (e.key === 'Escape' && abierto) toggle();
        });
    }

    function toggle() {
        abierto = !abierto;
        panel.classList.toggle('open', abierto);
        btn.classList.toggle('open', abierto);
        if (abierto) {
            if (!messagesEl.children.length) renderHistory();
            setTimeout(() => inputEl.focus(), 250);
        }
    }

    function esc(s) {
        return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    }

    function hora() {
        return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    function addMsg(who, html, meta) {
        const wrap = document.createElement('div');
        wrap.className = 'asistente-row ' + who;

        if (who === 'bot') {
            wrap.innerHTML = `
                <div class="asistente-avatar sm"><img src="/static/assets/mascota-sticker.svg" alt="Eco"></div>
                <div class="asistente-bubble bot">${html}</div>`;
        } else {
            wrap.innerHTML = `<div class="asistente-bubble user">${html}</div>`;
        }

        if (meta !== false) {
            const time = document.createElement('div');
            time.className = 'asistente-time';
            time.textContent = hora();
            wrap.appendChild(time);
        }

        messagesEl.appendChild(wrap);
        messagesEl.scrollTop = messagesEl.scrollHeight;
        return wrap.querySelector('.asistente-bubble') || wrap;
    }

    // Renderiza historial guardado al abrir
    function renderHistory() {
        if (!historial.length) { mostrarSaludo(); return; }
        historial.forEach(m => {
            if (m.role === 'user') addMsg('user', esc(m.content), false);
            else addMsg('bot', renderMd(m.content), false);
        });
        renderChips(['¿Qué más puedes hacer?', 'Buscar productos', 'Consejos ecológicos', 'Mi cuenta']);
    }

    function mostrarSaludo() {
        const saludo = '¡Hola! 👋 Soy **Eco**, tu asistente con IA. Puedo buscar productos reales, resolver dudas de envíos y pagos, darte consejos ecológicos o ayudarte a vender. ¿En qué te ayudo?';
        const el = addMsg('bot', '');
        streamText(el, renderMd(saludo));
        renderChips(['¿Cómo funciona EcoMarket?', 'Quiero vender algo', 'Buscar productos baratos', 'Tips para ahorrar CO₂']);
    }

    // Markdown-lite: **bold**, listas con •/-, links, saltos de línea
    function renderMd(text) {
        let html = esc(text);
        html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
        // Listas: líneas que empiezan con - o •
        const lines = html.split('<br>');
        let out = '', inList = false;
        lines.forEach(l => {
            const m = l.match(/^\s*[-•]\s+(.*)/);
            if (m) {
                if (!inList) { out += '<ul class="asistente-list">'; inList = true; }
                out += '<li>' + m[1] + '</li>';
            } else {
                if (inList) { out += '</ul>'; inList = false; }
                out += l + '<br>';
            }
        });
        if (inList) out += '</ul>';
        return out.replace(/<br>$/, '');
    }

    // Efecto "streaming" tipo ChatGPT: revela el HTML progresivamente
    function streamText(el, html) {
        if (reduceMotion) { el.innerHTML = html; messagesEl.scrollTop = messagesEl.scrollHeight; return; }
        const tokens = html.match(/<[^>]+>|[^<]+/g) || [];
        let i = 0, acc = '';
        el.classList.add('streaming');
        const timer = setInterval(() => {
            let words = 0, j = i;
            while (j < tokens.length && words < 5) {
                acc += tokens[j];
                if (!/^<[^>]+>$/.test(tokens[j])) words += tokens[j].split(/\s+/).length;
                j++;
            }
            i = j;
            el.innerHTML = acc;
            messagesEl.scrollTop = messagesEl.scrollHeight;
            if (i >= tokens.length) {
                clearInterval(timer);
                el.classList.remove('streaming');
                attachActions(el, html);
            }
        }, 24);
    }

    // Botones de acción estilo ChatGPT (copiar / regenerar)
    function attachActions(bubble, rawHtml) {
        const bar = document.createElement('div');
        bar.className = 'asistente-actions';
        bar.innerHTML = `
            <button class="asistente-act" data-act="copy" title="${t().copy}"><i class="bi bi-clipboard"></i></button>
            <button class="asistente-act" data-act="regen" title="${t().regen}"><i class="bi bi-arrow-clockwise"></i></button>`;
        bubble.parentElement.appendChild(bar);
        bar.addEventListener('click', e => {
            const act = e.target.closest('.asistente-act');
            if (!act) return;
            if (act.dataset.act === 'copy') {
                navigator.clipboard.writeText(bubble.innerText).then(() => {
                    act.innerHTML = '<i class="bi bi-check-lg"></i>';
                    setTimeout(() => { act.innerHTML = '<i class="bi bi-clipboard"></i>'; }, 1500);
                }).catch(() => {});
            } else if (act.dataset.act === 'regen' && ultimoUserMsg) {
                bar.remove();
                bubble.parentElement.remove();
                send(ultimoUserMsg, true);
            }
        });
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

    function setTyping(on) {
        if (on && !typingEl) {
            typingEl = document.createElement('div');
            typingEl.className = 'asistente-row bot';
            typingEl.innerHTML = `
                <div class="asistente-avatar sm"><img src="/static/assets/mascota-sticker.svg" alt="Eco"></div>
                <div class="asistente-bubble bot typing"><span></span><span></span><span></span><em>${t().typing}…</em></div>`;
            messagesEl.appendChild(typingEl);
            messagesEl.scrollTop = messagesEl.scrollHeight;
        } else if (!on && typingEl) {
            typingEl.remove();
            typingEl = null;
        }
    }

    async function send(texto, esRegen) {
        if (!esRegen) {
            ultimoUserMsg = texto;
            historial.push({ role: 'user', content: texto });
            saveHist();
            addMsg('user', esc(texto));
        }
        chipsEl.innerHTML = '';
        setTyping(true);
        try {
            const r = await fetch('/api/asistente', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mensaje: texto, historial: historial.slice(-8) })
            });
            const d = await r.json();
            setTyping(false);
            // Guardar respuesta "cruda" no es posible (viene HTML); guardamos texto plano
            historial.push({ role: 'assistant', content: (d.respuesta_raw || stripHtml(d.respuesta)) });
            saveHist();
            const el = addMsg('bot', '');
            streamText(el, d.respuesta || '');
            if (d.sugerencias && d.sugerencias.length) renderChips(d.sugerencias);
        } catch (err) {
            setTyping(false);
            addMsg('bot', renderMd('Ups, tuve un problema para responder. Intenta de nuevo. 🙏'));
        }
    }

    function stripHtml(h) { const d = document.createElement('div'); d.innerHTML = h || ''; return d.textContent || ''; }

    function newChat() {
        historial = [];
        saveHist();
        messagesEl.innerHTML = '';
        chipsEl.innerHTML = '';
        mostrarSaludo();
    }

    async function onSubmit(e) {
        e.preventDefault();
        const texto = inputEl.value.trim();
        if (!texto) return;
        inputEl.value = '';
        inputEl.style.height = 'auto';
        send(texto, false);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', build);
    } else {
        build();
    }
})();
