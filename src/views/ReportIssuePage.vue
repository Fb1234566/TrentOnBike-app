<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button />
        </ion-buttons>
        <ion-title>Segnala un problema al Comune</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="report-issue-content">
      <div class="content-wrapper">

        <!-- Mappa -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>Seleziona la posizione</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <div id="segnalazione-map" style="height: 300px;"></div>
            <p>Posizione selezionata: {{ formData.posizione.coordinates }}</p>
            <ion-button expand="block" @click="resetToCurrentLocation">
              Torna alla tua posizione corrente
            </ion-button>
          </ion-card-content>
        </ion-card>

        <!-- Categoria e Descrizione -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>Dettagli della segnalazione</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <!-- 1. Sezione Titolo "Categoria" -->
            <div class="section-title">
              <h2>Categoria</h2>
            </div>
            <!-- 2. Sezione del campo per selezionare la categoria -->
            <ion-item>
              <ion-select
                  placeholder="Scegli la categoria"
                  v-model="formData.categoria"
              >
                <!-- Genera le opzioni dinamicamente -->
                <ion-select-option
                    v-for="categoria in categorie"
                    :key="categoria.value"
                    :value="categoria.value"
                >
                  {{ categoria.label }}
                </ion-select-option>
              </ion-select>
            </ion-item>
            <!-- 3. Sezione Titolo "Descrizione" -->
            <div class="section-title">
              <h2>Descrizione</h2>
            </div>
            <!-- 4. Sezione del campo di scrittura per la descrizione -->
            <ion-item>
              <ion-textarea
                  v-model="formData.descrizione"
                  placeholder="Scrivi il problema (facoltativo)"
              ></ion-textarea>
            </ion-item>
          </ion-card-content>
        </ion-card>

        <!-- Pulsante INVIA SEGNALAZIONE -->
        <div class="button-container">
          <ion-button expand="block" @click="submitForm" :disabled="loading">
            <ion-spinner v-if="loading" slot="icon-only"></ion-spinner>
            <template v-else>Invia segnalazione</template>
          </ion-button>
        </div>

        <!-- Spaziatore invisibile -->
        <div class="spacer"></div>
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
  IonButton,
  IonBackButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonSpinner,
  IonItem,
  IonSelect,
  IonSelectOption,
  IonTextarea
} from '@ionic/vue';
import {onMounted, ref} from 'vue';
import Map from '@/utils/Mappa';
import API from '@/utils/API';

// Lista locale delle categorie allineata al backend
const categorie = [
  { value: "OSTACOLO", label: "Ostacolo" },
  { value: "ILLUMINAZIONE_INSUFFICIENTE", label: "Illuminazione insufficiente" },
  { value: "PISTA_DANNEGGIATA", label: "Pista danneggiata" },
  { value: "SEGNALAZIONE_STRADALE_MANCANTE", label: "Segnaletica mancante" },
  { value: "ALTRO", label: "Altro" },
];

const formData = ref({
  categoria: '',
  descrizione: '',
  posizione: { type: 'Point', coordinates: [0, 0] },
});

const loading = ref(false);
const MAP_ID = 'segnalazione-map';

/** Inizializza la mappa e gestisce la logica del marker */
const initMappa = async () => {
  const posizioneUtente = await Map.getUserLocation();
  await Map.create(MAP_ID, "segnalazione-map",  posizioneUtente ?? [12.5451, 41.8988]);
  if (posizioneUtente) {
    formData.value.posizione.coordinates = posizioneUtente;
    await Map.addUserLocationMarker("segnalazione-map", posizioneUtente);
    await Map.moveToUserLocation("segnalazione-map");
  }
  // Gestisci il click per selezionare una nuova posizione
  Map.getMap("segnalazione-map").on('click', (e) => {
    const { lng, lat } = e.lngLat;
    formData.value.posizione.coordinates = [lng, lat]; // Aggiorna le coordinate nel form
    Map.addSelectedMarker("segnalazione-map",[lng, lat]); // Aggiungi marker rosso
  });
};

/** Resetta la mappa alla posizione corrente e rimuove il marker rosso */
const resetToCurrentLocation = async () => {
  const posizioneUtente = await Map.getUserLocation();
  if (posizioneUtente) {
    formData.value.posizione.coordinates = posizioneUtente;
    await Map.addUserLocationMarker(MAP_ID, posizioneUtente); // Aggiorna il marker blu
    await Map.moveToUserLocation(MAP_ID); // Sposta la mappa sulla posizione corrente
    if (Map.selectedMarker) {
      Map.selectedMarker.get(MAP_ID)?.remove(); // Rimuovi il marker rosso
    }
  } else {
    alert('Impossibile ottenere la posizione corrente.');
  }
};

/** Gestisce l'invio del form con controlli per input */
const submitForm = async () => {
  // Controllo campi Categoria e Descrizione
  if (!formData.value.categoria) {
    alert('La categoria è obbligatoria.');
    return;
  }
  if (!formData.value.descrizione) {
    const conferma = confirm('La descrizione è vuota. Vuoi procedere senza descrizione?');
    if (!conferma) return;
  }

  loading.value = true;
  try {
    // Invoca il metodo 'inviaSegnalazione' dell'API
    const response = await API.inviaSegnalazione({
      categoria: formData.value.categoria,
      descrizione: formData.value.descrizione,
      posizione: formData.value.posizione,
    });

    // Gestione della risposta al successo
    alert('Segnalazione inviata con successo!');
    console.log('Risposta API:', response);

    // Resetta il form dopo l'invio
    formData.value = {
      categoria: '',
      descrizione: '',
      posizione: { type: 'Point', coordinates: [0, 0] },
    };
    await resetToCurrentLocation(); // Torna alla posizione iniziale
  } catch (error) {
    console.error('Errore durante l\'invio:', error);
    alert('Errore. Riprova più tardi.');
  } finally {
    loading.value = false;
  }
};

onMounted(initMappa);
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