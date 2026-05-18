import os
from supabase import create_client, Client
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import uvicorn
import google.genai as genai

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

load_dotenv()

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")
service_role_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
client = genai.Client()
supabase: Client = create_client(url, key)
supabase2 = create_client(url, service_role_key)

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
def ai_summary(query: str = ""):
    dino = get_summary_creature(query)

    if not dino:
        return {"message": "No creature found."}
    
    if dino.get("AI_Summary") is not None:
        return {"message": dino.get("AI_Summary")}
    
    prompt = build_ai_summary_prompt(dino)
    
    response = client.models.generate_content(model="gemini-3.1-flash-lite", contents=prompt)
    supabase2.from_("Dinosaurs") \
    .update({"AI_Summary": response.text}) \
    .eq("Name", dino.get("Name")) \
    .execute()
    return {"message": response.text}


@app.get("/AISummaryStream")
def ai_summary_stream(query: str = ""):
    dino = get_summary_creature(query)

    if not dino:
        return StreamingResponse(iter(["No creature found."]), media_type="text/plain")

    if dino.get("AI_Summary") is not None:
        return StreamingResponse(stream_cached_text(dino.get("AI_Summary")), media_type="text/plain")

    return StreamingResponse(stream_ai_summary(dino), media_type="text/plain")


def get_summary_creature(query):
    response = supabase.from_('Dinosaurs').select('*').ilike('Name', f'%{query}%').execute()

    if not response.data:
        response = supabase.from_('Dinosaurs').select('*').ilike('Scientific_Name', f'%{query}%').execute()

    if not response.data:
        return None

    return response.data[0]


def build_ai_summary_prompt(dino):
    return f"""
        You are a paleontology assistant.

        Give a clear, advanced but easy-to-understand summary.

        Dinosaur:
        Name: {dino.get("Name")}
        Scientific Name: {dino.get("Scientific_Name")}
        Period: {dino.get("Period")}
        Diet: {dino.get("Diet")}
        Length: {dino.get("Length")}
        Weight: {dino.get("Weight")}
        Existing Summary: {dino.get("Summary")}

        Make sure to not include any special markdown formatting in the response. Just return plain text.

        User request:
        Explain this dinosaur in more detail, including behavior, habitat, and interesting facts.
    """


def stream_cached_text(text):
    for word in text.split(" "):
        yield word + " "


def stream_ai_summary(dino):
    prompt = build_ai_summary_prompt(dino)
    summary_parts = []

    try:
        response = client.models.generate_content_stream(
            model="gemini-3.1-flash-lite",
            contents=prompt,
        )

        for chunk in response:
            if chunk.text:
                summary_parts.append(chunk.text)
                yield chunk.text

        summary = "".join(summary_parts)

        if summary:
            supabase2.from_("Dinosaurs") \
            .update({"AI_Summary": summary}) \
            .eq("Name", dino.get("Name")) \
            .execute()

    except Exception as error:
        print("Error streaming AI summary:", error)
        yield "Could not generate AI summary. Try again later."



if __name__ == "__main__":
    uvicorn.run("Main:app", host="0.0.0.0", port=8000, reload=True)
