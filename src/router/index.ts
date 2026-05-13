import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/workspaces',
    },
    {
      path: '/auth/login',
      name: 'login',
      component: () => import('@/views/auth/LoginView.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/auth/register',
      name: 'register',
      component: () => import('@/views/auth/RegisterView.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/onboarding',
      name: 'onboarding',
      component: () => import('@/views/FoundationView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/onboarding/new-management-company',
      name: 'onboarding-new-management-company',
      component: () => import('@/views/FoundationView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/onboarding/join-management-company',
      name: 'onboarding-join-management-company',
      component: () => import('@/views/FoundationView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/workspaces',
      name: 'workspaces',
      component: () => import('@/views/FoundationView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/companies/:companySlug',
      name: 'company-dashboard',
      component: () => import('@/views/FoundationView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
    },
  ],
})

router.beforeEach(async (to) => {
  const authStore = useAuthStore()

  if (to.meta.guestOnly && authStore.isAuthenticated) {
    return '/workspaces'
  }

  if (!to.meta.requiresAuth) return true

  if (!authStore.jwt) {
    return {
      name: 'login',
      query: { redirect: to.fullPath },
    }
  }

  const hasUser = await authStore.ensureCurrentUser()
  if (!hasUser) {
    return {
      name: 'login',
      query: { redirect: to.fullPath },
    }
  }

  return true
})

export default router
