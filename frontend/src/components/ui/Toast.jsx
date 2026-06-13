import { create } from 'zustand'
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react'
import clsx from 'clsx'

let idCounter = 0
const useToastStore = create((set) => ({
  toasts: [],
  add: (toast) => {
    const id = ++idCounter
    set((s) => ({ toasts: [...s.toasts, { id, ...toast }] }))
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter(t => t.id !== id) }))
    }, toast.duration || 3000)
  },
  remove: (id) => set((s) => ({ toasts: s.toasts.filter(t => t.id !== id) })),
}))

const icons = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
}

const colors = {
  success: 'text-green-600',
  error: 'text-red-500',
  info: 'text-blue-500',
  warning: 'text-amber-500',
}

export function ToastViewport() {
  const toasts = useToastStore(s => s.toasts)
  const remove = useToastStore(s => s.remove)

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => {
        const Icon = icons[t.type] || Info
        return (
          <div
            key={t.id}
            className="pointer-events-auto bg-white shadow-lg rounded-lg px-4 py-3 flex items-center gap-3 min-w-[200px] max-w-sm animate-slide-up"
          >
            <Icon size={20} className={colors[t.type] || 'text-ink-500'} />
            <span className="flex-1 text-sm text-ink-800">{t.message}</span>
            <button
              onClick={() => remove(t.id)}
              className="text-ink-400 hover:text-ink-600 p-0.5"
              aria-label="关闭"
            >
              <X size={16} />
            </button>
          </div>
        )
      })}
    </div>
  )
}

export const toast = {
  success: (message, opts) => useToastStore.getState().add({ type: 'success', message, ...opts }),
  error: (message, opts) => useToastStore.getState().add({ type: 'error', message, ...opts }),
  info: (message, opts) => useToastStore.getState().add({ type: 'info', message, ...opts }),
  warning: (message, opts) => useToastStore.getState().add({ type: 'warning', message, ...opts }),
}
