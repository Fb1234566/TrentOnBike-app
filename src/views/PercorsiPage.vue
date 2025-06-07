<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Percorsi</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Percorsi</ion-title>
        </ion-toolbar>
      </ion-header>
      <div style="margin: 20px; display: flex; align-items: flex-start">
        <ion-select  placeholder="Difficoltà" v-model="filterPercorsiDiff" @ionChange="handleDiffFilterChange($event)">
          <ion-select-option value="">Tutte</ion-select-option>
          <ion-select-option value="Facile">Facile</ion-select-option>
          <ion-select-option value="Medio">Medio</ion-select-option>
          <ion-select-option value="Difficile">Difficile</ion-select-option>
        </ion-select>
      </div>
      <div v-if="percorsiLoaded">
        <ion-card v-for="(item, index) in percorsi" :key="index" class="ion-margin-bottom" @click="goToPercorso($event, item._id)">
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
            <ion-text class="ion-padding-top">{{ item.descrizione }}</ion-text>
          </ion-card-content>
        </ion-card>
      </div>
      <div v-if="!percorsiLoaded">
        <ion-text>
          <ion-spinner class="ion-align-center" name="crescent" style="vertical-align: middle;"></ion-spinner>
        </ion-text>
      </div>
    </ion-content>
  </ion-page>
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
  IonItem,
  IonPage,
  IonRefresher,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
  toastController
} from '@ionic/vue';
import {bicycleOutline, flagOutline, flameOutline} from 'ionicons/icons';
import API from '@/utils/API';
import {onMounted, ref} from "vue";

const percorsiLoaded = ref(false);
const percorsi = ref();
const filterPercorsiDiff = ref("")
import { useRouter } from 'vue-router';
const router = useRouter();

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
    const percorsi_filtrati:any = [];
    if (filterPercorsiDiff.value !== "") {
      p.forEach((item) => {
        if (item.difficolta == filterPercorsiDiff.value) {
          percorsi_filtrati.push(item)
        }
      })
      percorsi.value = percorsi_filtrati;
    }
    else {
      percorsi.value = p;
    }




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

const goToPercorso = (event: CustomEvent, id:any) => {
  router.push({ name: 'Percorso', params: { id } });
}

onMounted(getPercorsi);
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
</style>