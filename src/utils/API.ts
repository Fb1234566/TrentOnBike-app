import { useAuthStore } from '@/stores/auth';

class API {
    static baseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3000/api/v1';

    private static getAuthToken(): string | null {
        try {
            const authStore = useAuthStore();
            return authStore.token;
        } catch (error) {
            console.error("API.getAuthToken: Errore accesso store Pinia. Pinia è installato e attivo?", error);
            return localStorage.getItem('authToken'); // Fallback molto rischioso
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
                    errorMessage = errorText || `Errore server: ${errorText.substring(0,100)}`;
                }
            } catch (e) {
                // Non fare nulla se il parsing fallisce, errorMessage di default è già impostato
            }
            throw new Error(errorMessage);
        }
        if (response.status === 204) return null;
        return response.json();
    }

    static async testConnection(): Promise<boolean> {
        try {
            const response = await fetch(`${this.baseUrl}/docs`, { method: 'GET' });
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
        if (params.daData) queryParams.set('daData', params.daData);
        if (params.aData) queryParams.set('aData', params.aData);
        if (params.ordine) queryParams.set('ordine', params.ordine);
        if (params.direzione) queryParams.set('direction', params.direzione);
        if (params.limit) queryParams.set('limit', params.limit.toString());

        const url = `${this.baseUrl}/segnalazioni/mie?${queryParams.toString()}`;
        const response = await fetch(url, {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` },
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
            headers: { Authorization: `Bearer ${token}` },
        });
        return this.handleResponse(response);
    }
}

export default API;