import clsx from 'clsx'

export default function Card({ className, children, hover = false, ...rest }) {
  return (
    <div
      className={clsx(
        'bg-white rounded-xl shadow-card p-4 sm:p-6',
        hover && 'transition-shadow duration-200 hover:shadow-card-hover',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  )
}
