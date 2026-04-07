# Project Requirements & Dependencies

This project follows a **Zero-Trust Dependency Policy** (April 2026) to ensure security against recent supply chain compromises. All versions are pinned to audited, stable releases.

## 🐍 Backend (Python 3.10+)
| Library | Version | Purpose |
| :--- | :--- | :--- |
| **fastapi** | `0.110.0` | High-performance web framework |
| **langgraph** | `0.0.32` | Multi-agent state orchestration |
| **langchain-groq** | `0.1.3` | Llama 3.3 Inference integration |
| **langchain-google-genai** | `1.0.1` | Gemini 2.5 fallback integration |
| **httpx** | `0.28.1` | **Patched** secure HTTP client |
| **pypdf** | `4.1.0` | Secure PDF text extraction |
| **python-dotenv** | `1.0.1` | Environment variable management |
| **uvicorn** | `0.27.1` | ASGI server |

## 📦 Frontend (Node.js v20.20.2)
| Package | Version | Purpose |
| :--- | :--- | :--- |
| **react** | `18.2.0` | UI Library |
| **tailwindcss** | `3.4.1` | **Audited** CSS framework |
| **vite** | `5.2.0` | Build tool |
| **postcss** | `8.4.38` | CSS processing |
| **autoprefixer** | `10.4.19` | CSS vendor prefixing |

## 🤖 External Services
- **Groq Cloud:** Llama 3.3 70B (Primary Brain)
- **Google AI Studio:** Gemini 2.5 Flash (Fallback)
- **Supabase:** PostgreSQL Database (REST API)
- **n8n Cloud:** Autonomous Workflow Automation