import { motion } from "framer-motion";
import { getStrengthBarColor, getStrengthColor } from "@/utils/formatters";

interface StrengthMeterProps {
  score: number;
  label: string;
}

export default function StrengthMeter({ score, label }: StrengthMeterProps) {
  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Password Strength</span>
        <span className={`text-sm font-bold ${getStrengthColor(score)}`}>
          {score}/100 - {label}
        </span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
        <motion.div
          className={`h-full rounded-full ${getStrengthBarColor(score)}`}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
