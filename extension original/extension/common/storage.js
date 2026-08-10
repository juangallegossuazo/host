import { DEFAULTS } from './constants.js';

export async function getSettings() {
  const keys = Object.keys(DEFAULTS);
  const data = await chrome.storage.sync.get(keys);
  const result = {};
  for (const key of keys) {
    if (key === 'categoryToggles') {
      result[key] = { ...DEFAULTS[key], ...(data[key] || {}) };
    } else if (key === 'schedule') {
      result[key] = { ...DEFAULTS[key], ...(data[key] || {}) };
    } else {
      result[key] = data[key] !== undefined ? data[key] : DEFAULTS[key];
    }
  }
  return result;
}

export async function saveSettings(partial) {
  await chrome.storage.sync.set(partial);
}

export const GITHUB_HOSTS_URL = 'https://raw.githubusercontent.com/juangallegossuazo/host/main/hosts';
export const GITHUB_RULES_URL = 'https://raw.githubusercontent.com/juangallegossuazo/host/main/rules.json';

export async function syncWithGitHubRepo() {
  try {
    let resp = await fetch(GITHUB_HOSTS_URL).catch(() => null);
    if (!resp || !resp.ok) {
      resp = await fetch(GITHUB_RULES_URL).catch(() => null);
    }
    if (!resp || !resp.ok) return { ok: false, error: 'Sin respuesta del repositorio GitHub' };

    const text = await resp.text();
    let newDomains = [];

    // Try parsing as JSON first
    try {
      const data = JSON.parse(text);
      if (Array.isArray(data)) {
        newDomains = data.filter(d => typeof d === 'string');
      } else if (data && typeof data === 'object') {
        const list = data.masterBlocklist || data.rules || data.blockedDomains;
        if (Array.isArray(list)) newDomains = list.filter(d => typeof d === 'string');
      }
    } catch (jsonErr) {
      // Parse standard hosts format lines (e.g. 0.0.0.0 example.com or 127.0.0.1 example.com)
      const lines = text.split('\n');
      for (let line of lines) {
        line = line.trim();
        if (!line || line.startsWith('#')) continue;
        line = line.replace(/^(0\.0\.0\.0|127\.0\.0\.1|\:\:1)\s+/, '').trim();
        line = line.split('#')[0].trim();
        if (line && line.includes('.')) {
          newDomains.push(line.toLowerCase());
        }
      }
    }

    if (newDomains.length > 0) {
      const currentSettings = await getSettings();
      const cleaned = newDomains.map(d => d.replace(/^https?:\/\//, '').replace(/^www\./, '')).filter(Boolean);
      const merged = Array.from(new Set([...currentSettings.customBlocklist, ...cleaned]));
      if (merged.length !== currentSettings.customBlocklist.length) {
        await saveSettings({ customBlocklist: merged });
        return { ok: true, synced: true, count: merged.length };
      }
    }
    return { ok: true, synced: false };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

export async function syncWithDjangoApi() {
  return await syncWithGitHubRepo();
}

export async function getStats() {
  const data = await chrome.storage.local.get('stats');
  return data.stats || {};
}

export async function incrementStat() {
  const today = new Date().toISOString().slice(0, 10);
  const stats = await getStats();
  stats[today] = (stats[today] || 0) + 1;
  await chrome.storage.local.set({ stats });
}

export async function pruneOldStats(days = 30) {
  const stats = await getStats();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString().slice(0, 10);
  let changed = false;
  for (const key of Object.keys(stats)) {
    if (key < cutoffStr) {
      delete stats[key];
      changed = true;
    }
  }
  if (changed) {
    await chrome.storage.local.set({ stats });
  }
  return stats;
}

export function getTodayCount(stats) {
  const today = new Date().toISOString().slice(0, 10);
  return stats[today] || 0;
}

export function getWeekCount(stats) {
  let total = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    total += stats[key] || 0;
  }
  return total;
}

/* ── Per-domain block history ─────────────────────────────────────── */

const DOMAIN_STATS_LIMIT = 300;

export async function getDomainStats() {
  const data = await chrome.storage.local.get('domainStats');
  return data.domainStats || {};
}

export async function incrementDomainStat(domain) {
  const stats = await getDomainStats();
  const today = new Date().toISOString().slice(0, 10);
  const entry = stats[domain] || { count: 0, lastBlocked: today };
  entry.count += 1;
  entry.lastBlocked = today;
  stats[domain] = entry;

  const keys = Object.keys(stats);
  if (keys.length > DOMAIN_STATS_LIMIT) {
    keys.sort((a, b) => (stats[a].lastBlocked < stats[b].lastBlocked ? -1 : 1));
    const overflow = keys.slice(0, keys.length - DOMAIN_STATS_LIMIT);
    for (const key of overflow) delete stats[key];
  }
  await chrome.storage.local.set({ domainStats: stats });
  return stats;
}

export async function clearDomainStats() {
  await chrome.storage.local.remove('domainStats');
}

export function isWithinSchedule(schedule) {
  const now = new Date();
  const dayConfig = schedule[now.getDay().toString()];
  if (!dayConfig || !dayConfig.enabled) return false;
  const [startH, startM] = dayConfig.startTime.split(':').map(Number);
  const [endH, endM] = dayConfig.endTime.split(':').map(Number);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;
  return nowMinutes >= startMinutes && nowMinutes < endMinutes;
}

export function hasAnyScheduleEnabled(schedule) {
  return Object.values(schedule).some(d => d.enabled);
}

export function getNextTransitionTime(schedule) {
  const now = new Date();
  const currentlyActive = isWithinSchedule(schedule);

  for (let offset = 0; offset < 8; offset++) {
    const checkDate = new Date(now);
    checkDate.setDate(checkDate.getDate() + offset);
    const dayConfig = schedule[checkDate.getDay().toString()];

    if (!dayConfig || !dayConfig.enabled) continue;

    const [startH, startM] = dayConfig.startTime.split(':').map(Number);
    const [endH, endM] = dayConfig.endTime.split(':').map(Number);

    const startTime = new Date(checkDate);
    startTime.setHours(startH, startM, 0, 0);

    const endTime = new Date(checkDate);
    endTime.setHours(endH, endM, 0, 0);

    if (offset === 0) {
      if (currentlyActive && endTime > now) {
        return endTime;
      }
      if (!currentlyActive && startTime > now) {
        return startTime;
      }
    } else {
      return startTime;
    }
  }
  return null;
}

export function extractHostname(url) {
  try {
    const hostname = new URL(url).hostname;
    return hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}
