<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Percorsi</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Percorsi</ion-title>
        </ion-toolbar>
      </ion-header>
      <div>
        <div style="display: flex; flex-direction: column; align-items: flex-start;">
          <!-- Barra di ricerca -->
          <ion-searchbar
              v-model="searchTerm"
              placeholder="Cerca percorso"
              @ionInput="handleSearch"
          ></ion-searchbar>
        </div>

        <div style="margin: 0 20px 20px; display: flex; align-items: flex-start">
          <ion-select  placeholder="Difficoltà" v-model="filterPercorsiDiff" @ionChange="handleDiffFilterChange($event)">
            <ion-select-option value="">Tutte</ion-select-option>
            <ion-select-option value="Facile">Facile</ion-select-option>
            <ion-select-option value="Medio">Medio</ion-select-option>
            <ion-select-option value="Difficile">Difficile</ion-select-option>
          </ion-select>
          <ion-select  placeholder="Tipo" v-model="filterPercorsiTipo" @ionChange="handleTipoFilterChange($event)">
            <ion-select-option value="">Tutti</ion-select-option>
            <ion-select-option value="TURISTICO">Turistico</ion-select-option>
            <ion-select-option value="SUGGERITO_COMUNE">Suggerito comune</ion-select-option>
            <ion-select-option value="UTENTE">Utente</ion-select-option>
          </ion-select>
        </div>
      </div>

      <div v-if="isOperatore" style="margin: 16px 20px;">
        <ion-button @click="openModal">Aggiungi Percorso</ion-button>
        <ion-button @click="toggleModalitàEliminazione" color="danger">
          {{ modalitaEliminazione ? 'Termina rimozione percorsi' : 'Rimuovi percorsi' }}
        </ion-button>
      </div>

      <div v-if="percorsiLoaded">
        <ion-card v-for="(item, index) in percorsi" :key="index" class="ion-margin-bottom" @click="!modalitaEliminazione ? goToPercorso($event, item._id) : null">
          <ion-card-header>
            <ion-card-title>{{ item.nome }}</ion-card-title>
            <ion-card-subtitle>{{ item.tipo }}</ion-card-subtitle>
          </ion-card-header>
          <ion-card-content>
            <div style="display: flex; align-items: flex-start; gap: 12px;">
              <div style="display: flex; align-items: center; gap: 4px;">
                <ion-icon :icon="flameOutline"></ion-icon>
                <ion-text>{{ item.difficolta }}</ion-text>
              </div>
              <div style="display: flex; align-items: center; gap: 4px;">
                <ion-icon :icon="flagOutline"></ion-icon>
                <ion-text>{{ item.tappe.length }}</ion-text>
                <span style="font-size: 0.95em; color: var(--ion-color-medium); margin-left: 2px;">tappe</span>
              </div>
              <div style="display: flex; align-items: center; gap: 4px;">
                <ion-icon :icon="bicycleOutline"></ion-icon>
                <ion-text>{{ item.lunghezza }}</ion-text>
                <span style="font-size: 0.95em; color: var(--ion-color-medium); margin-left: 2px;">km</span>
              </div>
            </div>
            <div class="spacer"></div>
            <ion-text class="ion-padding-top">{{ item.descrizione }}</ion-text>

            <!-- Bottone rimuovi visibile solo in modalità eliminazione -->
            <ion-button
                v-if="modalitaEliminazione"
                color="danger"
                style="margin-top: 12px"
                @click.stop="confermaRimozione(item._id)"
            >
              Rimuovi
            </ion-button>
          </ion-card-content>
        </ion-card>
      </div>
      <div v-if="!percorsiLoaded">
        <ion-text>
          <ion-spinner class="ion-align-center" name="crescent" style="display: block; margin: 0 auto;"></ion-spinner>
        </ion-text>
      </div>
    </ion-content>
  </ion-page>
  <ion-modal :is-open="showModal" @didDismiss="onClose" @willDismiss="onClose">
    <ion-header>
      <ion-toolbar>
        <ion-title>Aggiungi Percorso</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="onClose">Chiudi</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-item>
        <ion-label>Nome: </ion-label>
        <ion-input v-model="form.nome"></ion-input>
      </ion-item>

      <ion-item>
        <ion-label>Descrizione: </ion-label>
        <ion-input v-model="form.descrizione"></ion-input>
      </ion-item>

      <ion-item>
        <ion-label>Tipo</ion-label>
        <ion-select v-model="form.tipo">
          <ion-select-option value="TURISTICO">Turistico</ion-select-option>
          <ion-select-option value="SUGGERITO_COMUNE">Suggerito dal Comune</ion-select-option>
          <ion-select-option value="UTENTE">Utente</ion-select-option>
        </ion-select>
      </ion-item>

      <ion-item>
        <ion-label>Difficoltà</ion-label>
        <ion-select v-model="form.difficolta">
          <ion-select-option value="Facile">Facile</ion-select-option>
          <ion-select-option value="Medio">Medio</ion-select-option>
          <ion-select-option value="Difficile">Difficile</ion-select-option>
        </ion-select>
      </ion-item>
      <ion-button expand="block" @click="submitForm"
                  :disabled="!form.nome || !form.descrizione || !form.tipo || !form.difficolta">
        Crea Percorso
      </ion-button>
    </ion-content>
  </ion-modal>
</template>

<script setup lang="ts">
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  IonRefresher,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
  toastController,
  IonRefresherContent,
  IonButton,
  IonItem,
  IonLabel,
  IonInput,
  IonModal,
  IonButtons,
  alertController,
} from '@ionic/vue';
import {bicycleOutline, flagOutline, flameOutline} from 'ionicons/icons';
import API from '@/utils/API';
import { computed, onMounted, ref, watch} from "vue";
import { IonSearchbar } from '@ionic/vue';
import { useAuthStore } from "@/stores/auth";
const searchTerm = ref("");

