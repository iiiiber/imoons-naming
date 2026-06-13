// app.js
// 全局入口：系统信息 + token 初始化 + 全局状态
const { getToken, setToken, clearToken } = require('./utils/auth.js')

App({
  globalData: {
    // 后端 API 基础地址
    apiBase: 'https://name.imoons.cn/api',
    // 用户 token（账号/卡密登录后存）
    token: '',
    // admin token（后台登录后存）
    adminToken: '',
    // 系统信息
    systemInfo: null,
    // tabbar 选中
    tabIndex: 0
  },

  onLaunch() {
    // 读取本地 token
    this.globalData.token = getToken('user') || ''
    this.globalData.adminToken = getToken('admin') || ''

    // 设备信息
    try {
      this.globalData.systemInfo = wx.getSystemInfoSync()
    } catch (e) {
      console.warn('getSystemInfoSync 失败:', e)
    }

    console.log('[app] launched, token=', this.globalData.token ? '已登录' : '未登录')
  },

  onShow() {},

  onError(msg) {
    console.error('[app] error:', msg)
  },

  // ============== token 工具 ==============
  setUserToken(token) {
    this.globalData.token = token
    setToken('user', token)
  },

  setAdminToken(token) {
    this.globalData.adminToken = token
    setToken('admin', token)
  },

  clearAllTokens() {
    this.globalData.token = ''
    this.globalData.adminToken = ''
    clearToken('user')
    clearToken('admin')
  },

  // ============== 通用 toast ==============
  toast(title, icon = 'none', duration = 1500) {
    wx.showToast({ title, icon, duration })
  }
})
