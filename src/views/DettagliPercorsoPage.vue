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
    <ion-content class="report-issue-content">
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
      <div v-if="isOperatore">
        <ion-button v-if="isOperatore && !isEditing" @click="iniziaModificaPercorso" :disabled="isSaving || isGestioneTappe">Modifica dettagli percorso</ion-button>
        <ion-button v-if="isOperatore && isEditing" @click="salvaModifichePercorso" :disabled="isSaving">Salva Modifiche</ion-button>
        <ion-button class="pulsante-annulla" v-if="isOperatore && isEditing" @click="annullaModifichePercorso" :disabled="isSaving">Annulla modifiche</ion-button>
      </div>
      <ion-card>
        <ion-card-header class="dettagli-percorso-header">
          <ion-card-title v-if="!isEditing">{{ percorso.nome }}</ion-card-title>
          <ion-input v-else v-model="percorso.nome" label="Nome" fill="outline" :disabled="isSaving"></ion-input>
          <ion-card-subtitle v-if="!isEditing">{{ percorso.tipo }}</ion-card-subtitle>
          <ion-select v-else v-model="percorso.tipo" label="Tipo" fill="outline" :disabled="isSaving">
            <ion-select-option v-for="tipo in tipiPercorsoDisponibili" :key="tipo.value" :value="tipo.value">
              {{ tipo.label }}
            </ion-select-option>
          </ion-select>
        </ion-card-header>
        <ion-card-content>
          <div style="display: flex; align-items: flex-start; gap: 12px;">
            <div style="display: flex; align-items: center; gap: 4px;">
              <ion-icon v-if="!isEditing" :icon="flameOutline"></ion-icon>
              <ion-text v-if="!isEditing">{{ percorso.difficolta }}</ion-text>
              <ion-select v-else v-model="percorso.difficolta" label="Difficoltà" :disabled="isSaving">
                <ion-select-option v-for="difficolta in difficoltaPercorsoDisponibili" :key="difficolta.value" :value="difficolta.value">
                  {{ difficolta.label }}
                </ion-select-option>
              </ion-select>
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
          <ion-text v-if="!isEditing" class="ion-padding-top">{{ percorso.descrizione }}</ion-text>
          <ion-input v-else v-model="percorso.descrizione" label="Descrizione" fill="outline" :disabled="isSaving"></ion-input>
        </ion-card-content>
      </ion-card>
      <ion-button
          v-if="isOperatore"
          @click="isGestioneTappe = !isGestioneTappe"
          :color="isGestioneTappe ? 'danger' : 'primary'"
          :disabled="isEditing"
      >
        {{ isGestioneTappe ? 'Chiudi gestione tappe' : 'Gestisci tappe' }}
      </ion-button>
      <ion-card>
        <ion-card-header class="dettagli-percorso-header">
          <ion-card-title>Tappe</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-list style="background-color: var(--ion-card-background, #fff);">
            <ion-item
                v-for="(tappa, index) in percorso.tappe"
                :key="index"
                :button="!isEditing && !isGestioneTappe"
                :disabled="isEditing"
                style="--background: var(--ion-card-background, #fff);"
                lines="none"
                class="tappa-item"
                @click="!isEditing && !isGestioneTappe && apriDettagliTappa($event, tappa)"
            >
              <div class="tappa-numero">{{ index + 1 }}</div>
              <ion-label>{{ tappa.puntoDiInteresse.nome }}</ion-label>
              <ion-button class="pulsante-elimina" v-if="isOperatore && isGestioneTappe" @click.stop="confermaRimozioneTappa(index)">Rimuovi dal percorso</ion-button>
            </ion-item>
            <ion-item v-if="isGestioneTappe" lines="none" class="tappa-item tappa-fantasma">
              <div class="tappa-numero">{{ percorso.tappe.length + 1 }}</div>
              <ion-label><em>Nuova tappa</em></ion-label>
              <ion-button color="success" @click="aggiungiTappa()">Aggiungi tappa</ion-button>
            </ion-item>
          </ion-list>
        </ion-card-content>
      </ion-card>
      <!-- modal per dettagli tappa -->
      <ion-modal :is-open="modalAperto" :backdrop-dismiss="false" @did-dismiss="handleChiusuraModalTappa">
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
          <div v-if="isOperatore && tappaSelezionata">
            <ion-button v-if="!isEditingTappa" color="primary" @click="iniziaModificaTappa":disabled="isSaving || isEditingPoi">Modifica dettagli tappa</ion-button>
            <ion-button v-if="isEditingTappa" color="success" @click="salvaModificheTappa" :disabled="isSaving">Salva modifiche</ion-button>
            <ion-button v-if="isEditingTappa" color="danger" @click="annullaModificheTappa" :disabled="isSaving">Annulla modifiche</ion-button>
          </div>
          <ion-card>
            <ion-card-header>
              <ion-card-title>Dettagli Tappa</ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <div v-if="tappaSelezionata" style="display: flex; flex-direction: column; gap: 12px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <ion-icon v-if="!isEditingTappa" :icon="documentTextOutline"></ion-icon>
                  <ion-text v-if="!isEditingTappa"><strong>Descrizione:</strong> {{ tappaSelezionata.descrizione }}</ion-text>
                  <ion-input v-if="isEditingTappa" v-model="descrizioneTappa" label="Descrizione" fill="outline" :disabled="isSaving"></ion-input>
                </div>
                <div v-if="!isEditingTappa" style="display: flex; align-items: center; gap: 8px;">
                  <ion-icon :icon="locationOutline"></ion-icon>
                  <ion-text><strong>Posizione:</strong> {{ tappaSelezionata.posizione?.join(', ')  }}</ion-text>
                </div>
                <div v-else style="display: flex; align-items: center; gap: 8px;">
                  <ion-text><strong>Posizione:</strong></ion-text>
                  <ion-input v-model="lonTappa" label="Longitudine" type="number" :disabled="isSaving"></ion-input>
                  <ion-input v-model="latTappa" label="Latitudine" type="number" :disabled="isSaving"></ion-input>
                </div>
              </div>
            </ion-card-content>
          </ion-card>
          <div v-if="isOperatore && tappaSelezionata?.puntoDiInteresse">
            <ion-button v-if="!isEditingPoi" @click="iniziaModificaPoi" :disabled="isSaving || isEditingTappa">Modifica POI</ion-button>
            <ion-button color="success" v-if="isEditingPoi" @click="salvaModifichePoi" :disabled="isSaving">Salva modifiche</ion-button>
            <ion-button color="danger" v-if="isEditingPoi" @click="annullaModifichePoi" :disabled="isSaving">Annulla modifiche</ion-button>
          </div>
          <ion-card v-if="tappaSelezionata?.puntoDiInteresse">
            <ion-card-header>
              <ion-card-title>{{ tappaSelezionata.puntoDiInteresse.nome }}</ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <div style="display: flex; flex-direction: column; gap: 12px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <ion-icon v-if="!isEditingPoi" :icon="starOutline"></ion-icon>
                  <ion-text v-if="!isEditingPoi"><strong>Punto di Interesse:</strong> {{ tappaSelezionata.puntoDiInteresse.nome }}</ion-text>
                  <ion-input v-else v-model="tappaSelezionata.puntoDiInteresse.nome" label="Punto di Interesse:" fill="outline" :disabled="isSaving"></ion-input>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <ion-icon v-if="!isEditingPoi" :icon="pricetagOutline"></ion-icon>
                  <ion-text v-if="!isEditingPoi"><strong>Tipo:</strong> {{ tappaSelezionata.puntoDiInteresse.tipoPoi }}</ion-text>
                  <ion-select v-else v-model="tappaSelezionata.puntoDiInteresse.tipoPoi" label="Tipo:" fill="outline" :disabled="isSaving">
                    <ion-select-option v-for="tipo in tipiPOIDisponibili" :key="tipo.value" :value="tipo.value">
                      {{ tipo.label }}
                    </ion-select-option>
                  </ion-select>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <ion-icon v-if="!isEditingPoi" :icon="documentTextOutline"></ion-icon>
                  <ion-text v-if="!isEditingPoi"><strong>Descrizione POI:</strong> {{ tappaSelezionata.puntoDiInteresse.descrizione }}</ion-text>
                  <ion-input v-else v-model="tappaSelezionata.puntoDiInteresse.descrizione" label="Descrizione POI:" fill="outline" :disabled="isSaving"></ion-input>
                </div>
                <div v-if="!isEditingPoi" style="display: flex; align-items: center; gap: 8px;">
                  <ion-icon :icon="locationOutline"></ion-icon>
                  <ion-text><strong>Posizione POI:</strong> {{
                      tappaSelezionata.puntoDiInteresse.posizione?.join(', ')
                    }}
                  </ion-text>
                </div>
                <div v-else style="display: flex; align-items: center; gap: 8px;">
                  <ion-text><strong>Posizione POI:</strong></ion-text>
                  <ion-input v-model="lonPOI" label="Longitudine" type="number" :disabled="isSaving"></ion-input>
                  <ion-input v-model="latPOI" label="Latitudine" type="number" :disabled="isSaving"></ion-input>
                </div>
              </div>
            </ion-card-content>
          </ion-card>
        </ion-content>
      </ion-modal>
      <!-- Modal per aggiunta nuova tappa -->
      <ion-modal :is-open="showModalNuovaTappa" @did-dismiss="showModalNuovaTappa = false">
        <ion-header>
          <ion-toolbar>
            <ion-title>Nuova Tappa</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="showModalNuovaTappa = false">Chiudi</ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <ion-input v-model="descrizioneTappa" label="Descrizione" fill="outline"></ion-input>
          <ion-input v-model="lonTappa" label="Longitudine" type="number"></ion-input>
          <ion-input v-model="latTappa" label="Latitudine" type="number"></ion-input>
          <ion-button
              expand="block"
              color="tertiary"
              @click="usaPosizioneDelPoi"
              :disabled="isUsaPosizioneDisabilitato"
          >
            Usa posizione del POI per la tappa
          </ion-button>

          <ion-select v-model="poiNuovaTappa" label="Punto di Interesse">
            <ion-select-option v-for="poi in poisDisponibili" :key="poi._id" :value="poi">
              <ion-label class="poi-option">
                <strong>{{ poi.nome }}</strong><br />
              </ion-label>
            </ion-select-option>
          </ion-select>

          <ion-button expand="block" color="success" @click="confermaAggiuntaTappa" :disabled="!isTappaFormCompleto">
            Conferma
          </ion-button>
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
  _id: string;
  nome: string;
  tipoPoi?: string;
  descrizione?: string;
  posizione?: string[];
}

