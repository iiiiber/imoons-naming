import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import clsx from 'clsx'
import Input from '../components/ui/Input.jsx'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'
import { useAuthStore } from '../stores/authStore.js'
import { toast } from '../components/ui/Toast.jsx'
import { User, Ticket, KeyRound } from 'lucide-react'

const accountSchema = z.object({
  username: z.string().min(2, '用户名至少 2 字'),
  password: z.string().min(6, '密码至少 6 位'),
})

const cardSchema = z.object({
  cardCode: z.string().min(4, '请输入卡密').transform(s => s.trim().toUpperCase()),
})

export default function Login() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const redirect = params.get('redirect') || '/'
  const { loginAccount, loginCard, loading } = useAuthStore()
  const [tab, setTab] = useState('card') // 默认显示卡密（最常用）

  const accForm = useForm({ resolver: zodResolver(accountSchema) })
  const cardForm = useForm({ resolver: zodResolver(cardSchema) })

  const onAccount = async (data) => {
    try {
      await loginAccount(data)
      toast.success('登录成功！')
      navigate(redirect)
    } catch (err) {
      toast.error(err.message || '登录失败')
    }
  }

  const onCard = async (data) => {
    try {
      await loginCard(data.cardCode)
      toast.success('卡密激活成功！')
      navigate(redirect)
    } catch (err) {
      toast.error(err.message || '卡密无效')
    }
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4 py-8 bg-gradient-to-br from-primary-50 to-ink-50">
      <Card className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-serif font-bold text-ink-900">登录</h1>
          <p className="text-sm text-ink-500 mt-1">登录后享受完整 AI 起名服务</p>
        </div>

        {/* Tab 切换 */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-ink-100 rounded-lg mb-5">
          <button
            type="button"
            onClick={() => setTab('card')}
            className={clsx(
              'h-9 rounded-md text-sm font-medium transition flex items-center justify-center gap-1.5',
              tab === 'card' ? 'bg-white text-primary-600 shadow-sm' : 'text-ink-600'
            )}
          >
            <Ticket size={16} />
            卡密登录
          </button>
          <button
            type="button"
            onClick={() => setTab('account')}
            className={clsx(
              'h-9 rounded-md text-sm font-medium transition flex items-center justify-center gap-1.5',
              tab === 'account' ? 'bg-white text-primary-600 shadow-sm' : 'text-ink-600'
            )}
          >
            <User size={16} />
            账户登录
          </button>
        </div>

        {tab === 'card' && (
          <form onSubmit={cardForm.handleSubmit(onCard)} className="space-y-4">
            <div>
              <label className="label">
                <span className="inline-flex items-center gap-1.5">
                  <KeyRound size={14} /> 卡密
                </span>
              </label>
              <Input
                {...cardForm.register('cardCode')}
                placeholder="请输入卡密，例如：TESTVIP001"
                error={cardForm.formState.errors.cardCode?.message}
                className="font-mono tracking-wider"
                autoFocus
              />
              <p className="mt-1 text-xs text-ink-400">卡密不区分大小写</p>
            </div>
            <Button type="submit" loading={loading} className="w-full" size="lg">
              激活卡密
            </Button>
            <p className="text-center text-xs text-ink-500">
              没有卡密？请联系客服购买
            </p>
          </form>
        )}

        {tab === 'account' && (
          <form onSubmit={accForm.handleSubmit(onAccount)} className="space-y-4">
            <div>
              <label className="label">用户名</label>
              <Input
                {...accForm.register('username')}
                placeholder="请输入用户名"
                error={accForm.formState.errors.username?.message}
                autoFocus
              />
            </div>
            <div>
              <label className="label">密码</label>
              <Input
                type="password"
                {...accForm.register('password')}
                placeholder="请输入密码"
                error={accForm.formState.errors.password?.message}
              />
            </div>
            <Button type="submit" loading={loading} className="w-full" size="lg">
              登录
            </Button>
          </form>
        )}
      </Card>
    </div>
  )
}
