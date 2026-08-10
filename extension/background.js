// Host Blocker Sync - Background Script
// Maneja la sincronización con el hosts y el bloqueo

// Estado global
let blockedDomains = {};
let categorySettings = {
  adult: true,
  games: true,
  downloads: true,
  entertainment: true
};

// Inicializar
chrome.runtime.onInstalled.addListener(async () => {
  console.log('Host Blocker Sync instalado');
  await loadBlockedDomains();
  updateBlockingRules();
});

// Cargar dominios bloqueados desde storage
async function loadBlockedDomains() {
  try {
    const result = await chrome.storage.local.get('blockedDomains');
    if (result.blockedDomains) {
      blockedDomains = result.blockedDomains;
    } else {
      // Cargar dominios de ejemplo
      blockedDomains = getSampleDomains();
      await saveBlockedDomains();
    }
  } catch (error) {
    console.error('Error loading domains:', error);
    blockedDomains = getSampleDomains();
  }
}

// Guardar dominios bloqueados
async function saveBlockedDomains() {
  try {
    await chrome.storage.local.set({ blockedDomains: blockedDomains });
  } catch (error) {
    console.error('Error saving domains:', error);
  }
}

// Dominios de ejemplo
function getSampleDomains() {
  return {
    adult: [
      'pornhub.com', 'xvideos.com', 'xhamster.com', 'redtube.com', 'youporn.com',
      'spankbang.com', 'beeg.com', 'tube8.com', 'xnxx.com', 'chaturbate.com',
      'onlyfans.com', 'fansly.com', 'tinder.com', 'bumble.com', 'grindr.com'
    ],
    games: [
      'friv.com', 'crazygames.com', 'minijuegos.com', 'roblox.com', 'epicgames.com',
      'store.steampowered.com', 'minecraft.net', 'fortnite.com', 'kongregate.com',
      'newgrounds.com', 'miniclip.com', 'poki.com', 'y8.com', 'chess.com'
    ],
    downloads: [
      'softonic.com', 'uptodown.com', 'malavida.com', 'filehippo.com', 'softpedia.com',
      'majorgeeks.com', 'filehorse.com', 'chip.de', 'thepiratebay.org', '1337x.to',
      'kickasstorrents.com', 'rarbg.to', 'nyaa.si', 'yts.mx'
    ],
    entertainment: [
      'youtube.com', 'netflix.com', 'hulu.com', 'disneyplus.com', 'spotify.com',
      'facebook.com', 'instagram.com', 'twitter.com', 'tiktok.com', 'snapchat.com',
      'reddit.com', 'discord.com', 'twitch.tv', 'amazon.com', 'ebay.com'
    ]
  };
}

// Actualizar reglas de bloqueo
function updateBlockingRules() {
  const allDomains = [];
  
  Object.entries(blockedDomains).forEach(([category, domains]) => {
    if (categorySettings[category]) {
      domains.forEach(domain => {
        allDomains.push({ domain, category });
      });
    }
  });
  
  // Crear reglas para declarativeNetRequest
  const rules = allDomains.map((item, index) => ({
    id: index + 1,
    priority: 1,
    action: { type: "block" },
    condition: {
      urlFilter: item.domain,
      resourceTypes: ["main_frame", "sub_frame"]
    }
  }));
  
  // Aplicar reglas
  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: rules.map(rule => rule.id),
    addRules: rules
  }).catch(error => {
    console.log('Error updating rules:', error);
  });
}

// Verificar si un dominio está bloqueado
function isDomainBlocked(domain) {
  for (const [category, domains] of Object.entries(blockedDomains)) {
    if (categorySettings[category]) {
      if (domains.some(d => domain.includes(d) || d.includes(domain))) {
        return { blocked: true, category };
      }
    }
  }
  return { blocked: false };
}

