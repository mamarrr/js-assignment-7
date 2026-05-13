# Vue SPA Implementation Plan

## Summary

Build the full authenticated Vue 3 + TypeScript + Vite SPA described by `AGENTS.md`, using `backend-swagger.json` as the API contract and the Razor files under `mvc-views/` as product/layout references. The current repo is still the default Vue scaffold, and `plans/IMPLEMENTATION_PLAN.md` is empty, so implementation starts from a clean frontend baseline.

Each phase is sized so an AI agent can execute it independently, with handoff notes and acceptance criteria. Agents must not implement Admin/SystemAdmin features, must not add runtime dependencies, and must not write tests while the repository override remains active.

## Agent Execution Rules

- Before each phase, read `AGENTS.md`, `backend-swagger.json`, and the Razor views relevant to that phase.
- Keep all frontend-owned static UI text in English.
- Use only Vue 3, TypeScript, Vite, Vue Router, Pinia, ESLint, Prettier, and native `fetch`.
- Do not add Axios, UI libraries, localization frameworks, test frameworks, or runtime dependencies.
- Use `VITE_API_BASE_URL`; default to same-origin when absent.
- Preserve tenant boundaries by keying or clearing tenant-scoped state on workspace switch/logout.
- Verify each phase with `npm run build`; run lint/format only when intentionally normalizing touched frontend files.

## Phase 1: Project Foundation And App Shell

Implement the base frontend structure and remove scaffold content.

Key work:
- Create the planned folder structure under `src/api`, `src/components`, `src/layouts`, `src/router`, `src/stores`, `src/types`, and `src/views`.
- Replace the default `App.vue` with router-driven application composition.
- Add shared UI primitives for page loading, empty state, error alert, field errors, confirmation dialog, form actions, breadcrumbs, and notifications.
- Add baseline CSS for a responsive operational UI modeled after the MVC chrome, without Admin/SystemAdmin links.
- Keep styling local/simple; do not introduce a CSS framework.

Acceptance:
- App boots with Vue Router and Pinia.
- No default Vue scaffold UI remains.
- Build passes.

## Phase 2: Swagger Types, Error Model, And Fetch Client

Create the typed API foundation used by every feature phase.

Key work:
- Add TypeScript DTO/request/response types derived from Swagger names where practical, organized by API area.
- Implement `src/api/client.ts` with native `fetch`, JSON headers, bearer token injection, empty-response handling, and `VITE_API_BASE_URL`.
- Implement normalized frontend API errors supporting both `RestApiErrorResponse` and ASP.NET `ProblemDetails`.
- Support field errors, trace IDs, raw payload retention, and status-specific helpers for `401`, `403`, and `404`.
- Add API modules for auth, workspaces, onboarding, lookups, and portal feature areas, with path builders for company/customer/property/unit/resident/ticket/vendor scopes.

Acceptance:
- Feature code can call typed API functions without hardcoding fetch details.
- `204` and empty success responses do not crash parsing.
- Error displays can consume a single normalized error type.

## Phase 3: Auth, Startup Flow, And Route Guards

Implement authentication and protected routing.

Key work:
- Add `authStore` for JWT, refresh token, current user, auth status, and logout cleanup.
- Implement register, login, refresh, logout, and `me` API flows.
- Add single-flight refresh: concurrent `401` protected requests trigger exactly one refresh and replay after success.
- Clear auth and workspace state when refresh fails or logout completes.
- Add route guards for guest-only auth pages and authenticated routes.
- Add login/register views from Public Razor references.

Acceptance:
- Login/register persist tokens from `JWTResponse`.
- Protected routes redirect unauthenticated users to `/auth/login`.
- Logout calls the API and clears local state even if the API fails.
- Expired sessions redirect cleanly after failed refresh.

## Phase 4: Workspaces And Onboarding

Implement first-run and workspace selection flows.

