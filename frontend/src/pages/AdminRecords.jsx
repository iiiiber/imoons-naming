import { useState, useEffect } from 'react'
import { adminApi } from '../api/client.js'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import Input from '../components/ui/Input.jsx'
import Modal from '../components/ui/Modal.jsx'
import { Search, RefreshCw, Filter, ChevronLeft, ChevronRight, FileText, X, Calendar, User } from 'lucide-react'

export default function AdminRecords() {
  const [list, setList] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [pageSize] = useState(20)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  // 筛选
  const [filter, setFilter] = useState({ surname: '', gender: '', source: '', dateFrom: '', dateTo: '' })
  const [filterInput, setFilterInput] = useState({ surname: '', gender: '', source: '', dateFrom: '', dateTo: '' })
  // 详情
  const [detail, setDetail] = useState(null)

  const load = async (p = page, f = filter) => {
    setLoading(true)
    setError('')
    try {
      const params = { page: p, pageSize, ...cleanFilter(f) }
      const data = await adminApi.records(params)
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

  useEffect(() => { load(1, filter) }, [])

  // 过滤空值
  const cleanFilter = (f) => {
    const out = {}
    Object.entries(f).forEach(([k, v]) => {
      if (v && String(v).trim() !== '') out[k] = String(v).trim()
    })
    return out
  }

  const applyFilter = () => {
    setFilter(filterInput)
    load(1, filterInput)
  }

  const clearFilter = () => {
    const empty = { surname: '', gender: '', source: '', dateFrom: '', dateTo: '' }
    setFilterInput(empty)
    setFilter(empty)
    load(1, empty)
  }

  const goPage = (p) => {
    if (p < 1 || p > totalPages || p === page) return
    load(p, filter)
  }

  return (
    <div>
      {/* 筛选栏 */}
      <Card className="!p-3 mb-4">
        <div className="space-y-2">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            <Input
              value={filterInput.surname}
              onChange={(e) => setFilterInput({ ...filterInput, surname: e.target.value })}
              placeholder="姓氏"
              onKeyDown={(e) => e.key === 'Enter' && applyFilter()}
            />
            <select
              value={filterInput.gender}
              onChange={(e) => setFilterInput({ ...filterInput, gender: e.target.value })}
              className="h-9 px-3 text-sm border border-ink-200 rounded-lg bg-white"
            >
              <option value="">全部性别</option>
              <option value="male">男</option>
              <option value="female">女</option>
            </select>
            <select
              value={filterInput.source}
              onChange={(e) => setFilterInput({ ...filterInput, source: e.target.value })}
              className="h-9 px-3 text-sm border border-ink-200 rounded-lg bg-white"
            >
              <option value="">全部来源</option>
              <option value="ai">AI</option>
              <option value="local">本地</option>
            </select>
            <Input
              type="date"
              value={filterInput.dateFrom}
              onChange={(e) => setFilterInput({ ...filterInput, dateFrom: e.target.value })}
            />
            <Input
              type="date"
              value={filterInput.dateTo}
              onChange={(e) => setFilterInput({ ...filterInput, dateTo: e.target.value })}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={applyFilter} size="sm" className="inline-flex items-center gap-1">
              <Filter size={14} />
              筛选
            </Button>
            <Button onClick={clearFilter} variant="ghost" size="sm">清除</Button>
            <div className="flex-1" />
            <span className="text-xs text-ink-400">共 {total} 条</span>
            <button
              onClick={() => load(page, filter)}
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
          <div className="py-16 text-center text-ink-400 text-sm">暂无记录</div>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-ink-50 text-ink-600 text-xs uppercase">
                  <tr>
                    <th className="px-4 py-2 text-left">ID</th>
                    <th className="px-4 py-2 text-left">用户</th>
                    <th className="px-4 py-2 text-left">姓</th>
                    <th className="px-4 py-2 text-center">性别</th>
                    <th className="px-4 py-2 text-left">出生</th>
                    <th className="px-4 py-2 text-left">名字</th>
                    <th className="px-4 py-2 text-center">来源</th>
                    <th className="px-4 py-2 text-left">时间</th>
                    <th className="px-4 py-2 text-center">详情</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100">
                  {list.map((r) => (
                    <tr key={r.id} className="hover:bg-ink-50/50">
                      <td className="px-4 py-2.5 text-ink-500 tabular-nums">{r.id}</td>
                      <td className="px-4 py-2.5">
                        {r.user_id
                          ? <span className="text-primary-600 text-xs">#{r.user_id}</span>
                          : <span className="text-ink-300 text-xs">游客</span>}
                      </td>
                      <td className="px-4 py-2.5 font-serif font-medium text-ink-900">{r.surname || '-'}</td>
                      <td className="px-4 py-2.5 text-center">
                        <GenderBadge gender={r.gender} />
                      </td>
                      <td className="px-4 py-2.5 text-ink-600 text-xs tabular-nums">{r.birthday || '-'}</td>
                      <td className="px-4 py-2.5 text-ink-700 max-w-[260px]">
                        {r.names_parsed && r.names_parsed.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {r.names_parsed.slice(0, 3).map((n, i) => (
                              <span key={i} className="font-serif text-sm text-ink-800">
                                {r.surname}{n}
                              </span>
                            ))}
                            {r.names_parsed.length > 3 && (
                              <span className="text-xs text-ink-400">+{r.names_parsed.length - 3}</span>
                            )}
                          </div>
                        ) : <span className="text-ink-400 text-xs">无</span>}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <SourceBadge source={r.source} />
                      </td>
                      <td className="px-4 py-2.5 text-ink-500 text-xs tabular-nums">{formatTime(r.created_at)}</td>
                      <td className="px-4 py-2.5 text-center">
                        <button
                          onClick={() => setDetail(r)}
                          className="text-xs text-primary-600 hover:text-primary-700"
                        >
                          查看
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-ink-100">
              {list.map((r) => (
                <div key={r.id} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-serif font-medium text-ink-900">{r.surname}</span>
                        <GenderBadge gender={r.gender} />
                        <SourceBadge source={r.source} />
                      </div>
                      <div className="text-xs text-ink-500">{r.birthday || '未填'} · {formatTime(r.created_at)}</div>
                    </div>
                    <button
                      onClick={() => setDetail(r)}
                      className="text-xs text-primary-600"
                    >
                      详情
                    </button>
                  </div>
                  {r.names_parsed && r.names_parsed.length > 0 && (
                    <div className="text-sm text-ink-700 mt-1">
                      {r.names_parsed.slice(0, 5).map((n, i) => (
                        <span key={i} className="font-serif mr-2">{r.surname}{n}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* 分页 */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-ink-100 flex items-center justify-between text-sm">
            <span className="text-xs text-ink-400">
              第 {page} / {totalPages} 页
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => goPage(page - 1)}
                disabled={page === 1}
                className="p-1.5 text-ink-500 hover:text-ink-900 disabled:opacity-30"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="px-2 text-ink-700 tabular-nums">{page}</span>
              <button
                onClick={() => goPage(page + 1)}
                disabled={page === totalPages}
                className="p-1.5 text-ink-500 hover:text-ink-900 disabled:opacity-30"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </Card>

      {detail && (
        <DetailModal record={detail} onClose={() => setDetail(null)} />
      )}
    </div>
  )
}

function DetailModal({ record, onClose }) {
  return (
    <Modal open onClose={onClose} title={`记录 #${record.id}`}>
      <div className="space-y-4 max-h-[70vh] overflow-y-auto">
        {/* 基本信息 */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          {record.user_id && (
            <Field label="用户 ID" value={`#${record.user_id}`} />
          )}
          <Field label="姓氏" value={record.surname} />
          <Field label="性别" value={record.gender === 'male' ? '男' : record.gender === 'female' ? '女' : '-'} />
          <Field label="出生日期" value={record.birthday} />
          <Field label="来源" value={record.source === 'ai' ? 'AI' : '本地'} />
          <Field label="创建时间" value={formatTime(record.created_at)} />
        </div>

        {/* 八字 */}
        {record.bazi && (
          <div>
            <h3 className="text-sm font-medium text-ink-700 mb-2 flex items-center gap-1">
              <Calendar size={14} /> 八字命理
            </h3>
            <div className="bg-ink-50 rounded-lg p-3 text-sm">
              <BaziView bazi={record.bazi} />
            </div>
          </div>
        )}

        {/* 推荐名字 */}
        {record.names_parsed && record.names_parsed.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-ink-700 mb-2 flex items-center gap-1">
              <FileText size={14} /> 推荐名字（{record.names_parsed.length}）
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {record.names_parsed.map((n, i) => (
                <div
                  key={i}
                  className="px-3 py-2 bg-white border border-ink-100 rounded-lg text-center font-serif text-base text-ink-800"
                >
                  {record.surname}{n}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}

function Field({ label, value }) {
  return (
    <div>
      <div className="text-xs text-ink-400 mb-0.5">{label}</div>
      <div className="text-ink-800">{value || '-'}</div>
    </div>
  )
}

function BaziView({ bazi }) {
  if (!bazi || typeof bazi !== 'object') return null

  // 提取四柱（按顺序：年/月/日/时）
  const pillars = []
  ;['year', 'month', 'day', 'hour'].forEach((k) => {
    if (bazi[k]) pillars.push(bazi[k])
  })

  // 提取五行、喜用神等
  const wuxing = bazi.wuxing
  const dayMaster = bazi.day_master
  const dayMasterStrength = bazi.day_master_strength
  const xiyongshen = bazi.xiyongshen
  const avoid = bazi.avoid
  const lunar = bazi.lunar

  return (
    <div className="space-y-2">
      {pillars.length > 0 && (
        <div className="grid grid-cols-4 gap-2 text-center">
          {pillars.map((p, i) => (
            <div key={i} className="bg-white px-2 py-1.5 rounded border border-ink-100">
              <div className="text-xs text-ink-400 mb-0.5">{['年', '月', '日', '时'][i]}</div>
              <div className="font-serif text-sm text-ink-800">{typeof p === 'string' ? p : (p.name || JSON.stringify(p))}</div>
            </div>
          ))}
        </div>
      )}
      {lunar && (
        <div className="text-xs text-ink-500">
          <span className="text-ink-400">农历：</span>{typeof lunar === 'string' ? lunar : JSON.stringify(lunar)}
        </div>
      )}
      {wuxing && (
        <div className="text-xs text-ink-500">
          <span className="text-ink-400">五行：</span>{typeof wuxing === 'string' ? wuxing : JSON.stringify(wuxing)}
        </div>
      )}
      {dayMaster && (
        <div className="text-xs text-ink-500">
          <span className="text-ink-400">日主：</span>{dayMaster}
          {dayMasterStrength && <span className="text-ink-400">（{dayMasterStrength}）</span>}
        </div>
      )}
      {xiyongshen && (
        <div className="text-xs text-ink-500">
          <span className="text-ink-400">喜用神：</span>
          <span className="text-emerald-600">{typeof xiyongshen === 'string' ? xiyongshen : JSON.stringify(xiyongshen)}</span>
        </div>
      )}
      {avoid && (
        <div className="text-xs text-ink-500">
          <span className="text-ink-400">忌神：</span>
          <span className="text-rose-600">{typeof avoid === 'string' ? avoid : JSON.stringify(avoid)}</span>
        </div>
      )}
    </div>
  )
}

function GenderBadge({ gender }) {
  if (gender === 'male') return <span className="text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">男</span>
  if (gender === 'female') return <span className="text-xs text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">女</span>
  return <span className="text-xs text-ink-400">-</span>
}

function SourceBadge({ source }) {
  if (source === 'ai') {
    return <span className="inline-block text-xs text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">AI</span>
  }
  if (source === 'local') {
    return <span className="inline-block text-xs text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">本地</span>
  }
  return <span className="text-xs text-ink-400">-</span>
}

function formatTime(ts) {
  if (!ts) return '-'
  return ts.replace('T', ' ').slice(0, 16)
}
