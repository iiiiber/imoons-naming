import { useEffect, useState } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { ArrowLeft, Sparkles, BookOpen, Hash, Star, FileText } from 'lucide-react'
import Card from '../components/ui/Card.jsx'
import Loading from '../components/ui/Loading.jsx'
import { WUXING_COLORS } from '../lib/constants.js'

export default function NameDetail() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const [name, setName] = useState(null)
  const fullName = decodeURIComponent(id || '')
  const idx = Number(params.get('idx') ?? -1)

  useEffect(() => {
    // 从 sessionStorage 取 chart + form（names 在 chart.names 里）
    const chart = JSON.parse(sessionStorage.getItem('bazi_chart') || 'null')
    if (!chart) return
    // 兼容两种结构：chart.names / chart.data?.names
    const names = chart.names || chart.data?.names || []
    // 通过 idx 拿当前名字；如果 idx 缺失，按 fullName 匹配
    const target = (idx >= 0 && names[idx]) || names.find((n) => {
      const fn = (chart.form?.surname || '') + n.name
      return fn === fullName || n.name === fullName
    })
    if (target) setName(target)
  }, [idx, fullName])

  if (!name) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-10 pb-24 md:pb-10">
        <Link to="/result" className="inline-flex items-center gap-1 text-sm text-ink-500 hover:text-ink-800 mb-4">
          <ArrowLeft size={16} /> 返回结果
        </Link>
        <Card>
          <p className="text-center text-ink-500 py-8">
            找不到该名字的详情，请返回<a href="/result" className="text-primary-600 underline">结果页</a>重试
          </p>
        </Card>
      </div>
    )
  }

  // 拆 fullName 为字数组（用于逐字标五行）
  const wuxingStr = name.wuxing || ''
  const chars = Array.from(fullName)
  // 姓氏占 1-2 字，名占剩余字
  const surnameLen = fullName.length - (name.name?.length || 0)
  const charWuxing = chars.map((_, i) => wuxingStr[i] || '')

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-10 pb-24 md:pb-10 animate-fade-in">
      <Link to="/result" className="inline-flex items-center gap-1 text-sm text-ink-500 hover:text-ink-800 mb-4">
        <ArrowLeft size={16} /> 返回结果
      </Link>

      {/* 名字 + 评分 + 五行 */}
      <Card className="text-center mb-4">
        <div className="flex items-baseline justify-center gap-2 mb-2 flex-wrap">
          {chars.map((ch, i) => (
            <span key={i} className="relative inline-flex flex-col items-center">
              <span className="text-5xl sm:text-6xl font-serif font-bold text-ink-900 tracking-wider">
                {ch}
              </span>
              {charWuxing[i] && (
                <span
                  className="mt-1 inline-block min-w-[20px] text-center px-1.5 py-0.5 rounded text-[10px] font-medium text-white"
                  style={{ backgroundColor: WUXING_COLORS[charWuxing[i]] || '#999' }}
                >
                  {charWuxing[i]}
                </span>
              )}
              {i < surnameLen - 1 && <span className="text-ink-300 mx-1">·</span>}
            </span>
          ))}
        </div>
        {name.pinyin && (
          <div className="text-sm text-ink-500 mt-2">{name.pinyin}</div>
        )}
        {name.score && (
          <div className="mt-3 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-sm">
            <Star size={14} /> 评分 {name.score}
          </div>
        )}
      </Card>

      {/* 名字寓意 */}
      {(name.meaning || name.explanation) && (
        <Card className="mb-4">
          <h3 className="text-base font-medium text-ink-800 mb-3 flex items-center gap-2">
            <Sparkles size={18} className="text-primary-500" />
            名字寓意
          </h3>
          <p className="text-sm text-ink-700 leading-relaxed whitespace-pre-wrap">
            {name.explanation || name.meaning}
          </p>
        </Card>
      )}

      {/* 适合理由（结合喜用神和八字）*/}
      {name.suitable_reason && (
        <Card className="mb-4">
          <h3 className="text-base font-medium text-ink-800 mb-3 flex items-center gap-2">
            <Star size={18} className="text-amber-500" />
            为何适合该宝宝
          </h3>
          <p className="text-sm text-ink-700 leading-relaxed whitespace-pre-wrap">
            {name.suitable_reason}
          </p>
        </Card>
      )}

      {/* 诗词典故出处 */}
      {name.source && (
        <Card className="mb-4">
          <h3 className="text-base font-medium text-ink-800 mb-3 flex items-center gap-2">
            <BookOpen size={18} className="text-emerald-500" />
            诗词典故出处
          </h3>
          <p className="text-sm text-ink-700 leading-relaxed whitespace-pre-wrap">
            {name.source}
          </p>
        </Card>
      )}

      {/* 五行（如果 AI 没逐字标注五行，显示总五行）*/}
      {name.wuxing && (
        <Card className="mb-4">
          <h3 className="text-base font-medium text-ink-800 mb-3 flex items-center gap-2">
            <Hash size={18} className="text-blue-500" />
            五行属性
          </h3>
          <div className="flex gap-2 flex-wrap">
            {charWuxing.filter(Boolean).map((wx, i) => (
              <span
                key={i}
                className="inline-block px-3 py-1 rounded text-sm font-medium text-white"
                style={{ backgroundColor: WUXING_COLORS[wx] || '#999' }}
              >
                {wx}
              </span>
            ))}
          </div>
        </Card>
      )}

      {/* 调试信息（生产环境可删）*/}
      {import.meta.env.DEV && (
        <Card className="mt-4 bg-ink-50">
          <details>
            <summary className="text-xs text-ink-500 cursor-pointer flex items-center gap-1">
              <FileText size={12} /> 调试：完整数据
            </summary>
            <pre className="mt-2 text-xs text-ink-600 overflow-auto">
              {JSON.stringify(name, null, 2)}
            </pre>
          </details>
        </Card>
      )}
    </div>
  )
}
