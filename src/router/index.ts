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
      path: '/forbidden',
      name: 'forbidden',
      component: () => import('@/views/StatusView.vue'),
      meta: { requiresAuth: true, status: 403, title: 'Access denied' },
    },
    {
      path: '/failure',
      name: 'failure',
      component: () => import('@/views/StatusView.vue'),
      meta: { requiresAuth: true, status: 500, title: 'Request failed' },
    },
    {
      path: '/companies/:companySlug',
      component: () => import('@/layouts/OperationalLayout.vue'),
      meta: { requiresAuth: true, requiresWorkspace: true },
      children: [
        {
          path: '',
          name: 'company-dashboard',
          component: () => import('@/views/portal/hierarchy/CompanyDashboardView.vue'),
        },
        {
          path: 'profile',
          name: 'company-profile',
          component: () => import('@/views/portal/hierarchy/CompanyProfileView.vue'),
        },
        {
          path: 'users',
          name: 'company-users',
          component: () => import('@/views/portal/hierarchy/CompanyUsersView.vue'),
          meta: { permission: 'canManageCompanyUsers' },
        },
        {
          path: 'users/transfer-ownership',
          name: 'company-users-transfer-ownership',
          component: () => import('@/views/portal/hierarchy/TransferOwnershipView.vue'),
          meta: { permission: 'canManageCompanyUsers' },
        },
        {
          path: 'users/:membershipId',
          name: 'company-user-edit',
          component: () => import('@/views/portal/hierarchy/CompanyUserEditView.vue'),
          meta: { permission: 'canManageCompanyUsers' },
        },
        {
          path: 'customers',
          name: 'customers',
          component: () => import('@/views/portal/hierarchy/CustomersView.vue'),
        },
        {
          path: 'customers/:customerSlug',
          name: 'customer-dashboard',
          component: () => import('@/views/portal/hierarchy/CustomerDashboardView.vue'),
        },
        {
          path: 'customers/:customerSlug/profile',
          name: 'customer-profile',
          component: () => import('@/views/portal/hierarchy/CustomerProfileView.vue'),
        },
        {
          path: 'customers/:customerSlug/properties',
          name: 'customer-properties',
          component: () => import('@/views/portal/hierarchy/CustomerPropertiesView.vue'),
        },
        {
          path: 'customers/:customerSlug/tickets',
          name: 'customer-tickets',
          component: () => import('@/views/portal/operations/TicketListView.vue'),
        },
        {
          path: 'customers/:customerSlug/properties/:propertySlug',
          name: 'property-dashboard',
          component: () => import('@/views/portal/hierarchy/PropertyDashboardView.vue'),
        },
        {
          path: 'customers/:customerSlug/properties/:propertySlug/profile',
          name: 'property-profile',
          component: () => import('@/views/portal/hierarchy/PropertyProfileView.vue'),
        },
        {
          path: 'customers/:customerSlug/properties/:propertySlug/units',
          name: 'property-units',
          component: () => import('@/views/portal/hierarchy/PropertyUnitsView.vue'),
        },
        {
          path: 'customers/:customerSlug/properties/:propertySlug/tickets',
          name: 'property-tickets',
          component: () => import('@/views/portal/operations/TicketListView.vue'),
        },
        {
          path: 'customers/:customerSlug/properties/:propertySlug/units/:unitSlug',
          name: 'unit-dashboard',
          component: () => import('@/views/portal/hierarchy/UnitDashboardView.vue'),
        },
        {
          path: 'customers/:customerSlug/properties/:propertySlug/units/:unitSlug/profile',
          name: 'unit-profile',
          component: () => import('@/views/portal/hierarchy/UnitProfileView.vue'),
        },
        {
          path: 'customers/:customerSlug/properties/:propertySlug/units/:unitSlug/leases',
          name: 'unit-leases',
          component: () => import('@/views/portal/relations/UnitLeasesView.vue'),
        },
        {
          path: 'customers/:customerSlug/properties/:propertySlug/units/:unitSlug/tickets',
          name: 'unit-tickets',
          component: () => import('@/views/portal/operations/TicketListView.vue'),
        },
        {
          path: 'residents',
          name: 'residents',
          component: () => import('@/views/portal/hierarchy/ResidentsView.vue'),
        },
        {
          path: 'residents/:residentIdCode',
          name: 'resident-dashboard',
          component: () => import('@/views/portal/hierarchy/ResidentDashboardView.vue'),
        },
        {
          path: 'residents/:residentIdCode/profile',
          name: 'resident-profile',
          component: () => import('@/views/portal/hierarchy/ResidentProfileView.vue'),
        },
        {
          path: 'residents/:residentIdCode/contacts',
          name: 'resident-contacts',
          component: () => import('@/views/portal/relations/ResidentContactsView.vue'),
        },
        {
          path: 'residents/:residentIdCode/leases',
          name: 'resident-leases',
          component: () => import('@/views/portal/relations/ResidentLeasesView.vue'),
        },
        {
          path: 'residents/:residentIdCode/tickets',
          name: 'resident-tickets',
          component: () => import('@/views/portal/operations/TicketListView.vue'),
        },
        {
          path: 'tickets',
          name: 'tickets',
          component: () => import('@/views/portal/operations/TicketListView.vue'),
        },
        {
          path: 'tickets/new',
          name: 'ticket-new',
          component: () => import('@/views/portal/operations/TicketFormView.vue'),
        },
        {
          path: 'tickets/:ticketId',
          name: 'ticket-details',
          component: () => import('@/views/portal/operations/TicketDetailsView.vue'),
        },
        {
          path: 'tickets/:ticketId/edit',
          name: 'ticket-edit',
          component: () => import('@/views/portal/operations/TicketFormView.vue'),
        },
        {
          path: 'tickets/:ticketId/scheduled-work',
          name: 'scheduled-work',
          component: () => import('@/views/portal/operations/ScheduledWorkListView.vue'),
        },
        {
          path: 'tickets/:ticketId/scheduled-work/new',
          name: 'scheduled-work-new',
          component: () => import('@/views/portal/operations/ScheduledWorkFormView.vue'),
        },
        {
          path: 'tickets/:ticketId/scheduled-work/:scheduledWorkId',
          name: 'scheduled-work-details',
          component: () => import('@/views/portal/operations/ScheduledWorkDetailsView.vue'),
        },
        {
          path: 'tickets/:ticketId/scheduled-work/:scheduledWorkId/edit',
          name: 'scheduled-work-edit',
          component: () => import('@/views/portal/operations/ScheduledWorkFormView.vue'),
        },
        {
          path: 'tickets/:ticketId/scheduled-work/:scheduledWorkId/work-logs',
          name: 'work-logs',
          component: () => import('@/views/portal/operations/WorkLogListView.vue'),
        },
        {
          path: 'tickets/:ticketId/scheduled-work/:scheduledWorkId/work-logs/new',
          name: 'work-log-new',
          component: () => import('@/views/portal/operations/WorkLogFormView.vue'),
        },
        {
          path: 'tickets/:ticketId/scheduled-work/:scheduledWorkId/work-logs/:workLogId/edit',
          name: 'work-log-edit',
          component: () => import('@/views/portal/operations/WorkLogFormView.vue'),
        },
        {
          path: 'vendors',
          name: 'vendors',
          component: () => import('@/views/portal/relations/VendorsView.vue'),
        },
        {
          path: 'vendors/new',
          name: 'vendor-new',
          component: () => import('@/views/portal/relations/VendorFormView.vue'),
        },
        {
          path: 'vendors/:vendorId',
          name: 'vendor-details',
          component: () => import('@/views/portal/relations/VendorDetailView.vue'),
        },
        {
          path: 'vendors/:vendorId/edit',
          name: 'vendor-edit',
          component: () => import('@/views/portal/relations/VendorFormView.vue'),
        },
        {
          path: 'vendors/:vendorId/categories',
          name: 'vendor-categories',
          component: () => import('@/views/portal/relations/VendorCategoriesView.vue'),
        },
        {
          path: 'vendors/:vendorId/contacts',
          name: 'vendor-contacts',
          component: () => import('@/views/portal/relations/VendorContactsView.vue'),
        },
      ],
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

  if (to.meta.requiresWorkspace && !workspaceStore.selectedWorkspace && !workspaceStore.defaultPath) {
    return { name: 'workspaces' }
  }

  if (to.meta.permission === 'canManageCompanyUsers' && !workspaceStore.permissions.canManageCompanyUsers) {
    return { name: 'forbidden' }
  }

  return true
})

export default router
