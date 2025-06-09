<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Segnalazioni</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <div class="container">
        <!-- Colonna sinistra: mappa + filtri -->
        <div id="leftColumn">
          <!-- Contenitore della mappa -->
          <div id="mappaWrapper">
            <div id="allReportsMap"></div>
          </div>

          <!-- Filtri sotto la mappa -->
          <div class="filters-container">
            <h2>Filtri ordinamento e limite</h2>
            <div class="wrap-group">
              <!-- Categoria -->
              <ion-card class="filtro-card">
                <ion-card-header>
                  <ion-card-title>Categoria</ion-card-title>
                </ion-card-header>
                <ion-card-content>
                  <ion-item-group>
                    <ion-item v-for="categoria in categorieDisponibili" :key="categoria">
                      <ion-checkbox
                          :value="categoria"
                          :checked="filters.categorie.includes(categoria)"
                          @ionChange="toggleFiltro('categorie', categoria)"
                          v-bind="{ slot: 'start' }"
                      />
                      <ion-label class="checkbox-label">{{ categoria.replaceAll('_', ' ') }}</ion-label>
                    </ion-item>
                  </ion-item-group>
                </ion-card-content>
              </ion-card>
              <!-- Stato -->
              <ion-card class="filtro-card">
                <ion-card-header>
                  <ion-card-title>Stato</ion-card-title>
                </ion-card-header>
                <ion-card-content>
                  <ion-item-group>
                    <ion-item v-for="stato in statiDisponibili" :key="stato">
                      <ion-checkbox
                          :value="stato"
                          :checked="filters.stati.includes(stato)"
                          @ionChange="toggleFiltro('stati', stato)"
                          v-bind="{ slot: 'start' }"
                      />
                      <ion-label class="checkbox-label">{{ stato.replaceAll('_', ' ') }}</ion-label>
                    </ion-item>
                  </ion-item-group>
                </ion-card-content>
              </ion-card>
            </div>
            <div class="wrap-group">
              <!-- LettaDalComune con selezione a tendina -->
              <ion-card class="letta-select">
                <ion-select
                    v-model="filters.lettaDalComune"
                    placeholder="Lette e non lette"
                    @ionChange="applicaFiltri"
                >
                  <ion-select-option value="undefined">Lette e non lette</ion-select-option>
                  <ion-select-option value="true">Solo lette</ion-select-option>
                  <ion-select-option value="false">Solo non lette</ion-select-option>
                </ion-select>
              </ion-card>
            </div>
            <div class="wrap-group">
              <!-- Ordinamento -->
              <ion-card class="filtro-card">
                <ion-card-header>
                  <ion-card-title>Ordinamento</ion-card-title>
                </ion-card-header>
                <ion-card-content>
                  <ion-select v-model="filters.ordine" @ionChange="applicaFiltri" interface="popover">
                    <ion-select-option value="creataIl">Data</ion-select-option>
                    <ion-select-option value="categoria">Categoria</ion-select-option>
                    <ion-select-option value="stato">Stato</ion-select-option>
                    <ion-select-option value="ultimaModificaIl">Ultima modifica</ion-select-option>
                  </ion-select>
                  <ion-select v-model="filters.direzione" @ionChange="applicaFiltri" interface="popover">
                    <ion-select-option value="desc">Discendente</ion-select-option>
                    <ion-select-option value="asc">Ascendente</ion-select-option>
                  </ion-select>
                </ion-card-content>
              </ion-card>
              <!-- limite -->
              <ion-card class="filtro-card">
                <ion-card-header>
                  <ion-card-title>Limite risultati</ion-card-title>
                </ion-card-header>
                <ion-card-content>
                  <ion-item>
                    <ion-input type="number" v-model.number="filters.limit" min="1" @change="applicaFiltri"></ion-input>
                  </ion-item>
                </ion-card-content>
              </ion-card>
            </div>
          </div>

          <!-- Filtri avanzati -->
          <div class="filtri-avanzati-container">
            <h3>Filtri avanzati</h3>
            <div class="wrap-group">
              <!-- Range temporale -->
              <ion-card class="filtro-card">
                <ion-card-header>
                  <ion-card-title>Intervallo di date</ion-card-title>
                </ion-card-header>
                <ion-card-content>
                  <div class="date-filter">
                    <label class="date-label">
                      <ion-checkbox v-model="filtriAvanzati.usaDataInizio" />
                      <span>Dal</span>
                    </label>
                    <ion-datetime
                        presentation="date"
                        display-format="DD/MM/YYYY"
                        :value="filtriAvanzati.dataInizio"
                        @ionChange="onDataInizioChange"
                    />
                  </div>
                  <div class="date-filter">
                    <label class="date-label">
                      <ion-checkbox v-model="filtriAvanzati.usaDataFine" />
                      <span>Al</span>
                    </label>
                    <ion-datetime
                        presentation="date"
                        display-format="DD/MM/YYYY"
                        :value="filtriAvanzati.dataFine"
                        @ionChange="onDataFineChange"
                    />
                  </div>
                </ion-card-content>
              </ion-card>
              <!-- Filtro spaziale placeholder (in futuro) -->
              <ion-card class="filtro-card filtro-spaziale-placeholder">
                <ion-card-header>
                  <ion-card-title>Filtro spaziale</ion-card-title>
                </ion-card-header>
                <ion-card-content>
                  <p>In sviluppo...</p>
                </ion-card-content>
              </ion-card>
            </div>
            <div class="wrap-group">
              <ion-button @click="applicaFiltriAvanzati">Applica filtri avanzati</ion-button>
              <ion-button color="medium" @click="resetFiltriAvanzati">Reset filtri avanzati</ion-button>
            </div>
          </div>

          <div class="reset-container">
            <div class="wrap-group reset-group">
              <ion-button @click="resetFiltri">Reset</ion-button>
            </div>
          </div>
        </div>

        <!-- Colonna destra: lista delle segnalazioni -->
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
  IonCardHeader,
  IonCardTitle,
  IonButton,
  IonSelect,
  IonSelectOption,
  IonInput,
  IonCheckbox,
  IonItemGroup,
  IonDatetime,
  toastController,
} from '@ionic/vue';

