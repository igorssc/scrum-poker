import { THEME } from '@/enums/theme';
import { getCookie } from './cookies';

/**
 * Determina o tema inicial seguindo a ordem de prioridade:
 * 1. Cookie salvo
 * 2. Tema padrão passado como parâmetro
 * 3. Preferência do sistema operacional
 * 4. Light como fallback
 */
export const getInitialTheme = (defaultTheme?: THEME): THEME => {
  // 1ª Prioridade: Cookie salvo
  const savedTheme = getCookie('scrum-poker-theme') as THEME;

  if (savedTheme === THEME.DARK || savedTheme === THEME.LIGHT) {
    return savedTheme;
  }

  // 2ª Prioridade: defaultTheme passado como parâmetro
  if (defaultTheme) {
    return defaultTheme;
  }

  // 3ª Prioridade: Preferência do sistema
  if (typeof window !== 'undefined' && window.matchMedia) {
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (systemPrefersDark) {
      return THEME.DARK;
    }
  }

  // 4ª Prioridade: Padrão light
  return THEME.LIGHT;
};

/**
 * Aplica o tema ao documento
 */
export const applyTheme = (theme: THEME): void => {
  const root = document.documentElement;

  if (theme === THEME.DARK) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
};
