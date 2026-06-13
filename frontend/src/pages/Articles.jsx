import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, ChevronRight } from 'lucide-react'
import Card from '../components/ui/Card.jsx'
import Loading from '../components/ui/Loading.jsx'
import { EmptyState } from '../components/ui/Skeleton.jsx'
import { articleApi } from '../api/client.js'
import { formatDate } from '../lib/format.js'

export default function Articles() {
  const [list, setList] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    articleApi.list().then(d => setList(d.articles || d.list || d || [])).catch(e => setError(e.message))
  }, [])

  if (error) return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Card><EmptyState icon={BookOpen} title="加载失败" description={error} /></Card>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10 pb-24 md:pb-10 animate-fade-in">
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ink-900">起名知识</h1>
        <p className="mt-2 text-sm text-ink-500">了解八字、五行、诗词典故</p>
      </div>

      {!list ? <Loading /> :
       list.length === 0 ? (
        <Card><EmptyState icon={BookOpen} title="暂无文章" description="敬请期待" /></Card>
      ) : (
        <div className="space-y-3">
          {list.map(a => (
            <Link key={a.id} to={`/article/${a.id}`}>
              <Card hover className="!p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-medium text-ink-800 line-clamp-1">{a.title}</h3>
                    {a.summary && <p className="mt-1 text-sm text-ink-500 line-clamp-2">{a.summary}</p>}
                    <div className="mt-2 text-xs text-ink-400">{formatDate(a.createdAt || a.publishedAt)}</div>
                  </div>
                  <ChevronRight size={18} className="text-ink-400 flex-shrink-0 mt-1" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
