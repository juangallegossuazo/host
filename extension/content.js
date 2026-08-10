(function () {
  const hostname = location.hostname;

  chrome.runtime.sendMessage({ action: 'checkDomain', domain: hostname }, (response) => {
    if (response && response.blocked) {
      blockingPage(response.category);
    }
  });

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'forceBlock') {
      blockingPage(request.category);
      sendResponse({ blocked: true });
    }
    return true;
  });

  function blockingPage(category) {
    if (document.getElementById('host-blocker-overlay')) return;

    const names = {
      adult: 'Contenido Adulto',
      games: 'Juegos Online',
      downloads: 'Descargas',
      entertainment: 'Entretenimiento'
    };

    const overlay = document.createElement('div');
    overlay.id = 'host-blocker-overlay';
    overlay.innerHTML = `
      <style>
        #host-blocker-overlay {
          position: fixed; inset: 0; z-index: 999999;
          background: linear-gradient(135deg, #667eea, #764ba2);
          display: flex; align-items: center; justify-content: center;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          color: white; text-align: center; padding: 20px;
        }
        #host-blocker-overlay .box { max-width: 440px; }
        #host-blocker-overlay .shield { font-size: 80px; margin-bottom: 16px; }
        #host-blocker-overlay h1 { font-size: 28px; margin-bottom: 8px; }
        #host-blocker-overlay p { font-size: 16px; opacity: 0.85; margin-bottom: 20px; }
        #host-blocker-overlay .badge {
          display: inline-block; padding: 8px 20px;
          background: rgba(255,255,255,0.2); border-radius: 20px;
          font-size: 14px; margin-bottom: 20px;
        }
        #host-blocker-overlay .domain-info {
          font-size: 13px; opacity: 0.7; margin-bottom: 24px;
        }
        #host-blocker-overlay button {
          padding: 12px 28px; border: none; border-radius: 25px;
          font-size: 15px; font-weight: 600; cursor: pointer;
          margin: 0 6px; transition: transform 0.2s;
        }
        #host-blocker-overlay button:hover { transform: scale(1.05); }
        #host-blocker-overlay .btn-back {
          background: white; color: #667eea;
        }
        #host-blocker-overlay .btn-config {
          background: rgba(255,255,255,0.15); color: white;
          border: 2px solid rgba(255,255,255,0.4) !important;
        }
      </style>
      <div class="box">
        <div class="shield">🛡️</div>
        <h1>Sitio Bloqueado</h1>
        <p>Host Blocker ha bloqueado el acceso a esta página</p>
        <div class="badge">${names[category] || category}</div>
        <div class="domain-info">${hostname}</div>
        <div>
          <button class="btn-back" onclick="history.back()">← Volver</button>
          <button class="btn-config" onclick="chrome.runtime.sendMessage({action:'openPopup'})">⚙️ Configurar</button>
        </div>
      </div>
    `;

    document.documentElement.innerHTML = '';
    document.documentElement.appendChild(overlay);
  }
})();
