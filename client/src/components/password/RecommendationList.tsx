import { AlertTriangle } from "lucide-react";

interface RecommendationListProps {
  recommendations: string[];
}

export default function RecommendationList({ recommendations }: RecommendationListProps) {
  if (recommendations.length === 0) return null;

  return (
    <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
      <div className="mb-2 flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-yellow-600" />
        <h4 className="text-sm font-medium text-yellow-800">Recommendations</h4>
      </div>
      <ul className="space-y-1">
        {recommendations.map((rec, index) => (
          <li key={index} className="flex items-start gap-2 text-sm text-yellow-700">
            <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-yellow-500" />
            {rec}
          </li>
        ))}
      </ul>
    </div>
  );
}
