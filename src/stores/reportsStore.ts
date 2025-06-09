import {defineStore} from 'pinia';
import API from '@/utils/API';

const statiDisponibili = ['DA_VERIFICARE', 'ATTIVA', 'RISOLTA', 'SCARTATA'];
const categorieDisponibili = ['OSTACOLO', 'ILLUMINAZIONE_INSUFFICIENTE', 'PISTA_DANNEGGIATA', 'SEGNALAZIONE_STRADALE_MANCANTE', 'ALTRO'];

export const useReportsStore = defineStore('reports', {
    state: () => ({
        segnalazioni: [] as any[], // Lista di segnalazioni
        filtri: {
            stati: [...statiDisponibili] as string[],
            categorie: [...categorieDisponibili] as string[],
            daData: '' as string,
            aData: '' as string,
            ordine: 'creataIl',
            direzione: 'desc' as 'asc' | 'desc',
            limit: 50,
            lettaDalComune: undefined as string | undefined,
            gruppoSegnalazioni: undefined as boolean | undefined,
            via: '',
            lat: undefined as number | undefined,
            lng: undefined as number | undefined,
            raggio: undefined as number | undefined,
        },
        lastUpdate: '', // Timestamp dell'ultima modifica dal backend
    }),
    actions: {
        /**
         * Carica tutte le segnalazioni dal backend.
         */
        async caricaSegnalazioniConFiltri() {
            try {
                // Converto la stringa in booleano in una nuova variabile
                let lettaDalComuneBool: boolean | undefined;

                if (this.filtri.lettaDalComune === 'true') {
                    lettaDalComuneBool = true;
                } else if (this.filtri.lettaDalComune === 'false') {
                    lettaDalComuneBool = false;
                } else {
                    lettaDalComuneBool = undefined;
                }

                // Creo un nuovo oggetto filtri per l'API, sostituendo lettaDalComune con il booleano
                const filtriPerAPI = {
                    ...this.filtri,
                    lettaDalComune: lettaDalComuneBool,
                };
                console.log('Filtri da inviare all\'API:', filtriPerAPI);
                this.segnalazioni = await API.caricaTutteLeSegnalazioni(filtriPerAPI);

                const timestampResponse = await API.getGlobalTimestamp('lastReportsUpdate');
                this.lastUpdate = timestampResponse.value;
            } catch (error) {
                console.error('Errore durante il caricamento delle segnalazioni:', error);
                this.segnalazioni = [];
            }
        },

        /**
         * Controlla se l'elenco delle segnalazioni è aggiornato rispetto al backend.
         * Se non lo è, aggiorna automaticamente.
         */
        async verificaAggiornamento(): Promise<boolean> {
            try {
                // Chiama l'API per ottenere l'ultimo valore di lastReportsUpdate
                const response = await API.getGlobalTimestamp('lastReportsUpdate');
                const backendLastUpdate = response.value;

                // Se lastUpdate nello store è diverso da quello del backend, aggiorna le segnalazioni
                if (this.lastUpdate !== backendLastUpdate) {
                    console.log('La lista di segnalazioni non è aggiornata, ricarico...');
                    await this.caricaSegnalazioniConFiltri(); // Aggiorna le segnalazioni
                    this.lastUpdate = backendLastUpdate; // Aggiorna il valore nello store
                    return true;
                } else {
                    console.log('La lista di segnalazioni è già aggiornata.');
                    return false;
                }
            } catch (error) {
                console.error('Errore durante la verifica degli aggiornamenti:', error);
                return false;
            }
        },

        setFiltri(nuoviFiltri: Partial<typeof this.filtri>) {
            // Conversione sicura per lettaDalComune
            this.filtri = { ...this.filtri, ...nuoviFiltri };
        },

        resetFiltri() {
            this.filtri = {
                stati: [...statiDisponibili],
                categorie: [...categorieDisponibili],
                daData: '',
                aData: '',
                ordine: 'creataIl',
                direzione: 'desc',
                limit: 50,
                lettaDalComune: undefined,
                gruppoSegnalazioni: undefined,
                via: '',
                lat: undefined,
                lng: undefined,
                raggio: undefined,
            };
        }
    }
});
