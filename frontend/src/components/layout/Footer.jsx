import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-ink-100 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
          <div>
            <h3 className="font-medium text-ink-800 mb-3">产品</h3>
            <ul className="space-y-2 text-ink-500">
              <li><Link to="/naming" className="hover:text-primary-600">在线起名</Link></li>
              <li><Link to="/articles" className="hover:text-primary-600">起名知识</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-ink-800 mb-3">账户</h3>
            <ul className="space-y-2 text-ink-500">
              <li><Link to="/login" className="hover:text-primary-600">登录</Link></li>
              <li><Link to="/register" className="hover:text-primary-600">注册</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-ink-800 mb-3">了解</h3>
            <ul className="space-y-2 text-ink-500">
              <li><a href="#" className="hover:text-primary-600">八字原理</a></li>
              <li><a href="#" className="hover:text-primary-600">五行喜忌</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-ink-800 mb-3">联系</h3>
            <ul className="space-y-2 text-ink-500">
              <li>客服微信：kefu123</li>
              <li>邮箱：hi@name.cn</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-ink-100 text-xs text-ink-400 flex flex-col sm:flex-row justify-between gap-2">
          <p>© 2025 起名网 · 仅供文化参考</p>
          <p>本站结合八字五行与古典诗词为宝宝起名，AI 解读仅供参考</p>
        </div>
      </div>
    </footer>
  )
}
