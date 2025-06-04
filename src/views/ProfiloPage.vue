<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Profilo Utente</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Profilo</ion-title>
        </ion-toolbar>
      </ion-header>

      <div v-if="authStore.isAuthenticated && authStore.user" class="ion-padding">
        <ion-card>
          <ion-card-header>
            <ion-card-title>{{ authStore.user.nome }} {{ authStore.user.cognome || '' }}</ion-card-title>
            <ion-card-subtitle>{{ authStore.user.ruolo | capitalize }}</ion-card-subtitle>
          </ion-card-header>
          <ion-card-content>
            <ion-list lines="none">
              <ion-item>
                <ion-icon :icon="mailOutline" slot="start" color="primary"></ion-icon>
                <ion-label>Email</ion-label>
                <ion-note slot="end">{{ authStore.user.email }}</ion-note>
              </ion-item>
              <ion-item>
                <ion-icon :icon="personCircleOutline" slot="start" color="primary"></ion-icon>
                <ion-label>Nome</ion-label>
                <ion-note slot="end">{{ authStore.user.nome }}</ion-note>
              </ion-item>
              <ion-item v-if="authStore.user.cognome">
                <ion-icon :icon="personOutline" slot="start" color="primary"></ion-icon>
                <ion-label>Cognome</ion-label>
                <ion-note slot="end">{{ authStore.user.cognome }}</ion-note>
              </ion-item>
               <ion-item>
                <ion-icon :icon="shieldCheckmarkOutline" slot="start" color="primary"></ion-icon>
                <ion-label>Ruolo</ion-label>
                <ion-note slot="end">{{ authStore.user.ruolo | capitalize }}</ion-note>
              </ion-item>
            </ion-list>
          </ion-card-content>
        </ion-card>

        <ion-button expand="block" color="danger" @click="handleLogout" class="ion-margin-top">
          <ion-icon slot="start" :icon="logOutOutline"></ion-icon>
          Logout
        </ion-button>
      </div>
      <div v-else class="ion-padding ion-text-center">
        <ion-text>Devi essere autenticato per visualizzare il profilo.</ion-text>
        <ion-button expand="block" @click="goToLogin" class="ion-margin-top">Login</ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonNote,
  IonButton,
  IonIcon,
  IonText,
  toastController
} from '@ionic/vue';
import { mailOutline, logOutOutline, personCircleOutline, personOutline, shieldCheckmarkOutline } from 'ionicons/icons';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const handleLogout = async () => {
  try {
    await authStore.logout(); 
    const toast = await toastController.create({
        message: 'Logout effettuato con successo.',
        duration: 2000,
        color: 'success'
    });
    await toast.present();
    router.replace({ name: 'Login' });
  } catch (error) {
     const toast = await toastController.create({
        message: 'Errore durante il logout.',
        duration: 2000,
        color: 'danger'
    });
    await toast.present();
    console.error('Errore durante il logout:', error);
  }
};

const goToLogin = () => {
  router.push({ name: 'Login' });
};

const filters = {
  capitalize: (value: string) => {
    if (!value) return '';
    value = value.toString();
    return value.charAt(0).toUpperCase() + value.slice(1);
  }
};
</script>

<script lang="ts">
export default {
  filters: {
    capitalize: (value: string) => {
      if (!value) return '';
      value = value.toString();
      return value.charAt(0).toUpperCase() + value.slice(1);
    }
  }
}
</script>


<style scoped>
ion-card-title {
  font-size: 1.4em;
}
ion-card-subtitle {
  font-size: 1em;
  color: var(--ion-color-medium-shade);
  text-transform: capitalize;
}
ion-item ion-icon {
  margin-right: 10px;
}
</style>