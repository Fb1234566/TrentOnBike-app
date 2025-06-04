<template>
  <div class="ion-padding">
    <ion-card v-if="statistiche">
      <ion-card-header>
        <ion-card-title>Le Tue Statistiche Globali</ion-card-title>
      </ion-card-header>
      <ion-card-content>
        <ion-list>
          <ion-item>
            <ion-label>Km Totali Percorsi:</ion-label>
            <ion-note slot="end">{{ statistiche.kmTotali?.toFixed(2) || 0 }} km</ion-note>
          </ion-item>
          <ion-item>
            <ion-label>Calorie Totali Bruciate:</ion-label>
            <ion-note slot="end">{{ statistiche.calorieTotali?.toFixed(0) || 0 }} kcal</ion-note>
          </ion-item>
          <ion-item>
            <ion-label>CO2 Risparmiato Totale:</ion-label>
            <ion-note slot="end">{{ statistiche.co2RisparmiatoTotale?.toFixed(2) || 0 }} kg</ion-note>
          </ion-item>
          <ion-item>
            <ion-label>Velocità Media Generale:</ion-label>
            <ion-note slot="end">{{ statistiche.velocitaMediaGenerale?.toFixed(1) || 0 }} km/h</ion-note>
          </ion-item>
        </ion-list>
      </ion-card-content>
    </ion-card>

    <ion-list-header>
      <ion-label>Le Tue Sessioni di Ciclismo</ion-label>
    </ion-list-header>

    <ion-item>
      <ion-label>Filtra per data:</ion-label>
      <ion-input type="date" v-model="filtroDataInizio" placeholder="Da"></ion-input>
      <ion-input type="date" v-model="filtroDataFine" placeholder="A"></ion-input>
    </ion-item>
     <ion-item>
        <ion-button @click="applicaFiltriSessioni" expand="block" :disabled="loadingStatistiche">Applica Filtri</ion-button>
        <ion-button @click="resetFiltriSessioni" expand="block" color="light" :disabled="loadingStatistiche">Reset</ion-button>
    </ion-item>


    <div v-if="loadingStatistiche" class="ion-text-center ion-padding">
      <ion-spinner name="crescent"></ion-spinner>
      <p>Caricamento statistiche...</p>
    </div>

    <ion-list v-if="statistiche && sessioniFiltrate.length > 0">
      <ion-card v-for="sessione in sessioniFiltrate" :key="sessione._id">
        <ion-card-header>
          <ion-card-title>Sessione del {{ formatDate(sessione.dataOraInizio) }}</ion-card-title>
          <ion-card-subtitle v-if="sessione.percorsoEffettuato">
            Percorso: {{ sessione.percorsoEffettuato.nome || 'Non specificato' }}
          </ion-card-subtitle>
        </ion-card-header>
        <ion-card-content>
          <p>Distanza: {{ sessione.distanzaKm?.toFixed(2) || 0 }} km</p>
          <p>Durata: {{ calcolaDurata(sessione.dataOraInizio, sessione.dataOraFine) }}</p>
          <p>Velocità Media: {{ sessione.velocitaMedia?.toFixed(1) || 0 }} km/h</p>
          <p>Calorie Bruciate: {{ sessione.calorieBruciate?.toFixed(0) || 0 }} kcal</p>
          <p>CO2 Risparmiato: {{ sessione.co2Risparmiato?.toFixed(2) || 0 }} kg</p>
        </ion-card-content>
      </ion-card>
    </ion-list>
    <div v-else-if="!loadingStatistiche && statistiche && sessioniFiltrate.length === 0" class="ion-padding ion-text-center">
      <ion-text>Nessuna sessione trovata per i filtri applicati o nessuna sessione registrata.</ion-text>
    </div>
     <div v-if="erroreStatistiche" class="ion-padding ion-text-center">
        <ion-text color="danger">{{ erroreStatistiche }}</ion-text>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonList, IonItem, IonLabel, IonNote, IonSpinner, IonText, IonListHeader, IonInput, IonButton } from '@ionic/vue';
import { useAuthStore } from '@/stores/auth';
import API from '@/utils/API';

