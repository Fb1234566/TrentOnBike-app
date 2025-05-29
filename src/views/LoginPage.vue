<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar color="primary">
        <ion-title>Accesso Utente</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" class="ion-padding">
      <div class="login-container">
        <ion-card class="login-card">
          <ion-card-header>
            <ion-card-title class="ion-text-center">Benvenuto!</ion-card-title>
            <ion-card-subtitle class="ion-text-center">Accedi o continua come ospite</ion-card-subtitle>
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

            <ion-button
              expand="block"
              fill="outline"
              @click="continueAsGuest"
              class="ion-margin-top"
              color="secondary"
            >
              Continua come Ospite
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
import { useRouter } from 'vue-router';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonInput,
  IonButton, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
  IonIcon, IonText, IonSpinner, toastController
} from '@ionic/vue';
import { mailOutline, lockClosedOutline, eyeOutline, eyeOffOutline } from 'ionicons/icons';

const API_BASE_URL = 'http://localhost:3000/api/v1';

const router = useRouter();
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

  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials.value),
    });

    const data = await response.json();

    if (!response.ok) {
      errorMessage.value = data.message || `Errore ${response.status}: Impossibile effettuare il login.`;
      const toast = await toastController.create({
        message: errorMessage.value,
        duration: 3000,
        color: 'danger',
        position: 'top'
      });
      await toast.present();
    } else {
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userData', JSON.stringify(data.user));

      const toast = await toastController.create({
        message: data.message || 'Accesso effettuato con successo!',
        duration: 2000,
        color: 'success',
        position: 'top'
      });
      await toast.present();
      router.push('/');
    }
  } catch (error) {
    console.error('Login error:', error);
    errorMessage.value = 'Errore di connessione o del server. Riprova più tardi.';
    const toast = await toastController.create({
        message: errorMessage.value,
        duration: 3000,
        color: 'danger',
        position: 'top'
      });
    await toast.present();
  } finally {
    isLoading.value = false;
  }
};

const continueAsGuest = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userData');
  router.push('/main');
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
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  border-radius: 12px;
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
.register-link:hover {
  text-decoration: underline;
}
.password-toggle-icon {
  cursor: pointer;
  font-size: 1.2em;
}
</style>