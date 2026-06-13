// pages/naming-result/naming-result.js
const app = getApp()
const { wuxingClass, wuxingChipClass } = require('../../utils/util.js')

// 五行色（与原前端 WUXING_COLORS 一致）
const WUXING_COLORS = {
  '木': '#52a851',
  '火': '#d9534f',
  '土': '#c9a55c',
  '金': '#b8b8b8',
  '水': '#4a7cb8'
}

const PILLAR_LABELS = ['年柱', '月柱', '日柱', '时柱']

Page({
  data: {
    PILLAR_LABELS,
    WUXING_COLORS,
    wuxingClass,
    wuxingChipClass,
    chart: null,
    form: null,
    names: [],
    computed: null,
    fourPillars: [],
    wuxing: null,
    xiyongshen: [],
    avoid: [],
    isMember: false,
    totalNames: 10,
    loading: true
  },

  onLoad() {
    const chart = wx.getStorageSync('bazi_chart')
    const form = wx.getStorageSync('bazi_form')

    if (!chart) {
      wx.showModal({
        title: '提示',
        content: '暂无起名数据，请先起名',
        showCancel: false,
        success: () => wx.switchTab({ url: '/pages/naming/naming' })
      })
      return
    }

    // 兼容嵌套结构
    const computed = chart.bazi_computed || chart
    const fourPillars = [computed.year, computed.month, computed.day, computed.hour].filter(Boolean)
    const wuxing = computed.wuxing || chart.wuxing || null
    const wuxingMax = wuxing ? Math.max(...Object.values(wuxing).map(Number), 1) : 0
    const xiyongshen = computed.xiyongshen || chart.xiyongshen || []
    const avoid = computed.avoid || []
    const names = chart.names || chart.data?.names || []
    const isMember = chart.isMember ?? !!app.globalData.token
    const totalNames = chart.totalNames || 10

    this.setData({
      chart, form, names, computed, fourPillars, wuxing, wuxingMax, xiyongshen, avoid,
      isMember, totalNames, loading: false
    })
  },

  // 五行百分比（用于进度条）
  getWuxingPercent(wuxing) {
    if (!wuxing) return []
    const max = Math.max(...Object.values(wuxing).map(Number), 1)
    return Object.entries(wuxing).map(([wx, val]) => ({
      wx,
      val: Number(val),
      pct: (Number(val) / max) * 100,
      color: WUXING_COLORS[wx] || '#999'
    }))
  },

  // 计算每个名字的完整名
  fullName(surname, name) {
    if (!name) return ''
    if (surname && name.name) return `${surname}${name.name}`
    return name.name || ''
  },

  // 把字符串的 wuxing 拆成数组（每个字一个五行）
  wuxingArray(wuxingStr) {
    if (!wuxingStr) return []
    return Array.from(wuxingStr)
  },

  // 跳详情
  goDetail(e) {
    const idx = e.currentTarget.dataset.idx
    const name = this.data.names[idx]
    const surname = this.data.form?.surname
    const fullName = this.fullName(surname, name)
    wx.setStorageSync('current_name', name)
    wx.setStorageSync('current_surname', surname)
    wx.navigateTo({ url: `/pages/name-detail/name-detail?idx=${idx}&name=${encodeURIComponent(fullName)}` })
  },

  // 跳登录
  goLogin() {
    wx.navigateTo({ url: '/pages/login-account/login-account' })
  },

  // 重新起名
  goRenaming() {
    wx.switchTab({ url: '/pages/naming/naming' })
  }
})
