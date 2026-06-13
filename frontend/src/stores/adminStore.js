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

  // 检查 token 是否有效：调 stats API 验证，401/失败则清掉 token
  // 返回 Promise<boolean>
  check: async () => {
    const token = get().token
    if (!token) return false
    try {
      await adminApi.stats()
      return true  // 200 OK → token 有效
    } catch (err) {
      // 401 或其他错误 → 清掉 token
      setAdminToken(null)
      set({ admin: null, token: null, error: null })
      return false
    }
  },

  isAuthed: () => !!get().token,
}))
