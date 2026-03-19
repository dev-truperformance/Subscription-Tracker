"use client"

import { useState } from "react"
import { Search, Upload, ArrowUpDown, FileText, FileSpreadsheet, File } from "lucide-react"
import { useSubscriptions, Subscription as SubscriptionType } from "@/hooks/use-subscriptions"
import * as XLSX from "xlsx"
import { saveAs } from "file-saver"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { Document, Packer, Paragraph } from "docx"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Frequency = "Monthly" | "Yearly" | "Weekly";

interface Subscription {
  id: number;
  name: string;
  email: string;
  functions: string;
  payment: number;
  dueDate: string;
  frequency: Frequency;
}

const PERIOD_OPTIONS = ["12 months", "30 days", "7 days", "24 hours"];

interface SubscriptionTrackerProps {
  period: string;
  onPeriodChange: (period: string) => void;
}

export function SubscriptionTracker({ period, onPeriodChange }: SubscriptionTrackerProps) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<keyof SubscriptionType | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: subscriptions = [], isLoading, error } = useSubscriptions();

  // Filter subscriptions based on selected period
  const getFilteredSubscriptions = () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Set to start of day to include today
    let cutoffDate = new Date();

    switch (period) {
      case "30 days":
        cutoffDate.setDate(now.getDate() + 30);
        break;
      case "7 days":
        cutoffDate.setDate(now.getDate() + 7);
        break;
      case "24 hours":
        cutoffDate.setHours(now.getHours() + 24);
        break;
      case "12 months":
      default:
        cutoffDate.setFullYear(now.getFullYear() + 1);
        break;
    }

    return subscriptions.filter(sub => {
      const subDate = new Date(sub.dueDate);
      subDate.setHours(0, 0, 0, 0);
      return subDate <= cutoffDate && subDate >= now;
    });
  };

  const filteredSubscriptions = getFilteredSubscriptions();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground font-['DM_Sans',sans-serif] p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading subscriptions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground font-['DM_Sans',sans-serif] p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Failed to load subscriptions</p>
          <p className="text-muted-foreground">{error.message}</p>
        </div>
      </div>
    );
  }

  const totalExpenses = filteredSubscriptions.reduce((acc, s) => {
    const numberMatch = s.payment.match(/[\d.,]+/);
    if (numberMatch) {
      const num = parseFloat(numberMatch[0].replace(',', ''));
      return acc + (isNaN(num) ? 0 : num);
    }
    return acc;
  }, 0);

  const filtered = filteredSubscriptions
    .filter((s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.functions.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (!sortKey) return 0;
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
      }
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDirection === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return 0;
    });

  const handleSort = (key: keyof SubscriptionType) => {
    if (sortKey === key) setSortDirection((p) => p === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDirection("asc"); }
  };

  const SortButton = ({ label, field }: { label: string; field: keyof SubscriptionType }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 text-neutral-400 hover:text-white transition-colors"
    >
      {label}
      <ArrowUpDown size={13} className={sortKey === field ? "text-orange-400" : "text-neutral-600"} />
    </button>
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filtered.slice(startIndex, startIndex + itemsPerPage);

  const getExportData = () => {
    return paginatedData.map(sub => {
      const paymentValue = sub.payment;
      return {
        Name: sub.name,
        Email: sub.email,
        Functions: sub.functions,
        Payment: paymentValue,
        DueDate: sub.dueDate,
        Frequency: sub.frequency
      };
    });
  };

  const downloadExcel = () => {
    const data = getExportData();
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Subscriptions");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    saveAs(blob, "subscriptions.xlsx");
  };

  const downloadPDF = () => {
    const data = getExportData();
    const doc = new jsPDF();
    autoTable(doc, {
      head: [["Name", "Email", "Functions", "Payment", "Due Date", "Frequency"]],
      body: data.map(sub => [sub.Name, sub.Email, sub.Functions, sub.Payment, sub.DueDate, sub.Frequency])
    });
    doc.save("subscriptions.pdf");
  };

  const downloadDoc = async () => {
    const data = getExportData();
    const doc = new Document({
      sections: [{
        children: [
          new Paragraph("Subscription Report"),
          ...data.map(sub => new Paragraph(`${sub.Name} - ${sub.Functions} - ${sub.Payment} - ${sub.Frequency}`))
        ]
      }]
    });
    const blob = await Packer.toBlob(doc);
    saveAs(blob, "subscriptions.docx");
  };

  const downloadText = () => {
    const data = getExportData();
    const content = data.map(sub => `${sub.Name} - ${sub.Functions} - ${sub.Payment} - ${sub.Frequency}`).join('\n');
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "subscriptions.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-['DM_Sans',sans-serif] p-6">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');`}</style>

      <div className="flex flex-wrap items-center gap-3 mb-6">

        <div className="flex h-9 rounded-lg border bg-background overflow-hidden">
          <span className="flex items-center px-3 text-sm text-muted-foreground whitespace-nowrap leading-none">
            Upcoming Due Dates:
          </span>
          <div className="w-px self-stretch bg-border" />
          <Select value={period} onValueChange={(v) => v && onPeriodChange(v)}>
            <SelectTrigger
              style={{
                height: "100%",
                minHeight: "unset",
                border: "none",
                outline: "none",
                boxShadow: "none",
                background: "transparent",
                borderRadius: 0,
              }}
              className="text-primary font-medium px-3 text-sm focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 [&>svg]:text-primary"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border-popover text-popover-foreground">
              {PERIOD_OPTIONS.map((opt) => (
                <SelectItem key={opt} value={opt} className="focus:bg-accent focus:text-accent-foreground">
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex h-9 rounded-lg border bg-background overflow-hidden">
          <span className="flex items-center px-3 bg-background text-sm text-muted-foreground whitespace-nowrap leading-none">
            Total Expenses
          </span>
          <span className="flex items-center px-4 bg-primary text-primary-foreground font-semibold text-sm whitespace-nowrap leading-none">
            ${Math.round(totalExpenses)}
          </span>
        </div>

        <div className="relative flex-1 min-w-[220px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            placeholder="Search Your Subscription"
            className="pl-9 bg-background border text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary rounded-lg h-9"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg h-9 w-9 shrink-0 inline-flex items-center justify-center border border-transparent">
            <Upload size={16} />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-popover border-popover text-popover-foreground">
            <DropdownMenuItem className="hover:bg-accent focus:bg-accent cursor-pointer" onClick={downloadPDF}>
              <FileText className="mr-2 h-4 w-4" />
              <span>PDF</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="hover:bg-accent focus:bg-accent cursor-pointer" onClick={downloadExcel}>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              <span>Excel</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="hover:bg-accent focus:bg-accent cursor-pointer" onClick={downloadDoc}>
              <File className="mr-2 h-4 w-4" />
              <span>Google Sheet</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="hover:bg-accent focus:bg-accent cursor-pointer" onClick={downloadText}>
              <File className="mr-2 h-4 w-4" />
              <span>Text File</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="rounded-xl border overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground font-medium py-3 pl-4 w-[280px]">
                <SortButton label="Subscription Name" field="name" />
              </TableHead>
              <TableHead className="text-muted-foreground font-medium py-3">Functions</TableHead>
              <TableHead className="text-muted-foreground font-medium py-3">
                <SortButton label="Payment" field="payment" />
              </TableHead>
              <TableHead className="text-muted-foreground font-medium py-3">
                <SortButton label="Due Date" field="dueDate" />
              </TableHead>
              <TableHead className="text-muted-foreground font-medium py-3">
                <SortButton label="Frequency" field="frequency" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((sub) => (
              <TableRow
                key={sub.id}
                className="border-border hover:bg-accent/40 transition-colors"
              >
                <TableCell className="py-4 pl-4">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-foreground font-medium text-sm leading-tight">{sub.name}</p>
                      <p className="text-muted-foreground text-xs">{sub.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <span className="text-foreground text-sm">{sub.functions}</span>
                </TableCell>
                <TableCell className="py-4">
                  <span className="text-foreground text-sm font-medium">{sub.payment}</span>
                </TableCell>
                <TableCell className="py-4">
                  <span className="text-foreground text-sm">{sub.dueDate}</span>
                </TableCell>
                <TableCell className="py-4">
                  <Badge
                    variant="outline"
                    className="border-muted text-muted-foreground text-xs font-normal bg-muted/50"
                  >
                    {sub.frequency}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}

            {paginatedData.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-12">
                  No subscriptions match your search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className={currentPage === 1 ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    onClick={() => setCurrentPage(page)}
                    isActive={currentPage === page}
                    className="cursor-pointer"
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className={currentPage === totalPages ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      <p className="text-muted-foreground text-xs mt-3 text-right">
        {paginatedData.length} of {filtered.length} subscriptions
      </p>
    </div>
  );
}
