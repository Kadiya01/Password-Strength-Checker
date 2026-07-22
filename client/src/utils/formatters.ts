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
  if (score >= 91) return "text-emerald-500";
  if (score >= 76) return "text-green-500";
  if (score >= 51) return "text-yellow-500";
  if (score >= 26) return "text-orange-500";
  return "text-red-500";
}

export function getStrengthBgColor(score: number): string {
  if (score >= 91) return "bg-emerald-500";
  if (score >= 76) return "bg-green-500";
  if (score >= 51) return "bg-yellow-500";
  if (score >= 26) return "bg-orange-500";
  return "bg-red-500";
}

export function getStrengthBarColor(score: number): string {
  if (score >= 91) return "bg-emerald-500";
  if (score >= 76) return "bg-green-500";
  if (score >= 51) return "bg-yellow-500";
  if (score >= 26) return "bg-orange-500";
  return "bg-red-500";
}
