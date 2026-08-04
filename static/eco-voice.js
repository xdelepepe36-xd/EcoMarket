/**
 * eco-voice.js - Búsqueda por voz para EcoMarket
 * Usa Web Speech API para reconocimiento de voz
 */
const EcoVoice = (() => {
  let recognition = null;
  let isListening = false;

  const init = () => {
    // Check if browser supports speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.log('Voice search not supported in this browser');
      return;
    }

    recognition = new SpeechRecognition();
    recognition.lang = 'es-PE';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      const searchInput = document.getElementById('searchInput');
      if (searchInput) {
        searchInput.value = transcript;
        searchInput.dispatchEvent(new Event('input'));
        // Trigger search
        const form = searchInput.closest('form');
        if (form) {
          form.submit();
        } else {
          window.location.href = '/productos?q=' + encodeURIComponent(transcript);
        }
      }
      stopListening();
    };

    recognition.onerror = (event) => {
      console.error('Voice error:', event.error);
      stopListening();
      if (window.EcoToast) {
        EcoToast.warning('No se pudo reconocer la voz. Intenta de nuevo.');
      }
    };

    recognition.onend = () => {
      stopListening();
    };

    // Add voice button to search
    addVoiceButton();
  };

  const addVoiceButton = () => {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;

    const parent = searchInput.parentElement;
    parent.style.position = 'relative';

    const btn = document.createElement('button');
    btn.id = 'ecoVoiceBtn';
    btn.type = 'button';
    btn.innerHTML = '<i class="bi bi-mic"></i>';
    btn.style.cssText = `
      position:absolute;right:8px;top:50%;transform:translateY(-50%);
      width:36px;height:36px;border-radius:50%;border:none;
      background:rgba(46,125,50,0.1);color:var(--verde);
      cursor:pointer;display:flex;align-items:center;justify-content:center;
      font-size:1rem;transition:all 0.3s;z-index:2;
    `;
    btn.title = 'Buscar por voz';
    btn.onclick = toggleListening;
    btn.onmouseover = () => { btn.style.background = 'rgba(46,125,50,0.2)'; };
    btn.onmouseout = () => { 
      if (!isListening) btn.style.background = 'rgba(46,125,50,0.1)'; 
    };
    parent.appendChild(btn);
  };

  const toggleListening = () => {
    if (!recognition) {
      if (window.EcoToast) EcoToast.warning('Tu navegador no soporta búsqueda por voz');
      return;
    }

    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const startListening = () => {
    if (!recognition) return;
    try {
      recognition.start();
      isListening = true;
      const btn = document.getElementById('ecoVoiceBtn');
      if (btn) {
        btn.style.background = '#e53935';
        btn.style.color = '#fff';
        btn.innerHTML = '<i class="bi bi-mic-fill"></i>';
        btn.style.animation = 'voicePulse 1s ease-in-out infinite';
      }
      if (window.EcoToast) EcoToast.info('🎤 Escuchando... habla ahora');
    } catch (e) {
      console.error('Voice start error:', e);
    }
  };

  const stopListening = () => {
    if (recognition) {
      try { recognition.stop(); } catch (e) {}
    }
    isListening = false;
    const btn = document.getElementById('ecoVoiceBtn');
    if (btn) {
      btn.style.background = 'rgba(46,125,50,0.1)';
      btn.style.color = 'var(--verde)';
      btn.innerHTML = '<i class="bi bi-mic"></i>';
      btn.style.animation = 'none';
    }
  };

  // Add voice pulse animation
  if (!document.getElementById('voiceStyle')) {
    const style = document.createElement('style');
    style.id = 'voiceStyle';
    style.textContent = `
      @keyframes voicePulse {
        0%, 100% { box-shadow: 0 0 0 0 rgba(229,57,53,0.4); }
        50% { box-shadow: 0 0 0 8px rgba(229,57,53,0); }
      }
    `;
    document.head.appendChild(style);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return { toggleListening, isListening: () => isListening };
})();

window.EcoVoice = EcoVoice;