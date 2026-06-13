// pages/login-card/login-card.js
const app = getApp()
const { authApi } = require('../../utils/api.js')

Page({
  data: {
    cardCode: '',
    submitting: false
  },

  onInput(e) {
    this.setData({ cardCode: e.detail.value })
  },

  async onSubmit() {
    const code = this.data.cardCode.trim()
    if (!code) return wx.showToast({ title: '请输入卡密', icon: 'none' })

    this.setData({ submitting: true })
    try {
      const res = await authApi.loginCard(code)
      const token = res?.data?.token || res?.token || ''
      if (token) {
        app.setUserToken(token)
        wx.showToast({ title: '兑换成功' })
        setTimeout(() => wx.navigateBack(), 800)
      } else {
        wx.showToast({ title: res?.message || '卡密无效', icon: 'none' })
      }
    } catch (err) {
      wx.showModal({ title: '兑换失败', content: err.message, showCancel: false })
    } finally {
      this.setData({ submitting: false })
    }
  },

  goAccountLogin() {
    wx.redirectTo({ url: '/pages/login-account/login-account' })
  }
})
