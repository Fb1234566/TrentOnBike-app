import { useAuthStore, UserSettings } from '@/stores/auth';

type ThemeValue = UserSettings['tema'];

export function applyTheme(theme: ThemeValue | undefined): void {
  if (typeof document === 'undefined') return;

  const body = document.body;
  body.classList.remove('dark');

  if (theme === 'SCURO') {
    body.classList.add('dark');
  } else if (theme === 'CHIARO') {
    // No class needed
  } else if (theme === 'SISTEMA') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      body.classList.add('dark');
    }
  }
}

export function initializeTheme(): void {
  const authStore = useAuthStore();
  let activeTheme: ThemeValue = 'SISTEMA';

  if (authStore.user && authStore.user.impostazioni && authStore.user.impostazioni.tema) {
    activeTheme = authStore.user.impostazioni.tema;
  }
  applyTheme(activeTheme);
}