'use client';

import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useIsAdmin } from '@/hooks/use-is-admin';
import {
  Subscription as SubscriptionType,
  useDeleteSubscription,
  useSubscriptions,
  useUpdateSubscription,
} from '@/hooks/use-subscriptions';
import { getRLSErrorMessage } from '@/lib/rls-utils';
import { Document, Packer, Paragraph } from 'docx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  ArrowUpDown,
  File,
  FileSpreadsheet,
  FileText,
  MoreHorizontal,
  Search,
  Upload,
} from 'lucide-react';
import { useEffect } from 'react';
import { useState } from 'react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { DeleteSubscriptionModal } from './delete-subscription-modal';
import { UpdateSubscriptionModal } from './update-subscription-modal';

// Date formatting function
const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (error) {
    return dateString;
  }
};

type Frequency = 'Monthly' | 'Yearly' | 'Weekly';

interface Subscription {
  id: number;
  name: string;
  email: string;
  functions: string;
  payment: number;
  dueDate: string;
  frequency: Frequency;
}

const PERIOD_OPTIONS = ['12 months', '30 days', '7 days', '24 hours'];

interface SubscriptionTrackerProps {
  period: string;
  onPeriodChange: (period: string) => void;
}

export function SubscriptionTracker({
  period,
  onPeriodChange,
}: SubscriptionTrackerProps) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<keyof SubscriptionType | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: subscriptions = [], isLoading, error } = useSubscriptions();
  const updateSubscription = useUpdateSubscription();
  const deleteSubscription = useDeleteSubscription();
  const { data: adminStatus } = useIsAdmin();
  const isAdmin = adminStatus?.isAdmin || false;

  // Handle RLS errors with user-friendly messages
  useEffect(() => {
    if (error) {
      const userMessage = getRLSErrorMessage(error);
      toast.error(userMessage);
    }
  }, [error]);

  // Modal states
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] =
    useState<SubscriptionType | null>(null);

  // Filter subscriptions based on selected period
  const getFilteredSubscriptions = () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Set to start of day to include today
    const cutoffDate = new Date();

    switch (period) {
      case '30 days':
        cutoffDate.setDate(now.getDate() + 30);
        break;
      case '7 days':
        cutoffDate.setDate(now.getDate() + 7);
        break;
      case '24 hours':
        cutoffDate.setHours(now.getHours() + 24);
        break;
      case '12 months':
      default:
        cutoffDate.setFullYear(now.getFullYear() + 1);
        break;
    }

    return subscriptions.filter((sub) => {
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
    .filter(
      (s) =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.functions.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (!sortKey) return 0;
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      return 0;
    });

  const handleSort = (key: keyof SubscriptionType) => {
    if (sortKey === key)
      setSortDirection((p) => (p === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const SortButton = ({
    label,
    field,
  }: {
    label: string;
    field: keyof SubscriptionType;
  }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 text-neutral-400 hover:text-white transition-colors"
    >
      {label}
      <ArrowUpDown
        size={13}
        className={sortKey === field ? 'text-orange-400' : 'text-neutral-600'}
      />
    </button>
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filtered.slice(startIndex, startIndex + itemsPerPage);

  const getExportData = () => {
    return paginatedData.map((sub) => {
      const paymentValue = sub.payment;
      return {
        Name: sub.name,
        Email: sub.email,
        Functions: sub.functions,
        Payment: paymentValue,
        DueDate: sub.dueDate,
        Frequency: sub.frequency,
      };
    });
  };

  const downloadExcel = () => {
    const data = getExportData();
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Subscriptions');
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    saveAs(blob, 'subscriptions.xlsx');
  };

  const downloadPDF = () => {
    const data = getExportData();
    const doc = new jsPDF();
    autoTable(doc, {
      head: [
        ['Name', 'Email', 'Functions', 'Payment', 'Due Date', 'Frequency'],
      ],
      body: data.map((sub) => [
        sub.Name,
        sub.Email,
        sub.Functions,
        sub.Payment,
        sub.DueDate,
        sub.Frequency,
      ]),
    });
    doc.save('subscriptions.pdf');
  };

  const downloadDoc = async () => {
    const data = getExportData();
    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph('Subscription Report'),
            ...data.map(
              (sub) =>
                new Paragraph(
                  `${sub.Name} - ${sub.Functions} - ${sub.Payment} - ${sub.Frequency}`
                )
            ),
          ],
        },
      ],
    });
    const blob = await Packer.toBlob(doc);
    saveAs(blob, 'subscriptions.docx');
  };

  const downloadText = () => {
    const data = getExportData();
    const content = data
      .map(
        (sub) =>
          `${sub.Name} - ${sub.Functions} - ${sub.Payment} - ${sub.Frequency}`
      )
      .join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'subscriptions.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Handlers for update and delete
  const handleUpdateClick = (subscription: SubscriptionType) => {
    setSelectedSubscription(subscription);
    setUpdateModalOpen(true);
  };

  const handleDeleteClick = (subscription: SubscriptionType) => {
    setSelectedSubscription(subscription);
    setDeleteModalOpen(true);
  };

  const handleUpdateSubscription = (data: any) => {
    if (selectedSubscription) {
      updateSubscription.mutate(
        { id: selectedSubscription.id, data },
        {
          onSuccess: () => {
            toast.success('Subscription updated successfully!');
            setUpdateModalOpen(false);
            setSelectedSubscription(null);
          },
          onError: (error: any) => {
            const userMessage = getRLSErrorMessage(error);
            toast.error(userMessage);
          },
        }
      );
    }
  };

  const handleDeleteSubscription = () => {
    if (selectedSubscription) {
      deleteSubscription.mutate(selectedSubscription.id, {
        onSuccess: () => {
          toast.success('Subscription deleted successfully!');
          setDeleteModalOpen(false);
          setSelectedSubscription(null);
        },
        onError: (error: any) => {
          const userMessage = getRLSErrorMessage(error);
          toast.error(userMessage);
        },
      });
    }
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
                height: '100%',
                minHeight: 'unset',
                border: 'none',
                outline: 'none',
                boxShadow: 'none',
                background: 'transparent',
                borderRadius: 0,
              }}
              className="text-primary font-medium px-3 text-sm focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 [&>svg]:text-primary"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border-popover text-popover-foreground">
              {PERIOD_OPTIONS.map((opt) => (
                <SelectItem
                  key={opt}
                  value={opt}
                  className="focus:bg-accent focus:text-accent-foreground"
                >
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
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search Your Subscription"
            className="pl-9 bg-background border text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary rounded-lg h-9"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg h-9 w-9 shrink-0 inline-flex items-center justify-center border border-transparent">
            <Upload size={16} />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-popover border-popover text-popover-foreground">
            <DropdownMenuItem
              className="hover:bg-accent focus:bg-accent cursor-pointer"
              onClick={downloadPDF}
            >
              <FileText className="mr-2 h-4 w-4" />
              <span>PDF</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="hover:bg-accent focus:bg-accent cursor-pointer"
              onClick={downloadExcel}
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              <span>Excel</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="hover:bg-accent focus:bg-accent cursor-pointer"
              onClick={downloadDoc}
            >
              <File className="mr-2 h-4 w-4" />
              <span>Google Sheet</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="hover:bg-accent focus:bg-accent cursor-pointer"
              onClick={downloadText}
            >
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
              <TableHead className="text-muted-foreground font-medium py-3 w-[150px]">
                Owner
              </TableHead>
              <TableHead className="text-muted-foreground font-medium py-3 w-[120px]">
                <SortButton label="Functions" field="functions" />
              </TableHead>
              <TableHead className="text-muted-foreground font-medium py-3 w-[100px]">
                <SortButton label="Payment" field="payment" />
              </TableHead>
              <TableHead className="text-muted-foreground font-medium py-3 w-[100px]">
                <SortButton label="Due Date" field="dueDate" />
              </TableHead>
              <TableHead className="text-muted-foreground font-medium py-3 w-[100px]">
                <SortButton label="Frequency" field="frequency" />
              </TableHead>
              {isAdmin && (
                <TableHead className="text-muted-foreground font-medium py-3 w-[80px]">
                  Actions
                </TableHead>
              )}
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
                      <p className="text-foreground font-medium text-sm leading-tight">
                        {sub.name}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {sub.email}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  {sub.user ? (
                    <div>
                      <p className="text-foreground text-sm">
                        {sub.user.firstName && sub.user.lastName
                          ? `${sub.user.firstName} ${sub.user.lastName}`
                          : sub.user.email.split('@')[0]}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {sub.user.email}
                      </p>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">You</span>
                  )}
                </TableCell>
                <TableCell className="py-4">
                  <span className="text-foreground text-sm">
                    {sub.functions}
                  </span>
                </TableCell>
                <TableCell className="py-4">
                  <span className="text-foreground text-sm font-medium">
                    {sub.payment}
                  </span>
                </TableCell>
                <TableCell className="py-4">
                  <span className="text-foreground text-sm">
                    {formatDate(sub.dueDate)}
                  </span>
                </TableCell>
                <TableCell className="py-4">
                  <Badge
                    variant="outline"
                    className="border-muted text-muted-foreground text-xs font-normal bg-muted/50"
                  >
                    {sub.frequency}
                  </Badge>
                </TableCell>
                {isAdmin && (
                  <TableCell className="py-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground">
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleUpdateClick(sub)}
                        >
                          Update
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(sub)}
                          className="text-destructive"
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                )}
              </TableRow>
            ))}

            {paginatedData.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={isAdmin ? 7 : 6}
                  className="text-center text-muted-foreground py-12"
                >
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
                  className={
                    currentPage === 1
                      ? 'opacity-50 cursor-not-allowed'
                      : 'cursor-pointer'
                  }
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => setCurrentPage(page)}
                      isActive={currentPage === page}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                )
              )}
              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  className={
                    currentPage === totalPages
                      ? 'opacity-50 cursor-not-allowed'
                      : 'cursor-pointer'
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      <p className="text-muted-foreground text-xs mt-3 text-right">
        {paginatedData.length} of {filtered.length} subscriptions
      </p>

      {/* Update Subscription Modal */}
      <UpdateSubscriptionModal
        subscription={selectedSubscription}
        isOpen={updateModalOpen}
        onClose={() => {
          setUpdateModalOpen(false);
          setSelectedSubscription(null);
        }}
        onUpdate={handleUpdateSubscription}
        isLoading={updateSubscription.isPending}
      />

      {/* Delete Subscription Modal */}
      <DeleteSubscriptionModal
        subscription={selectedSubscription}
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedSubscription(null);
        }}
        onDelete={handleDeleteSubscription}
        isLoading={deleteSubscription.isPending}
      />
    </div>
  );
}
