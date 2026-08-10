import { CATEGORY_META, CATEGORY_ICONS, DAY_NAMES } from '../common/constants.js';
import { getSettings, saveSettings, syncWithDjangoApi, getGithubPresets, getStats, getTodayCount, getWeekCount, getDomainStats, clearDomainStats } from '../common/storage.js';

let settings = {};
let debounceTimer = null;
let selectedCategory = null;
let headToggleBound = false;

async function init() {
  settings = await getSettings();
  const stats = await getStats();

  checkPinProtection();
  renderStats(stats);
  await renderHistory();
  bindClearHistory();
  renderBlockAction();
  renderYouTubeSettings();
  renderCustomBlocklist();
  renderWhitelist();
  renderCategories();
  renderScheduleMode();
  renderSchedule();
  renderSecuritySettings();
  initBackupHandlers();
}

function checkPinProtection() {
  const isPinActive = !!(settings.pinEnabled && settings.pinCode && settings.pinCode.trim());
  const isUnlocked = sessionStorage.getItem('pin_unlocked') === 'true';

  const overlay = document.getElementById('pinModalOverlay');
  if (!overlay) return;

  if (isPinActive && !isUnlocked) {
    overlay.style.display = 'flex';
    const input = document.getElementById('pinChallengeInput');
    const btn = document.getElementById('pinChallengeBtn');
    const error = document.getElementById('pinChallengeError');

    if (input) {
      input.value = '';
      setTimeout(() => input.focus(), 100);
      input.onkeydown = (e) => {
        if (e.key === 'Enter') verifyPin();
      };
    }

    if (btn) {
      btn.onclick = verifyPin;
    }

    function verifyPin() {
      const typedPin = (input ? input.value : '').trim();
      if (typedPin === settings.pinCode.trim()) {
        sessionStorage.setItem('pin_unlocked', 'true');
        overlay.style.display = 'none';
        if (error) error.style.display = 'none';
      } else {
        if (error) error.style.display = 'block';
        if (input) {
          input.value = '';
          input.style.borderColor = '#ef4444';
          setTimeout(() => { input.style.borderColor = ''; }, 1200);
        }
      }
    }
  } else {
    overlay.style.display = 'none';
  }
}

// --- Statistics ---

function renderStats(stats) {
  const today = getTodayCount(stats);
  document.getElementById('todayStat').textContent = today;
  document.getElementById('weekStat').textContent = getWeekCount(stats);
  const headerStat = document.getElementById('headerStat');
  if (headerStat) headerStat.textContent = today;

  const adsStat = document.getElementById('adsStat');
  if (adsStat) adsStat.textContent = settings.totalAdsBlocked || 128;
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

async function renderHistory() {
  const domainStats = await getDomainStats();
  const listEl = document.getElementById('historyList');
  const emptyEl = document.getElementById('historyEmpty');
  const summaryEl = document.getElementById('historySummary');

  const entries = Object.entries(domainStats)
    .map(([domain, entry]) => ({ domain, count: entry.count || 0, lastBlocked: entry.lastBlocked }))
    .sort((a, b) => b.count - a.count || (a.lastBlocked < b.lastBlocked ? 1 : -1));

  if (!listEl) return;

  if (entries.length === 0) {
    listEl.innerHTML = '';
    if (emptyEl) emptyEl.style.display = '';
    if (summaryEl) summaryEl.textContent = '';
    return;
  }

  if (emptyEl) emptyEl.style.display = 'none';
  const total = entries.reduce((sum, e) => sum + e.count, 0);
  if (summaryEl) summaryEl.textContent = `${entries.length} sitio(s) · ${total} intento(s)`;

  listEl.innerHTML = entries.map(({ domain, count, lastBlocked }) => `
    <div class="history-row">
      <span class="history-domain" title="${domain}">${domain}</span>
      <span class="col-count"><span class="badge-count">${count}</span></span>
      <span class="col-date history-date">${formatDate(lastBlocked)}</span>
    </div>
  `).join('');
}

function bindClearHistory() {
  const btn = document.getElementById('clearHistoryBtn');
  if (!btn) return;
  btn.addEventListener('click', async () => {
    await clearDomainStats();
    await renderHistory();
  });
}

// --- Block Action & AdBlocker ---

function renderBlockAction() {
  const radios = document.querySelectorAll('input[name="blockAction"]');
  const redirectRow = document.getElementById('redirectUrlRow');
  const redirectInput = document.getElementById('redirectUrl');
  const snoozeRow = document.getElementById('snoozeSettingContainer');
  const snoozeCheckbox = document.getElementById('allowSnoozeOnBlockPage');
  const adBlockToggle = document.getElementById('adBlockToggle');

  radios.forEach(radio => {
    radio.checked = radio.value === settings.blockAction;
    radio.addEventListener('change', async () => {
      settings.blockAction = radio.value;
      await saveSettings({ blockAction: radio.value });
      if (redirectRow) redirectRow.style.display = radio.value === 'redirect' ? 'flex' : 'none';
      const showSnooze = radio.value === 'blockPage' || radio.value === 'quiz' || radio.value === 'mindfulness';
      if (snoozeRow) snoozeRow.style.display = showSnooze ? 'flex' : 'none';
    });
  });

  if (redirectRow) redirectRow.style.display = settings.blockAction === 'redirect' ? 'flex' : 'none';
  if (redirectInput) redirectInput.value = settings.redirectUrl || 'https://es.wikipedia.org';

  if (snoozeCheckbox) {
    snoozeCheckbox.checked = !!settings.allowSnoozeOnBlockPage;
    snoozeCheckbox.addEventListener('change', async () => {
      settings.allowSnoozeOnBlockPage = snoozeCheckbox.checked;
      await saveSettings({ allowSnoozeOnBlockPage: snoozeCheckbox.checked });
    });
  }

  if (adBlockToggle) {
    adBlockToggle.checked = settings.adBlockEnabled !== undefined ? !!settings.adBlockEnabled : true;
    adBlockToggle.addEventListener('change', async () => {
      settings.adBlockEnabled = adBlockToggle.checked;
      await saveSettings({ adBlockEnabled: adBlockToggle.checked });
    });
  }

  if (redirectInput) {
    redirectInput.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(async () => {
        const url = redirectInput.value.trim();
        if (url) {
          settings.redirectUrl = url;
          await saveSettings({ redirectUrl: url });
        }
      }, 500);
    });
  }
}

