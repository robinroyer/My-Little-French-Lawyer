# My Little French Lawyer - Web Application Specification

## Overview

A clean, user-friendly chat web application providing a non-technical interface to the MLFL RAG pipeline. Users can ask legal questions about French law and receive AI-powered answers backed by vector search over Legifrance documents.

## Goals

- Provide a simple, accessible interface for non-technical users
- Maintain feature parity with the CLI query tool
- Support flexible deployment (standalone or fully packaged)
- No authentication required

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | FastAPI (Python) |
| Frontend | React (minimal, functional approach) |
| Styling | Tailwind CSS |
| Vector DB | Qdrant |
| Embeddings | `BAAI/bge-small-en-v1.5` (HuggingFace) |
| LLM | Ollama or Claude (configured at container launch) |

---

## Features

### Core Chat Functionality

- **Single chat interface** - Clean, centered chat window
- **Message history** - Session-only (persists while tab is open, lost on refresh)
- **Streaming responses** - Display LLM responses as they arrive (if supported by provider)
- **RAG context** - All queries use vector search (k=3) for context retrieval

### UI Features

| Feature | Description |
|---------|-------------|
| Send message | Text input + send button (Enter to submit) |
| Clear chat | Button to reset conversation |
| Export conversation | Download chat as `.txt` or `.md` file |
| Loading indicator | Visual feedback while waiting for response |
| Auto-scroll | Chat scrolls to latest message |
| Mobile responsive | Works on phone/tablet/desktop |

### Session Management

- Sessions are browser-tab scoped (no server-side persistence)
- Conversation state stored in React state
- Export allows users to save before closing
- No cookies or local storage required

---

## API Design

### Endpoints

```
POST /api/chat
  Request:  { "message": string, "history": Message[] }
  Response: { "response": string, "sources": Source[] }

GET /api/health
  Response: { "status": "ok", "provider": "ollama|claude", "qdrant": bool }

GET /api/export
  Query:    ?format=txt|md
  Request:  { "history": Message[] }
  Response: File download
```

### Data Types

```typescript
interface Message {
  role: "user" | "assistant"
  content: string
  timestamp: string
}

interface Source {
  content: string      // Chunk text (truncated for display)
  metadata: object     // Original chunk metadata
}
```

---

## UI Mockup

```
+----------------------------------------------------------+
|                  My Little French Lawyer                  |
|                      [Clear] [Export]                     |
+----------------------------------------------------------+
|                                                          |
|  [User bubble]     What is the penalty for...?           |
|                                                          |
|  [Assistant bubble] According to Article 222-7...        |
|                     Sources: [1] [2] [3]                 |
|                                                          |
|  [User bubble]     Can you explain more about...?        |
|                                                          |
|  [Assistant bubble] [typing indicator...]                |
|                                                          |
+----------------------------------------------------------+
|  [_______________Type your question...__________] [Send] |
+----------------------------------------------------------+
```

### Design Guidelines

- **Color scheme**: Professional, muted (blues/grays) - legal/trustworthy feel
- **Typography**: Clean sans-serif, good readability
- **Spacing**: Generous whitespace, not cramped
- **Mobile**: Stack layout, full-width input on small screens

---

## Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `LLM_PROVIDER` | Yes | - | `ollama` or `claude` |
| `OLLAMA_URL` | If ollama | `http://localhost:11434` | Ollama server URL |
| `OLLAMA_MODEL` | If ollama | `qwen3:4b` | Ollama model name |
| `ANTHROPIC_API_KEY` | If claude | - | Claude API key |
| `CLAUDE_MODEL` | If claude | `claude-sonnet-4-20250514` | Claude model name |
| `QDRANT_URL` | Yes | `http://localhost:6333` | Qdrant server URL |
| `QDRANT_COLLECTION` | Yes | `law_library` | Collection name |

---

## Deployment

### Option 1: Standalone Container

For environments with existing Qdrant and LLM infrastructure.

