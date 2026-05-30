<div align="center">

# Ξ AXIOMX

### Multi-Agent Autonomous Intelligence Engine

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=flat-square&logo=python)](https://python.org/)
[![LangGraph](https://img.shields.io/badge/LangGraph-Agents-1C3C3C?style=flat-square)](https://langchain-ai.github.io/langgraph/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker)](https://docker.com/)

**A visible computational cognition operating system from the future.**
**Powered by GPT-4o, LangGraph, and a real-time Cognitive Physics Engine.**

![AXIOMX AI Debate Arena](web/public/axiomx_debate_arena.png)

</div>

## 🧠 What is AXIOMX?

AXIOMX is not a chatbot or an AI wrapper. It's a **multi-agent reasoning engine** — a system where 8 specialized, psychologically distinct AI agents collaborate, debate, challenge, and verify each other's reasoning to produce deeply analyzed strategic recommendations.

When you submit a query, AXIOMX builds a dynamically mutating, live-streaming topology of thought using a custom **Cognitive Physics Engine**.

---

## ⚡ The Signature Mode: AI Debate Arena

AXIOMX features a viral showcase mode called the **AI Debate Arena**. 
In this mode, a high-conflict LangGraph topology is constructed to maximize disagreements. 
The Debate Arena features:
- **Contradiction Shockwaves:** Disagreements propagate visual turbulence across the network.
- **Confidence Collapse:** When assumptions are successfully challenged, node confidence metrics dynamically plummet.
- **Topology Mutation:** The graph literally fractures, branches, and reorganizes in real-time as agents fight for strategic dominance.

---

## 🏗️ Architecture & Cognitive Physics Engine

AXIOMX renders thoughts not as static text logs, but as a living physical topology.
See [Architecture Documentation](docs/architecture.md) for details on the **Cognitive Physics Engine**.

```
┌──────────────────────────────────────────────────────────────┐
│                      AXIOMX FRONTEND                        │
│  Next.js 15 · TypeScript · Tailwind · Framer Motion         │
│  React Flow (Cognitive Gravity Engine) · Zustand            │
├──────────────────────────────────────────────────────────────┤
│                     WebSocket Layer                          │
│           Token-by-Token Live Reasoning Streaming            │
├──────────────────────────────────────────────────────────────┤
│                      AXIOMX BACKEND                         │
│            FastAPI · GPT-4o · LangGraph                      │
├──────────────┬───────────────┬───────────────────────────────┤
│  Agent       │  Reasoning    │  Memory                       │
│  Psychology  │  Topology     │  System                       │
│  (LLM Core)  │  (Graph)      │  (PostgreSQL + Redis)         │
├──────────────┴───────────────┴───────────────────────────────┤
│            Production Infrastructure                         │
│    Vercel (UI) · Railway (API) · Neon (DB) · Upstash         │
└──────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start (Local Setup)

### 1. Clone & Configure
```bash
git clone https://github.com/yourusername/axiomx.git
cd axiomx
```

### 2. Infrastructure
Ensure you have Docker running.
```bash
docker-compose up -d postgres redis
```

### 3. Backend (FastAPI + LangGraph)
You must set your OpenAI API Key.
```bash
cd api
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
# Set OPENAI_API_KEY environment variable
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 4. Frontend (Next.js 15)
```bash
cd web
npm install
npm run dev
```
Navigate to **http://localhost:3000** and experience live cognition.

---

## 🚀 Production Deployment

This repository is optimized for immediate production deployment:
- **Vercel** (`web/vercel.json` included) for the frontend.
- **Railway/Render** (`api/Dockerfile` uses Gunicorn/Uvicorn workers) for the backend.
- **Neon** for PostgreSQL and **Upstash** for Redis.

---

<div align="center">

**Engineered with obsessive attention to cinematic detail and real intelligence.**

*AXIOMX — Visible Computational Cognition.*

</div>
