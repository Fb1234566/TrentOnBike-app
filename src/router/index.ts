import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import TabsPage from '../views/TabsPage.vue'
import LoginPage from '../views/LoginPage.vue';
import RegisterPage from '../views/RegisterPage.vue';
import MainPage from '../views/MainPage.vue';
import DashboardPage from '../views/DashboardPage.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/tabs/mappa'
  },
  {
    path: '/tabs/',
    component: TabsPage,
    children: [
      {
        path: '',
        redirect: '/tabs/mappa'
      },
      {
        path: 'mappa',
        component: () => import('@/views/MappaPage.vue')
      },
      {
        path: 'tab2',
        component: () => import('@/views/Tab2Page.vue')
      },
      {
        path: 'tab3',
        component: () => import('@/views/Tab3Page.vue')
      }
    ]
  },
  {path: '/',
    redirect: () => {
      if (!isAuthenticated()) {
        return { name: 'Login' };
      }
      const role = getUserRole();
      if (role === 'operatore') {
        return { name: 'Dashboard' };
      }
      return { name: 'Main' };
    }
   },
  {
     path: '/login',
    name: 'Login',
    component: LoginPage,
    beforeEnter: (to, from, next) => {
      if (isAuthenticated()) {
        const role = getUserRole();
        if (role === 'operatore') {
          next({ name: 'Dashboard' });
        } else {
          next({ name: 'Main' });
        }
      } else {
        next();
  }
   }
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterPage
  },
  {
    path: '/main',
    name: 'Main',
    component: MainPage,
    beforeEnter: (to, from, next) => {
      const role = getUserRole();
      if (isAuthenticated() && role === 'operatore') {
        next({ name: 'Dashboard' });
      } else {
        next();
      }
    }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: DashboardPage,
    meta: { requiresAuth: true, allowedRoles: ['operatore'] }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('authToken');
};

const getUserRole = (): string | null => {
  const userDataString = localStorage.getItem('userData');
  if (userDataString) {
    try {
      const userData = JSON.parse(userDataString);
      return userData.ruolo || null;
    } catch (e) {
      console.error("Errore nel parsing di userData da localStorage:", e);
      localStorage.removeItem('userData'); 
      localStorage.removeItem('authToken'); 
      return null;
    }
  }
  return null;
};



router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const authenticated = isAuthenticated();
  const userRole = getUserRole();

  if (requiresAuth && !authenticated) {
    next({ name: 'Login', query: { redirect: to.fullPath } });
  } else if (requiresAuth && authenticated) {
    const allowedRoles = to.matched.find(record => record.meta.allowedRoles)?.meta.allowedRoles as string[] | undefined;
    if (allowedRoles && allowedRoles.length > 0 && (!userRole || !allowedRoles.includes(userRole))) {
      console.warn(`Accesso negato a ${to.path}. Ruolo utente: ${userRole}, Ruoli permessi: ${allowedRoles}`);
      if (userRole === 'operatore') next({ name: 'Dashboard' });
      else if (userRole === 'utente') next({ name: 'Main' });
      else next({ name: 'Login' }); // Caso anomalo, meglio reindirizzare al login
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router


