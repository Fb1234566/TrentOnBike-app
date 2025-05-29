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
              <ion-item button @click="manageReports" detail="true">
                <ion-icon :icon="documentTextOutline" slot="start" color="primary"></ion-icon>
                <ion-label>Gestisci Segnalazioni</ion-label>
              </ion-item>
              <ion-item button @click="viewUserStats" detail="true">
                <ion-icon :icon="statsChartOutline" slot="start" color="success"></ion-icon>
                <ion-label>Visualizza Statistiche Utenti</ion-label>
              </ion-item>
              <ion-item button @click="configureSystem" detail="true">
                <ion-icon :icon="settingsOutline" slot="start" color="warning"></ion-icon>
                <ion-label>Configura Sistema</ion-label>
              </ion-item>
            </ion-list>
          </ion-card-content>
        </ion-card>
        <div v-else class="ion-text-center ion-padding">
            <ion-spinner name="crescent"></ion-spinner>
            <p>Caricamento dati operatore...</p>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonIcon,
  IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonList, IonItem, IonLabel,
  IonSpinner, toastController
} from '@ionic/vue';
import { logOutOutline, documentTextOutline, statsChartOutline, settingsOutline } from 'ionicons/icons';

interface OperatorUser {
  _id?: string;
  nome?: string;
  cognome?: string;
  email?: string;
  ruolo?: string;
}

const API_BASE_URL = 'http://localhost:3000/api/v1';

const router = useRouter();
const operatorUser = ref<OperatorUser | null>(null);

onMounted(() => {
  const storedUserData = localStorage.getItem('userData');
  if (storedUserData) {
    try {
        const parsedUser = JSON.parse(storedUserData) as OperatorUser;
        if (parsedUser.ruolo === 'operatore') {
        operatorUser.value = parsedUser;
        } else {
        console.warn('Accesso alla dashboard da utente non operatore, reindirizzamento.');
        router.replace('/main');
        }
    } catch(e) {
        console.error("Errore parsing dati operatore:", e);
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        router.replace('/login');
    }
  } else {
    router.replace('/login');
  }
});

const handleLogout = async () => {
  const token = localStorage.getItem('authToken');
  if (token) {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (error) { console.warn("Errore API logout:", error); }
  }
  localStorage.removeItem('authToken');
  localStorage.removeItem('userData');
  operatorUser.value = null;
  const toast = await toastController.create({ message: 'Logout effettuato.', duration: 2000, color: 'medium', position: 'top' });
  await toast.present();
  router.push('/login');
};

const manageReports = async () => {
  const toast = await toastController.create({ message: 'Funzione "Gestisci Segnalazioni" non implementata.', duration: 2000, position: 'bottom' });
  await toast.present();
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