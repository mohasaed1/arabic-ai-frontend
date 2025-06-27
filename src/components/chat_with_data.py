# ✅ Updated FastAPI Backend (chat_with_data.py)

from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict, Optional
import openai
import os
import pandas as pd
from collections import defaultdict

openai.api_key = os.getenv("OPENAI_API_KEY")  # Railway secret

router = APIRouter()

class SmartChatRequest(BaseModel):
    message: str
    data: List[Dict[str, str]]
    history: Optional[List[Dict[str, str]]] = []

@router.post("/chat")
async def chat_with_file(req: SmartChatRequest):
    try:
        # Convert JSON data to DataFrame
        df = pd.DataFrame(req.data)
        numeric_cols = df.select_dtypes(include='number').columns.tolist()

        # Summarize data
        summary = {}
        for col in numeric_cols:
            summary[col] = {
                "sum": df[col].sum(),
                "mean": df[col].mean(),
                "min": df[col].min(),
                "max": df[col].max(),
            }

        # Add preview and summary context
        context = f"Data Preview (first 5 rows):\n{df.head().to_dict(orient='records')}\n\n"
        context += f"Column Statistics:\n{summary}\n\n"

        messages = [
            {"role": "system", "content": "You are a helpful data assistant. Analyze the data and answer user questions in the same language."},
            *req.history,
            {"role": "user", "content": context + req.message}
        ]

        # Call OpenAI
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=messages
        )

        reply = response.choices[0].message.content.strip()
        return {"reply": reply}

    except Exception as e:
        return {"reply": f"❌ Error: {str(e)}"}
