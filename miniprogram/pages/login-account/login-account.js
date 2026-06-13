// pages/login-account/login-account.js
const app = getApp()
const { authApi } = require('../../utils/api.js')

Page({
  data: {
    form: { username: '', password: '' },
    submitting: false
  },

  onInput(e) {
    const field = e.currentTarget.dataset.field
    this.setData({ [`form.${field}`]: e.detail.value })
  },

  async onSubmit() {
    const { username, password } = this.data.form
    if (!username) return wx.showToast({ title: '请输入账号', icon: 'none' })
    if (!password) return wx.showToast({ title: '请输入密码', icon: 'none' })

    this.setData({ submitting: true })
    try {
      const res = await authApi.loginAccount({ username, password })
      const token = res?.data?.token || res?.token || ''
      if (token) {
        app.setUserToken(token)
        wx.showToast({ title: '登录成功' })
        setTimeout(() => wx.navigateBack(), 800)
      } else {
        wx.showToast({ title: res?.message || '登录失败', icon: 'none' })
      }
    } catch (err) {
      wx.showModal({ title: '登录失败', content: err.message, showCancel: false })
    } finally {
      this.setData({ submitting: false })
    }
  },

  // 跳卡密登录
  goCardLogin() {
    wx.redirectTo({ url: '/pages/login-card/login-card' })
  }
})
