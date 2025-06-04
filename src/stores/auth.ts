import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

// SPOSTIAMO API_BASE_URL QUI PER AUTH, LA CLASSE API USERÀ IL SUO.
const AUTH_API_BASE_URL = import.meta.env.VITE_API_URL_AUTH || import.meta.env.VITE_API_URL || 'http://127.0.0.1:3000/api/v1/auth';


interface User {
  _id: string;
  email: string;
  nome: string;
  cognome?: string;
  ruolo: 'utente' | 'operatore' | 'admin'; // Tipi di ruolo più specifici
  // Aggiungi altri campi se restituiti dal backend e necessari globalmente
  impostazioni?: any; // Sostituisci any con l'interfaccia corretta
  statistiche?: any;  // Sostituisci any con l'interfaccia corretta
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('authToken'));
  const user = ref<User | null>(JSON.parse(localStorage.getItem('authUser') || 'null'));

  const isAuthenticated = computed(() => !!token.value && !!user.value);
  const userRole = computed(() => user.value?.ruolo || null);

  function setAuthData(newToken: string, newUser: User) {
    token.value = newToken;
    user.value = newUser;
    localStorage.setItem('authToken', newToken);
    localStorage.setItem('authUser', JSON.stringify(newUser));
  }

  function clearAuthData() {
    token.value = null;
    user.value = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
  }

  async function login(credentials: { email: string; password: string }): Promise<{ success: boolean; message?: string; user?: User }> {
    try {
      const response = await fetch(`${AUTH_API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      const data = await response.json();
      if (!response.ok) {
        clearAuthData();
        return { success: false, message: data.message || 'Errore durante il login.' };
      }
      setAuthData(data.token, data.user);
      return { success: true, message: data.message, user: data.user };
    } catch (error: any) {
      clearAuthData();
      return { success: false, message: error.message || 'Errore di rete o del server.' };
    }
  }

  async function register(userData: {
    email: string;
    password: string;
    nome: string;
    cognome?: string;
  }): Promise<{ success: boolean; message?: string; user?: User }> {
    try {
      const response = await fetch(`${AUTH_API_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const data = await response.json();
      if (!response.ok) {
        clearAuthData();
        return { success: false, message: data.message || 'Errore durante la registrazione.' };
      }
      setAuthData(data.token, data.user);
      return { success: true, message: data.message, user: data.user };
    } catch (error: any) {
      clearAuthData();
      return { success: false, message: error.message || 'Errore di rete o del server.' };
    }
  }

  async function logout(): Promise<void> {
    // Chiamata API opzionale per invalidare il token lato server
    const currentToken = token.value;
    clearAuthData(); // Pulisci sempre lato client
    if (currentToken) {
        try {
            await fetch(`${AUTH_API_BASE_URL}/logout`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${currentToken}` }
            });
        } catch(error) {
            console.warn("Errore API durante il logout lato server (ignorabile):", error);
        }
    }
  }

  function loadUserFromStorage() {
    const storedToken = localStorage.getItem('authToken');
    const storedUserJson = localStorage.getItem('authUser');

    if (storedToken && storedUserJson) {
      token.value = storedToken;
      try {
        user.value = JSON.parse(storedUserJson);
      } catch (e) {
        clearAuthData();
      }
    } else {
      clearAuthData();
    }
  }

  return {
    token,
    user,
    isAuthenticated,
    userRole,
    login,
    register,
    logout,
    setAuthData,
    clearAuthData,
    loadUserFromStorage,
  };
});