// Sincronizar desde hosts
async function syncFromHosts(hostsContent) {
  const lines = hostsContent.split('\n');
  const newDomains = {
    adult: [],
    games: [],
    downloads: [],
    entertainment: []
  };
  
  let currentCategory = 'entertainment';
  
  lines.forEach(line => {
    line = line.trim();
    
    // Detectar categoría por comentarios
    if (line.startsWith('# ---')) {
      const categoryMatch = line.match(/# --- (.+?) ---/);
      if (categoryMatch) {
        const categoryName = categoryMatch[1].toLowerCase();
        if (categoryName.includes('adulto') || categoryName.includes('xxx')) {
          currentCategory = 'adult';
        } else if (categoryName.includes('juego') || categoryName.includes('games')) {
          currentCategory = 'games';
        } else if (categoryName.includes('descarga') || categoryName.includes('download')) {
          currentCategory = 'downloads';
        } else {
          currentCategory = 'entertainment';
        }
      }
      return;
    }
    
    // Parsear dominio
    if (!line || line.startsWith('#')) return;
    
    const parts = line.split(/\s+/);
    if (parts.length >= 2) {
      const domain = parts[1];
      if (domain !== 'localhost' && !domain.startsWith('127.') && !domain.startsWith('::1')) {
        if (!newDomains[currentCategory].includes(domain)) {
          newDomains[currentCategory].push(domain);
        }
      }
    }
  });
  
  // Actualizar dominios
  blockedDomains = newDomains;
  await saveBlockedDomains();
  updateBlockingRules();
  
  return {
    total: Object.values(newDomains).reduce((sum, arr) => sum + arr.length, 0),
    categories: Object.keys(newDomains).filter(k => newDomains[k].length > 0).length
  };
}

// Exportar a hosts
function exportToHosts() {
  let content = `# ====================================
# HOST BLOCKER - FILTRO DE CONTENIO
# ====================================
# Generado por Host Blocker Sync
# Fecha: ${new Date().toLocaleString()}
# ====================================

`;
  
  const categoryNames = {
    adult: 'CONTENIDO ADULTO/XXX',
    games: 'JUEGOS ONLINE',
    downloads: 'DESCARGAS NO DESEADAS',
    entertainment: 'ENTRETENIMIENTO DISTRCTOR'
  };
  
  Object.entries(blockedDomains).forEach(([category, domains]) => {
    if (domains.length === 0) return;
    
    content += `\n# --- ${categoryNames[category]} ---\n`;
    domains.forEach(domain => {
      content += `0.0.0.0 ${domain}\n`;
      content += `0.0.0.0 www.${domain}\n`;
    });
  });
  
  return content;
}

// Escuchar mensajes
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'checkDomain') {
    const result = isDomainBlocked(request.domain);
    sendResponse(result);
  } else if (request.action === 'syncFromHosts') {
    syncFromHosts(request.hostsContent).then(result => {
      sendResponse(result);
    });
    return true;
  } else if (request.action === 'exportHosts') {
    const content = exportToHosts();
    sendResponse({ content });
  } else if (request.action === 'getBlockedDomains') {
    sendResponse({ domains: blockedDomains });
  } else if (request.action === 'updateSettings') {
    categorySettings = request.settings;
    updateBlockingRules();
    sendResponse({ success: true });
  } else if (request.action === 'addDomain') {
    const { category, domain } = request;
    if (!blockedDomains[category]) {
      blockedDomains[category] = [];
    }
    if (!blockedDomains[category].includes(domain)) {
      blockedDomains[category].push(domain);
      saveBlockedDomains();
      updateBlockingRules();
    }
    sendResponse({ success: true });
  } else if (request.action === 'removeDomain') {
    const { category, domain } = request;
    if (blockedDomains[category]) {
      blockedDomains[category] = blockedDomains[category].filter(d => d !== domain);
      saveBlockedDomains();
      updateBlockingRules();
    }
    sendResponse({ success: true });
  } else if (request.action === 'pageBlocked') {
    console.log('Página bloqueada:', request);
    sendResponse({ received: true });
  } else if (request.action === 'contentDetected') {
    console.log('Contenido detectado:', request);
    // Aquí podrías sugerir agregar el dominio al hosts
    sendResponse({ received: true });
  }
  
  return true;
});

// Sincronización periódica (cada 5 minutos)
setInterval(async () => {
  try {
    const result = await chrome.storage.local.get('hostsContent');
    if (result.hostsContent) {
      await syncFromHosts(result.hostsContent);
    }
  } catch (error) {
    console.log('Error en sincronización periódica:', error);
  }
}, 5 * 60 * 1000);
