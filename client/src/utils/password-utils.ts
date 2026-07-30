export function getEstimatedCrackTime(entropy: number): string {
  if (entropy < 25) return 'Instantly';
  if (entropy < 35) return 'Minutes to hours';
  if (entropy < 50) return 'Days to months';
  if (entropy < 65) return 'Years';
  if (entropy < 80) return 'Centuries';
  if (entropy < 100) return 'Millennia';
  return 'Heat death of the universe';
}

export function getProgressColor(score: number): string {
  if (score >= 90) return 'bg-emerald-500';
  if (score >= 75) return 'bg-green-500';
  if (score >= 50) return 'bg-blue-500';
  if (score >= 25) return 'bg-yellow-500';
  return 'bg-red-500';
}
