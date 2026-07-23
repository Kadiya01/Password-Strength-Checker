export function getEstimatedCrackTime(entropy: number): string {
  if (entropy < 25) return 'Instantly';
  if (entropy < 35) return 'Minutes to hours';
  if (entropy < 50) return 'Days to months';
  if (entropy < 65) return 'Years';
  if (entropy < 80) return 'Centuries';
  if (entropy < 100) return 'Millennia';
  return 'Heat death of the universe';
}

export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-500';
  if (score >= 60) return 'text-blue-500';
  if (score >= 40) return 'text-yellow-500';
  if (score >= 20) return 'text-orange-500';
  return 'text-red-500';
}

export function getProgressColor(score: number): string {
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-blue-500';
  if (score >= 40) return 'bg-yellow-500';
  if (score >= 20) return 'bg-orange-500';
  return 'bg-red-500';
}
