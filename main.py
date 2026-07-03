import os
import time
import random
from typing import Dict, List
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google import genai

load_dotenv()
API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    raise RuntimeError("GEMINI_API_KEY not found in .env")

client = genai.Client(api_key=API_KEY)

with open("jarvis_persona.txt", "r", encoding="utf-8") as f:
    JARVIS_SYSTEM_PROMPT = f.read()

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
sessions: Dict[str, List[dict]] = {} 

class QueryRequest(BaseModel):
    message: str
    session_id: str = "sowjanya-main"

FALLBACK_MODELS = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.5-flash-lite"]

def call_gemini(contents, system_prompt, max_retries=2):
    last_error = None
    for model_name in FALLBACK_MODELS:
        for attempt in range(max_retries):
            try:
                response = client.models.generate_content(
                    model=model_name,
                    contents=contents,
                    config={"system_instruction": system_prompt}
                )
                return response.text
            except Exception as e:
                last_error = e
                error_str = str(e)
                if "503" in error_str or "UNAVAILABLE" in error_str or "429" in error_str:
                    time.sleep((2 ** attempt) + random.uniform(0, 1))
                    continue
                else:
                    break  # non-retryable error, skip to next model
    raise last_error

@app.post("/chat")
def chat(req: QueryRequest):
    history = sessions.get(req.session_id, [])
    history.append({"role": "user", "parts": [{"text": req.message}]})

    try:
        reply_text = call_gemini(history, JARVIS_SYSTEM_PROMPT)
        history.append({"role": "model", "parts": [{"text": reply_text}]})
        sessions[req.session_id] = history
        return {"reply": reply_text}
    except Exception as err:
        error_message = str(err)
        print("ACTUAL ERROR:", error_message)
        return {"reply": "Jarvis is a bit overwhelmed right now (server traffic, not your fault) — try again in a few seconds."}