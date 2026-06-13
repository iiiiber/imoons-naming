// pages/user-records/user-records.js
const { userApi } = require('../../utils/api.js')

const WUXING_COLORS = {
  '木': '#52a851', '火': '#d9534f', '土': '#c9a55c',
  '金': '#b8b8b8', '水': '#4a7cb8'
}

Page({
  data: {
    WUXING_COLORS,
    list: [],
    loading: true,
    page: 1,
    perPage: 20,
    hasMore: false
  },

  onLoad() {
    this.loadList()
  },

  onPullDownRefresh() {
    this.setData({ page: 1 })
    this.loadList().then(() => wx.stopPullDownRefresh())
  },

  async loadList() {
    this.setData({ loading: true })
    try {
      const res = await userApi.history({ page: 1, per_page: this.data.perPage })
      const data = res?.data || res
      const list = data.list || data || []
      const total = data.total || 0
      this.setData({
        list,
        loading: false,
        hasMore: list.length < total
      })
    } catch (err) {
      console.error('加载记录失败:', err)
      this.setData({ loading: false })
    }
  },

  // 解析 names 字段
  namesList(record) {
    if (!record) return []
    let names = record.names
    if (typeof names === 'string') {
      try { names = JSON.parse(names) } catch (e) { names = [] }
    }
    if (!Array.isArray(names)) names = []
    return names.slice(0, 3)  // 预览前 3 个
  }
})
