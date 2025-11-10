export type DocumentStatus = "UPLOADED" | "PARSING" | "PARSED" | "FAILED";

export interface ParsedDocumentData {
  document_type?: "invoice" | "receipt" | "statement" | null;
  invoice_number?: string | null;
  invoice_date?: string | null;
  due_date?: string | null;
  vendor_name?: string | null;
  vendor_address?: string | null;
  bill_to?: string | null;
  ship_to?: string | null;
  purchase_order?: string | null;
  payment_terms?: string | null;
  currency?: string | null;
  subtotal?: number | null;
  tax_amount?: number | null;
  tax_rate?: number | null;
  total_amount?: number | null;
  line_items?: Array<{
    description?: string | null;
    qty?: number | null;
    unit_price?: number | null;
    total?: number | null;
    sku?: string | null;
  }>;
  notes?: string | null;
  confidence?: {
    invoice_number?: number | null;
    invoice_date?: number | null;
    due_date?: number | null;
    vendor_name?: number | null;
    total_amount?: number | null;
  };
  source_snippets?: Array<{ field: string; text: string }>;
  validation_warning?: string | null;
  rawText?: string;
  rawOutput?: string;
  parseError?: string;
  error?: string;
}

export interface Document {
  id: string;
  userId: string;
  fileUrl: string;
  fileName?: string | null;
  fileSize?: string | null;
  parsedData?: ParsedDocumentData | null;
  status: DocumentStatus;
  errorMessage?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

export interface User {
  id: string;
  clerkId: string;
  email: string;
  name?: string | null;
  createdAt: string;
}
