# 🎓 CampusAI — AI-Powered College Assistant & Campus Portal

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![TanStack Start](https://img.shields.io/badge/TanStack-Start%20%2F%20Router-orange.svg)](https://tanstack.com/start)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%20%2B%20pgvector-3ECF8E.svg)](https://supabase.com/)
[![Google Gemini](https://img.shields.io/badge/AI-Google%20Gemini%203.6%20Flash-4285F4.svg)](https://deepmind.google/technologies/gemini/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38B2AC.svg)](https://tailwindcss.com/)
[![Deployment](https://img.shields.io/badge/Deploy-Vercel-black.svg)](https://vercel.com/)

**CampusAI** is a modern, full-stack college portal and AI assistant built with **TanStack Start (React 19)**, **Supabase (pgvector)**, and **Google Gemini AI**. Designed with a ChatGPT/Linear-inspired aesthetic, it provides students with instant answers about their academic schedule, attendance, faculty, exams, and campus notices via a fast Retrieval-Augmented Generation (RAG) pipeline.

---

## 📌 Project Status

- **Status**: Active / Production-Ready Core
- **RAG Pipeline**: Fully operational with 1536-dimensional vector embeddings stored in Supabase `pgvector`.
- **Ingested Knowledge**: Academic timetables (`timetable.txt.txt`) and Mid-Semester Exam (MSE) schedules (`exam_timetable_mse.pdf`) chunked and indexed.
- **Hosting Target**: Vercel (via Nitro serverless preset configured in `nitro.config.ts` and `vercel.json`).

---

## ✨ Key Features & Capabilities

### 🤖 1. Context-Aware AI Chatbot (RAG Engine)
- **ChatGPT-Style Experience**: Fluid streaming chat UI with markdown rendering, syntax highlighting, conversation history, and quick starter prompts.
- **RAG Knowledge Retrieval**: User queries trigger semantic similarity searches using the `match_knowledge` RPC function against Supabase's `vector(1536)` index.
- **Model Fallbacks**: Built with high availability; defaults to `gemini-3.6-flash` with graceful fallback to `gemini-2.5-flash` or secondary endpoints.
- **Multimodal & Voice Ready**: Includes text-to-speech response playback and speech-to-text voice input.
- **Domain-Specific Answers**: Accurately answers questions like:
  - *"What classes do I have tomorrow?"*
  - *"When is the MSE examination for Database Management Systems?"*
  - *"What is the attendance requirement and criteria?"*
  - *"Who teaches Operating Systems and what is their office room?"*

### 📊 2. Student Academic Dashboard
- **Live Summary Cards**: Quick view of overall attendance percentage, today's schedule, upcoming exams, and latest notices.
- **Interactive Charts**: Weekly student activity bar charts, attendance trends, and subject-wise attendance distributions built with Recharts.
- **Quick Actions**: One-click navigation to chat, download admit cards, or check class notifications.

### 📅 3. Smart Timetable & Exam Schedules
- **Class Schedules**: Daily and weekly schedule grids with active lecture highlighting and search filtering.
- **MSE Examination Schedules**: Complete date-sheet viewer with seating slots, paper codes, and printable schedules.
- **PDF Viewer Integration**: In-app PDF inspection for official university exam timetables and circulars.

### 📈 4. Attendance Monitoring System
- **Real-Time Tracking**: Subject-wise class attendance calculation with color-coded safety margins.
- **Smart Warnings**: Proactive warning badges when attendance falls below the mandatory 75% threshold.

### 📚 5. Syllabus & Faculty Directory
- **Syllabus Explorer**: Subject cards categorized by semester and credits with direct syllabus PDF downloads.
- **Faculty Directory**: Searchable directory with teacher designations, departments, emails, cabin locations, and subjects taught.

### 📢 6. Campus Notices & Events
- **Notice Board**: Tag-based filtering for Academic, Examination, Placement, and Administrative circulars.
- **Events Calendar**: Visual event cards with date, time, venue, and registration links.

### 🛡️ 7. Role-Based Admin Portal (`/admin`)
- **Knowledge Base Manager (`/admin/knowledge`)**:
  - Drag-and-drop file upload for campus documents (PDFs, TXT, Markdown).
  - Configurable chunk sizing and overlap settings.
  - Automatic PDF text extraction (`pdf-parse`) and batch embedding generation (`@google/genai`).
  - Direct database vector sync into Supabase `knowledge_base`.
  - In-browser semantic search tester to verify chunk matches and cosine similarity scores.
- **Campus Management**: Admin panels for managing students, faculty, timetables, notices, and exams.
- **Usage Analytics**: Monitoring chat volume, common student questions, and system load.

### 🌐 8. Internationalization, PWA & UX Polish
- **Multi-Language Support**: Complete language switching between **English**, **Hindi (हिंदी)**, and **Marathi (मराठी)**.
- **Progressive Web App (PWA)**: Web manifest (`manifest.webmanifest`), offline detection banners, and mobile install prompt.
- **Dark & Light Modes**: System-aware theme toggle with curated slate/indigo color palette.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|:---|:---|
| **Frontend Framework** | [React 19](https://react.dev/), [TanStack Start](https://tanstack.com/start), [TanStack Router](https://tanstack.com/router) |
| **Styling & UI** | [Tailwind CSS v4](https://tailwindcss.com/), [Radix UI](https://www.radix-ui.com/), [Lucide React](https://lucide.dev/), Sonner Toasts |
| **Charts & Data Viz** | [Recharts](https://recharts.org/) |
| **Database & Vector Store** | [Supabase](https://supabase.com/) (PostgreSQL 15+, `pgvector`, Row Level Security) |
| **Artificial Intelligence** | [Google Gemini](https://ai.google.dev/) (`gemini-3.6-flash`, `gemini-embedding-001`) |
| **Document Processing** | `pdf-parse`, custom chunking & tokenizer utilities |
| **Build & Dev Tooling** | [Vite](https://vite.dev/), [Nitro Engine](https://nitro.unjs.io/), TypeScript 5.8 |
| **Deployment Target** | [Vercel](https://vercel.com/) (Serverless Build Output API v3) |

---

## 🏗️ Architecture & RAG Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│                       Client (Browser)                      │
│   React 19 • TanStack Router • i18n • Responsive Dashboard  │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / Server Functions
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                  TanStack Start Server (Nitro)              │
│  ├── /api/chat (Retrieval + Prompt Augmentation)            │
│  └── /api/upload-knowledge (Chunking + Vector Indexing)     │
└──────────────┬───────────────────────────────┬──────────────┘
               │                               │
       Embedding Query                 Vector Match RPC
               │                               │
               ▼                               ▼
┌──────────────────────────────┐ ┌────────────────────────────┐
│      Google Gemini AI        │ │     Supabase Database      │
│  • gemini-embedding-001      │ │  • pgvector extension      │
│  • gemini-3.6-flash (LLM)    │ │  • knowledge_base table    │
│  • gemini-2.5-flash fallback │ │  • match_knowledge() RPC   │
└──────────────────────────────┘ └────────────────────────────┘
```

---

## 📂 Project Structure

```
├── public/
│   ├── manifest.webmanifest      # PWA application manifest
│   └── logo.png                  # College/App branding logo
├── scripts/
│   ├── upload-to-knowledge-base.ts # CLI script to ingest timetable & exam PDF
│   ├── upload-pdf.ts             # PDF ingestion helper
│   └── check-db.ts               # Verification script for Supabase connection
├── src/
│   ├── components/               # Reusable UI components & dialogs
│   │   ├── ui/                   # Radix UI primitives (button, dialog, card, etc.)
│   │   ├── global-search.tsx     # Ctrl+K global modal search
│   │   ├── notification-center.tsx# Push & in-app alerts
│   │   ├── offline-banner.tsx    # PWA offline notification
│   │   └── pdf-viewer.tsx        # In-browser PDF renderer
│   ├── hooks/                    # Custom React hooks (role, mobile detection)
│   ├── integrations/
│   │   └── supabase/             # Typed Supabase client (browser + server)
│   ├── lib/
│   │   ├── api-chat.ts           # Gemini API chat runner with model fallback
│   │   ├── chat.functions.ts     # TanStack Start server functions for chat
│   │   ├── embeddings.ts         # Gemini vector generation & text chunking
│   │   ├── upload-knowledge.ts   # Document ingestion logic
│   │   └── i18n.tsx              # English / Hindi / Marathi translations
│   ├── routes/
│   │   ├── index.tsx             # Public landing page
│   │   ├── auth.tsx              # Authentication (Login / Sign Up)
│   │   ├── _authenticated/       # Protected student routes
│   │   │   ├── dashboard.tsx     # Student overview & statistics
│   │   │   ├── chat.tsx          # CampusAI Chat Assistant
│   │   │   ├── timetable.tsx     # Class schedules
│   │   │   ├── attendance.tsx    # Attendance analytics
│   │   │   ├── exams.tsx         # MSE exam dates & admit cards
│   │   │   ├── syllabus.tsx      # Subject syllabi & downloads
│   │   │   ├── faculty.tsx       # Faculty contact directory
│   │   │   ├── notices.tsx       # Campus circulars
│   │   │   └── events.tsx        # College events
│   │   └── admin/                # Admin Management Portal
│   │       ├── index.tsx         # Admin dashboard metrics
│   │       ├── knowledge.tsx     # RAG document uploader & tester
│   │       └── ...               # Faculty, Student, Timetable editors
│   ├── styles.css                # Tailwind CSS v4 design tokens
│   └── server.ts                 # Nitro server entrypoint
├── supabase/
│   └── migrations/               # SQL migrations including pgvector setup
├── exam_timetable_mse.pdf        # College MSE examination document
├── timetable.txt.txt             # Academic class timetable data
├── nitro.config.ts               # Nitro preset configuration (Vercel detection)
├── vercel.json                   # Vercel deployment build definition
└── vite.config.ts                # Vite build setup with TanStack plugins
```

---

## 🚀 Getting Started Locally

### 1. Prerequisites
- **Node.js**: v20.x or later
- **npm** or **bun**
- **Supabase Account**: With a PostgreSQL database and `pgvector` enabled
- **Google Gemini API Key**: From [Google AI Studio](https://aistudio.google.com/)

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/samyak-ai16/Campus-AI-Assistant.git
cd Campus-AI-Assistant

# Install dependencies
npm install
```

### 3. Environment Configuration
Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_ANON_KEY="your-supabase-anon-key"
VITE_GEMINI_API_KEY="your-gemini-api-key"
GEMINI_API_KEY="your-gemini-api-key"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"
```

### 4. Database Setup
Run the SQL migration in your Supabase SQL Editor:
- Navigate to `supabase/migrations/20260903140000_knowledge_base_rag.sql`
- Execute the script to create the `pgvector` extension, `knowledge_base` table, and `match_knowledge` RPC function.

### 5. Ingest Knowledge Base
To chunk and index the timetable and exam schedule into your Supabase database:

```bash
npx tsx scripts/upload-to-knowledge-base.ts
```

### 6. Start the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) (or the port shown in terminal) in your browser.

---

## ☁️ Deployment Guide (Vercel)

1. Push your latest code to GitHub:
   ```bash
   git push origin main
   ```
2. In the **Vercel Dashboard**:
   - Import your repository: `samyak-ai16/Campus-AI-Assistant`.
   - **Framework Preset**: Select `Other`.
   - **Build Command**: `npm run build` (or leave as detected).
   - **Output Directory**: Leave blank (Nitro generates `.output`).
3. Add **Environment Variables** in Vercel (*Settings → Environment Variables*):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `GEMINI_API_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Deploy! Nitro will automatically compile server functions into Vercel Serverless Functions.

---

## 📄 License
This project is licensed under the MIT License.
