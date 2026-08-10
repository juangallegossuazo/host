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
    adult: false,
    games: false,
    downloads: false,
    entertainment: false
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
  adult:         { label: 'Contenido Adulto',   icon: '🔞', start: 1000, file: 'adult.txt' },
  games:         { label: 'Juegos Online',      icon: '🎮', start: 3000, file: 'games.txt' },
  downloads:     { label: 'Descargas',          icon: '📥', start: 5000, file: 'downloads.txt' },
  entertainment: { label: 'Entretenimiento',    icon: '📺', start: 7000, file: 'entertainment.txt' }
};

export const CATEGORY_ICONS = {
  adult: '<rect x="5" y="10.5" width="14" height="9" rx="2" stroke="currentColor" stroke-width="1.7"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" stroke="currentColor" stroke-width="1.7"/><circle cx="12" cy="15" r="1.4" fill="currentColor"/>',
  games: '<rect x="2.5" y="8" width="19" height="9" rx="4" stroke="currentColor" stroke-width="1.7"/><path d="M7 11.2v3.6M5.2 13h3.6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><circle cx="16" cy="12.5" r="1.1" fill="currentColor"/><circle cx="18.4" cy="14.7" r="1.1" fill="currentColor"/>',
  downloads: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><polyline points="7 10 12 15 17 10" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
  entertainment: '<rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" stroke-width="1.7"/><path d="M7 5v14M17 5v14M3 9h4M3 15h4M17 9h4M17 15h4" stroke="currentColor" stroke-width="1.4"/>'
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
