<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button/>
        </ion-buttons>
        <ion-title>{{ percorso.nome }}</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" class="report-issue-content">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Percorso</ion-title>
        </ion-toolbar>
      </ion-header>
      <!-- Mappa -->
      <ion-card @click="goToMappaPercorso"
                style="display: flex; align-items: center; justify-content: space-between; cursor: pointer;">
        <ion-card-header style="flex: 1;">
          <ion-card-title>Visualizza su mappa</ion-card-title>
        </ion-card-header>
        <ion-icon :icon="arrowForwardOutline"
                  style="font-size: 2rem; margin-right: 8px; vertical-align: middle;"></ion-icon>
      </ion-card>
      <ion-card>
        <ion-card-header class="dettagli-percorso-header">
          <ion-card-title>{{ percorso.nome }}</ion-card-title>
          <ion-card-subtitle>{{ percorso.tipo }}</ion-card-subtitle>
        </ion-card-header>
        <ion-card-content>
          <div style="display: flex; align-items: flex-start; gap: 12px;">
            <div style="display: flex; align-items: center; gap: 4px;">
              <ion-icon :icon="flameOutline"></ion-icon>
              <ion-text>{{ percorso.difficolta }}</ion-text>
            </div>
            <div style="display: flex; align-items: center; gap: 4px;">
              <ion-icon :icon="flagOutline"></ion-icon>
              <ion-text>{{ nTappe }}</ion-text>
              <span style="font-size: 0.95em; color: var(--ion-color-medium); margin-left: 2px;">tappe</span>
            </div>
            <div style="display: flex; align-items: center; gap: 4px;">
              <ion-icon :icon="bicycleOutline"></ion-icon>
              <ion-text>{{ percorso.lunghezza }}</ion-text>
              <span style="font-size: 0.95em; color: var(--ion-color-medium); margin-left: 2px;">km</span>
            </div>
          </div>
          <div class="spacer"></div>
          <ion-text class="ion-padding-top">{{ percorso.descrizione }}</ion-text>
        </ion-card-content>
      </ion-card>
      <ion-card>
        <ion-card-header class="dettagli-percorso-header">
          <ion-card-title>Tappe</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-list style="background-color: var(--ion-card-background, #fff);">
            <ion-item
                v-for="(tappa, index) in percorso.tappe"
                :key="index"
                style="--background: var(--ion-card-background, #fff);"
                lines="none"
                class="tappa-item"
                @click="apriDettagliTappa($event, tappa) "
            >
              <div class="tappa-numero">{{ index + 1 }}</div>
              <ion-label>{{ tappa.puntoDiInteresse.nome }}</ion-label>
            </ion-item>
          </ion-list>
        </ion-card-content>
      </ion-card>
      <ion-modal :is-open="modalAperto" :backdrop-dismiss="false" @did-dismiss="modalAperto = false">
        <ion-header>
          <ion-toolbar>
            <ion-title>Dettagli Tappa</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="modalAperto = false">Chiudi</ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <ion-card>
            <ion-card-header>
              <ion-card-title>Mappa</ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <div id="tappa-map" style="height: 300px;"></div>
            </ion-card-content>
          </ion-card>
          <ion-card>
            <ion-card-header>
              <ion-card-title>Dettagli Tappa</ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <div v-if="tappaSelezionata" style="display: flex; flex-direction: column; gap: 12px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <ion-icon :icon="documentTextOutline"></ion-icon>
                  <ion-text><strong>Descrizione:</strong> {{ tappaSelezionata.descrizione }}</ion-text>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <ion-icon :icon="locationOutline"></ion-icon>
                  <ion-text><strong>Posizione:</strong> {{ tappaSelezionata.posizione?.join(', ') }}</ion-text>
                </div>
              </div>
            </ion-card-content>
          </ion-card>
          <ion-card v-if="tappaSelezionata?.puntoDiInteresse">
            <ion-card-header>
              <ion-card-title>{{ tappaSelezionata.puntoDiInteresse.nome }}</ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <div style="display: flex; flex-direction: column; gap: 12px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <ion-icon :icon="starOutline"></ion-icon>
                  <ion-text><strong>Punto di Interesse:</strong> {{ tappaSelezionata.puntoDiInteresse.nome }}</ion-text>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <ion-icon :icon="pricetagOutline"></ion-icon>
                  <ion-text><strong>Tipo:</strong> {{ tappaSelezionata.puntoDiInteresse.tipoPoi }}</ion-text>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <ion-icon :icon="documentTextOutline"></ion-icon>
                  <ion-text><strong>Descrizione POI:</strong> {{ tappaSelezionata.puntoDiInteresse.descrizione }}
                  </ion-text>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <ion-icon :icon="locationOutline"></ion-icon>
                  <ion-text><strong>Posizione POI:</strong> {{
                      tappaSelezionata.puntoDiInteresse.posizione?.join(', ')
                    }}
                  </ion-text>
                </div>
              </div>
            </ion-card-content>
          </ion-card>
        </ion-content>
      </ion-modal>
      <!-- Spaziatore invisibile -->
      <div class="spacer"></div>
    </ion-content>
  </ion-page>
</template>


<script setup lang="ts">
import Mappa from "@/utils/Mappa";

