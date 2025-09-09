export interface Product {
  id: string;
  name: string;
  image: string;
  bought: boolean;
}

export const IMAGE_PROVIDERS_MAP = {
  google: 'google',
  pexels: 'pexels',
  pixabay: 'pixabay',
} as const;
export const IMAGE_PROVIDERS = Object.values(IMAGE_PROVIDERS_MAP);
export type ImageProvider = typeof IMAGE_PROVIDERS[number];

export const VIEW_TYPES_MAP = {
  list: 'list',
  grid: 'grid',
} as const;
export const VIEW_TYPES = Object.values(VIEW_TYPES_MAP);
export type ViewType = typeof VIEW_TYPES[number];

export const THEMES_MAP = {
  light: 'light',
  dark: 'dark',
  system: 'system',
} as const;
export const THEMES = Object.values(THEMES_MAP);
export type Theme = typeof THEMES[number];

export interface AppSettings {
  provider: ImageProvider;
  viewType: ViewType;
  theme: Theme;
}