interface Tappa {
  _id: string;
  ordine: number;
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
  IonButton,
  IonIcon,
  IonText,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonCardContent,
  IonInput,
  IonSelectOption,
  IonSelect,
  IonCardSubtitle,
} from '@ionic/vue';
import API from '@/utils/API';
import {computed, onMounted, ref, nextTick} from 'vue';
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
import { Geolocation } from '@capacitor/geolocation';

import mapboxgl from "mapbox-gl";
import {useAuthStore} from "@/stores/auth";

const authStore = useAuthStore();
const isOperatore = computed(() => authStore.userRole === 'operatore');

const route = useRoute();
const id = route.params.id;
const router = useRouter();
const nTappe = ref(0);
const modalAperto = ref(false);
const percorso = ref<Percorso>({nome: '', tappe: []});
const tappaSelezionata = ref<Tappa | null>(null);

const percorsoOriginale = ref<Percorso | null>(null);
const tipiPercorsoDisponibili = [ {value: "TURISTICO", label: 'Turistico'}, {value: 'SUGGERITO_COMUNE', label: 'Suggerito dal comune'}, {value: 'UTENTE', label: 'Utente'}];
const difficoltaPercorsoDisponibili = [ {value: "Facile", label: 'Facile'}, {value: 'Medio', label: 'Medio'}, {value: 'Difficile', label: 'Difficile'}];
const tipiPOIDisponibili = [
  {value:"RASTRELLIERA", label:"Rastrelliera"},
  {value:"OFFICINA", label:"Officina"},
  {value:"FONTANELLA", label:"Fontanella"},
  {value:"PUNTO_RICARICA", label:"Punto di ricarica"},
  {value:"MUSEO", label:"Museo"},
  {value:"MONUMENTO", label:"Monumento"},
  {value:"LUOGO_STORICO_CULTURALE", label:"Luogo storico culturale"},
  {value:"ALTRO", label:"Altro"}]

