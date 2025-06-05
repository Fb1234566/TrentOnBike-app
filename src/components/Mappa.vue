<script setup lang="ts">
import map from '../utils/Map'
import { onMounted, ref } from 'vue';
import { closeOutline } from 'ionicons/icons'
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonText,
  IonButton,
  IonIcon
} from '@ionic/vue';
const locationGranted = ref(true);
const puntoSelezionato = ref(null);

onMounted(async () => {
  const granted = await map.checkGeolocationPermission();
  locationGranted.value = granted;
  if (granted) {
     await map.create();
     await map.addUserLocationMarker(await map.getUserLocation());
     await map.insertPuntiDiInteresse((punto) => {
       puntoSelezionato.value = punto;
       map.getMap().flyTo({
         center: punto.posizione,
         zoom: 16,
         essential: true // Questo assicura che l'animazione sia sempre eseguita
       });
       console.log(punto)
     });
     await map.moveToUserLocation();
     await map.startWatchingUserLocation();

  }
})

// Funzione per chiudere la card
const chiudiCard = () => {
  puntoSelezionato.value = null;
}

</script>

<template>
  <div v-if="locationGranted" id="mappa" style="height: 100%"></div>
  <!-- Dettagli del marker selezionato -->
  <ion-card v-if="puntoSelezionato"
            style="position: fixed; bottom: 0; left: 0; width: 100%; margin: 0;
                  max-height: 200px; z-index: 1000; overflow-y: auto; border-radius: 0;">
    <ion-card-header>
      <ion-button fill="clear" size="small" @click="chiudiCard"
                  style="position: absolute; top: 5px; right: 5px;">
        <ion-icon aria-hidden="true" :icon="closeOutline" />
      </ion-button>
      <ion-card-title>{{ puntoSelezionato.nome }}</ion-card-title>
      <ion-card-subtitle v-if="puntoSelezionato.tipoPoi">{{ puntoSelezionato.tipoPoi }}</ion-card-subtitle>
    </ion-card-header>

    <ion-card-content>
      <ion-text>{{ puntoSelezionato.descrizione }}</ion-text>
    </ion-card-content>
  </ion-card>


</template>

<style scoped>
.error-message {
  margin: 2rem;
  text-align: center;
}
</style>Quand