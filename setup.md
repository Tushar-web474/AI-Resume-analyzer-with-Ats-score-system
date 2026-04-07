# 🚀 AI Resume Analyzer - Setup & Installation Guide

Follow these steps to get the project running locally. This project uses a multi-agent system (LangGraph) and autonomous automation (n8n).

---

## 1. Backend Setup (FastAPI + LangGraph)

1. **Navigate to the Backend folder:**
   cd Backend

2. **Create and activate a virtual environment:**
   python -m venv venv
   # On Windows:
   venv\Scripts\activate

3. **Install dependencies (Pinned for Security):**
   pip install fastapi==0.110.0 langgraph==0.0.32 langchain-groq==0.1.3 langchain-google-genai==1.0.1 httpx==0.28.1 pypdf==4.1.0 python-dotenv==1.0.1 uvicorn==0.27.1

4. **Configure Environment Variables:**
   Create a file named `.env` inside the `Backend/` folder and paste this:
   
   GROQ_API_KEY=your_groq_key_here
   GEMINI_API_KEY=your_gemini_key_here
   SUPABASE_URL=your_supabase_url_here
   SUPABASE_KEY=your_supabase_anon_key_here
   WEBHOOK_URL=your_n8n_production_url_here

5. **Start the Backend Server:**
   python main.py

---

## 2. Frontend Setup (React + Tailwind)

1. **Navigate to the vite-project folder:**
   cd vite-project

2. **Install packages (Safe Install):**
   npm install --ignore-scripts

3. **Run the development server:**
   npm run dev

---

## 3. Database Setup (Supabase)

Go to your Supabase SQL Editor and run this query to create the table:

CREATE TABLE analyses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  resume_filename text,
  ats_score int,
  full_result jsonb
);

---

## 4. Automation Setup (n8n)

1. **Create Workflow:** Add a **Webhook** node (Method: POST, Path: resume-data).
2. **AI Logic:** Add a **Basic LLM Chain** node and connect the **Groq Chat Model**.
3. **Action:** Add a **Gmail** node to send the final report to the user.
4. **Go Live:** Click **Publish** in n8n and copy the **Production URL** into your Backend `.env`.

---

## 🎯 How to Use

1. Open http://localhost:5173 in your browser.
2. **Upload** your Resume (PDF) or paste the text.
3. (Optional) Paste a **Job Description** to see how well you match.
4. (Optional) Enter your **Email** to receive tailored interview questions.
5. Click **"START AGENTIC FLOW"** and watch the real-time Agent Activity Log.