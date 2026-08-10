import { DEFAULTS, CATEGORY_META, CUSTOM_RULE_ID_START, ALARM_NAME } from '../common/constants.js';
import { getSettings, saveSettings, syncWithDjangoApi, incrementStat, incrementDomainStat, pruneOldStats, isWithinSchedule, hasAnyScheduleEnabled, getNextTransitionTime, extractHostname } from '../common/storage.js';
import { PRESETS } from '../data/presets.js';

let rebuilding = false;
let rebuildQueued = false;
let activeBlockedDomains = new Set();

const SNOOZE_KEY = 'snoozes';
const SNOOZE_ALARM_PREFIX = 'snooze:';
const SNOOZE_PRIORITY = 10;
const SNOOZE_RULE_ID_BASE = 900000;
const SNOOZE_RULE_ID_RANGE = 50000;
const API_SYNC_ALARM = 'apiSyncAlarm';

async function updateUninstallProtection() {
  const settings = await getSettings();
  if (settings.uninstallProtection) {
    const targetUrl = (settings.apiUrl || 'http://127.0.0.1:8000/api/v1/sync/').replace('/api/v1/sync/', '/');
    try {
      chrome.runtime.setUninstallURL(targetUrl);
    } catch (e) {
      console.error('[BlockSite] Failed to set uninstall URL:', e);
    }
  } else {
    try {
      chrome.runtime.setUninstallURL('');
    } catch (e) {}
  }
}

// --- Initialization ---

chrome.runtime.onInstalled.addListener(async (details) => {
  const data = await chrome.storage.sync.get(Object.keys(DEFAULTS));
  const toSet = {};
  for (const [key, defaultVal] of Object.entries(DEFAULTS)) {
    if (data[key] === undefined) {
      toSet[key] = defaultVal;
    }
  }
  if (Object.keys(toSet).length > 0) {
    await chrome.storage.sync.set(toSet);
  }
  await pruneOldStats();
  await rebuildRules();
  await setNextScheduleAlarm();
  await restoreSnoozes();

  // Create periodic API Sync alarm (every 5 mins)
  chrome.alarms.create(API_SYNC_ALARM, { periodInMinutes: 5 });
  await updateUninstallProtection();
  await syncWithDjangoApi();

  if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    chrome.runtime.openOptionsPage();
  }
});

chrome.runtime.onStartup.addListener(async () => {
  await pruneOldStats();
  await rebuildRules();
  await setNextScheduleAlarm();
  await restoreSnoozes();
  chrome.alarms.create(API_SYNC_ALARM, { periodInMinutes: 5 });
  await updateUninstallProtection();
  await syncWithDjangoApi();
});

// --- Icon state ---

async function loadImageData(filename, size) {
  const url = chrome.runtime.getURL(filename);
  const resp = await fetch(url);
  const blob = await resp.blob();
  const bitmap = await createImageBitmap(blob);
  const canvas = new OffscreenCanvas(size, size);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(bitmap, 0, 0, size, size);
  return ctx.getImageData(0, 0, size, size);
}

async function updateIconState(isBlocking) {
  const suffix = isBlocking ? '_active' : '';
  try {
    const [d16, d32, d48, d128] = await Promise.all([
      loadImageData(`icons/icon16${suffix}.png`, 16),
      loadImageData(`icons/icon32${suffix}.png`, 32),
      loadImageData(`icons/icon48${suffix}.png`, 48),
      loadImageData(`icons/icon128${suffix}.png`, 128),
    ]);
    await chrome.action.setIcon({ imageData: { 16: d16, 32: d32, 48: d48, 128: d128 } });
  } catch (e) {
    console.error('[BlockSite] updateIconState failed:', e);
  }
}

// --- Storage change listener ---

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'sync') return;
  scheduleRebuild();
});

let rebuildTimer = null;
function scheduleRebuild() {
  if (rebuildTimer) clearTimeout(rebuildTimer);
  rebuildTimer = setTimeout(async () => {
    rebuildTimer = null;
    await rebuildRules();
    await setNextScheduleAlarm();
  }, 150);
}

// --- Alarm handler ---

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === API_SYNC_ALARM) {
    const res = await syncWithDjangoApi();
    if (res && res.synced) {
      await rebuildRules();
    }
    await updateUninstallProtection();
    return;
  }
  if (alarm.name === ALARM_NAME) {
    await rebuildRules();
    await setNextScheduleAlarm();
    return;
  }
  if (alarm.name && alarm.name.startsWith(SNOOZE_ALARM_PREFIX)) {
    const domain = alarm.name.slice(SNOOZE_ALARM_PREFIX.length);
    await clearSnooze(domain);
  }
});

