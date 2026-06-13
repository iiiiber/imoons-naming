// pages/articles/articles.js
const { articleApi } = require('../../utils/api.js')
const { timeAgo } = require('../../utils/util.js')

Page({
  data: {
    list: [],
    loading: true,
    page: 1,
    perPage: 20,
    hasMore: true,
    loadingMore: false
  },

  onLoad() {
    this.loadList()
  },

  onPullDownRefresh() {
    this.setData({ page: 1, hasMore: true })
    this.loadList().then(() => wx.stopPullDownRefresh())
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loadingMore) {
      this.loadMore()
    }
  },

  async loadList() {
    this.setData({ loading: true })
    try {
      const res = await articleApi.list({ page: 1, per_page: this.data.perPage })
      const list = res?.data?.list || res?.list || []
      const total = res?.data?.total ?? res?.total ?? 0
      this.setData({
        list,
        loading: false,
        hasMore: list.length < total
      })
    } catch (err) {
      console.error('加载文章失败:', err)
      this.setData({ loading: false })
    }
  },

  async loadMore() {
    this.setData({ loadingMore: true, page: this.data.page + 1 })
    try {
      const res = await articleApi.list({ page: this.data.page, per_page: this.data.perPage })
      const list = res?.data?.list || res?.list || []
      const total = res?.data?.total ?? res?.total ?? 0
      this.setData({
        list: [...this.data.list, ...list],
        loadingMore: false,
        hasMore: this.data.list.length < total
      })
    } catch (err) {
      console.error('加载更多失败:', err)
      this.setData({ loadingMore: false })
    }
  },

  goDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/article-detail/article-detail?id=${id}` })
  }
})