const isEditing = ref(false);
const isSaving = ref(false);
const isGestioneTappe = ref(false);
const showModalNuovaTappa = ref(false);
const isEditingTappa = ref(false);
const isEditingPoi = ref(false);

const descrizioneTappa = ref<string>();
const latTappa = ref<string>('');
const lonTappa = ref<string>('');
const tempLatTappa = ref<string>('');
const tempLonTappa = ref<string>('');
const poiNuovaTappa = ref<PuntoDiInteresse | null>(null);

const poisDisponibili = ref<PuntoDiInteresse[]>([]);

const poiOriginale = ref<PuntoDiInteresse | null>(null);
const latPOI = ref<string>('');
const lonPOI = ref<string>('');

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
  const result = await API.getPercorso(percorsoId);
  percorso.value = Array.isArray(result) ? result[0] : result;
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
  //trova il punto di interesse a partire da
};

const apriDettagliTappa = async (event: CustomEvent, tappa: Tappa) => {
  // Rimuove focus attivo per evitare problemi aria-hidden
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }
  tappaSelezionata.value = tappa;
  console.log("Tappa selezionata:", tappa);
  modalAperto.value = true;
  await nextTick();
  const permStatus = await Geolocation.checkPermissions();
  if (permStatus.location !== 'granted') {
    await Geolocation.requestPermissions();
  }
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

