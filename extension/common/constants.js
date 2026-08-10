export const DEFAULTS = {
  enabled: true,
  blockAction: 'blockPage',
  blockYouTubeShorts: true,
  hideYouTubeComments: false,
  hideYouTubeRecommendations: false,
  allowSnoozeOnBlockPage: true,
  redirectUrl: 'https://es.wikipedia.org',
  apiUrl: 'https://raw.githubusercontent.com/juangallegossuazo/host/main/categories',
  uninstallProtection: false,
  pinEnabled: false,
  pinCode: '1234',
  adblockEnabled: true,
  totalAdsBlocked: 128,
  customBlocklist: [],
  whitelist: [],
  categoryToggles: {
    redes_sociales: false,
    video: false,
    musica: false,
    xxx: false,
    juegos: false,
    descargas: false,
    apuestas: false,
    dating: false,
    compras: false,
    entretenimiento: false
  },
  categoryUnblocked: {},
  scheduleMode: 'always',
  schedule: {
    '0': { enabled: false, startTime: '09:00', endTime: '18:00' },
    '1': { enabled: true, startTime: '09:00', endTime: '18:00' },
    '2': { enabled: true, startTime: '09:00', endTime: '18:00' },
    '3': { enabled: true, startTime: '09:00', endTime: '18:00' },
    '4': { enabled: true, startTime: '09:00', endTime: '18:00' },
    '5': { enabled: true, startTime: '09:00', endTime: '18:00' },
    '6': { enabled: false, startTime: '09:00', endTime: '18:00' }
  }
};

export const CATEGORY_META = {
  redes_sociales:  { label: 'Redes Sociales',      icon: '💬', start: 1000, file: 'redes_sociales.txt' },
  video:           { label: 'Video / Streaming',   icon: '📺', start: 2000, file: 'video.txt' },
  musica:          { label: 'Música',              icon: '🎵', start: 3000, file: 'musica.txt' },
  xxx:             { label: 'Contenido Adulto',    icon: '🔞', start: 4000, file: 'xxx.txt' },
  juegos:          { label: 'Juegos',              icon: '🎮', start: 5000, file: 'juegos.txt' },
  descargas:       { label: 'Descargas',           icon: '📥', start: 6000, file: 'descargas.txt' },
  apuestas:        { label: 'Apuestas / Casino',   icon: '🎰', start: 7000, file: 'apuestas.txt' },
  dating:          { label: 'Dating / Citas',      icon: '❤️', start: 8000, file: 'dating.txt' },
  compras:         { label: 'Compras / E-commerce', icon: '🛒', start: 9000, file: 'compras.txt' },
  entretenimiento: { label: 'Entretenimiento',     icon: '😂', start: 10000, file: 'entretenimiento.txt' }
};

export const CATEGORY_ICONS = {
  redes_sociales:  '<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.7"/><path d="M8 12h8M12 8v8" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
  video:           '<rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" stroke-width="1.7"/><path d="M10 9l5 3-5 3V9z" fill="currentColor"/>',
  musica:          '<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.7"/><path d="M9 15V9l7-2v6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>',
  xxx:             '<rect x="5" y="10.5" width="14" height="9" rx="2" stroke="currentColor" stroke-width="1.7"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" stroke="currentColor" stroke-width="1.7"/><circle cx="12" cy="15" r="1.4" fill="currentColor"/>',
  juegos:          '<rect x="2.5" y="8" width="19" height="9" rx="4" stroke="currentColor" stroke-width="1.7"/><path d="M7 11.2v3.6M5.2 13h3.6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><circle cx="16" cy="12.5" r="1.1" fill="currentColor"/><circle cx="18.4" cy="14.7" r="1.1" fill="currentColor"/>',
  descargas:       '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><polyline points="7 10 12 15 17 10" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
  apuestas:        '<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.7"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.7"/><circle cx="12" cy="5" r="1" fill="currentColor"/><circle cx="12" cy="19" r="1" fill="currentColor"/><circle cx="5" cy="12" r="1" fill="currentColor"/><circle cx="19" cy="12" r="1" fill="currentColor"/>',
  dating:          '<path d="M12 21C12 21 4 14.5 4 9.5 4 6.5 6.5 4 9.5 4c1.7 0 3.4.8 4.5 2.1C15.1 4.8 16.8 4 18.5 4 21.5 4 24 6.5 24 9.5 24 14.5 12 21 12 21z" stroke="currentColor" stroke-width="1.7" fill="none" transform="translate(-2,0)"/>',
  compras:         '<circle cx="9" cy="21" r="1.5" fill="currentColor"/><circle cx="19" cy="21" r="1.5" fill="currentColor"/><path d="M3 3h2l3.6 7.6L7.2 13c-.1.3-.2.7-.2 1 0 1.1.9 2 2 2h10v-2H9.4c-.1 0-.2-.1-.2-.2v-.1l.9-1.7h6.4c.7 0 1.4-.4 1.7-1l3.6-6.5c.2-.3-.1-.5-.4-.5H6.2" stroke="currentColor" stroke-width="1.7" fill="none"/>',
  entretenimiento: '<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.7"/><path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><circle cx="9" cy="10" r="1" fill="currentColor"/><circle cx="15" cy="10" r="1" fill="currentColor"/>'
};

export const CUSTOM_RULE_ID_START = 1;
export const CUSTOM_RULE_ID_MAX = 999;
export const ALARM_NAME = 'scheduleCheck';

export const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export const MOTIVATIONAL_MESSAGES = [
  "¡Mantente enfocado! Las grandes metas requieren tiempo y dedicación.",
  "Tu 'yo' del futuro te agradecerá por mantenerte en el camino correcto.",
  "Las distracciones son enemigas del progreso. ¡Sigue adelante!",
  "El enfoque es el puente entre tus objetivos y tus logros.",
  "Cada minuto de concentración te acerca un paso más a tus metas.",
  "Eres más fuerte que esta distracción. ¡Sigue trabajando!",
  "El éxito es la suma de pequeños esfuerzos repetidos día tras día.",
  "No dejes que un impulso momentáneo descarrile tu productividad.",
  "Los campeones se construyen en las horas en que nadie los observa.",
  "El secreto para avanzar es empezar y mantenerse enfocado.",
  "La disciplina es elegir entre lo que quieres ahora y lo que más quieres.",
  "Tu atención es tu recurso más valioso. Inviértela sabiamente."
];
