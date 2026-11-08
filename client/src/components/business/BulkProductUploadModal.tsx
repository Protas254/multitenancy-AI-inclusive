import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { productsApi, BulkUploadResult } from "@/lib/api/products";
import {
  Upload,
  FileSpreadsheet,
  Download,
  AlertCircle,
  CheckCircle2,
  X,
  FileText,
  Loader2,
  HelpCircle,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

interface BulkProductUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenantId: string;
  onSuccess: () => void;
}

export const BulkProductUploadModal: React.FC<BulkProductUploadModalProps> = ({
  isOpen,
  onClose,
  tenantId,
  onSuccess,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);
  const [previewRows, setPreviewRows] = useState<Array<Record<string, string>>>([]);
  const [totalParsedRows, setTotalParsedRows] = useState<number>(0);
  const [result, setResult] = useState<BulkUploadResult | null>(null);

  // Settings
  const [updateExisting, setUpdateExisting] = useState(true);
  const [createCategories, setCreateCategories] = useState(true);
  const [createSuppliers, setCreateSuppliers] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setSelectedFile(null);
    setPreviewRows([]);
    setTotalParsedRows(0);
    setResult(null);
    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleModalClose = () => {
    if (!isUploading) {
      resetState();
      onClose();
    }
  };

  // Parse CSV text into preview rows
  const parseCSVPreview = (text: string) => {
    const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
    if (lines.length <= 1) {
      setPreviewRows([]);
      setTotalParsedRows(0);
      return;
    }

    const headers = parseCSVLine(lines[0]);
    const dataRows = lines.slice(1);
    setTotalParsedRows(dataRows.length);

    const preview = dataRows.slice(0, 5).map((line) => {
      const values = parseCSVLine(line);
      const row: Record<string, string> = {};
      headers.forEach((h, idx) => {
        row[h.trim()] = (values[idx] || "").trim();
      });
      return row;
    });

    setPreviewRows(preview);
  };

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let cur = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"' || char === "'") {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        result.push(cur);
        cur = "";
      } else {
        cur += char;
      }
    }
    result.push(cur);
    return result.map((item) => item.replace(/^["']|["']$/g, "").trim());
  };

  const handleFileSelect = (file: File) => {
    if (!file.name.toLowerCase().endsWith(".csv") && file.type !== "text/csv") {
      toast.error("Please select a valid CSV (.csv) spreadsheet file.");
      return;
    }

    setSelectedFile(file);
    setResult(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        parseCSVPreview(content);
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDownloadTemplate = async () => {
    setIsDownloadingTemplate(true);
    try {
      const blob = await productsApi.downloadTemplate(tenantId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "storegrid_products_template.csv";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("CSV template downloaded!");
    } catch {
      // Fallback CSV download directly from browser
      const sampleCSV =
        "Name,Category,SKU,Barcode,Buying Price,Selling Price,Current Stock,Min Stock Level,Supplier,Description\n" +
        "Premium Basmati Rice 5kg,Grains & Cereals,SKU-RICE-01,616110123456,1200,1450,50,10,National Cereals Board,Grade 1 aromatic long grain basmati rice\n" +
        "Pure Vegetable Cooking Oil 2L,Oils & Fats,SKU-OIL-02,616110987654,620,750,30,5,Bidco Africa,Fortified with Vitamin A and D\n" +
        "Fresh Milk 500ml,Dairy & Eggs,SKU-MILK-03,616110112233,55,70,100,20,Brookside Dairy,Pasteurized whole fresh cow milk\n";
      const blob = new Blob([sampleCSV], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "storegrid_products_template.csv";
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("CSV template downloaded!");
    } finally {
      setIsDownloadingTemplate(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setResult(null);

    try {
      const res = await productsApi.bulkUpload(selectedFile, {
        updateExisting,
        createCategories,
        createSuppliers,
        tenantId,
      });

      setResult(res);

      if (res.created > 0 || res.updated > 0) {
        toast.success(
          `Import complete: ${res.created} created, ${res.updated} updated.`
        );
        onSuccess();
      } else if (res.failed > 0) {
        toast.error(`Import completed with ${res.failed} errors.`);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to process bulk upload.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleModalClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-700 rounded-xl">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-slate-900">
                Bulk Upload Products
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 mt-0.5">
                Import or update catalog items in bulk using a CSV spreadsheet file.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Download Template Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex items-start gap-2.5">
              <HelpCircle className="h-4 w-4 text-slate-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-slate-800">Need a formatted CSV template?</p>
                <p className="text-[11px] text-slate-500">
                  Download our sample template with recommended columns and sample products.
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isDownloadingTemplate}
              onClick={handleDownloadTemplate}
              className="gap-1.5 text-xs font-semibold bg-white flex-shrink-0"
            >
              {isDownloadingTemplate ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Download className="h-3.5 w-3.5 text-blue-600" />
              )}
              <span>Download CSV Template</span>
            </Button>
          </div>

          {/* Results Summary if already uploaded */}
          {result && (
            <div
              className={`p-4 rounded-xl border ${
                result.failed === 0
                  ? "bg-emerald-50/70 border-emerald-200 text-emerald-900"
                  : result.created + result.updated > 0
                  ? "bg-amber-50/70 border-amber-200 text-amber-900"
                  : "bg-red-50/70 border-red-200 text-red-900"
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-sm">
                {result.failed === 0 ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                )}
                <span>Import Summary</span>
              </div>
              <div className="grid grid-cols-4 gap-2 mt-3 text-center">
                <div className="p-2 bg-white/70 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Total Rows</span>
                  <p className="text-base font-black text-slate-800">{result.total}</p>
                </div>
                <div className="p-2 bg-white/70 rounded-lg border border-emerald-200">
                  <span className="text-[10px] text-emerald-700 uppercase font-semibold">Created</span>
                  <p className="text-base font-black text-emerald-700">{result.created}</p>
                </div>
                <div className="p-2 bg-white/70 rounded-lg border border-blue-200">
                  <span className="text-[10px] text-blue-700 uppercase font-semibold">Updated</span>
                  <p className="text-base font-black text-blue-700">{result.updated}</p>
                </div>
                <div className="p-2 bg-white/70 rounded-lg border border-red-200">
                  <span className="text-[10px] text-red-600 uppercase font-semibold">Failed</span>
                  <p className="text-base font-black text-red-600">{result.failed}</p>
                </div>
              </div>

              {/* Error Details */}
              {result.errors && result.errors.length > 0 && (
                <div className="mt-3.5 space-y-2">
                  <p className="text-xs font-bold text-red-800">
                    Failed Rows ({result.errors.length}):
                  </p>
                  <div className="max-h-36 overflow-y-auto bg-white/90 rounded-lg border border-red-200 divide-y divide-red-100 text-xs">
                    {result.errors.map((err, idx) => (
                      <div key={idx} className="p-2 flex items-start gap-2">
                        <span className="font-mono font-bold text-red-700 bg-red-100 px-1.5 py-0.5 rounded text-[10px]">
                          Row {err.row}
                        </span>
                        <div className="flex-1">
                          {err.name && <span className="font-semibold text-slate-700">{err.name}: </span>}
                          <span className="text-red-600">{err.error}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* File Dropzone Area */}
          {!result && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv, text/csv"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleFileSelect(e.target.files[0]);
                  }
                }}
              />

              {!selectedFile ? (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                    isDragging
                      ? "border-blue-500 bg-blue-50/50"
                      : "border-slate-300 hover:border-blue-400 hover:bg-slate-50/50"
                  }`}
                >
                  <div className="mx-auto w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-3">
                    <Upload className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-semibold text-slate-800">
                    Click to select or drag and drop a CSV file
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Standard comma-separated format (.csv) supported
                  </p>
                </div>
              ) : (
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{selectedFile.name}</p>
                      <p className="text-xs text-slate-500">
                        {(selectedFile.size / 1024).toFixed(1)} KB • {totalParsedRows} products detected
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={resetState}
                    className="h-8 w-8 p-0 text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Preview Table of First Few Rows */}
          {previewRows.length > 0 && !result && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">
                  Data Preview (First {previewRows.length} of {totalParsedRows} rows)
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  All {totalParsedRows} rows will be processed
                </span>
              </div>
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      {Object.keys(previewRows[0] || {}).map((header, i) => (
                        <th key={i} className="px-3 py-2 whitespace-nowrap">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {previewRows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        {Object.values(row).map((val, cellIdx) => (
                          <td key={cellIdx} className="px-3 py-1.5 whitespace-nowrap text-slate-700 font-mono text-[11px]">
                            {val || "—"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Import Settings Checkboxes */}
          {!result && (
            <div className="space-y-2.5 pt-1">
              <span className="text-xs font-bold text-slate-700 block">Import Options</span>
              <div className="space-y-2 text-xs text-slate-600 bg-slate-50/70 p-3 rounded-xl border border-slate-200">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={updateExisting}
                    onChange={(e) => setUpdateExisting(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                  />
                  <span>
                    <strong>Update existing products</strong> if SKU or barcode matches (replaces price, stock, details)
                  </span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={createCategories}
                    onChange={(e) => setCreateCategories(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                  />
                  <span>
                    <strong>Auto-create categories</strong> if specified category does not already exist
                  </span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={createSuppliers}
                    onChange={(e) => setCreateSuppliers(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                  />
                  <span>
                    <strong>Auto-create suppliers</strong> if specified supplier does not already exist
                  </span>
                </label>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex sm:justify-between items-center gap-2 pt-2 border-t border-slate-100">
          {result ? (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={resetState}
                className="gap-1.5 text-xs font-semibold"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Upload Another File</span>
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleModalClose}
                className="text-xs font-semibold bg-blue-600 hover:bg-blue-700"
              >
                Done
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleModalClose}
                disabled={isUploading}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleUpload}
                disabled={!selectedFile || isUploading}
                className="gap-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Importing Products...</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-3.5 w-3.5" />
                    <span>Import {totalParsedRows > 0 ? `${totalParsedRows} Products` : "Products"}</span>
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};