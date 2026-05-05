'use client'
import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-150 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed',
          {
            primary: 'bg-sage-600 text-white hover:bg-sage-700 shadow-sm',
            secondary: 'bg-cream-200 text-warm-700 hover:bg-cream-300',
            ghost: 'text-warm-700 hover:bg-cream-100',
            danger: 'bg-red-50 text-red-600 hover:bg-red-100',
          }[variant],
          {
            sm: 'px-3 py-1.5 text-sm',
            md: 'px-4 py-2.5 text-sm',
            lg: 'px-6 py-3 text-base',
          }[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'
export { Button }
