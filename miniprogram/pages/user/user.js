// pages/user/user.js
const app = getApp()
const { userApi, authApi } = require('../../utils/api.js')

Page({
  data: {
    user: null,
    loading: true,
    isLogin: false
  },

  onShow() {
    this.checkLogin()
  },

  async checkLogin() {
    const token = app.globalData.token
    if (!token) {
      this.setData({ isLogin: false, user: null, loading: false })
      return
    }
    this.setData({ isLogin: true, loading: true })
    try {
      const res = await userApi.profile()
      const user = res?.data || res
      this.setData({ user, loading: false })
    } catch (err) {
      console.error('加载用户信息失败:', err)
      this.setData({ loading: false })
    }
  },

  // 跳登录
  goLogin() {
    wx.navigateTo({ url: '/pages/login-account/login-account' })
  },

  // 跳卡密登录
  goCardLogin() {
    wx.navigateTo({ url: '/pages/login-card/login-card' })
  },

  // 我的起名记录
  goRecords() {
    wx.navigateTo({ url: '/pages/user-records/user-records' })
  },

  // 跳后台
  goAdmin() {
    wx.navigateTo({ url: '/pages/admin-login/admin-login' })
  },

  // 退出登录
  async onLogout() {
    const confirmed = await new Promise(resolve => {
      wx.showModal({
        title: '提示',
        content: '确定要退出登录吗？',
        success: r => resolve(r.confirm)
      })
    })
    if (!confirmed) return

    try {
      await authApi.logout()
    } catch (e) {
      console.warn('退出接口失败：', e.message)
    }
    app.clearAllTokens()
    this.setData({ isLogin: false, user: null })
    wx.showToast({ title: '已退出' })
  }
})
