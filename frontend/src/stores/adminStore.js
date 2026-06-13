import { create } from 'zustand'
import { adminApi, setAdminToken, getAdminToken } from '../api/client.js'

export const useAdminStore = create((set, get) => ({
  admin: null,
  token: getAdminToken(),
  loading: false,
  error: null,

  login: async (creds) => {
    set({ loading: true, error: null })
    try {
      const data = await adminApi.login(creds)
      const token = data.token
      const username = data.username
      setAdminToken(token)
      set({ admin: { username }, token, loading: false, error: null })
      return data
    } catch (err) {
      set({ loading: false, error: err.message })
      throw err
    }
  },

  logout: () => {
    setAdminToken(null)
    set({ admin: null, token: null, error: null })
  },

  isAuthed: () => !!get().token,
}))
