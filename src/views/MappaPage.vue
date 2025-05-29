<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <Mappa />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/vue';
import Mappa from '@/components/Mappa.vue';
</script>
