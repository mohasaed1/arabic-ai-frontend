from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict
import openai
import os

openai.api_key = os.getenv("OPENAI_API_KEY")  # Ensure it's set in Railway env

router = APIRouter()

class SmartChatRequest(BaseModel):
    message: str
    data: List[Dict[str, str]]

@router.post("/chat")
async def chat_with_file(req: SmartChatRequest):
    # Only use preview of first 5 rows
    preview = req.data[:5]
    context = f"Preview of the uploaded file (first 5 rows):\n{preview}\n"

    # Compose the prompt
    prompt = f"{context}\nNow answer this question based on the data: {req.message}"

    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful data analyst who answers user questions based on tabular data."},
                {"role": "user", "content": prompt}
            ]
        )
        reply = response.choices[0].message.content.strip()
        return {"reply": reply}
    except Exception as e:
        return {"reply": f"❌ Error: {str(e)}"}
