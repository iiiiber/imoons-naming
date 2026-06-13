// 通用工具
export const sleep = (ms) => new Promise(r => setTimeout(r, ms))

export const formatPrice = (yuan) => `¥${Number(yuan).toFixed(2)}`

export const formatDate = (date, fmt = 'YYYY-MM-DD HH:mm') => {
  if (!date) return ''
  const d = new Date(date)
  if (isNaN(d.getTime())) return String(date)
  const pad = (n) => String(n).padStart(2, '0')
  return fmt
    .replace('YYYY', d.getFullYear())
    .replace('MM', pad(d.getMonth() + 1))
    .replace('DD', pad(d.getDate()))
    .replace('HH', pad(d.getHours()))
    .replace('mm', pad(d.getMinutes()))
    .replace('ss', pad(d.getSeconds()))
}

export const truncate = (str, len = 20) => {
  if (!str) return ''
  return str.length > len ? str.slice(0, len) + '...' : str
}
