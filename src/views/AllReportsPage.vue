<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Segnalazioni</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <div class="container">
        <!-- Contenitore della mappa -->
        <div id="mappaWrapper">
          <div id="allReportsMap"></div>
        </div>

        <!-- Lista delle segnalazioni -->
        <div class="listaWrapper">
          <ion-list>
            <ion-item
                v-for="segnalazione in segnalazioni"
                :key="segnalazione._id"
                :color="segnalazione.lettaDalComune ? 'light' : 'primary'"
                @click="apriSegnalazione(segnalazione)"
            >
              <ion-label>
                <h2>{{ segnalazione.categoria.replaceAll('_', ' ') }}</h2>
                <p><strong>Posizione:</strong> {{ segnalazione.posizione.via || 'Via sconosciuta' }}</p>
                <p><strong>Creata il:</strong> {{ formattaData(segnalazione.creataIl) }}</p>
                <!-- Stato con icona -->
                <p>
                  <strong>Stato:</strong>
                  <span>{{ getStatoIcona(segnalazione.stato) }} {{ segnalazione.stato.replace('_', ' ') }}</span>
                </p>
              </ion-label>
              <!-- Stato lettura allineato a destra -->
              <ion-label slot="end" class="stato-lettura">
                <p :class="{ 'da-leggere': !segnalazione.lettaDalComune }">
                  {{ segnalazione.lettaDalComune ? 'Letta' : 'Da leggere' }}
                </p>
              </ion-label>
            </ion-item>
          </ion-list>

          <!-- Messaggio per assenza di segnalazioni -->
          <ion-card v-if="segnalazioni.length === 0">
            <ion-card-content>
              Nessuna segnalazione trovata.
            </ion-card-content>
          </ion-card>
        </div>
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
  IonList,
  IonItem,
  IonLabel,
  IonContent,
  IonCard,
  IonCardContent,
} from '@ionic/vue';

import { computed, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { onIonViewWillEnter, onIonViewWillLeave } from '@ionic/vue';
import { useReportsStore } from '@/stores/reportsStore';
import Mappa from '@/utils/Mappa';
import mapboxgl from "mapbox-gl";

const reportsStore = useReportsStore(); // Usa lo store Pinia
const segnalazioni = computed(() => reportsStore.segnalazioni); // Reactive binding
const router = useRouter(); // Crea l'istanza del router all'interno del setup del componente
const MAP_ID = 'allReportsMap';

/**
 * Restituisce l'icona corrispondente per il dato stato.
 * @param {string} stato - Lo stato della segnalazione
 * @returns {string} L'icona corrispondente
 */
const getStatoIcona = (stato: string): string => {
  switch (stato) {
    case 'DA_VERIFICARE':
      return '🟡'; // Icona gialla per "Da verificare"
    case 'ATTIVA':
      return '🔴'; // Icona rossa per "Attiva"
    case 'RISOLTA':
      return '✅'; // Icona verde per "Risolta"
    case 'SCARTATA':
      return '❌'; // Icona per "Scartata"
    default:
      return '❓'; // Icona di default per stati sconosciuti
  }
};

/**
 * Funzione che aggiorna i marker della mappa con le posizioni delle segnalazioni e con bounds
 */
const aggiornaMarkers = async () => {
  try {
    // Crea un bound per le posizioni delle segnalazioni
    const bounds = new mapboxgl.LngLatBounds();
    Mappa.clearSegnalazioniMarkers(MAP_ID); // Cancella i marker esistenti della mappa

    for (const segnalazione of segnalazioni.value) {
      if (
          segnalazione?.posizione?.coordinates &&
          Array.isArray(segnalazione.posizione.coordinates) &&
          segnalazione.posizione.coordinates.length === 2
      ) {
        const [lng, lat] = segnalazione.posizione.coordinates;
        bounds.extend([lng, lat]); // Aggiunge la posizione al bound
        await Mappa.addSegnalazioniMarker(MAP_ID, [lng, lat]); // Aggiunge un marker rosso alla mappa
      } else {
        console.warn(
            `Segnalazione con ID ${segnalazione._id} ha coordinate non valide.`
        );
      }
    }
    Mappa.getMap(MAP_ID)?.fitBounds(bounds, { padding: 50 }); // Applica il bound per adattare la mappa
    //Mappa.getMap(MAP_ID).resize();
  } catch (error) {
    console.error('Errore durante l\'aggiornamento dei marker:', error);
  }
}

/**
 * Crea la mappa e visualizza i marker per tutte le segnalazioni.
 */
const initMappa = async () => {
  try {
    const posizioneStandard: [number, number] = [11.121749, 46.074779]; // Posizione di default: Trento
    await nextTick();
    if(!Mappa.getMap(MAP_ID)){
      await Mappa.create(MAP_ID, 'allReportsMap', posizioneStandard); // Inizializza la mappa senza bounds
    }
    Mappa.getMap(MAP_ID).resize(); // Ricorda: resize deve essere chiamato solo quando il container è completamente visibile
    await aggiornaMarkers(); // Aggiunge i marker alla mappa
  } catch (error) {
    console.error('Errore durante l\'inizializzazione della mappa:', error);
  }
};

/**
 * Formatta una data ISO in un formato leggibile
 * @param {string} dateStr - Stringa ISO della data
 * @returns {string} Data formattata
 */
const formattaData = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' });
};