import { computed, nextTick, onMounted, watch, reactive } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useReportsStore } from '@/stores/reportsStore';
import Mappa from '@/utils/Mappa';
import mapboxgl from "mapbox-gl";

const route = useRoute();
const reportsStore = useReportsStore(); // Usa lo store Pinia
const segnalazioni = computed(() => reportsStore.segnalazioni); // Reactive binding
const router = useRouter(); // Crea l'istanza del router all'interno del setup del componente
const MAP_ID = 'allReportsMap';
const statiDisponibili = ['DA_VERIFICARE', 'ATTIVA', 'RISOLTA', 'SCARTATA'];
const categorieDisponibili = ['OSTACOLO', 'ILLUMINAZIONE_INSUFFICIENTE', 'PISTA_DANNEGGIATA', 'SEGNALAZIONE_STRADALE_MANCANTE', 'ALTRO'];
const filters = computed(() => reportsStore.filtri);
const filtriAvanzati = reactive({
  dataInizio: '',
  dataFine: '',
  usaDataInizio: false,
  usaDataFine: false,
});

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
    Mappa.getMap(MAP_ID)?.fitBounds(bounds, { padding: 50, maxZoom: 16 }); // Applica il bound per adattare la mappa
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
    if(!Mappa.getMap(MAP_ID)){
      await Mappa.create(MAP_ID, 'allReportsMap', posizioneStandard); // Inizializza la mappa senza bounds
    }
    Mappa.getMap(MAP_ID).resize(); // resize deve essere chiamato solo quando il container è completamente visibile
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
  if (!dateStr) return 'Data sconosciuta'
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? 'Data non valida'
      : date.toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' });
};

