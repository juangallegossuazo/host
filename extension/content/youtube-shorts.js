// BlockSite — YouTube Shorts blocker (MV3 content script)
// Goals:
// - Hide Shorts UI across youtube.com SPA
// - Redirect away from /shorts/* pages
// - Minimal performance impact (throttled MutationObserver + idempotent processing)

const SETTINGS_KEY = 'blockYouTubeShorts';

const HIDDEN_ATTR = 'data-bs-hidden-shorts';
const PREV_DISPLAY_ATTR = 'data-bs-prev-display';
const TRACK_MSG_TYPE = 'YT_SHORTS_REMOVED';

// YouTube is an SPA; we hook both DOM mutations and history navigation.
let enabled = true;
let observer = null;
let scheduled = false;
let pendingRoots = new Set();

// Tracking (batched)
let removedSinceLastSend = 0;
let sendTimer = null;

// Containers that are safe to hide (YouTube Web Components + common wrappers).
// We intentionally do NOT rely on class names.
const HIDE_CONTAINER_SELECTORS = [
  // Feed / homepage
  'ytd-rich-item-renderer',
  'ytd-rich-section-renderer',
  'ytd-rich-shelf-renderer',
  'ytd-shelf-renderer',
  // Search results
  'ytd-video-renderer',
  'ytd-item-section-renderer',
  // Watch / recommendations / grids
  'ytd-grid-video-renderer',
  'ytd-compact-video-renderer',
  // Navigation
  'ytd-guide-entry-renderer',
  'ytd-mini-guide-entry-renderer',
  // Shorts-specific renderers (often present when Shorts are injected as shelves)
  'ytd-reel-shelf-renderer',
  'ytd-reel-item-renderer'
].join(',');

const SHORTS_SECTION_SELECTORS = [
  'ytd-reel-shelf-renderer',
  'ytd-rich-shelf-renderer',
  'ytd-shelf-renderer',
  'ytd-rich-section-renderer',
  'ytd-item-section-renderer'
].join(',');

function isShortsPath(pathname) {
  return typeof pathname === 'string' && pathname.startsWith('/shorts');
}

function redirectToYouTubeHome() {
  // Use replace() to avoid polluting history and to reduce chances of redirect loops.
  try {
    window.location.replace('https://www.youtube.com/');
  } catch {
    // Fallback
    window.location.href = 'https://www.youtube.com/';
  }
}

function normalizeHref(href) {
  if (!href) return null;
  try {
    return new URL(href, window.location.href).pathname;
  } catch {
    return null;
  }
}

function isShortsLink(el) {
  if (!el || el.nodeType !== Node.ELEMENT_NODE) return false;
  if (el.tagName !== 'A') return false;
  const href = el.getAttribute('href') || '';
  if (!href) return false;
  // Fast check first
  if (href.includes('/shorts/')) return true;
  const pathname = normalizeHref(href);
  return !!pathname && pathname.startsWith('/shorts/');
}

function shouldTreatAsShortsByLabel(el) {
  // Fallback signal: aria-label/title/text containing "Shorts".
  // We keep this conservative: only act if the element is a link-like control.
  if (!el || el.nodeType !== Node.ELEMENT_NODE) return false;
  const label = (el.getAttribute('aria-label') || el.getAttribute('title') || '').trim();
  if (!label) return false;
  if (label.toLowerCase() !== 'shorts') return false;

  if (el.tagName === 'A') return true;
  const link = el.closest('a[href]');
  return !!link && isShortsLink(link);
}

function hideElement(el) {
  if (!el || el.nodeType !== Node.ELEMENT_NODE) return false;
  if (el.hasAttribute(HIDDEN_ATTR)) return false;

  const prev = el.style.display;
  if (prev !== undefined) el.setAttribute(PREV_DISPLAY_ATTR, prev);
  el.setAttribute(HIDDEN_ATTR, '1');
  el.style.display = 'none';
  return true;
}

function unhideAll() {
  const hidden = document.querySelectorAll(`[${HIDDEN_ATTR}="1"]`);
  for (const el of hidden) {
    const prev = el.getAttribute(PREV_DISPLAY_ATTR);
    el.removeAttribute(HIDDEN_ATTR);
    el.removeAttribute(PREV_DISPLAY_ATTR);
    if (prev !== null) {
      el.style.display = prev;
    } else {
      el.style.removeProperty('display');
    }
  }
}

function findHideContainerForLink(linkEl) {
  // Hide the closest safe container; if none exists, hide the link itself.
  const container = linkEl.closest(HIDE_CONTAINER_SELECTORS);
  return container || linkEl;
}

