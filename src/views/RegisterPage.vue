<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button default-href="/login"></ion-back-button>
        </ion-buttons>
        <ion-title>Registrazione</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" class="ion-padding">
      <div class="register-container">
        <ion-card class="register-card">
          <ion-card-header>
            <ion-card-title class="ion-text-center">Crea un Account</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-list lines="full" class="ion-no-margin">
              <ion-item>
                <ion-icon :icon="personCircleOutline" slot="start" color="medium"></ion-icon>
                <ion-input
                  label="Nome"
                  label-placement="floating"
                  v-model="userData.nome"
                  placeholder="Il tuo nome"
                  required
                ></ion-input>
              </ion-item>
               <ion-item>
                <ion-icon :icon="personCircleOutline" slot="start" color="medium"></ion-icon>
                <ion-input
                  label="Cognome (Opzionale)"
                  label-placement="floating"
                  v-model="userData.cognome"
                  placeholder="Il tuo cognome"
                ></ion-input>
              </ion-item>
              <ion-item>
                <ion-icon :icon="mailOutline" slot="start" color="medium"></ion-icon>
                <ion-input
                  label="Email"
                  label-placement="floating"
                  type="email"
                  v-model="userData.email"
                  placeholder="iltuo@indirizzo.email"
                  required
                ></ion-input>
              </ion-item>
              <ion-item>
                <ion-icon :icon="lockClosedOutline" slot="start" color="medium"></ion-icon>
                <ion-input
                  label="Password"
                  label-placement="floating"
                  :type="showPassword ? 'text' : 'password'"
                  v-model="userData.password"
                  placeholder="Min. 8 caratteri"
                  required
                ></ion-input>
                 <ion-icon
                  slot="end"
                  :icon="showPassword ? eyeOffOutline : eyeOutline"
                  @click="toggleShowPassword"
                  color="medium"
                  class="password-toggle-icon"
                ></ion-icon>
              </ion-item>
              <ion-item>
                <ion-icon :icon="lockClosedOutline" slot="start" color="medium"></ion-icon>
                <ion-input
                  label="Conferma Password"
                  label-placement="floating"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  v-model="userData.confirmPassword"
                  placeholder="Reinserisci la password"
                  required
                ></ion-input>
                 <ion-icon
                  slot="end"
                  :icon="showConfirmPassword ? eyeOffOutline : eyeOutline"
                  @click="toggleShowConfirmPassword"
                  color="medium"
                  class="password-toggle-icon"
                ></ion-icon>
              </ion-item>
            </ion-list>

            <ion-button
              expand="block"
              @click="handleRegister"
              class="ion-margin-top"
              :disabled="isLoading"
            >
              <ion-spinner v-if="isLoading" name="crescent" slot="start"></ion-spinner>
              Registrati
            </ion-button>

            <div v-if="errorMessage" class="error-message ion-text-center ion-margin-top">
              {{ errorMessage }}
            </div>
             <div v-if="successMessage" class="success-message ion-text-center ion-margin-top">
              {{ successMessage }}
            </div>

            <div class="ion-text-center ion-margin-top">
              <ion-text color="medium">
                Hai già un account?
                <router-link to="/login" class="login-link">Accedi</router-link>
              </ion-text>
            </div>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonInput,
  IonButton, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonIcon, IonText,
  IonButtons, IonBackButton, IonSpinner, toastController
} from '@ionic/vue';
import { personCircleOutline, mailOutline, lockClosedOutline, eyeOutline, eyeOffOutline } from 'ionicons/icons';

console.log('RegisterPage.vue: Script setup');

const router = useRouter();
const authStore = useAuthStore();

const userData = ref({
  nome: '',
  cognome: '',
  email: '',
  password: '',
  confirmPassword: ''
});
const errorMessage = ref('');
const successMessage = ref(''); // Not strictly needed if using toasts for success
const isLoading = ref(false);
const showPassword = ref(false);
const showConfirmPassword = ref(false);

onMounted(() => {
  console.log('RegisterPage.vue: Component mounted');
});

const toggleShowPassword = () => {
  showPassword.value = !showPassword.value;
};
const toggleShowConfirmPassword = () => {
  showConfirmPassword.value = !showConfirmPassword.value;
};

const validateForm = () => {
  if (!userData.value.nome || !userData.value.email || !userData.value.password || !userData.value.confirmPassword) {
    return 'Nome, email e password (con conferma) sono obbligatori.';
  }
  if (userData.value.password !== userData.value.confirmPassword) {
    return 'Le password non coincidono.';
  }
  if (userData.value.password.length < 8) {
    // Backend ha la sua validazione, questa è una pre-validazione client-side
    return 'La password deve essere di almeno 8 caratteri.';
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(userData.value.email)) {
    return 'Formato email non valido.';
  }
  return '';
};

const handleRegister = async () => {
  console.log('RegisterPage.vue: handleRegister called');
  const validationError = validateForm();
  if (validationError) {
    errorMessage.value = validationError;
    const toast = await toastController.create({
        message: errorMessage.value,
        duration: 3000,
        color: 'warning',
        position: 'top'
    });
    await toast.present();
    return;
  }

  isLoading.value = true;
  errorMessage.value = '';
  successMessage.value = '';


  const payload: any = {
    nome: userData.value.nome,
    email: userData.value.email,
    password: userData.value.password,
  };
  if (userData.value.cognome) {
    payload.cognome = userData.value.cognome;
  }

  const result = await authStore.register(payload);

  if (!result.success) {
    errorMessage.value = result.message || `Errore: Impossibile registrarsi.`;
    const toast = await toastController.create({
      message: errorMessage.value,
      duration: 3000,
      color: 'danger',
      position: 'top'
    });
    await toast.present();
  } else {
    const toast = await toastController.create({
      message: result.message || 'Registrazione e accesso effettuati con successo!',
      duration: 2000,
      color: 'success',
      position: 'top'
    });
    await toast.present();
    console.log('RegisterPage.vue: Registration successful, redirecting...');
    userData.value = { nome: '', cognome: '', email: '', password: '', confirmPassword: '' }; // Clear form
    // Router guards will handle redirection based on role, default for new user is 'utente'
    router.replace('/tabs/mappa');
  }
  isLoading.value = false;
};
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  padding: 16px;
}
.register-card {
  width: 100%;
  max-width: 450px;
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
.success-message {
  color: var(--ion-color-success);
  font-size: 0.9em;
}
.login-link {
  color: var(--ion-color-primary);
  text-decoration: none;
  font-weight: 500;
}
.login-link:hover {
  text-decoration: underline;
}
.password-toggle-icon {
  cursor: pointer;
  font-size: 1.2em;
}
</style>