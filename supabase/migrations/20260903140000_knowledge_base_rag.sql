-- Migration: Knowledge Base RAG setup
-- 1. Enable vector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Create knowledge_base table
CREATE TABLE IF NOT EXISTS public.knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  embedding vector(1536),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;

-- Permissions and Policies
-- Allow anyone (authenticated and anon) to read knowledge base entries (for search & chatbot)
CREATE POLICY "Anyone can read knowledge_base"
  ON public.knowledge_base
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- Allow admins to insert, update, delete
CREATE POLICY "Admins can insert knowledge_base"
  ON public.knowledge_base
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update knowledge_base"
  ON public.knowledge_base
  FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can delete knowledge_base"
  ON public.knowledge_base
  FOR DELETE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Service role full access
GRANT ALL ON public.knowledge_base TO service_role;
GRANT SELECT ON public.knowledge_base TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.knowledge_base TO authenticated;

-- Create index for cosine similarity search (using HNSW)
CREATE INDEX IF NOT EXISTS idx_knowledge_base_embedding 
  ON public.knowledge_base 
  USING hnsw (embedding vector_cosine_ops);

-- Index on category and title for fast filtering
CREATE INDEX IF NOT EXISTS idx_knowledge_base_category ON public.knowledge_base (category);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_created_at ON public.knowledge_base (created_at DESC);

-- 3. Create match_knowledge RPC function
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
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
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

-- Grant execution to API roles
GRANT EXECUTE ON FUNCTION public.match_knowledge(vector(1536), float, int) TO authenticated;
GRANT EXECUTE ON FUNCTION public.match_knowledge(vector(1536), float, int) TO anon;
GRANT EXECUTE ON FUNCTION public.match_knowledge(vector(1536), float, int) TO service_role;
