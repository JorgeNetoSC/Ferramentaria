'use client'

import { cn } from '@/lib/utils'
import Image from 'next/image'

interface LogoProps {
  className?: string
  showText?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const sizes = {
  sm: { img: 32 },
  md: { img: 40 },
  lg: { img: 56 },
}

export function Logo({ className, size = 'md' }: LogoProps) {
  return (
    <div className={cn('flex items-center', className)}>
      <Image
        src="/LOGO EAGLE .jpg"
        alt="Eagle Soluções"
        width={sizes[size].img}
        height={sizes[size].img}
        className="rounded-lg object-contain"
        priority
      />
    </div>
  )
}

export function LogoLight({ className, size = 'md' }: LogoProps) {
  return (
    <div className={cn('flex items-center', className)}>
      <Image
        src="/LOGO EAGLE .jpg"
        alt="Eagle Soluções"
        width={sizes[size].img}
        height={sizes[size].img}
        className="rounded-lg object-contain"
        priority
      />
    </div>
  )
}