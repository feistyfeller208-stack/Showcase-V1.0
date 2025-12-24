
import { CatalogTheme } from './types';

export const THEMES = {
  [CatalogTheme.MODERN]: {
    primary: 'bg-indigo-600',
    text: 'text-gray-900',
    accent: 'indigo',
    card: 'bg-white shadow-sm border border-gray-100'
  },
  [CatalogTheme.CLASSIC]: {
    primary: 'bg-stone-800',
    text: 'text-stone-900',
    accent: 'stone',
    card: 'bg-stone-50 border border-stone-200'
  },
  [CatalogTheme.MINIMALIST]: {
    primary: 'bg-black',
    text: 'text-black',
    accent: 'gray',
    card: 'bg-white border-b border-gray-100'
  },
  [CatalogTheme.BOLD]: {
    primary: 'bg-pink-500',
    text: 'text-gray-900',
    accent: 'pink',
    card: 'bg-white shadow-md border-t-4 border-pink-500'
  },
  [CatalogTheme.GALLERY]: {
    primary: 'bg-slate-900',
    text: 'text-white',
    accent: 'slate',
    card: 'bg-slate-800 border border-slate-700'
  }
};
