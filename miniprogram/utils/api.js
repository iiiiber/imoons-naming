// utils/api.js
// 后端 API 封装（对齐 React 端 client.js）
// 复用现有 PHP 后端，零后端改动

const app = getApp()
const auth = require('./auth.js')

// ============== 通用 request ==============
function request({ url, method = 'GET', data = null, header = {}, needAuth = false, isAdmin = false, timeout = 30000 }) {
  return new Promise((resolve, reject) => {
    const fullUrl = url.startsWith('http') ? url : app.globalData.apiBase + url

    const headers = { 'Content-Type': 'application/json', ...header }

    // admin 鉴权：Bearer token
    if (isAdmin) {
      const token = app.globalData.adminToken
      if (token) headers['Authorization'] = 'Bearer ' + token
    }

    // user 鉴权：session cookie（小程序 wx.request 默认带 cookie）
    // 不需要手动加 token，PHP session 自动管理

    wx.request({
      url: fullUrl,
      method,
      data,
      header: headers,
      timeout,
      success(res) {
        const { statusCode, data: body } = res
        if (statusCode === 200) {
          // 业务层 200 但 code !== 0 的情况
          if (body && body.code !== undefined && body.code !== 0 && body.code !== 200) {
            reject(new Error(body.message || '业务错误'))
            return
          }
          resolve(body)
        } else if (statusCode === 401) {
          // 鉴权失败
          if (isAdmin) {
            app.clearAllTokens()
            wx.reLaunch({ url: '/pages/admin-login/admin-login' })
          } else {
            app.clearAllTokens()
            wx.reLaunch({ url: '/pages/login-account/login-account' })
          }
          reject(new Error(body?.message || '请登录'))
        } else {
          reject(new Error(`HTTP ${statusCode}: ${body?.message || '请求失败'}`))
        }
      },
      fail(err) {
        reject(new Error(err.errMsg || '网络错误'))
      }
    })
  })
}

// ============== User 鉴权 ==============
const authApi = {
  // 账号密码登录
  loginAccount(data) {
    return request({
      url: '/user-login.php',
      method: 'POST',
      data: { type: 'account', ...data }
    })
  },
  // 卡密登录
  loginCard(cardCode) {
    return request({
      url: '/user-login.php',
      method: 'POST',
      data: { type: 'card', cardCode }
    })
  },
  // 退出
  logout() {
    return request({ url: '/user-logout.php', method: 'POST' })
  },
  // 当前用户信息
  me() {
    return request({ url: '/user-me.php' })
  }
}

// ============== 起名 API（长超时 60s）==============
const chartApi = {
  // 八字排盘
  analyze(data) {
    return request({
      url: '/naming.php',
      method: 'POST',
      data: { action: 'chart', ...data },
      timeout: 30000
    })
  },
  // AI 推荐名字（最长 60s）
  recommend(data) {
    return request({
      url: '/naming.php',
      method: 'POST',
      data: { action: 'recommend', ...data },
      timeout: 60000
    })
  },
  // 保存记录
  record(data) {
    return request({
      url: '/naming.php?action=record',
      method: 'POST',
      data,
      timeout: 15000
    })
  }
}

// ============== 订单（卡密支付/购买）==============
const orderApi = {
  create(data) {
    return request({ url: '/order.php', method: 'POST', data })
  },
  detail(orderId) {
    return request({ url: `/order.php?action=detail&id=${orderId}` })
  },
  pay(orderId) {
    return request({ url: '/order.php?action=pay', method: 'POST', data: { orderId } })
  },
  history() {
    return request({ url: '/order.php?action=history' })
  }
}

// ============== 文章 ==============
const articleApi = {
  list(params = {}) {
    const qs = Object.keys(params).map(k => `${k}=${encodeURIComponent(params[k])}`).join('&')
    return request({ url: '/article.php' + (qs ? '?' + qs : '') })
  },
  detail(id) {
    return request({ url: `/article.php?id=${id}` })
  }
}

// ============== 用户相关 ==============
const userApi = {
  history(params = {}) {
    const qs = Object.keys(params).map(k => `${k}=${encodeURIComponent(params[k])}`).join('&')
    return request({ url: '/user-history.php' + (qs ? '?' + qs : '') })
  },
  profile() {
    return request({ url: '/user-me.php' })
  }
}

// ============== Admin（独立 token）==============
const adminApi = {
  login(data) {
    return request({
      url: '/admin/login.php',
      method: 'POST',
      data,
      isAdmin: true
    })
  },
  stats() {
    return request({ url: '/admin/stats.php', isAdmin: true })
  },
  records(params = {}) {
    const qs = Object.keys(params).map(k => `${k}=${encodeURIComponent(params[k])}`).join('&')
    return request({
      url: '/admin/records.php' + (qs ? '?' + qs : ''),
      isAdmin: true
    })
  }
}

module.exports = {
  request,
  authApi,
  chartApi,
  orderApi,
  articleApi,
  userApi,
  adminApi
}
