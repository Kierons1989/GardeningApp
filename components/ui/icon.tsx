import React, { memo } from 'react'
import * as Phosphor from '@phosphor-icons/react'
import type { IconProps as PhosphorIconProps } from '@phosphor-icons/react'

type IconName = string
type IconComponent = React.ComponentType<PhosphorIconProps>

// Pre-build icon lookup map at module level for performance
const iconMap: Record<string, IconComponent> = {}

function getIconComponent(name: string): IconComponent | null {
  // Check cache first
  if (iconMap[name]) return iconMap[name]

  // Try to find the icon
  const icons = Phosphor as Record<string, unknown>
  const component = icons[name] || icons[name + 'Icon']

  // Phosphor v2 exports ForwardRef components (objects), not functions
  if (component && (typeof component === 'function' || (typeof component === 'object' && component !== null))) {
    iconMap[name] = component as IconComponent
    return component as IconComponent
  }

  return null
}

interface Props {
  name: IconName
  size?: number
  weight?: 'thin' | 'light' | 'regular' | 'bold' | 'fill'
  className?: string
  style?: React.CSSProperties
  ariaLabel?: string
}

// Using React.createElement to avoid ESLint static-components false positive
// The component is retrieved from a module-level cache, not created during render
const Icon = memo(function Icon({ name, size = 16, weight = 'light', className, style, ariaLabel }: Props) {
  const IconComponent = getIconComponent(name)

  if (!IconComponent) return null

  return React.createElement(IconComponent, {
    size,
    weight,
    className,
    style,
    role: ariaLabel ? 'img' : undefined,
    'aria-hidden': ariaLabel ? undefined : true,
    'aria-label': ariaLabel,
  })
})

export default Icon
export type { IconName }
