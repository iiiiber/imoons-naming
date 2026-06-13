import { Link } from 'react-router-dom'
import { Info } from 'lucide-react'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'

export default function Order() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-8">
      <Card className="max-w-md w-full text-center">
        <div className="inline-flex w-14 h-14 items-center justify-center rounded-full bg-blue-100 text-blue-600 mb-3">
          <Info size={28} />
        </div>
        <h1 className="text-xl font-serif font-bold text-ink-900 mb-2">通过卡密激活</h1>
        <p className="text-sm text-ink-500 mb-6">
          我们的会员系统使用卡密激活，<br />
          请到登录页输入卡密开通会员。
        </p>
        <Link to="/login">
          <Button size="lg" className="w-full">去登录 / 激活卡密</Button>
        </Link>
      </Card>
    </div>
  )
}
