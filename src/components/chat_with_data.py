# ✅ Updated FastAPI Backend (chat_with_data.py)

from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict
import openai
import os
import pandas as pd
from collections import Counter

openai.api_key = os.getenv("OPENAI_API_KEY")

router = APIRouter()

class Message(BaseModel):
    role: str
    content: str

class SmartChatRequest(BaseModel):
    messages: List[Message]
    data: List[Dict[str, str]]

@router.post("/chat")
async def chat_with_file(req: SmartChatRequest):
    # Basic preview and insights
    df = pd.DataFrame(req.data)
    numeric_cols = df.select_dtypes(include='number').columns.tolist()

    # Basic summaries
    summaries = {}
    for col in numeric_cols:
        summaries[col] = {
            "sum": df[col].sum(),
            "mean": df[col].mean(),
            "max": df[col].max(),
            "min": df[col].min(),
        }

    context = f"Here's a preview of your data:\nColumns: {list(df.columns)}\nSummary Stats: {summaries}"

    chat_msgs = [
        {"role": m.role, "content": m.content} for m in req.messages
    ]
    chat_msgs.insert(0, {"role": "system", "content": "You are a helpful data analyst. Use the given table summary to answer user queries precisely and support Arabic too."})
    chat_msgs.insert(1, {"role": "user", "content": context})

    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=chat_msgs
        )
        reply = response.choices[0].message.content.strip()
        return {"reply": reply}
    except Exception as e:
        return {"reply": f"❌ Error: {str(e)}"}