function findSectionContainerForShortsLink(linkEl) {
  // Prefer hiding an entire shelf/section when a Shorts link is inside it.
  // This removes the "Shorts" header and the whitespace it occupies.
  return linkEl.closest(SHORTS_SECTION_SELECTORS);
}

function processRoot(root) {
  if (!enabled) return;
  if (!root || root.nodeType !== Node.ELEMENT_NODE) return;

  // Find explicit Shorts links.
  const links = root.querySelectorAll('a[href*="/shorts/"]');
  for (const link of links) {
    const section = findSectionContainerForShortsLink(link);
    if (section) {
      if (hideElement(section)) {
        removedSinceLastSend++;
        continue;
      }
    }
    const container = findHideContainerForLink(link);
    if (hideElement(container)) removedSinceLastSend++;
  }

  // Conservative fallback for elements labeled "Shorts" (sidebar buttons sometimes).
  const labeled = root.querySelectorAll('[aria-label="Shorts"],[title="Shorts"]');
  for (const el of labeled) {
    if (!shouldTreatAsShortsByLabel(el)) continue;
    const link = el.tagName === 'A' ? el : el.closest('a[href]');
    if (!link) continue;
    const section = findSectionContainerForShortsLink(link);
    if (section) {
      if (hideElement(section)) {
        removedSinceLastSend++;
        continue;
      }
    }
    const container = findHideContainerForLink(link);
    if (hideElement(container)) removedSinceLastSend++;
  }
}

function scheduleProcessing(root) {
  if (!enabled) return;
  if (root && root.nodeType === Node.ELEMENT_NODE) pendingRoots.add(root);
  if (scheduled) return;
  scheduled = true;
  // Use rAF to batch multiple mutations into a single pass.
  requestAnimationFrame(() => {
    scheduled = false;
    const roots = pendingRoots;
    pendingRoots = new Set();

    for (const r of roots) processRoot(r);
    flushTracking();
  });
}

function flushTracking() {
  if (!enabled) return;
  if (removedSinceLastSend <= 0) return;
  if (sendTimer) return;

  // Batch sends to avoid noisy messaging on infinite scroll.
  sendTimer = setTimeout(() => {
    sendTimer = null;
    const count = removedSinceLastSend;
    removedSinceLastSend = 0;
    try {
      chrome.runtime.sendMessage({ type: TRACK_MSG_TYPE, count });
    } catch {
      // If messaging fails (rare), we simply drop this batch.
    }
  }, 2000);
}

function handleRouteChange() {
  if (!enabled) return;
  if (isShortsPath(window.location.pathname)) {
    redirectToYouTubeHome();
    return;
  }
  scheduleProcessing(document.documentElement);
}

function installHistoryHooks() {
  const origPush = history.pushState;
  const origReplace = history.replaceState;

  history.pushState = function (...args) {
    const ret = origPush.apply(this, args);
    handleRouteChange();
    return ret;
  };

  history.replaceState = function (...args) {
    const ret = origReplace.apply(this, args);
    handleRouteChange();
    return ret;
  };

  window.addEventListener('popstate', handleRouteChange, { passive: true });
}

function startObserver() {
  if (observer) observer.disconnect();

  const target = document.documentElement;
  observer = new MutationObserver((mutations) => {
    if (!enabled) return;
    for (const m of mutations) {
      for (const node of m.addedNodes) {
        if (node && node.nodeType === Node.ELEMENT_NODE) scheduleProcessing(node);
      }
    }
  });

  observer.observe(target, { childList: true, subtree: true });
}

async function loadInitialEnabled() {
  try {
    const data = await chrome.storage.sync.get(SETTINGS_KEY);
    enabled = data[SETTINGS_KEY] !== undefined ? !!data[SETTINGS_KEY] : true;
  } catch {
    enabled = true;
  }
}

function onEnabledChanged(nextEnabled) {
  enabled = !!nextEnabled;

  if (!enabled) {
    if (observer) observer.disconnect();
    observer = null;
    if (sendTimer) {
      clearTimeout(sendTimer);
      sendTimer = null;
    }
    removedSinceLastSend = 0;
    unhideAll();
    return;
  }

  // Re-enable
  handleRouteChange();
  startObserver();
}

function watchSettingChanges() {
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'sync') return;
    if (!changes[SETTINGS_KEY]) return;
    onEnabledChanged(changes[SETTINGS_KEY].newValue);
  });
}

(async function main() {
  await loadInitialEnabled();
  installHistoryHooks();
  watchSettingChanges();

  if (!enabled) return;
  handleRouteChange();
  startObserver();
})();