const iniziaModificaPercorso = async () => {
  percorsoOriginale.value = JSON.parse(JSON.stringify(percorso.value));
  isEditing.value = true;
};

const annullaModifichePercorso = () => {
  if (percorsoOriginale.value) {
    percorso.value = JSON.parse(JSON.stringify(percorsoOriginale.value));
  }
  isEditing.value = false;
};

const salvaModifichePercorso = async () => {
  isSaving.value = true;
  try {
    const idP = Array.isArray(id) ? id[0] : id;
    await API.patchPercorso(idP, percorso.value);
    isEditing.value = false;
  } catch (error) {
    console.error("Errore nel salvataggio:", error);
  } finally {
    isSaving.value = false;
  }
};

const confermaRimozioneTappa = async (index: number) => {
  const conferma = window.confirm("Sei sicuro di voler rimuovere questa tappa?");
  if (!conferma) return;

  try {
    const idTappa = percorso.value.tappe[index]._id; // supponendo che ogni tappa abbia un `id`
    const idP = Array.isArray(id) ? id[0] : id;
    await API.deleteTappa(idP, idTappa);
  } catch (err) {
    console.error("Errore nella rimozione della tappa:", err);
  }
  await initPagina()
};

const aggiungiTappa = async () => {
  // Popola POI disponibili
  poisDisponibili.value = await API.getPuntiDiInteresse();
  // Reset form
  descrizioneTappa.value = '';
  poiNuovaTappa.value = null; // altrimenti { id: '', nome: '', tipoPoi: '', descrizione: '', posizione: ['', '']};
  lonTappa.value = '';
  latTappa.value = '';
  showModalNuovaTappa.value = true;
};

const usaPosizioneDelPoi = () => {
  if (poiNuovaTappa.value?.posizione?.length === 2) {
    lonTappa.value = poiNuovaTappa.value.posizione[0];
    latTappa.value = poiNuovaTappa.value.posizione[1];
  } else {
    console.warn("POI non valido o posizione mancante");
  }
};

const isUsaPosizioneDisabilitato = computed(() => {
  if (!poiNuovaTappa.value || !poiNuovaTappa.value.posizione || poiNuovaTappa.value.posizione.length !== 2) return true;
  const [poiLon, poiLat] = poiNuovaTappa.value.posizione.map(coord => parseFloat(coord));
  const currentLon = parseFloat(lonTappa.value || '');
  const currentLat = parseFloat(latTappa.value || '');
  // Solo se tutti sono numeri validi possiamo confrontare
  return !isNaN(poiLon) && !isNaN(poiLat) && poiLon === currentLon && poiLat === currentLat;
});

const isTappaFormCompleto = computed(() => {
  const lon = parseFloat(lonTappa.value);
  const lat = parseFloat(latTappa.value);
  return (
      !!descrizioneTappa.value?.trim() &&
      !!poiNuovaTappa.value &&
      !isNaN(lon) &&
      !isNaN(lat)
  );
});

const confermaAggiuntaTappa = async () => {
  if (!isTappaFormCompleto.value) {
    alert("Errore: campi mancanti o valori non validi");
    return;
  }
  const tappaDaInviare = {
    ordine: percorso.value.tappe.length,
    descrizione: descrizioneTappa.value,
    posizione: [lonTappa.value, latTappa.value],
    puntoDiInteresse: poiNuovaTappa.value?._id
  }
  try {
    // chiama API per fare post della tappa
    const idP = Array.isArray(id) ? id[0] : id;
    await API.postTappa(idP, tappaDaInviare);
    await initPagina();
  } catch (err) {
    console.error("Errore aggiunta tappa:", err);
  }
  showModalNuovaTappa.value = false;
};

