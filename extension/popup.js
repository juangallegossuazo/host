// Host Blocker Sync - Popup Script
// Sincroniza con el archivo hosts del sistema

// Categorías predefinidas con patrones de detección
const CATEGORIES = {
  adult: {
    name: 'Contenido Adulto',
    icon: '🔞',
    patterns: [
      /porn/i, /xxx/i, /sex/i, /nude/i, /naked/i, /adult/i, /erotic/i,
      /nsfw/i, /18\+/i, /onlyfans/i, /fansly/i, /chaturbate/i,
      /pornhub/i, /xvideos/i, /xhamster/i, /redtube/i, /youporn/i
    ],
    domains: []
  },
  games: {
    name: 'Juegos Online',
    icon: '🎮',
    patterns: [
      /game/i, /juego/i, /play/i, /jugar/i, /gaming/i, /arcade/i,
      /puzzle/i, /friv/i, /crazygames/i, /minijuegos/i, /roblox/i,
      /minecraft/i, /fortnite/i, /steam/i, /casino/i, /poker/i
    ],
    domains: []
  },
  downloads: {
    name: 'Descargas',
    icon: '📥',
    patterns: [
      /download/i, /descargar/i, /torrent/i, /crack/i, /keygen/i,
      /serial/i, /softonic/i, /uptodown/i, /malavida/i, /filehippo/i,
      /thepiratebay/i, /kickasstorrents/i, /1337x/i
    ],
    domains: []
  },
  entertainment: {
    name: 'Entretenimiento',
    icon: '📺',
    patterns: [
      /youtube/i, /netflix/i, /hulu/i, /disney/i, /spotify/i,
      /facebook/i, /instagram/i, /twitter/i, /tiktok/i, /snapchat/i,
      /reddit/i, /discord/i, /twitch/i, /bet/i, /casino/i
    ],
    domains: []
  }
};

// Estado actual
let state = {
  blockedDomains: {},
  categorySettings: {
    adult: true,
    games: true,
    downloads: true,
    entertainment: true
  },
  lastSync: null
};

// Inicializar
document.addEventListener('DOMContentLoaded', async () => {
  await loadState();
  setupTabs();
  setupEventListeners();
  await syncWithHosts();
  updateUI();
});

// Cargar estado desde storage
async function loadState() {
  try {
    const result = await chrome.storage.local.get('hostBlockerState');
    if (result.hostBlockerState) {
      state = result.hostBlockerState;
    }
  } catch (error) {
    console.error('Error loading state:', error);
  }
}

// Guardar estado en storage
async function saveState() {
  try {
    await chrome.storage.local.set({ hostBlockerState: state });
  } catch (error) {
    console.error('Error saving state:', error);
  }
}

// Sincronizar con el archivo hosts
async function syncWithHosts() {
  updateSyncStatus('słuchando...', false);
  
  try {
    // Intentar leer el hosts desde diferentes ubicaciones
    const hostsContent = await readHostsFile();
    
    if (hostsContent) {
      parseHostsFile(hostsContent);
      updateSyncStatus('Sincronizado', true);
      showStatus('Hosts sincronizado correctamente', 'active');
    } else {
      // Si no puede leer el hosts, usar datos de ejemplo
      loadSampleData();
      updateSyncStatus('Modo offline', false);
      showStatus('Usando datos de ejemplo', 'inactive');
    }
  } catch (error) {
    console.error('Sync error:', error);
    loadSampleData();
    updateSyncStatus('Error de sincronización', false);
  }
  
  state.lastSync = new Date().toISOString();
  await saveState();
}

// Leer archivo hosts (simulado - en producción necesitaría permisos especiales)
async function readHostsFile() {
  // En un entorno real, esto necesitaría una extensión nativa o API
  // Por ahora, intentamos fetch local o usamos datos de ejemplo
  
  try {
    // Intentar obtener desde storage local
    const result = await chrome.storage.local.get('hostsContent');
    if (result.hostsContent) {
      return result.hostsContent;
    }
  } catch (error) {
    console.log('No se pudo leer hosts local');
  }
  
  return null;
}

