import { CATEGORY_META } from '../common/constants.js';
import { getSettings, saveSettings, syncWithDjangoApi, getGithubPresets, extractHostname } from '../common/storage.js';

let currentHostname = null;

const SVG_BLOCK = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
  <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2.2"/>
  <line x1="6.5" y1="6.5" x2="17.5" y2="17.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
</svg>`;

const SVG_CHECK = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
  <path d="M5 12l5 5L19 7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

function showPinModal() {
  return new Promise((resolve) => {
    const modal = document.getElementById('pinModal');
    const input = document.getElementById('pinInput');
    const error = document.getElementById('pinError');
    const confirmBtn = document.getElementById('pinConfirmBtn');
    const cancelBtn = document.getElementById('pinCancelBtn');

    modal.style.display = 'flex';
    input.value = '';
    error.style.display = 'none';
    setTimeout(() => input.focus(), 50);

    function cleanup() {
      modal.style.display = 'none';
      confirmBtn.removeEventListener('click', onConfirm);
      cancelBtn.removeEventListener('click', onCancel);
      input.removeEventListener('keydown', onKeydown);
    }

    function onConfirm() {
      const pin = input.value.trim();
      resolve(pin);
      cleanup();
    }

    function onCancel() {
      resolve(null);
      cleanup();
    }

    function onKeydown(e) {
      if (e.key === 'Enter') onConfirm();
      if (e.key === 'Escape') onCancel();
    }

    confirmBtn.addEventListener('click', onConfirm);
    cancelBtn.addEventListener('click', onCancel);
    input.addEventListener('keydown', onKeydown);
  });
}

async function requestPin(settings) {
  if (!settings.pinEnabled || !settings.pinCode) return true;
  const pin = await showPinModal();
  if (pin === null) return false;
  return pin === settings.pinCode;
}

async function init() {
  let settings = await getSettings();

  // ── Status Badges ──────────────────
  const enableStatusBadge = document.getElementById('enableStatusBadge');
  const shortsStatusBadge = document.getElementById('shortsStatusBadge');

  function updateStatusPills(s) {
    if (enableStatusBadge) {
      if (s.enabled !== false) {
        enableStatusBadge.textContent = 'Activado';
        enableStatusBadge.style.background = 'rgba(16, 185, 129, 0.2)';
        enableStatusBadge.style.color = '#34d399';
      } else {
        enableStatusBadge.textContent = 'Desactivado';
        enableStatusBadge.style.background = 'rgba(239, 68, 68, 0.2)';
        enableStatusBadge.style.color = '#f87171';
      }
    }

    if (shortsStatusBadge) {
      if (s.blockYouTubeShorts) {
        shortsStatusBadge.textContent = 'Activado';
        shortsStatusBadge.style.background = 'rgba(16, 185, 129, 0.2)';
        shortsStatusBadge.style.color = '#34d399';
      } else {
        shortsStatusBadge.textContent = 'Desactivado';
        shortsStatusBadge.style.background = 'rgba(239, 68, 68, 0.2)';
        shortsStatusBadge.style.color = '#f87171';
      }
    }
  }

  updateStatusPills(settings);

  // ── Render Categories ─────────────
  async function renderCategories() {
    const grid = document.getElementById('categoriesGrid');
    const countEl = document.getElementById('categoriesCount');
    if (!grid) return;

    const s = await getSettings();
    const activeCount = Object.values(s.categoryToggles).filter(Boolean).length;
    if (countEl) countEl.textContent = `${activeCount}/${Object.keys(CATEGORY_META).length}`;

    grid.replaceChildren();

    for (const [catId, meta] of Object.entries(CATEGORY_META)) {
      const isActive = s.categoryToggles[catId] || false;

      const card = document.createElement('div');
      card.className = 'category-card' + (isActive ? ' active' : '');

      const icon = document.createElement('span');
      icon.className = 'category-icon';
      icon.textContent = meta.icon;

      const label = document.createElement('span');
      label.className = 'category-label';
      label.textContent = meta.label;

      card.append(icon, label);

      card.addEventListener('click', async () => {
        const current = await getSettings();
        const nextValue = !current.categoryToggles[catId];

        const allowed = await requestPin(current);
        if (!allowed) return;

        current.categoryToggles[catId] = nextValue;
        await saveSettings({ categoryToggles: current.categoryToggles });
        renderCategories();
        updateStatusPills(current);
        chrome.runtime.sendMessage({ type: 'REBUILD_RULES' }).catch(() => {});
      });

      grid.appendChild(card);
    }
  }

  await renderCategories();

  // ── AUTOMATIC BACKGROUND SYNC ──────────────────
  syncWithDjangoApi().then(async (result) => {
    if (result && result.ok) {
      const fresh = await getSettings();
      updateStatusPills(fresh);
      await renderCategories();
    }
  }).catch(() => {});

  // ── Current site ────────────────────────
  const siteNameEl = document.getElementById('siteName');
  const blockBtn   = document.getElementById('blockSiteBtn');
  const blockIcon  = document.getElementById('blockIcon');
  const blockLabel = document.getElementById('blockLabel');
  const favicon    = document.getElementById('siteFavicon');

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.url) currentHostname = extractHostname(tab.url);
  } catch { /* no access */ }

  if (!currentHostname || currentHostname.includes('chrome') || currentHostname.includes('extension')) {
    siteNameEl.textContent = 'No se puede bloquear esta página';
    blockBtn.disabled = true;
    blockLabel.textContent = 'No disponible';
    blockIcon.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
    </svg>`;
    favicon.classList.add('hidden');
    blockBtn.style.opacity = '0.5';
  } else {
    siteNameEl.textContent = currentHostname;
    favicon.src = `https://www.google.com/s2/favicons?domain=${currentHostname}&sz=32`;
    favicon.onerror = () => favicon.classList.add('hidden');

    const isBlocked = settings.customBlocklist.includes(currentHostname);
    updateBlockButton(isBlocked, blockBtn, blockIcon, blockLabel);

    blockBtn.addEventListener('click', async () => {
      const s = await getSettings();

      const allowed = await requestPin(s);
      if (!allowed) return;

      const idx = s.customBlocklist.indexOf(currentHostname);
      if (idx >= 0) {
        s.customBlocklist.splice(idx, 1);
        await saveSettings({ customBlocklist: s.customBlocklist });
        updateBlockButton(false, blockBtn, blockIcon, blockLabel);
      } else {
        s.customBlocklist.push(currentHostname);
        await saveSettings({ customBlocklist: s.customBlocklist });
        updateBlockButton(true, blockBtn, blockIcon, blockLabel);
        await applyBlockToCurrentTab(s);
      }
      chrome.runtime.sendMessage({ type: 'TRIGGER_API_SYNC' }).catch(() => {});
      syncWithDjangoApi().catch(() => {});
    });
  }

  // ── Settings gear ───────────────────────
  document.getElementById('settingsBtn').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
    window.close();
  });
}

async function applyBlockToCurrentTab(settings) {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) return;

    if (settings.blockAction === 'closeTab') {
      window.close();
      await chrome.tabs.remove(tab.id);
    } else if (settings.blockAction === 'redirect') {
      await chrome.tabs.update(tab.id, { url: settings.redirectUrl });
      window.close();
    } else {
      const blockedUrl = chrome.runtime.getURL(
        'blocked/blocked.html?domain=' + encodeURIComponent(currentHostname)
      );
      await chrome.tabs.update(tab.id, { url: blockedUrl });
      window.close();
    }
  } catch { /* tab may be gone */ }
}

function updateBlockButton(isBlocked, btn, icon, label) {
  if (isBlocked) {
    btn.classList.add('is-blocked');
    icon.innerHTML = SVG_CHECK;
    label.textContent = 'Desbloquear este sitio';
  } else {
    btn.classList.remove('is-blocked');
    icon.innerHTML = SVG_BLOCK;
    label.textContent = 'Bloquear este sitio';
  }
}

init();
