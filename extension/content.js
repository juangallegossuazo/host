// Content script para Host Blocker
// Se ejecuta en cada página web para detectar y bloquear contenido

(function() {
  'use strict';
  
  // Categorías de contenido con palabras clave
  const contentCategories = {
    adult: {
      keywords: [
        'porn', 'xxx', 'sex', 'nude', 'naked', 'adult', 'erotic', 'nsfw',
        'pornhub', 'xvideos', 'xhamster', 'redtube', 'youporn', 'spankbang',
        'beeg', 'tube8', 'porntube', 'xnxx', 'chaturbate', 'myfreecams',
        'livejasmin', 'streamate', 'cam4', 'bongacams', 'stripchat',
        'onlyfans', 'fansly', 'tinder', 'bumble', 'okcupid', 'grindr',
        'pornografia', 'sexo', 'desnudo', 'adulto', 'erotico', 'nsfw'
      ],
      patterns: [
        /porn/i, /xxx/i, /sex/i, /nude/i, /naked/i, /adult/i, /erotic/i,
        /nsfw/i, /18\+/i, /onlyfans/i, /fansly/i, /chaturbate/i
      ]
    },
    games: {
      keywords: [
        'game', 'juego', 'play', 'jugar', 'gaming', 'arcade', 'puzzle',
        'friv', 'crazygames', 'minijuegos', 'roblox', 'minecraft', 'fortnite',
        'steam', 'epicgames', 'garena', 'kongregate', 'newgrounds', 'miniclip',
        'poki', 'y8', 'tetris', 'chess', 'poker', 'casino', 'bet', 'gambling',
        'juegos', 'onlinegames', 'flashgames', 'html5games', 'freegames'
      ],
      patterns: [
        /game/i, /juego/i, /play/i, /jugar/i, /gaming/i, /arcade/i,
        /puzzle/i, /friv/i, /crazygames/i, /minijuegos/i, /roblox/i,
        /minecraft/i, /fortnite/i, /steam/i, /casino/i, /poker/i
      ]
    },
    downloads: {
      keywords: [
        'download', 'descargar', 'torrent', 'crack', 'keygen', 'serial',
        'softonic', 'uptodown', 'malavida', 'filehippo', 'softpedia',
        'majorgeeks', 'filehorse', 'chip', 'thepiratebay', 'kickasstorrents',
        '1337x', 'rarbg', 'nyaa', 'yts', 'fitgirl', 'repack',
        'descargas', 'bajar', 'bittorrent', 'emule', 'limewire'
      ],
      patterns: [
        /download/i, /descargar/i, /torrent/i, /crack/i, /keygen/i,
        /serial/i, /softonic/i, /uptodown/i, /malavida/i, /filehippo/i,
        /thepiratebay/i, /kickasstorrents/i, /1337x/i
      ]
    },
    entertainment: {
      keywords: [
        'streaming', 'video', 'music', 'social', 'network', 'news',
        'youtube', 'netflix', 'hulu', 'disney', 'hbomax', 'spotify',
        'facebook', 'instagram', 'twitter', 'tiktok', 'snapchat',
        'reddit', 'discord', 'twitch', 'amazon', 'ebay', 'shopping',
        'bet', 'casino', 'poker', 'gambling', 'dating', 'match', 'tinder'
      ],
      patterns: [
        /youtube/i, /netflix/i, /hulu/i, /disney/i, /spotify/i,
        /facebook/i, /instagram/i, /twitter/i, /tiktok/i, /snapchat/i,
        /reddit/i, /discord/i, /twitch/i, /bet/i, /casino/i
      ]
    }
  };
  
  // Estado actual
  let currentCategory = null;
  let isBlocked = false;
  
  // Verificar contenido de la página
  function checkPageContent() {
    const pageContent = document.body ? document.body.innerText.toLowerCase() : '';
    const pageTitle = document.title.toLowerCase();
    const metaDescription = document.querySelector('meta[name="description"]');
    const description = metaDescription ? metaDescription.content.toLowerCase() : '';
    
    const fullContent = `${pageContent} ${pageTitle} ${description}`;
    
    // Verificar cada categoría
    for (const [category, data] of Object.entries(contentCategories)) {
      const hasKeywords = data.keywords.some(keyword => 
        fullContent.includes(keyword.toLowerCase())
      );
      
      const hasPatterns = data.patterns.some(pattern => 
        pattern.test(fullContent)
      );
      
      if (hasKeywords || hasPatterns) {
        return { category, detected: true };
      }
    }
    
    return { category: null, detected: false };
  }
  
  // Bloquear página
  function blockPage(category) {
    if (isBlocked) return;
    
    isBlocked = true;
    currentCategory = category;
    
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
    
    const categoryName = {
      adult: 'Contenido Adulto',
      games: 'Juegos Online',
      downloads: 'Sitios de Descarga',
      entertainment: 'Entretenimiento'
    }[category] || 'Contenido No Deseado';
    
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
          <p style="font-size: 20px; font-weight: bold;">${categoryName}</p>
        </div>
        <p style="font-size: 14px; opacity: 0.8;">
          El contenido de esta página no está permitido según la configuración actual.
        </p>
        <button onclick="history.back()" style="
          margin-top: 20px;
          padding: 12px 30px;
          font-size: 16px;
          background: white;
          color: #667eea;
          border: none;
          border-radius: 25px;
          cursor: pointer;
          font-weight: bold;
          box-shadow: 0 4px 6px rgba(0,0,0,0.2);
          transition: transform 0.2s;
        " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
          ← Volver Atrás
        </button>
      </div>
    `;
    
    document.body.innerHTML = '';
    document.body.appendChild(overlay);
    
    // Notificar al background script
    chrome.runtime.sendMessage({
      action: 'pageBlocked',
      category: category,
      url: window.location.href
    });
  }
  
  // Verificar si la página debe ser bloqueada
  function checkAndBlock() {
    // Primero verificar con el background script
    chrome.runtime.sendMessage({
      action: 'checkDomain',
      url: window.location.href
    }, (response) => {
      if (response && response.blocked) {
        blockPage(response.category);
        return;
      }
      
      // Si no está bloqueado por dominio, verificar contenido
      const contentCheck = checkPageContent();
      if (contentCheck.detected) {
        blockPage(contentCheck.category);
      }
    });
  }
  
  // Ejecutar verificación
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkAndBlock);
  } else {
    checkAndBlock();
  }
  
  // Observar cambios en el DOM
  const observer = new MutationObserver((mutations) => {
    if (!isBlocked) {
      checkAndBlock();
    }
  });
  
  if (document.body) {
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  // Escuchar mensajes del background script
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'forceBlock') {
      blockPage(request.category);
      sendResponse({ blocked: true });
    } else if (request.action === 'checkContent') {
      const result = checkPageContent();
      sendResponse(result);
    }
    return true;
  });
  
})();