interface PuntoDiInteresse {
  nome: string;
  tipoPoi?: string;
  descrizione?: string;
  posizione?: string[];
}

interface Tappa {
  nome: string;
  descrizione?: string;
  posizione?: string[];
  puntoDiInteresse: PuntoDiInteresse;
}

interface Percorso {
  nome: string;
  tipo?: string;
  difficolta?: string;
  lunghezza?: number;
  descrizione?: string;
  tappe: Tappa[];
}

import {
  IonBackButton,
  IonButtons,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonIcon
} from '@ionic/vue';
import API from '@/utils/API';
import {onMounted, ref} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import {
  arrowForwardOutline,
  flameOutline,
  bicycleOutline,
  flagOutline,
  documentTextOutline,
  locationOutline,
  starOutline,
  pricetagOutline
} from "ionicons/icons";
import mapboxgl from "mapbox-gl";


const route = useRoute();
const id = route.params.id;
const router = useRouter();
const nTappe = ref(0);
const modalAperto = ref(false);
const percorso = ref<Percorso>({nome: '', tappe: []});
const tappaSelezionata = ref<Tappa | null>(null);

const createCircleMarker = (color: string) => {
  const el = document.createElement('div');
  el.style.width = '20px';
  el.style.height = '20px';
  el.style.borderRadius = '50%';
  el.style.backgroundColor = color;
  el.style.border = '2px solid white';
  el.style.boxShadow = '0 0 2px rgba(0,0,0,0.3)';
  return el;
};

/** Inizializza la mappa e gestisce la logica del marker */
const initPagina = async () => {
  // Assicuriamoci che id sia una stringa
  const percorsoId = Array.isArray(id) ? id[0] : id;
  percorso.value = await API.getPercorso(percorsoId) as Percorso;

  // Aggiungi controllo null
  if (percorso.value && percorso.value.tappe) {
    nTappe.value = percorso.value.tappe.length;
  }
};

const goToMappaPercorso = () => {
  if (!percorso.value) {
    console.error("Percorso non ancora caricato");
    return;
  }

  const tappeData = percorso.value.tappe || [];
  nTappe.value = tappeData.length;
  router.push({
    name: 'MappaPercorso',
    query: {tappe: JSON.stringify(tappeData)}
  });
};

const apriDettagliTappa = async (event: CustomEvent, tappa: Tappa) => {
  tappaSelezionata.value = tappa;
  console.log("Tappa selezionata:", tappa);
  modalAperto.value = true;
  await Mappa.create("tappa-map", "tappa-map");
  if (tappaSelezionata.value) {
    // Marker posizione tappa (se presente)
    if (tappaSelezionata.value.posizione && tappaSelezionata.value.posizione.length === 2) {
      const posizioneTappa = [
        Number(tappaSelezionata.value.posizione[0]),
        Number(tappaSelezionata.value.posizione[1])
      ] as [number, number]; // Cast esplicito a tupla

      new mapboxgl.Marker({
        element: createCircleMarker('green')
      })
          .setLngLat(posizioneTappa)
          .setPopup(new mapboxgl.Popup().setText(tappaSelezionata.value.puntoDiInteresse.nome))
          .addTo(Mappa.getMap("tappa-map"));

      Mappa.getMap("tappa-map").flyTo({
        center: posizioneTappa,
        zoom: 16,
        essential: true // Assicura che l'animazione sia sempre eseguita
      });
    }
  }
  // Marker posizione POI (se presente)
  if (
      tappaSelezionata.value.puntoDiInteresse &&
      tappaSelezionata.value.puntoDiInteresse.posizione &&
      tappaSelezionata.value.puntoDiInteresse.posizione.length === 2
  ) {
    const posizionePoi = [
      Number(tappaSelezionata.value.puntoDiInteresse.posizione[0]),
      Number(tappaSelezionata.value.puntoDiInteresse.posizione[1])
    ] as [number, number]; // Cast esplicito a tupla

    new mapboxgl.Marker({
      element: createCircleMarker('red')
    })
        .setLngLat(posizionePoi)
        .setPopup(new mapboxgl.Popup().setText(tappaSelezionata.value.puntoDiInteresse.nome))
        .addTo(Mappa.getMap("tappa-map"));
  }
};


onMounted(initPagina);
</script>


<style scoped>
.report-issue-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto; /* Permette lo scroll dell'intero contenuto */
}

/* Aggiusta i margini intorno ai campi ionici */
ion-item {
  margin-top: 0.5rem;
  --padding-start: 0; /* Rimuove padding laterale per un allineamento migliore */
}

.dettagli-percorso-header {
  padding-bottom: 0
}

ion-select,
ion-textarea {
  --padding-top: 10px; /* Spaziatura interna verticale */
  --padding-bottom: 10px;
}

ion-button {
  padding: 0.75rem; /* Spaziatura interna del pulsante */
}

.spacer {
  height: 15px; /* Aggiunge spazio extra scrollabile */
  background-color: transparent; /* Invisibile */
}

.tappa-item {
  display: flex;
  align-items: center;
  --background: var(--ion-card-background, #fff);
  padding-left: 0;
}

.tappa-numero {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--ion-color-primary);
  margin-right: 16px;
  min-width: 36px;
  text-align: left;
}
</style>