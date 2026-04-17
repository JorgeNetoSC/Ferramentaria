'use client'

import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  showText?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function Logo({ className, showText = true, size = 'md' }: LogoProps) {
  const sizes = {
    sm: { icon: 'w-8 h-8', text: 'text-lg' },
    md: { icon: 'w-10 h-10', text: 'text-xl' },
    lg: { icon: 'w-14 h-14', text: 'text-2xl' },
  }

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className={cn(
        'relative flex items-center justify-center rounded-lg bg-gradient-to-br from-sidebar-primary to-sidebar-primary/80',
        sizes[size].icon
      )}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="w-6 h-6 text-sidebar-primary-foreground"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2L2 7l10 5 10-5-10-5Z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className={cn('font-bold tracking-tight text-sidebar-foreground', sizes[size].text)}>
            EAGLE
          </span>
          <span className="text-[10px] font-medium tracking-widest text-sidebar-primary uppercase -mt-1">
            SOLUÇÕES
          </span>
        </div>
      )}
    </div>
  )
}

export function LogoLight({ className, showText = true, size = 'md' }: LogoProps) {
  const sizes = {
    sm: { icon: 'w-8 h-8', text: 'text-lg' },
    md: { icon: 'w-10 h-10', text: 'text-xl' },
    lg: { icon: 'w-14 h-14', text: 'text-2xl' },
  }

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className={cn(
        'relative flex items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80',
        sizes[size].icon
      )}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="w-6 h-6 text-primary-foreground"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2L2 7l10 5 10-5-10-5Z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className={cn('font-bold tracking-tight text-foreground', sizes[size].text)}>
            EAGLE
          </span>
          <span className="text-[10px] font-medium tracking-widest text-primary uppercase -mt-1">
            SOLUÇÕES
          </span>
        </div>
      )}
    </div>
  )
}
