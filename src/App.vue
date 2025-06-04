<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import { onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { initializeTheme } from '@/utils/theme';
import { useI18n } from 'vue-i18n';

const authStore = useAuthStore();
const { locale: i18nLocale } = useI18n();

onMounted(async () => {
  // Pinia store loading is synchronous if values are in localStorage
  // For async operations inside loadUserFromStorage, ensure they complete
  // if subsequent logic depends on them immediately.
  authStore.loadUserFromStorage();
  initializeTheme(); // initializeTheme now handles async store loading internally

  if (authStore.user?.impostazioni?.lingua) {
    i18nLocale.value = authStore.user.impostazioni.lingua;
  } else {
    const browserLang = navigator.language.split('-')[0];
    const supportedLangs: Array<'it' | 'en' | 'de'> = ['it', 'en', 'de'];
    if (supportedLangs.includes(browserLang as any)) {
      i18nLocale.value = browserLang as 'it' | 'en' | 'de';
    } else {
      i18nLocale.value = 'it'; // Default fallback
    }
  }
});
</script>