import { useState, useEffect } from 'react'
import { adminApi } from '../api/client.js'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import Input from '../components/ui/Input.jsx'
import Modal from '../components/ui/Modal.jsx'
import { Plus, RefreshCw, Copy, Power, Edit, Check, X } from 'lucide-react'

export default function AdminCodes() {
  const [list, setList] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  // 创建 modal
  const [showCreate, setShowCreate] = useState(false)
  // 编辑 modal
  const [editing, setEditing] = useState(null)
  // 创建结果展示
  const [created, setCreated] = useState(null)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await adminApi.codes()
      setList(data.list || [])
      setTotal(data.total || 0)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleToggle = async (id) => {
    try {
      await adminApi.toggleCode(id)
      load()
    } catch (err) {
      alert('切换失败：' + err.message)
    }
  }

  const copyAll = (codes) => {
    const text = codes.map(c => c.code).join('\n')
    navigator.clipboard.writeText(text)
      .then(() => alert(`已复制 ${codes.length} 个卡密`))
      .catch(() => alert('复制失败，请手动复制'))
  }

  return (
    <div>
      {/* 工具栏 */}
      <Card className="!p-3 mb-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-ink-500">共 {total} 条</div>
          <div className="flex items-center gap-2">
            <Button onClick={() => setShowCreate(true)} size="sm" className="inline-flex items-center gap-1">
              <Plus size={14} />
              生成卡密
            </Button>
            <button
              onClick={load}
              disabled={loading}
              className="p-2 text-ink-500 hover:text-ink-900 disabled:opacity-50"
              title="刷新"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </Card>

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {/* 列表 */}
      <Card className="!p-0 overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-ink-400 text-sm">加载中...</div>
        ) : list.length === 0 ? (
          <div className="py-16 text-center text-ink-400 text-sm">暂无卡密</div>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-ink-50 text-ink-600 text-xs uppercase">
                  <tr>
                    <th className="px-4 py-2 text-left">ID</th>
                    <th className="px-4 py-2 text-left">卡密</th>
                    <th className="px-4 py-2 text-right">面值</th>
                    <th className="px-4 py-2 text-right">已用/上限</th>
                    <th className="px-4 py-2 text-left">创建人</th>
                    <th className="px-4 py-2 text-left">过期时间</th>
                    <th className="px-4 py-2 text-left">创建时间</th>
                    <th className="px-4 py-2 text-center">状态</th>
                    <th className="px-4 py-2 text-center">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100">
                  {list.map((c) => (
                    <tr key={c.id} className="hover:bg-ink-50/50">
                      <td className="px-4 py-2.5 text-ink-500 tabular-nums">{c.id}</td>
                      <td className="px-4 py-2.5 font-mono text-ink-900 font-medium">{c.code}</td>
                      <td className="px-4 py-2.5 text-right text-ink-700 tabular-nums">{c.amount}</td>
                      <td className="px-4 py-2.5 text-right text-ink-700 tabular-nums">{c.used_count}/{c.max_use}</td>
                      <td className="px-4 py-2.5 text-ink-500 text-xs">{c.creator_name || '-'}</td>
                      <td className="px-4 py-2.5 text-ink-500 text-xs tabular-nums">{c.expired_at || '永久'}</td>
                      <td className="px-4 py-2.5 text-ink-500 text-xs tabular-nums">{formatTime(c.created_at)}</td>
                      <td className="px-4 py-2.5 text-center">
                        <CodeStatusBadge status={c.status} />
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setEditing(c)}
                            className="p-1.5 text-ink-500 hover:text-ink-900"
                            title="编辑"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleToggle(c.id)}
                            className="p-1.5 text-ink-500 hover:text-ink-900"
                            title="启停切换"
                          >
                            <Power size={14} />
                          </button>
                          <button
                            onClick={() => copyAll([c])}
                            className="p-1.5 text-ink-500 hover:text-ink-900"
                            title="复制"
                          >
                            <Copy size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-ink-100">
              {list.map((c) => (
                <div key={c.id} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-mono text-sm font-medium text-ink-900 truncate">{c.code}</div>
                      <div className="text-xs text-ink-400 mt-0.5">面值 {c.amount} · 已用 {c.used_count}/{c.max_use}</div>
                    </div>
                    <CodeStatusBadge status={c.status} />
                  </div>
                  <div className="text-xs text-ink-500 mb-2">
                    {c.creator_name || '系统'} · {formatTime(c.created_at)}
                    {c.expired_at && ` · 过期 ${c.expired_at}`}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyAll([c])}
                      className="inline-flex items-center gap-1 text-xs text-ink-600 hover:text-ink-900"
                    >
                      <Copy size={12} /> 复制
                    </button>
                    <button
                      onClick={() => setEditing(c)}
                      className="inline-flex items-center gap-1 text-xs text-ink-600 hover:text-ink-900"
                    >
                      <Edit size={12} /> 编辑
                    </button>
                    <button
                      onClick={() => handleToggle(c.id)}
                      className="inline-flex items-center gap-1 text-xs text-ink-600 hover:text-ink-900"
                    >
                      <Power size={12} /> 启停
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>

      {showCreate && (
        <CreateModal
          onClose={() => { setShowCreate(false); setCreated(null) }}
          onCreated={(codes) => { setCreated(codes); load() }}
        />
      )}

      {created && (
        <CreatedModal
          codes={created}
          onClose={() => { setCreated(null); setShowCreate(false) }}
          onCopyAll={() => copyAll(created)}
        />
      )}

      {editing && (
        <EditModal
          code={editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load() }}
        />
      )}
    </div>
  )
}

function CodeStatusBadge({ status }) {
  if (status === 1) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
        <Check size={12} />
        启用
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs text-ink-500 bg-ink-100 px-2 py-0.5 rounded">
      <X size={12} />
      停用
    </span>
  )
}

function CreateModal({ onClose, onCreated }) {
  const [amount, setAmount] = useState(10)
  const [maxUse, setMaxUse] = useState(1)
  const [count, setCount] = useState(1)
  const [customCode, setCustomCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [err, setErr] = useState('')

  const submit = async () => {
    setErr('')
    setSubmitting(true)
    try {
      const data = await adminApi.createCodes({
        amount: Number(amount),
        max_use: Number(maxUse),
        count: Number(count),
        ...(customCode.trim() ? { code: customCode.trim() } : {}),
      })
      onCreated(data.codes || [])
    } catch (e) {
      setErr(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open onClose={onClose} title="生成卡密">
      <div className="space-y-3">
        <div>
          <label className="block text-xs text-ink-500 mb-1">面值（每次使用扣多少）</label>
          <Input type="number" min="1" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs text-ink-500 mb-1">使用上限（最多用几次）</label>
          <Input type="number" min="1" max="100" value={maxUse} onChange={(e) => setMaxUse(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs text-ink-500 mb-1">生成数量（1-50）</label>
          <Input type="number" min="1" max="50" value={count} onChange={(e) => setCount(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs text-ink-500 mb-1">自定义卡密（可选，仅对第一个生效）</label>
          <Input value={customCode} onChange={(e) => setCustomCode(e.target.value)} placeholder="留空则自动生成" />
        </div>
        {err && <div className="text-sm text-red-600">{err}</div>}
        <div className="flex gap-2 pt-2">
          <Button onClick={submit} loading={submitting} className="flex-1">生成</Button>
          <Button onClick={onClose} variant="ghost">取消</Button>
        </div>
      </div>
    </Modal>
  )
}

function CreatedModal({ codes, onClose, onCopyAll }) {
  return (
    <Modal open onClose={onClose} title={`已生成 ${codes.length} 个卡密`}>
      <div className="space-y-3">
        <div className="bg-ink-50 rounded-lg p-3 max-h-60 overflow-y-auto">
          <div className="space-y-1">
            {codes.map((c, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="font-mono text-ink-900">{c.code}</span>
                <span className="text-xs text-ink-400">面值 {c.amount} · {c.max_use}次</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={onCopyAll} className="flex-1">一键复制全部</Button>
          <Button onClick={onClose} variant="ghost">关闭</Button>
        </div>
      </div>
    </Modal>
  )
}

function EditModal({ code, onClose, onSaved }) {
  const [amount, setAmount] = useState(code.amount)
  const [maxUse, setMaxUse] = useState(code.max_use)
  const [status, setStatus] = useState(code.status)
  const [expiredAt, setExpiredAt] = useState(code.expired_at || '')
  const [submitting, setSubmitting] = useState(false)
  const [err, setErr] = useState('')

  const submit = async () => {
    setErr('')
    setSubmitting(true)
    try {
      await adminApi.updateCode(code.id, {
        amount: Number(amount),
        max_use: Number(maxUse),
        status: Number(status),
        expired_at: expiredAt || null,
      })
      onSaved()
    } catch (e) {
      setErr(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open onClose={onClose} title={`编辑卡密 ${code.code}`}>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-ink-500 mb-1">面值</label>
            <Input type="number" min="1" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs text-ink-500 mb-1">使用上限</label>
            <Input type="number" min="1" max="100" value={maxUse} onChange={(e) => setMaxUse(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="block text-xs text-ink-500 mb-1">状态</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full h-9 px-3 text-sm border border-ink-200 rounded-lg bg-white"
          >
            <option value={1}>启用</option>
            <option value={0}>停用</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-ink-500 mb-1">过期时间（留空=永久）</label>
          <Input
            type="text"
            value={expiredAt}
            onChange={(e) => setExpiredAt(e.target.value)}
            placeholder="2026-12-31 或留空"
          />
        </div>
        {err && <div className="text-sm text-red-600">{err}</div>}
        <div className="flex gap-2 pt-2">
          <Button onClick={submit} loading={submitting} className="flex-1">保存</Button>
          <Button onClick={onClose} variant="ghost">取消</Button>
        </div>
      </div>
    </Modal>
  )
}

function formatTime(ts) {
  if (!ts) return '-'
  return ts.replace('T', ' ').slice(0, 16)
}
