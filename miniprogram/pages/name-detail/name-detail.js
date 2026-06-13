// pages/name-detail/name-detail.js
const { copy } = require('../../utils/util.js')

const WUXING_COLORS = {
  '木': '#52a851',
  '火': '#d9534f',
  '土': '#c9a55c',
  '金': '#b8b8b8',
  '水': '#4a7cb8'
}

Page({
  data: {
    WUXING_COLORS,
    name: null,
    surname: '',
    fullName: '',
    score: '',
    pinyin: '',
    meaning: '',
    source: '',
    suitableReason: '',
    wuxingList: []  // ['木', '火']
  },

  onLoad(options) {
    // 优先用 storage 里的 current_name
    let name = wx.getStorageSync('current_name')
    const surname = wx.getStorageSync('current_surname') || ''
    const fullName = options.name ? decodeURIComponent(options.name) : (surname + (name?.name || ''))

    if (!name) {
      wx.showModal({
        title: '提示',
        content: '暂无名字数据',
        showCancel: false,
        success: () => wx.navigateBack()
      })
      return
    }

    const wuxingList = name.wuxing ? Array.from(name.wuxing) : []

    this.setData({
      name,
      surname,
      fullName,
      score: name.score || '',
      pinyin: name.pinyin || '',
      meaning: name.explanation || name.meaning || '',
      source: name.source || '',
      suitableReason: name.suitable_reason || name.suitableReason || '',
      wuxingList
    })
  },

  // 复制名字
  async copyName() {
    const ok = await copy(this.data.fullName)
    if (ok) wx.showToast({ title: '已复制' })
  },

  // 复制完整详情
  async copyAll() {
    const { fullName, pinyin, meaning, source } = this.data
    const text = `${fullName}\n拼音：${pinyin}\n寓意：${meaning}\n出处：${source}`
    const ok = await copy(text)
    if (ok) wx.showToast({ title: '已复制全部' })
  }
})
