<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>{{ $t('settingsTitle') }}</ion-title>
         <ion-buttons slot="end">
          <ion-button v-if="authStore.isAuthenticated" @click="handleLogout">
            <ion-icon slot="icon-only" :icon="logOutOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" class="ion-padding">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">{{ $t('settingsTitle') }}</ion-title>
        </ion-toolbar>
      </ion-header>

      <div v-if="isLoading" class="ion-text-center ion-padding">
        <ion-spinner name="crescent"></ion-spinner>
        <p>{{ $t('loadingSettings') }}</p>
      </div>

      <ion-list v-if="!isLoading && settingsData">
        <ion-list-header>
          <ion-label>{{ $t('generalPreferences') }}</ion-label>
        </ion-list-header>

        <ion-item>
          <ion-label>{{ $t('language') }}</ion-label>
          <ion-select v-model="settingsData.lingua" @ionChange="handleLanguageChange" interface="popover" :placeholder="$t('selectLanguage')">
            <ion-select-option value="it">Italiano</ion-select-option>
            <ion-select-option value="en">English</ion-select-option>
            <ion-select-option value="de">Deutsch</ion-select-option>
          </ion-select>
        </ion-item>

        <ion-item>
          <ion-label>{{ $t('theme') }}</ion-label>
          <ion-select v-model="settingsData.tema" @ionChange="handleThemeChange" interface="popover" :placeholder="$t('selectTheme')">
            <ion-select-option value="CHIARO">{{ $t('themeLight') }}</ion-select-option>
            <ion-select-option value="SCURO">{{ $t('themeDark') }}</ion-select-option>
            <ion-select-option value="SISTEMA">{{ $t('themeSystem') }}</ion-select-option>
          </ion-select>
        </ion-item>

        <ion-item>
          <ion-label>{{ $t('notificationsPOINearby') }}</ion-label>
          <ion-toggle slot="end" v-model="settingsData.notifichePOIVicini"></ion-toggle>
        </ion-item>
      </ion-list>
      
      <ion-button
        v-if="!isLoading && settingsData"
        expand="block"
        @click="saveSettings"
        class="ion-margin-top"
        :disabled="isSaving"
      >
        <ion-spinner v-if="isSaving" name="crescent" slot="start"></ion-spinner>
        {{ $t('saveSettingsButton') }}
      </ion-button>

      <div v-if="!isLoading && !settingsData" class="ion-text-center ion-padding">
        <p>{{ $t('errorLoadingSettings') }}</p>
        <ion-button @click="loadSettings">{{ $t('retryButton') }}</ion-button>
      </div>

    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore, UserSettings } from '@/stores/auth';
import { API_BASE_URL } from '@/config';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonListHeader, IonItem, IonLabel,
  IonSelect, IonSelectOption, IonToggle, IonButton, IonSpinner, toastController, IonButtons, IonIcon
} from '@ionic/vue';
import { logOutOutline } from 'ionicons/icons';
import { applyTheme } from '@/utils/theme';
import { useI18n } from 'vue-i18n';

const router = useRouter();
const authStore = useAuthStore();
const { locale: i18nLocale, t } = useI18n();

const settingsData = ref<UserSettings | null>(null);
const isLoading = ref(true);
const isSaving = ref(false);

watch(settingsData, (newSettings) => {
  if (newSettings?.tema) {
    applyTheme(newSettings.tema);
  }
}, { deep: true });


onMounted(() => {
  if (authStore.isAuthenticated) {
    loadSettings();
  } else {
    isLoading.value = false;
    toastController.create({
      message: t('authRequiredSettings'),
      duration: 3000,
      color: 'warning',
      position: 'top'
    }).then(toast => toast.present());
    router.replace('/login');
  }
});

const loadSettings = async () => {
  isLoading.value = true;
  if (!authStore.token) {
    isLoading.value = false;
    return;
  }
  try {
    const response = await fetch(`${API_BASE_URL}/users/me/impostazioni`, {
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: `Error ${response.status}` }));
      throw new Error(errorData.message);
    }
    const data = await response.json();
    settingsData.value = data;
    if (data.tema) {
        applyTheme(data.tema);
    }
    if (data.lingua) {
        i18nLocale.value = data.lingua;
    }
  } catch (error: any) {
    toastController.create({
      message: error.message || t('errorLoadingSettings'),
      duration: 3000,
      color: 'danger',
      position: 'top'
    }).then(toast => toast.present());
    settingsData.value = null;
  } finally {
    isLoading.value = false;
  }
};

const saveSettings = async () => {
  if (!settingsData.value || !authStore.token) {
    toastController.create({
      message: t('invalidDataOrNotAuth'),
      duration: 3000,
      color: 'danger',
      position: 'top'
    }).then(toast => toast.present());
    return;
  }
  isSaving.value = true;
  try {
    const response = await fetch(`${API_BASE_URL}/users/me/impostazioni`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify(settingsData.value)
    });
    const responseData = await response.json();
    if (!response.ok) {
      throw new Error(responseData.message || `Error ${response.status}`);
    }
    
    authStore.updateUserImpostazioni(responseData); // Update store
    settingsData.value = responseData; // Update local ref with response (e.g. for updatedAt)


    if (responseData.tema) {
        applyTheme(responseData.tema);
    }
    if (responseData.lingua) {
        i18nLocale.value = responseData.lingua;
    }

    toastController.create({
      message: t('settingsSavedSuccess'),
      duration: 2000,
      color: 'success',
      position: 'top'
    }).then(toast => toast.present());
  } catch (error: any) {
    toastController.create({
      message: error.message || t('errorSavingSettings'),
      duration: 3000,
      color: 'danger',
      position: 'top'
    }).then(toast => toast.present());
  } finally {
    isSaving.value = false;
  }
};

const handleThemeChange = (event: CustomEvent) => {
  const newTheme = event.detail.value;
  if (settingsData.value) {
    settingsData.value.tema = newTheme;
    applyTheme(newTheme); // Apply theme immediately for UX
  }
};

const handleLanguageChange = (event: CustomEvent) => {
  const newLang = event.detail.value;
  if (settingsData.value) {
    settingsData.value.lingua = newLang;
    i18nLocale.value = newLang; // Apply language immediately for UX
  }
};

const handleLogout = async () => {
  await authStore.logout();
  applyTheme('SISTEMA'); 
  i18nLocale.value = getInitialLocaleForLogout();
  router.replace('/login');
};

function getInitialLocaleForLogout(): 'it' | 'en' | 'de' {
    const browserLang = navigator.language.split('-')[0];
    const supportedLangs = ['it', 'en', 'de'];
    return supportedLangs.includes(browserLang) ? browserLang as 'it' | 'en' | 'de' : 'it';
}
</script>

<style scoped>
ion-list-header {
  font-size: 1.1em;
  font-weight: bold;
}
ion-item {
  --inner-padding-end: 8px;
}
ion-select {
  width: 100%;
  max-width: 100%;
}
</style>