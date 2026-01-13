export function formatPlantedIn(plantedIn: string): string {
  const labels: Record<string, string> = {
    ground: 'In ground',
    pot: 'In pot',
    raised_bed: 'Raised bed',
  }
  return labels[plantedIn] || plantedIn
}
