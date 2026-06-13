import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import Card from '../components/ui/Card.jsx'
import Loading from '../components/ui/Loading.jsx'
import { articleApi } from '../api/client.js'
import { formatDate } from '../lib/format.js'

export default function ArticleDetail() {
  const { id } = useParams()
  const [article, setArticle] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    articleApi.detail(id).then(d => {
      setArticle(d.article || d)
    }).catch(e => setError(e.message))
  }, [id])

  if (error) return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Card><p className="text-center text-ink-500">{error}</p></Card>
    </div>
  )

  if (!article) return <Loading />

  const dateText = article.createdAt || article.created_at || article.publishedAt || ''
  const contentText = article.content || article.body || ''

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10 pb-24 md:pb-10 animate-fade-in">
      <Link to="/articles" className="inline-flex items-center gap-1 text-sm text-ink-500 hover:text-ink-800 mb-4">
        <ArrowLeft size={16} /> 返回列表
      </Link>
      <article>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ink-900 mb-2">{article.title}</h1>
        {dateText && (
          <div className="text-xs text-ink-400 mb-6">{formatDate(dateText)}</div>
        )}
        <Card>
          <div className="markdown-body text-ink-800">
            <ReactMarkdown
              components={{
                // H1: 大标题（已用主标题显示，正文里不再用 H1）
                h1: ({node, ...props}) => <h2 className="text-xl sm:text-2xl font-serif font-bold text-ink-900 mt-6 mb-3 first:mt-0" {...props} />,
                h2: ({node, ...props}) => <h3 className="text-lg sm:text-xl font-serif font-bold text-ink-900 mt-6 mb-2 pb-1 border-b border-ink-100" {...props} />,
                h3: ({node, ...props}) => <h4 className="text-base sm:text-lg font-medium text-ink-800 mt-4 mb-2" {...props} />,
                h4: ({node, ...props}) => <h5 className="text-sm sm:text-base font-medium text-ink-800 mt-3 mb-1" {...props} />,
                p: ({node, ...props}) => <p className="text-sm sm:text-base leading-relaxed text-ink-700 my-3" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc pl-6 my-3 space-y-1.5 text-sm sm:text-base text-ink-700" {...props} />,
                ol: ({node, ...props}) => <ol className="list-decimal pl-6 my-3 space-y-1.5 text-sm sm:text-base text-ink-700" {...props} />,
                li: ({node, ...props}) => <li className="leading-relaxed" {...props} />,
                strong: ({node, ...props}) => <strong className="font-semibold text-ink-900" {...props} />,
                em: ({node, ...props}) => <em className="italic text-ink-700" {...props} />,
                a: ({node, ...props}) => <a className="text-primary-600 hover:underline" target="_blank" rel="noopener" {...props} />,
                blockquote: ({node, ...props}) => (
                  <blockquote className="border-l-4 border-primary-300 bg-primary-50/40 pl-4 pr-3 py-2 my-4 text-sm italic text-ink-600 rounded-r" {...props} />
                ),
                code: ({node, inline, ...props}) => inline
                  ? <code className="px-1.5 py-0.5 rounded bg-ink-100 text-ink-800 text-[0.9em] font-mono" {...props} />
                  : <code className="block bg-ink-50 border border-ink-100 rounded-lg p-3 my-3 text-xs font-mono overflow-x-auto" {...props} />,
                pre: ({node, ...props}) => <pre className="my-3" {...props} />,
                hr: ({node, ...props}) => <hr className="my-6 border-ink-100" {...props} />,
                table: ({node, ...props}) => <div className="my-4 overflow-x-auto"><table className="min-w-full text-sm border border-ink-200 rounded-lg overflow-hidden" {...props} /></div>,
                th: ({node, ...props}) => <th className="px-3 py-2 bg-ink-50 border-b border-ink-200 text-left font-medium text-ink-700" {...props} />,
                td: ({node, ...props}) => <td className="px-3 py-2 border-b border-ink-100 text-ink-700" {...props} />,
              }}
            >
              {contentText}
            </ReactMarkdown>
          </div>
        </Card>
      </article>
    </div>
  )
}
