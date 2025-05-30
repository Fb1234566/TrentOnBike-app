import {onMounted} from "vue";

class API {
    static baseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3000/api';
    static jwtToken: string = localStorage.getItem('token') || '';

    static async testConnection(): Promise<boolean> {
        try {
            const response = await fetch(`${this.baseUrl}/docs`, {
                method: 'GET',
            });

            return response.ok; // Restituisce true se la risposta è OK
        } catch (error) {
            console.error('Errore durante la connessione al backend:', error);
            return false;
        }
    }
    // da usare per testare la connessione con il server API
    /*
    onMounted(async () => {
        const isConnected = await API.testConnection();
        if (isConnected) {
            console.log('Connessione al backend riuscita!');
        } else {
            console.error('Connessione al backend fallita.');
        }
    });
     */

    // Metodo per impostare il token JWT
    static setToken(token: string) {
        this.jwtToken = token;
        localStorage.setItem('token', token);
    }

    // Metodo per inviare una segnalazione
    static async inviaSegnalazione(segnalazione: {
        categoria: string;
        descrizione: string;
        posizione: { type: string; coordinates: number[] };
    }): Promise<any> {
        try {
            const response = await fetch(`${this.baseUrl}/segnalazioni`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.jwtToken}`,
                },
                body: JSON.stringify(segnalazione),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Errore durante la creazione della segnalazione');
            }

            return response.json();
        } catch (error) {
            console.error('Errore:', error);
            throw new Error('Errore di rete o server non raggiungibile');
        }
    }

    // Metodo per ottenere segnalazioni con gestione dei parametri
    static async caricaSegnalazioni({
                                        stati,
                                        categorie,
                                        daData,
                                        aData,
                                        ordine = 'creataIl',
                                        direzione = 'desc',
                                    }: {
        stati?: string[]; // Stati delle segnalazioni da filtrare
        categorie?: string[]; // Categorie delle segnalazioni
        daData?: string; // Filtro per data iniziale
        aData?: string; // Filtro per data finale
        ordine?: string; // Campo per ordinamento (predefinito: creataIl)
        direzione?: 'asc' | 'desc'; // Ordine ascendente o discendente (predefinito: desc)
    } = {}): Promise<any[]> {
        try {
            const queryParams = new URLSearchParams();

            // Compone parametri per le query string
            if (stati) queryParams.set('stati', stati.join(','));
            if (categorie) queryParams.set('categorie', categorie.join(','));
            if (daData) queryParams.set('daData', daData);
            if (aData) queryParams.set('aData', aData);
            queryParams.set('ordine', ordine);
            queryParams.set('direction', direzione);

            const url = `${this.baseUrl}/segnalazioni/mie?${queryParams.toString()}`;

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${this.jwtToken}`,
                },
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Errore durante il recupero delle segnalazioni');
            }

            return response.json();
        } catch (error) {
            console.error('Errore:', error);
            throw new Error('Errore di rete o server non raggiungibile');
        }
    }

    // Metodo per fare logout
    static logout() {
        this.jwtToken = '';
        localStorage.removeItem('token');
    }
}

export default API;
