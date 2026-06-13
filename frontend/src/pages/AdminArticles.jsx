import { useState, useEffect } from 'react'
import { adminApi } from '../api/client.js'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import Input from '../components/ui/Input.jsx'
import Modal from '../components/ui/Modal.jsx'
import { Plus, RefreshCw, Edit, Power, Trash2, Search, Eye, Check, X, Star } from 'lucide-react'

export default function AdminArticles() {
  const [list, setList] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [keyword, setKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [editing, setEditing] = useState(null)
  const [viewing, setViewing] = useState(null)

  const load = async (p = page) => {
    setLoading(true)
    setError('')
    try {
      const params = { page: p, pageSize: 20 }
      if (keyword.trim()) params.keyword = keyword.trim()
      if (statusFilter !== '') params.status = statusFilter
      const data = await adminApi.articles(params)
      setList(data.list || [])
      setTotal(data.total || 0)
      setPage(data.page || 1)
      setTotalPages(data.totalPages || 0)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load(1) }, [statusFilter])

  const handleSearch = () => load(1)

  const handleToggle = async (id) => {
    try {
      await adminApi.toggleArticle(id)
      load()
    } catch (err) {
      alert('切换失败：' + err.message)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('确认删除此文章？删除后不可恢复')) return
    try {
      await adminApi.deleteArticle(id)
      load()
    } catch (err) {
      alert('删除失败：' + err.message)
    }
  }

  return (
    <div>
      {/* 工具栏 */}
      <Card className="!p-3 mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex-1 flex items-center gap-2 min-w-[200px]">
            <Input
              placeholder="搜索标题..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="!h-9"
            />
            <Button size="sm" variant="outline" onClick={handleSearch}>
              <Search size={14} />
            </Button>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-3 text-sm border border-ink-200 rounded-lg bg-white"
          >
            <option value="">全部状态</option>
            <option value="1">已启用</option>
            <option value="0">已停用</option>
          </select>
          <Button onClick={() => setShowCreate(true)} size="sm" className="inline-flex items-center gap-1">
            <Plus size={14} />
            新建文章
          </Button>
          <button
            onClick={() => load(1)}
            disabled={loading}
            className="p-2 text-ink-500 hover:text-ink-900 disabled:opacity-50"
            title="刷新"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
        <div className="text-xs text-ink-400 mt-2">共 {total} 条</div>
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
          <div className="py-16 text-center text-ink-400 text-sm">暂无文章</div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-ink-50 text-ink-600 text-xs uppercase">
                  <tr>
                    <th className="px-4 py-2 text-left">ID</th>
                    <th className="px-4 py-2 text-left">标题</th>
                    <th className="px-4 py-2 text-left">分类</th>
                    <th className="px-4 py-2 text-right">阅读</th>
                    <th className="px-4 py-2 text-right">点赞</th>
                    <th className="px-4 py-2 text-center">精选</th>
                    <th className="px-4 py-2 text-left">更新时间</th>
                    <th className="px-4 py-2 text-center">状态</th>
                    <th className="px-4 py-2 text-center">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100">
                  {list.map((a) => (
                    <tr key={a.id} className="hover:bg-ink-50/50">
                      <td className="px-4 py-2.5 text-ink-500 tabular-nums">{a.id}</td>
                      <td className="px-4 py-2.5 max-w-xs">
                        <div className="font-medium text-ink-900 truncate">{a.title}</div>
                        {a.summary && <div className="text-xs text-ink-400 truncate mt-0.5">{a.summary}</div>}
                      </td>
                      <td className="px-4 py-2.5 text-ink-500 text-xs">{a.category || '-'}</td>
                      <td className="px-4 py-2.5 text-right text-ink-700 tabular-nums">{a.views || 0}</td>
                      <td className="px-4 py-2.5 text-right text-ink-700 tabular-nums">{a.likes || 0}</td>
                      <td className="px-4 py-2.5 text-center">
                        {a.is_featured ? (
                          <Star size={14} className="inline text-amber-500 fill-amber-500" />
                        ) : (
                          <span className="text-ink-300">-</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-ink-500 text-xs tabular-nums">{formatTime(a.updated_at)}</td>
                      <td className="px-4 py-2.5 text-center">
                        <StatusBadge status={a.status} />
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setViewing(a)}
                            className="p-1.5 text-ink-500 hover:text-ink-900"
                            title="预览"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => setEditing(a)}
                            className="p-1.5 text-ink-500 hover:text-ink-900"
                            title="编辑"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleToggle(a.id)}
                            className="p-1.5 text-ink-500 hover:text-ink-900"
                            title="启停"
                          >
                            <Power size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(a.id)}
                            className="p-1.5 text-ink-500 hover:text-red-600"
                            title="删除"
                          >
                            <Trash2 size={14} />
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
              {list.map((a) => (
                <div key={a.id} className="p-4">
                  <div className="flex items-start justify-between mb-2 gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-ink-900 line-clamp-1">{a.title}</div>
                      {a.summary && (
                        <div className="text-xs text-ink-400 mt-0.5 line-clamp-1">{a.summary}</div>
                      )}
                    </div>
                    <StatusBadge status={a.status} />
                  </div>
                  <div className="text-xs text-ink-500 mb-2 flex items-center gap-2 flex-wrap">
                    <span>{a.category || '未分类'}</span>
                    <span>·</span>
                    <span>👁 {a.views || 0}</span>
                    <span>·</span>
                    <span>❤ {a.likes || 0}</span>
                    {a.is_featured === 1 && <span className="text-amber-500">⭐ 精选</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setViewing(a)}
                      className="inline-flex items-center gap-1 text-xs text-ink-600 hover:text-ink-900"
                    >
                      <Eye size={12} /> 预览
                    </button>
                    <button
                      onClick={() => setEditing(a)}
                      className="inline-flex items-center gap-1 text-xs text-ink-600 hover:text-ink-900"
                    >
                      <Edit size={12} /> 编辑
                    </button>
                    <button
                      onClick={() => handleToggle(a.id)}
                      className="inline-flex items-center gap-1 text-xs text-ink-600 hover:text-ink-900"
                    >
                      <Power size={12} /> 启停
                    </button>
                    <button
                      onClick={() => handleDelete(a.id)}
                      className="inline-flex items-center gap-1 text-xs text-ink-600 hover:text-red-600"
                    >
                      <Trash2 size={12} /> 删除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" onClick={() => load(page - 1)} disabled={page === 1}>
            上一页
          </Button>
          <span className="text-xs text-ink-500 px-2 tabular-nums">{page} / {totalPages}</span>
          <Button variant="outline" size="sm" onClick={() => load(page + 1)} disabled={page === totalPages}>
            下一页
          </Button>
        </div>
      )}

      {showCreate && (
        <ArticleModal onClose={() => setShowCreate(false)} onSaved={() => { setShowCreate(false); load(1) }} />
      )}

      {editing && (
        <ArticleModal
          article={editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load() }}
        />
      )}

      {viewing && (
        <ViewModal article={viewing} onClose={() => setViewing(null)} />
      )}
    </div>
  )
}

function StatusBadge({ status }) {
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

function ArticleModal({ article, onClose, onSaved }) {
  const isEdit = !!article
  const [title, setTitle] = useState(article?.title || '')
  const [summary, setSummary] = useState(article?.summary || '')
  const [content, setContent] = useState(article?.content || '')
  const [category, setCategory] = useState(article?.category || '')
  const [coverImage, setCoverImage] = useState(article?.cover_image || '')
  const [isFeatured, setIsFeatured] = useState(article?.is_featured || 0)
  const [status, setStatus] = useState(article?.status ?? 1)
  const [submitting, setSubmitting] = useState(false)
  const [err, setErr] = useState('')

  const submit = async () => {
    setErr('')
    if (!title.trim()) { setErr('请输入标题'); return }
    if (!content.trim()) { setErr('请输入内容'); return }
    setSubmitting(true)
    try {
      const data = {
        title: title.trim(),
        summary: summary.trim(),
        content: content.trim(),
        category: category.trim(),
        cover_image: coverImage.trim(),
        is_featured: Number(isFeatured),
        status: Number(status),
      }
      if (isEdit) {
        await adminApi.updateArticle(article.id, data)
      } else {
        await adminApi.createArticle(data)
      }
      onSaved()
    } catch (e) {
      setErr(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open onClose={onClose} title={isEdit ? `编辑文章 #${article.id}` : '新建文章'}>
      <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
        <div>
          <label className="block text-xs text-ink-500 mb-1">标题 *</label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="文章标题" />
        </div>
        <div>
          <label className="block text-xs text-ink-500 mb-1">摘要</label>
          <Input value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="一句话简介（列表卡片显示）" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-ink-500 mb-1">分类</label>
            <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="如：起名技巧" />
          </div>
          <div>
            <label className="block text-xs text-ink-500 mb-1">封面 URL</label>
            <Input value={coverImage} onChange={(e) => setCoverImage(e.target.value)} placeholder="https://..." />
          </div>
        </div>
        <div>
          <label className="block text-xs text-ink-500 mb-1">正文 *（支持 Markdown）</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
            placeholder="# 标题&#10;&#10;正文内容..."
            className="w-full px-3 py-2 text-sm border border-ink-200 rounded-lg bg-white font-mono leading-relaxed"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-ink-500 mb-1">精选</label>
            <select
              value={isFeatured}
              onChange={(e) => setIsFeatured(e.target.value)}
              className="w-full h-9 px-3 text-sm border border-ink-200 rounded-lg bg-white"
            >
              <option value={0}>普通</option>
              <option value={1}>⭐ 精选</option>
            </select>
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
        </div>
        {err && <div className="text-sm text-red-600">{err}</div>}
        <div className="flex gap-2 pt-2">
          <Button onClick={submit} loading={submitting} className="flex-1">
            {isEdit ? '保存' : '创建'}
          </Button>
          <Button onClick={onClose} variant="ghost">取消</Button>
        </div>
      </div>
    </Modal>
  )
}

function ViewModal({ article, onClose }) {
  return (
    <Modal open onClose={onClose} title={article.title}>
      <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
        {article.cover_image && (
          <img src={article.cover_image} alt={article.title} className="w-full rounded-lg" />
        )}
        {article.summary && (
          <div className="text-sm text-ink-500 italic border-l-2 border-primary-300 pl-3">
            {article.summary}
          </div>
        )}
        <div className="flex items-center gap-2 text-xs text-ink-400">
          {article.category && <span>📁 {article.category}</span>}
          {article.category && <span>·</span>}
          <span>👁 {article.views || 0}</span>
          <span>·</span>
          <span>❤ {article.likes || 0}</span>
          <span>·</span>
          <span>{formatTime(article.updated_at)}</span>
        </div>
        <div className="text-sm text-ink-800 whitespace-pre-wrap font-sans leading-relaxed">
          {article.content}
        </div>
        <div className="flex gap-2 pt-2">
          <Button onClick={onClose} variant="ghost" className="flex-1">关闭</Button>
        </div>
      </div>
    </Modal>
  )
}

function formatTime(ts) {
  if (!ts) return '-'
  return ts.replace('T', ' ').slice(0, 16)
}
