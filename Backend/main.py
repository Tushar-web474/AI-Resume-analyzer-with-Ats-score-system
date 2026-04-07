from fastapi import FastAPI, UploadFile, File, Form
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import os, json, io, httpx, datetime
from typing import TypedDict, List, Optional
from dotenv import load_dotenv
from pypdf import PdfReader

# LangGraph & LangChain (Switching to Groq for Speed & Stability)
from langgraph.graph import StateGraph, END
from langchain_groq import ChatGroq # 🚀 New Import for Groq
from langchain_core.messages import HumanMessage

load_dotenv()
app = FastAPI()

# Config from .env
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
WEBHOOK_URL = os.getenv("WEBHOOK_URL") 
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

app.add_middleware(
    CORSMiddleware, 
    allow_origins=["*"], 
    allow_credentials=True, 
    allow_methods=["*"], 
    allow_headers=["*"]
)

# --- LANGGRAPH AGENTIC STATE ---

class AgentState(TypedDict):
    resume_text: str
    jd_text: Optional[str]
    user_email: Optional[str]
    domain: str # Professional Domain (Career Track)
    result: Optional[dict]
    error: Optional[str]
    retry_count: int

# 🚀 INITIALIZE GROQ (Llama 3.3 70B - Extremely Fast & Reliable)
llm = ChatGroq(
    model="llama-3.3-70b-versatile", 
    groq_api_key=GROQ_API_KEY,
    temperature=0.2 
)

# --- NODES (The Agents) ---

# NODE 1: Classifier (Identifying the Career Track)
def classifier_node(state: AgentState):
    print("--- [AGENT 1] Identifying Career Track via Groq ---")
    prompt = f"""
    Classify this resume into exactly one professional domain: 
    Tech, Management, Creative, Medical, or Finance.
    Return ONLY the domain name. No other text.
    
    Resume: {state['resume_text'][:2000]}
    """
    response = llm.invoke([HumanMessage(content=prompt)])
    return {"domain": response.content.strip()}

# NODE 2: Specialized Analyzer
def analyzer_node(state: AgentState):
    print(f"--- [AGENT 2] Analyzing as {state['domain']} Expert ---")
    jd_context = f"Target Job Description:\n{state['jd_text']}" if state['jd_text'] else "General professional analysis."
    
    prompt = f"""
    You are a Senior Recruiter specializing in {state['domain']} roles.
    Compare the Resume against the {jd_context}.
    Return ONLY a valid JSON object. Do not include markdown formatting or backticks.

    Required JSON Structure:
    {{
      "domain_detected": "{state['domain']}",
      "skills": ["list of matching skills"],
      "missing_skills": ["list of missing keywords from JD"],
      "ats_score": 85,
      "suggestions": ["specific improvement tips"],
      "job_roles": ["recommended roles"],
      "clarification_question": "Ask one specific question to the candidate about a missing detail in their resume."
    }}

    Resume Content:
    {state['resume_text']}
    """
    try:
        response = llm.invoke([HumanMessage(content=prompt)])
        # Clean potential markdown if Groq adds it
        raw_content = response.content.replace("```json", "").replace("```", "").strip()
        parsed_json = json.loads(raw_content)
        return {"result": parsed_json, "error": None}
    except Exception as e:
        print(f"--- [ERROR] JSON Parsing failed: {str(e)} ---")
        return {"error": str(e), "retry_count": state['retry_count'] + 1}

# NODE 3: Webhook Relay (Routing to n8n)
async def webhook_node(state: AgentState):
    if not state['result'] or not WEBHOOK_URL:
        print("--- [WEBHOOK] Skipped: No result or URL missing ---")
        return state

    print(f"--- [AGENT 3] Routing data to n8n for Automation ---")
    
    payload = {
        "event": "resume_analyzed",
        "timestamp": datetime.datetime.now().isoformat(),
        "user_email": state.get("user_email"),
        "has_jd": bool(state['jd_text']),
        "jd_content": state['jd_text'],
        "domain": state['domain'],
        "ats_score": state['result'].get("ats_score"),
        "data": state['result']
    }
    
    try:
        async with httpx.AsyncClient() as client:
            await client.post(WEBHOOK_URL, json=payload, timeout=15.0)
            print("--- [WEBHOOK] Data successfully sent to n8n ---")
    except Exception as e:
        print(f"--- [WEBHOOK ERROR] {str(e)} ---")
    
    return state

# --- GRAPH LOGIC ---

def should_continue(state: AgentState):
    if state.get("result") and not state.get("error") and WEBHOOK_URL:
        return "webhook"
    if state["retry_count"] >= 2:
        return END
    return "analyzer"

# Build the Graph
workflow = StateGraph(AgentState)

workflow.add_node("classifier", classifier_node)
workflow.add_node("analyzer", analyzer_node)
workflow.add_node("webhook", webhook_node)

workflow.set_entry_point("classifier")
workflow.add_edge("classifier", "analyzer")
workflow.add_conditional_edges(
    "analyzer", 
    should_continue, 
    {"webhook": "webhook", END: END}
)
workflow.add_edge("webhook", END)

app_agent = workflow.compile()

# --- HELPERS & ENDPOINTS ---

async def save_to_supabase(filename, score, result):
    if not SUPABASE_URL or not SUPABASE_KEY: return
    url = f"{SUPABASE_URL}/rest/v1/analyses"
    headers = {
        "apikey": SUPABASE_KEY, 
        "Authorization": f"Bearer {SUPABASE_KEY}", 
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
    }
    payload = {"resume_filename": filename, "ats_score": score, "full_result": result}
    try:
        async with httpx.AsyncClient() as client:
            await client.post(url, headers=headers, json=payload)
            print(f"--- [DB] Saved analysis for {filename} ---")
    except Exception as e:
        print(f"--- [DB ERROR] {str(e)} ---")

@app.post("/analyze")
async def analyze_resume(
    text: Optional[str] = Form(None), 
    jd: Optional[str] = Form(None), 
    email: Optional[str] = Form(None), 
    file: Optional[UploadFile] = File(None)
):
    resume_content = ""
    filename = file.filename if file else "Text Input"
    
    if file:
        reader = PdfReader(io.BytesIO(await file.read()))
        resume_content = "\n".join([p.extract_text() for p in reader.pages])
    else:
        resume_content = text

    if not resume_content:
        return {"error": "No resume content provided."}

    initial_state = {
        "resume_text": resume_content, 
        "jd_text": jd, 
        "user_email": email, 
        "result": None, 
        "error": None, 
        "retry_count": 0, 
        "domain": ""
    }
    
    final_state = await app_agent.ainvoke(initial_state)
    
    if final_state['result']:
        await save_to_supabase(filename, final_state['result']['ats_score'], final_state['result'])
    
    return final_state['result']

@app.get("/history")
async def get_history():
    if not SUPABASE_URL: return []
    url = f"{SUPABASE_URL}/rest/v1/analyses?select=*&order=created_at.desc&limit=10"
    headers = {"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}"}
    async with httpx.AsyncClient() as client:
        res = await client.get(url, headers=headers)
        return res.json()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)