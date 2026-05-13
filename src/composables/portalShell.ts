import { computed } from 'vue'
import { useRoute, type RouteLocationRaw } from 'vue-router'
import { useWorkspaceStore, workspaceOptionPath, workspaceRedirectPath } from '@/stores/workspace'
import type { BreadcrumbItem } from '@/types/ui'
import type { WorkspaceOptionDto } from '@/types/api'

interface NavigationItem {
  label: string
  to: RouteLocationRaw
  requires?: 'canManageCompanyUsers'
}

const routeParam = (value: unknown) => (Array.isArray(value) ? String(value[0] ?? '') : String(value ?? ''))

const titleCase = (value: string) =>
  value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')

const optionLabel = (option?: WorkspaceOptionDto) =>
  option?.displayName ?? option?.name ?? option?.slug ?? option?.companySlug ?? option?.managementCompanySlug ?? 'Workspace'

export const usePortalShell = () => {
  const route = useRoute()
  const workspaceStore = useWorkspaceStore()

  const companySlug = computed(() => routeParam(route.params.companySlug || workspaceStore.selectedCompanySlug))

  const selectedCompanyName = computed(() => {
    const selected = workspaceStore.selectedWorkspace
    const selectedSlug = selected?.managementCompanySlug ?? selected?.companySlug
    return selectedSlug === companySlug.value ? optionLabel(selected) : titleCase(companySlug.value)
  })

  const workspaceOptions = computed(() => workspaceStore.workspaceOptions)

  const selectedWorkspaceKey = computed(() => {
    const selected = workspaceStore.selectedWorkspace
    return selected?.id ?? selected?.workspaceId ?? selected?.contextId ?? ''
  })

  const mainNavigation = computed<NavigationItem[]>(() => {
    if (!companySlug.value) return []

    const base = `/companies/${companySlug.value}`
    const items: NavigationItem[] = [
      { label: 'Dashboard', to: base },
      { label: 'Company profile', to: `${base}/profile` },
      { label: 'Customers', to: `${base}/customers` },
      { label: 'Residents', to: `${base}/residents` },
      { label: 'Tickets', to: `${base}/tickets` },
      { label: 'Vendors', to: `${base}/vendors` },
      { label: 'Users', to: `${base}/users`, requires: 'canManageCompanyUsers' },
    ]

    return items.filter((item) => !item.requires || Boolean(workspaceStore.permissions[item.requires]))
  })

  const breadcrumbs = computed<BreadcrumbItem[]>(() => {
    if (!companySlug.value) return []

    const params = route.params
    const companyBase = `/companies/${companySlug.value}`
    const items: BreadcrumbItem[] = [{ label: selectedCompanyName.value, to: companyBase }]
    const path = route.path

    if (path === companyBase) return [{ label: selectedCompanyName.value }]

    if (path.includes('/profile') && !path.includes('/customers/') && !path.includes('/properties/') && !path.includes('/units/') && !path.includes('/residents/')) {
      return [...items, { label: 'Company profile' }]
    }

    if (path.includes('/users')) {
      items.push({ label: 'Users', to: `${companyBase}/users` })
      if (path.endsWith('/transfer-ownership')) items.push({ label: 'Transfer ownership' })
      else if (params.membershipId) items.push({ label: routeParam(params.membershipId) })
      return items
    }

    if (path.includes('/customers')) {
      items.push({ label: 'Customers', to: `${companyBase}/customers` })
      if (params.customerSlug) {
        const customerSlug = routeParam(params.customerSlug)
        const customerBase = `${companyBase}/customers/${customerSlug}`
        items.push({ label: titleCase(customerSlug), to: customerBase })

        if (path.endsWith(`${customerSlug}/profile`)) items.push({ label: 'Customer profile' })
        if (path.endsWith(`${customerSlug}/tickets`)) items.push({ label: 'Tickets' })
        if (path.includes('/properties')) {
          items.push({ label: 'Properties', to: `${customerBase}/properties` })
          if (params.propertySlug) {
            const propertySlug = routeParam(params.propertySlug)
            const propertyBase = `${customerBase}/properties/${propertySlug}`
            items.push({ label: titleCase(propertySlug), to: propertyBase })
            if (path.endsWith(`${propertySlug}/profile`)) items.push({ label: 'Property profile' })
            if (path.endsWith(`${propertySlug}/tickets`)) items.push({ label: 'Tickets' })
            if (path.includes('/units')) {
              items.push({ label: 'Units', to: `${propertyBase}/units` })
              if (params.unitSlug) {
                const unitSlug = routeParam(params.unitSlug)
                const unitBase = `${propertyBase}/units/${unitSlug}`
                items.push({ label: titleCase(unitSlug), to: unitBase })
                if (path.endsWith(`${unitSlug}/profile`)) items.push({ label: 'Unit profile' })
                if (path.endsWith(`${unitSlug}/leases`)) items.push({ label: 'Leases' })
                if (path.endsWith(`${unitSlug}/tickets`)) items.push({ label: 'Tickets' })
              }
            }
          }
        }
      }
      return items
    }

    if (path.includes('/residents')) {
      items.push({ label: 'Residents', to: `${companyBase}/residents` })
      if (params.residentIdCode) {
        const residentIdCode = routeParam(params.residentIdCode)
        const residentBase = `${companyBase}/residents/${residentIdCode}`
        items.push({ label: residentIdCode, to: residentBase })
        if (path.endsWith(`${residentIdCode}/profile`)) items.push({ label: 'Resident profile' })
        if (path.endsWith(`${residentIdCode}/contacts`)) items.push({ label: 'Contacts' })
        if (path.endsWith(`${residentIdCode}/leases`)) items.push({ label: 'Leases' })
        if (path.endsWith(`${residentIdCode}/tickets`)) items.push({ label: 'Tickets' })
      }
      return items
    }

    if (path.includes('/tickets')) {
      items.push({ label: 'Tickets', to: `${companyBase}/tickets` })
      if (path.endsWith('/tickets/new')) items.push({ label: 'New ticket' })
      if (params.ticketId) {
        const ticketId = routeParam(params.ticketId)
        const ticketBase = `${companyBase}/tickets/${ticketId}`
        items.push({ label: ticketId, to: ticketBase })
        if (path.endsWith(`${ticketId}/edit`)) items.push({ label: 'Edit' })
        if (path.includes('/scheduled-work')) {
          items.push({ label: 'Scheduled work', to: `${ticketBase}/scheduled-work` })
          if (params.scheduledWorkId) {
            const scheduledWorkId = routeParam(params.scheduledWorkId)
            const scheduledBase = `${ticketBase}/scheduled-work/${scheduledWorkId}`
            items.push({ label: scheduledWorkId, to: scheduledBase })
            if (path.endsWith('/work-logs')) items.push({ label: 'Work logs' })
          }
        }
      }
      return items
    }

    if (path.includes('/vendors')) {
      items.push({ label: 'Vendors', to: `${companyBase}/vendors` })
      if (path.endsWith('/vendors/new')) items.push({ label: 'New vendor' })
      if (params.vendorId) {
        const vendorId = routeParam(params.vendorId)
        const vendorBase = `${companyBase}/vendors/${vendorId}`
        items.push({ label: vendorId, to: vendorBase })
        if (path.endsWith(`${vendorId}/edit`)) items.push({ label: 'Edit' })
        if (path.endsWith(`${vendorId}/categories`)) items.push({ label: 'Categories' })
        if (path.endsWith(`${vendorId}/contacts`)) items.push({ label: 'Contacts' })
      }
      return items
    }

    return items
  })

  const workspacePath = (option: WorkspaceOptionDto) => workspaceOptionPath(option) ?? '/workspaces'
  const redirectPath = () => workspaceRedirectPath(workspaceStore.defaultRedirect) ?? workspaceStore.defaultPath ?? '/workspaces'

  return {
    breadcrumbs,
    companySlug,
    mainNavigation,
    redirectPath,
    selectedCompanyName,
    selectedWorkspaceKey,
    workspaceOptions,
    workspacePath,
  }
}
