import { formatDate, getStrengthColor } from "@/utils/formatters";
import Badge from "@/components/ui/Badge";
import type { PasswordLog } from "@/types/password.types";

interface PasswordHistoryTableProps {
  logs: PasswordLog[];
}

export default function PasswordHistoryTable({ logs }: PasswordHistoryTableProps) {
  if (logs.length === 0) return null;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Score</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Label</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Entropy</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Classes</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {logs.map((log) => (
            <tr key={log.id} className="hover:bg-gray-50">
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">{formatDate(log.createdAt)}</td>
              <td className="whitespace-nowrap px-6 py-4">
                <span className={`text-sm font-bold ${getStrengthColor(log.strengthScore)}`}>{log.strengthScore}</span>
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <Badge
                  variant={
                    log.strengthScore >= 76
                      ? "success"
                      : log.strengthScore >= 51
                      ? "warning"
                      : "danger"
                  }
                >
                  {log.strengthLabel}
                </Badge>
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                {log.entropy.toFixed(1)} bits
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <div className="flex gap-1">
                  {log.hasUppercase && <Badge variant="info">A-Z</Badge>}
                  {log.hasLowercase && <Badge variant="info">a-z</Badge>}
                  {log.hasNumbers && <Badge variant="info">0-9</Badge>}
                  {log.hasSymbols && <Badge variant="info">!@#</Badge>}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
