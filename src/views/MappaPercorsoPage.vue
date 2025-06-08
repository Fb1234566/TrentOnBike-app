<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button/>
        </ion-buttons>
        <ion-title>Mappa percorso</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" class="report-issue-content">
      <div id="percorso-map" style="width: 100%; height: 100vh;"></div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
} from '@ionic/vue';
import Map from '@/utils/Mappa';
import {onMounted, onUnmounted, ref} from "vue";
import {useRoute} from "vue-router";
import API from "@/utils/API";

const route = useRoute();
const tappe = JSON.parse(route.query.tappe as string);
// Aggiungi questa variabile per memorizzare i dati del percorso
const percorsoData = ref(null);

const initMappa = async () => {
  const posizioneUtente = await Map.getUserLocation();
  await Map.create("percorso-map", "percorso-map", posizioneUtente ?? [12.5451, 41.8988]);
  if (posizioneUtente) {
    await Map.addUserLocationMarker("percorso-map", posizioneUtente);
  }

  if (tappe && tappe.length > 0) {
    Map.addTappeMarkers("percorso-map", tappe);
    Map.getMap("percorso-map").flyTo({
      center: tappe[0].posizione,
      zoom: 15,
      essential: true
    });
    const tappeCoordinates = tappe.map((t: any) => t.posizione);
    const response = await API.getInstructions(tappeCoordinates)
    disegnaPercorso(response);
  } else {
    console.warn("Nessuna tappa disponibile per disegnare il percorso.");
  }
}

const leaveMap = () => {
  Map.positionMarker.delete("percorso-map");
}

// Aggiungi questa funzione per disegnare il percorso dai dati di navigazione
const disegnaPercorso = (navData) => {
  const mappa = Map.getMap("percorso-map");
  console.log(navData)

  if (navData.routes && navData.routes.length > 0) {
    const route = navData.routes[0];

    // Aggiungi il percorso alla mappa
    mappa.addSource('route', {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: route.geometry
      }
    });

    mappa.addLayer({
      id: 'route',
      type: 'line',
      source: 'route',
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#3887be',
        'line-width': 5,
        'line-opacity': 0.75
      }
    });
  }
}

onMounted(initMappa);
onUnmounted(leaveMap)
</script>

<style scoped>

</style>