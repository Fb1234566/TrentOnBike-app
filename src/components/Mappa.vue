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
import SearchBarMappa from './SearchBarMappa.vue';

const locationGranted = ref(true);
const puntoSelezionato = ref(null);
const distanza = ref("km");

onMounted(async () => {
  const granted = await map.checkGeolocationPermission();
  locationGranted.value = granted;
  if (granted) {
     await map.create();
     await map.addUserLocationMarker(await map.getUserLocation());
     await map.insertPuntiDiInteresse((punto) => {
       puntoSelezionato.value = punto;
       map.returnDistanceBetweenUserAndMarker(punto.posizione).then((distanzaInMetri) => {
         distanza.value = distanzaInMetri;
         console.log(distanzaInMetri);
       });
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

// Funzione per gestire la selezione di un POI dalla barra di ricerca
const handleSelectPOI = (poi) => {
  puntoSelezionato.value = poi;
  map.returnDistanceBetweenUserAndMarker(poi.posizione).then((distanzaInMetri) => {
    distanza.value = distanzaInMetri;
    console.log(distanzaInMetri);
  });
  map.getMap().flyTo({
    center: poi.posizione,
    zoom: 16,
    essential: true
  });
}
const richiediPermessi = async () => {
  const granted = await map.checkGeolocationPermission();
  locationGranted.value = granted;
  if (granted) {
    await map.create();
    await map.addUserLocationMarker(await map.getUserLocation());
    await map.insertPuntiDiInteresse((punto) => {
      puntoSelezionato.value = punto;
      map.returnDistanceBetweenUserAndMarker(punto.posizione).then((distanzaInMetri) => {
        distanza.value = distanzaInMetri;
        console.log(distanzaInMetri);
      });
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
}
</script>distanza

<template>
  <!-- Barra di ricerca in cima alla pagina -->
  <div class="search-container" v-if="locationGranted">
    <SearchBarMappa @select-poi="handleSelectPOI" />
  </div>
  <!-- Card di errore per permessi di posizione non concessi -->
  <ion-card v-if="!locationGranted" class="error-message">
    <ion-card-header>
      <ion-card-title>Accesso alla posizione negato</ion-card-title>
      <ion-card-subtitle>La tua posizione è necessaria per utilizzare la mappa</ion-card-subtitle>
    </ion-card-header>

    <ion-card-content>
      <ion-text>
        <p>Per utilizzare questa funzionalità, devi consentire l'accesso alla tua posizione.</p>
        <p>Puoi modificare le impostazioni di autorizzazione nel tuo browser e riprovare.</p>
      </ion-text>
    </ion-card-content>
  </ion-card>

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
      <ion-card-subtitle>{{ distanza }}</ion-card-subtitle>
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

.search-container {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  max-width: 400px;
  z-index: 1000;
  padding: 0 15px;
}
</style>
