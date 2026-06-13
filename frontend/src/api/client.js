import axios from 'axios'

const client = axios.create({
  baseURL: '/api',
  timeout: 30000,
  withCredentials: true, // 携带 PHP session cookie
  headers: { 'Content-Type': 'application/json' },
})

client.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const status = err.response?.status
    const data = err.response?.data
    if (status === 401) {
      // 鉴权失败：跳到登录页（不碰 store，避免循环依赖）
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname)
      }
    }
    const message = data?.message || data?.error || err.message || '请求失败'
    return Promise.reject(new Error(message))
  }
)

export default client

// ================== 各域 API ==================
export const authApi = {
  loginAccount: (data) => client.post('/user-login.php', { type: 'account', ...data }),
  loginCard: (cardCode) => client.post('/user-login.php', { type: 'card', cardCode }),
  logout: () => client.post('/user-logout.php'),
  me: () => client.get('/user-me.php'),
}

// 图表/起名 API 单独实例：AI 调 MiniMax M3 实际需 40-60s，老 admin 客户端超时 30s 会 ERR_ABORTED
const chartClient = axios.create({
  baseURL: '/api',
  timeout: 120000, // 2 分钟
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})
chartClient.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const status = err.response?.status
    const data = err.response?.data
    if (status === 401) {
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname)
      }
    }
    const message = data?.message || data?.error || err.message || '请求失败'
    return Promise.reject(new Error(message))
  }
)

export const chartApi = {
  analyze: (data) => chartClient.post('/naming.php', { action: 'chart', ...data }),
  recommend: (data) => chartClient.post('/naming.php', { action: 'recommend', ...data }),
  // 保存到 name_records（需登录，session 拿 user_id）
  record: (data) => client.post('/naming.php?action=record', data),
}

export const orderApi = {
  create: (data) => client.post('/order.php', data),
  detail: (orderId) => client.get(`/order.php?action=detail&id=${orderId}`),
  pay: (orderId) => client.post('/order.php?action=pay', { orderId }),
  history: () => client.get('/order.php?action=history'),
}

export const articleApi = {
  list: (params) => client.get('/article.php', { params }),
  detail: (id) => client.get(`/article.php?id=${id}`),
}

export const userApi = {
  history: () => client.get('/user-history.php'),
  profile: () => client.get('/user-me.php'),
}

// ================== Admin API ==================
// Admin 使用独立的 base64 token（存 localStorage），不走 PHP session
// 所有 admin 请求自动加 Authorization: Bearer *** 头

const TOKEN_KEY = 'admin_token'

export function getAdminToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setAdminToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

// 独立 axios 实例，baseURL 同 /api，但不挂全局拦截器（避免 401 跳 user login）
const adminClient = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

adminClient.interceptors.request.use((config) => {
  const token = getAdminToken()
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

adminClient.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const status = err.response?.status
    const data = err.response?.data
    if (status === 401) {
      // 401 清 token 并跳 admin login
      setAdminToken(null)
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/admin/login')) {
        const redirect = window.location.pathname
        window.location.href = '/admin/login?redirect=' + encodeURIComponent(redirect)
      }
    }
    const message = data?.error || data?.message || err.message || '请求失败'
    return Promise.reject(new Error(message))
  }
)

export const adminApi = {
  login: (data) => adminClient.post('/admin/login.php', data),
  stats: () => adminClient.get('/admin/stats.php'),
  users: (params) => adminClient.get('/admin/users.php', { params }),
  codes: (params) => adminClient.get('/admin/codes.php', { params }),
  createCodes: (data) => adminClient.post('/admin/codes.php', data),
  toggleCode: (id) => adminClient.post(`/admin/codes.php?id=${id}&toggle`),
  updateCode: (id, data) => adminClient.put(`/admin/codes.php?id=${id}`, data),
  records: (params) => adminClient.get('/admin/records.php', { params }),
  articles: (params) => adminClient.get('/admin/articles.php', { params }),
  getArticle: (id) => adminClient.get(`/admin/articles.php?id=${id}`),
  createArticle: (data) => adminClient.post('/admin/articles.php', data),
  updateArticle: (id, data) => adminClient.put(`/admin/articles.php?id=${id}`, data),
  toggleArticle: (id) => adminClient.post(`/admin/articles.php?id=${id}&toggle`),
  deleteArticle: (id) => adminClient.delete(`/admin/articles.php?id=${id}`),
  getConfigs: () => adminClient.get('/admin/configs.php'),
  updateConfigs: (data) => adminClient.post('/admin/configs.php', data),
}
