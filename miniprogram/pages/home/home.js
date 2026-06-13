// pages/home/home.js
const { articleApi } = require('../../utils/api.js')
const { timeAgo } = require('../../utils/util.js')

Page({
  data: {
    articles: [],
    loading: true,
    banners: [
      { id: 1, title: 'AI 智能起名', subtitle: '基于八字喜用神', emoji: '🧠' },
      { id: 2, title: '专业八字排盘', subtitle: '四柱 + 农历转换', emoji: '📜' },
      { id: 3, title: '起名知识文章', subtitle: '海量干货', emoji: '📖' }
    ],
    quickEntries: [
      { id: 'naming', title: '立即起名', icon: '✨', color: '#dbeafe', url: '/pages/naming/naming' },
      { id: 'articles', title: '起名知识', icon: '📚', color: '#fef3c7', url: '/pages/articles/articles' },
      { id: 'records', title: '我的起名', icon: '📋', color: '#d1fae5', url: '/pages/user-records/user-records' },
      { id: 'card', title: '卡密兑换', icon: '🎫', color: '#fee2e2', url: '/pages/login-card/login-card' }
    ]
  },

  onLoad() {
    this.loadArticles()
  },

  onPullDownRefresh() {
    this.loadArticles().then(() => wx.stopPullDownRefresh())
  },

  async loadArticles() {
    this.setData({ loading: true })
    try {
      const res = await articleApi.list({ page: 1, per_page: 5 })
      // 兼容后端两种返回格式: { data: { list: [...] } } 或 { list: [...] }
      const list = res?.data?.list || res?.list || []
      this.setData({ articles: list, loading: false })
    } catch (err) {
      console.error('加载文章失败:', err)
      this.setData({ loading: false })
    }
  },

  // 跳转到起名
  goNaming() {
    wx.switchTab({ url: '/pages/naming/naming' })
  },

  // 跳转到文章详情
  goArticle(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/article-detail/article-detail?id=${id}` })
  },

  // 跳转到快捷入口
  goEntry(e) {
    const url = e.currentTarget.dataset.url
    // tabBar 页面用 switchTab，其他用 navigateTo
    if (url.startsWith('/pages/articles/') || url.startsWith('/pages/naming/') || url.startsWith('/pages/user/')) {
      wx.switchTab({ url: url.replace('/pages/articles/articles', '/pages/articles/articles').replace('/pages/naming/naming', '/pages/naming/naming').replace('/pages/user/user', '/pages/user/user') })
    } else {
      wx.navigateTo({ url })
    }
  }
})
