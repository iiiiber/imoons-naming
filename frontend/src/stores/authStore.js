import { create } from 'zustand'
import { authApi } from '../api/client.js'

export const useAuthStore = create((set) => ({
  user: null,
  loading: false,
  fetched: false,
  error: null,

  fetchUser: async () => {
    set({ loading: true })
    try {
      const data = await authApi.me()
      set({ user: data.user || null, loading: false, fetched: true, error: null })
      return data
    } catch (err) {
      set({ user: null, loading: false, fetched: true, error: err.message })
      return null
    }
  },

  loginAccount: async (creds) => {
    set({ loading: true, error: null })
    try {
      const data = await authApi.loginAccount(creds)
      set({ user: data.user, loading: false, fetched: true })
      return data
    } catch (err) {
      set({ loading: false, error: err.message })
      throw err
    }
  },

  loginCard: async (cardCode) => {
    set({ loading: true, error: null })
    try {
      const data = await authApi.loginCard(cardCode)
      set({ user: data.user, loading: false, fetched: true })
      return data
    } catch (err) {
      set({ loading: false, error: err.message })
      throw err
    }
  },

  logout: async () => {
    try { await authApi.logout() } catch {}
    set({ user: null, fetched: true })
  },

  clear: () => set({ user: null, error: null }),
}))
