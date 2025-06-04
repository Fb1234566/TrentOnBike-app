import { UserSettings } from '@/stores/auth';

type ThemeValue = UserSettings['tema'];

export function applyTheme(theme: ThemeValue | undefined): void {
  if (typeof document === 'undefined') return;

  const body = document.body;
  body.classList.remove('dark');

  if (theme === 'SCURO') {
    body.classList.add('dark');
  } else if (theme === 'CHIARO') {
    // No class needed for light theme
  } else if (theme === 'SISTEMA') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      body.classList.add('dark');
    }
  }
}

export function initializeTheme(): void {
  const authStoreModule = import('@/stores/auth');
  authStoreModule.then(({ useAuthStore }) => {
    const authStore = useAuthStore();
    let activeTheme: ThemeValue = 'SISTEMA';

    if (authStore.user && authStore.user.impostazioni && authStore.user.impostazioni.tema) {
      activeTheme = authStore.user.impostazioni.tema;
    }
    applyTheme(activeTheme);
  }).catch(error => {
    console.error("Failed to load auth store for theme initialization:", error);
    applyTheme('SISTEMA'); // Fallback
  });
}