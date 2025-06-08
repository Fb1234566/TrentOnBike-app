<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet></ion-router-outlet>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="mappa" href="/tabs/mappa">
          <ion-icon aria-hidden="true" :icon="mapOutline" />
          <ion-label>Mappa</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="percorsi" href="/tabs/percorsi">
          <ion-icon aria-hidden="true" :icon="golfOutline" />
          <ion-label>Percorsi</ion-label>
        </ion-tab-button>

        <ion-tab-button @click="vaiAllaSegnalazione">
          <ion-icon aria-hidden="true" :icon="warningOutline" />
          <ion-label>{{ authStore.user?.ruolo === 'utente' ? 'Segnala' : 'Segnalazioni' }}</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="statistiche" href="/tabs/statistiche">
          <ion-icon aria-hidden="true" :icon="statsChartOutline" />
          <ion-label>Statistiche</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="profilo" href="/tabs/profilo">
          <ion-icon aria-hidden="true" :icon="personCircleOutline" />
          <ion-label>Profilo</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="settings" href="/tabs/settings">
          <ion-icon aria-hidden="true" :icon="settingsOutline" />
          <ion-label>{{ t('settingsTabLabel') }}</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script setup lang="ts">
import { IonTabBar, IonTabButton, IonTabs, IonLabel, IonIcon, IonPage, IonRouterOutlet } from '@ionic/vue';
import { mapOutline, statsChartOutline, personCircleOutline, warningOutline, settingsOutline, golfOutline } from 'ionicons/icons';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const router = useRouter();
const authStore = useAuthStore();

function vaiAllaSegnalazione() {
  if (authStore.user?.ruolo === 'utente') {
    router.push('/tabs/segnala');
  } else if (authStore.user?.ruolo === 'operatore' || authStore.user?.ruolo === 'admin') {
    router.push('/tabs/segnalazioni');
  }
}
</script>

<style scoped>
ion-tab-button {
  --padding-start: 0;
  --padding-end: 0;

}

</style>

