// utils/auth.js
const storage = require('./storage.js')

// 两套 token: user(普通用户) / admin(后台管理员)
function getToken(scope) {
  return storage.get('token_' + scope, '')
}

function setToken(scope, token) {
  return storage.set('token_' + scope, token)
}

function clearToken(scope) {
  return storage.remove('token_' + scope)
}

// 解析 admin token（base64）
function parseAdminToken(token) {
  if (!token) return null
  try {
    return JSON.parse(atob(token))
  } catch (e) {
    return null
  }
}

module.exports = {
  getToken,
  setToken,
  clearToken,
  parseAdminToken
}