// --- Message listener ---

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'TRIGGER_API_SYNC') {
    (async () => {
      const res = await syncWithDjangoApi(message.apiUrl);
      await updateUninstallProtection();
      sendResponse(res);
    })();
    return true;
  }
  if (message.type === 'UPDATE_UNINSTALL_PROTECTION') {
    (async () => {
      await updateUninstallProtection();
      sendResponse({ ok: true });
    })();
    return true;
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || typeof message !== 'object') return;

  if (message.type === 'YT_SHORTS_REMOVED') {
    (async () => {
      try {
        const delta = Number(message.count);
        if (!Number.isFinite(delta) || delta <= 0) {
          sendResponse({ ok: false, error: 'invalid_count' });
          return;
        }
        const key = 'ytShortsRemovedTotal';
        const data = await chrome.storage.local.get(key);
        const next = (Number(data[key]) || 0) + delta;
        await chrome.storage.local.set({ [key]: next });
        sendResponse({ ok: true, total: next });
      } catch (e) {
        console.error('[BlockSite] YT_SHORTS_REMOVED failed:', e);
        sendResponse({ ok: false, error: 'internal_error' });
      }
    })();
    return true;
  }

  if (message.type === 'REBUILD_RULES') {
    (async () => {
      try {
        await rebuildRules();
        sendResponse({ ok: true });
      } catch (e) {
        console.error('[BlockSite] REBUILD_RULES failed:', e);
        sendResponse({ ok: false });
      }
    })();
    return true;
  }

  if (message.type === 'SNOOZE_DOMAIN') {
    (async () => {
      try {
        const domain = (message.domain || '').toString().toLowerCase().trim();
        const minutes = Number(message.minutes);
        if (!domain || !Number.isFinite(minutes) || ![1, 5, 10, 15].includes(minutes)) {
          sendResponse({ ok: false, error: 'invalid_args' });
          return;
        }
        const expiresAt = Date.now() + minutes * 60_000;
        await setSnooze(domain, expiresAt);
        sendResponse({ ok: true, domain, expiresAt });
      } catch (e) {
        console.error('[BlockSite] Snooze failed:', e);
        sendResponse({ ok: false, error: 'internal_error' });
      }
    })();
    return true;
  }
});

// --- Snooze helpers ---

function snoozeRuleId(domain) {
  let h = 5381;
  for (let i = 0; i < domain.length; i++) h = ((h << 5) + h) ^ domain.charCodeAt(i);
  return SNOOZE_RULE_ID_BASE + (Math.abs(h) % SNOOZE_RULE_ID_RANGE);
}

async function getSnoozes() {
  const data = await chrome.storage.local.get(SNOOZE_KEY);
  return data[SNOOZE_KEY] || {};
}

async function setSnooze(domain, expiresAt) {
  const snoozes = await getSnoozes();
  snoozes[domain] = expiresAt;
  await chrome.storage.local.set({ [SNOOZE_KEY]: snoozes });
  await applySnoozeRule(domain);
  chrome.alarms.create(SNOOZE_ALARM_PREFIX + domain, { when: expiresAt });
}

async function clearSnooze(domain) {
  const snoozes = await getSnoozes();
  delete snoozes[domain];
  await chrome.storage.local.set({ [SNOOZE_KEY]: snoozes });
  await removeSnoozeRule(domain);
  await chrome.alarms.clear(SNOOZE_ALARM_PREFIX + domain);
  // Reload any open tabs on that domain so blocking resumes
  try {
    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
      if (!tab.url) continue;
      const h = extractHostname(tab.url);
      if (h && (h === domain || h.endsWith('.' + domain))) {
        chrome.tabs.reload(tab.id).catch(() => {});
      }
    }
  } catch { /* ignore */ }
}

async function applySnoozeRule(domain) {
  const id = snoozeRuleId(domain);
  await chrome.declarativeNetRequest.updateSessionRules({
    removeRuleIds: [id],
    addRules: [{
      id,
      priority: SNOOZE_PRIORITY,
      action: { type: 'allow' },
      condition: { urlFilter: '||' + domain + '/', resourceTypes: ['main_frame'] }
    }]
  });
}

