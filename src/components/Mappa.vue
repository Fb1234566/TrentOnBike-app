<script setup lang="ts">
import map from '@/utils/Mappa';
import {onMounted, ref} from 'vue';
import {
  bicycleOutline,
  businessOutline,
  closeOutline,
  constructOutline,
  ellipsisHorizontal,
  flashOutline,
  layersOutline,
  libraryOutline,
  schoolOutline,
  waterOutline
} from 'ionicons/icons'
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonFab,
  IonFabButton,
  IonFabList,
  IonIcon,
  IonText,
} from '@ionic/vue';
import SearchBarMappa from './SearchBarMappa.vue';
import API from '@/utils/API';

const locationGranted = ref(true);
const puntoSelezionato = ref<PuntoDiInteresse | null>(null);
const distanza = ref("km");
const filtriTipoPdiAttivi = ref<Record<string, boolean>>({
  'RASTRELLIERA': false,
  'OFFICINA': false,
  'FONTANELLA': false,
  'PUNTO_RICARICA': false,
  'MUSEO': false,
  'MONUMENTO': false,
  'LUOGO_STORICO_CULTURALE': false,
  'ALTRO': false
});

// Opzioni di filtro disponibili
const opzioniFiltroTipoPdi = [
  { id: 'RASTRELLIERA', nome: 'Rastrelliera', icon: bicycleOutline },
  { id: 'OFFICINA', nome: 'Officina', icon: constructOutline },
  { id: 'FONTANELLA', nome: 'Fontanella', icon: waterOutline },
  { id: 'PUNTO_RICARICA', nome: 'Punto di ricarica', icon: flashOutline },
  { id: 'MUSEO', nome: 'Museo', icon: schoolOutline },
  { id: 'MONUMENTO', nome: 'Monumento', icon: businessOutline },
  { id: 'LUOGO_STORICO_CULTURALE', nome: 'Luogo storico culturale', icon: libraryOutline },
  { id: 'ALTRO', nome: 'Altro', icon: ellipsisHorizontal }
];

interface OpzioneFiltro {
  id: string;
  nome: string;
  icon: string;
}

interface PuntoDiInteresse {
  nome: string;
  posizione: [number, number];
  tipoPoi?: string;
  descrizione?: string;
}

onMounted(async () => {
  const granted = await map.checkGeolocationPermission();
  locationGranted.value = granted;
  if (granted) {
     await map.create("home-map", "home-map");
    const userLocation = await map.getUserLocation();
    if (userLocation) {
      await map.addUserLocationMarker("home-map", userLocation);
    }
     await map.insertPuntiDiInteresse("home-map", (punto) => {
       puntoSelezionato.value = punto;
       map.returnDistanceBetweenUserAndMarker(punto.posizione).then((distanzaInMetri) => {
         distanza.value = distanzaInMetri;
         console.log(distanzaInMetri);
       });
       map.getMap("home-map").flyTo({
         center: punto.posizione,
         zoom: 16,
         essential: true // Questo assicura che l'animazione sia sempre eseguita
       });
       console.log(punto)
     });
     await map.moveToUserLocation("home-map");
     await map.startWatchingUserLocation("home-map", );

  }
})

// Funzione per chiudere la card
const chiudiCard = () => {
  puntoSelezionato.value = null;
}

// Funzione per gestire la selezione di un POI dalla barra di ricerca
const handleSelectPOI = (poi: PuntoDiInteresse) => {
  puntoSelezionato.value = poi;
  map.returnDistanceBetweenUserAndMarker(poi.posizione).then((distanzaInMetri) => {
    distanza.value = distanzaInMetri;
    console.log(distanzaInMetri);
  });
  map.getMap("home-map").flyTo({
    center: poi.posizione,
    zoom: 16,
    essential: true
  });
}

const applicaFiltroTipoPdi = async (filtro: OpzioneFiltro) => {
  filtriTipoPdiAttivi.value[filtro.id] = !filtriTipoPdiAttivi.value[filtro.id];
  const listFiltri = Object.keys(filtriTipoPdiAttivi.value).filter(key => filtriTipoPdiAttivi.value[key]);
  console.log("Filtri attivi:", listFiltri);
  map.puntiDiInteresse = await API.getPuntiDiInteresse({
    tipoPoi: listFiltri
  });
  await map.removePuntiDiInteresseMarkers("home-map");
  await map.insertPuntiDiInteresse("home-map", (punto) => {
    puntoSelezionato.value = punto;
    map.returnDistanceBetweenUserAndMarker(punto.posizione).then((distanzaInMetri) => {
      distanza.value = distanzaInMetri;
      console.log(distanzaInMetri);
    });
    map.getMap("home-map").flyTo({
      center: punto.posizione,
      zoom: 16,
      essential: true // Questo assicura che l'animazione sia sempre eseguita
    });
    console.log(punto)
  });
  // Qui puoi aggiungere la logica per filtrare i punti sulla mappa
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

  <div v-if="locationGranted" id="home-map" style="height: 100%"></div>
  <!-- Floating button per i filtri -->
  <ion-fab vertical="bottom" horizontal="end" slot="fixed" v-if="!puntoSelezionato">
    <ion-fab-button>
      <ion-icon :icon="layersOutline"></ion-icon>
    </ion-fab-button>
    <ion-fab-list side="top">
      <div v-for="filtro in opzioniFiltroTipoPdi" :key="filtro.id" class="fab-button-container">
        <div :class="{'fab-label-active': filtriTipoPdiAttivi[filtro.id]}" class="fab-label">{{ filtro.nome }}</div>
        <ion-fab-button
            @click="applicaFiltroTipoPdi(filtro)"
            :class="{ 'filtro-attivo': filtriTipoPdiAttivi[filtro.id] }">
          <ion-icon :icon="filtro.icon"></ion-icon>
        </ion-fab-button>
      </div>
    </ion-fab-list>
  </ion-fab>
  <!-- Dettagli del marker selezionato -->
  <ion-card v-if="puntoSelezionato"
            style="position: fixed; bottom: 0; left: 0; width: 100%; margin: 0;
                  max-height: 200px; z-index: 1000; overflow-y: auto; border-radius: 0;">
    <ion-card-header>
      <ion-button fill="clear" size="large" @click="chiudiCard"
                  style="position: absolute; top: 5px; right: 5px;">
        <ion-icon aria-hidden="true" :icon="closeOutline" />
      </ion-button>
      <ion-card-title>{{ puntoSelezionato?.nome }}</ion-card-title>
      <ion-card-subtitle>{{ distanza }}</ion-card-subtitle>
      <ion-card-subtitle v-if="puntoSelezionato?.tipoPoi">{{ puntoSelezionato?.tipoPoi }}</ion-card-subtitle>
    </ion-card-header>

    <ion-card-content>
      <ion-text>{{ puntoSelezionato?.descrizione }}</ion-text>
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

.filtro-attivo {
  --background: #0080ff; /* Colore azzurro */
  --color: white;
}

.fab-button-container {
  display: flex;
  align-items: center;
  margin: 5px 0;
  position: relative;
}

.fab-label {
  position: absolute;
  right: 100%;
  background-color: #222428;
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  margin-right: 10px;
  font-size: 14px;
  white-space: nowrap;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  z-index: -1;
  animation: slideIn 0.3s ease-out;
}

.fab-label-active {
  background-color: #0080ff;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>
