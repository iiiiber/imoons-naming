import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAdminStore } from '../stores/adminStore.js'
import Button from '../components/ui/Button.jsx'
import Input from '../components/ui/Input.jsx'
import { Lock, User, ShieldCheck } from 'lucide-react'

export default function AdminLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [localError, setLocalError] = useState('')
  const { login, loading, error, isAuthed } = useAdminStore()
  const nav = useNavigate()
  const [params] = useSearchParams()
  const redirect = params.get('redirect') || '/admin'

  const [checking, setChecking] = useState(true)
  useEffect(() => {
    // 用 check() 异步验证 token 有效性（避免本地有 token 但服务端已失效导致的闪屏）
    let cancelled = false
    useAdminStore.getState().check().then((ok) => {
      if (cancelled) return
      setChecking(false)
      if (ok) nav(redirect, { replace: true })
    })
    return () => { cancelled = true }
  }, [nav, redirect])

  const submit = async (e) => {
    e.preventDefault()
    setLocalError('')
    if (!username.trim() || !password) {
      setLocalError('请输入用户名和密码')
      return
    }
    try {
      await login({ username: username.trim(), password })
      nav(redirect, { replace: true })
    } catch {
      // error 已在 store 里
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ink-50 via-white to-ink-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 items-center justify-center rounded-full bg-ink-900 text-white mb-4">
            <ShieldCheck size={28} />
          </div>
          <h1 className="text-2xl font-serif font-bold text-ink-900">管理员登录</h1>
          <p className="mt-2 text-sm text-ink-500">起名网 · 后台管理系统</p>
        </div>

        {checking ? (
          <div className="bg-white rounded-2xl shadow-sm border border-ink-100 p-12 text-center">
            <div className="inline-block w-8 h-8 border-2 border-ink-200 border-t-primary-500 rounded-full animate-spin"></div>
            <p className="mt-3 text-sm text-ink-500">正在验证登录状态...</p>
          </div>
        ) : (

        <form onSubmit={submit} className="bg-white rounded-2xl shadow-sm border border-ink-100 p-6 space-y-4">
          <div className="relative">
            <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="管理员账号"
              className="!pl-10"
              autoComplete="username"
            />
          </div>
          <div className="relative">
            <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="密码"
              className="!pl-10"
              autoComplete="current-password"
            />
          </div>

          {(localError || error) && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {localError || error}
            </div>
          )}

          <Button type="submit" loading={loading} className="w-full !py-3">
            登 录
          </Button>

          <p className="text-xs text-center text-ink-400 pt-2">
            仅限管理员使用 · 登录信息将被记录
          </p>
        </form>
        )}
      </div>
    </div>
  )
}
