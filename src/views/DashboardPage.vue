<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar color="tertiary">
        <ion-title>Dashboard Operatore</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="handleLogout">
            <ion-icon slot="icon-only" :icon="logOutOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" class="ion-padding">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Dashboard Operatore</ion-title>
        </ion-toolbar>
      </ion-header>

      <div class="dashboard-content">
        <ion-card v-if="operatorUser">
          <ion-card-header>
            <ion-card-title>Benvenuto Operatore, {{ operatorUser.nome || 'Operatore' }}!</ion-card-title>
            <ion-card-subtitle v-if="operatorUser.email">{{ operatorUser.email }}</ion-card-subtitle>
          </ion-card-header>
          <ion-card-content>
            <p>Questa è la dashboard riservata agli operatori.</p>
            <p>Qui puoi accedere a strumenti e funzionalità di gestione.</p>
            <ion-list>
              <ion-item button @click="manageReports" :detail="true">
                <ion-icon :icon="documentTextOutline" slot="start" color="primary"></ion-icon>
                <ion-label>Gestisci Segnalazioni</ion-label>
              </ion-item>
              <ion-item button @click="viewUserStats" :detail="true">
                <ion-icon :icon="statsChartOutline" slot="start" color="success"></ion-icon>
                <ion-label>Visualizza Statistiche Utenti</ion-label>
              </ion-item>
              <ion-item button @click="configureSystem" :detail="true">
                <ion-icon :icon="settingsOutline" slot="start" color="warning"></ion-icon>
                <ion-label>Configura Sistema</ion-label>
              </ion-item>
            </ion-list>
          </ion-card-content>
        </ion-card>
        <div v-else-if="isLoadingUser" class="ion-text-center ion-padding">
            <ion-spinner name="crescent"></ion-spinner>
            <p>Caricamento dati operatore...</p>
        </div>
        <div v-else class="ion-text-center ion-padding">
            <p>Impossibile caricare i dati operatore o accesso non autorizzato.</p>
            <ion-button @click="router.push('/login')">Torna al Login</ion-button>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonIcon,
  IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonList, IonItem, IonLabel,
  IonSpinner, toastController
} from '@ionic/vue';
import { logOutOutline, documentTextOutline, statsChartOutline, settingsOutline } from 'ionicons/icons';

console.log('DashboardPage.vue: Script setup');

const router = useRouter();
const authStore = useAuthStore();

// Computed property to get the user from the store
const operatorUser = computed(() => authStore.user);
const isLoadingUser = ref(true);

onMounted(() => {
  console.log('DashboardPage.vue: Component mounted');
  // Auth store should already be populated by App.vue or router guards
  // We check if the user is loaded and has the correct role
  if (authStore.isAuthenticated && authStore.userRole === 'operatore') {
    console.log('DashboardPage.vue: Operator user confirmed', operatorUser.value);
    isLoadingUser.value = false;
  } else if (authStore.isAuthenticated && authStore.userRole !== 'operatore') {
    console.warn('DashboardPage.vue: User is authenticated but not an operator. Role:', authStore.userRole, '. Redirecting.');
    router.replace('/tabs/mappa'); // Or /main for non-operator users
    isLoadingUser.value = false;
  } else {
    // Not authenticated, router guard should have handled this, but as a fallback:
    console.warn('DashboardPage.vue: User not authenticated or role check failed. Redirecting to login.');
    router.replace('/login');
    isLoadingUser.value = false;
  }
});

const handleLogout = async () => {
  console.log('DashboardPage.vue: handleLogout called');
  await authStore.logout();
  router.replace('/login'); // replace to prevent back button to dashboard
};

const manageReports = async () => {
  await router.push('/reports'); // Naviga alla pagina delle segnalazioni
};
const viewUserStats = async () => {
  const toast = await toastController.create({ message: 'Funzione "Visualizza Statistiche Utenti" non implementata.', duration: 2000, position: 'bottom' });
  await toast.present();
};
const configureSystem = async () => {
  const toast = await toastController.create({ message: 'Funzione "Configura Sistema" non implementata.', duration: 2000, position: 'bottom' });
  await toast.present();
};

</script>

<style scoped>
.dashboard-content {
  padding-top: 10px;
}
ion-card {
  width: 100%;
  max-width: 800px;
  margin: 0 auto 20px auto;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  border-radius: 10px;
}
ion-toolbar[color="tertiary"] {
  --background: var(--ion-color-tertiary, #642699); 
  --color: var(--ion-color-tertiary-contrast, #ffffff); 
}
ion-item {
    --padding-start: 10px;
}
</style>