/**
 * Naviga alla pagina dei dettagli di una segnalazione.
 * @param segnalazione - I dati della segnalazione
 */
const apriSegnalazione = (segnalazione: any) => {
  console.log('Naviga ai dettagli della segnalazione con ID:', segnalazione._id);
  router.push(`/reports/${segnalazione._id}`); // Naviga alla route corrispondente
};

/**
 * Carica tutte le segnalazioni e inizializza la mappa quando il componente viene montato e all'entrata nella pagina
 * Aggiorna i marker della mappa a ogni intervallo
 */
let intervalId: NodeJS.Timeout;

const startInterval = () => {
  intervalId = setInterval(async () => {
    const necessitaAggiornamento = await reportsStore.verificaAggiornamento(); // Verifica se sono presenti aggiornamenti nel database
    if (necessitaAggiornamento){
      await aggiornaMarkers(); // Aggiorna i marker della mappa
    }
  }, 20000);
};

const stopInterval = () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null!;
  }
};

// All'entrata verifica se sono presenti aggiornamenti e aggiorna la mappa se necessario
onIonViewWillEnter(async () => {
  await reportsStore.verificaAggiornamento(); // Verifica se sono presenti aggiornamenti nel database
  await initMappa(); // Inizializza la mappa
  startInterval(); // fa partire il controllo automatico della lista e dei marker sulla mappa
});

// Arresta l'intervallo quando la pagina viene chiusa
onIonViewWillLeave(() => {
  stopInterval();
});
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: row;
  height: 100%;
}
#mappaWrapper {
  width: 30%; /* Occupare il 30% della larghezza */
  height: 100%; /* Riempire l'altezza */
  position: relative;
}
#allReportsMap {
  position: sticky;
  top: 0;
  width: 100%;
  height: 50vh; /* Altezza fissa per lasciare spazio in basso */
  border: 1px solid #ccc;
  border-radius: 8px;
}
.listaWrapper {
  width: 70%; /* Occupare il 70% della larghezza rimanente */
  padding: 1rem;
  overflow-y: auto; /* Aggiunge scroll verticale se necessario */
}
ion-label p strong {
  font-weight: bold; /* Grassetto per il titolo */
}

ion-label p span {
  font-style: italic; /* Corsivo per il valore dello stato */
  margin-left: 5px; /* Spazio tra "Stato:" e il valore */
}
</style>
