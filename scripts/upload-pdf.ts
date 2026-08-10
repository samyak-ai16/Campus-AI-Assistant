import fs from "fs";
import { createClient } from "@supabase/supabase-js";
import { pipeline } from "@xenova/transformers";
import dotenv from "dotenv";

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

console.log("🚀 Starting Local Embedding & Text Upload Script...");

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌ ERROR: Missing Supabase environment variables in .env!");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Load local feature-extraction model pipeline
let extractor: any = null;

async function getEmbedding(text: string): Promise<number[]> {
  if (!extractor) {
    console.log("📦 Loading local embedding model (all-MiniLM-L6-v2)... Please wait a few seconds.");
    extractor = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  }

  const output = await extractor(text, { pooling: "mean", normalize: true });
  return Array.from(output.data);
}

async function run() {
  let filePath = "./timetable.txt";
  if (!fs.existsSync(filePath) && fs.existsSync("./timetable.txt.txt")) {
    filePath = "./timetable.txt.txt";
  }

  if (!fs.existsSync(filePath)) {
    console.error(`❌ ERROR: Could not find '${filePath}'. Please place your text file in the project root.`);
    process.exit(1);
  }

  console.log(`📄 Reading file: ${filePath}...`);
  const rawText = fs.readFileSync(filePath, "utf-8");

  // Split content into clean chunks
  const chunks = rawText
    .split("\n\n")
    .map((c) => c.trim())
    .filter((c) => c.length > 10);

  console.log(`✂️ Split into ${chunks.length} section(s). Generating local embeddings...`);

  for (let i = 0; i < chunks.length; i++) {
    const chunkText = chunks[i];
    console.log(`🔄 Generating local embedding for chunk ${i + 1}/${chunks.length}...`);
    
    const vector = await getEmbedding(chunkText);

    const { error } = await supabase.from("college_documents").insert({
      content: chunkText,
      metadata: { source: "timetable.txt", chunk_index: i },
      embedding: vector,
    });

    if (error) {
      console.error(`❌ Supabase Insert Error on chunk ${i + 1}:`, error.message);
    } else {
      console.log(`✅ Successfully uploaded chunk ${i + 1}/${chunks.length}`);
    }
  }

  console.log("🎉 DONE! Refresh your Supabase 'college_documents' table to verify.");
}

await run().catch((err) => console.error("❌ Fatal Error:", err));