// --- YouTube ---

function renderYouTubeSettings() {
  const checkbox = document.getElementById('blockYouTubeShorts');
  if (!checkbox) return;

  checkbox.checked = settings.blockYouTubeShorts !== undefined ? !!settings.blockYouTubeShorts : true;
  checkbox.addEventListener('change', async () => {
    settings.blockYouTubeShorts = checkbox.checked;
    await saveSettings({ blockYouTubeShorts: checkbox.checked });
  });
}

// --- Custom Blocklist ---

async function renderCustomBlocklist() {
  const container = document.getElementById('blocklistCategories');
  const input = document.getElementById('domainInput');
  const addBtn = document.getElementById('addDomainBtn');
  if (!container) return;

  const githubPresets = await getGithubPresets();
  container.replaceChildren();

  for (const [catId, meta] of Object.entries(CATEGORY_META)) {
    const domains = githubPresets[catId] || [];
    if (domains.length === 0) continue;

    const section = document.createElement('div');
    section.className = 'blocklist-category';

    const header = document.createElement('div');
    header.className = 'blocklist-category-header';

    const icon = document.createElement('span');
    icon.className = 'blocklist-category-icon';
    icon.textContent = meta.icon;

    const label = document.createElement('span');
    label.className = 'blocklist-category-label';
    label.textContent = meta.label;

    const count = document.createElement('span');
    count.className = 'blocklist-category-count';
    count.textContent = domains.length;

    header.append(icon, label, count);

    const list = document.createElement('div');
    list.className = 'blocklist-category-list';
    list.style.display = 'none';

    for (const domain of domains) {
      const row = document.createElement('div');
      row.className = 'blocklist-domain-row';

      const domainSpan = document.createElement('span');
      domainSpan.className = 'blocklist-domain-name';
      domainSpan.textContent = domain;

      const removeBtn = document.createElement('button');
      removeBtn.className = 'domain-remove';
      removeBtn.textContent = '\u00D7';
      removeBtn.title = 'Remove domain';
      removeBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        settings.customBlocklist = settings.customBlocklist.filter(d => d !== domain);
        await saveSettings({ customBlocklist: settings.customBlocklist });
        row.remove();
        const newCount = list.querySelectorAll('.blocklist-domain-row').length;
        count.textContent = newCount;
      });

      row.append(domainSpan, removeBtn);
      list.appendChild(row);
    }

    header.addEventListener('click', () => {
      const isOpen = list.style.display !== 'none';
      list.style.display = isOpen ? 'none' : 'block';
      section.classList.toggle('expanded', !isOpen);
    });

    section.append(header, list);
    container.appendChild(section);
  }

  addBtn.addEventListener('click', addDomain);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addDomain();
  });

  async function addDomain() {
    let domain = input.value.trim().toLowerCase();
    if (!domain) return;

    domain = domain
      .replace(/^https?:\/\//, '')
      .replace(/\/.*$/, '')
      .replace(/^www\./, '')
      .replace(/^\*\./, '');

    if (!domain || domain.includes(' ') || !domain.includes('.')) {
      input.style.borderColor = '#EF4444';
      setTimeout(() => { input.style.borderColor = ''; }, 1500);
      return;
    }

    if (settings.customBlocklist.includes(domain)) {
      input.style.borderColor = '#f59e0b';
      setTimeout(() => { input.style.borderColor = ''; }, 1500);
      return;
    }

    settings.customBlocklist.push(domain);
    await saveSettings({ customBlocklist: settings.customBlocklist });
    syncWithDjangoApi().catch(() => {});
    input.value = '';
    renderCustomBlocklist();
  }
}

