<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button/>
        </ion-buttons>
        <ion-title>Mappa percorso</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" class="report-issue-content">
      <div id="percorso-map" style="width: 100%; height: 100vh;"></div>
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
  IonBackButton,
} from '@ionic/vue';
import Map from '@/utils/Mappa';
import {onMounted, onUnmounted} from "vue";
import {useRoute} from "vue-router";

const route = useRoute();
const tappe = JSON.parse(route.query.tappe as string);

const initMappa = async () => {
  const posizioneUtente = await Map.getUserLocation();
  await Map.create("percorso-map", "percorso-map", posizioneUtente ?? [12.5451, 41.8988]);
  if (posizioneUtente) {
    await Map.addUserLocationMarker("percorso-map", posizioneUtente);
  }

  if (tappe && tappe.length > 0) {
    Map.addTappeMarkers("percorso-map", tappe);
    Map.getMap("percorso-map").flyTo({
      center: tappe[0].posizione,
      zoom: 15,
      essential: true
    });
  } else {
    console.warn("Nessuna tappa disponibile per disegnare il percorso.");
  }
}

const leaveMap = () => {
  Map.positionMarker.delete("percorso-map");
}

onMounted(initMappa);
onUnmounted(leaveMap)
</script>

<style scoped>

</style>