import { logger } from "../utils/logger";
import { OpenAI } from "openai";

const openRouterApiKey = process.env.OPENROUTER_API_KEY;
const openRouterModel = process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini";

if (!openRouterApiKey) {
  logger.warn("OPENROUTER_API_KEY not set — AI labeling will fail if used");
}

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: openRouterApiKey,
  defaultHeaders: {
    "HTTP-Referer":
      process.env.OPENROUTER_HTTP_REFERER || "https://finparse.local",
    "X-Title": process.env.OPENROUTER_APP_NAME || "FinParse",
  },
});

export const labelWithAI = async (rawText: string) => {
  logger.info(`[AI] Starting AI labeling, text length: ${rawText.length}`);
  
  if (!openRouterApiKey) {
    logger.warn("[AI] OPENROUTER_API_KEY not set, returning empty structure");
    return {
      document_type: null,
      invoice_number: null,
      invoice_date: null,
      due_date: null,
      vendor_name: null,
      vendor_address: null,
      bill_to: null,
      ship_to: null,
      purchase_order: null,
      payment_terms: null,
      currency: null,
      subtotal: null,
      tax_amount: null,
      tax_rate: null,
      total_amount: null,
      line_items: [],
      notes: null,
      confidence: {
        invoice_number: null,
        invoice_date: null,
        due_date: null,
        vendor_name: null,
        total_amount: null,
      },
      source_snippets: [],
      validation_warning:
        "OPENROUTER_API_KEY not set; returning empty structure",
      rawText,
    };
  }
  const prompt = `You are a world‑class financial document parser. Read the DOCUMENT TEXT and output ONLY JSON conforming to the SCHEMA. Be precise and avoid hallucinations.

Rules:
- Output must be valid JSON. No markdown, no prose.
- Use ISO 8601 for dates (YYYY-MM-DD when day known, otherwise YYYY-MM).
- Use numbers for all monetary/quantity fields (not strings).
- currency must be a 3-letter code (e.g., USD, EUR, GBP) if present.
- Do not infer values you cannot justify; use null when uncertain or missing.
- Trim whitespace and normalize strings.
- If totals are present, ensure: subtotal + tax_amount == total_amount (when all are present). If inconsistent, keep raw values and set a field validation_warning with a brief note.
- Include confidence (0..1) per top-level field and an array of source_snippets specifying supporting text segments.

SCHEMA (all keys required, use null when missing):
{
  "document_type": "invoice" | "receipt" | "statement" | null,
  "invoice_number": string | null,
  "invoice_date": string | null,          // ISO 8601
  "due_date": string | null,              // ISO 8601
  "vendor_name": string | null,
  "vendor_address": string | null,
  "bill_to": string | null,
  "ship_to": string | null,
  "purchase_order": string | null,
  "payment_terms": string | null,
  "currency": string | null,              // 3-letter code
  "subtotal": number | null,
  "tax_amount": number | null,
  "tax_rate": number | null,              // percent as number, e.g., 6.25
  "total_amount": number | null,
  "line_items": [
    {
      "description": string | null,
      "qty": number | null,
      "unit_price": number | null,
      "total": number | null,
      "sku": string | null
    }
  ],
  "notes": string | null,
  "confidence": {
    "invoice_number": number | null,
    "invoice_date": number | null,
    "due_date": number | null,
    "vendor_name": number | null,
    "total_amount": number | null
  },
  "source_snippets": [
    { "field": string, "text": string }
  ],
  "validation_warning": string | null
}

Extraction strategy:
1) Identify document type keywords (invoice, receipt, statement) and set document_type.
2) Locate obvious fields: invoice number, dates, vendor, totals, currency symbol/code.
3) Parse line items table when present (rows with qty, unit price, amount). Convert to numbers.
4) Prefer explicit totals on the page over computed values. If mismatch, keep both raw values and set validation_warning.
5) Keep values faithful to the text; do not create values that don't exist.

DOCUMENT TEXT:
"""${rawText}"""`;

  try {
    logger.info(`[AI] Calling OpenRouter API with model: ${openRouterModel}`);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);
    
    const completion = await client.chat.completions.create(
      {
        model: openRouterModel,
        messages: [{ role: "user", content: prompt }],
        temperature: 0,
      },
      { signal: controller.signal }
    );
    clearTimeout(timeout);

    const content = completion.choices?.[0]?.message.content ?? "";
    logger.info(`[AI] Received response from OpenRouter, length: ${content.length}`);
    
    if (!content) {
      logger.warn("[AI] Empty response from OpenRouter");
      return { rawOutput: "", rawText, error: "Empty response from AI" };
    }

    try {
      // Try to extract JSON if wrapped in markdown code blocks
      let jsonText = content.trim();
      if (jsonText.startsWith("```json")) {
        jsonText = jsonText.replace(/^```json\s*/, "").replace(/\s*```$/, "");
      } else if (jsonText.startsWith("```")) {
        jsonText = jsonText.replace(/^```\s*/, "").replace(/\s*```$/, "");
      }
      
      const parsed = JSON.parse(jsonText);
      logger.info(`[AI] Successfully parsed JSON response`);
      return parsed;
    } catch (err: any) {
      logger.warn(`[AI] AI output not valid JSON: ${err?.message}`);
      logger.debug(`[AI] Raw output: ${content.substring(0, 500)}...`);
      return { rawOutput: content, rawText, parseError: err?.message };
    }
  } catch (err: any) {
    logger.error(`[AI] OpenRouter API call failed:`, {
      message: err?.message,
      stack: err?.stack,
      name: err?.name
    });
    throw err;
  }
};