// --- Whitelist ---

function renderWhitelist() {
  const list = document.getElementById('whitelistDomainList');
  const input = document.getElementById('whitelistInput');
  const addBtn = document.getElementById('addWhitelistBtn');
  if (!list || !input || !addBtn) return;

  const whiteList = settings.whiteList || ['docs.google.com', 'github.com', 'wikipedia.org'];

  function renderList() {
    list.replaceChildren();
    for (const domain of whiteList) {
      const li = document.createElement('li');
      li.className = 'domain-item';
      li.style.borderColor = 'rgba(16, 185, 129, 0.4)';

      const nameSpan = document.createElement('span');
      nameSpan.className = 'domain-name';
      nameSpan.textContent = domain;

      const removeBtn = document.createElement('button');
      removeBtn.className = 'domain-remove';
      removeBtn.textContent = '\u00D7';
      removeBtn.addEventListener('click', async () => {
        settings.whiteList = (settings.whiteList || []).filter(d => d !== domain);
        await saveSettings({ whiteList: settings.whiteList });
        renderList();
      });

      li.append(nameSpan, removeBtn);
      list.appendChild(li);
    }
  }

  addBtn.addEventListener('click', async () => {
    let dom = input.value.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    if (dom && !whiteList.includes(dom)) {
      whiteList.push(dom);
      settings.whiteList = whiteList;
      await saveSettings({ whiteList });
      input.value = '';
      renderList();
    }
  });

  renderList();
}

// --- Security (PIN) & Anti-Uninstall ---

// --- Categories ---

async function renderCategories() {
  const githubPresets = await getGithubPresets();
  const grid = document.getElementById('categoriesGrid');
  grid.replaceChildren();

  for (const [catId, meta] of Object.entries(CATEGORY_META)) {
    const domains = githubPresets[catId] || [];
    const isActive = settings.categoryToggles[catId] || false;

    const card = document.createElement('div');
    card.className = 'category-card';

    const header = document.createElement('div');
    header.className = 'category-card-header';

    const left = document.createElement('div');
    left.className = 'category-card-left';

    const icon = document.createElement('span');
    icon.className = 'category-card-icon';
    icon.textContent = meta.icon;

    const info = document.createElement('div');
    info.className = 'category-card-info';

    const label = document.createElement('span');
    label.className = 'category-card-label';
    label.textContent = meta.label;

    const count = document.createElement('span');
    count.className = 'category-card-count';
    count.textContent = domains.length + ' sitios';

    info.append(label, count);
    left.append(icon, info);

    const toggle = document.createElement('label');
    toggle.className = 'switch';

    const toggleInput = document.createElement('input');
    toggleInput.type = 'checkbox';
    toggleInput.checked = isActive;

    const slider = document.createElement('span');
    slider.className = 'slider';

    toggle.append(toggleInput, slider);

    header.append(left, toggle);

    const table = document.createElement('div');
    table.className = 'category-card-table';
    table.style.display = 'none';

    for (const domain of domains) {
      const row = document.createElement('div');
      row.className = 'category-domain-row';
      row.textContent = domain;
      table.appendChild(row);
    }

    const addRow = document.createElement('div');
    addRow.className = 'category-add-row';

    const addInput = document.createElement('input');
    addInput.type = 'text';
    addInput.className = 'category-add-input';
    addInput.placeholder = 'Add domain...';

    const addBtn = document.createElement('button');
    addBtn.className = 'category-add-btn';
    addBtn.textContent = '+';

    async function addDomainToCategory() {
      let domain = addInput.value.trim().toLowerCase();
      if (!domain) return;

      domain = domain
        .replace(/^https?:\/\//, '')
        .replace(/\/.*$/, '')
        .replace(/^www\./, '')
        .replace(/^\*\./, '');

      if (!domain || domain.includes(' ') || !domain.includes('.')) {
        addInput.style.borderColor = '#EF4444';
        setTimeout(() => { addInput.style.borderColor = ''; }, 1500);
        return;
      }

      if (settings.customBlocklist.includes(domain)) {
        addInput.style.borderColor = '#f59e0b';
        setTimeout(() => { addInput.style.borderColor = ''; }, 1500);
        return;
      }

      settings.customBlocklist.push(domain);
      await saveSettings({ customBlocklist: settings.customBlocklist });
      syncWithDjangoApi().catch(() => {});
      addInput.value = '';
      renderCategories();
    }

    addBtn.addEventListener('click', addDomainToCategory);
    addInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') addDomainToCategory();
    });

    addRow.append(addInput, addBtn);
    table.appendChild(addRow);

    header.addEventListener('click', (e) => {
      if (e.target === toggleInput || e.target === slider || toggle.contains(e.target)) return;
      if (e.target === addInput || e.target === addBtn) return;
      const isOpen = table.style.display !== 'none';
      table.style.display = isOpen ? 'none' : 'block';
      card.classList.toggle('expanded', !isOpen);
    });

    toggleInput.addEventListener('change', async () => {
      settings.categoryToggles[catId] = toggleInput.checked;
      await saveSettings({ categoryToggles: settings.categoryToggles });
      chrome.runtime.sendMessage({ type: 'REBUILD_RULES' }).catch(() => {});
    });

    card.append(header, table);
    grid.appendChild(card);
  }
}

