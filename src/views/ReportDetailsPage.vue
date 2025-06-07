<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Dettagli Segnalazione</ion-title>
        <ion-buttons slot="start">
          <!-- Pulsante indietro -->
          <ion-back-button @click="tornaIndietro"></ion-back-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-card v-if="dettagli">
        <!-- Categoria del problema -->
        <ion-card-header>
          <ion-card-title>Categoria: {{ dettagli.categoria }}</ion-card-title>
        </ion-card-header>

        <!-- Posizione del problema -->
        <ion-card-content>
          <p><strong>Posizione:</strong> {{ dettagli.posizione.via || 'Via non specificata' }}</p>
          <p><strong>Coordinate:</strong> {{ dettagli.posizione.coordinates.join(', ') }}</p>

          <!-- Contenitore della mappa -->
          <div id="reportDetailsMap" style="height: 300px; border: 1px solid #ccc; margin-top: 1rem;"></div>
        </ion-card-content>

        <!-- Data e Descrizione -->
        <ion-card-content>
          <p><strong>Data di creazione:</strong> {{ formattaData(dettagli.creataIl) }}</p>
          <p>
            <strong>Descrizione:</strong>
            {{ dettagli.descrizione || "Descrizione non fornita." }}
          </p>
        </ion-card-content>
      </ion-card>

      <!-- Pulsante Segna come Letta -->
      <ion-footer>
        <ion-toolbar>
          <ion-button
              expand="block"
              :disabled="dettagli?.lettaDalComune"
              @click="segnaComeLetta"
          >
            Segna come Letta
          </ion-button>
        </ion-toolbar>
      </ion-footer>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonFooter,
  IonButton,
} from '@ionic/vue';
import {ref, onMounted, nextTick} from 'vue';
import {onBeforeRouteLeave, useRoute, useRouter} from 'vue-router';
import API from '@/utils/API';
import Mappa from '@/utils/Mappa';
import { useReportsStore } from '@/stores/reportsStore';

const route = useRoute();
const router = useRouter();
const reportsStore = useReportsStore(); // Usa lo store Pinia
const dettagli = ref<any>(null);
const MAP_ID = 'reportDetailsMap';

/**
 * Formatta la data in un formato leggibile
 * @param {string} dateStr - Data ISO
 * @returns {string} Data formattata
 */
const formattaData = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' });
};

/**
 * Inizializza la mappa e centra il marker sulla posizione della segnalazione
 */
const initMappa = async (coordinates: [number, number]) => {
  try {
    await nextTick();
    // Verifica che il container esista e controlla se è nascosto o vuoto
    const container = document.getElementById('reportDetailsMap');
    if (!container) {
      console.error('Errore: Container per la mappa non trovato.');
      return;
    }
    console.log("Creo una nuova mappa per la pagina");
    await Mappa.create(MAP_ID, 'reportDetailsMap', coordinates); // crea la mappa per la pagina
    Mappa.getMap(MAP_ID).resize();
    await Mappa.addSelectedMarker(MAP_ID, coordinates); // Aggiungi il marker rosso
    await Mappa.moveToLocation(MAP_ID, coordinates); // Sposta e zooma sulla segnalazione
  } catch (error) {
    console.error("Errore durante l'inizializzazione della mappa:", error);
  }
};

/**
 * Carica i dettagli della segnalazione
 */
const caricaDettagliSegnalazione = async () => {
  try {
    const id = route.params.id as string;
    dettagli.value = await API.caricaDettaglioSegnalazione(id);
    // Controlla se le coordinate della segnalazione sono valide
    if (
        dettagli.value?.posizione?.coordinates &&
        Array.isArray(dettagli.value.posizione.coordinates) &&
        dettagli.value.posizione.coordinates.length === 2
    ) {
      const [lng, lat] = dettagli.value.posizione.coordinates;
      // Controllo della validità delle coordinate
      if (typeof lng === "number" && typeof lat === "number" && Math.abs(lng) <= 180 && Math.abs(lat) <= 90) {
        await initMappa(dettagli.value.posizione.coordinates);
      } else {
        console.error("Coordinate non valide:", dettagli.value.posizione.coordinates);
      }
    } else {
      console.error("Coordinate non valide:", dettagli.value.posizione?.coordinates);
    }
  } catch (error) {
    console.error('Errore durante il caricamento della segnalazione:', (error as Error).message);
  }
};

/**
 * Segna la segnalazione come "letta"
 */
const segnaComeLetta = async () => {
  try {
    await API.segnaSegnalazioneComeLetta(dettagli.value._id);
    dettagli.value.lettaDalComune = true;
    // Aggiorna lo store globale
    reportsStore.aggiornaSegnalazione(dettagli.value._id, { lettaDalComune: true });

  } catch (error) {
    console.error('Errore nel segnare la segnalazione come letta:', (error as Error).message);
  }
};

/**
 * Pulsante per tornare indietro
 */
const tornaIndietro = () => {
  router.back(); // Torna alla pagina precedente
};

/**
 * Hook per intercettare l'uscita dalla pagina e aggiornare store segnalazioni
 */
onBeforeRouteLeave(async (to, from, next) => {
  Mappa.getMap(MAP_ID).remove();
  // Esegui la funzione per la verifica aggiornamenti
  await reportsStore.verificaAggiornamento();
  next(); // Consenti la navigazione
});

onMounted(caricaDettagliSegnalazione);
</script>

<style scoped>
#reportDetailsMap {
  width: 100%;
  height: 300px;
  border-radius: 8px;
  border: 1px solid #eee;
}
</style>