Key work:
- Add `workspaceStore` for workspace catalog, selected workspace, default redirect, and permissions.
- Implement startup sequence after auth: load current user, onboarding status, workspaces, then route to onboarding/workspaces/company dashboard.
- Implement `/onboarding`, `/onboarding/new-management-company`, `/onboarding/join-management-company`, and `/workspaces`.
- Use `/api/v1/workspaces/select` for workspace switching and route to returned destination.
- Use `/api/v1/workspaces/default-redirect` or `WorkspaceCatalogDto.defaultContext` path data when available.
- Clear tenant-scoped stores on workspace switch.

Acceptance:
- Users with no usable workspace land in onboarding.
- Users with workspaces can select one and enter `/companies/:companySlug`.
- Workspace permissions are available to navigation and feature pages.

## Phase 5: App Chrome, Navigation, And Breadcrumbs

Build the authenticated shell used by Portal pages.

Key work:
- Implement app chrome with top bar, left navigation, workspace switcher, profile shortcut, notifications, and logout.
- Build company-slug-centered route tree from `AGENTS.md`.
- Render navigation only for Swagger-backed capabilities and permission flags, including `canManageCompanyUsers`.
- Implement route-aware breadcrumbs using params plus loaded DTO display names.
- Add generic forbidden/not-found/failure states.

Acceptance:
- No Admin/SystemAdmin links exist.
- No dead links are rendered.
- Authenticated company routes share the app chrome.
- Breadcrumbs work for company, customer, property, unit, resident, ticket, vendor, scheduled work, and work log contexts.

## Phase 6: Company, Users, Customers, Properties, Units, And Residents

Implement the core tenant hierarchy and profile/dashboard pages.

Key work:
- Company dashboard/profile get-update-delete.
- Company users list/add/edit/update/remove, role options, access request approve/reject, ownership transfer candidates, and ownership transfer.
- Customers list/create, dashboard, profile get-update-delete, customer properties, and customer tickets entry points.
- Properties dashboard/profile get-update-delete, property units, property tickets, and property type lookup.
- Units dashboard/profile get-update-delete, unit leases entry point, unit tickets, and resident search for lease assignment.
- Residents list/create, dashboard/profile get-update-delete, resident contacts/leases/tickets entry points, property search, and property-unit selection.

Acceptance:
- Every hierarchy route from company through unit/resident loads from API data.
- Forms show field errors, summary errors, pending states, and success notifications.
- Destructive profile actions require explicit confirmation DTOs where Swagger requires them.

## Phase 7: Contacts And Leases

Implement reusable contact and lease workflows.

Key work:
- Resident contacts: list, create-and-attach, attach existing, edit assignment, delete assignment, confirm, unconfirm, and set primary.
- Vendor contact reusable pieces may be stubbed only if Phase 10 will complete vendor-specific wiring.
- Unit-scoped leases: list/create/update/delete, resident search, scoped role options.
- Resident-scoped leases: list/create/update/delete, property search, unit selection, scoped role options.
- Global lease role lookup integration.
- Confirmation UI for delete/remove/high-impact lease actions.

Acceptance:
- Lease workflows work from both unit and resident contexts.
- Contact assignment metadata follows Razor field patterns.
- Server authorization and validation errors render cleanly.

## Phase 8: Tickets

Implement ticket lifecycle and all context ticket lists.

Key work:
- Management ticket list, detail, create, edit/update, and delete.
- Context ticket lists for customer, property, unit, and resident routes.
- Ticket form bootstrap endpoints and selector options for customers, properties, units, residents, and vendors.
- Company ticket options from both lookup endpoints exposed by Swagger.
- Transition availability and advance status.
- Canonical lifecycle display: `Created -> Assigned -> Scheduled -> In Progress -> Completed -> Closed`.

Acceptance:
- `/companies/:companySlug/tickets` and all context ticket routes are functional.
- Ticket creation/editing uses API form bootstrap data instead of hardcoded options.
- Advancing status requires explicit confirmation and prevents duplicate submission.