const iniziaModificaTappa = async () => {
  if (!tappaSelezionata.value) return;
  descrizioneTappa.value = tappaSelezionata.value.descrizione || '';
  tempLonTappa.value = tappaSelezionata.value.posizione?.[0] || '';
  lonTappa.value = tappaSelezionata.value.posizione?.[0] || '';
  tempLatTappa.value = tappaSelezionata.value.posizione?.[1] || '';
  latTappa.value = tappaSelezionata.value.posizione?.[1] || '';
  isEditingTappa.value = true;
};

// se si preme sul pulsante annulla modifica tappa allora i valori vengono resettati dalle variabili descrizioneTappa, lonTappa e latTappa
const annullaModificheTappa = () => {
  if(!tappaSelezionata.value) return;
  // Ripristina valori precedenti
  tappaSelezionata.value.descrizione = descrizioneTappa.value;
  tappaSelezionata.value.posizione = [tempLatTappa.value, tempLonTappa.value];
  isEditingTappa.value = false;
};

const salvaModificheTappa = async () => {
  if (!tappaSelezionata.value) return;
  isSaving.value = true;
  try {
    const idP = Array.isArray(id) ? id[0] : id;
    const idTappa = tappaSelezionata.value._id;
    const tappaDaInviare = {
      ...tappaSelezionata.value,
      descrizione: descrizioneTappa.value,
      posizione: [lonTappa.value, latTappa.value]
    };
    console.log("Salvataggio tappa:", tappaDaInviare);
    await API.patchTappa(idP, idTappa, tappaDaInviare);
    await initPagina();
    tappaSelezionata.value.descrizione = percorso.value.tappe[tappaSelezionata.value.ordine - 1].descrizione;
    tappaSelezionata.value.posizione = [lonTappa.value, latTappa.value];
    isEditingTappa.value = false;
    } catch (error) {
      console.error("Errore nel salvataggio:", error);
    } finally {
    isSaving.value = false;
  }
};

const handleChiusuraModalTappa = () => {
  modalAperto.value = false;
  isEditingTappa.value = false;
  isEditingPoi.value = false;
  tappaSelezionata.value = null;
  descrizioneTappa.value = '';
  latTappa.value = '';
  lonTappa.value = '';
  tempLatTappa.value = '';
  tempLonTappa.value = '';
  poiOriginale.value = null;
  latPOI.value = '';
  lonPOI.value = '';
}

const iniziaModificaPoi = async () => {
  if(!tappaSelezionata.value?.puntoDiInteresse) return;
  poiOriginale.value = JSON.parse(JSON.stringify(tappaSelezionata.value.puntoDiInteresse));
  lonPOI.value = tappaSelezionata.value.puntoDiInteresse.posizione?.[0] || '';
  latPOI.value = tappaSelezionata.value.puntoDiInteresse.posizione?.[1] || '';
  isEditingPoi.value = true;
}

const annullaModifichePoi = () => {
  if(!poiOriginale.value || !tappaSelezionata.value) return;
  tappaSelezionata.value.puntoDiInteresse = JSON.parse(JSON.stringify(poiOriginale.value));
  isEditingPoi.value = false;
}

const salvaModifichePoi = async () => {
  if (!tappaSelezionata.value?.puntoDiInteresse) return;
  isSaving.value = true;
  try{
    const poiDaInviare = {
      ...tappaSelezionata.value.puntoDiInteresse,
      posizione: [lonPOI.value, latPOI.value]
    };
    await API.patchPDI(poiDaInviare._id, poiDaInviare);
    isEditingPoi.value = false;
    await initPagina();
  } catch (error) {
    console.error("Errore nel salvataggio:", error);
  } finally {
    isSaving.value = false;
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
.pulsante-annulla {
  --background: var(--ion-color-danger);
  color: white;
}
.pulsante-elimina {
  --background: var(--ion-color-danger);
  color: white;
}
.tappa-fantasma {
  font-style: italic;
  opacity: 0.9;
  background-color: #f0f9f0;
}
</style>