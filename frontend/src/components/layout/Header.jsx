import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore.js'
import { User, LogOut, Menu, X, Shield } from 'lucide-react'
import { useState } from 'react'

export default function Header() {
  const { user, logout } = useAuthStore()
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    setOpen(false)
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-ink-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center text-white font-serif text-lg">名</div>
          <span className="font-serif text-lg font-bold text-ink-800">起名网</span>
        </Link>

        {/* 桌面 nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link to="/" className="text-ink-700 hover:text-primary-600 transition">首页</Link>
          <Link to="/naming" className="text-ink-700 hover:text-primary-600 transition">在线起名</Link>
          <Link to="/articles" className="text-ink-700 hover:text-primary-600 transition">起名知识</Link>
          {user && <Link to="/user" className="text-ink-700 hover:text-primary-600 transition">我的</Link>}
        </nav>

        {/* 右侧操作 */}
        <div className="flex items-center gap-2">
          {user ? (
            <div className="hidden md:flex items-center gap-3">
              <Link to="/user" className="flex items-center gap-1.5 text-sm text-ink-700 hover:text-primary-600">
                <User size={16} />
                <span>{user.nickname || user.username}</span>
              </Link>
              <button onClick={handleLogout} className="text-sm text-ink-500 hover:text-ink-700">
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link to="/login" className="text-sm text-ink-700 hover:text-primary-600 px-3 py-1.5">登录</Link>
              <Link to="/register" className="btn btn-primary text-sm py-1.5 px-4">注册</Link>
            </div>
          )}

          {/* 移动端汉堡 */}
          <Link
            to="/admin/login"
            className="p-2 text-ink-400 hover:text-ink-700"
            title="管理后台"
            aria-label="管理后台"
          >
            <Shield size={18} />
          </Link>
          <button
            className="md:hidden p-2 -mr-2"
            onClick={() => setOpen(!open)}
            aria-label="菜单"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* 移动端展开菜单 */}
      {open && (
        <div className="md:hidden border-t border-ink-100 bg-white animate-fade-in">
          <div className="px-4 py-3 space-y-1">
            <Link to="/" onClick={() => setOpen(false)} className="block px-3 py-2.5 rounded-lg hover:bg-ink-50 text-ink-700">首页</Link>
            <Link to="/naming" onClick={() => setOpen(false)} className="block px-3 py-2.5 rounded-lg hover:bg-ink-50 text-ink-700">在线起名</Link>
            <Link to="/articles" onClick={() => setOpen(false)} className="block px-3 py-2.5 rounded-lg hover:bg-ink-50 text-ink-700">起名知识</Link>
            <Link to="/admin/login" onClick={() => setOpen(false)} className="block px-3 py-2.5 rounded-lg hover:bg-ink-50 text-ink-400 text-sm">管理后台</Link>
            {user ? (
              <>
                <Link to="/user" onClick={() => setOpen(false)} className="block px-3 py-2.5 rounded-lg hover:bg-ink-50 text-ink-700">
                  我的（{user.nickname || user.username}）
                </Link>
                <button onClick={handleLogout} className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-ink-50 text-ink-500">退出登录</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)} className="block px-3 py-2.5 rounded-lg hover:bg-ink-50 text-ink-700">登录</Link>
                <Link to="/register" onClick={() => setOpen(false)} className="block px-3 py-2.5 rounded-lg hover:bg-ink-50 text-primary-600 font-medium">注册</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