async function toggleCategoryDomain(catId, domain) {
  const unblocked = settings.categoryUnblocked[catId] || [];
  const idx = unblocked.indexOf(domain);
  if (idx >= 0) unblocked.splice(idx, 1);
  else unblocked.push(domain);
  settings.categoryUnblocked[catId] = unblocked;
  await saveSettings({ categoryUnblocked: settings.categoryUnblocked });
  renderCategoryTable(catId);
}

// --- Schedule ---

function renderScheduleMode() {
  const toggle = document.getElementById('scheduleModeToggle');
  const table = document.getElementById('scheduleTable');
  const buttons = toggle.querySelectorAll('.mode-btn');

  buttons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mode === settings.scheduleMode);
  });
  table.style.display = settings.scheduleMode === 'scheduled' ? '' : 'none';

  buttons.forEach(btn => {
    btn.addEventListener('click', async () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      settings.scheduleMode = btn.dataset.mode;
      table.style.display = btn.dataset.mode === 'scheduled' ? '' : 'none';
      await saveSettings({ scheduleMode: btn.dataset.mode });
    });
  });
}

function renderSchedule() {
  const table = document.getElementById('scheduleTable');
  table.replaceChildren();

  const dayOrder = [1, 2, 3, 4, 5, 6, 0];

  for (const dayIndex of dayOrder) {
    const dayConfig = settings.schedule[dayIndex.toString()];
    const row = document.createElement('div');
    row.className = 'schedule-row' + (dayConfig.enabled ? ' active' : '');

    const daySpan = document.createElement('span');
    daySpan.className = 'schedule-day';
    daySpan.textContent = DAY_NAMES[dayIndex];

    const toggleLabel = document.createElement('label');
    toggleLabel.className = 'schedule-toggle';

    const toggle = document.createElement('input');
    toggle.type = 'checkbox';
    toggle.checked = dayConfig.enabled;

    const sliderSpan = document.createElement('span');
    sliderSpan.className = 'schedule-slider';

    toggleLabel.append(toggle, sliderSpan);

    const timesDiv = document.createElement('div');
    timesDiv.className = 'schedule-times';

    const startInput = document.createElement('input');
    startInput.type = 'time';
    startInput.className = 'time-input start-time';
    startInput.value = dayConfig.startTime;
    startInput.disabled = !dayConfig.enabled;

    const dashSpan = document.createElement('span');
    dashSpan.textContent = '\u2014';

    const endInput = document.createElement('input');
    endInput.type = 'time';
    endInput.className = 'time-input end-time';
    endInput.value = dayConfig.endTime;
    endInput.disabled = !dayConfig.enabled;

    timesDiv.append(startInput, dashSpan, endInput);
    row.append(daySpan, toggleLabel, timesDiv);

    toggle.addEventListener('change', async () => {
      settings.schedule[dayIndex.toString()].enabled = toggle.checked;
      startInput.disabled = !toggle.checked;
      endInput.disabled = !toggle.checked;
      row.classList.toggle('active', toggle.checked);
      await saveSettings({ schedule: settings.schedule });
    });

    const saveTime = () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(async () => {
        settings.schedule[dayIndex.toString()].startTime = startInput.value;
        settings.schedule[dayIndex.toString()].endTime = endInput.value;
        await saveSettings({ schedule: settings.schedule });
      }, 500);
    };

    startInput.addEventListener('change', saveTime);
    endInput.addEventListener('change', saveTime);

    table.appendChild(row);
  }
}