const applicaFiltri = async () => {
  const limitCorretto = filters.value.limit < 1 ? 1 : filters.value.limit;
  reportsStore.setFiltri({
    stati: filters.value.stati,
    categorie: filters.value.categorie,
    daData: filters.value.daData,
    aData: filters.value.aData,
    ordine: filters.value.ordine,
    direzione: filters.value.direzione,
    limit: limitCorretto,
    lettaDalComune: filters.value.lettaDalComune === 'undefined' ? undefined : filters.value.lettaDalComune,
  });
  await reportsStore.caricaSegnalazioniConFiltri();
  await aggiornaMarkers();
  console.log("Filtri applicati");
}

const toggleFiltro = (campo: 'stati' | 'categorie', value: string) => {
  const array = [...filters.value[campo]];
  const index = array.indexOf(value);
  if (index > -1) {
    array.splice(index, 1);
  } else {
    array.push(value);
  }
  reportsStore.setFiltri({ [campo]: array });
  applicaFiltri();
};

const resetFiltri = async () => {
  reportsStore.resetFiltri();
  filtriAvanzati.dataInizio = '';
  filtriAvanzati.dataFine = '';
  filtriAvanzati.usaDataInizio = false;
  filtriAvanzati.usaDataFine = false;
  console.log("Filtri ripristinati ai valori iniziali");
  const toast = await toastController.create({
    message: 'Filtri ripristinati ai valori iniziali',
    duration: 2000,
    color: 'success',
    position: 'top'
  })
  await toast.present();
  await reportsStore.caricaSegnalazioniConFiltri();
  await aggiornaMarkers();
};

const applicaFiltriAvanzati = async () => {
  try {
    if (filtriAvanzati.usaDataInizio && filtriAvanzati.usaDataFine &&
        new Date(filtriAvanzati.dataInizio) > new Date(filtriAvanzati.dataFine)) {
      const toast = await toastController.create({
        message: 'La data di inizio non può essere successiva alla data di fine!',
        duration: 2000,
        color: "warning",
        position: 'top'
      });
      await toast.present();
      return;
    }
    if (filtriAvanzati.usaDataInizio){
      // Imposta l'ora di daData alle 00:00:00.000
      const inizio = new Date(filtriAvanzati.dataInizio);
      inizio.setHours(0, 0, 0, 0);
      filters.value.daData = inizio.toISOString();
    } else {
      filters.value.daData = '';
    }
    if (filtriAvanzati.usaDataFine){
      // Imposta l'ora di aData alle 23:59:59.999
      const fine = new Date(filtriAvanzati.dataFine);
      fine.setHours(23, 59, 59, 999);
      filters.value.aData = fine.toISOString();
    } else {
      filters.value.aData = '';
    }
    await applicaFiltri();
    const toast = await toastController.create({
      message: 'Filtri avanzati applicati!',
      duration: 2000,
      color: 'success',
      position: 'top'
    });
    await toast.present()
  } catch (error) {
    console.error("Errore durante l'applicazione dei filtri avanzati", error);
    const toast = await toastController.create({
      message: 'Filtri avanzati applicati!',
      duration: 2000,
      color: 'danger',
      position: 'top'
    });
    await toast.present()
  }
};

const onDataInizioChange = (e: CustomEvent) => {
  if (e.detail?.value) {
    filtriAvanzati.dataInizio = e.detail.value;
  }
};

const onDataFineChange = (e: CustomEvent) => {
  if (e.detail?.value) {
    filtriAvanzati.dataFine = e.detail.value;
  }
};

const resetFiltriAvanzati = () => {
  filtriAvanzati.dataInizio = ''
  filtriAvanzati.dataFine = ''
  filtriAvanzati.usaDataInizio = false;
  filtriAvanzati.usaDataFine = false;
  applicaFiltriAvanzati();
};

/**
 * Naviga alla pagina dei dettagli di una segnalazione.
 * @param segnalazione - I dati della segnalazione
 */
