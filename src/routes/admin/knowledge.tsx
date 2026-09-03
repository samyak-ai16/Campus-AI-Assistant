import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import {
  Plus,
  Trash2,
  Loader2,
  FileText,
  UploadCloud,
  Database,
  Search,
  Sparkles,
  RefreshCw,
  Layers,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/knowledge")({
  head: () => ({
    meta: [
      { title: "Knowledge Base (RAG) — Admin" },
      { name: "description", content: "Manage dynamic knowledge base documents and embeddings for AI chatbot." },
    ],
  }),
  component: KnowledgeAdmin,
});

type KnowledgeRow = {
  id: string;
  title: string;
  content: string;
  category: string;
  created_at: string;
};

const CATEGORIES = [
  "Academic",
  "Examination",
  "Timetable",
  "Syllabus",
  "Faculty",
  "Admissions",
  "Facilities",
  "General",
];

const MIGRATION_SQL = `-- Run in Supabase SQL Editor:
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS public.knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  embedding vector(1536),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read knowledge_base"
  ON public.knowledge_base FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "Admins can insert knowledge_base"
  ON public.knowledge_base FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update knowledge_base"
  ON public.knowledge_base FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can delete knowledge_base"
  ON public.knowledge_base FOR DELETE TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

GRANT ALL ON public.knowledge_base TO service_role;
GRANT SELECT ON public.knowledge_base TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.knowledge_base TO authenticated;

CREATE INDEX IF NOT EXISTS idx_knowledge_base_embedding 
  ON public.knowledge_base USING hnsw (embedding vector_cosine_ops);

CREATE OR REPLACE FUNCTION public.match_knowledge(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.25,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  title text,
  content text,
  category text,
  similarity float,
  created_at timestamptz
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN QUERY
  SELECT
    kb.id,
    kb.title,
    kb.content,
    kb.category,
    (1 - (kb.embedding <=> query_embedding))::float AS similarity,
    kb.created_at
  FROM public.knowledge_base kb
  WHERE kb.embedding IS NOT NULL
    AND (1 - (kb.embedding <=> query_embedding)) > match_threshold
  ORDER BY kb.embedding <=> query_embedding ASC
  LIMIT match_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.match_knowledge(vector(1536), float, int) TO authenticated, anon, service_role;`;