// --- Backup & Restore ---

function initBackupHandlers() {
  const exportBtn = document.getElementById('exportBackupBtn');
  const importInput = document.getElementById('importBackupInput');
  const hintEl = document.getElementById('backupStatusHint');

  if (exportBtn) {
    exportBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      const data = JSON.stringify(settings, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'hostblocker-backup.json';
      a.click();
      URL.revokeObjectURL(url);
      if (hintEl) hintEl.textContent = '✅ Copia de seguridad exportada correctamente.';
    });
  }

  if (importInput) {
    importInput.addEventListener('change', async (e) => {
      e.preventDefault();
      const file = e.target.files[0];
      if (!file) return;
      try {
        const text = await file.text();
        const imported = JSON.parse(text);
        await saveSettings(imported);
        if (hintEl) hintEl.textContent = '✅ Configuración importada correctamente.';
        await init();
      } catch {
        if (hintEl) hintEl.textContent = '❌ Error al importar: archivo inválido.';
      }
    });
  }

  const syncBtn = document.getElementById('syncDjangoApiBtn');
  const apiHint = document.getElementById('apiSyncStatusHint');

  if (syncBtn) {
    syncBtn.addEventListener('click', async () => {
      syncBtn.disabled = true;
      syncBtn.textContent = '⚡ Sincronizando...';
      if (apiHint) apiHint.textContent = 'Conectando con GitHub...';

      const res = await syncWithDjangoApi();
      syncBtn.disabled = false;
      syncBtn.textContent = '⚡ Sincronizar Ahora';

      if (res && res.ok) {
        if (apiHint) apiHint.textContent = `🟢 ¡Sincronización exitosa! ${res.newDomains || 0} nuevos dominios descargados.`;
        await init();
      } else {
        if (apiHint) apiHint.textContent = `❌ Error al sincronizar: ${res?.error || 'Intenta de nuevo'}`;
      }
    });
  }
}

function renderSecuritySettings() {
  const pinToggle = document.getElementById('pinToggle');
  const pinRow = document.getElementById('pinInputRow');
  const pinInput = document.getElementById('pinCodeInput');
  const savePinBtn = document.getElementById('savePinBtn');
  const uninstallToggle = document.getElementById('uninstallProtectionToggle');

  if (pinToggle && pinRow) {
    pinToggle.checked = !!settings.pinEnabled;
    pinRow.style.display = settings.pinEnabled ? 'flex' : 'none';

    pinToggle.addEventListener('change', async () => {
      settings.pinEnabled = pinToggle.checked;
      pinRow.style.display = pinToggle.checked ? 'flex' : 'none';
      await saveSettings({ pinEnabled: pinToggle.checked });
    });
  }

  if (pinInput && settings.pinCode) {
    pinInput.value = settings.pinCode;
  }

  if (savePinBtn && pinInput) {
    savePinBtn.addEventListener('click', async () => {
      const code = pinInput.value.trim();
      if (code) {
        settings.pinCode = code;
        sessionStorage.setItem('pin_unlocked', 'true');
        await saveSettings({ pinCode: code });
        savePinBtn.textContent = '¡PIN Guardado!';
        setTimeout(() => { savePinBtn.textContent = 'Guardar PIN'; }, 1500);
      }
    });
  }

  if (uninstallToggle) {
    uninstallToggle.checked = !!settings.uninstallProtection;
    uninstallToggle.addEventListener('change', async () => {
      settings.uninstallProtection = uninstallToggle.checked;
      await saveSettings({ uninstallProtection: uninstallToggle.checked });
      chrome.runtime.sendMessage({ type: 'UPDATE_UNINSTALL_PROTECTION' }).catch(() => {});
    });
  }
}

init();
