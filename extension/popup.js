let statusData = null;

document.addEventListener('DOMContentLoaded', async () => {
  setupListeners();
  await loadStatus();
});

function setupListeners() {
  document.getElementById('syncBtn').addEventListener('click', async () => {
    showToast('Sincronizando con GitHub...');
    chrome.runtime.sendMessage({ action: 'syncNow' }, async () => {
      await loadStatus();
      showToast('Sincronización completada');
    });
  });

  document.getElementById('blockAll').addEventListener('click', async () => {
    showToast('Bloqueando todos los sitios...');
    chrome.runtime.sendMessage({ action: 'enableAll' }, async () => {
      await loadStatus();
      showToast('Todos los sitios bloqueados');
    });
  });

  document.getElementById('unblockAll').addEventListener('click', async () => {
    showToast('Desbloqueando todos los sitios...');
    chrome.runtime.sendMessage({ action: 'disableAll' }, async () => {
      await loadStatus();
      showToast('Todos los sitios desbloqueados');
    });
  });
}

async function loadStatus() {
  chrome.runtime.sendMessage({ action: 'getStatus' }, (response) => {
    if (response) {
      statusData = response;
      renderUI();
    }
  });
}

function renderUI() {
  if (!statusData) return;

  const { domainLists, userSettings, individualOverrides, blockedCount, categories } = statusData;

  document.getElementById('blockedCount').textContent = blockedCount;
  const total = Object.values(domainLists).reduce((sum, list) => sum + list.length, 0);
  document.getElementById('totalDomains').textContent = total;

  const container = document.getElementById('categoriesContainer');
  container.innerHTML = '';

  for (const [catKey, catInfo] of Object.entries(categories)) {
    const domains = domainLists[catKey] || [];
    if (domains.length === 0) continue;

    const enabled = userSettings[catKey] || false;
    let enabledInCat = 0;
    for (const d of domains) {
      const key = `${catKey}:${d}`;
      if (individualOverrides[key] !== false) enabledInCat++;
    }

    const div = document.createElement('div');
    div.className = 'category';
    div.innerHTML = `
      <div class="category-header">
        <span class="cat-icon">${catInfo.icon}</span>
        <div class="cat-info">
          <div class="cat-name">${catInfo.name}</div>
          <div class="cat-count">${enabledInCat} de ${domains.length} sitios activos</div>
        </div>
        <label class="toggle">
          <input type="checkbox" data-category="${catKey}" class="cat-toggle" ${enabled ? 'checked' : ''}>
          <span class="slider"></span>
        </label>
      </div>
      <div class="expand-btn" data-expand="${catKey}">Ver sitios (${domains.length})</div>
      <div class="domain-list" id="list-${catKey}"></div>
    `;
    container.appendChild(div);

    const listDiv = div.querySelector(`#list-${catKey}`);
    const expandBtn = div.querySelector(`[data-expand="${catKey}"]`);
    const catToggle = div.querySelector('.cat-toggle');

    expandBtn.addEventListener('click', () => {
      listDiv.classList.toggle('open');
      expandBtn.textContent = listDiv.classList.contains('open')
        ? `Ocultar sitios (${domains.length})`
        : `Ver sitios (${domains.length})`;
    });

    catToggle.addEventListener('change', (e) => {
      chrome.runtime.sendMessage({
        action: 'toggleCategory',
        category: catKey,
        enabled: e.target.checked
      }, () => {
        loadStatus();
      });
    });

    for (const domain of domains) {
      const key = `${catKey}:${domain}`;
      const isBlocked = individualOverrides[key] !== false;
      const item = document.createElement('div');
      item.className = `domain-item ${isBlocked ? 'blocked' : 'allowed'}`;
      item.innerHTML = `
        <label>
          <input type="checkbox" data-category="${catKey}" data-domain="${domain}" ${isBlocked ? 'checked' : ''}>
          ${domain}
        </label>
      `;
      listDiv.appendChild(item);

      item.querySelector('input').addEventListener('change', (e) => {
        chrome.runtime.sendMessage({
          action: 'toggleDomain',
          category: catKey,
          domain: domain,
          enabled: e.target.checked
        }, () => {
          loadStatus();
        });
      });
    }
  }

  const lastSync = localStorage.getItem('lastSync');
  document.getElementById('lastSync').textContent = lastSync
    ? `Última sync: ${new Date(lastSync).toLocaleTimeString()}`
    : 'Sin sincronizar';
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2000);
}
