# Jarvis — AI-Powered Personal Assistant

> A full-stack AI assistant that replies to messages in my voice, plans my day, tracks placement deadlines, manages study schedules, and provides mood-aware support — built on FastAPI, React, and the Gemini API.

[![FastAPI](https://img.shields.io/badge/FastAPI-0.104-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react)](https://react.dev)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat&logo=python)](https://python.org)
[![Gemini](https://img.shields.io/badge/Gemini-API-4285F4?style=flat&logo=google)](https://aistudio.google.com)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat)](LICENSE)

---

## What is Jarvis?

Jarvis is a context-aware personal AI assistant built to solve a real problem: managing placement preparation, academic deadlines, professional communications, and personal life simultaneously as a final-year CS student.

It goes beyond a generic chatbot — Jarvis knows who I am, what my current goals are, and adapts its tone and output accordingly. It switches between 7 functional modules based on what I need, drafts replies that sound like me, and keeps track of what matters right now.

---

## Features

### 7 Functional Modules

| Module | Trigger | What it does |
|--------|---------|-------------|
| **Morning Briefing** | "brief me", "good morning Jarvis" | Daily priorities, deadlines, placement pulse, one honest nudge |
| **Day/Week Planner** | "plan my day", "plan my week" | Time-blocked schedule suggestions based on energy and constraints |
| **Deadline Tracker** | "what's due", "track this" | Organises tasks into Urgent / Upcoming / On Deck / Placement Drives |
| **Reply Assistant** | Paste any message | Drafts replies in my voice, matched to sender type (recruiter, professor, friend) |
| **Study Scheduler** | "DSA plan", "help me study" | 90-min deep work blocks anchored to placement prep roadmap |
| **Budget Tracker** | "I spent ₹X on Y" | Session-based expense tracking with honest commentary |
| **Stress Support** | "I'm overwhelmed", "I'm exhausted" | Mood-aware support — acknowledges first, then helps |

### Key Technical Features

- **Tone-matched reply generation** across 6+ sender archetypes (recruiters, professors, peers, LinkedIn, GitHub, friends)
- **Multi-turn conversation memory** — full session history passed to the model on every request
- **Context-aware reasoning** — Jarvis knows current placement targets, academic profile, active projects, and goals
- **Modular FastAPI backend** — each Jarvis module maps to a clean prompt-routing system
- **CORS-configured** for seamless React ↔ FastAPI communication
- **Environment-variable secret management** — API keys never touch the codebase

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Backend | FastAPI (Python) | REST API, request routing, Gemini integration |
| Frontend | React + Vite | Chat UI, module selector, conversation display |
| AI Model | Google Gemini API | Language model powering all Jarvis responses |
| Styling | Tailwind CSS | UI design and responsive layout |
| Deployment | Render (backend) + Vercel (frontend) | Free-tier cloud hosting |
| Version Control | Git + GitHub | Source control and CI/CD triggers |

---

## Architecture

```
User (Browser)
      │
      │  POST /jarvis  { message, history[] }
      ▼
FastAPI Backend (Render)
      │
      ├── Reads GEMINI_API_KEY from environment
      ├── Injects Jarvis system prompt (context + modules)
      ├── Appends full conversation history
      │
      ▼
Gemini API (Google)
      │
      │  Returns Jarvis response
      ▼
FastAPI → JSON { reply: "..." }
      │
      ▼
React Frontend (Vercel)
      │
      └── Renders response in chat UI
          Updates conversation history in state
```

---

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- A [Google Gemini API key](https://aistudio.google.com) (free)

### 1. Clone the repository

```bash
git clone https://github.com/Sowjanya12125/jarvis.git
cd jarvis
```

### 2. Set up the backend

```bash
cd backend
pip install -r requirements.txt
```

Create a `.env` file in the `backend/` folder:

```
GEMINI_API_KEY=your-gemini-api-key-here
```

Start the backend server:

```bash
python -m uvicorn main:app --reload
```

Backend runs at `http://localhost:8000`
API docs available at `http://localhost:8000/docs`

### 3. Set up the frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`

### 4. Test the API

Visit `http://localhost:8000/docs` and send a test request:

```json
{
  "message": "Good morning Jarvis, brief me",
  "history": []
}
```

---

## Project Structure

```
jarvis/
├── backend/
│   ├── main.py              # FastAPI app, routes, Gemini integration
│   ├── requirements.txt     # Python dependencies
│   ├── modules/
│   │   ├── reply.py         # Reply assistant logic
│   │   ├── planner.py       # Day/week planner logic
│   │   └── tracker.py       # Deadline tracker logic
│   └── .env                 # API keys (not committed to Git)
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # Root component
│   │   ├── components/
│   │   │   ├── ChatWindow.jsx
│   │   │   ├── InputBar.jsx
│   │   │   └── ModuleSelector.jsx
│   └── package.json
├── .gitignore
├── LICENSE
└── README.md
```

---

## API Reference

### `POST /jarvis`

Send a message to Jarvis.

**Request body:**
```json
{
  "message": "Plan my day — I have classes till 3pm and a DSA session planned",
  "history": [
    { "role": "user", "content": "previous message" },
    { "role": "assistant", "content": "previous reply" }
  ]
}
```

**Response:**
```json
{
  "reply": "Jarvis's response here"
}
```

### `GET /health`

Health check endpoint.

```json
{ "status": "Jarvis is online" }
```

---

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Google Gemini API key from [aistudio.google.com](https://aistudio.google.com) | Yes |

> Never commit `.env` to version control. Add it to `.gitignore`.

---

## Deployment

### Backend → Render

1. Push code to GitHub
2. Go to [render.com](https://render.com) → New Web Service → Connect repo
3. Build command: `pip install -r requirements.txt`
4. Start command: `python -m uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add `GEMINI_API_KEY` under Environment Variables

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → New Project → Import repo
2. Framework preset: Vite
3. Deploy — done

---

## What I Learned Building This

- **Prompt engineering at scale** — designing a system prompt that reliably routes across 7 modules and maintains persona consistency
- **Multi-turn conversation state** — managing session history between a stateless React frontend and a stateless backend
- **FastAPI async patterns** — handling concurrent requests efficiently with async/await
- **CORS configuration** — connecting two separate servers during development and production
- **Secret management** — keeping credentials out of version control with environment variables
- **Full-stack deployment** — separate frontend and backend deployment pipelines with free-tier providers

---

## Roadmap

- [ ] Persistent memory across sessions using a vector database (Pinecone / ChromaDB)
- [ ] WhatsApp integration via Twilio webhook
- [ ] User authentication with Clerk
- [ ] Voice input support
- [ ] Mobile-responsive PWA

---

## Author

**Sowjanya S K Susarla**
3rd Year CSE @ CBIT Hyderabad (2023–2027)

[![GitHub](https://img.shields.io/badge/GitHub-Sowjanya12125-181717?style=flat&logo=github)](https://github.com/Sowjanya12125)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-sowjanya--s--k--susarla-0A66C2?style=flat&logo=linkedin)](https://linkedin.com/in/sowjanya-s-k-susarla-498632308)

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
