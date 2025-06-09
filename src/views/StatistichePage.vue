<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Statistiche</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Statistiche</ion-title>
        </ion-toolbar>
      </ion-header>

      <div v-if="authStore.isAuthenticated && authStore.user">
        <StatisticheUtente v-if="authStore.user.ruolo === 'utente'" />
        <StatisticheOperatore v-else-if="authStore.user.ruolo === 'operatore' || authStore.user.ruolo === 'admin'" />
        <div v-else class="ion-padding">
          <ion-text color="danger">Ruolo utente non riconosciuto per visualizzare le statistiche.</ion-text>
        </div>
      </div>
      <div v-else class="ion-padding ion-text-center">
        <ion-text>Devi effettuare il login per visualizzare le statistiche.</ion-text>
        <ion-button expand="block" @click="goToLogin">Login</ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonText, IonButton } from '@ionic/vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import StatisticheUtente from '@/components/statistiche/StatisticheUtente.vue';
import StatisticheOperatore from '@/components/statistiche/StatisticheOperatore.vue';

const authStore = useAuthStore();
const router = useRouter();

const goToLogin = () => {
  router.push({ name: 'Login' });
};
</script>