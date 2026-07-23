import { ExportData } from "@/interfaces";
import { dashboardRepository } from "@/repositories/dashboard.repository";

export class ReportExportService {
  async exportData(
    userId: string,
    type: "password_logs" | "login_history" | "security_events",
    format: "csv" | "json",
    startDate?: Date,
    endDate?: Date
  ): Promise<ExportData> {
    let data: unknown[];
    let filename: string;

    switch (type) {
      case "password_logs":
        data = await dashboardRepository.getPasswordLogsForExport(userId, startDate, endDate);
        filename = `password_logs_${this.getDateSuffix()}`;
        break;
      case "login_history":
        data = await dashboardRepository.getLoginHistoryForExport(userId, startDate, endDate);
        filename = `login_history_${this.getDateSuffix()}`;
        break;
      case "security_events":
        data = await dashboardRepository.getSecurityEventsForExport(userId, startDate, endDate);
        filename = `security_events_${this.getDateSuffix()}`;
        break;
      default: {
        const _exhaustive: never = type;
        throw new Error(`Unsupported export type: ${String(_exhaustive)}`);
      }
    }

    if (format === "csv") {
      return {
        format: "csv",
        data: this.convertToCSV(data, type),
        filename: `${filename}.csv`,
        contentType: "text/csv",
      };
    } else {
      return {
        format: "json",
        data: JSON.stringify(data, null, 2),
        filename: `${filename}.json`,
        contentType: "application/json",
      };
    }
  }

  private convertToCSV(data: unknown[], type: string): string {
    if (data.length === 0) return "";

    const headers = this.getCSVHeaders(type);
    const rows = data.map((item) => this.getCSVRow(item as Record<string, unknown>, type));

    return [headers.join(","), ...rows.map((row) => row.map((cell) => this.escapeCSVValue(cell)).join(","))].join("\n");
  }

  private escapeCSVValue(value: string): string {
    const trimmed = value.trim();
    if (/^[=+\-@\t\r]/.test(trimmed)) {
      return `"${trimmed}"`;
    }
    if (trimmed.includes(",") || trimmed.includes('"') || trimmed.includes("\n")) {
      return `"${trimmed.replace(/"/g, '""')}"`;
    }
    return trimmed;
  }

  private getCSVHeaders(type: string): string[] {
    switch (type) {
      case "password_logs":
        return ["ID", "Strength Score", "Strength Label", "Has Uppercase", "Has Lowercase", "Has Numbers", "Has Symbols", "Entropy", "Created At"];
      case "login_history":
        return ["ID", "IP Address", "User Agent", "Success", "Failure Reason", "Created At"];
      case "security_events":
        return ["ID", "Event Type", "IP Address", "User Agent", "Metadata", "Created At"];
      default:
        return [];
    }
  }

  private getCSVRow(item: Record<string, unknown>, type: string): string[] {
    switch (type) {
      case "password_logs":
        return [
          String(item.id ?? ""),
          String(item.strengthScore ?? ""),
          String(item.strengthLabel ?? ""),
          String(item.hasUppercase ?? ""),
          String(item.hasLowercase ?? ""),
          String(item.hasNumbers ?? ""),
          String(item.hasSymbols ?? ""),
          String(item.entropy ?? ""),
          item.createdAt instanceof Date ? item.createdAt.toISOString() : String(item.createdAt ?? ""),
        ];
      case "login_history":
        return [
          String(item.id ?? ""),
          String(item.ipAddress ?? ""),
          String(item.userAgent ?? ""),
          String(item.success ?? ""),
          String(item.failureReason ?? ""),
          item.createdAt instanceof Date ? item.createdAt.toISOString() : String(item.createdAt ?? ""),
        ];
      case "security_events":
        return [
          String(item.id ?? ""),
          String(item.eventType ?? ""),
          String(item.ipAddress ?? ""),
          String(item.userAgent ?? ""),
          item.metadata ? JSON.stringify(item.metadata) : "",
          item.createdAt instanceof Date ? item.createdAt.toISOString() : String(item.createdAt ?? ""),
        ];
      default:
        return [];
    }
  }

  private getDateSuffix(): string {
    const now = new Date();
    return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  }
}

export const reportExportService = new ReportExportService();
