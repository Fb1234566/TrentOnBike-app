<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import { onMounted } from 'vue';
import { useAuthStore, UserSettings } from '@/stores/auth';
import { initializeTheme } from '@/utils/theme';
import { useI18n } from 'vue-i18n';

const authStore = useAuthStore();
const { locale: i18nLocale } = useI18n();

onMounted(async () => {
  await authStore.loadUserFromStorage();
  initializeTheme();

  if (authStore.user && authStore.user.impostazioni && authStore.user.impostazioni.lingua) {
    i18nLocale.value = authStore.user.impostazioni.lingua;
  } else {
    const browserLang = navigator.language.split('-')[0];
    const supportedLangs = ['it', 'en', 'de'];
    i18nLocale.value = supportedLangs.includes(browserLang) ? browserLang : 'it';
  }
});
</script>