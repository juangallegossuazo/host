// Background script para Host Blocker
// Maneja el bloqueo de sitios web en segundo plano

// Lista de dominios bloqueados por categoría
const blockedDomains = {
  adult: [
    "pornhub.com", "xvideos.com", "xhamster.com", "redtube.com", "youporn.com",
    "spankbang.com", "beeg.com", "tube8.com", "porntube.com", "thumbzilla.com",
    "eporner.com", "youjizz.com", "keezmovies.com", "tube-v.com", "xnxx.com",
    "porn.com", "xxx.com", "adultfriendfinder.com", "fling.com",
    "chaturbate.com", "myfreecams.com", "livejasmin.com", "streamate.com",
    "cam4.com", "bongacams.com", "stripchat.com", "camsoda.com", "flirt4free.com",
    "imlive.com", "roulettechat.com", "redgifs.com", "slushe.com", "lewdzone.com",
    "f95zone.to", "nsfw247.com", "pornpen.ai", "onlyfans.com", "fansly.com",
    "tinder.com", "bumble.com", "okcupid.com", "match.com", "pof.com",
    "zoosk.com", "happn.com", "hinge.co", "grindr.com", "scruff.com"
  ],
  games: [
    "friv.com", "crazygames.com", "minijuegos.com", "roblox.com", "epicgames.com",
    "store.steampowered.com", "minecraft.net", "fortnite.com", "007arcadegames.com",
    "10000games.co.uk", "10000juegos.com", "10001games.fr", "1000funnygames.com",
    "1000juegosfriv.com", "1000puzzlegames.com", "1000webgames.com",
    "1001flashgames.com", "1001games.com", "1001games.fr", "1001games.nl",
    "1001games.tw", "1001juegos.com", "1001onlinegames.com", "101games.it",
    "1066game.com", "123-games.net", "123games.dk", "123juegos.com",
    "123onlinegame.de", "14juegos.com", "1888freeonlinegames.com",
    "flashgames.com", "html5games.com", "freegames.com", "onlinewgames.com",
    "gamesgames.com", "gamestop.com", "kongregate.com", "newgrounds.com",
    "miniclip.com", "poki.com", "coolmathgames.com", "mathplayground.com",
    "silvergames.com", "y8.com", "twoplayergames.org", "gameflare.com",
    "fightinggames.com", "actiongames.com", "shootergames.com", "racinggames.com",
    "adventuregames.com", "garena.com", "supercell.com", "activision.com",
    "ea.com", "ubisoft.com", "riotgames.com", "playvalorant.com",
    "minijuegosgratis.com", "juegos10.com", "juegos33.com", "juegos.com",
    "juegos.io", "juegosfriv.com", "juegosjuegos.com", "juegosplay.com",
    "tetris.com", "chess.com", "cardgames.com", "boardgamearena.com",
    "pogo.com", "bgames.com", "sudoku.com", "crossword.com", "wordgames.com"
  ],
  downloads: [
    "softonic.com", "softonic.es", "softonic.com.mx", "softonic.de", "softonic.fr",
    "softonic.it", "softonic.jp", "softonic.com.br",
    "uptodown.com", "es.uptodown.com", "mx.uptodown.com", "uptodown.net",
    "uptodown.de", "uptodown.fr", "uptodown.it", "uptodown.com.br",
    "malavida.com", "es.malavida.com", "malavida.de", "malavida.fr",
    "malavida.it", "malavida.com.br",
    "filehippo.com", "es.filehippo.com", "filehippo.de", "filehippo.fr",
    "download.cnet.com", "cnet.com", "download.com",
    "softpedia.com", "softpedia.ro", "softpedia.de", "softpedia.fr",
    "softpedia.it", "softpedia.com.br",
    "majorgeeks.com", "majorgeeks.de",
    "filehorse.com", "filehorse.de", "filehorse.fr",
    "chip.de", "chip.eu",
    "downloadcs.net", "downloadcrew.com", "soft32.com", "filepuma.com",
    "downloadastro.com", "downloadatoz.com", "downloadr.org", "downloads.com",
    "mp3skull.com", "mp3juices.com", "ytmp3.cc", "y2mate.com",
    "savethevideo.com", "savefrom.net", "clipconverter.cc",
    "onlinevideoconverter.com", "convert2mp3.com",
    "thepiratebay.org", "kickasstorrents.com", "1337x.to", "rarbg.to",
    "nyaa.si", "animebytes.tv", "rutracker.org", "limetorrents.info",
    "torrentgalaxy.to", "eztv.re", "yts.mx", "fitgirl-repacks.site",
    "crackstation.net", "cracksmind.com", "crackingpatching.com",
    "kubadownload.com", "getintopc.com", "oceanofgames.com",
    "pcgamestorrents.com", "repelisplus.com"
  ],
  entertainment: [
    "facebook.com", "instagram.com", "twitter.com", "x.com", "tiktok.com",
    "snapchat.com", "pinterest.com", "reddit.com", "linkedin.com",
    "web.whatsapp.com", "telegram.org", "web.telegram.org", "discord.com",
    "twitch.tv", "youtube.com", "youtube-nocookie.com",
    "netflix.com", "hulu.com", "amazon.com/video", "primevideo.com",
    "disneyplus.com", "hbomax.com", "max.com", "peacocktv.com",
    "paramountplus.com", "appletv.com", "spotify.com", "music.apple.com",
    "open.spotify.com", "soundcloud.com", "pandora.com", "deezer.com", "tidal.com",
    "facebook.com/gaming", "youtube.com/gaming", "afreecatv.com",
    "douyu.com", "huya.com", "bilibili.com",
    "buzzfeed.com", "9gag.com", "imgur.com", "ifunny.co",
    "amazon.com", "ebay.com", "mercadolibre.com", "aliexpress.com",
    "walmart.com", "target.com", "bestbuy.com", "apple.com/store",
    "bet365.com", "draftkings.com", "fanduel.com", "bwin.com",
    "pokerstars.com", "888.com", "williamhill.com", "ladbrokes.com",
    "paddypower.com", "betfair.com", "unibet.com", "betway.com",
    "match.com", "eharmony.com", "zoosk.com", "plentyoffish.com", "ourtime.com",
    "dictionary.com", "thesaurus.com", "weather.com", "accuweather.com",
    "espn.com", "sportscenter.com", "nba.com", "nfl.com", "mlb.com",
    "nhl.com", "fifa.com", "uefa.com", "transfermarkt.com", "sofascore.com",
    "flashscore.com", "google.com", "bing.com", "yahoo.com", "duckduckgo.com",
    "wikipedia.org", "wikia.com"
  ]
};

