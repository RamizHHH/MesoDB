import os
from supabase import create_client, Client
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import google.genai as genai
from AI_Summary import *
from AI_Chat import *
from RelatedDinos import *
import random

load_dotenv()

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")
service_role_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
client = genai.Client()
supabase: Client = create_client(url, key)
supabase2: Client = create_client(url, service_role_key)

app = FastAPI()
WIKI_HEADERS = {
    "User-Agent": "MesoDB/1.0 (https://mesodb.vercel.app)"
}

origins = [
    "https://mesodb.vercel.app",
    "http://localhost:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/getCreature")
def get_creature(query: str = ""):
    if not query:
        response = supabase.from_('Dinosaurs').select('*').execute()
        return {"message": response.data}

    response = supabase.from_('Dinosaurs').select('*').ilike('Name', f'%{query}%').execute()

    if response.data:
        return {"message": response.data}

    response = supabase.from_('Dinosaurs').select('*').ilike('Scientific_Name', f'%{query}%').execute()

    if not response.data:
        return {"message": response.data}

    return {"message": response.data}
    

@app.get("/AISummary")
def AISummary(query: str = ""):
    return ai_summary(supabase2, client, query)


@app.get("/debug/AISummary")
def DebugAISummary(query: str = ""):
    return ai_summary(supabase2, client, query, debug=True)




@app.post("/CreatureAIChat")
def CreatureAiChat(request: CreatureAIChatRequest):
    return creature_ai_chat(supabase, client, request)


@app.get("/RelatedDinos")
def RelatedDinos(family: str = "", creatureName: str = ""):
    return getRelated(supabase2, family, creatureName)

@app.get("/getRandomCreature")
def NumofDinos():
    countAll = (
        supabase2.table("Dinosaurs").select("*", count="exact", head=True).execute()
    )

    total = countAll.count

    num = random.randint(0, total)

    response = supabase2.table("Dinosaurs").select("Name").eq("id", num).single().execute()
    return{"message": response.data}
    



if __name__ == "__main__":
    uvicorn.run("Main:app", host="0.0.0.0", port=8000, reload=True)
