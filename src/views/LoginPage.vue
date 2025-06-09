<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar color="primary">
        <ion-title>Accesso Utente</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <div class="login-container">
        <ion-card class="login-card">
          <ion-card-header>
            <ion-card-title class="ion-text-center">Benvenuto!</ion-card-title>
            <ion-card-subtitle class="ion-text-center">Accedi per continuare</ion-card-subtitle>
          </ion-card-header>
          <ion-card-content>
            <ion-list lines="full" class="ion-no-margin">
              <ion-item>
                <ion-icon :icon="mailOutline" slot="start" color="medium"></ion-icon>
                <ion-input
                  label="Email"
                  label-placement="floating"
                  type="email"
                  v-model="credentials.email"
                  placeholder="iltuo@indirizzo.email"
                  required
                  @keyup.enter="handleLogin"
                ></ion-input>
              </ion-item>
              <ion-item>
                <ion-icon :icon="lockClosedOutline" slot="start" color="medium"></ion-icon>
                <ion-input
                  label="Password"
                  label-placement="floating"
                  :type="showPassword ? 'text' : 'password'"
                  v-model="credentials.password"
                  placeholder="La tua password"
                  required
                  @keyup.enter="handleLogin"
                ></ion-input>
                <ion-icon
                  slot="end"
                  :icon="showPassword ? eyeOffOutline : eyeOutline"
                  @click="toggleShowPassword"
                  color="medium"
                  class="password-toggle-icon"
                ></ion-icon>
              </ion-item>
            </ion-list>

            <ion-button
              expand="block"
              @click="handleLogin"
              class="ion-margin-top"
              :disabled="isLoading"
            >
              <ion-spinner v-if="isLoading" name="crescent" slot="start"></ion-spinner>
              Accedi
            </ion-button>

            <div v-if="errorMessage" class="error-message ion-text-center ion-margin-top">
              {{ errorMessage }}
            </div>

            <div class="ion-text-center ion-margin-top">
              <ion-text color="medium">
                Non hai un account?
                <router-link to="/register" class="register-link">Registrati</router-link>
              </ion-text>
            </div>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonInput,
  IonButton, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
  IonIcon, IonText, IonSpinner, toastController
} from '@ionic/vue';
import { mailOutline, lockClosedOutline, eyeOutline, eyeOffOutline } from 'ionicons/icons';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const credentials = ref({
  email: '',
  password: ''
});
const errorMessage = ref('');
const isLoading = ref(false);
const showPassword = ref(false);

const toggleShowPassword = () => {
  showPassword.value = !showPassword.value;
};

const handleLogin = async () => {
  if (!credentials.value.email || !credentials.value.password) {
    errorMessage.value = 'Per favore, inserisci email e password.';
    return;
  }
  isLoading.value = true;
  errorMessage.value = '';

  const result = await authStore.login(credentials.value);

  if (result.success && result.user) {
    const toast = await toastController.create({
      message: result.message || 'Accesso effettuato con successo!',
      duration: 2000,
      color: 'success',
      position: 'top'
    });
    await toast.present();

    // Reindirizza alla pagina desiderata dopo il login
    const redirectPath = route.query.redirect as string | undefined;
    if (redirectPath) {
      router.replace(redirectPath).then(() => window.location.reload());
    } else {
        // Logica di reindirizzamento basata sul ruolo
      const targetPath = result.user.ruolo === 'operatore' ? '/tabs/statistiche' : '/tabs/mappa';
      router.replace(targetPath).then(() => window.location.reload());
    }
  } else {
    errorMessage.value = result.message || 'Errore imprevisto durante il login.';
    const toast = await toastController.create({
      message: errorMessage.value,
      duration: 3000,
      color: 'danger',
      position: 'top'
    });
    await toast.present();
  }
  isLoading.value = false;
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  padding: 16px;
}

.login-card {
  width: 100%;
  max-width: 400px;
}

ion-card-title {
  font-weight: bold;
  color: var(--ion-color-primary);
}

.error-message {
  color: var(--ion-color-danger);
  font-size: 0.9em;
}

.register-link {
  color: var(--ion-color-primary);
  text-decoration: none;
  font-weight: 500;
}
.password-toggle-icon {
  cursor: pointer;
}
</style>