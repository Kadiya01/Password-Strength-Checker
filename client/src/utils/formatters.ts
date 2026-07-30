export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function getStrengthColor(score: number): string {
  if (score >= 90) return "text-emerald-500";
  if (score >= 75) return "text-green-500";
  if (score >= 50) return "text-yellow-500";
  if (score >= 25) return "text-orange-500";
  return "text-red-500";
}

export function getStrengthBgColor(score: number): string {
  if (score >= 90) return "bg-emerald-500";
  if (score >= 75) return "bg-green-500";
  if (score >= 50) return "bg-yellow-500";
  if (score >= 25) return "bg-orange-500";
  return "bg-red-500";
}

export function getStrengthBarColor(score: number): string {
  if (score >= 90) return "bg-emerald-500";
  if (score >= 75) return "bg-green-500";
  if (score >= 50) return "bg-yellow-500";
  if (score >= 25) return "bg-orange-500";
  return "bg-red-500";
}

export function getGradientBarColor(score: number): string {
  if (score >= 90) return "bg-gradient-to-r from-emerald-500 to-teal-400";
  if (score >= 75) return "bg-gradient-to-r from-green-500 to-emerald-400";
  if (score >= 50) return "bg-gradient-to-r from-blue-600 to-blue-400";
  if (score >= 25) return "bg-gradient-to-r from-yellow-500 to-orange-400";
  return "bg-gradient-to-r from-red-600 to-red-400";
}
