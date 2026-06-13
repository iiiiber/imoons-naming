// pages/article-detail/article-detail.js
const { articleApi } = require('../../utils/api.js')

Page({
  data: {
    article: null,
    loading: true
  },

  onLoad(options) {
    const id = options.id
    if (!id) {
      wx.navigateBack()
      return
    }
    this.loadDetail(id)
  },

  async loadDetail(id) {
    try {
      const res = await articleApi.detail(id)
      const article = res?.data || res
      this.setData({ article, loading: false })
      // 动态标题
      if (article?.title) {
        wx.setNavigationBarTitle({ title: article.title.substring(0, 15) })
      }
    } catch (err) {
      console.error('加载文章失败:', err)
      this.setData({ loading: false })
    }
  }
})
