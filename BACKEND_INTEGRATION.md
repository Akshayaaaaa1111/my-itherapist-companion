# iTherapist Backend Integration Guide

## How the Frontend Connects to Your Python Backend

The frontend sends a `POST /chat` request to `VITE_BACKEND_URL` (defaults to `http://localhost:8000`).

### Request format
```json
{
  "user_id": "user_abc123…",
  "session_id": "uuid-session",
  "message": "I've been feeling anxious",
  "conversation_history": [
    { "role": "user",      "content": "I've been feeling anxious" },
    { "role": "assistant", "content": "Can you tell me more?" }
  ],
  "turn": 1
}
```

### Expected response format
```json
{
  "reply": "That sounds really tough. Can you tell me more about when this started?",
  "emotion": "fear",
  "severity": "high",
  "turn": 2,
  "is_final": false,
  "function_called": "ask_clarifying_question"
}
```

- `turn` should be `1`, `2`, or `3` for follow-up questions, and `4` (or more) for the final response.
- `emotion` should be one of: `joy`, `sadness`, `fear`, `anger`, `neutral`, `surprise`, `disgust`
- `severity` should be: `low`, `medium`, `high`

---

## Running Locally with Your Colab Notebook

1. **Add a FastAPI wrapper** to your Colab notebook:

```python
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    user_id: str
    session_id: str
    message: str
    conversation_history: list
    turn: int = 0

@app.post("/chat")
def chat(req: ChatRequest):
    # Call your existing run_itherapist() logic here
    result = run_itherapist_step(
        user_id=req.user_id,
        message=req.message,
        history=req.conversation_history,
        turn=req.turn,
    )
    return {
        "reply": result["reply"],
        "emotion": result["emotion"],
        "severity": result["severity"],
        "turn": result["turn"],
        "is_final": result["turn"] >= 4,
        "function_called": result.get("function_called"),
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

2. **Expose with ngrok** (in Colab):
```python
from pyngrok import ngrok
public_url = ngrok.connect(8000)
print("Backend URL:", public_url)
```

3. **Set the URL** in your Lovable project — add environment variable:
   - In the project, set `VITE_BACKEND_URL` to your ngrok/Railway URL

---

## Deploying on Railway / Render
If you deploy your Python backend to Railway or Render, set `VITE_BACKEND_URL` to the deployed URL.
