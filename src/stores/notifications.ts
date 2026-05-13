import { defineStore } from 'pinia'

export type NotificationTone = 'success' | 'warning' | 'error' | 'info'

export interface AppNotification {
  id: number
  tone: NotificationTone
  title: string
  message?: string
}

let nextNotificationId = 1

export const useNotificationStore = defineStore('notifications', {
  state: () => ({
    items: [] as AppNotification[],
  }),
  actions: {
    push(notification: Omit<AppNotification, 'id'>) {
      const item = { ...notification, id: nextNotificationId++ }
      this.items.push(item)
      return item.id
    },
    dismiss(id: number) {
      this.items = this.items.filter((item) => item.id !== id)
    },
    clear() {
      this.items = []
    },
  },
})
