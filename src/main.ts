import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { createPinia } from 'pinia';
import { IonicVue } from '@ionic/vue';
import { createI18n } from 'vue-i18n';

import enMessages from './locales/en.json';
import itMessages from './locales/it.json';
import deMessages from './locales/de.json';

/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/float-elements.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/text-transformation.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/display.css';

/* Theme variables */
import './theme/variables.css';
import '@ionic/vue/css/palettes/dark.system.css';

const i18n = createI18n({
  legacy: false, // Use Composition API
  locale: 'it', // Default locale
  fallbackLocale: 'en',
  messages: {
    en: enMessages,
    it: itMessages,
    de: deMessages,
  },
});

const app = createApp(App);

const pinia = createPinia();
app.use(pinia);

app.use(IonicVue);
app.use(router);
app.use(i18n);

router.isReady().then(() => {
  app.mount('#app');
});