// Estado de las categorías
let categoryState = {
  adult: true,
  games: true,
  downloads: true,
  entertainment: true
};

// Inicializar estado desde storage
chrome.runtime.onInstalled.addListener(async () => {
  const result = await chrome.storage.local.get('blockedCategories');
  if (result.blockedCategories) {
    categoryState = result.blockedCategories;
  }
  updateBlockingRules();
});

// Escuchar cambios en storage
chrome.storage.onChanged.addListener((changes) => {
  if (changes.blockedCategories) {
    categoryState = changes.blockedCategories.newValue;
    updateBlockingRules();
  }
});

// Actualizar reglas de bloqueo
function updateBlockingRules() {
  const allBlockedDomains = [];
  
  Object.keys(categoryState).forEach(category => {
    if (categoryState[category]) {
      allBlockedDomains.push(...blockedDomains[category]);
    }
  });
  
  // Crear reglas de bloqueo
  const rules = allBlockedDomains.map((domain, index) => ({
    id: index + 1,
    priority: 1,
    action: { type: "block" },
    condition: {
      urlFilter: domain,
      resourceTypes: ["main_frame", "sub_frame", "stylesheet", "script", "image", "font", "object", "xmlhttprequest", "ping", "csp_report", "media", "websocket", "webtransport", "webbundle", "other"]
    }
  }));
  
  // Aplicar reglas
  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: rules.map(rule => rule.id),
    addRules: rules
  });
}

// Verificar si un dominio está bloqueado
function isDomainBlocked(url, category = null) {
  try {
    const hostname = new URL(url).hostname;
    
    const categoriesToCheck = category ? [category] : Object.keys(categoryState);
    
    for (const cat of categoriesToCheck) {
      if (categoryState[cat]) {
        const isBlocked = blockedDomains[cat].some(domain => 
          hostname === domain || hostname.endsWith('.' + domain)
        );
        if (isBlocked) return { blocked: true, category: cat };
      }
    }
    
    return { blocked: false };
  } catch (error) {
    return { blocked: false };
  }
}

// Escuchar mensajes del popup o content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'checkDomain') {
    const result = isDomainBlocked(request.url, request.category);
    sendResponse(result);
  } else if (request.action === 'getBlockedDomains') {
    const category = request.category;
    sendResponse({ domains: blockedDomains[category] || [] });
  } else if (request.action === 'updateRules') {
    updateBlockingRules();
    sendResponse({ success: true });
  }
  return true;
});
