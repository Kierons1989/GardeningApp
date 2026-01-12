import React from 'react'
import * as Phosphor from '@phosphor-icons/react'

type IconName = string

interface Props {
  name: IconName
  size?: number
  weight?: 'thin' | 'light' | 'regular' | 'bold' | 'fill'
  className?: string
  style?: React.CSSProperties
  ariaLabel?: string
}

function resolve(name: string) {
  if ((Phosphor as any)[name]) return (Phosphor as any)[name]
  if ((Phosphor as any)[name + 'Icon']) return (Phosphor as any)[name + 'Icon']
  return null
}

export default function Icon({ name, size = 16, weight = 'light', className, style, ariaLabel }: Props) {
  const Component = resolve(name)
  if (!Component) return null
  return (
    <Component
      size={size}
      weight={weight}
      className={className}
      style={style}
      role={ariaLabel ? 'img' : undefined}
      aria-hidden={ariaLabel ? undefined : true}
      aria-label={ariaLabel}
    />
  )
}

export type { IconName }
