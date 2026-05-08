import os
from supabase import create_client, Client
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = "https://mesodb.vercel.app/"

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

load_dotenv()

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(url, key)

@app.get("/getCreature")
def get_creature(query: str):
        if query:

            response = supabase.from_('Dinosaurs').select('*').ilike('Name', f'%{query}%').execute()

            if not response.data:
                 response = supabase.from_('Dinosaurs').select('*').ilike('Scientific_Name', f'%{query}%').execute()

        else:

            response = supabase.from_('Dinosaurs').select('*').execute()

        return {"message": response.data}


