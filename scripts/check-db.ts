import dotenv from "dotenv";
dotenv.config();
import { createClient } from "@supabase/supabase-js";

const client = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!);

async function main() {
  const { data, error } = await client.from("knowledge_base").select("id").limit(1);
  if (error) {
    console.log("knowledge_base check result:", error.message);
  } else {
    console.log("knowledge_base table exists! Row count:", data.length);
  }

  const { data: rpcData, error: rpcError } = await client.rpc("match_knowledge", {
    query_embedding: new Array(1536).fill(0),
    match_threshold: 0.1,
    match_count: 1,
  });
  if (rpcError) {
    console.log("match_knowledge check result:", rpcError.message);
  } else {
    console.log("match_knowledge RPC exists! Rows:", rpcData?.length);
  }
}

main();
