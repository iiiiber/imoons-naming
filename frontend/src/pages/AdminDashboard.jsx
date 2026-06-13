import { useState, useEffect } from 'react'
import { adminApi } from '../api/client.js'
import Card from '../components/ui/Card.jsx'
import { Users, Ticket, FileText, TrendingUp, RefreshCw, Activity } from 'lucide-react'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await adminApi.stats()
      setStats(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  // 计算最近30天最大计数（用于趋势图高度）
  const maxCount = stats?.trend ? Math.max(1, ...stats.trend.flatMap(t => [t.records, t.users])) : 1

  return (
    <div>
      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {/* KPI 卡片 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <KpiCard
          icon={Users}
          label="总用户"
          value={stats?.users.total}
          sub={`活跃 ${stats?.users.active ?? 0}`}
          color="blue"
          loading={loading}
        />
        <KpiCard
          icon={Ticket}
          label="卡密"
          value={stats?.codes.total}
          sub={`已用 ${stats?.codes.used ?? 0} 次`}
          color="amber"
          loading={loading}
        />
        <KpiCard
          icon={FileText}
          label="起名记录"
          value={stats?.records.total}
          sub={`AI ${stats?.records.ai ?? 0} · 本地 ${stats?.records.local ?? 0}`}
          color="emerald"
          loading={loading}
        />
        <KpiCard
          icon={TrendingUp}
          label="今日"
          value={(stats?.today.records ?? 0) + (stats?.today.users ?? 0)}
          sub={`起名 ${stats?.today.records ?? 0} · 新增 ${stats?.today.users ?? 0}`}
          color="rose"
          loading={loading}
        />
      </div>

      {/* 趋势图 */}
      <Card className="!p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-medium text-ink-900 flex items-center gap-2">
              <Activity size={18} className="text-ink-500" />
              最近 30 天趋势
            </h2>
            <p className="text-xs text-ink-400 mt-0.5">起名次数与新增用户</p>
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="inline-flex items-center gap-1 text-sm text-ink-500 hover:text-ink-900 disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            刷新
          </button>
        </div>

        {loading && !stats ? (
          <div className="h-48 flex items-center justify-center text-ink-400 text-sm">加载中...</div>
        ) : (
          <div className="space-y-1">
            <div className="flex items-end gap-px h-40">
              {stats?.trend.map((t) => (
                <div
                  key={t.date}
                  className="flex-1 group relative"
                  title={`${t.date}\n起名 ${t.records} · 新增 ${t.users}`}
                >
                  <div
                    className="bg-ink-900 hover:bg-ink-700 transition-colors w-full"
                    style={{ height: `${(t.records / maxCount) * 100}%` }}
                  />
                  <div
                    className="bg-amber-500 hover:bg-amber-600 transition-colors w-full mt-px"
                    style={{ height: `${(t.users / maxCount) * 100}%` }}
                  />
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between text-xs text-ink-400 pt-2">
              <span>{stats?.trend[0]?.date}</span>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1">
                  <span className="inline-block w-2 h-2 bg-ink-900" />
                  起名
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="inline-block w-2 h-2 bg-amber-500" />
                  新增用户
                </span>
              </div>
              <span>{stats?.trend[stats.trend.length - 1]?.date}</span>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}

function KpiCard({ icon: Icon, label, value, sub, color, loading }) {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    rose: 'bg-rose-50 text-rose-600',
  }
  return (
    <Card className="!p-4">
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs text-ink-500">{label}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorMap[color]}`}>
          <Icon size={16} />
        </div>
      </div>
      {loading ? (
        <div className="h-7 bg-ink-100 rounded animate-pulse" />
      ) : (
        <div className="text-2xl font-bold text-ink-900 tabular-nums">{value ?? 0}</div>
      )}
      {sub && <div className="text-xs text-ink-400 mt-1">{sub}</div>}
    </Card>
  )
}
