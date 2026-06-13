import { useState, useEffect } from 'react'
import { adminApi } from '../api/client.js'
import Card from '../components/ui/Card.jsx'
import Input from '../components/ui/Input.jsx'
import Button from '../components/ui/Button.jsx'
import { Search, RefreshCw, UserCheck, UserX, ChevronLeft, ChevronRight } from 'lucide-react'

export default function AdminUsers() {
  const [list, setList] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [keyword, setKeyword] = useState('')
  const [searchInput, setSearchInput] = useState('')
  // users.php 当前 LIMIT 100，不分页

  const load = async (kw = keyword) => {
    setLoading(true)
    setError('')
    try {
      const data = await adminApi.users(kw ? { keyword: kw } : {})
      setList(data.list || [])
      setTotal(data.total || 0)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleSearch = () => {
    setKeyword(searchInput.trim())
    load(searchInput.trim())
  }

  const handleClear = () => {
    setSearchInput('')
    setKeyword('')
    load('')
  }

  return (
    <div>
      {/* 搜索栏 */}
      <Card className="!p-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="按用户名或 openid 搜索"
              className="!pl-9"
            />
          </div>
          <Button onClick={handleSearch} size="sm">搜索</Button>
          {keyword && (
            <Button onClick={handleClear} variant="ghost" size="sm">清除</Button>
          )}
          <button
            onClick={() => load()}
            disabled={loading}
            className="p-2 text-ink-500 hover:text-ink-900 disabled:opacity-50"
            title="刷新"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </Card>

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {/* 列表 */}
      <Card className="!p-0 overflow-hidden">
        <div className="px-4 py-2.5 border-b border-ink-100 flex items-center justify-between text-sm">
          <span className="text-ink-700">用户列表</span>
          <span className="text-xs text-ink-400">共 {total} 条</span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-ink-400 text-sm">加载中...</div>
        ) : list.length === 0 ? (
          <div className="py-16 text-center text-ink-400 text-sm">暂无用户</div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-ink-50 text-ink-600 text-xs uppercase">
                  <tr>
                    <th className="px-4 py-2 text-left">ID</th>
                    <th className="px-4 py-2 text-left">用户名</th>
                    <th className="px-4 py-2 text-left">手机</th>
                    <th className="px-4 py-2 text-left">openid</th>
                    <th className="px-4 py-2 text-right">余额</th>
                    <th className="px-4 py-2 text-center">状态</th>
                    <th className="px-4 py-2 text-left">注册时间</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100">
                  {list.map((u) => (
                    <tr key={u.id} className="hover:bg-ink-50/50">
                      <td className="px-4 py-2.5 text-ink-500 tabular-nums">{u.id}</td>
                      <td className="px-4 py-2.5 text-ink-900 font-medium">{u.username || '-'}</td>
                      <td className="px-4 py-2.5 text-ink-600 tabular-nums">{u.phone || '-'}</td>
                      <td className="px-4 py-2.5 text-ink-500 text-xs truncate max-w-[180px]" title={u.openid}>
                        {u.openid ? `${u.openid.slice(0, 12)}...` : '-'}
                      </td>
                      <td className="px-4 py-2.5 text-right text-ink-700 tabular-nums">{u.balance ?? 0}</td>
                      <td className="px-4 py-2.5 text-center">
                        <StatusBadge status={u.status} />
                      </td>
                      <td className="px-4 py-2.5 text-ink-500 text-xs tabular-nums">
                        {formatTime(u.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-ink-100">
              {list.map((u) => (
                <div key={u.id} className="p-4">
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <div className="text-sm font-medium text-ink-900">
                        {u.username || '(匿名)'}
                      </div>
                      <div className="text-xs text-ink-400 mt-0.5">ID: {u.id}</div>
                    </div>
                    <StatusBadge status={u.status} />
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                    <div>
                      <span className="text-ink-400">手机</span>
                      <div className="text-ink-700 tabular-nums">{u.phone || '-'}</div>
                    </div>
                    <div>
                      <span className="text-ink-400">余额</span>
                      <div className="text-ink-700 tabular-nums">{u.balance ?? 0}</div>
                    </div>
                  </div>
                  <div className="text-xs text-ink-400 mt-2">
                    {formatTime(u.created_at)}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>
    </div>
  )
}

function StatusBadge({ status }) {
  if (status === 1) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
        <UserCheck size={12} />
        正常
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs text-ink-500 bg-ink-100 px-2 py-0.5 rounded">
      <UserX size={12} />
      停用
    </span>
  )
}

function formatTime(ts) {
  if (!ts) return '-'
  // 兼容 "2026-06-12 18:14:18" 格式
  return ts.replace('T', ' ').slice(0, 16)
}
