import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Lock, Loader2 } from 'lucide-react'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import { useAuthStore } from '../stores/authStore.js'
import { WUXING_COLORS } from '../lib/constants.js'

export default function Result() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [chart, setChart] = useState(null)
  const [form, setForm] = useState(null)
  const [names, setNames] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const c = sessionStorage.getItem('bazi_chart')
    const f = sessionStorage.getItem('bazi_form')
    if (!c) { navigate('/naming'); return }
    const chartData = JSON.parse(c)
    setChart(chartData)
    if (f) setForm(JSON.parse(f))
    // PHP naming.php 一次返回完整数据：bazi_computed + names（会员 10 个 / 非会员 3 个）
    setNames(chartData.names || chartData.data?.names || [])
    setLoading(false)
  }, [])

  if (!chart) return null

  // 兼容 PHP bazi_computed 嵌套结构
  const computed = chart.bazi_computed || chart
  const fourPillars = [computed.year, computed.month, computed.day, computed.hour].filter(Boolean)
  const wuxing = computed.wuxing || chart.wuxing
  const xiyongshen = computed.xiyongshen || chart.xiyongshen || []
  const avoid = computed.avoid || []
  const totalNames = chart.totalNames || 10
  const isMember = chart.isMember ?? user?.isMember ?? false

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 pb-24 md:pb-10 animate-fade-in">
      {/* 排盘信息 */}
      <Card className="mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-serif font-bold text-ink-900 mb-4">八字排盘</h2>
        {(computed.shengxiao || computed.lunar) && (
          <div className="mb-3 text-sm text-ink-600 flex flex-wrap items-center gap-x-3 gap-y-1">
            {computed.shengxiao && (
              <span className="inline-flex items-center gap-1">
                <span className="text-ink-500">生肖：</span>
                <span className="font-medium text-primary-700">属{computed.shengxiao}</span>
              </span>
            )}
            {computed.lunar && (
              <span className="inline-flex items-center gap-1">
                <span className="text-ink-500">农历：</span>
                <span className="text-ink-700">{computed.lunar}</span>
              </span>
            )}
          </div>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4">
          {fourPillars.map((p, i) => (
            <div key={i} className="text-center p-3 rounded-lg bg-ink-50">
              <div className="text-xs text-ink-500 mb-1">{['年柱', '月柱', '日柱', '时柱'][i]}</div>
              <div className="font-serif text-lg sm:text-xl font-bold text-ink-800">{p}</div>
            </div>
          ))}
        </div>

        {wuxing && (
          <div>
            <div className="text-sm text-ink-600 mb-2">五行分布</div>
            <div className="space-y-1.5">
              {Object.entries(wuxing).map(([wx, val]) => {
                const max = Math.max(...Object.values(wuxing), 1)
                const pct = (val / max) * 100
                return (
                  <div key={wx} className="flex items-center gap-2 text-sm">
                    <div className="w-6 text-center font-medium" style={{ color: WUXING_COLORS[wx] }}>{wx}</div>
                    <div className="flex-1 h-2 bg-ink-100 rounded overflow-hidden">
                      <div
                        className="h-full rounded transition-all"
                        style={{ width: `${pct}%`, backgroundColor: WUXING_COLORS[wx] }}
                      />
                    </div>
                    <div className="w-6 text-right text-ink-500 text-xs">{val}</div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {xiyongshen.length > 0 && (
          <div className="mt-4 p-3 rounded-lg bg-green-50 text-sm">
            <span className="text-green-700 font-medium">喜用神：</span>
            <span className="text-green-900 ml-1">{xiyongshen.join('、')}</span>
            {avoid.length > 0 && (
              <span className="ml-3">
                <span className="text-red-700 font-medium">忌神：</span>
                <span className="text-red-900 ml-1">{avoid.join('、')}</span>
              </span>
            )}
          </div>
        )}
      </Card>

      {/* 名字区 */}
      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="inline animate-spin text-primary-500" size={32} />
          <p className="mt-3 text-sm text-ink-500">AI 正在生成名字寓意...</p>
        </div>
      ) : names.length === 0 ? (
        <Card><p className="text-center text-ink-500 py-6">暂无推荐名字，请重试</p></Card>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {names.map((n, i) => (
            <NameCard key={i} index={i} name={n} surname={form?.surname} />
          ))}
        </div>
      )}

      {/* 会员引导（未登录或非会员时显示）*/}
      {!isMember && names.length > 0 && (
        <Card className="mt-6 bg-gradient-to-br from-primary-50 to-amber-50 border-primary-200">
          <div className="text-center py-2">
            <div className="inline-flex w-12 h-12 items-center justify-center rounded-full bg-primary-500 text-white mb-3">
              <Lock size={20} />
            </div>
            <h3 className="text-base font-medium text-ink-900 mb-1">解锁更多名字</h3>
            <p className="text-sm text-ink-600 mb-4">
              登录或使用卡密可查看全部 {totalNames} 个推荐名字
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Link to="/login?redirect=/result">
                <Button>立即登录 / 激活卡密</Button>
              </Link>
              <Link to="/naming">
                <Button variant="outline">重新排盘</Button>
              </Link>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

function NameCard({ index, name, surname }) {
  const fullName = surname && name.name ? `${surname}${name.name}` : name.name

  return (
    <Card hover className="animate-slide-up" style={{ animationDelay: `${index * 60}ms` }}>
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="text-3xl sm:text-4xl font-serif font-bold text-ink-900 tracking-wider">
            {fullName}
          </div>
          {name.score && (
            <div className="mt-1 text-xs text-primary-600">评分 {name.score}</div>
          )}
          {/* 五行 chip：每个字一个色块 */}
          {name.wuxing && Array.from(name.wuxing).length > 0 && (
            <div className="mt-1.5 flex gap-1">
              {Array.from(name.wuxing).map((wx, i) => (
                <span
                  key={i}
                  className="inline-block min-w-[18px] text-center px-1.5 py-0.5 rounded text-[10px] font-medium text-white"
                  style={{ backgroundColor: WUXING_COLORS[wx] || '#999' }}
                  title={['姓氏', '名1', '名2', '名3'][i] || `第${i+1}字`}
                >
                  {wx}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-sm text-ink-700 leading-relaxed line-clamp-3">
            {name.explanation || name.meaning || name.寓意 || 'AI 正在生成...'}
          </div>
          {(name.source || name.pinyin) && (
            <div className="mt-2 text-xs text-ink-400">
              {name.pinyin && <span>{name.pinyin}</span>}
              {name.pinyin && name.source && <span> · </span>}
              {name.source && <span>出处：{name.source}</span>}
            </div>
          )}
          <div className="mt-3 flex gap-2">
            <Link to={`/name/${encodeURIComponent(fullName)}?idx=${index}`}>
              <Button size="sm" variant="outline">查看详情</Button>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  )
}