const percorsiLoaded = ref(false);
const percorsi = ref();
const filterPercorsiDiff = ref("")
const filterPercorsiTipo = ref("")
import { useRouter } from 'vue-router';
const router = useRouter();
const authStore = useAuthStore();

const isOperatore = computed(() => authStore.userRole === 'operatore');
const showModal = ref(false);
const modalitaEliminazione = ref(false);

const toggleModalitàEliminazione = () => {
  modalitaEliminazione.value = !modalitaEliminazione.value;
  if (!modalitaEliminazione.value) {
    getPercorsi();
  }
};

const confermaRimozione = async (percorsoId: string) => {
  const alert = await alertController.create({
    header: 'Conferma',
    message: 'Sei sicuro di voler rimuovere questo percorso?',
    buttons: [
      {
        text: 'Annulla',
        role: 'cancel',
      },
      {
        text: 'Rimuovi',
        handler: async () => {
          await API.deletePercorso(percorsoId);
          const toast = await toastController.create({
            message: 'Percorso rimosso con successo.',
            duration: 2000,
            color: 'success',
          });
          await toast.present();
          await getPercorsi();
        }
      }
    ]
  });
  await alert.present();
};

const openModal = () => {
  form.value = getEmptyForm();
  showModal.value = true;
};

const onClose = () => {
  showModal.value = false;
  form.value = getEmptyForm(); // Reset del form ogni volta che si chiude
};

const form = ref({
  nome: '',
  descrizione: '',
  tipo: '',
  difficolta: '',
  createdBy: authStore.user?._id || '',
});

const getEmptyForm = () => ({
  nome: '',
  descrizione: '',
  tipo: '',
  difficolta: '',
  createdBy: authStore.user?._id || ''
});

const submitForm = async () => {
  try {
    const payload = {
      ...form.value,
    };
    await API.postPercorso(payload);

    const toast = await toastController.create({
      message: 'Percorso creato con successo!',
      duration: 2000,
      color: 'success'
    });
    await toast.present();
    await getPercorsi();
    form.value = getEmptyForm();
    showModal.value = false;

  } catch (err) {
    const toast = await toastController.create({
      message: 'Errore nella creazione del percorso.',
      duration: 2000,
      color: 'danger'
    });
    await toast.present();
  }
};

const getPercorsi = async () => {
  if (!window.navigator.onLine) {
    const toast = await toastController.create({
      message: 'Connessione internet assente.',
      duration: 2000,
      color: 'danger'
    });
    await toast.present();
    percorsiLoaded.value = true;
    return;
  }
  try {
    const p = await API.getPercorsi();
    let percorsi_filtrati;

    if (filterPercorsiDiff.value !== "" && filterPercorsiTipo.value !== "") {
      percorsi_filtrati = p.filter(item => item.difficolta === filterPercorsiDiff.value && item.tipo === filterPercorsiTipo.value);
    } else if (filterPercorsiDiff.value !== "") {
      percorsi_filtrati = p.filter(item => item.difficolta === filterPercorsiDiff.value);
    } else if (filterPercorsiTipo.value !== "") {
      percorsi_filtrati = p.filter(item => item.tipo === filterPercorsiTipo.value);
    } else {
      percorsi_filtrati = p;
    }

    // Poi filtra per termine di ricerca
    if (searchTerm.value.trim() !== "") {
      percorsi_filtrati = percorsi_filtrati.filter((item) =>
          item.nome.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
          (item.descrizione && item.descrizione.toLowerCase().includes(searchTerm.value.toLowerCase()))
      );
    }

    percorsi.value = percorsi_filtrati;
  } catch (error) {
    const toast = await toastController.create({
      message: 'Errore nel recupero dei percorsi. Controlla la connessione.',
      duration: 2000,
      color: 'danger'
    });
    await toast.present();
  } finally {
    percorsiLoaded.value = true;
  }
}

const handleSearch = () => {
  getPercorsi();
};

const handleRefresh = (event: CustomEvent) => {
  percorsiLoaded.value = false;

  setTimeout(async() => {
    await getPercorsi();
    // Completare l'animazione di refresh
    if (event.target) {
      (event.target as any).complete();
    }
  }, 0);
};

const handleDiffFilterChange = (event: CustomEvent) => {
  filterPercorsiDiff.value = event.detail.value;
  getPercorsi();
};
const handleTipoFilterChange = (event: CustomEvent) => {
  filterPercorsiTipo.value = event.detail.value;
  getPercorsi();
};

const goToPercorso = (event: CustomEvent, id:any) => {
  router.push({ name: 'Percorso', params: { id } });
}

const goToGestisciPoi = () => {
  router.push({ name: 'GestisciPoi' });
}

onMounted(() => {
  getPercorsi();
});
</script>

<style scoped>
ion-card-title {
  font-size: 1.4em;
}
ion-card-subtitle {
  font-size: 1em;
  color: var(--ion-color-medium-shade);
  text-transform: capitalize;
}
ion-item ion-icon {
  margin-right: 10px;
}

ion-card-header {
  padding-bottom:0;
}

ion-select,
ion-textarea {
  --padding-top: 10px; /* Spaziatura interna verticale */
  --padding-bottom: 10px;
}

.spacer {
  height: 15px; /* Aggiunge spazio extra scrollabile */
  background-color: transparent; /* Invisibile */
}
ion-label {
  font-weight: bold;
  padding-right: 20px;
}
</style>