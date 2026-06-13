import { Link, useLocation } from 'react-router-dom'
import { Home, Sparkles, BookOpen, User } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore.js'
import clsx from 'clsx'

const items = [
  { to: '/', label: '首页', icon: Home },
  { to: '/naming', label: '起名', icon: Sparkles },
  { to: '/articles', label: '知识', icon: BookOpen },
]

export default function MobileNav() {
  const location = useLocation()
  const { user } = useAuthStore()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur border-t border-ink-100 pb-safe">
      <div className="grid grid-cols-4 h-14">
        {items.map(item => {
          const Icon = item.icon
          const active = location.pathname === item.to
          return (
            <Link
              key={item.to}
              to={item.to}
              className={clsx(
                'flex flex-col items-center justify-center gap-0.5 text-xs transition',
                active ? 'text-primary-600' : 'text-ink-500'
              )}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 2} />
              <span>{item.label}</span>
            </Link>
          )
        })}
        {/* 我的（动态） */}
        <Link
          to={user ? '/user' : '/login'}
          className={clsx(
            'flex flex-col items-center justify-center gap-0.5 text-xs transition',
            location.pathname === '/user' ? 'text-primary-600' : 'text-ink-500'
          )}
        >
          <User size={20} strokeWidth={location.pathname === '/user' ? 2.5 : 2} />
          <span>{user ? '我的' : '登录'}</span>
        </Link>
      </div>
    </nav>
  )
}
