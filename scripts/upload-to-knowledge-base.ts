import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import { processKnowledgeUpload } from "../src/lib/upload-knowledge";

async function main() {
  const args = process.argv.slice(2);
  const targetFile = args[0] || (fs.existsSync("./timetable.txt.txt") ? "./timetable.txt.txt" : "./exam_timetable_mse.pdf");
  const category = args[1] || (targetFile.includes("exam") ? "Examination" : "Timetable");

  console.log("=========================================");
  console.log("  CampusAI Knowledge Base Upload (1536-dim)");
  console.log("=========================================");
  console.log(`Target File : ${targetFile}`);
  console.log(`Category    : ${category}`);

  if (!fs.existsSync(targetFile)) {
    console.error(`❌ File not found: ${targetFile}`);
    process.exit(1);
  }

  const buffer = fs.readFileSync(targetFile);
  const fileName = path.basename(targetFile);
  const isPdf = targetFile.toLowerCase().endsWith(".pdf");
  const mimeType = isPdf ? "application/pdf" : "text/plain";

  console.log(`Reading ${fileName} (${buffer.length} bytes)...`);

  try {
    const res = await processKnowledgeUpload({
      fileName,
      category,
      fileBase64: buffer.toString("base64"),
      mimeType,
      title: fileName.replace(/\.[^/.]+$/, ""),
    });

    console.log("✅ SUCCESS!");
    console.log(`Message       : ${res.message}`);
    console.log(`Chunks Stored : ${res.chunksCount}`);
    console.log(`Category      : ${res.category}`);
  } catch (err: any) {
    console.error("❌ Upload failed:", err.message);
    process.exit(1);
  }
}

main();
