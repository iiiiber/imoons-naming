import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import Input, { Textarea, Select } from '../components/ui/Input.jsx'
import { COMMON_SURNAMES, SHICHEN } from '../lib/constants.js'
import { chartApi } from '../api/client.js'
import { toast } from '../components/ui/Toast.jsx'
import { Sparkles, Calendar, Clock, User } from 'lucide-react'

const schema = z.object({
  surname: z.string().min(1, '请输入姓氏'),
  gender: z.enum(['male', 'female']),
  birthDate: z.string().min(1, '请选择出生日期'),
  birthTime: z.string().min(1, '请选择出生时辰'),
  nameLength: z.enum(['2', '3']),
  calendar: z.enum(['solar', 'lunar']),
  customPref: z.string().max(500, '最多 500 字').optional(),
  preferences: z.array(z.string()).optional(),
})

// 起名偏好预设（多选，9 个 tag 覆盖 6 大类）
const PREF_TAGS = [
  '诗词典故',     // 古典：诗经楚辞唐诗宋词
  '成语起名',     // 古典：成语典故
  '周易国学',     // 国学：易经/道德经/四书
  '儒雅古风',     // 古典：古文古意
  '自然意象',     // 自然：山水花鸟天地
  '清新文艺',     // 自然：文艺小清新
  '品德志向',     // 品德：仁义礼智信/志向远大
  '霸气响亮',     // 期望：气势磅礴
  '现代简约',     // 现代：笔画少好写好记
]

