'use client'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'
import { useEffect, ReactNode } from 'react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  className?: string
}

export function Modal({ open, onClose, title, children, className }: ModalProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (open) document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-warm-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Sheet */}
      <div
        className={cn(
          'relative z-10 w-full bg-cream-50 shadow-2xl',
          'rounded-t-3xl sm:rounded-3xl',
          'max-h-[90dvh] overflow-y-auto',
          'sm:max-w-2xl',
          className
        )}
      >
        {title && (
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-cream-200 sticky top-0 bg-cream-50 z-10">
            <h2 className="text-lg font-semibold text-warm-900">{title}</h2>
            <button
              onClick={onClose}
              className="rounded-full p-1.5 text-warm-700 hover:bg-cream-200 transition"
            >
              <X size={18} />
            </button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}
