<template>
  <div class="ion-padding">
    <ion-card>
      <ion-card-header>
        <ion-card-title>Statistiche Frequentazione Vie</ion-card-title>
      </ion-card-header>
      <ion-card-content>
        <ion-grid>
          <ion-row>
            <ion-col size="12" size-md="4">
              <ion-item>
                <ion-label position="stacked">Nome Via (opzionale)</ion-label>
                <ion-input v-model="filtri.nomeVia" placeholder="Es. via roma"></ion-input>
              </ion-item>
            </ion-col>
            <ion-col size="12" size-md="3">
              <ion-item>
                <ion-label position="stacked">Da Data</ion-label>
                <ion-input type="datetime-local" v-model="filtri.dataInizio"></ion-input>
              </ion-item>
            </ion-col>
            <ion-col size="12" size-md="3">
              <ion-item>
                <ion-label position="stacked">A Data</ion-label>
                <ion-input type="datetime-local" v-model="filtri.dataFine"></ion-input>
              </ion-item>
            </ion-col>
             <ion-col size="12" size-md="2">
              <ion-item>
                <ion-label position="stacked">Raggruppa</ion-label>
                 <ion-select v-model="filtri.groupBy" interface="popover">
                    <ion-select-option value="ora">Ora</ion-select-option>
                    <ion-select-option value="giorno">Giorno</ion-select-option>
                    <ion-select-option value="settimana">Settimana</ion-select-option>
                    <ion-select-option value="mese">Mese</ion-select-option>
                    <ion-select-option value="via">Per Via</ion-select-option>
                </ion-select>
              </ion-item>
            </ion-col>
          </ion-row>
          <ion-row>
            <ion-col size="12" size-md="3">
              <ion-item>
                <ion-label position="stacked">Ordina per</ion-label>
                <ion-select v-model="filtri.sortBy" interface="popover">
                  <ion-select-option value="conteggio">Conteggio</ion-select-option>
                  <ion-select-option value="periodo">Periodo</ion-select-option>
                  <ion-select-option value="nomeVia">Nome Via</ion-select-option>
                </ion-select>
              </ion-item>
            </ion-col>
            <ion-col size="12" size-md="3">
              <ion-item>
                <ion-label position="stacked">Direzione</ion-label>
                <ion-select v-model="filtri.sortOrder" interface="popover">
                  <ion-select-option value="desc">Discendente</ion-select-option>
                  <ion-select-option value="asc">Ascendente</ion-select-option>
                </ion-select>
              </ion-item>
            </ion-col>
            <ion-col size="12" size-md="3">
                <ion-button @click="() => caricaStatisticheVie(1)" expand="block" :disabled="loading">
                    <ion-icon slot="start" :icon="searchOutline"></ion-icon>
                    Cerca
                </ion-button>
            </ion-col>
             <ion-col size="12" size-md="3">
                <ion-button @click="resetFiltri" expand="block" color="light" :disabled="loading">
                    Reset Filtri
                </ion-button>
            </ion-col>
          </ion-row>
        </ion-grid>

        <div v-if="loading" class="ion-text-center ion-padding">
          <ion-spinner name="crescent"></ion-spinner>
          <p>Caricamento statistiche vie...</p>
        </div>
        <div v-if="errore" class="ion-text-center ion-padding">
          <ion-text color="danger">{{ errore }}</ion-text>
        </div>

        <ion-list v-if="!loading && !errore && statisticheVie.length > 0">
          <ion-list-header>
            <ion-label>Risultati ({{ totalRecords }} totali)</ion-label>
          </ion-list-header>
          <ion-item v-for="(stat, index) in statisticheVie" :key="index">
            <ion-label>
              <h2>{{ stat.nomeVia }}</h2>
              <p v-if="stat.periodo">Periodo: {{ stat.periodo }}</p>
            </ion-label>
            <ion-badge slot="end" color="primary">{{ stat.conteggio }} passaggi</ion-badge>
          </ion-item>
        </ion-list>
         <div v-if="!loading && !errore && statisticheVie.length === 0 && !primaRicerca" class="ion-padding ion-text-center">
            <ion-text>Nessun dato trovato per i filtri applicati.</ion-text>
        </div>


        <div class="pagination-controls ion-padding ion-text-center" v-if="totalPages > 1 && !loading">
            <ion-button @click="cambiaPagina(currentPage - 1)" :disabled="currentPage === 1" fill="outline" size="small">
                <ion-icon :icon="chevronBackOutline" slot="icon-only"></ion-icon>
            </ion-button>
            <span class="ion-padding-horizontal">Pagina {{ currentPage }} di {{ totalPages }}</span>
            <ion-button @click="cambiaPagina(currentPage + 1)" :disabled="currentPage === totalPages" fill="outline" size="small">
                <ion-icon :icon="chevronForwardOutline" slot="icon-only"></ion-icon>
            </ion-button>
        </div>
      </ion-card-content>
    </ion-card>

    <ion-card>
        <ion-card-header>
            <ion-card-title>Frequentazione "Tempo Reale" (Ultimi 15 Minuti)</ion-card-title>
        </ion-card-header>
        <ion-card-content>
            <ion-button @click="caricaFrequentazioneRecente" expand="block" :disabled="loadingRecente">
                <ion-icon slot="start" :icon="refreshOutline"></ion-icon>
                Aggiorna Frequentazione Recente
            </ion-button>
             <div v-if="loadingRecente" class="ion-text-center ion-padding">
                <ion-spinner name="crescent"></ion-spinner>
            </div>
            <div v-if="erroreRecente" class="ion-text-center ion-padding">
                <ion-text color="danger">{{ erroreRecente }}</ion-text>
            </div>
            <ion-list v-if="!loadingRecente && !erroreRecente && frequentazioneRecente.length > 0">
                 <ion-item v-for="(stat, index) in frequentazioneRecente" :key="`recente-${index}`">
                    <ion-label>
                        <h2>{{ stat.nomeVia }}</h2>
                    </ion-label>
                    <ion-badge slot="end" color="secondary">{{ stat.conteggio }} passaggi recenti</ion-badge>
                </ion-item>
            </ion-list>
            <div v-if="!loadingRecente && !erroreRecente && frequentazioneRecente.length === 0 && !primaRicercaRecente" class="ion-padding ion-text-center">
                <ion-text>Nessuna frequentazione rilevata negli ultimi 15 minuti.</ion-text>
            </div>
        </ion-card-content>
    </ion-card>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonList, IonItem, IonLabel, IonInput, IonButton, IonSpinner, IonText, IonGrid, IonRow, IonCol, IonSelect, IonSelectOption, IonBadge, IonListHeader, IonIcon } from '@ionic/vue';
