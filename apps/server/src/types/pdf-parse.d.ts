declare module "pdf-parse" {
  export interface PdfParseResult {
    text: string;
    // Other fields exist but are not needed currently
  }

  export default function pdfParse(
    data: Buffer | Uint8Array,
    options?: unknown
  ): Promise<PdfParseResult>;
}


