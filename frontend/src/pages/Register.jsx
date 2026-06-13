import { Link } from 'react-router-dom'
import { Info } from 'lucide-react'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'

export default function Register() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4 py-8 bg-gradient-to-br from-primary-50 to-ink-50">
      <Card className="w-full max-w-md text-center">
        <div className="inline-flex w-14 h-14 items-center justify-center rounded-full bg-blue-100 text-blue-600 mb-3">
          <Info size={28} />
        </div>
        <h1 className="text-xl font-serif font-bold text-ink-900 mb-2">无需注册</h1>
        <p className="text-sm text-ink-500 mb-6">
          我们的会员系统使用卡密激活，<br />
          购买卡密后直接登录即可使用。
        </p>
        <Link to="/login">
          <Button size="lg" className="w-full">去登录 / 激活卡密</Button>
        </Link>
      </Card>
    </div>
  )
}
