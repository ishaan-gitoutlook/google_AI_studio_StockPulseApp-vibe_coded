import { ThemeConfig, ThemeId } from '../types';

export const THEMES: Record<ThemeId, ThemeConfig> = {
  'midnight-navy': {
    id: 'midnight-navy',
    name: 'Midnight Navy',
    category: 'dark',
    description: 'Ergonomic deep navy with cyan highlights for reduced eye fatigue during market hours.',
    accent: '#38bdf8', // sky-400
    bg: '#0a0f1d',
    cardBg: '#111827',
    cardBorder: '#1f293d',
    textPrimary: '#f8fafc',
    textSecondary: '#94a3b8',
    textMuted: '#64748b',
    gainColor: '#10b981',
    lossColor: '#f43f5e',
    tag: '🌙 Dark Ergonomic',
  },
  'clean-light': {
    id: 'clean-light',
    name: 'Clean Light',
    category: 'light',
    description: 'Glare-free off-white paper canvas with ultra-crisp slate typography.',
    accent: '#0284c7', // sky-600
    bg: '#f8fafc',
    cardBg: '#ffffff',
    cardBorder: '#e2e8f0',
    textPrimary: '#0f172a',
    textSecondary: '#475569',
    textMuted: '#94a3b8',
    gainColor: '#059669',
    lossColor: '#e11d48',
    tag: '☀️ Glare-Free Paper',
  },
  'obsidian-noir': {
    id: 'obsidian-noir',
    name: 'Obsidian Noir',
    category: 'dark',
    description: 'True OLED pitch-black with high-contrast monochrome & neon emerald metrics.',
    accent: '#22d3ee', // cyan-400
    bg: '#000000',
    cardBg: '#0a0a0a',
    cardBorder: '#262626',
    textPrimary: '#ffffff',
    textSecondary: '#a3a3a3',
    textMuted: '#525252',
    gainColor: '#22c55e',
    lossColor: '#ef4444',
    tag: '🖤 OLED High-Contrast',
  },
  'emerald-wealth': {
    id: 'emerald-wealth',
    name: 'Emerald Wealth',
    category: 'dark',
    description: 'Deep forest pine background balanced with soothing jade & gold data accents.',
    accent: '#34d399', // emerald-400
    bg: '#061a14',
    cardBg: '#0c261e',
    cardBorder: '#16382d',
    textPrimary: '#ecfdf5',
    textSecondary: '#a7f3d0',
    textMuted: '#6ee7b7',
    gainColor: '#10b981',
    lossColor: '#f87171',
    tag: '🌲 Forest Wealth',
  },
  'arctic-frost': {
    id: 'arctic-frost',
    name: 'Arctic Frost',
    category: 'light',
    description: 'Nordic minimalist frosted mist with icy blue highlights and slate structures.',
    accent: '#2563eb', // blue-600
    bg: '#f0f4f8',
    cardBg: '#ffffff',
    cardBorder: '#cbd5e1',
    textPrimary: '#1e293b',
    textSecondary: '#334155',
    textMuted: '#64748b',
    gainColor: '#16a34a',
    lossColor: '#dc2626',
    tag: '❄️ Nordic Mist',
  },
  'crimson-sunset': {
    id: 'crimson-sunset',
    name: 'Crimson Sunset',
    category: 'dark',
    description: 'Warm twilight ember palette with terracotta accents and soft amber glow.',
    accent: '#fb923c', // orange-400
    bg: '#180e12',
    cardBg: '#23141b',
    cardBorder: '#3d202e',
    textPrimary: '#fff1f2',
    textSecondary: '#fecdd3',
    textMuted: '#fda4af',
    gainColor: '#34d399',
    lossColor: '#fb7185',
    tag: '🌇 Twilight Ember',
  },
  'solarized-dark': {
    id: 'solarized-dark',
    name: 'Solarized Dark',
    category: 'dark',
    description: 'Developer classic precision palette engineered for mathematical and code clarity.',
    accent: '#268bd2', // solarized blue
    bg: '#002b36',
    cardBg: '#073642',
    cardBorder: '#0e4e5e',
    textPrimary: '#fdf6e3',
    textSecondary: '#93a1a1',
    textMuted: '#657b83',
    gainColor: '#859900',
    lossColor: '#dc322f',
    tag: '💻 Dev Classic',
  },
};

export function getStoredTheme(): ThemeConfig {
  try {
    const saved = localStorage.getItem('stockpulse_theme_id') as ThemeId | null;
    if (saved && THEMES[saved]) {
      return THEMES[saved];
    }
  } catch (e) {
    // ignore
  }
  return THEMES['midnight-navy'];
}

export function saveTheme(themeId: ThemeId): void {
  try {
    localStorage.setItem('stockpulse_theme_id', themeId);
  } catch (e) {
    // ignore
  }
}

export function applyThemeToDocument(theme: ThemeConfig): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.style.setProperty('--bg-color', theme.bg);
  root.style.setProperty('--card-bg', theme.cardBg);
  root.style.setProperty('--card-border', theme.cardBorder);
  root.style.setProperty('--text-primary', theme.textPrimary);
  root.style.setProperty('--text-secondary', theme.textSecondary);
  root.style.setProperty('--accent-color', theme.accent);
  root.style.setProperty('--gain-color', theme.gainColor);
  root.style.setProperty('--loss-color', theme.lossColor);

  if (theme.category === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}
