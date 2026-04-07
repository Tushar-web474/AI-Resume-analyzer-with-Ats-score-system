# Setup & Installation Guide

Follow these steps to get the **AI Resume Analyzer** running locally.

## 1. Backend Setup
1. Navigate to the `Backend` folder:
   ```bash
   cd Backend
Create and activate a virtual environment:
code
Bash
python -m venv venv
venv\Scripts\activate
Install dependencies using pinned versions:
code
Bash
pip install fastapi==0.110.0 langgraph==0.0.32 langchain-groq==0.1.3 langchain-google-genai==1.0.1 httpx==0.28.1 pypdf==4.1.0 python-dotenv==1.0.1 uvicorn==0.27.1
Create a .env file and add your keys:
code
Env
GROQ_API_KEY=your_groq_key
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
WEBHOOK_URL=your_n8n_production_url
Start the server:
code
Bash
python main.py

2. Frontend Setup
Navigate to the vite-project folder:
code
Bash
cd vite-project
Install packages with security flags:
code
Bash
npm install --ignore-scripts
Run the development server:
code
Bash
npm run dev

3. Database Setup (Supabase)
Run the following query in the Supabase SQL Editor to create the required table:
code
SQL
CREATE TABLE analyses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  resume_filename text,
  ats_score int,
  full_result jsonb
);

4. Automation Setup (n8n)
Create a new workflow in n8n.
Add a Webhook node (Method: POST, Path: resume-data).
Add a Basic LLM Chain node with Groq Chat Model.
Add a Gmail node to send the final report.
Publish the workflow and copy the Production URL into the Backend .env.


🚀 How to Use
Open http://localhost:5173 in your browser.
Upload a PDF resume or paste text.
(Optional) Paste a Job Description for Gap Analysis.
(Optional) Enter your Email for automated interview prep.
Click "Start Agentic Flow" and watch the Agent Activity Log.