async function removeSnoozeRule(domain) {
  await chrome.declarativeNetRequest.updateSessionRules({
    removeRuleIds: [snoozeRuleId(domain)],
    addRules: []
  });
}

async function restoreSnoozes() {
  const snoozes = await getSnoozes();
  const now = Date.now();
  let changed = false;
  for (const [domain, expiresAt] of Object.entries(snoozes)) {
    if (!expiresAt || expiresAt <= now) {
      delete snoozes[domain];
      changed = true;
      await removeSnoozeRule(domain);
      await chrome.alarms.clear(SNOOZE_ALARM_PREFIX + domain);
    } else {
      await applySnoozeRule(domain);
      chrome.alarms.create(SNOOZE_ALARM_PREFIX + domain, { when: expiresAt });
    }
  }
  if (changed) await chrome.storage.local.set({ [SNOOZE_KEY]: snoozes });
}

// --- Web navigation listener ---
// Used for:
// 1. Statistics counting (redirect/closeTab modes)
// 2. closeTab mode — close the tab after block rule fires
// 3. Rebuild domain cache if SW was restarted

chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  if (details.frameId !== 0) return;

  const hostname = extractHostname(details.url);
  if (!hostname) return;

  // Skip chrome-extension:// URLs (our own blocked page)
  if (details.url.startsWith('chrome-extension://')) return;

  // Service worker may have been killed and restarted — rebuild in-memory cache
  if (activeBlockedDomains.size === 0) {
    await rebuildDomainCache();
  }

  if (!isDomainBlocked(hostname)) return;

  const settings = await getSettings();

  // Count the block only for modes where blocked.html doesn't load
  // (blockPage mode counts via blocked.js to avoid double-counting)
  if (settings.blockAction === 'closeTab' || settings.blockAction === 'redirect') {
    await incrementStat();
    await incrementDomainStat(hostname);
  }

  // For closeTab mode, close the tab (declarativeNetRequest block rule is the fallback)
  if (settings.blockAction === 'closeTab') {
    try {
      await chrome.tabs.remove(details.tabId);
    } catch (e) {
      // Tab may already be gone
    }
  }
});

// Rebuild only the in-memory domain cache (not the declarativeNetRequest rules).
async function rebuildDomainCache() {
  const settings = await getSettings();
  const withinSchedule = settings.scheduleMode === 'scheduled'
    ? isWithinSchedule(settings.schedule) : true;
  if (!settings.enabled || !withinSchedule) {
    activeBlockedDomains = new Set();
    return;
  }
  const domains = new Set();
  for (const domain of settings.customBlocklist) domains.add(domain);
  for (const [catId, enabled] of Object.entries(settings.categoryToggles)) {
    if (!enabled || !PRESETS[catId]) continue;
    const unblocked = new Set(settings.categoryUnblocked[catId] || []);
    for (const domain of PRESETS[catId]) {
      if (!unblocked.has(domain)) domains.add(domain);
    }
  }
  activeBlockedDomains = domains;
}

function isDomainBlocked(hostname) {
  if (activeBlockedDomains.has(hostname)) return true;
  const parts = hostname.split('.');
  for (let i = 1; i < parts.length - 1; i++) {
    const parent = parts.slice(i).join('.');
    if (activeBlockedDomains.has(parent)) return true;
  }
  return false;
}

// --- onCommitted fallback ---
// DNR redirect rules fire before network requests, but may be missed in edge cases
// (e.g. speculative navigation, cache, timing race when rules were just updated).
// If a blocked site actually commits (meaning DNR didn't redirect it), we catch
// it here and redirect to the block page ourselves.
// Safe to combine with DNR: if DNR worked, onCommitted fires for blocked.html
// (chrome-extension URL) and we exit immediately — no double-redirect.

chrome.webNavigation.onCommitted.addListener(async (details) => {
  if (details.frameId !== 0) return;
  if (details.url.startsWith('chrome-extension://') || details.url.startsWith('chrome://')) return;

  const hostname = extractHostname(details.url);
  if (!hostname) return;

  if (activeBlockedDomains.size === 0) {
    await rebuildDomainCache();
  }

  if (!isDomainBlocked(hostname)) return;

  // Don't override an active snooze allow
  const snoozes = await getSnoozes();
  const snoozeExpiry = snoozes[hostname];
  if (snoozeExpiry && snoozeExpiry > Date.now()) return;

  // This site committed — DNR missed it. Redirect now as a fallback.
  const settings = await getSettings();

  if (settings.blockAction === 'blockPage') {
    const blockedUrl = chrome.runtime.getURL(
      'blocked/blocked.html?domain=' + encodeURIComponent(hostname)
    );
    try {
      await chrome.tabs.update(details.tabId, { url: blockedUrl });
    } catch { }
  } else if (settings.blockAction === 'redirect') {
    try {
      await chrome.tabs.update(details.tabId, { url: settings.redirectUrl });
    } catch { }
  } else if (settings.blockAction === 'closeTab') {
    try {
      await chrome.tabs.remove(details.tabId);
    } catch { }
  }
});

