import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useWorkspaceStore } from '@/stores/workspace'

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
      component: () => import('@/views/onboarding/OnboardingView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/onboarding/new-management-company',
      name: 'onboarding-new-management-company',
      component: () => import('@/views/onboarding/NewManagementCompanyView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/onboarding/join-management-company',
      name: 'onboarding-join-management-company',
      component: () => import('@/views/onboarding/JoinManagementCompanyView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/workspaces',
      name: 'workspaces',
      component: () => import('@/views/workspaces/WorkspacesView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/companies/:companySlug',
      name: 'company-dashboard',
      component: () => import('@/views/portal/hierarchy/CompanyDashboardView.vue'),
      meta: { requiresAuth: true, requiresWorkspace: true },
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
  const workspaceStore = useWorkspaceStore()

  if (to.meta.guestOnly && authStore.isAuthenticated) {
    return workspaceStore.defaultPath ?? '/workspaces'
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

  const startupReady = await workspaceStore.ensureStartupLoaded()
  if (!startupReady) return true

  const isOnboardingRoute = to.path.startsWith('/onboarding')
  const isWorkspaceRoute = to.name === 'workspaces'

  if (!workspaceStore.hasUsableWorkspace && !isOnboardingRoute) {
    return { name: 'onboarding' }
  }

  if (isWorkspaceRoute && !workspaceStore.hasUsableWorkspace) {
    return { name: 'onboarding' }
  }

  if (
    isWorkspaceRoute &&
    workspaceStore.workspaceOptions.length === 1 &&
    workspaceStore.defaultPath &&
    to.query.choose !== '1'
  ) {
    return workspaceStore.defaultPath
  }

  return true
})

export default router
