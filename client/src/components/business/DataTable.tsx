import React, { useState, useMemo } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../ui/table";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Search, Download, ChevronLeft, ChevronRight, SlidersHorizontal, LayoutGrid, TableProperties } from "lucide-react";
import { EmptyState } from "../feedback/EmptyState";
import { TableSkeleton } from "../feedback/LoadingSkeleton";

export interface Column<T> {
  header: string;
  accessorKey?: keyof T | string;
  cell?: (item: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

interface FilterTab {
  label: string;
  value: string;
  filterFn: (item: any) => boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  searchKey?: keyof T | string;
  searchPlaceholder?: string;
  filterTabs?: FilterTab[];
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
  pageSize?: number;
  exportFilename?: string;
  actionButton?: React.ReactNode;
  onRowClick?: (item: T) => void;
  mobileCardRender?: (item: T) => React.ReactNode;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  searchKey,
  searchPlaceholder = "Search records...",
  filterTabs,
  isLoading = false,
  emptyTitle = "No records found",
  emptyDescription = "There are no entries to display at the moment.",
  emptyActionLabel,
  onEmptyAction,
  pageSize = 10,
  exportFilename = "export.csv",
  actionButton,
  onRowClick,
  mobileCardRender,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState(filterTabs ? filterTabs[0].value : "");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [mobileViewMode, setMobileViewMode] = useState<"cards" | "table">("cards");

  // Filter and search
  const filteredData = useMemo(() => {
    let result = [...data];

    // Filter tab
    if (filterTabs && activeTab) {
      const selectedFilter = filterTabs.find((tab) => tab.value === activeTab);
      if (selectedFilter) {
        result = result.filter(selectedFilter.filterFn);
      }
    }

    // Search
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter((item) => {
        if (searchKey) {
          const val = item[searchKey as string];
          return String(val ?? "").toLowerCase().includes(term);
        }
        // Search across all text fields
        return Object.values(item).some((val) =>
          String(val ?? "").toLowerCase().includes(term)
        );
      });
    }

    // Sort
    if (sortKey) {
      result.sort((a, b) => {
        const valA = a[sortKey];
        const valB = b[sortKey];
        if (valA < valB) return sortOrder === "asc" ? -1 : 1;
        if (valA > valB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, searchTerm, searchKey, filterTabs, activeTab, sortKey, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const handleExportCSV = () => {
    if (!filteredData.length) return;
    const headers = columns.map((c) => c.header).join(",");
    const rows = filteredData.map((item) =>
      columns
        .map((c) => {
          const val = c.accessorKey ? item[c.accessorKey as string] : "";
          return `"${String(val ?? "").replace(/"/g, '""')}"`;
        })
        .join(",")
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", exportFilename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSort = (key?: string) => {
    if (!key) return;
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  if (isLoading) {
    return <TableSkeleton rows={pageSize} columns={columns.length} />;
  }

  return (
    <div className="space-y-4">
      {/* Header controls: Tabs, Search and Action Button */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {filterTabs && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {filterTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => {
                  setActiveTab(tab.value);
                  setCurrentPage(1);
                }}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                  activeTab === tab.value
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        <div className="flex flex-1 items-center justify-end gap-2">
          {/* Mobile View Toggle: Cards vs Table */}
          <div className="flex sm:hidden items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 shrink-0">
            <button
              type="button"
              onClick={() => setMobileViewMode("cards")}
              className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-all ${
                mobileViewMode === "cards"
                  ? "bg-white text-blue-700 shadow-2xs font-bold"
                  : "text-slate-500 hover:text-slate-900"
              }`}
              title="Card View"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span className="text-[11px]">Cards</span>
            </button>
            <button
              type="button"
              onClick={() => setMobileViewMode("table")}
              className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-all ${
                mobileViewMode === "table"
                  ? "bg-white text-blue-700 shadow-2xs font-bold"
                  : "text-slate-500 hover:text-slate-900"
              }`}
              title="Table View"
            >
              <TableProperties className="h-3.5 w-3.5" />
              <span className="text-[11px]">Table</span>
            </button>
          </div>

          <div className="w-full sm:max-w-xs">
            <Input
              icon={<Search className="h-4 w-4" />}
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="h-9 text-xs"
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="h-9 gap-1.5 text-xs font-medium text-slate-700 hidden sm:inline-flex"
            title="Export CSV"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export</span>
          </Button>

          {actionButton}
        </div>
      </div>

      {/* Main Table Container */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        {paginatedData.length === 0 ? (
          <EmptyState
            title={emptyTitle}
            description={emptyDescription}
            actionLabel={emptyActionLabel}
            onAction={onEmptyAction}
          />
        ) : (
          <>
            {/* Mobile Card View (shown when mobileViewMode === 'cards' on screens < md) */}
            <div className={`${mobileViewMode === "cards" ? "block md:hidden" : "hidden"} divide-y divide-slate-100`}>
              {paginatedData.map((item, rowIdx) => {
                if (mobileCardRender) {
                  return (
                    <div
                      key={item.id || rowIdx}
                      onClick={() => onRowClick && onRowClick(item)}
                      className={`p-3.5 transition-colors bg-white ${
                        onRowClick ? "cursor-pointer hover:bg-slate-50/80 active:bg-slate-100" : ""
                      }`}
                    >
                      {mobileCardRender(item)}
                    </div>
                  );
                }

                const primaryCol = columns[0];
                const statusCol = columns.find(
                  (c) =>
                    c.header.toLowerCase() === "status" ||
                    c.accessorKey === "status" ||
                    c.accessorKey === "planStatus"
                );
                const actionsCol = columns.find(
                  (c) => c.header.toLowerCase() === "actions" || c.header.toLowerCase() === "action"
                );
                const detailCols = columns.filter(
                  (c) => c !== primaryCol && c !== statusCol && c !== actionsCol
                );

                return (
                  <div
                    key={item.id || rowIdx}
                    onClick={() => onRowClick && onRowClick(item)}
                    className={`p-3.5 transition-colors bg-white space-y-2.5 ${
                      onRowClick ? "cursor-pointer hover:bg-slate-50/80 active:bg-slate-100" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                      <div className="font-bold text-sm text-slate-900">
                        {primaryCol.cell
                          ? primaryCol.cell(item)
                          : primaryCol.accessorKey
                          ? String(item[primaryCol.accessorKey as string] ?? "—")
                          : "—"}
                      </div>
                      {statusCol && (
                        <div>
                          {statusCol.cell
                            ? statusCol.cell(item)
                            : statusCol.accessorKey
                            ? String(item[statusCol.accessorKey as string] ?? "—")
                            : null}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {detailCols.map((col, idx) => (
                        <div key={idx} className="space-y-0.5">
                          <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider block">
                            {col.header}
                          </span>
                          <div className="text-slate-800 text-xs font-medium truncate">
                            {col.cell
                              ? col.cell(item)
                              : col.accessorKey
                              ? String(item[col.accessorKey as string] ?? "—")
                              : "—"}
                          </div>
                        </div>
                      ))}
                    </div>

                    {actionsCol && (
                      <div
                        className="pt-2 border-t border-slate-100 flex items-center justify-end"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {actionsCol.cell ? actionsCol.cell(item) : null}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Table View (always shown on md+, and on mobile when mobileViewMode === 'table') */}
            <div className={mobileViewMode === "cards" ? "hidden md:block" : "block"}>
              {/* Swipe hint on mobile when table mode is active */}
              <div className="md:hidden px-3.5 py-1.5 bg-blue-50/60 border-b border-blue-100 text-[11px] text-blue-700 flex items-center justify-between font-medium">
                <span>Swipe horizontally to view all columns</span>
                <span className="font-mono text-blue-500">↔</span>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    {columns.map((col, idx) => (
                      <TableHead
                        key={idx}
                        className={`whitespace-nowrap ${col.className || ""} ${
                          col.sortable ? "cursor-pointer select-none hover:text-slate-900" : ""
                        }`}
                        onClick={() => col.sortable && handleSort(col.accessorKey as string)}
                      >
                        <div className="flex items-center gap-1.5">
                          {col.header}
                          {col.sortable && sortKey === col.accessorKey && (
                            <span>{sortOrder === "asc" ? "↑" : "↓"}</span>
                          )}
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.map((item, rowIdx) => (
                    <TableRow
                      key={item.id || rowIdx}
                      onClick={() => onRowClick && onRowClick(item)}
                      className={onRowClick ? "cursor-pointer hover:bg-slate-50/90" : ""}
                    >
                      {columns.map((col, colIdx) => (
                        <TableCell key={colIdx} className={`whitespace-nowrap ${col.className || ""}`}>
                          {col.cell
                            ? col.cell(item)
                            : col.accessorKey
                            ? String(item[col.accessorKey as string] ?? "—")
                            : "—"}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}

        {/* Footer and Pagination */}
        {filteredData.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 text-xs text-slate-500 bg-slate-50/50">
            <div>
              Showing <span className="font-medium text-slate-900">{(currentPage - 1) * pageSize + 1}</span> to{" "}
              <span className="font-medium text-slate-900">
                {Math.min(currentPage * pageSize, filteredData.length)}
              </span>{" "}
              of <span className="font-medium text-slate-900">{filteredData.length}</span> results
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <span className="px-2 font-medium text-slate-700">
                Page {currentPage} of {totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
