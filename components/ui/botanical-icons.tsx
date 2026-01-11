/**
 * Custom botanical SVG icon set
 * Consistent stroke weight and botanical aesthetic
 */

interface IconProps {
  className?: string
  style?: React.CSSProperties
}

// Task Category Icons
export function PruningIcon({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M7 21l3-3-3-3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 3l-3 3 3 3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 18c0-2.5 2-4 4-4s4 1.5 4 4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 10c0 2.5-2 4-4 4s-4-1.5-4-4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 6l4 4m0-4l-4 4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function FeedingIcon({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 2v8m0 4v8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 6c0 3 2.5 5 6 5s6-2 6-5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 13c0 2 1.5 4 4 4s4-2 4-4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="10" r="1" fill="currentColor" />
      <circle cx="12" cy="15" r="1" fill="currentColor" />
    </svg>
  )
}

export function PestControlIcon({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} fill="none" stroke="currentColor" strokeWidth="1.5">
      <ellipse cx="12" cy="14" rx="5" ry="7" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="7" r="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 7l-2-3M17 7l2-3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 14l-2 1.5M17 14l2 1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 19l-1.5 2M15 19l1.5 2" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="10" y1="7" x2="10" y2="8" strokeLinecap="round" />
      <line x1="14" y1="7" x2="14" y2="8" strokeLinecap="round" />
    </svg>
  )
}

export function PlantingIcon({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 22V12" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 12c0-3 2-6 5-6 0 3-2 6-5 6z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 12c0-3-2-6-5-6 0 3 2 6 5 6z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 22h14" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="2" r="1" fill="currentColor" />
    </svg>
  )
}

export function WateringIcon({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 2v6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 15a3 3 0 003 3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function HarvestingIcon({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 12h18M3 12c0-4.97 4.03-9 9-9s9 4.03 9 9M3 12c0 4.97 4.03 9 9 9s9-4.03 9-9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 3c-2 0-3 4-3 9s1 9 3 9 3-4 3-9-1-9-3-9z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="8" r="1" fill="currentColor" />
      <circle cx="12" cy="16" r="1" fill="currentColor" />
      <circle cx="8" cy="12" r="1" fill="currentColor" />
      <circle cx="16" cy="12" r="1" fill="currentColor" />
    </svg>
  )
}

export function WinterCareIcon({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 2v20M17 7L7 17M7 7l10 10" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="2" r="1" fill="currentColor" />
      <circle cx="12" cy="22" r="1" fill="currentColor" />
      <circle cx="17" cy="7" r="1" fill="currentColor" />
      <circle cx="7" cy="17" r="1" fill="currentColor" />
      <circle cx="7" cy="7" r="1" fill="currentColor" />
      <circle cx="17" cy="17" r="1" fill="currentColor" />
    </svg>
  )
}

export function GeneralTaskIcon({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="5" width="18" height="14" rx="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 9h10M7 13h6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// Plant Type Icons
export function RoseIcon({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="10" r="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 13c-2 0-4 1-4 3s1.5 3 4 3 4-1 4-3-2-3-4-3z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 7c-2-1-4 0-4 2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 7c2-1 4 0 4 2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 10c-2 0-3 1-3 2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 10c2 0 3 1 3 2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 19v3M10 22h4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function ShrubIcon({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 22V14" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="8" r="6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="8" cy="6" r="3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="16" cy="6" r="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 22h12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function PerennialIcon({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 22V8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="5" r="3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="8" cy="5" r="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="16" cy="5" r="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="10" cy="3" r="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="14" cy="3" r="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 22h6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function BulbIcon({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 16v6M9 22h6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 2c-3 0-5 3-5 6 0 2 1 3 2 4h6c1-1 2-2 2-4 0-3-2-6-5-6z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 12c0 1 1 2 3 2s3-1 3-2" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="12" y1="2" x2="12" y2="4" strokeLinecap="round" />
    </svg>
  )
}

export function VegetableIcon({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 2v3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 4c-1-1-3-1-3 1s1.5 3 3 3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 4c1-1 3-1 3 1s-1.5 3-3 3" strokeLinecap="round" strokeLinejoin="round" />
      <ellipse cx="12" cy="14" rx="5" ry="8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 14c1-1 2-2 4-2s3 1 4 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function TreeIcon({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 22V10" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 22h8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="5" r="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 8c-4 0-7 2-7 5s3 5 7 5 7-2 7-5-3-5-7-5z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 11c1-1 2-1.5 3-1.5s2 .5 3 1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function ClimberIcon({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 2v20M4 6h4M4 12h4M4 18h4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 6c2 0 4 1 4 3s-1 4-3 4c2 1 4 2 4 4s-2 3-5 3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="9" r="1.5" fill="currentColor" />
      <circle cx="10" cy="17" r="1.5" fill="currentColor" />
      <circle cx="14" cy="13" r="1.5" fill="currentColor" />
    </svg>
  )
}

export function HerbIcon({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 22V10" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 10c-2-1-4 0-4 2s1 3 4 3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 10c2-1 4 0 4 2s-1 3-4 3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 13c-1.5-1-3 0-3 2s1 3 3 3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 13c1.5-1 3 0 3 2s-1 3-3 3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 6c0-2-1-4-2-4M12 6c0-2 1-4 2-4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 22h4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function SucculentIcon({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 22V12" strokeLinecap="round" strokeLinejoin="round" />
      <ellipse cx="12" cy="16" rx="6" ry="6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 14c1-2 2-3 4-3s3 1 4 3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 16c1-1 2-2 6-2s5 1 6 2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 19c1.5-1 3-1.5 5-1.5s3.5.5 5 1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="10" r="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function GenericPlantIcon({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 22V8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.5 11.5C5.5 9 7 4 12 4s6.5 5 6.5 7.5c0 3-2.5 4.5-6.5 4.5s-6.5-1.5-6.5-4.5z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 22h6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// Helper function to get icon by category
export function getCategoryIcon(category: string, className?: string, style?: React.CSSProperties) {
  const icons: Record<string, React.ReactNode> = {
    pruning: <PruningIcon className={className} style={style} />,
    feeding: <FeedingIcon className={className} style={style} />,
    pest_control: <PestControlIcon className={className} style={style} />,
    planting: <PlantingIcon className={className} style={style} />,
    watering: <WateringIcon className={className} style={style} />,
    harvesting: <HarvestingIcon className={className} style={style} />,
    winter_care: <WinterCareIcon className={className} style={style} />,
    general: <GeneralTaskIcon className={className} style={style} />,
  }
  return icons[category] || <GeneralTaskIcon className={className} style={style} />
}

// Helper function to get icon by plant type
export function getPlantTypeIcon(plantType: string | null, className?: string, style?: React.CSSProperties) {
  const type = plantType?.toLowerCase() || ''
  const icons: Record<string, React.ReactNode> = {
    rose: <RoseIcon className={className} style={style} />,
    shrub: <ShrubIcon className={className} style={style} />,
    perennial: <PerennialIcon className={className} style={style} />,
    bulb: <BulbIcon className={className} style={style} />,
    vegetable: <VegetableIcon className={className} style={style} />,
    fruit: <TreeIcon className={className} style={style} />,
    tree: <TreeIcon className={className} style={style} />,
    climber: <ClimberIcon className={className} style={style} />,
    herb: <HerbIcon className={className} style={style} />,
    succulent: <SucculentIcon className={className} style={style} />,
  }
  return icons[type] || <GenericPlantIcon className={className} style={style} />
}
