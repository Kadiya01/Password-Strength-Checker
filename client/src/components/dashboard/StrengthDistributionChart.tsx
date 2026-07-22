import { motion } from "framer-motion";
import Card, { CardHeader, CardContent } from "@/components/ui/Card";

interface DistributionProps {
  weak: number;
  fair: number;
  strong: number;
  veryStrong: number;
}

export default function StrengthDistributionChart({ weak, fair, strong, veryStrong }: DistributionProps) {
  const total = weak + fair + strong + veryStrong;
  const items = [
    { label: "Very Strong", count: veryStrong, color: "bg-emerald-500" },
    { label: "Strong", count: strong, color: "bg-green-500" },
    { label: "Fair", count: fair, color: "bg-yellow-500" },
    { label: "Weak", count: weak, color: "bg-red-500" },
  ];

  if (total === 0) {
    return (
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Strength Distribution</h3>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">No password data yet. Start checking passwords to see distribution.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold text-gray-900">Strength Distribution</h3>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.label}>
              <div className="mb-1 flex justify-between text-sm">
                <span className="text-gray-600">{item.label}</span>
                <span className="font-medium text-gray-900">{item.count}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                <motion.div
                  className={`h-full rounded-full ${item.color}`}
                  initial={{ width: 0 }}
                  animate={{ width: total > 0 ? `${(item.count / total) * 100}%` : "0%" }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
