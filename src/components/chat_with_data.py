from fastapi import APIRouter, Request
from pydantic import BaseModel
from typing import List, Dict
import openai
import os

openai.api_key = os.getenv("OPENAI_API_KEY")  # Make sure to set this in your Railway env vars

router = APIRouter()

class ChatRequest(BaseModel):
    question: str
    data: List[Dict[str, str]]
    language: str = "en"

@router.post("/chat-with-data")
async def chat_with_data(req: ChatRequest):
    # Format data sample
    preview = req.data[:5]
    context = f"Here is a preview of the uploaded data (first 5 rows):\n{preview}\n"

    # Compose prompt
    if req.language == "ar":
        prompt = f"الرجاء تحليل البيانات التالية والإجابة عن السؤال: {req.question}.\n{context}"
    else:
        prompt = f"Please analyze the following data and answer the question: {req.question}.\n{context}"

    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a data analyst who can answer questions about tabular data."},
                {"role": "user", "content": prompt}
            ]
        )
        answer = response.choices[0].message.content
        return {"answer": answer.strip()}

    except Exception as e:
        return {"answer": f"Error: {str(e)}"}
