// pages/naming/naming.js
// 八字起名表单（对齐 React 端 Naming.jsx）
const { chartApi } = require('../../utils/api.js')

// 12 时辰（两小时一段）
const SHICHEN = [
  { value: '00-01', label: '子时 (23:00-01:00)' },
  { value: '01-03', label: '丑时 (01:00-03:00)' },
  { value: '03-05', label: '寅时 (03:00-05:00)' },
  { value: '05-07', label: '卯时 (05:00-07:00)' },
  { value: '07-09', label: '辰时 (07:00-09:00)' },
  { value: '09-11', label: '巳时 (09:00-11:00)' },
  { value: '11-13', label: '午时 (11:00-13:00)' },
  { value: '13-15', label: '未时 (13:00-15:00)' },
  { value: '15-17', label: '申时 (15:00-17:00)' },
  { value: '17-19', label: '酉时 (17:00-19:00)' },
  { value: '19-21', label: '戌时 (19:00-21:00)' },
  { value: '21-23', label: '亥时 (21:00-23:00)' }
]

// 9 个偏好 tag
const PREF_TAGS = [
  '诗词典故', '成语起名', '周易国学', '儒雅古风',
  '自然意象', '清新文艺', '品德志向', '霸气响亮', '现代简约'
]

Page({
  data: {
    SHICHEN,
    // 初始为 [{name, selected: false}, ...]
    prefTags: PREF_TAGS.map(t => ({ name: t, selected: false })),
    form: {
      surname: '李',
      gender: 'male',
      birthDate: '',
      birthTime: '11-13',
      nameLength: '3',
      calendar: 'solar',
      customPref: '',
      preferences: []
    },
    submitting: false,
    birthTimeIndex: 6  // 默认午时
  },

  onLoad() {
    // 默认日期：今天
    const today = new Date()
    const yyyy = today.getFullYear()
    const mm = String(today.getMonth() + 1).padStart(2, '0')
    const dd = String(today.getDate()).padStart(2, '0')
    this.setData({ 'form.birthDate': `${yyyy}-${mm}-${dd}` })
  },

  // ============ 表单输入 ============
  onInput(e) {
    const field = e.currentTarget.dataset.field
    this.setData({ [`form.${field}`]: e.detail.value })
  },

  onRadio(e) {
    const field = e.currentTarget.dataset.field
    this.setData({ [`form.${field}`]: e.detail.value })
  },

  onDateChange(e) {
    this.setData({ 'form.birthDate': e.detail.value })
  },

  onTimeChange(e) {
    this.setData({
      'form.birthTime': SHICHEN[e.detail.value].value,
      birthTimeIndex: Number(e.detail.value)
    })
  },

  // 偏好 tag 切换
  togglePref(e) {
    const idx = e.currentTarget.dataset.idx
    const tags = this.data.prefTags
    tags[idx].selected = !tags[idx].selected
    this.setData({ prefTags: tags })
  },

  // ============ 提交 ============
  async onSubmit() {
    const f = this.data.form
    if (!f.surname) return wx.showToast({ title: '请输入姓氏', icon: 'none' })
    if (!f.birthDate) return wx.showToast({ title: '请选择出生日期', icon: 'none' })

    this.setData({ submitting: true })

    try {
      // 时辰段 "11-13" → 取中间值 12:30
      const [sh, eh] = f.birthTime.split('-').map(Number)
      const hour = Math.floor((sh + eh) / 2) % 24
      const birthtime = `${String(hour).padStart(2, '0')}:30`

      // 合并偏好
      const prefs = this.data.prefTags.filter(t => t.selected).map(t => t.name)
      if (f.customPref && f.customPref.trim()) {
        prefs.push('自定义：' + f.customPref.trim())
      }

      // 1. 排盘
      wx.showLoading({ title: '排盘中...', mask: true })
      const chart = await chartApi.analyze({
        surname: f.surname,
        gender: f.gender === 'male' ? 'boy' : 'girl',
        birthday: f.birthDate,
        birthtime,
        nameLength: Number(f.nameLength),
        preferences: prefs,
        calendar: f.calendar
      })

      // 2. 推荐名字（最长 60s）
      wx.showLoading({ title: 'AI 起名中（约 30-60 秒）...', mask: true })
      const recommend = await chartApi.recommend({
        surname: f.surname,
        gender: f.gender === 'male' ? 'boy' : 'girl',
        birthday: f.birthDate,
        birthtime,
        nameLength: Number(f.nameLength),
        preferences: prefs,
        calendar: f.calendar,
        bazi: chart.bazi_computed || chart.bazi || null
      })

      // 3. 合并结果存 storage
      const result = { ...chart, ...recommend }
      wx.setStorageSync('bazi_chart', result)
      wx.setStorageSync('bazi_form', { ...f, birthtime })

      // 4. 保存记录
      try {
        await chartApi.record({
          surname: f.surname,
          gender: f.gender === 'male' ? 'boy' : 'girl',
          birthday: f.birthDate,
          bazi: result.bazi_computed || result.bazi || null,
          names: result.names || [],
          source: result.source || 'ai',
          preferences: prefs
        })
      } catch (e) {
        console.warn('保存起名记录失败：', e.message)
      }

      wx.hideLoading()
      wx.navigateTo({ url: '/pages/naming-result/naming-result' })
    } catch (err) {
      wx.hideLoading()
      console.error('起名失败:', err)
      wx.showModal({
        title: '起名失败',
        content: err.message || '请稍后重试',
        showCancel: false
      })
    } finally {
      this.setData({ submitting: false })
    }
  }
})
