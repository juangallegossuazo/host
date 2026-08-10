const REPO_URL = 'https://raw.githubusercontent.com/juangallegossuazo/host/main';
const SYNC_INTERVAL = 30 * 60 * 1000;

const CATEGORIES = {
  adult: { name: 'Contenido Adulto', icon: '🔞' },
  games: { name: 'Juegos Online', icon: '🎮' },
  downloads: { name: 'Descargas', icon: '📥' },
  entertainment: { name: 'Entretenimiento', icon: '📺' }
};

let domainLists = { adult: [], games: [], downloads: [], entertainment: [] };
let userSettings = { adult: false, games: false, downloads: false, entertainment: false };
let individualOverrides = {};

async function init() {
  await loadLocalData();
  await syncFromGitHub();
  await applyBlockingRules();
  setInterval(syncFromGitHub, SYNC_INTERVAL);
}

async function loadLocalData() {
  try {
    const data = await chrome.storage.local.get(['domainLists', 'userSettings', 'individualOverrides']);
    if (data.domainLists) domainLists = data.domainLists;
    if (data.userSettings) userSettings = data.userSettings;
    if (data.individualOverrides) individualOverrides = data.individualOverrides;
  } catch (e) {
    console.log('Error loading local data:', e);
  }
}

async function saveLocalData() {
  try {
    await chrome.storage.local.set({ domainLists, userSettings, individualOverrides });
  } catch (e) {
    console.log('Error saving local data:', e);
  }
}

async function syncFromGitHub() {
  const categories = ['adult', 'games', 'downloads', 'entertainment'];
  let totalDomains = 0;

  for (const cat of categories) {
    try {
      const response = await fetch(`${REPO_URL}/categories/${cat}.txt`);
      if (response.ok) {
        const text = await response.text();
        domainLists[cat] = parseDomainsFromText(text);
        totalDomains += domainLists[cat].length;
      }
    } catch (e) {
      console.log(`Error fetching ${cat}:`, e);
    }
  }

  await saveLocalData();
  await applyBlockingRules();

  chrome.storage.local.set({ lastSync: new Date().toISOString(), totalDomains });
}

function parseDomainsFromText(text) {
  const domains = [];
  const lines = text.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const parts = trimmed.split(/\s+/);
    if (parts.length >= 2) {
      const domain = parts[1];
      if (domain && domain !== 'localhost' && !domain.startsWith('127.') && !domain.startsWith('::1')) {
        domains.push(domain);
      }
    }
  }
  return [...new Set(domains)];
}

async function applyBlockingRules() {
  const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
  const removeRuleIds = existingRules.map(r => r.id);

  const rules = [];
  let ruleId = 1;

  for (const [category, enabled] of Object.entries(userSettings)) {
    if (!enabled) continue;
    const domains = domainLists[category] || [];

    for (const domain of domains) {
      const key = `${category}:${domain}`;
      if (individualOverrides[key] === false) continue;

      rules.push({
        id: ruleId++,
        priority: 1,
        action: { type: 'block' },
        condition: {
          urlFilter: `||${domain}`,
          resourceTypes: ['main_frame', 'sub_frame']
        }
      });
    }
  }

  try {
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds,
      addRules: rules.slice(0, 30000)
    });
  } catch (e) {
    console.log('Error applying rules:', e);
  }
}

async function toggleCategory(category, enabled) {
  userSettings[category] = enabled;
  await saveLocalData();
  await applyBlockingRules();
}

async function toggleDomain(category, domain, enabled) {
  const key = `${category}:${domain}`;
  individualOverrides[key] = enabled;
  await saveLocalData();
  await applyBlockingRules();
}

async function enableAll() {
  for (const cat of Object.keys(CATEGORIES)) {
    userSettings[cat] = true;
  }
  individualOverrides = {};
  await saveLocalData();
  await applyBlockingRules();
}

async function disableAll() {
  for (const cat of Object.keys(CATEGORIES)) {
    userSettings[cat] = false;
  }
  individualOverrides = {};
  await saveLocalData();
  await applyBlockingRules();
}

function getStatus() {
  let blockedCount = 0;
  for (const [category, enabled] of Object.entries(userSettings)) {
    if (!enabled) continue;
    const domains = domainLists[category] || [];
    for (const domain of domains) {
      const key = `${category}:${domain}`;
      if (individualOverrides[key] !== false) {
        blockedCount++;
      }
    }
  }

  return {
    domainLists,
    userSettings,
    individualOverrides,
    blockedCount,
    categories: CATEGORIES
  };
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getStatus') {
    sendResponse(getStatus());
  } else if (request.action === 'toggleCategory') {
    toggleCategory(request.category, request.enabled).then(() => sendResponse({ ok: true }));
    return true;
  } else if (request.action === 'toggleDomain') {
    toggleDomain(request.category, request.domain, request.enabled).then(() => sendResponse({ ok: true }));
    return true;
  } else if (request.action === 'enableAll') {
    enableAll().then(() => sendResponse({ ok: true }));
    return true;
  } else if (request.action === 'disableAll') {
    disableAll().then(() => sendResponse({ ok: true }));
    return true;
  } else if (request.action === 'syncNow') {
    syncFromGitHub().then(() => sendResponse({ ok: true }));
    return true;
  } else if (request.action === 'pageBlocked') {
    sendResponse({ received: true });
  }
  return true;
});

init();
