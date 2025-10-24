import { logger } from "../utils/logger";
import { OpenAI } from "openai";

const openaiApiKey = process.env.OPENAI_API_KEY;

if (!openaiApiKey) {
  logger.warn("OPENAI_API_KEY not set — AI labeling will fail if used");
}

const client = new OpenAI({ apiKey: openaiApiKey });

export const labelWithAI = async (rawText: string) => {
  const prompt = `You are a JSON extractor for financial documents (invoices, receipts, bank statements).
Extract useful fields and produce VALID JSON only. When a field is not present, use null.
Fields to extract:
  - invoice_number
  - invoice_date
  - due_date
  - vendor_name
  - total_amount
  - currency
  - line_items (array of { description, qty, unit_price, total })
Return only JSON.

Document text:
"""${rawText}"""`;

  const completion = await client.chat.completions.create({
    model: "gpt-5",
    messages: [{ role: "user", content: prompt }],
    temperature: 0,
  });

  const content = completion.choices?.[0]?.message.content ?? "";
  try {
    const parsed = JSON.parse(content);
    return parsed;
  } catch (err) {
    logger.warn("AI output not valid JSON, returning raw output");
    return { rawOutput: content, rawText };
  }
};
