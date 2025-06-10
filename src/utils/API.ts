import { useAuthStore } from '@/stores/auth';
import { API_BASE_URL } from '@/config';

class API {
    static baseUrl = API_BASE_URL;

    private static getAuthToken(): string | null {
        try {
            const authStore = useAuthStore();
            return authStore.token;
        } catch (error) {
            console.error("API.getAuthToken: Errore accesso store Pinia. Pinia è installato e attivo?", error);
            return localStorage.getItem('authToken');
        }
    }

    private static async handleResponse(response: Response) {
        if (!response.ok) {
            let errorMessage = `Errore HTTP ${response.status}: ${response.statusText}`;
            try {
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.indexOf("application/json") !== -1) {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } else {
                    const errorText = await response.text();
                    errorMessage = errorText || `Errore server: ${errorText.substring(0, 100)}`;
                }
            } catch (e) {
                // Non fare nulla
            }
            throw new Error(errorMessage);
        }
        if (response.status === 204) return null;
        return response.json();
    }

    static async testConnection(): Promise<boolean> {
        try {
            const response = await fetch(`${this.baseUrl}/docs`, {method: 'GET'});
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    static async inviaSegnalazione(segnalazione: {
        categoria: string;
        descrizione: string;
        posizione: { type: string; coordinates: number[] };
    }): Promise<any> {
        const token = this.getAuthToken();
        if (!token) throw new Error("Token di autenticazione mancante.");

        const response = await fetch(`${this.baseUrl}/segnalazioni`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(segnalazione),
        });
        return this.handleResponse(response);
    }

    static async caricaSegnalazioni(params: {
        stati?: string[];
        categorie?: string[];
        daData?: string;
        aData?: string;
        ordine?: string;
        direzione?: 'asc' | 'desc';
        limit?: number;
    } = {}): Promise<any[]> {
        const token = this.getAuthToken();
        if (!token) throw new Error("Token di autenticazione mancante.");

        const queryParams = new URLSearchParams();
        if (params.stati) queryParams.set('stati', params.stati.join(','));
        if (params.categorie) queryParams.set('categorie', params.categorie.join(','));
        if (params.daData) {
            const daDataISO = new Date(params.daData).toISOString();
            queryParams.set('daData', daDataISO);
        }
        if (params.aData) {
            const aDataISO = new Date(params.aData).toISOString();
            queryParams.set('aData', aDataISO);
        }
        if (params.ordine) queryParams.set('ordine', params.ordine);
        if (params.direzione) queryParams.set('direction', params.direzione);
        if (params.limit) queryParams.set('limit', params.limit.toString());

        const url = `${this.baseUrl}/segnalazioni/mie?${queryParams.toString()}`;
        const response = await fetch(url, {
            method: 'GET',
            headers: {Authorization: `Bearer ${token}`},
        });
        return this.handleResponse(response);
    }

    static async fetchUserStats(): Promise<any> {
        const token = this.getAuthToken();
        if (!token) throw new Error("Autenticazione richiesta per visualizzare le statistiche.");

        const response = await fetch(`${this.baseUrl}/users/me/statistiche`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });
        return this.handleResponse(response);
    }

    static async fetchStatisticheVieOperatore(filtri: {
        nomeVia?: string;
        dataInizio?: string;
        dataFine?: string;
        groupBy?: string;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
        page?: number;
        limit?: number;
    }): Promise<any> {
        const token = this.getAuthToken();
        if (!token) throw new Error("Autenticazione richiesta.");

        const queryParams = new URLSearchParams();
        if (filtri.nomeVia) queryParams.set('nomeVia', filtri.nomeVia);
        if (filtri.dataInizio) queryParams.set('dataInizio', filtri.dataInizio);
        if (filtri.dataFine) queryParams.set('dataFine', filtri.dataFine);
        if (filtri.groupBy) queryParams.set('groupBy', filtri.groupBy);
        if (filtri.sortBy) queryParams.set('sortBy', filtri.sortBy);
        if (filtri.sortOrder) queryParams.set('sortOrder', filtri.sortOrder);
        if (filtri.page) queryParams.set('page', filtri.page.toString());
        if (filtri.limit) queryParams.set('limit', filtri.limit.toString());

        const response = await fetch(`${this.baseUrl}/statisticheVie/storico?${queryParams.toString()}`, {
            method: 'GET',
            headers: {Authorization: `Bearer ${token}`},
        });
        return this.handleResponse(response);
    }

    static async getPuntiDiInteresse(filters: Record<string, any> = {}): Promise<any[]> {
        const token = this.getAuthToken();
        if (!token) throw new Error("Token di autenticazione mancante.");

        // Costruzione dei parametri di query dai filtri
        const queryParams = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                if (Array.isArray(value)) {
                    queryParams.set(key, value.join(','));
                } else {
                    queryParams.set(key, value.toString());
                }
            }
        });

        // Costruzione dell'URL con eventuali parametri
        const url = `${this.baseUrl}/pdi${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });

        return this.handleResponse(response);
    }

    static async getPercorsi(): Promise<any[]> {
        try {
            const response = await fetch(`${this.baseUrl}/percorsi`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                },
            })
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Errore durante il recupero dei punti di interesse');
            }
            return response.json();
        } catch (error) {
            console.error('Errore:', error);
            throw new Error('Errore di rete o server non raggiungibile');
        }
    }

    static async getPercorso(id: string): Promise<any[]> {
        try {
            const response = await fetch(`${this.baseUrl}/percorsi/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                },
            })
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Errore durante il recupero dei punti di interesse');
            }
            return response.json();
        } catch (error) {
            console.error('Errore:', error);
            throw new Error('Errore di rete o server non raggiungibile');
        }
    }

    // Metodo per ottenere tutte le segnalazioni (accessibile agli operatori)
    static async caricaTutteLeSegnalazioni(params: {
        stati?: string[];
        categorie?: string[];
        daData?: string;
        aData?: string;
        ordine?: string;
        direzione?: 'asc' | 'desc';
        limit?: number;
        lettaDalComune?: boolean;
        gruppoSegnalazioni?: boolean;
        via?: string;
        lat?: number;
        lng?: number;
        raggio?: number;
    } = {}): Promise<any[]> {
        const token = this.getAuthToken();
        if (!token) throw new Error("Token di autenticazione mancante.");

        const queryParams = new URLSearchParams();
        if (params.stati) queryParams.set('stati', params.stati.join(','));
        if (params.categorie) queryParams.set('categorie', params.categorie.join(','));
        if (params.daData){
            const daDataISO = new Date(params.daData).toISOString();
            queryParams.set('daData', daDataISO);
        }
        if (params.aData) {
            const aDataISO = new Date(params.aData).toISOString();
            queryParams.set('aData', aDataISO);
        }
        if (params.ordine) queryParams.set('ordine', params.ordine);
        if (params.direzione) queryParams.set('direction', params.direzione);
        if (params.limit !== undefined) queryParams.set('limit', params.limit.toString());
        if (params.lettaDalComune !== undefined) queryParams.set('lettaDalComune', String(params.lettaDalComune));
        if (params.gruppoSegnalazioni !== undefined) queryParams.set('gruppoSegnalazioni', String(params.gruppoSegnalazioni));
        if (params.via) queryParams.set('via', params.via);
        if (params.lat !== undefined) queryParams.set('lat', params.lat.toString());
        if (params.lng !== undefined) queryParams.set('lng', params.lng.toString());
        if (params.raggio !== undefined) queryParams.set('raggio', params.raggio.toString());

        const url = `${this.baseUrl}/segnalazioni?${queryParams.toString()}`;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return this.handleResponse(response);
    }

    // Metodo per ottenere i dettagli di una singola segnalazione
    static async caricaDettaglioSegnalazione(id: string): Promise<any> {
        const token = this.getAuthToken();
        if (!token) throw new Error("Token di autenticazione mancante.");
        const response = await fetch(`${this.baseUrl}/segnalazioni/${id}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return this.handleResponse(response);
    }

    // Metodo per segnare una segnalazione come "letta"
    static async segnaSegnalazioneComeLetta(id: string): Promise<any> {
        const token = this.getAuthToken();
        if (!token) throw new Error("Token di autenticazione mancante.");
        const response = await fetch(`${this.baseUrl}/segnalazioni/${id}/lettura`, { // Corretto da "/letta" a "/lettura"
            method: 'PATCH',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return this.handleResponse(response);
    }

    // Metodo per cambiare lo stato di una segnalazione
    static async cambiaStatoSegnalazione(id: string, nuovoStato: string): Promise<any> {
        const token = this.getAuthToken();
        if (!token) throw new Error("Token di autenticazione mancante.");

        const response = await fetch(`${this.baseUrl}/segnalazioni/${id}/stato`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ stato: nuovoStato }),
        });
        return this.handleResponse(response);
    }

    // Metodo per aggiornare il commento di una segnalazione
    static async aggiornaCommentoSegnalazione(id: string, commento: string): Promise<any> {
        const token = this.getAuthToken();
        if (!token) throw new Error("Token di autenticazione mancante.");

        const response = await fetch(`${this.baseUrl}/segnalazioni/${id}/commento`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ commento }),
        });
        return this.handleResponse(response);
    }

    // Metodo per ottenere una variabile globale Timestamp
    static async getGlobalTimestamp(key: string): Promise<{ key: string; value: string }> {
        const token = this.getAuthToken();
        if (!token) throw new Error("Token di autenticazione mancante.");
        const response = await fetch(`${this.baseUrl}/globalTimestamps/${key}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return this.handleResponse(response);
    }

    static async getInstructions(coords: [Number, Number][]) {
        const token = this.getAuthToken();
        if (!token) throw new Error("Token di autenticazione mancante.");
        const url = `${this.baseUrl}/indicazioni/route?${coords.map(coord => `coord=${coord.join(',')}`).join('&')}`;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });
        return this.handleResponse(response);
    };

    // Metodo per modificare un percorso
    static async patchPercorso(id: string, percorso: any): Promise<any> {
        const token = this.getAuthToken();
        if (!token) throw new Error("Token di autenticazione mancante.");
        const response = await fetch(`${this.baseUrl}/percorsi/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(percorso),
        });
        return this.handleResponse(response);
    }

    // Metodo per creare un nuovo percorso
    static async postPercorso(percorso: any): Promise<any> {
        const token = this.getAuthToken();
        if (!token) throw new Error("Token di autenticazione mancante.");
        const response = await fetch(`${this.baseUrl}/percorsi`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(percorso),
        });
        return this.handleResponse(response);
    }

    // Metodo per eliminare un percorso
    static async deletePercorso(id: string): Promise<any> {
        const token = this.getAuthToken();
        if (!token) throw new Error("Token di autenticazione mancante.");
        const response = await fetch(`${this.baseUrl}/percorsi/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });
        return this.handleResponse(response);
    }

    // Metodo per modificare una tappa di un percorso
    static async patchTappa(idPercorso: string, idTappa: string, tappa: any): Promise<any> {
        const token = this.getAuthToken();
        if (!token) throw new Error("Token di autenticazione mancante.");
        const response = await fetch(`${this.baseUrl}/percorsi/${idPercorso}/tappe/${idTappa}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(tappa),
        });
        return this.handleResponse(response);
    }

    // Metodo per creare una tappa di un percorso
    static async postTappa(idPercorso: string, tappa: any): Promise<any> {
        const token = this.getAuthToken();
        if (!token) throw new Error("Token di autenticazione mancante.");
        const response = await fetch(`${this.baseUrl}/percorsi/${idPercorso}/tappa`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(tappa),
        });
        return this.handleResponse(response);
    }

    // Metodo per eliminare una tappa di un percorso
    static async deleteTappa(idPercorso: string, idTappa: string): Promise<any> {
        const token = this.getAuthToken();
        if (!token) throw new Error("Token di autenticazione mancante.");
        const response = await fetch(`${this.baseUrl}/percorsi/${idPercorso}/tappe/${idTappa}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return this.handleResponse(response);
    }

    // Metodo per modificare un poi di un percorso
    static async patchPDI(id: string, pdi: any): Promise<any> {
        const token = this.getAuthToken();
        if (!token) throw new Error("Token di autenticazione mancante.");
        const response = await fetch(`${this.baseUrl}/pdi/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(pdi),
        });
        return this.handleResponse(response);
    }

    // Metodo per creare un poi di un percorso
    static async postPDI(pdi: any): Promise<any> {
        const token = this.getAuthToken();
        if (!token) throw new Error("Token di autenticazione mancante.");
        const response = await fetch(`${this.baseUrl}/pdi`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(pdi),
        });
        return this.handleResponse(response);
    }

    // Metodo per eliminare un poi di un percorso
    static async deletePDI(id: string): Promise<any> {
        const token = this.getAuthToken();
        if (!token) throw new Error("Token di autenticazione mancante.");
        const response = await fetch(`${this.baseUrl}/pdi/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            }
        });
        return this.handleResponse(response);
    }
}

export default API;