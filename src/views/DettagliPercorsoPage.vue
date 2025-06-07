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
        <ion-card @click="goToMappaPercorso" style="display: flex; align-items: center; justify-content: space-between; cursor: pointer;">
          <ion-card-header style="flex: 1;">
            <ion-card-title>Visualizza su mappa</ion-card-title>
          </ion-card-header>
          <ion-icon :icon="arrowForwardOutline" style="font-size: 2rem; margin-left: 16px; vertical-align: middle;"></ion-icon>
        </ion-card>

        <!-- Spaziatore invisibile -->
        <div class="spacer"></div>
    </ion-content>
  </ion-page>
</template>


<script setup lang="ts">
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
import { arrowForwardOutline } from "ionicons/icons";


const route = useRoute();
const id = route.params.id;
const percorso = ref({ nome: '' }); // Inizializza con un oggetto vuoto
const router = useRouter();

/** Inizializza la mappa e gestisce la logica del marker */
const initPagina = async () => {
  percorso.value = await API.getPercorso(id);
};

const goToMappaPercorso = () => {
  if (!percorso.value) {
    console.error("Percorso non ancora caricato");
    return;
  }

  // Corretto da .tappa a .tappe
  const tappeData = percorso.value.tappe || [];

  router.push({
    name: 'MappaPercorso',
    query: { tappe: JSON.stringify(tappeData) }
  });
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
.content-wrapper {
  display: flex;
  flex-direction: column;
}
.section-title {
  margin-top: 1rem;
  margin-bottom: 0.5rem;
  font-weight: bold;
  font-size: 16px;
  color: var(--ion-color-dark); /* Colore scuro per il titolo */
}
/* Aggiusta i margini intorno ai campi ionici */
ion-item {
  margin-top: 0.5rem;
  --padding-start: 0; /* Rimuove padding laterale per un allineamento migliore */
}
ion-select,
ion-textarea {
  --padding-top: 10px; /* Spaziatura interna verticale */
  --padding-bottom: 10px;
}
.button-container {
  position: relative; /* Previene comportamenti indesiderati */
  margin-top: 0;
}
ion-button {
  padding: 0.75rem; /* Spaziatura interna del pulsante */
}
.spacer {
  height: 50px; /* Aggiunge spazio extra scrollabile */
  background-color: transparent; /* Invisibile */
}
</style>