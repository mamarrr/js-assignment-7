import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import './assets/main.css'
import { configureApiClient } from './api/client'
import { useAuthStore } from './stores/auth'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

const authStore = useAuthStore()

configureApiClient({
  getToken: () => authStore.jwt,
  refresh: () => authStore.refresh(),
  onUnauthorized: () => {
    authStore.clearLocalState()
    if (router.currentRoute.value.name !== 'login') {
      void router.replace({
        name: 'login',
        query: { redirect: router.currentRoute.value.fullPath },
      })
    }
  },
})

app.use(router)

app.mount('#app')