```bash
docker run -p 8080:8080 \
  -e LLM_PROVIDER=ollama \
  -e OLLAMA_URL=http://your-ollama:11434 \
  -e OLLAMA_MODEL=qwen3:4b \
  -e QDRANT_URL=http://your-qdrant:6333 \
  mlfl-web:latest
```

**Dockerfile structure:**
```
FROM python:3.11-slim
# Install backend dependencies
# Build React frontend (multi-stage)
# Serve with uvicorn
EXPOSE 8080
```

### Option 2: Packaged Stack (docker-compose)

Complete self-contained deployment with all services.

```yaml
# docker-compose.yml
services:
  web:
    build: .
    ports:
      - "8080:8080"
    environment:
      - LLM_PROVIDER=ollama
      - OLLAMA_URL=http://ollama:11434
      - OLLAMA_MODEL=qwen3:4b
      - QDRANT_URL=http://qdrant:6333
    depends_on:
      - qdrant
      - ollama

  qdrant:
    image: qdrant/qdrant
    ports:
      - "6333:6333"
    volumes:
      - qdrant_storage:/qdrant/storage

  ollama:
    image: ollama/ollama
    ports:
      - "11434:11434"
    volumes:
      - ollama_models:/root/.ollama
    # Model downloaded on first start via entrypoint script

volumes:
  qdrant_storage:
  ollama_models:
```

**Ollama model bootstrap:**
The ollama service will use a custom entrypoint script that:
1. Starts the ollama server
2. Pulls the configured model (`qwen3:4b`) if not present
3. Keeps the server running

```bash
#!/bin/bash
ollama serve &
sleep 5
ollama pull ${OLLAMA_MODEL:-qwen3:4b}
wait
```

---

## Project Structure

```
05_serve/
├── specification.md
├── Dockerfile
├── docker-compose.yml
├── backend/
│   ├── main.py              # FastAPI app
│   ├── requirements.txt
│   ├── config.py            # Environment config
│   ├── llm.py               # LLM provider abstraction
│   └── rag.py               # Vector store / RAG logic
├── frontend/
│   ├── package.json
│   ├── tailwind.config.js
│   ├── src/
│   │   ├── App.jsx          # Main chat component
│   │   ├── components/
│   │   │   ├── ChatWindow.jsx
│   │   │   ├── MessageBubble.jsx
│   │   │   ├── InputBar.jsx
│   │   │   └── Header.jsx
│   │   └── index.css        # Tailwind imports
│   └── public/
│       └── index.html
└── scripts/
    └── ollama-entrypoint.sh
```

---

## Implementation Notes

### Backend

- Reuse logic from `03_query/query.py` (embeddings, vector store, LLM init)
- Use `langchain_qdrant`, `langchain_huggingface`, `langchain_community`, `langchain_anthropic`
- FastAPI serves both API and static React build
- Consider streaming with SSE for better UX (optional enhancement)

### Frontend

- Minimal React setup (Vite recommended for simplicity)
- No routing needed (single page)
- State: `useState` for messages, no Redux/context needed
- Fetch API for backend calls
- Tailwind for all styling (no additional CSS frameworks)

### Error Handling

- Display user-friendly error messages (not stack traces)
- Handle: LLM timeout, Qdrant unavailable, network errors
- Health endpoint for monitoring/debugging

---

## Future Enhancements (Out of Scope)

These are explicitly **not** part of v1 but noted for potential future work:

- Source document preview/expansion
- Multiple collections support
- Conversation persistence (database-backed)
- User authentication
- Rate limiting
- Feedback mechanism (thumbs up/down)
- Dark mode toggle

---

## Success Criteria

1. User can open the web app and immediately start chatting
2. Responses include relevant legal context from RAG
3. Conversation can be exported before closing
4. Works on mobile and desktop browsers
5. Both deployment options function correctly
6. Container starts and becomes functional within 2 minutes (packaged mode)
