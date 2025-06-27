from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict
import pandas as pd
import openai
import os

openai.api_key = os.getenv("OPENAI_API_KEY")  # Ensure it's set in Railway env

router = APIRouter()

class SmartChatRequest(BaseModel):
    message: str
    data: List[Dict[str, str]]
    lang: str = "en"  # Language hint for better prompting

@router.post("/chat")
async def chat_with_file(req: SmartChatRequest):
    try:
        # Convert incoming data to DataFrame
        df = pd.DataFrame(req.data)

        # Try to generate summary stats to give LLM context
        summary = df.describe(include='all').to_dict()
        columns = list(df.columns)
        head_preview = df.head(5).to_dict(orient="records")

        # Prompt with advanced analysis ability
        prompt = f"""
You are a multilingual data analyst who can analyze and answer questions about tabular data in both English and Arabic.

Here is a preview of the data (first 5 rows):
{head_preview}

Here are column names:
{columns}

Here are basic statistics about the columns:
{summary}

User Question:
{req.message}

If the question requests something like total, average, max, etc., perform the appropriate calculation directly using the DataFrame.

Answer in the same language as the user.
If the data can be grouped or plotted, you may optionally recommend a column and chart type (e.g., bar, pie).
Use this format for chart hints:
Column: [column_name]
Type: [bar/pie/line]
"""

        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful and analytical AI for tabular data."},
                {"role": "user", "content": prompt}
            ]
        )

        reply = response.choices[0].message.content.strip()
        return {"reply": reply}

    except Exception as e:
        return {"reply": f"❌ Error: {str(e)}"}
