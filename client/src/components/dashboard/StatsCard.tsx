import { ReactNode } from "react";
import Card, { CardContent } from "@/components/ui/Card";

interface StatsCardProps {
  icon: ReactNode;
  title: string;
  value: string | number;
  description?: string;
}

export default function StatsCard({ icon, title, value, description }: StatsCardProps) {
  return (
    <Card>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            {icon}
          </div>
          <div>
            <p className="text-sm text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {description && <p className="text-xs text-gray-500">{description}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
