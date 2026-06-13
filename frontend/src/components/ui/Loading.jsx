import clsx from 'clsx'

export function Spinner({ size = 24, className }) {
  return (
    <div
      className={clsx('inline-block animate-spin rounded-full border-2 border-current border-t-transparent', className)}
      style={{ width: size, height: size }}
      role="status"
    />
  )
}

export default function Loading({ tip = '加载中...' }) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-ink-500">
      <Spinner size={32} className="text-primary-500" />
      <p className="text-sm">{tip}</p>
    </div>
  )
}
