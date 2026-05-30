<div align="center">

# Ξ AXIOMX

### Multi-Agent Autonomous Intelligence Engine

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=flat-square&logo=python)](https://python.org/)
[![LangGraph](https://img.shields.io/badge/LangGraph-Agents-1C3C3C?style=flat-square)](https://langchain-ai.github.io/langgraph/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker)](https://docker.com/)
[![License](https://img.shields.io/badge/License-MIT-00E5FF?style=flat-square)](LICENSE)

**A next-generation AI reasoning operating system that decomposes complex problems, deploys specialized autonomous agents, and synthesizes strategic intelligence through collaborative debate, verification, and self-critique.**

[Live Demo](#) · [Architecture](#architecture) · [Quick Start](#quick-start) · [Agents](#agent-network) · [Contributing](#contributing)

---

</div>

## 🧠 What is AXIOMX?

AXIOMX is not a chatbot. It's a **multi-agent reasoning engine** — a system where 8 specialized AI agents collaborate, debate, challenge, and verify each other's reasoning to produce deeply analyzed strategic recommendations.

When you submit a query, AXIOMX:

1. **Decomposes** the problem via the Strategic Planner (NEXUS)
2. **Researches** evidence and data via the Research Agent (CORTEX)
3. **Challenges** assumptions via the Critic Agent (VECTOR)
4. **Verifies** logic chains via the Verification Agent (AEGIS)
5. **Assesses risks** via the Risk Analyst (SENTINEL)
6. **Optimizes** the strategy via the Optimizer (PRISM)
7. **Synthesizes** a final decision via the Decision Agent (APEX)

All of this happens **in real-time**, streamed through WebSockets, with a **cinematic visualization** of the reasoning process.

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| 🤖 **8 Specialized Agents** | Each with unique personalities, reasoning styles, and visual identities |
| 🌊 **Live Reasoning Stream** | Watch agents think, debate, and challenge each other in real-time |
| 🕸️ **Interactive Reasoning Graph** | Draggable, zoomable neural visualization of thought chains |
| ⚔️ **AI Self-Critique** | Agents detect weak logic, flag contradictions, and propose alternatives |
| 📊 **Real-Time Telemetry** | Live confidence metrics, agent performance, and interaction tracking |
| 🎯 **Scenario Modes** | Business Strategy, Cybersecurity, Scientific Research, Startup, Debate, Risk, AI Decision |
| 💾 **Memory System** | Conversation persistence, reasoning history, and long-term context |
| 🎨 **Cinematic UI** | Glassmorphism, neural particle backgrounds, neon aesthetics, Framer Motion animations |

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                      AXIOMX FRONTEND                        │
│  Next.js 15 · TypeScript · Tailwind · Framer Motion         │
│  React Flow (Reasoning Graph) · Zustand (State) · Recharts  │
├──────────────────────────────────────────────────────────────┤
│                     WebSocket Layer                          │
│           Real-time reasoning event streaming                │
├──────────────────────────────────────────────────────────────┤
│                      AXIOMX BACKEND                         │
│            FastAPI · Python · SQLAlchemy                     │
├──────────────┬───────────────┬───────────────────────────────┤
│  Agent       │  Reasoning    │  Memory                       │
│  Engine      │  Pipeline     │  System                       │
│  (LangGraph) │  (WebSockets) │  (PostgreSQL)                 │
├──────────────┴───────────────┴───────────────────────────────┤
│            Infrastructure Layer                              │
│    PostgreSQL · Redis · Docker · Celery                      │
└──────────────────────────────────────────────────────────────┘
```

---

## 🤖 Agent Network

| Agent | Codename | Role | Personality |
|-------|----------|------|-------------|
| ⚡ | **NEXUS** | Strategic Planner | Methodical, visionary, decisive |
| 🔬 | **CORTEX** | Researcher | Analytical, thorough, evidence-driven |
| ⚠️ | **VECTOR** | Critic | Skeptical, sharp, uncompromising |
| ✅ | **AEGIS** | Verifier | Precise, methodical, trustworthy |
| 🛡️ | **SENTINEL** | Risk Analyst | Cautious, strategic, protective |
| 💎 | **PRISM** | Optimizer | Creative, efficient, elegant |
| 🧠 | **ARCHIVE** | Memory | Persistent, contextual, consistent |
| 🎯 | **APEX** | Decider | Authoritative, balanced, conclusive |

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Python 3.12+
- Docker & Docker Compose (for PostgreSQL & Redis)

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/axiomx.git
cd axiomx
```

### 2. Start infrastructure

```bash
docker-compose up -d postgres redis
```

### 3. Start the backend

```bash
cd api
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 4. Start the frontend

```bash
cd web
npm install
npm run dev
```

### 5. Open the platform

Navigate to **http://localhost:3000** and deploy your first reasoning session.

---

## 📁 Project Structure

```
axiomx/
├── web/                        # Next.js 15 Frontend
│   ├── src/
│   │   ├── app/                # App Router
│   │   ├── components/
│   │   │   ├── effects/        # Visual effects (Neural Background)
│   │   │   ├── layout/         # Sidebar, Header
│   │   │   ├── reasoning/      # Core reasoning UI components
│   │   │   └── agents/         # Agent Registry
│   │   ├── hooks/              # Custom hooks (WebSocket)
│   │   ├── stores/             # Zustand state management
│   │   └── types/              # TypeScript definitions
│   └── package.json
│
├── api/                        # FastAPI Backend
│   ├── app/
│   │   ├── agents/             # Multi-agent reasoning engine
│   │   ├── core/               # Configuration
│   │   ├── models/             # SQLAlchemy database models
│   │   ├── routes/             # API & WebSocket routes
│   │   └── websockets/         # Connection manager
│   ├── main.py
│   └── requirements.txt
│
├── docker-compose.yml          # Infrastructure
└── README.md
```

---

## 🎨 Design Philosophy

AXIOMX's interface is inspired by:

- **Palantir** — Intelligence platform aesthetics
- **Iron Man HUD** — Holographic information layers
- **Tesla AI** — Clean neural system design
- **DeepMind** — Scientific visualization excellence

The design system uses:
- `#050816` — Deep space background
- `#00E5FF` — Primary neon cyan
- `#3B82F6` — Accent blue
- `#67E8F9` — Glow cyan
- Glassmorphism with 20px backdrop blur
- Neural particle grid backgrounds
- Agent-specific color coding

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** — App Router, Server Components
- **TypeScript** — Strict type safety
- **Tailwind CSS** — Utility-first styling
- **Framer Motion** — Cinematic animations
- **React Flow** — Interactive reasoning graph
- **Zustand** — Lightweight state management
- **Recharts** — Data visualization

### Backend
- **FastAPI** — High-performance async API
- **Python 3.12** — Type hints, modern async
- **SQLAlchemy** — Async ORM
- **WebSockets** — Real-time streaming
- **Celery + Redis** — Task queue

### AI/ML
- **LangGraph** — Multi-agent orchestration
- **LangChain** — LLM framework
- **Local Reasoning Engine** — Works without API keys

### Infrastructure
- **Docker Compose** — One-command deployment
- **PostgreSQL 16** — Primary database
- **Redis 7** — Cache & message broker

---

## 📜 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">

**Built with obsessive attention to detail.**

*AXIOMX — Where intelligence evolves.*

</div>
