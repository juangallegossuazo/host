export const DEFAULTS = {
  enabled: true,
  blockAction: 'blockPage',
  blockYouTubeShorts: true,
  hideYouTubeComments: false,
  hideYouTubeRecommendations: false,
  allowSnoozeOnBlockPage: true,
  redirectUrl: 'https://es.wikipedia.org',
  apiUrl: 'http://127.0.0.1:8000/api/v1/sync/',
  uninstallProtection: false,
  pinEnabled: false,
  pinCode: '1234',
  adblockEnabled: true,
  totalAdsBlocked: 128,
  customBlocklist: [],
  whitelist: [],
  categoryToggles: {
    socialMedia: false,
    news: false,
    adult: false,
    gaming: false,
    forums: false,
    video: false,
    shopping: false,
    gambling: false,
    entertainment: false,
    sports: false,
    memes: false,
    dating: false
  },
  categoryUnblocked: {},
  scheduleMode: 'always', // 'always' | 'scheduled'
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
  socialMedia:   { label: 'Redes Sociales',     icon: '👥', start: 1000 },
  news:          { label: 'Noticias',           icon: '📰', start: 3000 },
  adult:         { label: 'Contenido Adulto',   icon: '🔞', start: 5000 },
  gaming:        { label: 'Juegos',             icon: '🎮', start: 7000 },
  forums:        { label: 'Foros y Chats',      icon: '💬', start: 9000 },
  video:         { label: 'Video y Streaming',  icon: '📺', start: 11000 },
  shopping:      { label: 'Compras',            icon: '🛒', start: 13000 },
  gambling:      { label: 'Apuestas',           icon: '🎰', start: 15000 },
  entertainment: { label: 'Entretenimiento',    icon: '🎭', start: 17000 },
  sports:        { label: 'Deportes',           icon: '⚽', start: 19000 },
  memes:         { label: 'Memes y Humor',      icon: '😂', start: 21000 },
  dating:        { label: 'Citas y Pareja',     icon: '💕', start: 23000 }
};

export const CATEGORY_ICONS = {
  socialMedia: '<circle cx="9" cy="8" r="3.2" stroke="currentColor" stroke-width="1.7"/><path d="M3.5 19.5c.8-3 2.9-4.7 5.5-4.7s4.7 1.7 5.5 4.7" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><circle cx="17" cy="9" r="2.6" stroke="currentColor" stroke-width="1.7"/><path d="M17.8 14.8c1.6.4 2.8 1.6 3.3 3.3" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
  news: '<rect x="4" y="5" width="15" height="14" rx="2" stroke="currentColor" stroke-width="1.7"/><path d="M8 9.2h6M8 12h6M8 14.8h4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M19 9.5h1.3v5H19" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>',
  adult: '<rect x="5" y="10.5" width="14" height="9" rx="2" stroke="currentColor" stroke-width="1.7"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" stroke="currentColor" stroke-width="1.7"/><circle cx="12" cy="15" r="1.4" fill="currentColor"/>',
  gaming: '<rect x="2.5" y="8" width="19" height="9" rx="4" stroke="currentColor" stroke-width="1.7"/><path d="M7 11.2v3.6M5.2 13h3.6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><circle cx="16" cy="12.5" r="1.1" fill="currentColor"/><circle cx="18.4" cy="14.7" r="1.1" fill="currentColor"/>',
  forums: '<path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v6a2.5 2.5 0 0 1-2.5 2.5H11l-4.5 3.5v-3.5H6.5A2.5 2.5 0 0 1 4 12.5z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M8.2 9h7.6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
  video: '<rect x="3" y="6" width="18" height="12" rx="3" stroke="currentColor" stroke-width="1.7"/><path d="M10 9.5l5 2.5-5 2.5v-5z" fill="currentColor"/>',
  shopping: '<circle cx="9.5" cy="19" r="1.4" fill="currentColor"/><circle cx="17" cy="19" r="1.4" fill="currentColor"/><path d="M3 4.5h2l2.2 10h10.3l2-7H6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>',
  gambling: '<rect x="4.5" y="4.5" width="15" height="15" rx="3" stroke="currentColor" stroke-width="1.7"/><circle cx="9" cy="9" r="1.15" fill="currentColor"/><circle cx="15" cy="9" r="1.15" fill="currentColor"/><circle cx="9" cy="15" r="1.15" fill="currentColor"/><circle cx="15" cy="15" r="1.15" fill="currentColor"/>',
  entertainment: '<rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" stroke-width="1.7"/><path d="M7 5v14M17 5v14M3 9h4M3 15h4M17 9h4M17 15h4" stroke="currentColor" stroke-width="1.4"/>',
  sports: '<path d="M7 4.5h10v4a5 5 0 0 1-10 0v-4z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M7 5.5H4.8a3 3 0 0 0 3 3.2M17 5.5h2.2a3 3 0 0 1-3 3.2" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M12 13.5v4M9.5 20.5h5M10.6 17.5h2.8l-.5 3h-1.8l-.5-3z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>',
  memes: '<circle cx="12" cy="12" r="8.5" stroke="currentColor" stroke-width="1.7"/><path d="M8.5 10.2h.01M15.5 10.2h.01" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M8.7 14.2c.9 1.2 2 1.8 3.3 1.8s2.4-.6 3.3-1.8" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
  dating: '<path d="M12 19.5S4 14 4 8.8C4 6 6 4.5 8.4 4.5c1.5 0 2.7.7 3.6 2 .9-1.3 2.1-2 3.6-2C18 4.5 20 6 20 8.8c0 5.2-8 10.7-8 10.7z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>'
};

export const CUSTOM_RULE_ID_START = 1;
export const CUSTOM_RULE_ID_MAX = 999;
export const ALARM_NAME = 'scheduleCheck';

export const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

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