export default function Naming() {
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      surname: '李',
      gender: 'male',
      birthDate: '',
      birthTime: '11-13',
      nameLength: '3',
      calendar: 'solar',
      customPref: '',
      preferences: [],
    },
  })

  const calendar = watch('calendar')
  const gender = watch('gender')
  const nameLength = watch('nameLength')
  const preferences = watch('preferences') || []

  const togglePref = (tag) => {
    const next = preferences.includes(tag)
      ? preferences.filter((t) => t !== tag)
      : [...preferences, tag]
    setValue('preferences', next, { shouldDirty: true })
  }

  const onSubmit = async (data) => {
    setSubmitting(true)
    try {
      // birthTime 是 "11-13" 这种时区间隔，转成具体 HH:MM（取区间中间）
      const [sh, eh] = data.birthTime.split('-').map(Number)
      const hour = Math.floor((sh + eh) / 2) % 24
      const birthtime = `${String(hour).padStart(2, '0')}:30`

      // 合并偏好：预设 tag + 自定义文字（老站风格："自定义：xxx"）
      const prefs = [...(data.preferences || [])]
      if (data.customPref && data.customPref.trim()) {
        prefs.push('自定义：' + data.customPref.trim())
      }

      // 公历直接发，农历转公历（6tail 在后端做反推）
      const res = await chartApi.analyze({
        surname: data.surname,
        gender: data.gender === 'male' ? 'boy' : 'girl',
        birthday: data.birthDate,
        birthtime,
        nameLength: Number(data.nameLength),
        preferences: prefs,
        calendar: data.calendar,    // 🆕 告诉后端是公历还是农历
      })
      // 存到 sessionStorage，result 页读
      sessionStorage.setItem('bazi_chart', JSON.stringify(res))
      sessionStorage.setItem('bazi_form', JSON.stringify({ ...data, birthtime }))

      // 调 action=record 持久化（登录用户会带 user_id；游客为 null 但记录仍存）
      try {
        await chartApi.record({
          surname: data.surname,
          gender: data.gender === 'male' ? 'boy' : 'girl',
          birthday: data.birthDate,
          bazi: res.bazi_computed || res.bazi || null,
          names: res.names || [],
          source: res.source || 'ai',
          preferences: prefs,
        })
      } catch (e) {
        // 入库失败不阻塞用户（chart 已成功），只在 console 提示
        console.warn('保存起名记录失败：', e.message)
      }

      navigate('/result')
    } catch (err) {
      toast.error(err.message || '排盘失败，请重试')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10 pb-24 md:pb-10 animate-fade-in">
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ink-900">八字起名</h1>
        <p className="mt-2 text-sm text-ink-500">输入宝宝信息，AI 智能推荐好名字</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* 姓氏 */}
          <div>
            <label className="label">
              <span className="inline-flex items-center gap-1.5">
                <User size={14} /> 姓氏
              </span>
            </label>
            <Input
              {...register('surname')}
              placeholder="请输入宝宝姓氏"
              maxLength={2}
              error={errors.surname?.message}
            />
          </div>

          {/* 性别 */}
          <div>
            <label className="label">性别</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { v: 'male', label: '男 ♂', color: 'border-blue-300 bg-blue-50 text-blue-700' },
                { v: 'female', label: '女 ♀', color: 'border-pink-300 bg-pink-50 text-pink-700' },
              ].map(opt => (
                <label
                  key={opt.v}
                  className={`flex items-center justify-center h-11 rounded-lg border-2 cursor-pointer transition ${
                    gender === opt.v ? opt.color : 'border-ink-200 bg-white text-ink-600'
                  }`}
                >
                  <input
                    type="radio"
                    value={opt.v}
                    {...register('gender')}
                    className="sr-only"
                  />
                  <span className="font-medium">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 历法 */}
          <div>
            <label className="label">历法</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { v: 'solar', label: '公历（阳历）' },
                { v: 'lunar', label: '农历（阴历）' },
              ].map(opt => (
                <label
                  key={opt.v}
                  className={`flex items-center justify-center h-10 rounded-lg border cursor-pointer transition text-sm ${
                    calendar === opt.v ? 'border-primary-400 bg-primary-50 text-primary-700' : 'border-ink-200 bg-white text-ink-600'
                  }`}
                >
                  <input type="radio" value={opt.v} {...register('calendar')} className="sr-only" />
                  {opt.label}
                </label>
              ))}
            </div>
            {calendar === 'lunar' && (
              <p className="mt-1.5 text-xs text-ink-400">
                ⚠️ 农历日期将自动转换为公历用于八字计算（闰月请用公历）
              </p>
            )}
          </div>

          {/* 出生日期 + 时辰（等宽） */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar size={14} /> 出生日期
                </span>
              </label>
              <Input
                type="date"
                {...register('birthDate')}
                error={errors.birthDate?.message}
              />
            </div>
            <div>
              <label className="label">
                <span className="inline-flex items-center gap-1.5">
                  <Clock size={14} /> 出生时辰
                </span>
              </label>
              <Select {...register('birthTime')} error={errors.birthTime?.message}>
                {SHICHEN.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </Select>
            </div>
          </div>

          {/* 名字字长 */}
          <div>
            <label className="label">名字字数</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { v: '2', label: '单字名（名1个字）' },
                { v: '3', label: '双字名（名2个字）' },
              ].map(opt => (
                <label
                  key={opt.v}
                  className={`flex items-center justify-center h-10 rounded-lg border-2 cursor-pointer transition text-sm ${
                    nameLength === opt.v ? 'border-primary-400 bg-primary-50 text-primary-700' : 'border-ink-200 bg-white text-ink-600'
                  }`}
                >
                  <input
                    type="radio"
                    value={opt.v}
                    {...register('nameLength')}
                    className="sr-only"
                  />
                  <span className="font-medium">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 个性偏好 */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="label !mb-0">起名偏好</label>
              <span className="text-xs text-ink-400">选填，可多选</span>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {PREF_TAGS.map((tag) => {
                const selected = preferences.includes(tag)
                return (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => togglePref(tag)}
                    className={`px-3 py-1 rounded-full text-xs border transition-all ${
                      selected
                        ? 'bg-gradient-to-br from-primary-500 to-primary-400 text-white border-transparent shadow-sm'
                        : 'bg-white text-ink-600 border-ink-200 hover:border-primary-300 hover:text-primary-600'
                    }`}
                  >
                    {tag}
                  </button>
                )
              })}
            </div>
            <Textarea
              {...register('customPref')}
              placeholder='自定义偏好（选填）：如"希望名字带水字旁"、"姓李想避开同班同学名"等'
              rows={2}
              maxLength={200}
              error={errors.customPref?.message}
            />
            <p className="mt-1 text-xs text-ink-400">选中标签与自定义内容会一并传给 AI</p>
          </div>

          <Button
            type="submit"
            size="lg"
            loading={submitting}
            className="w-full"
          >
            <Sparkles size={18} />
            {submitting ? '排盘中...' : '开始排盘'}
          </Button>
        </form>
      </Card>
    </div>
  )
}
