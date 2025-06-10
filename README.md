# TrentOnBike-app

[![Vue.js](https://img.shields.io/badge/Vue.js-42b883?style=for-the-badge&logo=vue.js&logoColor=white)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178c6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Ionic](https://img.shields.io/badge/Ionic-3880ff?style=for-the-badge&logo=ionic&logoColor=white)](https://ionicframework.com/)
[![Mapbox](https://img.shields.io/badge/Mapbox-121D3B?style=for-the-badge&logo=mapbox&logoColor=white)](https://www.mapbox.com/)
[![Deployment](https://github.com/Fb1234566/TrentOnBike-app/actions/workflows/deploy.yml/badge.svg)](https://github.com/Fb1234566/TrentOnBike-app/actions/workflows/deploy.yml)

Questo progetto è stato sviluppato come parte del corso di Ingegneria del Software all'Università di Trento.

## Descrizione

TrentOnBike-app è un'applicazione frontend realizzata in Vue.js e TypeScript che permette agli utenti di scoprire e pianificare percorsi cicloturistici nella città di Trento. L'app si connette alle API di TrentOnBike per fornire informazioni, mappe, itinerari e funzionalità interattive dedicate agli amanti della bicicletta e ai turisti interessati a esplorare il territorio in modo sostenibile.

## Setup

Installa tutte le dipendenze:
```bash
npm install
```

## Avvio dell'applicazione

Usa il seguente comando per avviare l'app in modalità sviluppo:
```bash
ionic serve
```

## Build per produzione

Per creare una build ottimizzata per la produzione su Android:

1. **Assicurati di essere nel branch `Android-deploy`:**
   ```bash
   git checkout Android-deploy
   ```

2. **Esegui la build:**
   ```bash
   . build.sh
   npx cap open android
   ```

3. Dopo aver eseguito `npx cap open android`, si aprirà Android Studio. Da lì potrai generare l'APK per l'installazione su dispositivi Android.


## Video DEMO
link al video: https://mega.nz/file/nbIxlRrC#UKBTdIAfS4HXJqWoy4_k4qlzX4dGGZ2BwcXs4GRjjcs

## Componenti del Gruppo

- [Filippo Benedetti](https://github.com/Fb1234566)
- [Matteo Marchiori](https://github.com/Mattew1717)
- [Davide Di Leo](https://github.com/davide-dileo)