import { useState, useEffect } from 'react'
import { adminApi } from '../api/client.js'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import Input from '../components/ui/Input.jsx'
import { Save, RefreshCw, Eye, EyeOff, Shield, AlertTriangle, Check, Plus, Trash2, Edit, X } from 'lucide-react'

// 敏感字段关键词（包含则默认 mask，hover/点击显示）
const SENSITIVE_PATTERNS = ['key', 'secret', 'token', 'password', 'passwd', 'pwd', 'apikey', 'private']

function isSensitive(key) {
  const lower = key.toLowerCase()
  return SENSITIVE_PATTERNS.some((p) => lower.includes(p))
}

// 显示值（敏感字段做 mask）
function maskValue(key, val) {
  if (!val) return ''
  if (!isSensitive(key)) return val
  if (val.length <= 8) return '••••••••'
  return val.slice(0, 4) + '••••••••' + val.slice(-4)
}

export default function AdminConfigs() {
  const [configs, setConfigs] = useState({})
  const [edits, setEdits] = useState({}) // key -> 临时编辑值
  const [revealed, setRevealed] = useState({}) // key -> bool 是否显示完整值
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  // 新增
  const [showAdd, setShowAdd] = useState(false)
  const [newKey, setNewKey] = useState('')
  const [newVal, setNewVal] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await adminApi.getConfigs()
      // 过滤空值 key：老站 configs.php 不支持真删（POST 空值只清 value 不删行），
      // 前端约定不显示 value='' 的 key，避免误以为"删了"
      const filtered = {}
      Object.entries(data || {}).forEach(([k, v]) => {
        if (v !== '' && v != null) filtered[k] = v
      })
      setConfigs(filtered)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const startEdit = (key) => {
    setEdits({ ...edits, [key]: configs[key] ?? '' })
  }

  const cancelEdit = (key) => {
    const e = { ...edits }
    delete e[key]
    setEdits(e)
  }

  const saveEdit = async (key) => {
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const value = edits[key] ?? ''
      await adminApi.updateConfigs({ [key]: value })
      // 更新本地
      setConfigs({ ...configs, [key]: value })
      const e = { ...edits }
      delete e[key]
      setEdits(e)
      setSuccess(`已保存 ${key}`)
      setTimeout(() => setSuccess(''), 2000)
    } catch (err) {
      setError('保存失败：' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleClear = async (key) => {
    if (!confirm(`确定要清空 ${key} 的值？\n\n注意：configs 后端不提供真删接口，"清空"只是把 value 设为空字符串（key 仍保留在数据库），下次加载会自动隐藏。`)) return
    // 调 updateConfigs 传空值，后端只清 value 不删行；前端下次加载会自动过滤
    setSaving(true)
    try {
      await adminApi.updateConfigs({ [key]: '' })
      // 从本地移除（前端过滤逻辑会保持）
      const c = { ...configs }
      delete c[key]
      setConfigs(c)
      setSuccess(`已清空 ${key}`)
      setTimeout(() => setSuccess(''), 2000)
    } catch (err) {
      setError('清空失败：' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleAdd = async () => {
    const k = newKey.trim()
    if (!k) return
    setSaving(true)
    setError('')
    try {
      await adminApi.updateConfigs({ [k]: newVal })
      setConfigs({ ...configs, [k]: newVal })
      setShowAdd(false)
      setNewKey('')
      setNewVal('')
      setSuccess(`已添加 ${k}`)
      setTimeout(() => setSuccess(''), 2000)
    } catch (err) {
      setError('添加失败：' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const toggleReveal = (key) => {
    setRevealed({ ...revealed, [key]: !revealed[key] })
  }

  const keys = Object.keys(configs).sort()
  const sensitiveCount = keys.filter(isSensitive).length

  return (
    <div>
      {/* 警告条 */}
      <div className="mb-4 text-sm bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-start gap-2">
        <AlertTriangle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <div className="font-medium text-amber-900">敏感操作提示</div>
          <div className="text-xs text-amber-700 mt-0.5">
            本页包含 API 密钥、小程序 secret 等敏感信息（共 {sensitiveCount} 项）。
            敏感字段默认 <code className="bg-amber-100 px-1 rounded">••••</code> 掩码显示，点击眼睛图标查看。
            修改后立即生效，请谨慎操作。
          </div>
        </div>
      </div>

      {/* 工具栏 */}
      <Card className="!p-3 mb-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-ink-500">
            共 {keys.length} 项配置
            {sensitiveCount > 0 && <span className="ml-2 text-amber-600">· {sensitiveCount} 项敏感</span>}
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => setShowAdd(true)} size="sm" className="inline-flex items-center gap-1">
              <Plus size={14} />
              新增
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
      {success && (
        <div className="mb-4 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 flex items-center gap-2">
          <Check size={14} />
          {success}
        </div>
      )}

      {/* 列表 */}
      {loading ? (
        <Card className="!p-8 text-center text-ink-400 text-sm">加载中...</Card>
      ) : keys.length === 0 ? (
        <Card className="!p-8 text-center text-ink-400 text-sm">暂无配置</Card>
      ) : (
        <div className="space-y-3">
          {keys.map((key) => {
            const isEditing = edits.hasOwnProperty(key)
            const sensitive = isSensitive(key)
            const showFull = revealed[key]
            const displayValue = isEditing
              ? (edits[key] ?? '')
              : (sensitive && !showFull ? maskValue(key, configs[key]) : configs[key])

            return (
              <Card key={key} className="!p-4">
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    sensitive ? 'bg-amber-50 text-amber-600' : 'bg-ink-50 text-ink-500'
                  }`}>
                    {sensitive ? <Shield size={16} /> : <Edit size={16} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <code className="text-sm font-medium text-ink-900 bg-ink-50 px-2 py-0.5 rounded">
                        {key}
                      </code>
                      {sensitive && (
                        <span className="text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                          敏感
                        </span>
                      )}
                    </div>

                    {isEditing ? (
                      <div>
                        <textarea
                          value={edits[key] ?? ''}
                          onChange={(e) => setEdits({ ...edits, [key]: e.target.value })}
                          rows={Math.max(2, Math.min(8, (edits[key] || '').split('\n').length))}
                          className="w-full text-sm font-mono px-3 py-2 border border-ink-200 rounded-lg focus:border-ink-900 focus:outline-none resize-y"
                          placeholder="(空)"
                        />
                        <div className="flex items-center gap-2 mt-2">
                          <Button onClick={() => saveEdit(key)} loading={saving} size="sm">
                            <Save size={14} />
                            保存
                          </Button>
                          <Button onClick={() => cancelEdit(key)} variant="ghost" size="sm">
                            <X size={14} />
                            取消
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2">
                        <code className={`flex-1 text-sm px-3 py-2 rounded-lg break-all ${
                          sensitive ? 'bg-ink-50 text-ink-700' : 'bg-ink-50 text-ink-800 font-mono'
                        }`}>
                          {displayValue || <span className="text-ink-400">(空)</span>}
                        </code>
                        {sensitive && (
                          <button
                            onClick={() => toggleReveal(key)}
                            className="p-2 text-ink-500 hover:text-ink-900 flex-shrink-0"
                            title={showFull ? '隐藏' : '显示完整值'}
                          >
                            {showFull ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        )}
                        <button
                          onClick={() => startEdit(key)}
                          className="p-2 text-ink-500 hover:text-ink-900 flex-shrink-0"
                          title="编辑"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleClear(key)}
                          className="p-2 text-ink-500 hover:text-amber-600 flex-shrink-0"
                          title="清空值（key 仍保留）"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50" onClick={() => setShowAdd(false)}>
          <div
            className="bg-white rounded-2xl w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-medium text-ink-900 mb-4">新增配置</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-ink-500 mb-1">键名（key）</label>
                <Input
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  placeholder="例如 new_feature_flag"
                />
              </div>
              <div>
                <label className="block text-xs text-ink-500 mb-1">值（value）</label>
                <textarea
                  value={newVal}
                  onChange={(e) => setNewVal(e.target.value)}
                  rows={4}
                  className="w-full text-sm font-mono px-3 py-2 border border-ink-200 rounded-lg focus:border-ink-900 focus:outline-none resize-y"
                  placeholder="value"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={handleAdd} loading={saving} className="flex-1">添加</Button>
                <Button onClick={() => { setShowAdd(false); setNewKey(''); setNewVal('') }} variant="ghost">取消</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
