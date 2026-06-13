// utils/util.js
// 通用工具

/** 格式化日期 yyyy-MM-dd HH:mm */
function formatDate(timestamp, withTime = true) {
  if (!timestamp) return ''
  const d = timestamp instanceof Date ? timestamp : new Date(timestamp * 1000)
  const pad = n => n < 10 ? '0' + n : n
  let s = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  if (withTime) s += ` ${pad(d.getHours())}:${pad(d.getMinutes())}`
  return s
}

/** 相对时间: "3 分钟前" */
function timeAgo(timestamp) {
  if (!timestamp) return ''
  const now = Math.floor(Date.now() / 1000)
  const t = typeof timestamp === 'number' ? timestamp : Math.floor(new Date(timestamp).getTime() / 1000)
  const diff = now - t
  if (diff < 60) return '刚刚'
  if (diff < 3600) return `${Math.floor(diff / 60)} 分钟前`
  if (diff < 86400) return `${Math.floor(diff / 3600)} 小时前`
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)} 天前`
  return formatDate(t, false)
}

/** 五行取色 class */
function wuxingClass(wx) {
  const map = { '木': 'wx-mu', '火': 'wx-huo', '土': 'wx-tu', '金': 'wx-jin', '水': 'wx-shui' }
  return map[wx] || ''
}

function wuxingChipClass(wx) {
  const map = { '木': 'wx-chip-mu', '火': 'wx-chip-huo', '土': 'wx-chip-tu', '金': 'wx-chip-jin', '水': 'wx-chip-shui' }
  return map[wx] || ''
}

/** 复制到剪贴板 */
function copy(text) {
  return new Promise((resolve) => {
    wx.setClipboardData({
      data: text,
      success: () => resolve(true),
      fail: () => resolve(false)
    })
  })
}

module.exports = { formatDate, timeAgo, wuxingClass, wuxingChipClass, copy }
