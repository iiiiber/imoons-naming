// pages/admin-records/admin-records.js
const app = getApp()
const { adminApi } = require('../../utils/api.js')

Page({
  data: {
    list: [],
    loading: true,
    page: 1,
    perPage: 20,
    hasMore: true,
    total: 0,
    // 筛选
    filters: {
      keyword: '',
      gender: '',
      date: ''
    }
  },

  onShow() {
    if (!app.globalData.adminToken) {
      wx.redirectTo({ url: '/pages/admin-login/admin-login' })
      return
    }
  },

  onLoad() {
    this.loadList()
  },

  onPullDownRefresh() {
    this.setData({ page: 1, hasMore: true })
    this.loadList().then(() => wx.stopPullDownRefresh())
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadMore()
    }
  },

  async loadList() {
    this.setData({ loading: true })
    try {
      const { keyword, gender, date } = this.data.filters
      const res = await adminApi.records({
        page: 1,
        per_page: this.data.perPage,
        keyword, gender, date
      })
      const data = res?.data || res
      const list = data.list || data.records || data || []
      const total = data.total || 0
      this.setData({
        list,
        loading: false,
        hasMore: list.length < total,
        total
      })
    } catch (err) {
      console.error('加载记录失败:', err)
      this.setData({ loading: false })
    }
  },

  async loadMore() {
    this.setData({ loading: true, page: this.data.page + 1 })
    try {
      const { keyword, gender, date } = this.data.filters
      const res = await adminApi.records({
        page: this.data.page,
        per_page: this.data.perPage,
        keyword, gender, date
      })
      const data = res?.data || res
      const list = data.list || data.records || data || []
      this.setData({
        list: [...this.data.list, ...list],
        loading: false,
        hasMore: this.data.list.length < (data.total || 0)
      })
    } catch (err) {
      console.error('加载更多失败:', err)
      this.setData({ loading: false })
    }
  },

  // 搜索
  onSearchInput(e) {
    this.setData({ 'filters.keyword': e.detail.value })
  },

  onSearchConfirm() {
    this.setData({ page: 1, hasMore: true })
    this.loadList()
  },

  // 筛选
  onGenderFilter(e) {
    const g = e.currentTarget.dataset.gender
    this.setData({
      'filters.gender': this.data.filters.gender === g ? '' : g,
      page: 1, hasMore: true
    })
    this.loadList()
  },

  onDateChange(e) {
    this.setData({
      'filters.date': e.detail.value,
      page: 1, hasMore: true
    })
    this.loadList()
  },

  // 解析 names
  parseNames(names) {
    if (!names) return []
    if (typeof names === 'string') {
      try { names = JSON.parse(names) } catch (e) { return [] }
    }
    if (!Array.isArray(names)) return []
    return names.slice(0, 3)
  },

  nameStr(n) {
    if (!n) return ''
    if (typeof n === 'string') return n
    return n.name || ''
  }
})
