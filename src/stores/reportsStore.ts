import {defineStore} from 'pinia';
import API from '@/utils/API';

export const useReportsStore = defineStore('reports', {
    state: () => ({
        segnalazioni: [] as any[], // Lista di segnalazioni
        lastUpdate: '', // Timestamp dell'ultima modifica dal backend

    }),
    actions: {
        /**
         * Carica tutte le segnalazioni dal backend.
         */
        async caricaTutteLeSegnalazioni() {
            try {
                this.segnalazioni = await API.caricaTutteLeSegnalazioni();
                const timestampResponse = await API.getGlobalTimestamp('lastReportsUpdate');
                this.lastUpdate = timestampResponse.value;
            } catch (error) {
                console.error('Errore durante il caricamento delle segnalazioni:', error);
                this.segnalazioni = [];
            }
        },

        /**
         * Aggiorna lo stato di una specifica segnalazione nella lista.
         */
        aggiornaSegnalazione(id: string, updates: Partial<any>) {
            const segnalazione = this.segnalazioni.find(s => s._id === id);
            if (segnalazione) {
                Object.assign(segnalazione, updates); // Aggiorna i campi modificati
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
                    await this.caricaTutteLeSegnalazioni(); // Aggiorna le segnalazioni
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
        }
    }
});
