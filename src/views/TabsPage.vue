<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet></ion-router-outlet>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="mappa" href="/tabs/mappa">
          <ion-icon aria-hidden="true" :icon="mapOutline" />
          <ion-label>Mappa</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="reportIssue" href="/tabs/report-issue">
          <ion-icon aria-hidden="true" :icon="warningOutline" />
          <ion-label>Segnala</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="statistiche" href="/tabs/statistiche">
          <ion-icon aria-hidden="true" :icon="statsChartOutline" />
          <ion-label>Statistiche</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="profilo" href="/tabs/profilo">
          <ion-icon aria-hidden="true" :icon="personCircleOutline" />
          <ion-label>Profilo</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script setup lang="ts">
import { IonTabBar, IonTabButton, IonTabs, IonLabel, IonIcon, IonPage, IonRouterOutlet } from '@ionic/vue';
import { mapOutline, statsChartOutline, personCircleOutline, warningOutline } from 'ionicons/icons';
// Rimossa homeOutline se non più usata altrove
</script>