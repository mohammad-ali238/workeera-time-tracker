import type { Timer, TimerEntry } from "./types";
import { formatCost, calculateCost } from "./currency";
import {
  formatDurationShort,
  formatEntryDate,
  formatEntryTime,
} from "./time";

interface ExportRow {
  client: string;
  project: string;
  date: string;
  start: string;
  end: string;
  durationMs: number;
  durationLabel: string;
  rate: number;
  cost: number;
  currency: string;
  note: string;
}

function csvEscape(value: string | number): string {
  const s = String(value);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function toRows(timers: Timer[]): ExportRow[] {
  const rows: ExportRow[] = [];
  for (const t of timers) {
    const tz = t.settings.timezone;
    for (const entry of t.entries) {
      const durationMs = entry.end - entry.start;
      rows.push({
        client: t.settings.clientName || "No client",
        project: t.settings.projectName || "Untitled timer",
        date: formatEntryDate(entry.start, tz),
        start: formatEntryTime(entry.start, tz),
        end: formatEntryTime(entry.end, tz),
        durationMs,
        durationLabel: formatDurationShort(durationMs),
        rate: t.settings.hourlyRate,
        cost: calculateCost(durationMs, t.settings.hourlyRate),
        currency: t.settings.currency,
        note: entry.note ?? "",
      });
    }
  }
  rows.sort((a, b) => {
    if (a.client !== b.client) return a.client.localeCompare(b.client);
    return a.project.localeCompare(b.project);
  });
  return rows;
}

export function timersHaveEntries(timers: Timer[]): boolean {
  return timers.some((t) => t.entries.length > 0);
}

export function exportCSV(timers: Timer[]): void {
  const rows = toRows(timers);
  const header = [
    "Client",
    "Project",
    "Date",
    "Start",
    "End",
    "Duration",
    "Duration (ms)",
    "Rate",
    "Currency",
    "Cost",
    "Note",
  ];
  const lines = [header.join(",")];
  for (const r of rows) {
    lines.push(
      [
        csvEscape(r.client),
        csvEscape(r.project),
        csvEscape(r.date),
        csvEscape(r.start),
        csvEscape(r.end),
        csvEscape(r.durationLabel),
        csvEscape(r.durationMs),
        csvEscape(r.rate),
        csvEscape(r.currency),
        csvEscape(r.cost.toFixed(2)),
        csvEscape(r.note),
      ].join(",")
    );
  }
  const blob = new Blob([lines.join("\n")], {
    type: "text/csv;charset=utf-8;",
  });
  downloadBlob(blob, `workeera-${dateStamp()}.csv`);
}

export function exportPDF(timers: Timer[]): void {
  // Dynamic import so jsPDF stays out of the initial bundle.
  import("jspdf").then(async ({ jsPDF }) => {
    const autoTable = (await import("jspdf-autotable")).default;
    const rows = toRows(timers);
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("workeera", 40, 44);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text(
      `Timesheet · generated ${new Date().toLocaleDateString()}`,
      pageWidth - 40,
      44,
      { align: "right" }
    );
    doc.setTextColor(0);

    let cursorY = 72;

    // Group rows by client, and within a client by currency.
    const byClient = new Map<string, ExportRow[]>();
    for (const r of rows) {
      if (!byClient.has(r.client)) byClient.set(r.client, []);
      byClient.get(r.client)!.push(r);
    }

    for (const [client, clientRows] of byClient) {
      // Group by currency to sum earnings correctly.
      const totalsByCurrency = new Map<
        string,
        { hours: number; cost: number }
      >();
      for (const r of clientRows) {
        const key = r.currency;
        if (!totalsByCurrency.has(key)) {
          totalsByCurrency.set(key, { hours: 0, cost: 0 });
        }
        const bucket = totalsByCurrency.get(key)!;
        bucket.hours += r.durationMs / 3_600_000;
        bucket.cost += r.cost;
      }

      if (cursorY > 720) {
        doc.addPage();
        cursorY = 44;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(client, 40, cursorY);
      cursorY += 6;

      const totalParts: string[] = [];
      for (const [currency, v] of totalsByCurrency) {
        totalParts.push(
          `${v.hours.toFixed(2)}h · ${formatCost(v.cost, currency)}`
        );
      }
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(110);
      doc.text(totalParts.join("   "), 40, cursorY + 10);
      doc.setTextColor(0);
      cursorY += 22;

      autoTable(doc, {
        startY: cursorY,
        head: [["Date", "Project", "Start", "End", "Duration", "Rate", "Cost", "Note"]],
        body: clientRows.map((r) => [
          r.date,
          r.project,
          r.start,
          r.end,
          r.durationLabel,
          r.rate > 0 ? `${r.rate} ${r.currency}/h` : "—",
          r.cost > 0 ? formatCost(r.cost, r.currency) : "—",
          r.note,
        ]),
        styles: { fontSize: 8, cellPadding: 5 },
        headStyles: { fillColor: [16, 185, 129], textColor: 255 },
        alternateRowStyles: { fillColor: [248, 250, 249] },
        margin: { left: 40, right: 40 },
        columnStyles: {
          5: { halign: "right" },
          6: { halign: "right" },
        },
      });

      // autoTable stores its last Y in the doc under this key.
      const finalY = (doc as unknown as { lastAutoTable?: { finalY: number } })
        .lastAutoTable?.finalY;
      cursorY = (finalY ?? cursorY) + 24;
    }

    downloadBlob(doc.output("blob"), `workeera-${dateStamp()}.pdf`);
  });
}

function dateStamp(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}