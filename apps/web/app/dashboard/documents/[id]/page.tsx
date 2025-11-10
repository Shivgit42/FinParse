/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { use } from "react";
import Link from "next/link";
import { useDocument } from "@/hooks/useDocuments";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Download,
  Loader2,
  FileText,
  Calendar,
  DollarSign,
  Building,
  AlertCircle,
} from "lucide-react";
import {
  formatDate,
  formatDateTime,
  formatFileSize,
  getStatusColor,
  downloadJSON,
  formatCurrency,
} from "@/lib/utils";

export default function DocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const { data: document, isLoading } = useDocument(resolvedParams.id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!document) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Document not found</h2>
        <p className="text-muted-foreground mb-6">
          The document you&apos;re looking for doesn&apos;t exist or has been
          deleted.
        </p>
        <Link href="/dashboard">
          <Button>Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  const parsedData = document.parsedData;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">
              {document.fileName || "Untitled Document"}
            </h1>
            <p className="text-muted-foreground mt-1">
              Uploaded {formatDateTime(document.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={getStatusColor(document.status)}>
            {document.status}
          </Badge>
          {document.status === "PARSED" && (
            <Button
              onClick={() =>
                downloadJSON(parsedData, document.fileName || "document")
              }
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Download JSON
            </Button>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm text-muted-foreground">File Size</p>
              <p className="font-semibold">
                {formatFileSize(document.fileSize || "0")}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Calendar className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm text-muted-foreground">Upload Date</p>
              <p className="font-semibold">{formatDate(document.createdAt)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Loader2
              className={`h-8 w-8 ${
                document.status === "PARSING" ? "animate-spin" : ""
              } text-yellow-600`}
            />
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="font-semibold">{document.status}</p>
            </div>
          </div>
        </Card>
      </div>

      {document.status === "FAILED" && document.errorMessage && (
        <Card className="p-6 border-destructive">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 text-destructive mt-0.5" />
            <div>
              <h3 className="font-semibold text-destructive mb-1">
                Processing Failed
              </h3>
              <p className="text-sm">{document.errorMessage}</p>
            </div>
          </div>
        </Card>
      )}

      {document.status === "PARSED" && parsedData && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Extracted Data</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6 space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Document Information
              </h3>
              <div className="space-y-3">
                <InfoRow
                  label="Document Type"
                  value={parsedData.document_type}
                />
                <InfoRow
                  label="Invoice Number"
                  value={parsedData.invoice_number}
                />
                <InfoRow label="Invoice Date" value={parsedData.invoice_date} />
                <InfoRow label="Due Date" value={parsedData.due_date} />
              </div>
            </Card>

            <Card className="p-6 space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Building className="h-5 w-5" />
                Vendor & Customer
              </h3>
              <div className="space-y-3">
                <InfoRow label="Vendor Name" value={parsedData.vendor_name} />
                <InfoRow
                  label="Vendor Address"
                  value={parsedData.vendor_address}
                />
                <InfoRow label="Bill To" value={parsedData.bill_to} />
              </div>
            </Card>
          </div>

          <Card className="p-6 space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Financial Details
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <InfoRow label="Currency" value={parsedData.currency} />
                <InfoRow
                  label="Subtotal"
                  value={formatCurrency(
                    parsedData.subtotal,
                    parsedData.currency
                  )}
                />
                <InfoRow
                  label="Tax Amount"
                  value={formatCurrency(
                    parsedData.tax_amount,
                    parsedData.currency
                  )}
                />
              </div>
              <div className="space-y-3">
                <InfoRow
                  label="Tax Rate"
                  value={parsedData.tax_rate ? `${parsedData.tax_rate}%` : null}
                />
                <InfoRow
                  label="Total Amount"
                  value={formatCurrency(
                    parsedData.total_amount,
                    parsedData.currency
                  )}
                  highlight
                />
              </div>
            </div>
          </Card>

          {parsedData.line_items && parsedData.line_items.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Line Items</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left py-2">Description</th>
                      <th className="text-right py-2">Quantity</th>
                      <th className="text-right py-2">Unit Price</th>
                      <th className="text-right py-2">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {parsedData.line_items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-3">{item.description || "N/A"}</td>
                        <td className="text-right py-3">{item.qty ?? "N/A"}</td>
                        <td className="text-right py-3">
                          {item.unit_price
                            ? formatCurrency(
                                item.unit_price,
                                parsedData.currency
                              )
                            : "N/A"}
                        </td>
                        <td className="text-right py-3 font-semibold">
                          {item.total
                            ? formatCurrency(item.total, parsedData.currency)
                            : "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Raw JSON Data</h3>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
              {JSON.stringify(parsedData, null, 2)}
            </pre>
          </Card>
        </div>
      )}

      {document.status === "PARSING" && (
        <Card className="p-12 text-center">
          <Loader2 className="h-16 w-16 animate-spin text-blue-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Processing Document...</h3>
          <p className="text-muted-foreground">
            This usually takes a few seconds. The page will update
            automatically.
          </p>
        </Card>
      )}
    </div>
  );
}

function InfoRow({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: any;
  highlight?: boolean;
}) {
  return (
    <div className="flex justify-between items-start">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span
        className={`text-sm font-medium text-right ${
          highlight ? "text-blue-600 text-lg" : ""
        }`}
      >
        {value || "N/A"}
      </span>
    </div>
  );
}
