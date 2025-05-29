<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar color="primary">
        <ion-title>Pagina Principale</ion-title>
        <ion-buttons slot="end">
          <ion-button v-if="isAuthenticated" @click="handleLogout">
            <ion-icon slot="icon-only" :icon="logOutOutline"></ion-icon>
          </ion-button>
          <ion-button v-if="!isAuthenticated" @click="goToLogin">
            <ion-icon slot="start" :icon="logInOutline"></ion-icon>
            Login
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" class="ion-padding">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Pagina Principale</ion-title>
        </ion-toolbar>
      </ion-header>

      <div class="main-content">
        <ion-card>
          <ion-card-header>
            <ion-card-title v-if="user && isAuthenticated">
              Bentornato, {{ user.nome || 'Utente' }} {{ user.cognome || '' }}!
            </ion-card-title>
            <ion-card-title v-else>
              Benvenuto, Ospite!
            </ion-card-title>
            <ion-card-subtitle v-if="user && isAuthenticated && user.email">
              {{ user.email }}
            </ion-card-subtitle>
            <ion-card-subtitle v-if="user && isAuthenticated && user.ruolo">
              Ruolo: {{ user.ruolo }}
            </ion-card-subtitle>
          </ion-card-header>
          <ion-card-content>
            <p v-if="isAuthenticated">Questa è la tua pagina principale.</p>
            <p v-else>Stai navigando come ospite. Alcune funzionalità potrebbero essere limitate.</p>
            <p>Qui potrai visualizzare i contenuti accessibili.</p>

            <div v-if="isAuthenticated">
              <ion-button expand="block" @click="fetchProtectedData" class="ion-margin-top" :disabled="isLoadingData">
                <ion-spinner v-if="isLoadingData" name="crescent" slot="start"></ion-spinner>
                Carica Lista PDI (Richiede Login)
              </ion-button>
              <div v-if="apiMessage" :class="apiError ? 'api-error' : 'api-success'" class="ion-margin-top ion-padding ion-text-center">
                {{ apiMessage }}
              </div>
              <div v-if="protectedData" class="data-display ion-margin-top">
                <h4>Dati ricevuti (PDI):</h4>
                <pre>{{ JSON.stringify(protectedData, null, 2) }}</pre>
              </div>
            </div>

            <div v-if="!isAuthenticated" class="ion-margin-top ion-text-center">
              <p>Per accedere a tutte le funzionalità, per favore:</p>
              <ion-button @click="goToLogin" fill="outline" color="primary">Accedi</ion-button>
              <ion-button @click="goToRegister" fill="outline" color="secondary" class="ion-margin-start">Registrati</ion-button>
            </div>

            <h3 class="ion-margin-top">Contenuto Pubblico</h3>
            <p>Queste informazioni sono visibili a tutti gli utenti, autenticati o meno.</p>

          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonIcon,
  IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonSpinner, toastController
} from '@ionic/vue';
import { logOutOutline, logInOutline } from 'ionicons/icons';

interface User {
  _id?: string;
  nome?: string;
  cognome?: string;
  email?: string;
  ruolo?: string;
  impostazioni?: string;
  statistiche?: string;
}

const API_BASE_URL = 'http://localhost:3000/api/v1';

const router = useRouter();
const user = ref<User | null>(null);
const isLoadingData = ref(false);
const apiMessage = ref('');
const apiError = ref(false);
const protectedData = ref<any>(null);

const isAuthenticated = computed(() => {
  return !!localStorage.getItem('authToken') && user.value !== null;
});

onMounted(() => {
  const storedAuthToken = localStorage.getItem('authToken');
  const storedUserData = localStorage.getItem('userData');

  if (storedAuthToken && storedUserData) {
    try {
      user.value = JSON.parse(storedUserData);
    } catch (e) {
      console.error("Errore nel parsing dei dati utente da localStorage:", e);
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      user.value = null;
    }
  } else {
    user.value = null;
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
    } catch (error) {
      console.warn("Errore API logout:", error);
    }
  }
  localStorage.removeItem('authToken');
  localStorage.removeItem('userData');
  user.value = null;
  const toast = await toastController.create({ message: 'Logout effettuato.', duration: 2000, color: 'medium', position: 'top' });
  await toast.present();
  router.push('/login');
};

const goToLogin = () => {
  router.push('/login');
};

const goToRegister = () => {
  router.push('/register');
};

const fetchProtectedData = async () => {
  if (!isAuthenticated.value) {
    apiMessage.value = "Devi essere loggato per accedere a questi dati.";
    apiError.value = true;
    const toast = await toastController.create({ message: apiMessage.value, duration: 3000, color: 'warning', position: 'top' });
    await toast.present();
    return;
  }

  isLoadingData.value = true;
  apiMessage.value = '';
  apiError.value = false;
  protectedData.value = null;
  const token = localStorage.getItem('authToken');

  if (!token) {
    apiMessage.value = 'Token non trovato.';
    apiError.value = true;
    isLoadingData.value = false;
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/pdi`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await response.json();
    if (!response.ok) {
      apiMessage.value = data.message || `Errore ${response.status}.`;
      apiError.value = true;
    } else {
      apiMessage.value = 'Dati PDI (protetti) caricati!';
      apiError.value = false;
      protectedData.value = data;
    }
  } catch (error) {
    console.error('Errore fetch protected data:', error);
    apiMessage.value = 'Errore di connessione.';
    apiError.value = true;
  } finally {
    isLoadingData.value = false;
    if (apiMessage.value) {
        const toast = await toastController.create({
            message: apiMessage.value,
            duration: 3000,
            color: apiError.value ? 'danger' : 'success',
            position: 'top'
        });
        await toast.present();
    }
  }
};
</script>

<style scoped>
.main-content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
ion-card {
  width: 100%;
  max-width: 600px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  border-radius: 10px;
}
ion-card-title {
  font-weight: bold;
}
.api-error {
  color: var(--ion-color-danger);
  background-color: rgba(var(--ion-color-danger-rgb), 0.1);
  border: 1px solid var(--ion-color-danger-shade);
  border-radius: 4px;
  padding: 8px;
}
.api-success {
  color: var(--ion-color-success);
  background-color: rgba(var(--ion-color-success-rgb), 0.1);
  border: 1px solid var(--ion-color-success-shade);
  border-radius: 4px;
  padding: 8px;
}
.data-display {
  background-color: var(--ion-color-light-tint);
  padding: 10px;
  border-radius: 4px;
  margin-top: 15px;
  max-height: 300px;
  overflow-y: auto;
}
.data-display pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  font-size: 0.9em;
}
</style>