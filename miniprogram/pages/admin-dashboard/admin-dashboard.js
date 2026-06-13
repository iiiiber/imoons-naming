// pages/admin-dashboard/admin-dashboard.js
const app = getApp()
const { adminApi } = require('../../utils/api.js')
const authUtil = require('../../utils/auth.js')

Page({
  data: {
    stats: null,
    loading: true,
    adminInfo: null
  },

  onShow() {
    if (!app.globalData.adminToken) {
      wx.redirectTo({ url: '/pages/admin-login/admin-login' })
      return
    }
    const info = authUtil.parseAdminToken(app.globalData.adminToken)
    this.setData({ adminInfo: info })
    this.loadStats()
  },

  async loadStats() {
    this.setData({ loading: true })
    try {
      const res = await adminApi.stats()
      const stats = res?.data || res
      this.setData({ stats, loading: false })
    } catch (err) {
      console.error('加载统计失败:', err)
      this.setData({ loading: false })
    }
  },

  goRecords() {
    wx.navigateTo({ url: '/pages/admin-records/admin-records' })
  },

  async onLogout() {
    const confirmed = await new Promise(r => wx.showModal({
      title: '提示', content: '退出后台？', success: res => r(res.confirm)
    }))
    if (!confirmed) return
    app.clearAllTokens()
    wx.reLaunch({ url: '/pages/admin-login/admin-login' })
  },

  goHome() {
    wx.reLaunch({ url: '/pages/home/home' })
  }
})