import { useAuthStore } from '@/stores/auth';
import API from '@/utils/API';
import { searchOutline, refreshOutline, chevronBackOutline, chevronForwardOutline } from 'ionicons/icons';

interface StatisticaViaAggregata {
  periodo?: string;
  nomeVia: string;
  conteggio: number;
}

const authStore = useAuthStore();
const statisticheVie = ref<StatisticaViaAggregata[]>([]);
const loading = ref(false);
const errore = ref<string | null>(null);
const primaRicerca = ref(true);

const frequentazioneRecente = ref<StatisticaViaAggregata[]>([]);
const loadingRecente = ref(false);
const erroreRecente = ref<string | null>(null);
const primaRicercaRecente = ref(true);


const filtri = reactive({
  nomeVia: '',
  dataInizio: '',
  dataFine: '',
  groupBy: 'giorno',
  sortBy: 'conteggio',
  sortOrder: 'desc',
  page: 1,
  limit: 10
});

const currentPage = ref(1);
const totalPages = ref(1);
const totalRecords = ref(0);

const formatToISOStringForAPI = (datetimeLocalValue: string): string | undefined => {
    if (!datetimeLocalValue) return undefined;
    try {
        return new Date(datetimeLocalValue).toISOString();
    } catch (e) {
        console.warn("Valore datetime-local non valido:", datetimeLocalValue);
        return undefined;
    }
};


const caricaStatisticheVie = async (pageToLoad = 1) => {
  loading.value = true;
  errore.value = null;
  primaRicerca.value = false;
  filtri.page = pageToLoad;

  const filtriAPI = {
      ...filtri,
      dataInizio: formatToISOStringForAPI(filtri.dataInizio),
      dataFine: formatToISOStringForAPI(filtri.dataFine)
  };

  try {
    const data = await API.fetchStatisticheVieOperatore(filtriAPI);
    statisticheVie.value = data.data;
    currentPage.value = data.currentPage;
    totalPages.value = data.totalPages;
    totalRecords.value = data.totalRecords;

  } catch (err: any) {
    console.error("Errore caricaStatisticheVie:", err);
    errore.value = err.message || 'Impossibile caricare le statistiche delle vie.';
    statisticheVie.value = [];
  } finally {
    loading.value = false;
  }
};

const caricaFrequentazioneRecente = async () => {
  loadingRecente.value = true;
  erroreRecente.value = null;
  primaRicercaRecente.value = false;
  try {
    const now = new Date();
    const quindiciMinutiFa = new Date(now.getTime() - 15 * 60 * 1000);

    const filtriRecenti = {
        dataInizio: quindiciMinutiFa.toISOString(),
        dataFine: now.toISOString(),
        groupBy: 'via',
        sortBy: 'conteggio',
        sortOrder: 'desc',
        limit: 100,
        page: 1
    };

    const data = await API.fetchStatisticheVieOperatore(filtriRecenti);
    frequentazioneRecente.value = data.data;

  } catch (err:any) {
    erroreRecente.value = err.message || 'Impossibile caricare la frequentazione recente.';
    frequentazioneRecente.value = [];
  } finally {
    loadingRecente.value = false;
  }
};


const cambiaPagina = (nuovaPagina: number) => {
    if (nuovaPagina >= 1 && nuovaPagina <= totalPages.value) {
        caricaStatisticheVie(nuovaPagina);
    }
};

const resetFiltri = () => {
    filtri.nomeVia = '';
    filtri.dataInizio = '';
    filtri.dataFine = '';
    filtri.groupBy = 'giorno';
    filtri.sortBy = 'conteggio';
    filtri.sortOrder = 'desc';
    filtri.page = 1;
    currentPage.value = 1;
    statisticheVie.value = [];
    totalPages.value = 1;
    totalRecords.value = 0;
    primaRicerca.value = true;
};


onMounted(() => {
  if (authStore.isAuthenticated && (authStore.user?.ruolo === 'operatore' || authStore.user?.ruolo === 'admin')) {
  }
});
</script>

<style scoped>
ion-card-title {
  font-size: 1.2em;
}
.pagination-controls span {
    vertical-align: middle;
}
ion-input[type="datetime-local"] {
    border: 1px solid var(--ion-color-medium-tint);
    border-radius: 4px;
    padding: 8px;
    margin-right: 8px;
    width: auto; 
    min-width: 200px; 
}
</style>