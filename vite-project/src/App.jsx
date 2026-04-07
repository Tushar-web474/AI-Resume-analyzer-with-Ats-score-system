import { useState } from "react";

function App() {
  const [text, setText] = useState("");
  const [jd, setJd] = useState(""); 
  const [email, setEmail] = useState(""); // 📧 New state for Email
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [agentStatus, setAgentStatus] = useState(""); 
  const [agentMessage, setAgentMessage] = useState("");

  const handleAnalyze = async () => {
    if (!text.trim() && !file) {
      setError("Please provide a resume (PDF or Text)");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);
    
    setAgentStatus("🤖 Agent Initializing...");
    
    try {
      const formData = new FormData();
      if (file) formData.append("file", file);
      else formData.append("text", text);
      if (jd.trim()) formData.append("jd", jd);
      if (email.trim()) formData.append("email", email); // 📧 Send email to backend

      setTimeout(() => setAgentStatus("🔍 Classifying Professional Ward..."), 800);
      setTimeout(() => setAgentStatus("🧠 Performing Deep Gap Analysis..."), 1600);

      const res = await fetch("http://127.0.0.1:8000/analyze", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Server error - check backend logs");

      const data = await res.json();

      if (data.error) {
        setError(data.error);
        setAgentStatus("❌ Agent Error");
      } else {
        setAgentStatus(email ? "🚀 Routing Report to your Email..." : "🚀 Routing Data to n8n...");
        setResult(data);
        setAgentMessage(data.clarification_question || "Analysis complete. How else can I help?");
        setTimeout(() => setAgentStatus("✅ Workflow Complete"), 2000);
      }
    } catch (err) {
      setError("Backend not reachable. Ensure FastAPI is running.");
      setAgentStatus("❌ Connection Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-10">
      <div className="max-w-[1600px] mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent">
            AI CAREER AGENT 🎯
          </h1>
          <p className="text-zinc-500 mt-3 text-lg font-mono uppercase tracking-widest">Autonomous Recruitment Pipeline</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* COLUMN 1: INPUTS */}
          <section className="space-y-6">
            {/* Resume Input */}
            <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl shadow-2xl">
              <h2 className="text-xs font-black text-emerald-500 uppercase tracking-[0.2em] mb-6">1. Your Resume</h2>
              <div className="mb-6">
                <div className="relative group">
                  <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                  <div className={`p-4 border-2 border-dashed rounded-xl text-center transition-all ${file ? 'border-emerald-500 bg-emerald-500/5' : 'border-zinc-800 group-hover:border-zinc-700'}`}>
                    <p className="text-xs text-zinc-400">{file ? `✅ Selected: ${file.name}` : "Upload PDF Resume"}</p>
                  </div>
                </div>
                {file && <button onClick={() => setFile(null)} className="text-[10px] text-red-400 mt-2 hover:underline">Remove file</button>}
              </div>
              <textarea className="w-full h-48 bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-sm text-zinc-300 focus:ring-2 focus:ring-emerald-500/30 outline-none transition-all resize-none" placeholder="Or paste text..." value={text} disabled={!!file} onChange={(e) => setText(e.target.value)} />
            </div>

            {/* 📧 NEW: AUTOMATION SETTINGS */}
            <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl shadow-2xl">
              <h2 className="text-xs font-black text-purple-500 uppercase tracking-[0.2em] mb-4">3. Automation Settings (Optional)</h2>
              <p className="text-[10px] text-zinc-500 mb-4">Enter email to receive Interview Questions or a Detailed Report.</p>
              <input 
                type="email" 
                placeholder="your-email@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-300 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
              />
            </div>
          </section>

          {/* COLUMN 2: JOB DESCRIPTION */}
          <section className="space-y-6">
            <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl shadow-2xl h-full flex flex-col">
              <h2 className="text-xs font-black text-cyan-500 uppercase tracking-[0.2em] mb-6">2. Job Description</h2>
              <textarea className="flex-grow w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-sm text-zinc-300 focus:ring-2 focus:ring-cyan-500/30 outline-none transition-all resize-none min-h-[400px]" placeholder="Paste JD here to get Interview Questions on email..." value={jd} onChange={(e) => setJd(e.target.value)} />
              <button onClick={handleAnalyze} disabled={loading} className={`w-full mt-6 py-4 rounded-xl font-bold text-lg transition-all transform active:scale-95 ${loading ? "bg-zinc-800 text-zinc-500 cursor-wait" : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20"}`}>
                {loading ? "AGENT WORKING..." : "START AGENTIC FLOW"}
              </button>
            </div>
          </section>

          {/* COLUMN 3: RESULTS & AGENT LOG */}
          <section className="space-y-6">
            <div className="bg-black border border-zinc-800 p-4 rounded-2xl font-mono text-[10px] shadow-inner">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-2 h-2 rounded-full ${loading ? 'bg-emerald-500 animate-ping' : 'bg-zinc-700'}`}></div>
                <span className="text-zinc-500 uppercase tracking-widest">Agent Activity Log</span>
              </div>
              <p className={loading ? "text-emerald-400" : "text-zinc-600"}>{agentStatus || "Waiting for command..."}</p>
            </div>

            {!result && !loading && (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-zinc-800 rounded-2xl p-10 text-zinc-600 text-center bg-zinc-900/10">
                <div className="text-5xl mb-4 opacity-10">🤖</div>
                <p className="text-lg font-medium tracking-tight">Agent Standby</p>
              </div>
            )}

            {result && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 max-h-[85vh] overflow-y-auto pr-2 custom-scrollbar">
                <div className="flex justify-center">
                  <div className="px-6 py-2 bg-emerald-500/10 border-2 border-emerald-500/50 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.4em]">
                      Detected Ward: {result.domain_detected}
                    </span>
                  </div>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl relative overflow-hidden shadow-glow">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Match Score</h3>
                    <span className="text-4xl font-black text-emerald-400">{result.ats_score}%</span>
                  </div>
                  <div className="w-full bg-zinc-800 h-3 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-red-500 via-yellow-400 to-emerald-500 transition-all duration-1000" style={{ width: `${result.ats_score}%` }}></div>
                  </div>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
                  <h4 className="text-[10px] font-black text-emerald-500 mb-4 uppercase tracking-widest">Matching Skills Found</h4>
                  <div className="flex flex-wrap gap-2">
                    {result.skills.map((s, i) => <span key={i} className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded text-[10px] font-bold">{s}</span>)}
                  </div>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
                  <h4 className="text-[10px] font-black text-red-500 mb-4 uppercase tracking-widest">Missing Keywords from JD</h4>
                  <div className="flex flex-wrap gap-2">
                    {result.missing_skills.map((s, i) => <span key={i} className="px-2 py-1 bg-red-500/10 border border-red-500/20 text-red-400 rounded text-[10px] font-bold">{s}</span>)}
                  </div>
                </div>

                <div className="bg-zinc-900 border border-emerald-500/30 p-6 rounded-2xl shadow-2xl">
                  <h4 className="text-[10px] font-black text-emerald-500 mb-4 uppercase tracking-widest">Agent Clarification</h4>
                  <div className="space-y-4">
                    <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 text-[11px] text-zinc-400 italic leading-relaxed">
                      "{agentMessage}"
                    </div>
                    <div className="flex gap-2">
                      <input type="text" placeholder="Type your response..." className="flex-grow bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs outline-none focus:border-emerald-500" />
                      <button className="bg-emerald-600 px-3 py-2 rounded-lg text-[10px] font-bold">Reply</button>
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
                  <h4 className="text-[10px] font-black text-zinc-500 mb-5 uppercase tracking-widest">Tailoring Suggestions</h4>
                  <ul className="space-y-4">
                    {result.suggestions.map((s, i) => <li key={i} className="flex items-start gap-3 text-xs text-zinc-300 leading-relaxed"><span className="text-emerald-500 mt-0.5">✓</span>{s}</li>)}
                  </ul>
                </div>
              </div>
            )}
          </section>
        </div>

        {error && (
          <div className="mt-8 p-4 bg-red-950/30 border border-red-500/50 text-red-400 rounded-xl flex items-center gap-3 animate-bounce">
            <span className="text-xl">⚠</span> {error}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;