// Parsear archivo hosts
function parseHostsFile(content) {
  // Limpiar dominios actuales
  Object.keys(CATEGORIES).forEach(cat => {
    CATEGORIES[cat].domains = [];
  });
  
  const lines = content.split('\n');
  let currentComment = '';
  
  lines.forEach(line => {
    line = line.trim();
    
    // Ignorar líneas vacías y comentarios
    if (!line || line.startsWith('#')) {
      if (line.startsWith('# ---')) {
        currentComment = line.replace(/#/g, '').trim();
      }
      return;
    }
    
    // Parsear línea de dominio
    const parts = line.split(/\s+/);
    if (parts.length >= 2) {
      const ip = parts[0];
      const domain = parts[1];
      
      // Ignorar localhost
      if (domain === 'localhost' || ip === '127.0.0.1' || ip === '::1') {
        return;
      }
      
      // Clasificar dominio
      const category = classifyDomain(domain, currentComment);
      if (category) {
        CATEGORIES[category].domains.push(domain);
      }
    }
  });
}

// Clasificar dominio en categoría
function classifyDomain(domain, context = '') {
  const testString = `${domain} ${context}`.toLowerCase();
  
  for (const [category, data] of Object.entries(CATEGORIES)) {
    if (data.patterns.some(pattern => pattern.test(testString))) {
      return category;
    }
  }
  
  // Si no coincide con ningún patrón, poner en entretenimiento por defecto
  return 'entertainment';
}

// Cargar datos de ejemplo
function loadSampleData() {
  CATEGORIES.adult.domains = [
    'pornhub.com', 'xvideos.com', 'xhamster.com', 'redtube.com', 'youporn.com',
    'spankbang.com', 'beeg.com', 'tube8.com', 'xnxx.com', 'chaturbate.com',
    'onlyfans.com', 'fansly.com', 'tinder.com', 'bumble.com', 'grindr.com'
  ];
  
  CATEGORIES.games.domains = [
    'friv.com', 'crazygames.com', 'minijuegos.com', 'roblox.com', 'epicgames.com',
    'store.steampowered.com', 'minecraft.net', 'fortnite.com', 'kongregate.com',
    'newgrounds.com', 'miniclip.com', 'poki.com', 'y8.com', 'chess.com'
  ];
  
  CATEGORIES.downloads.domains = [
    'softonic.com', 'uptodown.com', 'malavida.com', 'filehippo.com', 'softpedia.com',
    'majorgeeks.com', 'filehorse.com', 'chip.de', 'thepiratebay.org', '1337x.to',
    'kickasstorrents.com', 'rarbg.to', 'nyaa.si', 'yts.mx'
  ];
  
  CATEGORIES.entertainment.domains = [
    'youtube.com', 'netflix.com', 'hulu.com', 'disneyplus.com', 'spotify.com',
    'facebook.com', 'instagram.com', 'twitter.com', 'tiktok.com', 'snapchat.com',
    'reddit.com', 'discord.com', 'twitch.tv', 'amazon.com', 'ebay.com'
  ];
}

// Configurar pestañas
function setupTabs() {
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      
      tab.classList.add('active');
      document.getElementById(tab.dataset.tab).classList.add('active');
    });
  });
}

// Configurar event listeners
function setupEventListeners() {
  // Botones principales
  document.getElementById('syncBtn').addEventListener('click', syncWithHosts);
  document.getElementById('refreshBtn').addEventListener('click', updateUI);
  document.getElementById('importBtn').addEventListener('click', importHosts);
  document.getElementById('exportBtn').addEventListener('click', exportHosts);
  
  // Configuración
  document.getElementById('autoSync').addEventListener('change', saveSettings);
  document.getElementById('detectContent').addEventListener('change', saveSettings);
  document.getElementById('showOverlay').addEventListener('change', saveSettings);
}

// Actualizar UI
function updateUI() {
  renderCategories();
  updateStats();
}