interface PercorsoEffettuato {
  _id: string;
  nome: string;
}
interface SessioneCiclismo {
  _id: string;
  dataOraInizio: string;
  dataOraFine?: string;
  distanzaKm?: number;
  percorsoEffettuato?: PercorsoEffettuato;
  velocitaMedia?: number;
  calorieBruciate?: number;
  co2Risparmiato?: number;
}

interface StatisticheUtenteData {
  kmTotali?: number;
  calorieTotali?: number;
  co2RisparmiatoTotale?: number;
  velocitaMediaGenerale?: number;
  sessioni: SessioneCiclismo[];
}

const authStore = useAuthStore();
const statistiche = ref<StatisticheUtenteData | null>(null);
const loadingStatistiche = ref(true);
const erroreStatistiche = ref<string | null>(null);

const filtroDataInizio = ref('');
const filtroDataFine = ref('');

const fetchStatisticheUtente = async () => {
  loadingStatistiche.value = true;
  erroreStatistiche.value = null;
  console.log('StatisticheUtente.vue: Chiamata fetchStatisticheUtente. Token nello store:', authStore.token ? authStore.token.substring(0,10) + '...' : 'NULL');
  try {
    if (!authStore.isAuthenticated || !authStore.token) {
        throw new Error("Utente non autenticato o token mancante per recuperare le statistiche.");
    }
    statistiche.value = await API.fetchUserStats();
  } catch (err: any) {
    console.error("StatisticheUtente.vue: Errore fetchStatisticheUtente:", err);
    erroreStatistiche.value = err.message || 'Impossibile caricare le statistiche.';
  } finally {
    loadingStatistiche.value = false;
  }
};

const sessioniFiltrate = computed(() => {
  if (!statistiche.value) return [];
  let sessioni = [...statistiche.value.sessioni];

  if (filtroDataInizio.value) {
    const dataInizio = new Date(filtroDataInizio.value);
    sessioni = sessioni.filter(s => new Date(s.dataOraInizio) >= dataInizio);
  }
  if (filtroDataFine.value) {
    const dataFine = new Date(filtroDataFine.value);
    dataFine.setHours(23, 59, 59, 999);
    sessioni = sessioni.filter(s => new Date(s.dataOraInizio) <= dataFine);
  }
  return sessioni.sort((a, b) => new Date(b.dataOraInizio).getTime() - new Date(a.dataOraInizio).getTime());
});

const applicaFiltriSessioni = () => {
  console.log('Filtri applicati/ricalcolati');
};

const resetFiltriSessioni = () => {
  filtroDataInizio.value = '';
  filtroDataFine.value = '';
};


const formatDate = (dateString: string) => {
  if (!dateString) return 'Data non disponibile';
  const date = new Date(dateString);
  return date.toLocaleDateString('it-IT', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const calcolaDurata = (inizio: string, fine?: string) => {
  if (!inizio || !fine) return 'N/D';
  const diffMs = new Date(fine).getTime() - new Date(inizio).getTime();
  if (diffMs < 0) return 'N/D';
  const minuti = Math.floor(diffMs / 60000);
  const ore = Math.floor(minuti / 60);
  const minResidui = minuti % 60;
  return `${ore > 0 ? ore + 'h ' : ''}${minResidui}min`;
};

onMounted(() => {
  if (authStore.isAuthenticated) {
    fetchStatisticheUtente();
  } else {
    loadingStatistiche.value = false;
    erroreStatistiche.value = "Devi essere autenticato per visualizzare le statistiche.";
    console.warn("StatisticheUtente.vue: Utente non autenticato in onMounted, statistiche non caricate.");
  }
});
</script>

<style scoped>
ion-card-title {
  font-size: 1.1em;
}
ion-card-subtitle {
  font-size: 0.9em;
  color: var(--ion-color-medium-shade);
}
ion-input[type="date"] {
    border: 1px solid var(--ion-color-medium-tint);
    border-radius: 4px;
    padding: 8px;
    margin-right: 8px;
}
ion-item ion-button {
    margin-top: 8px;
}
</style>