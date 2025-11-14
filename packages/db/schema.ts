import {
  json,
  pgTable,
  text,
  timestamp,
  uuid,
  pgEnum,
} from "drizzle-orm/pg-core";

// Enum for document status
export const documentStatusEnum = pgEnum("document_status", [
  "UPLOADED",
  "PARSING",
  "PARSED",
  "FAILED",
]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  clerkId: text("clerk_id").notNull().unique(), // ← This field MUST exist
  email: text("email").notNull().unique(),
  name: text("name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const documents = pgTable("documents", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  fileUrl: text("file_url").notNull(),
  fileName: text("file_name"),
  fileSize: text("file_size"),
  parsedData: json("parsed_data").$type<ParsedDocumentData>(),
  status: documentStatusEnum("status").default("UPLOADED").notNull(),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Type definition for parsed data
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
