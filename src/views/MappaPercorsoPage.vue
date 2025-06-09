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
    <ion-content class="report-issue-content">
      <div id="percorso-map" style="width: 100%; height: 100%;"></div>
      <!-- Floating Action Button per le istruzioni -->
      <ion-fab vertical="bottom" horizontal="end" slot="fixed" v-if="istruzioni.length > 0">
        <ion-fab-button @click="toggleIstruzioni" color="primary">
          <ion-icon :icon="instructionsVisible ? closeOutline : listOutline"></ion-icon>
        </ion-fab-button>
      </ion-fab>

      <div class="istruzioni-panel" :class="{ 'visible': instructionsVisible }" v-if="istruzioni.length > 0">
        <ion-card>
          <ion-card-header>
            <ion-card-title>Indicazioni percorso</ion-card-title>
            <ion-card-subtitle>{{ distanzaTotale }} km · {{ durataPercorsoFormattata }}</ion-card-subtitle>
          </ion-card-header>
          <ion-card-content>

            <ion-list>
              <ion-item v-for="(istruzione, index) in istruzioni" :key="index">
                <ion-label style="max-width: 30px !important; text-align: center" slot="start" color="primary">{{ index + 1 }}</ion-label>
                <ion-label>
                  <h2>{{ istruzione.instruction }}</h2>
                  <p>{{ istruzione.distance }} m · {{ istruzione.duration }} min</p>
                </ion-label>
              </ion-item>
            </ion-list>
          </ion-card-content>
        </ion-card>
      </div>
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
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonFab,
  IonFabButton
} from '@ionic/vue';

import {
  listOutline,
  closeOutline,
} from 'ionicons/icons';
import Map from '@/utils/Mappa';
import {onMounted, onUnmounted, ref, computed} from "vue";
import {useRoute} from "vue-router";
import API from "@/utils/API";

// Definizione dell'interfaccia per le istruzioni
interface Istruzione {
  instruction: string;
  location: [number, number];
  distance: string;
  duration: string;
}

const route = useRoute();
const tappe = JSON.parse(route.query.tappe as string);
const percorsoData = ref(null);
const istruzioni = ref<Istruzione[]>([]);
const instructionsVisible = ref(false);
const distanzaTotale = ref('');
const durataPercorso = ref(0);

const toggleIstruzioni = () => {
  instructionsVisible.value = !instructionsVisible.value;
}

// Formatta la durata in ore e minuti
const durataPercorsoFormattata = computed(() => {
  const ore = Math.floor(durataPercorso.value / 60);
  const minuti = Math.floor(durataPercorso.value % 60);
  if (ore > 0) {
    return `${ore} h ${minuti} min`;
  }
  return `${minuti} min`;
});

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
    estraiIstruzioni(response);
  } else {
    console.warn("Nessuna tappa disponibile per disegnare il percorso.");
  }
}

const leaveMap = () => {
  Map.positionMarker.delete("percorso-map");
}

// Funzione per disegnare il percorso dai dati di navigazione
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
        'line-color': '#1fa5ff',
        'line-width': 5,
        'line-opacity': 0.75
      }
    });
  }
}

// Funzione per estrarre le istruzioni dal risultato dell'API
const estraiIstruzioni = (navData) => {
  if (navData.routes && navData.routes.length > 0) {
    const route = navData.routes[0];

    // Calcola e formatta la distanza totale
    distanzaTotale.value = (route.distance / 1000).toFixed(1);

    // Salva la durata totale
    durataPercorso.value = Math.round(route.duration / 60);

    // Estrai le istruzioni da tutte le "legs" del percorso
    const istruzioniList: Istruzione[] = [];

    if (route.legs) {
      route.legs.forEach((leg) => {
        leg.steps.forEach((step) => {
          istruzioniList.push({
            instruction: step.maneuver.instruction,
            location: step.maneuver.location,
            distance: Math.round(step.distance) + '',
            duration: Math.round(step.duration / 60) + '',
          });
        });
      });
    }

    istruzioni.value = istruzioniList;
  }
};

onMounted(initMappa);
onUnmounted(leaveMap)
</script>

<style scoped>
.istruzioni-panel {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  max-height: 50vh;
  background-color: white;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.1);
  transform: translateY(100%);
  transition: transform 0.3s ease-in-out;
  overflow-y: auto;
  z-index: 1000;
}

.istruzioni-panel.visible {
  transform: translateY(0);
}

ion-card {
  margin: 0;
  box-shadow: none;
}

ion-list {
  padding-top: 0;
  background: transparent;
}

ion-item {
  --padding-start: 8px;
  --background: transparent;
  --background-hover: var(--ion-color-light);
}

</style>