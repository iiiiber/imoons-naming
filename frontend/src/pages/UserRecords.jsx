import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, ArrowLeft, FileText, Calendar, Sparkles } from 'lucide-react'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import { useAuthStore } from '../stores/authStore.js'
import { userApi } from '../api/client.js'

export default function UserRecords() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [records, setRecords] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [pageSize] = useState(5)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')

  const load = async (p = 1) => {
    setLoading(true)
    setErr('')
    try {
      const data = await userApi.history({ page: p, pageSize })
      setRecords(data.list || [])
      setTotal(data.total || 0)
      setPage(data.page || 1)
      setTotalPages(data.totalPages || 0)
    } catch (e) {
      setErr(e.message || '加载失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) load(1)
  }, [user])

  // 未登录 → 跳登录（带 redirect 回来）
  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <Card className="text-center max-w-md w-full">
          <h2 className="text-lg font-medium text-ink-900 mb-2">请先登录</h2>
          <p className="text-sm text-ink-500 mb-4">登录后可查看起名记录</p>
          <Link to="/login?redirect=/user/records">
            <Button size="lg" className="w-full">立即登录</Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-10 pb-24 md:pb-10 animate-fade-in">
      {/* 顶部：返回 + 标题 + 总数 */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/user')}
            className="p-1.5 -ml-1.5 rounded-lg hover:bg-ink-100 text-ink-600"
            aria-label="返回个人中心"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-lg sm:text-xl font-medium text-ink-900">我的起名记录</h1>
            {!loading && (
              <p className="text-xs text-ink-500 mt-0.5">共 {total} 条</p>
            )}
          </div>
        </div>
      </div>

      {/* 错误态 */}
      {err && (
        <Card className="mb-3 !p-3 !bg-red-50 border border-red-200">
          <p className="text-sm text-red-600">{err}</p>
        </Card>
      )}

      {/* 加载态 */}
      {loading ? (
        <Card>
          <div className="py-8 text-center text-ink-400 text-sm">加载中...</div>
        </Card>
      ) : records.length === 0 ? (
        /* 空态 */
        <Card className="text-center">
          <FileText size={32} className="mx-auto mb-2 text-ink-300" />
          <p className="text-sm text-ink-500 mb-3">还没有起名记录</p>
          <Link to="/naming">
            <Button size="sm" variant="outline">
              <Sparkles size={14} />
              开始第一次起名
            </Button>
          </Link>
        </Card>
      ) : (
        /* 列表 */
        <>
          <div className="space-y-3">
            {records.map((r) => (
              <RecordCard key={r.id} record={r} />
            ))}
          </div>

          {/* 分页 */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => load(page - 1)}
                disabled={page === 1}
              >
                <ChevronLeft size={14} />
                上一页
              </Button>
              <span className="text-xs text-ink-500 px-2 tabular-nums">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => load(page + 1)}
                disabled={page === totalPages}
              >
                下一页
                <ChevronRight size={14} />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// 单条记录卡片（沿用主页原 RecordCard 风格）
function RecordCard({ record }) {
  const bazi = record.bazi
  const pillars = bazi && typeof bazi === 'object'
    ? ['year', 'month', 'day', 'hour'].map((k) => bazi[k]).filter(Boolean)
    : []
  const names = record.names_parsed || []
  const xiYong = bazi?.xiyongshen

  return (
    <Card hover>
      {/* 头部：姓 + 性别 + 生日 + 时间 */}
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-ink-100">
        <div className="flex items-center gap-2 text-sm flex-wrap">
          <span className="font-serif text-lg font-bold text-ink-900">{record.surname}</span>
          <GenderBadge gender={record.gender} />
          <span className="text-xs text-ink-400 hidden sm:inline">·</span>
          <span className="text-xs text-ink-500 inline-flex items-center gap-1">
            <Calendar size={12} />
            {record.birthday || '未填'}
          </span>
        </div>
        <span className="text-xs text-ink-400 tabular-nums">
          {formatTime(record.created_at)}
        </span>
      </div>

      {/* 八字四柱 + 喜用神 */}
      {pillars.length > 0 && (
        <div className="mb-3">
          <div className="grid grid-cols-4 gap-1.5 text-center">
            {pillars.map((p, i) => (
              <div key={i} className="bg-ink-50 rounded-md py-1.5">
                <div className="text-[10px] text-ink-400">{['年', '月', '日', '时'][i]}</div>
                <div className="font-serif text-sm font-medium text-ink-800">
                  {typeof p === 'string' ? p : (p?.name || '—')}
                </div>
              </div>
            ))}
          </div>
          {xiYong && (
            <div className="mt-2 text-xs">
              <span className="text-ink-400">喜用神：</span>
              <span className="text-emerald-700">
                {Array.isArray(xiYong) ? xiYong.join('、') : String(xiYong)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* 推荐名字 chip */}
      {names.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {names.slice(0, 6).map((n, i) => (
            <span
              key={i}
              className="px-2.5 py-1 rounded-full text-sm font-serif text-ink-800 bg-primary-50 border border-primary-100"
            >
              {record.surname}{n}
            </span>
          ))}
          {names.length > 6 && (
            <span className="px-2 py-1 text-xs text-ink-400">+{names.length - 6}</span>
          )}
        </div>
      ) : (
        <p className="text-xs text-ink-400">（无名字数据）</p>
      )}
    </Card>
  )
}

function GenderBadge({ gender }) {
  if (gender === 'male' || gender === 'boy') {
    return <span className="text-xs text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">男</span>
  }
  if (gender === 'female' || gender === 'girl') {
    return <span className="text-xs text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded">女</span>
  }
  return null
}

function formatTime(ts) {
  if (!ts) return ''
  return ts.replace('T', ' ').slice(0, 16)
}
