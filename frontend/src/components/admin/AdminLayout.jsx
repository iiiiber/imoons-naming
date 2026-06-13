import { useNavigate, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAdminStore } from '../../stores/adminStore.js'
import { LogOut, ShieldCheck, LayoutDashboard, Users, Ticket, FileText, BookOpen, Settings } from 'lucide-react'

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/users', label: '用户管理', icon: Users, end: false },
  { to: '/admin/codes', label: '卡密管理', icon: Ticket, end: false },
  { to: '/admin/records', label: '起名记录', icon: FileText, end: false },
  { to: '/admin/articles', label: '文章管理', icon: BookOpen, end: false },
  { to: '/admin/configs', label: '系统配置', icon: Settings, end: false },
]

export default function AdminLayout() {
  const { admin, token, logout } = useAdminStore()
  const nav = useNavigate()
  const loc = useLocation()

  // 未登录：踢到 login（保留 redirect）
  if (!token) {
    const redirect = loc.pathname
    nav('/admin/login?redirect=' + encodeURIComponent(redirect), { replace: true })
    return null
  }

  const handleLogout = () => {
    logout()
    nav('/admin/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-ink-50 flex flex-col">
      {/* Top bar */}
      <header className="bg-white border-b border-ink-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-ink-700" />
            <h1 className="text-base font-serif font-bold text-ink-900">起名网 · 管理后台</h1>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-ink-500 hidden sm:inline">{admin?.username}</span>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1 text-ink-500 hover:text-red-600 transition-colors"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">退出</span>
            </button>
          </div>
        </div>
      </header>

      {/* Tabs (admin 内部独立导航) */}
      <nav className="bg-white border-b border-ink-100 sticky top-14 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 overflow-x-auto">
          <div className="flex gap-1 -mb-px">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `inline-flex items-center gap-1.5 px-3 py-3 text-sm border-b-2 transition-colors whitespace-nowrap ${
                    isActive
                      ? 'border-ink-900 text-ink-900 font-medium'
                      : 'border-transparent text-ink-500 hover:text-ink-700'
                  }`
                }
              >
                <item.icon size={15} />
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6">
        <Outlet />
      </main>
    </div>
  )
}
