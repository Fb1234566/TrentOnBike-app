<script setup lang="ts">
import map from '../utils/Map'
import { onMounted, ref } from 'vue';
const locationGranted = ref(true);

onMounted(async () => {
  const granted = await map.checkGeolocationPermission();
  locationGranted.value = granted;
  if (granted) {
     await map.create();
     await map.addUserLocationMarker(await map.getUserLocation());
     await map.moveToUserLocation();
     await map.startWatchingUserLocation();
  }
})

</script>

<template>
  <div v-if="locationGranted" id="mappa" style="height: 100%"></div>

  <ion-card v-if="!locationGranted" class="error-message">
    <ion-card-header>
      <ion-card-title>Permesso negato</ion-card-title>
    </ion-card-header>
    <ion-card-content>
      Permesso di geolocalizzazione negato. Impossibile visualizzare la mappa.
    </ion-card-content>
  </ion-card>

</template>

<style scoped>
.error-message {
  margin: 2rem;
  text-align: center;
}
</style>