// --- Rule building ---
// Uses declarativeNetRequest redirect rules for blockPage/redirect modes (synchronous, reliable).
// Uses block rules for closeTab mode (SW handles tab closing via webNavigation).

async function rebuildRules() {
  if (rebuilding) {
    rebuildQueued = true;
    return;
  }
  rebuilding = true;

  try {
    const settings = await getSettings();
    const withinSchedule = settings.scheduleMode === 'scheduled'
      ? isWithinSchedule(settings.schedule) : true;
    const shouldBlock = settings.enabled && withinSchedule;

    await updateIconState(shouldBlock);

    const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
    const removeRuleIds = existingRules.map(r => r.id);

    if (!shouldBlock) {
      activeBlockedDomains = new Set();
      if (removeRuleIds.length > 0) {
        await chrome.declarativeNetRequest.updateDynamicRules({
          removeRuleIds,
          addRules: []
        });
      }
      return;
    }

    // Collect all domains to block
    const domains = new Set();
    for (const domain of settings.customBlocklist) {
      domains.add(domain);
    }
    for (const [catId, enabled] of Object.entries(settings.categoryToggles)) {
      if (!enabled || !PRESETS[catId]) continue;
      const unblocked = new Set(settings.categoryUnblocked[catId] || []);
      for (const domain of PRESETS[catId]) {
        if (!unblocked.has(domain)) domains.add(domain);
      }
    }

    activeBlockedDomains = domains;

    // Generate rules
    const addRules = [];
    let ruleId = CUSTOM_RULE_ID_START;

    for (const domain of settings.customBlocklist) {
      addRules.push(createRule(ruleId++, domain, settings));
      if (ruleId > 999) break;
    }

    for (const [catId, enabled] of Object.entries(settings.categoryToggles)) {
      if (!enabled || !PRESETS[catId]) continue;
      const startId = CATEGORY_META[catId].start;
      const unblocked = new Set(settings.categoryUnblocked[catId] || []);
      let idx = 0;
      for (const domain of PRESETS[catId]) {
        if (unblocked.has(domain)) continue;
        if (settings.customBlocklist.includes(domain)) continue;
        addRules.push(createRule(startId + idx, domain, settings));
        idx++;
      }
    }

    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds,
      addRules
    });
  } finally {
    rebuilding = false;
    if (rebuildQueued) {
      rebuildQueued = false;
      await rebuildRules();
    }
  }
}

function createRule(id, domain, settings) {
  if (settings.blockAction === 'blockPage') {
    return {
      id,
      priority: 1,
      action: {
        type: 'redirect',
        redirect: {
          extensionPath: '/blocked/blocked.html?domain=' + encodeURIComponent(domain)
        }
      },
      condition: {
        urlFilter: '||' + domain + '/',
        resourceTypes: ['main_frame']
      }
    };
  }

  if (settings.blockAction === 'redirect') {
    return {
      id,
      priority: 1,
      action: {
        type: 'redirect',
        redirect: { url: settings.redirectUrl }
      },
      condition: {
        urlFilter: '||' + domain + '/',
        resourceTypes: ['main_frame']
      }
    };
  }

  // closeTab — use block action; SW closes the tab via webNavigation listener
  return {
    id,
    priority: 1,
    action: { type: 'block' },
    condition: {
      urlFilter: '||' + domain + '/',
      resourceTypes: ['main_frame']
    }
  };
}

// --- Schedule alarm ---

async function setNextScheduleAlarm() {
  await chrome.alarms.clear(ALARM_NAME);

  const settings = await getSettings();
  if (settings.scheduleMode !== 'scheduled' || !hasAnyScheduleEnabled(settings.schedule)) return;

  const nextTransition = getNextTransitionTime(settings.schedule);
  if (nextTransition) {
    chrome.alarms.create(ALARM_NAME, { when: nextTransition.getTime() });
  }
}
