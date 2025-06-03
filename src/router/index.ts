import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import TabsPage from '../views/TabsPage.vue';
import LoginPage from '../views/LoginPage.vue';
import RegisterPage from '../views/RegisterPage.vue';
import { useAuthStore } from '@/stores/auth';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/tabs',
    component: TabsPage,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/tabs/mappa',
      },
      {
        path: 'mappa',
        name: 'Mappa',
        component: () => import('@/views/MappaPage.vue'),
      },
      {
        path: 'report-issue',
        name: 'ReportIssueTab',
        component: () => import('@/views/ReportIssuePage.vue'),
        meta: { allowedRoles: ['utente', 'operatore', 'admin'] },
      },
      {
        path: 'statistiche',
        name: 'Statistiche',
        component: () => import('@/views/StatistichePage.vue'),
      },
      {
        path: 'profilo',
        name: 'Profilo',
        component: () => import('@/views/ProfiloPage.vue'),
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/views/SettingsPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'percorsi',
        name: 'Percorsi',
        component: () => import('@/views/PercorsiPage.vue')
      }
    ],
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterPage,
  },
  {
    path: '/percorso/:id',
    name: 'Percorso',
    component: () => import('@/views/DettagliPercorsoPage.vue')
  },
  {
    path: '/percorso/mappa',
    name: 'MappaPercorso',
    component: () => import('@/views/MappaPercorsoPage.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: () => {
      const authStore = useAuthStore();
      if (authStore.isAuthenticated) {
        return authStore.user?.ruolo === 'operatore' ? '/tabs/statistiche' : '/tabs/mappa';
      }
      return '/login';
    },
  },
    {
        path: '/reports',
        name: 'Reports',
        component: () => import ('@/views/AllReportsPage.vue'),
    },
    {
        path: '/reports/:id',
        name: 'ReportDetails',
        component: () => import ('@/views/ReportDetailsPage.vue'),
    },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  if (!authStore.token && localStorage.getItem('authToken')) {
      authStore.loadUserFromStorage();
  }

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const allowedRolesMeta = to.matched.reduce<string[] | undefined>((acc, record) => {
    return record.meta.allowedRoles ? (record.meta.allowedRoles as string[]) : acc;
  }, undefined);

  if ((to.name === 'Login' || to.name === 'Register') && authStore.isAuthenticated) {
    if (authStore.userRole === 'operatore') {
      next({ path: '/tabs/statistiche' });
    } else {
      next({ path: '/tabs/mappa' });
    }
    return;
  }

  if (requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'Login', query: { redirect: to.fullPath } });
  } else if (requiresAuth && authStore.isAuthenticated) {
    if (allowedRolesMeta && allowedRolesMeta.length > 0) {
      if (authStore.userRole && allowedRolesMeta.includes(authStore.userRole)) {
        next();
      } else {
        if (authStore.userRole === 'operatore') next({ path: '/tabs/statistiche' });
        else if (authStore.userRole === 'utente') next({ path: '/tabs/mappa' });
        else next({ name: 'Login' });
      }
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;