// Renderizar categorías
function renderCategories() {
  const container = document.getElementById('categoriesContainer');
  container.innerHTML = '';
  
  Object.entries(CATEGORIES).forEach(([key, category]) => {
    if (category.domains.length === 0) return;
    
    const div = document.createElement('div');
    div.className = 'category';
    div.innerHTML = `
      <div class="category-header">
        <span class="category-name">${category.icon} ${category.name}</span>
        <span class="category-count">${category.domains.length}</span>
      </div>
      <div class="domain-list" id="list-${key}">
        ${category.domains.map(domain => `
          <div class="domain-item">
            <span>${domain}</span>
            <div class="domain-actions">
              <button class="domain-btn block" onclick="toggleDomain('${key}', '${domain}', false)">✕</button>
            </div>
          </div>
        `).join('')}
      </div>
      <div class="show-more" onclick="toggleList('${key}')">Ver dominios</div>
    `;
    container.appendChild(div);
  });
}

// Toggle lista de dominios
function toggleList(category) {
  const list = document.getElementById(`list-${category}`);
  list.classList.toggle('show');
}

// Toggle dominio (bloquear/desbloquear)
function toggleDomain(category, domain, block) {
  if (block) {
    if (!CATEGORIES[category].domains.includes(domain)) {
      CATEGORIES[category].domains.push(domain);
    }
  } else {
    CATEGORIES[category].domains = CATEGORIES[category].domains.filter(d => d !== domain);
  }
  
  saveState();
  updateUI();
}

// Importar hosts
async function importHosts() {
  const content = document.getElementById('hostsInput').value;
  if (!content.trim()) {
    showStatus('Por favor, pega el contenido del hosts', 'inactive');
    return;
  }
  
  parseHostsFile(content);
  
  // Guardar en storage
  await chrome.storage.local.set({ hostsContent: content });
  
  saveState();
  updateUI();
  showStatus('Hosts importado correctamente', 'active');
}

// Exportar hosts
function exportHosts() {
  let hostsContent = `# ====================================
# HOST BLOCKER - FILTRO DE CONTENIDO
# ====================================
# Generado por Host Blocker Sync
# Fecha: ${new Date().toLocaleString()}
# ====================================

`;
  
  Object.entries(CATEGORIES).forEach(([key, category]) => {
    if (category.domains.length === 0) return;
    
    hostsContent += `\n# --- ${category.name.toUpperCase()} ---\n`;
    category.domains.forEach(domain => {
      hostsContent += `0.0.0.0 ${domain}\n`;
      hostsContent += `0.0.0.0 www.${domain}\n`;
    });
  });
  
  // Crear y descargar archivo
  const blob = new Blob([hostsContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'hosts';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  showStatus('Hosts exportado correctamente', 'active');
}

// Guardar configuración
function saveSettings() {
  state.categorySettings = {
    adult: document.getElementById('autoSync').checked,
    games: document.getElementById('detectContent').checked,
    downloads: document.getElementById('showOverlay').checked,
    entertainment: true
  };
  saveState();
}

// Actualizar estado de sincronización
function updateSyncStatus(text, online) {
  const dot = document.getElementById('syncDot');
  const textEl = document.getElementById('syncText');
  
  dot.className = online ? 'sync-dot' : 'sync-dot offline';
  textEl.textContent = text;
}

// Actualizar estadísticas
function updateStats() {
  let total = 0;
  Object.values(CATEGORIES).forEach(cat => {
    total += cat.domains.length;
  });
  
  document.getElementById('totalBlocked').textContent = total;
  document.getElementById('activeCategories').textContent = 
    Object.values(CATEGORIES).filter(cat => cat.domains.length > 0).length;
  document.getElementById('lastSync').textContent = 
    state.lastSync ? new Date(state.lastSync).toLocaleString() : 'Nunca';
}

// Mostrar mensaje de estado
function showStatus(message, type) {
  const bar = document.getElementById('statusBar');
  bar.textContent = message;
  bar.className = 'status-bar show';
  
  setTimeout(() => {
    bar.classList.remove('show');
  }, 3000);
}
