import clsx from 'clsx'

export function Skeleton({ className, ...rest }) {
  return (
    <div
      className={clsx('bg-ink-100 rounded animate-pulse', className)}
      {...rest}
    />
  )
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="text-center py-12 px-4">
      {Icon && (
        <div className="inline-flex w-14 h-14 items-center justify-center rounded-full bg-ink-100 text-ink-400 mb-3">
          <Icon size={28} />
        </div>
      )}
      <h3 className="text-base font-medium text-ink-700 mb-1">{title}</h3>
      {description && <p className="text-sm text-ink-500 mb-4">{description}</p>}
      {action}
    </div>
  )
}

export default Skeleton
