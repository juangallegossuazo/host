// Host Blocker Sync - Content Script
// Detecta contenido y sincroniza con el hosts

(function() {
  'use strict';
  
  // Patrones de contenido por categoría
  const CONTENT_PATTERNS = {
    adult: [
      /porn/i, /xxx/i, /sex/i, /nude/i, /naked/i, /adult/i, /erotic/i,
      /nsfw/i, /18\+/i, /onlyfans/i, /fansly/i, /chaturbate/i,
      /pornhub/i, /xvideos/i, /xhamster/i, /redtube/i, /youporn/i
    ],
    games: [
      /game/i, /juego/i, /play/i, /jugar/i, /gaming/i, /arcade/i,
      /puzzle/i, /friv/i, /crazygames/i, /minijuegos/i, /roblox/i,
      /minecraft/i, /fortnite/i, /steam/i, /casino/i, /poker/i
    ],
    downloads: [
      /download/i, /descargar/i, /torrent/i, /crack/i, /keygen/i,
      /serial/i, /softonic/i, /uptodown/i, /malavida/i, /filehippo/i,
      /thepiratebay/i, /kickasstorrents/i, /1337x/i
    ]
  };
  
  // Estado
  let isBlocked = false;
  let detectedCategory = null;
  
  // Verificar contenido de la página
  function checkPageContent() {
    const pageContent = document.body ? document.body.innerText : '';
    const pageTitle = document.title;
    const metaDesc = document.querySelector('meta[name="description"]');
    const description = metaDesc ? metaDesc.content : '';
    
    const fullContent = `${pageContent} ${pageTitle} ${description}`;
    
    for (const [category, patterns] of Object.entries(CONTENT_PATTERNS)) {
      const hasMatch = patterns.some(pattern => pattern.test(fullContent));
      if (hasMatch) {
        return category;
      }
    }
    
    return null;
  }
  
  // Verificar dominio actual
  function checkCurrentDomain() {
    const hostname = window.location.hostname;
    
    chrome.runtime.sendMessage({
      action: 'checkDomain',
      domain: hostname
    }, (response) => {
      if (response && response.blocked) {
        blockPage(response.category);
      } else {
        // Si no está bloqueado por dominio, verificar contenido
        const category = checkPageContent();
        if (category) {
          // Notificar al background para posibles sugerencias
          chrome.runtime.sendMessage({
            action: 'contentDetected',
            category: category,
            url: window.location.href,
            hostname: hostname
          });
        }
      }
    });
  }
  
  // Bloquear página
  function blockPage(category) {
    if (isBlocked) return;
    
    isBlocked = true;
    detectedCategory = category;
    
    // Crear overlay de bloqueo
    const overlay = document.createElement('div');
    overlay.id = 'host-blocker-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      z-index: 999999;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: white;
      text-align: center;
      padding: 20px;
    `;
    
    const categoryNames = {
      adult: 'Contenido Adulto',
      games: 'Juegos Online',
      downloads: 'Sitios de Descarga',
      entertainment: 'Entretenimiento'
    };
    
    overlay.innerHTML = `
      <div style="max-width: 500px;">
        <div style="font-size: 80px; margin-bottom: 20px;">🛡️</div>
        <h1 style="font-size: 32px; margin-bottom: 10px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">
          Sitio Bloqueado
        </h1>
        <p style="font-size: 18px; margin-bottom: 20px; opacity: 0.9;">
          Esta página ha sido bloqueada por Host Blocker
        </p>
        <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 10px; margin-bottom: 20px;">
          <p style="font-size: 14px; margin-bottom: 5px;">Categoría detectada:</p>
          <p style="font-size: 20px; font-weight: bold;">${categoryNames[category] || category}</p>
        </div>
        <p style="font-size: 14px; opacity: 0.8; margin-bottom: 20px;">
          Dominio: ${window.location.hostname}
        </p>
        <div style="display: flex; gap: 10px; justify-content: center;">
          <button onclick="history.back()" style="
            padding: 12px 30px;
            font-size: 16px;
            background: white;
            color: #667eea;
            border: none;
            border-radius: 25px;
            cursor: pointer;
            font-weight: bold;
            box-shadow: 0 4px 6px rgba(0,0,0,0.2);
          ">← Volver Atrás</button>
          <button onclick="window.location.href='chrome://settings'" style="
            padding: 12px 30px;
            font-size: 16px;
            background: rgba(255,255,255,0.2);
            color: white;
            border: 2px solid white;
            border-radius: 25px;
            cursor: pointer;
            font-weight: bold;
          ">⚙️ Configurar</button>
        </div>
      </div>
    `;
    
    document.body.innerHTML = '';
    document.body.appendChild(overlay);
    
    // Notificar al background
    chrome.runtime.sendMessage({
      action: 'pageBlocked',
      category: category,
      url: window.location.href,
      hostname: window.location.hostname
    });
  }
  
  // Inicializar
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkCurrentDomain);
  } else {
    checkCurrentDomain();
  }
  
  // Escuchar mensajes del popup o background
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'forceBlock') {
      blockPage(request.category);
      sendResponse({ blocked: true });
    } else if (request.action === 'checkContent') {
      const category = checkPageContent();
      sendResponse({ category: category });
    } else if (request.action === 'getPageInfo') {
      sendResponse({
        hostname: window.location.hostname,
        url: window.location.href,
        title: document.title,
        isBlocked: isBlocked,
        detectedCategory: detectedCategory
      });
    }
    return true;
  });
  
})();
