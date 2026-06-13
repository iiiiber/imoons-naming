import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { LogOut, User as UserIcon, Sparkles, Ticket, ArrowRight, History, BookOpen } from 'lucide-react'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import { useAuthStore } from '../stores/authStore.js'
import { userApi } from '../api/client.js'
import { toast } from '../components/ui/Toast.jsx'

export default function User() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [recordCount, setRecordCount] = useState(0)
  const [loadingCount, setLoadingCount] = useState(true)

  const handleLogout = async () => {
    await logout()
    toast.success('已退出登录')
    navigate('/')
  }

  // 主页只取总数（轻量），不进列表
  useEffect(() => {
    if (!user) return
    setLoadingCount(true)
    userApi
      .history({ page: 1, pageSize: 1 })
      .then((d) => setRecordCount(d.total || 0))
      .catch(() => setRecordCount(0))
      .finally(() => setLoadingCount(false))
  }, [user])

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <Card className="text-center max-w-md w-full">
          <h2 className="text-lg font-medium text-ink-900 mb-2">请先登录</h2>
          <p className="text-sm text-ink-500 mb-4">登录后可使用 AI 起名服务</p>
          <Link to="/login?redirect=/user">
            <Button size="lg" className="w-full">立即登录</Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-10 pb-24 md:pb-10 animate-fade-in">
      {/* 头部信息 */}
      <Card className="mb-4 sm:mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-2xl font-serif font-bold flex-shrink-0">
            {(user.nickname || user.username || '?').charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-medium text-ink-900 truncate">{user.nickname || user.username}</h2>
            <p className="text-sm text-ink-500">
              {user.loginType === 'card' ? '卡密会员' : '注册用户'}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut size={16} />
          </Button>
        </div>
      </Card>

      {/* 会员状态 */}
      <Card className={`mb-4 ${user.isMember ? 'bg-gradient-to-br from-primary-50 to-amber-50' : ''}`}>
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${user.isMember ? 'bg-primary-500 text-white' : 'bg-ink-100 text-ink-400'}`}>
            {user.isMember ? <Sparkles size={22} /> : <UserIcon size={22} />}
          </div>
          <div className="flex-1">
            <h3 className="text-base font-medium text-ink-800">
              {user.isMember ? '会员生效中' : '未开通会员'}
            </h3>
            <p className="text-sm text-ink-500 mt-0.5">
              {user.isMember ? `剩余 ${user.balance} 次起名机会` : '登录后只能体验 3 个名字'}
            </p>
          </div>
          {!user.isMember && (
            <Link to="/login">
              <Button size="sm" variant="outline">
                <Ticket size={14} /> 激活
              </Button>
            </Link>
          )}
        </div>
      </Card>

      {/* 快捷入口（3 个：起名 / 记录 / 知识）—— 形态完全一致 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link to="/naming" className="block">
          <Card hover>
            <Sparkles className="text-primary-500 mb-2" size={24} />
            <h3 className="font-medium text-ink-800 mb-1">开始一次新的起名</h3>
            <p className="text-xs text-ink-500 flex items-center gap-1">
              立即使用 <ArrowRight size={12} />
            </p>
          </Card>
        </Link>

        <Link to="/user/records" className="block">
          <Card hover>
            <div className="flex items-start justify-between mb-2">
              <History className="text-primary-500" size={24} />
              {!loadingCount && recordCount > 0 && (
                <span className="text-[10px] font-medium text-primary-600 bg-primary-50 border border-primary-100 rounded-full px-2 py-0.5">
                  {recordCount} 条
                </span>
              )}
            </div>
            <h3 className="font-medium text-ink-800 mb-1">我的起名记录</h3>
            <p className="text-xs text-ink-500 flex items-center gap-1">
              查看历史 <ArrowRight size={12} />
            </p>
          </Card>
        </Link>

        <Link to="/articles" className="block sm:col-span-2">
          <Card hover>
            <BookOpen className="text-primary-500 mb-2" size={24} />
            <h3 className="font-medium text-ink-800 mb-1">浏览起名知识</h3>
            <p className="text-xs text-ink-500 flex items-center gap-1">
              了解更多 <ArrowRight size={12} />
            </p>
          </Card>
        </Link>
      </div>
    </div>
  )
}
