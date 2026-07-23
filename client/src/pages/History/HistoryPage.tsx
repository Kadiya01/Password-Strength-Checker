import { useState } from "react";
import { Download, Search, ChevronLeft, ChevronRight, History, Trash2 } from "lucide-react";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import Button from "@/components/ui/Button";
import Card, { CardContent } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { usePasswordHistory } from "@/hooks/usePasswordHistory";
import { useUiStore } from "@/store/uiStore";
import { passwordService } from "@/services/passwordService";
import { formatDate, getStrengthColor } from "@/utils/formatters";
import { getEstimatedCrackTime } from "@/utils/password-utils";
import type { PasswordLog } from "@/types/password.types";

export default function HistoryPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { data, isLoading, refetch } = usePasswordHistory(page, 10);
  const { addToast } = useUiStore();

  const handleClearHistory = () => {
    const confirmed = window.confirm("Clear password evaluation history?");
    if (!confirmed) return;
    passwordService.clearHistory();
    addToast({ type: "info", message: "History clearing is not supported by the server." });
    refetch();
  };

  const handleExportCSV = () => {
    const logs: PasswordLog[] = data?.data || [];
    if (logs.length === 0) {
      addToast({ type: "warning", message: "No history records to export." });
      return;
    }

    const headers = ["Date", "Score", "Strength", "Entropy (bits)", "Estimated Crack Time", "Uppercase", "Lowercase", "Numbers", "Symbols"];
    const rows = logs.map((log: PasswordLog) => [
      new Date(log.createdAt).toISOString(),
      log.strengthScore,
      log.strengthLabel,
      log.entropy.toFixed(2),
      getEstimatedCrackTime(log.entropy),
      log.hasUppercase ? "Yes" : "No",
      log.hasLowercase ? "Yes" : "No",
      log.hasNumbers ? "Yes" : "No",
      log.hasSymbols ? "Yes" : "No",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `password_audit_log_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast({ type: "success", message: "CSV file exported successfully!" });
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const allLogs: PasswordLog[] = data?.data || [];

  const filteredLogs = allLogs.filter((log: PasswordLog) => {
    const q = search.toLowerCase();
    return (
      log.strengthLabel.toLowerCase().includes(q) ||
      log.strengthScore.toString().includes(q) ||
      log.entropy.toString().includes(q)
    );
  });

  const totalPages = data?.pagination?.totalPages || 1;

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight dark:text-white sm:text-3xl">
            Password Audit Log
          </h1>
          <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
            Export and inspect historical evaluation metrics.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleExportCSV}
            variant="outline"
            className="h-10 gap-1.5 rounded-xl border-gray-200 dark:border-gray-800"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button
            onClick={handleClearHistory}
            variant="ghost"
            className="h-10 gap-1.5 rounded-xl text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20"
          >
            <Trash2 className="h-4 w-4" />
            Clear
          </Button>
        </div>
      </div>

      <Card className="glass-panel border-gray-200/60 dark:border-gray-800/80">
        <CardContent className="p-4">
          <label htmlFor="history-search" className="sr-only">Search password history</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              id="history-search"
              type="text"
              placeholder="Search by strength label or scores..."
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
              className="h-10 w-full rounded-xl border border-gray-200 bg-white/50 pl-10 pr-4 text-xs placeholder:text-gray-400 focus:border-blue-500 focus:outline-none dark:border-gray-800 dark:bg-gray-900/50"
            />
          </div>
        </CardContent>
      </Card>

      {filteredLogs.length === 0 ? (
        <Card className="glass-panel border-gray-200/60 dark:border-gray-800/80">
          <CardContent className="p-12 text-center text-gray-400">
            <History className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">No history records found</h3>
            <p className="text-xs text-gray-500 mt-1">
              {search ? "No records matched your search query." : "Run a password strength check to register log items."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900/50">
            <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800">
              <thead className="bg-gray-50/50 dark:bg-gray-900/80">
                <tr>
                  <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Date Checked</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Score</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Strength</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Entropy</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Crack Time (GPU)</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredLogs.map((log: PasswordLog) => (
                  <tr key={log.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-all">
                    <td className="whitespace-nowrap px-6 py-4 text-xs font-medium text-gray-500 dark:text-gray-400">
                      {formatDate(log.createdAt)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-black">
                      <span className={getStrengthColor(log.strengthScore)}>{log.strengthScore}/100</span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <Badge variant={log.strengthScore >= 75 ? "success" : log.strengthScore >= 45 ? "warning" : "danger"}>
                        {log.strengthLabel}
                      </Badge>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-xs font-semibold">
                      {Math.round(log.entropy)} bits
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400">
                      {getEstimatedCrackTime(log.entropy)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex gap-1.5">
                        {log.hasUppercase && <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[9px] font-bold text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">A-Z</span>}
                        {log.hasLowercase && <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[9px] font-bold text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">a-z</span>}
                        {log.hasNumbers && <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[9px] font-bold text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">0-9</span>}
                        {log.hasSymbols && <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[9px] font-bold text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">!@#</span>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-xs text-gray-500">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
