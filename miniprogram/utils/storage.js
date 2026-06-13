// utils/storage.js
const KEY_PREFIX = 'imoons_naming_'

function k(key) {
  return KEY_PREFIX + key
}

function get(key, defaultValue = null) {
  try {
    const v = wx.getStorageSync(k(key))
    return v === '' || v === undefined || v === null ? defaultValue : v
  } catch (e) {
    return defaultValue
  }
}

function set(key, value) {
  try {
    wx.setStorageSync(k(key), value)
    return true
  } catch (e) {
    return false
  }
}

function remove(key) {
  try {
    wx.removeStorageSync(k(key))
    return true
  } catch (e) {
    return false
  }
}

function clear() {
  try {
    wx.clearStorageSync()
    return true
  } catch (e) {
    return false
  }
}

module.exports = { get, set, remove, clear }