function KnowledgeAdmin() {
  const [rows, setRows] = useState<KnowledgeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [tableMissing, setTableMissing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [copiedSql, setCopiedSql] = useState(false);
  const [showSqlDialog, setShowSqlDialog] = useState(false);

  // Upload dialog state
  const [openUpload, setOpenUpload] = useState(false);
  const [uploadTab, setUploadTab] = useState<"file" | "text">("file");
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadCategory, setUploadCategory] = useState("Academic");
  const [uploadText, setUploadText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Semantic test search state
  const [testQuery, setTestQuery] = useState("");
  const [testingRAG, setTestingRAG] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);

  async function load() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("knowledge_base")
        .select("id, title, content, category, created_at")
        .order("created_at", { ascending: false });

      if (error) {
        if (error.message.includes("does not exist") || error.message.includes("schema cache")) {
          setTableMissing(true);
        }
        setRows([]);
      } else {
        setTableMissing(false);
        setRows((data as KnowledgeRow[]) ?? []);
      }
    } catch (e: any) {
      console.warn("Could not query knowledge_base:", e);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!uploadTitle.trim()) {
        setUploadTitle(file.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  async function handleUpload() {
    if (uploadTab === "text" && !uploadText.trim()) {
      toast.error("Please paste or type content to index.");
      return;
    }
    if (uploadTab === "file" && !selectedFile) {
      toast.error("Please select a document to upload.");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append(
        "title",
        uploadTitle.trim() || selectedFile?.name?.replace(/\.[^/.]+$/, "") || "Campus Document",
      );
      formData.append("category", uploadCategory);

      if (uploadTab === "file" && selectedFile) {
        formData.append("file", selectedFile);
      } else {
        formData.append("content", uploadText);
      }

      // Get user access token for authorization header
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      const res = await fetch("/api/admin/upload-knowledge", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Upload failed");
      }

      toast.success(data.message || `Indexed ${data.chunksCount} chunk(s) successfully!`);
      setOpenUpload(false);
      setUploadText("");
      setUploadTitle("");
      setSelectedFile(null);
      load();
    } catch (e: any) {
      toast.error(e?.message ?? "Upload and embedding failed.");
    } finally {
      setUploading(false);
    }
  }

  async function removeChunk(id: string) {
    if (!confirm("Are you sure you want to delete this knowledge chunk?")) return;
    const { error } = await supabase.from("knowledge_base").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Knowledge chunk deleted");
      load();
    }
  }

  async function runTestSearch() {
    if (!testQuery.trim()) return;
    setTestingRAG(true);
    setTestResults([]);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: testQuery }),
      });
      const data = await res.json();
      if (data.sources) {
        setTestResults(data.sources);
        if (data.sources.length === 0) {
          toast.info("No knowledge chunks matched this query above threshold.");
        } else {
          toast.success(`Retrieved ${data.sources.length} matching chunk(s)!`);
        }
      } else if (data.error) {
        toast.error(data.error);
      }
    } catch (e: any) {
      toast.error("Test search failed: " + e.message);
    } finally {
      setTestingRAG(false);
    }
  }

  const copySql = () => {
    navigator.clipboard.writeText(MIGRATION_SQL);
    setCopiedSql(true);
    toast.success("SQL copied to clipboard!");
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const filteredRows = rows.filter((r) => {
    const matchesCat = selectedCategory === "all" || r.category === selectedCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Database className="h-7 w-7 text-primary" />
            Knowledge Base (RAG)
          </h1>
          <p className="text-muted-foreground">
            Manage admin-provided documents, text, and 1536-dim vector embeddings for AI chatbot retrieval.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={load} disabled={loading} title="Refresh">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button
            onClick={() => setOpenUpload(true)}
            className="text-white"
            style={{ background: "var(--gradient-brand)" }}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Knowledge
          </Button>
        </div>
      </div>

      {/* Migration Notice Banner if table does not exist */}
      {tableMissing && (
        <Card className="p-4 border-amber-500/40 bg-amber-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-sm text-amber-600 dark:text-amber-400">
                Database Table 'knowledge_base' Needs Migration
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Execute the pgvector SQL migration script in your Supabase SQL Editor to enable embeddings and similarity search.
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button size="sm" variant="outline" onClick={copySql}>
              {copiedSql ? <Check className="h-4 w-4 mr-1 text-green-500" /> : <Copy className="h-4 w-4 mr-1" />}
              {copiedSql ? "Copied" : "Copy SQL"}
            </Button>
            <Button size="sm" onClick={() => setShowSqlDialog(true)}>
              View SQL
            </Button>
          </div>
        </Card>
      )}

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <div className="text-2xl font-bold">{rows.length}</div>
            <div className="text-xs text-muted-foreground">Indexed Vector Chunks</div>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-500">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <div className="text-2xl font-bold">1536</div>
            <div className="text-xs text-muted-foreground">Vector Dimensions (pgvector)</div>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-500">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <div className="text-2xl font-bold">
              {new Set(rows.map((r) => r.category)).size}
            </div>
            <div className="text-xs text-muted-foreground">Active Categories</div>
          </div>
        </Card>
      </div>

      {/* Semantic Search RAG Tester */}
      <Card className="p-5 border-primary/20 bg-primary/5">
        <div className="flex items-center gap-2 mb-2 font-semibold">
          <Sparkles className="h-4 w-4 text-primary" />
          <span>Test Dynamic RAG Retrieval</span>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Simulate what context chunks the AI chatbot will retrieve when a student asks a specific question.
        </p>
        <div className="flex gap-2">
          <Input
            placeholder="Type a test question (e.g. When do mid-semester exams begin?)..."
            value={testQuery}
            onChange={(e) => setTestQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && runTestSearch()}
          />
          <Button onClick={runTestSearch} disabled={testingRAG || !testQuery.trim()}>
            {testingRAG ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Search className="h-4 w-4 mr-1" />}
            Test Search
          </Button>
        </div>

        {testResults.length > 0 && (
          <div className="mt-4 space-y-2">
            <div className="text-xs font-semibold text-primary">Top Matching Chunks:</div>
            {testResults.map((res, i) => (
              <div key={i} className="rounded-lg bg-background border p-3 text-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-foreground">{res.title}</span>
                  <Badge variant="secondary">
                    {Math.round((res.similarity || 0) * 100)}% Similarity
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-3 italic">
                  "{res.content}"
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search knowledge by title or content..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Knowledge Chunks List */}
      <div className="space-y-3">
        {loading && (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}

        {!loading && filteredRows.length === 0 && (
          <Card className="p-10 text-center text-muted-foreground">
            <Database className="mx-auto h-10 w-10 text-muted-foreground/50 mb-3" />
            <h3 className="font-semibold text-lg text-foreground">No Knowledge Chunks Found</h3>
            <p className="text-sm mt-1 mb-4">
              Upload handbook PDFs or paste campus text to build the dynamic knowledge base.
            </p>
            <Button onClick={() => setOpenUpload(true)} variant="outline">
              <Plus className="h-4 w-4 mr-1" /> Add Your First Document
            </Button>
          </Card>
        )}

        {filteredRows.map((row) => (
          <Card key={row.id} className="p-4 hover:border-primary/40 transition">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 className="font-semibold text-sm truncate">{row.title}</h3>
                  <Badge variant="outline" className="text-xs">
                    {row.category}
                  </Badge>
                  <span className="text-[11px] text-muted-foreground">
                    {new Date(row.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                  {row.content}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:bg-destructive/10 shrink-0"
                onClick={() => removeChunk(row.id)}
                title="Delete chunk"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Upload Modal Dialog */}
      <Dialog open={openUpload} onOpenChange={setOpenUpload}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UploadCloud className="h-5 w-5 text-primary" />
              Upload Knowledge for AI Chatbot
            </DialogTitle>
          </DialogHeader>

          <Tabs value={uploadTab} onValueChange={(v) => setUploadTab(v as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="file">Upload Document (PDF/Text)</TabsTrigger>
              <TabsTrigger value="text">Paste Text</TabsTrigger>
            </TabsList>

            <div className="space-y-4 py-4">
              <div>
                <Label>Document Title</Label>
                <Input
                  placeholder="e.g. Mid-Semester Exam Schedule 2026"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                />
              </div>

              <div>
                <Label>Category</Label>
                <Select value={uploadCategory} onValueChange={setUploadCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <TabsContent value="file" className="mt-0 space-y-2">
                <Label>Select Document File</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition">
                  <FileText className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <div className="text-sm font-medium">
                    {selectedFile ? selectedFile.name : "Click to select a file"}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Supports PDF, TXT, Markdown, CSV, JSON
                  </p>
                  <input
                    type="file"
                    accept=".pdf,.txt,.md,.csv,.json,application/pdf,text/plain"
                    className="mt-3 block w-full text-xs text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                    onChange={handleFileChange}
                  />
                </div>
              </TabsContent>

              <TabsContent value="text" className="mt-0 space-y-2">
                <Label>Paste Knowledge Content</Label>
                <Textarea
                  placeholder="Paste rules, handbook sections, FAQs, syllabus guidelines..."
                  rows={8}
                  value={uploadText}
                  onChange={(e) => setUploadText(e.target.value)}
                />
              </TabsContent>
            </div>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenUpload(false)} disabled={uploading}>
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={uploading}
              className="text-white"
              style={{ background: "var(--gradient-brand)" }}
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Indexing Chunks...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Embeddings & Save
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* SQL Migration Script Dialog */}
      <Dialog open={showSqlDialog} onOpenChange={setShowSqlDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              Supabase SQL Migration Script
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto">
            <p className="text-xs text-muted-foreground mb-2">
              Copy and execute this script once in your Supabase SQL Editor:
            </p>
            <pre className="p-3 rounded-md bg-muted text-[11px] font-mono whitespace-pre-wrap overflow-x-auto select-all">
              {MIGRATION_SQL}
            </pre>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowSqlDialog(false)}>
              Close
            </Button>
            <Button onClick={copySql}>
              {copiedSql ? <Check className="h-4 w-4 mr-1 text-green-500" /> : <Copy className="h-4 w-4 mr-1" />}
              {copiedSql ? "Copied" : "Copy SQL"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
