<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>{{ $t('settingsTitle') }}</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
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

      <div v-if="!isLoading && !settingsData && authStore.isAuthenticated" class="ion-text-center ion-padding">
        <p>{{ errorMessage || $t('errorLoadingSettings') }}</p>
        <ion-button @click="loadSettings">{{ $t('retryButton') }}</ion-button>
      </div>

       <div v-if="!authStore.isAuthenticated && !isLoading" class="ion-padding ion-text-center">
        <p>{{ $t('authRequiredSettings') }}</p>
        <ion-button expand="block" @click="goToLogin" class="ion-margin-top">Login</ion-button>
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
  IonSelect, IonSelectOption, IonToggle, IonButton, IonSpinner, toastController
} from '@ionic/vue';
import { applyTheme } from '@/utils/theme';
import { useI18n } from 'vue-i18n';

const router = useRouter();
const authStore = useAuthStore();
const { locale: i18nLocale, t } = useI18n();

const settingsData = ref<UserSettings | null>(null);
const isLoading = ref(true);
const isSaving = ref(false);
const errorMessage = ref<string | null>(null);

watch(() => authStore.user?.impostazioni, (newSettings) => {
  if (newSettings) {
    settingsData.value = { ...newSettings }; // Clone to avoid direct mutation before save
    if (newSettings.tema) applyTheme(newSettings.tema);
    if (newSettings.lingua) i18nLocale.value = newSettings.lingua;
  }
}, { deep: true, immediate: true });


onMounted(() => {
  if (authStore.isAuthenticated) {
    if (authStore.user?.impostazioni) {
       settingsData.value = { ...authStore.user.impostazioni }; // Initialize from store if available
       isLoading.value = false;
    } else {
        loadSettings(); // Fetch if not in store
    }
  } else {
    isLoading.value = false;
    // No toast here, message is shown in template
  }
});

const loadSettings = async () => {
  isLoading.value = true;
  errorMessage.value = null;
  if (!authStore.token) {
    isLoading.value = false;
    authStore.clearAuthData(); // Ensure clean state
    router.replace('/login');
    return;
  }
  try {
    const response = await fetch(`${API_BASE_URL}/users/me/impostazioni`, {
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: `Error ${response.status}: ${response.statusText}` }));
      throw new Error(errorData.message || t('errorLoadingSettings'));
    }
    const data: UserSettings = await response.json();
    authStore.updateUserImpostazioni(data); // Update store first
    settingsData.value = { ...data }; // Then update local reactive ref
    
  } catch (error: any) {
    errorMessage.value = error.message;
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
  errorMessage.value = null;
  try {
    const response = await fetch(`${API_BASE_URL}/users/me/impostazioni`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify(settingsData.value)
    });
    const responseData: UserSettings = await response.json();
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}` || t('errorSavingSettings'));
    }
    
    authStore.updateUserImpostazioni(responseData);
    settingsData.value = { ...responseData }; // update local ref with saved data

    toastController.create({
      message: t('settingsSavedSuccess'),
      duration: 2000,
      color: 'success',
      position: 'top'
    }).then(toast => toast.present());
  } catch (error: any) {
    errorMessage.value = error.message;
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
  const newTheme = event.detail.value as UserSettings['tema'];
  if (settingsData.value) {
    settingsData.value.tema = newTheme;
    applyTheme(newTheme);
  }
};

const handleLanguageChange = (event: CustomEvent) => {
  const newLang = event.detail.value as UserSettings['lingua'];
  if (settingsData.value) {
    settingsData.value.lingua = newLang;
    i18nLocale.value = newLang;
  }
};

const goToLogin = () => {
  router.push({ name: 'Login' });
};

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