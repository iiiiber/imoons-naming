import { Link } from 'react-router-dom'
import { Sparkles, BookOpen, Shield, Star, ArrowRight, Check, Quote } from 'lucide-react'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'
import { PACKAGES } from '../lib/constants.js'

export default function Home() {
  return (
    <div className="animate-fade-in">
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-ink-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-100 text-primary-700 text-xs font-medium mb-4">
              <Sparkles size={14} />
              <span>AI 八字智能起名</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-serif font-bold text-ink-900 text-balance leading-tight">
              给孩子起一个<br className="sm:hidden" />
              <span className="text-primary-600">有出处的好名字</span>
            </h1>
            <p className="mt-4 text-base sm:text-lg text-ink-600 text-balance">
              结合八字五行与古典诗词，从《诗经》《楚辞》到宋词元曲，<br className="hidden sm:block" />
              AI 为您解读每个名字的寓意和出处
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/naming">
                <Button size="lg" className="w-full sm:w-auto">
                  立即起名 <ArrowRight size={18} />
                </Button>
              </Link>
              <Link to="/articles">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  起名知识
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-xs text-ink-400">已为 10,000+ 家庭提供服务</p>
          </div>
        </div>
      </section>

      {/* 特色 */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-center text-ink-900 mb-8">为什么选择我们</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {[
            { icon: Sparkles, title: 'AI 智能解读', desc: '基于深度学习模型，深入解读名字寓意、读音、五行契合度' },
            { icon: BookOpen, title: '古典出处', desc: '每个名字都标注诗词出处，确保名字有典故、有内涵' },
            { icon: Shield, title: '八字五行', desc: '根据出生日期计算喜用神，名字自动规避忌用字' },
          ].map((f, i) => (
            <Card key={i} hover>
              <div className="w-12 h-12 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center mb-3">
                <f.icon size={24} />
              </div>
              <h3 className="text-lg font-medium text-ink-800 mb-1">{f.title}</h3>
              <p className="text-sm text-ink-500 leading-relaxed">{f.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* 流程 */}
      <section className="bg-white py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-center text-ink-900 mb-8">三步起名</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: '1', title: '填写信息', desc: '输入宝宝姓氏、出生日期、时间，AI 计算八字' },
              { step: '2', title: '查看排盘', desc: '展示四柱八字、五行分布、喜用神忌用神' },
              { step: '3', title: '选择名字', desc: '查看推荐名字，AI 详解每个名字的寓意和出处' },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="w-14 h-14 mx-auto rounded-full bg-primary-500 text-white text-xl font-serif font-bold flex items-center justify-center mb-3">
                  {s.step}
                </div>
                <h3 className="text-lg font-medium text-ink-800 mb-1">{s.title}</h3>
                <p className="text-sm text-ink-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 套餐 */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-center text-ink-900 mb-2">价格方案</h2>
        <p className="text-center text-ink-500 mb-8 text-sm">一次起名不满意，包月不限次</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-2xl mx-auto">
          {PACKAGES.map(pkg => (
            <Card key={pkg.id} hover className="relative">
              <div className="text-sm text-primary-600 font-medium">{pkg.name}</div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-ink-900">¥{pkg.price}</span>
                <span className="text-sm text-ink-400">{pkg.id === 'single' ? '/次' : '/月'}</span>
              </div>
              <p className="mt-2 text-sm text-ink-500">{pkg.desc}</p>
              <ul className="mt-4 space-y-1.5 text-sm text-ink-600">
                <li className="flex items-start gap-2"><Check size={16} className="text-green-500 mt-0.5 flex-shrink-0" /> 5 个精选名字</li>
                <li className="flex items-start gap-2"><Check size={16} className="text-green-500 mt-0.5 flex-shrink-0" /> AI 寓意解读</li>
                <li className="flex items-start gap-2"><Check size={16} className="text-green-500 mt-0.5 flex-shrink-0" /> 古典出处</li>
                {pkg.id === 'monthly' && (
                  <li className="flex items-start gap-2"><Check size={16} className="text-green-500 mt-0.5 flex-shrink-0" /> 30 天无限次</li>
                )}
              </ul>
              <Link to="/naming" className="block mt-5">
                <Button className="w-full" variant={pkg.id === 'monthly' ? 'primary' : 'outline'}>
                  立即使用
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      </section>

      {/* 评价 */}
      <section className="bg-white py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-center text-ink-900 mb-8">用户评价</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {[
              { name: '北京·李妈妈', content: '名字起得很有诗意，AI 解读得很详细，每个名字都标注了出处' },
              { name: '上海·王先生', content: '从八字入手很专业，比那些纯随机生成名字的工具靠谱多了' },
              { name: '广州·陈爸爸', content: '包月套餐很划算，后来又起了一次小名，两个名字都用了' },
            ].map((t, i) => (
              <Card key={i}>
                <Quote className="text-primary-200 mb-2" size={28} />
                <p className="text-sm text-ink-600 leading-relaxed mb-3">{t.content}</p>
                <div className="flex items-center gap-1 text-xs text-ink-400">
                  <span>{t.name}</span>
                  <div className="flex ml-auto gap-0.5 text-amber-400">
                    {[...Array(5)].map((_, j) => <Star key={j} size={12} fill="currentColor" />)}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
