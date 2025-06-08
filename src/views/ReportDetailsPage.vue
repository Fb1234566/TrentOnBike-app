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
      <!-- Indicatore di caricamento -->
      <div v-if="!dettagli" class="loading-indicator">
        <ion-spinner></ion-spinner>
        <p>Caricamento dettagli in corso...</p>
      </div>

      <!-- Contenuto della segnalazione -->
      <div v-else>
        <ion-card>
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
        <ion-card>
          <ion-card-content>
            <!-- Stato attuale della segnalazione -->
            <p>
              <strong>Stato Attuale:</strong>
              <span>{{ getStatoIcona(dettagli.stato) }} {{ dettagli.stato.replace('_', ' ') }}</span>
            </p>
            <!-- Dropdown per cambio stato -->
            <ion-item>
              <ion-label>Nuovo Stato:</ion-label>
              <ion-select v-model="nuovoStato" placeholder="Seleziona stato">
                <ion-select-option v-for="stato in statiPossibili" :key="stato" :value="stato">
                  {{ stato.replace('_', ' ') }}
                </ion-select-option>
              </ion-select>
            </ion-item>

            <!-- Pulsante Cambia Stato -->
            <ion-button expand="block" :disabled="!nuovoStato || nuovoStato === dettagli.stato" @click="cambiaStato">
              Cambia Stato
            </ion-button>
          </ion-card-content>
        </ion-card>

        <!-- Sezione commento dell'operatore -->
        <ion-card>
          <ion-card-content>
            <p><strong>Commento:</strong></p>
            <p v-if="!inModificaCommento">{{ dettagli.commento || 'Nessun commento' }}</p>
            <ion-textarea
                v-if="inModificaCommento"
                v-model="modificaCommento"
                placeholder="Scrivi un commento..."
            ></ion-textarea>

            <div class="button-row">
              <ion-button expand="block" v-if="!inModificaCommento" @click="attivaModificaCommento">
                Modifica Commento
              </ion-button>
              <ion-button expand="block" v-if="inModificaCommento" @click="confermaModificaCommento" :disabled="modificaCommento.trim() === dettagli.commento">
                Conferma
              </ion-button>
              <ion-button expand="block" v-if="inModificaCommento" @click="annullaModificaCommento">
                Annulla
              </ion-button>
              <ion-button expand="block" v-if="!inModificaCommento && dettagli.commento" color="danger" @click="richiediRimozioneCommento">
                Rimuovi Commento
              </ion-button>
            </div>
          </ion-card-content>
        </ion-card>


        <!-- Pulsante Segna come Letta -->
        <ion-footer>
          <ion-toolbar>
            <ion-button expand="block" :disabled="dettagli?.lettaDalComune" @click="segnaComeLetta">
              Segna come Letta
            </ion-button>
          </ion-toolbar>
        </ion-footer>
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
  IonButtons,
  IonBackButton,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonFooter,
  IonButton,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonTextarea,
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
const statiPossibili = ['DA_VERIFICARE', 'ATTIVA', 'RISOLTA', 'SCARTATA']; // Lista stati possibili
const nuovoStato = ref<string | null>(null); // Stato selezionato dall'utente
const inModificaCommento = ref(false); // Flag per modifica del commento
const modificaCommento = ref(''); // Contiene il commento durante la modifica

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
    // Inizializza il testo del commento di modifica
    modificaCommento.value = dettagli.value?.commento || '';
    // Controlla se le coordinate della segnalazione sono valide
    if (
        dettagli.value?.posizione?.coordinates &&
        Array.isArray(dettagli.value.posizione.coordinates) &&
        dettagli.value.posizione.coordinates.length === 2
    ) {
      const [lng, lat] = dettagli.value.posizione.coordinates;
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
 * Cambia lo stato della segnalazione, chiamando un API nel backend per l'aggiornamento.
 */
const cambiaStato = async () => {
  try {
    if (!nuovoStato.value || nuovoStato.value === dettagli.value.stato) return;
    await API.cambiaStatoSegnalazione(dettagli.value._id, nuovoStato.value); // Chiama l'API per il cambio stato
    dettagli.value.stato = nuovoStato.value; // Aggiorna lo stato visualizzato
    nuovoStato.value = null; // Resetta il dropdown
    alert('Stato aggiornato con successo');
  } catch (error) {
    console.error('Errore durante il cambio dello stato:', error);
    alert('Errore durante il cambio dello stato.');
  }
};

/**
 * Aggiorna il commento della segnalazione
 */
const attivaModificaCommento = () => {
  modificaCommento.value = dettagli.value.commento || '';
  inModificaCommento.value = true;
};
const annullaModificaCommento = () => {
  modificaCommento.value = dettagli.value.commento || '';
  inModificaCommento.value = false;
};
const confermaModificaCommento = async () => {
  try{
    // Garantisce che il valore commento da inviare sia una stringa valida
    const nuovoCommento = typeof modificaCommento.value === 'string' ? modificaCommento.value.trim() : '';

    // Controlliamo che il commento effettivamente cambi
    if (nuovoCommento === dettagli.value.commento) {
      alert('Nessuna modifica al commento.');
      return;
    }

    // Effettuare la chiamata all'API con il valore corretto
    await API.aggiornaCommentoSegnalazione(dettagli.value._id, nuovoCommento);

    dettagli.value.commento = nuovoCommento;
    alert('Commento aggiornato con successo');
  } catch (error) {
    console.error('Errore durante la modifica del commento:', error);
    alert('Errore durante la modifica del commento.');
  } finally {
    inModificaCommento.value = false;
  }
};
const richiediRimozioneCommento = () => {
  const conferma = confirm('Sei sicuro di voler rimuovere il commento?');
  if (conferma) {
    rimuoviCommento();
  }
};
const rimuoviCommento = async () => {
  await API.aggiornaCommentoSegnalazione(dettagli.value._id, '');
  dettagli.value.commento = '';
  alert('Commento rimosso con successo');
};

/**
 * Segna la segnalazione come "letta"
 */
const segnaComeLetta = async () => {
  try {
    await API.segnaSegnalazioneComeLetta(dettagli.value._id);
    dettagli.value.lettaDalComune = true;
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
.loading-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
}
.loading-indicator p {
  margin-top: 10px;
  font-size: 1.2rem;
  color: #888;
}
.button-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
</style>
