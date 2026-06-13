import clsx from 'clsx'
import { forwardRef } from 'react'

const Input = forwardRef(function Input({ className, error, ...rest }, ref) {
  return (
    <div>
      <input
        ref={ref}
        className={clsx(
          'w-full h-10 px-3 rounded-lg border bg-white text-ink-800 placeholder-ink-400 transition focus:outline-none focus:ring-2',
          error
            ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
            : 'border-ink-200 focus:border-primary-400 focus:ring-primary-100',
          className
        )}
        {...rest}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
})

export const Textarea = forwardRef(function Textarea({ className, error, ...rest }, ref) {
  return (
    <div>
      <textarea
        ref={ref}
        className={clsx(
          'w-full px-3 py-2.5 rounded-lg border bg-white text-ink-800 placeholder-ink-400 transition focus:outline-none focus:ring-2 resize-none',
          error
            ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
            : 'border-ink-200 focus:border-primary-400 focus:ring-primary-100',
          className
        )}
        {...rest}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
})

export const Select = forwardRef(function Select({ className, children, error, ...rest }, ref) {
  return (
    <div>
      <select
        ref={ref}
        className={clsx(
          'w-full h-10 px-3 rounded-lg border bg-white text-ink-800 transition focus:outline-none focus:ring-2',
          error
            ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
            : 'border-ink-200 focus:border-primary-400 focus:ring-primary-100',
          className
        )}
        {...rest}
      >
        {children}
      </select>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
})

export default Input
