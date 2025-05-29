import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

const API_BASE_URL = 'http://localhost:3000/api/v1/auth';

interface User {
  _id: string;
  email: string;
  nome: string;
  cognome?: string;
  ruolo: string;
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('authToken'));
  const user = ref<User | null>(JSON.parse(localStorage.getItem('authUser') || 'null'));

  const isAuthenticated = computed(() => !!token.value && !!user.value);

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

  async function login(credentials: { email: string; password: string }): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      const data = await response.json();
      if (!response.ok) {
        return { success: false, message: data.message || 'Errore durante il login.' };
      }
      setAuthData(data.token, data.user);
      return { success: true, message: data.message };
    } catch (error: any) {
      return { success: false, message: error.message || 'Errore di rete o del server.' };
    }
  }

  async function register(userData: {
    email: string;
    password: string;
    nome: string;
    cognome?: string;
  }): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const data = await response.json();
      if (!response.ok) {
        return { success: false, message: data.message || 'Errore durante la registrazione.' };
      }
      setAuthData(data.token, data.user);
      return { success: true, message: data.message };
    } catch (error: any) {
      return { success: false, message: error.message || 'Errore di rete o del server.' };
    }
  }

  async function logout() {
    clearAuthData();
  }

  function loadUserFromStorage() {
    const storedToken = localStorage.getItem('authToken');
    const storedUserJson = localStorage.getItem('authUser');
    if (storedToken && storedUserJson) {
      token.value = storedToken;
      try {
        user.value = JSON.parse(storedUserJson);
      } catch (e) {
        user.value = null;
        localStorage.removeItem('authUser');
      }
    } else {
      clearAuthData();
    }
  }

  return {
    token,
    user,
    isAuthenticated,
    login,
    register,
    logout,
    loadUserFromStorage,
  };
});