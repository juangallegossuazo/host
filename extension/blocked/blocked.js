import { MOTIVATIONAL_MESSAGES, CATEGORY_META } from '../common/constants.js';
import { getSettings, incrementStat, incrementDomainStat, isWithinSchedule, hasAnyScheduleEnabled, getNextTransitionTime } from '../common/storage.js';
import { PRESETS } from '../data/presets.js';

async function init() {
  // Parse blocked domain from URL
  const params = new URLSearchParams(window.location.search);
  const domain = params.get('domain') || 'Unknown site';
  document.getElementById('blockedDomain').textContent = domain;

  // Random motivational message
  const msg = MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)];
  document.getElementById('motivation').textContent = `"${msg}"`;

  // Increment stat
  await incrementStat();
  if (domain !== 'Unknown site') {
    await incrementDomainStat(domain);
  }

  // Countdown timer
  const settings = await getSettings();

  // Report blocked domain attempt to Django API Server in real time
  if (domain && domain !== 'Unknown site') {
    try {
      const logsUrl = (settings.apiUrl || 'http://127.0.0.1:8000/api/v1/sync/').replace('/api/v1/sync/', '/api/v1/logs/');
      fetch(logsUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain: domain,
          pcName: navigator.platform ? 'PC (' + navigator.platform + ')' : 'PC-Local',
          apiKey: settings.apiKey || ''
        })
      }).catch(() => {});
    } catch (e) {}
  }

  // Close tab button
  document.getElementById('closeTabBtn').addEventListener('click', () => {
    window.close();
  });

  if (isScheduled) {
    const nextTransition = getNextTransitionTime(settings.schedule);
    const currentlyInSchedule = isWithinSchedule(settings.schedule);

    if (currentlyInSchedule && nextTransition) {
      document.getElementById('timerSection').style.display = 'block';
      startCountdown(nextTransition);
    } else {
      document.getElementById('alwaysOn').style.display = 'block';
    }
  } else {
    document.getElementById('alwaysOn').style.display = 'block';
  }
}

function initSnoozeUI(settings, domain) {
  const section = document.getElementById('snoozeSection');
  if (!section) return;

  if (!settings.allowSnoozeOnBlockPage) {
    section.style.display = 'none';
    showUnblockHint(settings, domain);
    return;
  }

  section.style.display = 'block';
  const statusEl = document.getElementById('snoozeStatus');
  const buttons = Array.from(section.querySelectorAll('.snooze-btn'));

  for (const btn of buttons) {
    btn.addEventListener('click', async () => {
      const minutes = Number(btn.dataset.minutes);
      if (![1, 5, 10, 15].includes(minutes)) return;

      for (const b of buttons) b.disabled = true;
      if (statusEl) statusEl.textContent = `Permitiendo por ${minutes} minuto${minutes === 1 ? '' : 's'}...`;

      try {
        const resp = await chrome.runtime.sendMessage({
          type: 'SNOOZE_DOMAIN',
          domain,
          minutes
        });

        if (!resp || !resp.ok) {
          if (statusEl) statusEl.textContent = 'No se pudo activar el acceso temporal. Inténtalo de nuevo.';
          for (const b of buttons) b.disabled = false;
          return;
        }

        if (statusEl) statusEl.textContent = `Acceso temporal activado. Redirigiendo...`;
        // Session allow-rule is installed — safe to navigate
        setTimeout(() => { window.location.href = 'https://' + domain + '/'; }, 200);
      } catch {
        if (statusEl) statusEl.textContent = 'No se pudo activar el acceso temporal. Inténtalo de nuevo.';
        for (const b of buttons) b.disabled = false;
      }
    });
  }
}

function showUnblockHint(settings, domain) {
  const hintEl = document.getElementById('unblockHint');
  const textEl = document.getElementById('unblockHintText');
  const settingsBtn = document.getElementById('openSettingsBtn');
  if (!hintEl || !textEl) return;

  const domainMatches = (listed) =>
    domain === listed || domain.endsWith('.' + listed);

  const inCustom = settings.customBlocklist.some(domainMatches);

  let blockedCategoryId = null;
  for (const [catId, enabled] of Object.entries(settings.categoryToggles)) {
    if (!enabled || !PRESETS[catId]) continue;
    if (PRESETS[catId].some(domainMatches)) {
      blockedCategoryId = catId;
      break;
    }
  }

  let text;
  if (inCustom && blockedCategoryId) {
    const catLabel = CATEGORY_META[blockedCategoryId].label;
    text = `Para desbloquear este sitio, ve a Configuración y elimina "${domain}" de tu lista personalizada o desactiva la categoría "${catLabel}".`;
  } else if (inCustom) {
    text = `Para desbloquear este sitio, ve a Configuración y elimina "${domain}" de tu lista personalizada.`;
  } else if (blockedCategoryId) {
    const catLabel = CATEGORY_META[blockedCategoryId].label;
    text = `Para desbloquear este sitio, ve a Configuración y desactiva la categoría "${catLabel}".`;
  } else {
    return;
  }

  textEl.textContent = text;
  hintEl.style.display = 'block';

  if (settingsBtn) {
    settingsBtn.addEventListener('click', () => {
      chrome.runtime.openOptionsPage();
    });
  }
}

function startCountdown(endTime) {
  const timerEl = document.getElementById('countdown');

  function update() {
    const now = new Date();
    const diff = endTime.getTime() - now.getTime();

    if (diff <= 0) {
      timerEl.textContent = '00:00:00';
      // Reload to check if blocking is now off
      setTimeout(() => window.location.reload(), 1000);
      return;
    }

    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    timerEl.textContent =
      String(hours).padStart(2, '0') + ':' +
      String(minutes).padStart(2, '0') + ':' +
      String(seconds).padStart(2, '0');
  }

  update();
  setInterval(update, 1000);
}

init();