## Phase 9: Scheduled Work And Work Logs

Implement operational work execution under tickets.

Key work:
- Scheduled work list, detail, create, update, delete, form bootstrap, start, complete, and cancel.
- Work logs list, create, edit, delete, form endpoint, edit form endpoint, and delete-model endpoint.
- Hide material, labor, and total cost fields when `canViewCosts` is false.
- Require vendor and schedule details according to API validation and form bootstrap data.
- Add confirmations for deleting scheduled work, canceling scheduled work, and deleting work logs.

Acceptance:
- Scheduled work routes under tickets are functional.
- Work log cost visibility follows DTO permission flags.
- Lifecycle actions update page state immediately after success.

## Phase 10: Vendors, Vendor Categories, And Vendor Contacts

Implement vendor management.

Key work:
- Vendors list, create, detail, update, and delete.
- Vendor delete confirmation must require registry-code confirmation using the Swagger vendor delete DTO.
- Vendor categories list, assign, update, and delete.
- Vendor contacts list, create-and-attach, attach existing, edit assignment, delete assignment, confirm, unconfirm, and set primary.
- Reuse contact UI patterns from resident contacts where practical.

Acceptance:
- Vendor routes and nested category/contact routes are complete.
- Destructive vendor delete cannot submit without registry-code confirmation.
- Contact primary/confirmation state updates without full app reload.

## Phase 11: Cross-Feature Hardening

Tighten shared behavior across all implemented areas.

Key work:
- Audit every route from `AGENTS.md` against the router and Swagger-backed API modules.
- Ensure every page has loading, success, empty, forbidden, failure, and not-found handling as applicable.
- Ensure all forms disable submit while pending and prevent duplicate destructive actions.
- Ensure all notifications use English static frontend text.
- Ensure tenant-scoped stores are keyed by company slug or cleared on switch/logout.
- Remove unused scaffold code and any navigation to unsupported capabilities.

Acceptance:
- No route renders a dead or unsupported action.
- `401`, `403`, and `404` are handled consistently.
- Trace IDs are shown in expandable technical details when present.
- Static frontend text is English-only and no localization infrastructure exists.

## Phase 12: Final Verification And Handoff

Prepare the project for review.

Key work:
- Run `npm run build`.
- Run `npm run lint` only after confirming its configured fix behavior is acceptable for touched files.
- Run Prettier on `src/` if needed.
- Manually inspect representative flows: auth, onboarding, workspace selection, company dashboard, ticket lifecycle, scheduled work/work logs, vendor delete, and workspace switch.
- Update README only if required to document `VITE_API_BASE_URL` and local startup.

Acceptance:
- Build succeeds.
- Lint/format are clean for implemented files.
- The Definition of Done in `AGENTS.md` is satisfied.
- No tests are added.

## Public Interfaces And Contracts

- Environment variable: `VITE_API_BASE_URL`.
- Public routes: exactly the auth, onboarding, workspace, and `/companies/:companySlug/...` route tree listed in `AGENTS.md`.
- API modules: typed wrappers over `/api/v1/auth`, `/api/v1/workspaces`, `/api/v1/onboarding`, `/api/v1/portal/lookups`, and `/api/v1/portal/companies/{companySlug}/...`.
- Stores: `authStore`, `workspaceStore`, `notificationStore`, and feature stores/composables for company users, customers, properties, units, residents, contacts, leases, tickets, scheduled work, work logs, vendors, onboarding, and lookups.
- Error type: one normalized frontend API error with `status`, `title/message`, `errorCode`, `traceId`, `fieldErrors`, and raw payload.

## Assumptions

- The existing `backend-swagger.json` is the complete API source of truth.
- The existing empty `plans/IMPLEMENTATION_PLAN.md` should be replaced with this plan during implementation.
- Runtime dependencies remain limited to the stack already approved in `AGENTS.md`.
- Tests are intentionally excluded until the repository override changes.
- Razor views are product/layout references only and are not used at runtime.