const apriSegnalazione = (segnalazione: any) => {
  console.log('Naviga ai dettagli della segnalazione con ID:', segnalazione._id);
  router.push(`/tabs/segnalazioni/${segnalazione._id}`); // Naviga alla route corrispondente
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

onMounted(async () => {
  console.log("onMounted AllReportsPage");
  await reportsStore.caricaSegnalazioniConFiltri(); // Verifica se sono presenti aggiornamenti nel database
  await initMappa(); // Inizializza la mappa
  startInterval(); // fa partire il controllo automatico della lista e dei marker sulla mappa
});

// Effettuo operazioni all'entrata e uscita dalla pagina
watch(
    () => route.fullPath,
    async (newPath, oldPath) => {
      if (newPath === '/tabs/segnalazioni' || newPath === '/reports') {
        console.log("entrato in AllReportsPage");
        const mappaDaAggiornare = await reportsStore.verificaAggiornamento();
        if (mappaDaAggiornare) {
          await aggiornaMarkers();
        }
        startInterval();
      } else if (oldPath === '/tabs/segnalazioni' || oldPath === '/reports') {
        console.log("uscito da AllReportsPage");
        stopInterval();
      }
    }
);
</script>

<style scoped>
ion-content {
  --overflow: hidden;
}
.container {
  display: flex;
  flex-direction: row; /* da column a row */
  height: 100%;
}
#leftColumn {
  padding: 1rem;
  width: 50%;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  height: initial;
}
#mappaWrapper {
  flex-shrink: 0;
  height: 50vh;
}
.filters-container {
  flex-grow: 1;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  padding: 1rem;
  gap: 10px;
  background-color: #f5f5f5;
}
.wrap-group {
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  align-items: stretch;
  gap: 10px;
  width: 100%;
}
.checkbox-label {
  font-size: 0.8rem;
  margin-left: 8px;
  text-align: left;
}
.reset-group {
  justify-content: flex-start;
  padding-top: 10px;
}
.listaWrapper {
  width: 50%; /* Occupare il 50% della larghezza rimanente */
  padding: 1rem;
  overflow-y: auto; /* Aggiunge scroll verticale se necessari */
  height: initial;
}
#mappaWrapper {
  flex-shrink: 0;
  height: 50vh;
}
#allReportsMap {
  width: 100%;
  height: 50vh; /* Altezza fissa per lasciare spazio in basso */
  border: 1px solid #ccc;
  border-radius: 8px;
}
.filtro-card {
  margin: 10px 0;
  min-width: 250px;
  flex: 1 1 300px;
}
ion-item {
  --padding-start: 10px;
  --inner-padding-end: 10px;
  font-size: 0.9rem;
}
ion-label h2 {
  font-size: 1rem;
  font-weight: bold;
  margin-bottom: 0.3rem;
}
ion-label p {
  margin: 0;
  font-size: 0.85rem;
}
ion-label p strong {
  font-weight: bold; /* Grassetto per il titolo */
}
ion-label p span {
  font-style: italic; /* Corsivo per il valore dello stato */
  margin-left: 5px; /* Spazio tra "Stato:" e il valore */
}
.stato-lettura {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
ion-card.letta-select {
  display: flex;
  align-content: center;
  padding-left: 20px;
  width: 100%;
}
ion-checkbox {
  margin-right: 4px;
}
.filtri-avanzati-container {
  width: 100%;
  background-color: #eaeaea;
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
}
.filtro-spaziale-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 120px;
}
.filtri-avanzati-container h3 {
  margin-bottom: 1rem;
  font-size: 1.2rem;
  color: #333;
}
ion-datetime {
  font-size: 1rem;
}
.date-filter {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 12px;
}

.date-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1rem;
  margin-bottom: 4px;
}
.date-filter ion-datetime {
  margin-top: 2px; /* Riduce lo spazio sopra il datetime */
  margin-bottom: 2px;
}
</style>
