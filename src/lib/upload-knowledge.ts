import { createClient } from "@supabase/supabase-js";
import { createServerFn } from "@tanstack/react-start";
import { get1536Embedding, chunkText, extractTextFromDocument } from "./embeddings";

interface UploadKnowledgePayload {
  title?: string;
  category?: string;
  content?: string;
  fileBase64?: string;
  fileName?: string;
  mimeType?: string;
  chunkSize?: number;
  chunkOverlap?: number;
}

/**
 * Core processor for uploading and indexing knowledge into knowledge_base.
 */
export async function processKnowledgeUpload(
  payload: UploadKnowledgePayload,
  authToken?: string,
) {
  const supabaseUrl =
    process.env.VITE_SUPABASE_URL ||
    (import.meta as any).env?.VITE_SUPABASE_URL;

  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase credentials are missing.");
  }

  // Create client with user auth header if provided, otherwise default key
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: authToken
      ? {
          headers: {
            Authorization: authToken.startsWith("Bearer ")
              ? authToken
              : `Bearer ${authToken}`,
          },
        }
      : undefined,
  });

  // Extract raw text
  let rawText = (payload.content || "").trim();

  if (payload.fileBase64) {
    const buffer = Buffer.from(payload.fileBase64, "base64");
    const extracted = await extractTextFromDocument(
      buffer,
      payload.mimeType || "application/octet-stream",
      payload.fileName,
    );
    rawText = rawText ? `${rawText}\n\n${extracted}` : extracted;
  }

  if (!rawText || rawText.trim().length === 0) {
    throw new Error("No text content found to index. Provide 'content' or a valid document.");
  }

  const title =
    (payload.title || "").trim() ||
    (payload.fileName ? payload.fileName.replace(/\.[^/.]+$/, "") : "Campus Knowledge Document");

  const category = (payload.category || "General").trim();

  // Chunk text
  const chunks = chunkText(rawText, {
    chunkSize: payload.chunkSize ?? 750,
    chunkOverlap: payload.chunkOverlap ?? 120,
  });

  if (chunks.length === 0) {
    throw new Error("Text was too short or empty to produce indexable chunks.");
  }

  console.log(`[Upload-Knowledge] Indexing "${title}" (${category}): ${chunks.length} chunk(s)...`);

  const insertedRows: Array<{ id?: string; title: string; content: string; category: string }> = [];

  // Process in batches of 5 to avoid rate limits
  const BATCH_SIZE = 5;
  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE);
    
    const recordsToInsert = await Promise.all(
      batch.map(async (chunk, batchIndex) => {
        const globalIndex = i + batchIndex;
        const vector = await get1536Embedding(chunk);
        return {
          title: chunks.length > 1 ? `${title} (Part ${globalIndex + 1})` : title,
          content: chunk,
          category,
          embedding: vector,
        };
      }),
    );

    const { data, error } = await supabase
      .from("knowledge_base")
      .insert(recordsToInsert)
      .select("id, title, content, category");

    if (error) {
      console.error(`[Upload-Knowledge] Insert error on batch ${i}:`, error.message);
      throw new Error(`Failed to insert knowledge chunks into Supabase: ${error.message}`);
    }

    if (data) {
      insertedRows.push(...data);
    }
  }

  return {
    success: true,
    message: `Successfully processed and indexed ${chunks.length} knowledge chunk(s).`,
    title,
    category,
    chunksCount: chunks.length,
    insertedCount: insertedRows.length,
  };
}

/**
 * Standard HTTP Request handler for POST /api/admin/upload-knowledge
 */
export async function handleUploadKnowledgeRequest(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed. Use POST." }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const authHeader = request.headers.get("authorization") || undefined;
  const contentType = request.headers.get("content-type") || "";

  try {
    let payload: UploadKnowledgePayload = {};

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const title = (formData.get("title") as string) || undefined;
      const category = (formData.get("category") as string) || undefined;
      const content = (formData.get("content") as string) || undefined;
      const file = formData.get("file") as File | null;

      payload = { title, category, content };

      if (file && typeof file.arrayBuffer === "function") {
        const arrayBuf = await file.arrayBuffer();
        payload.fileBase64 = Buffer.from(arrayBuf).toString("base64");
        payload.fileName = file.name;
        payload.mimeType = file.type;
      }
    } else {
      payload = (await request.json()) as UploadKnowledgePayload;
    }

    const result = await processKnowledgeUpload(payload, authHeader);
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("[handleUploadKnowledgeRequest Error]:", err);
    return new Response(
      JSON.stringify({
        success: false,
        error: err.message || "Failed to upload knowledge.",
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}

/**
 * TanStack Start Server Function for calling from React UI
 */
export const uploadKnowledgeFn = createServerFn({ method: "POST" })
  .inputValidator((data: UploadKnowledgePayload) => data)
  .handler(async ({ data }) => {
    return await processKnowledgeUpload(data);
  });
