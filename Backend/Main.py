import os
from supabase import create_client, Client
from dotenv import load_dotenv
from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import uvicorn
import google.genai as genai
from urllib.parse import urlencode
from datetime import date

app = FastAPI()
DAILY_AI_LIMIT = 10
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


class ChatMessage(BaseModel):
    role: str
    content: str


class CreatureAIChatRequest(BaseModel):
    creatureName: str = ""
    messages: list[ChatMessage]


class SignupUserRequest(BaseModel):
    name: str
    email: str
    password: str


class GoogleSignupRequest(BaseModel):
    redirectUrl: str = "http://localhost:5173"

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
def ai_summary_stream(query: str = "", authorization: str | None = Header(default=None)):
    user = get_current_user(authorization)
    dino = get_summary_creature(query)

    if not dino:
        return StreamingResponse(iter(["No creature found."]), media_type="text/plain")

    if dino.get("AI_Summary") is not None:
        return StreamingResponse(stream_cached_text(dino.get("AI_Summary")), media_type="text/plain")

    usage_check = check_and_increment_ai_usage(user.id)

    if not usage_check["allowed"]:
        return StreamingResponse(iter(["Daily AI limit reached. Try again tomorrow."]), media_type="text/plain")

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


@app.post("/CreatureAIChat")
def creature_ai_chat(
    request: CreatureAIChatRequest,
    authorization: str | None = Header(default=None),
):
    if not request.messages:
        return {"message": "Ask me a dinosaur question and I can help."}

    user = get_current_user(authorization)
    usage_check = check_and_increment_ai_usage(user.id)

    if not usage_check["allowed"]:
        return {
            "message": "Daily AI limit reached. Try again tomorrow.",
            "ai_remaining_today": 0,
        }
    
    response = supabase.from_('Dinosaurs').select('*').ilike('Name', f'%{request.creatureName}%').execute()
    dino = response.data[0] if response.data else None

    conversation = "\n".join(
        f"{message.role}: {message.content}" for message in request.messages[-8:]
    )

    prompt = f"""
        You are MesoDB AI, a friendly paleontology assistant.

        Answer questions about dinosaurs, prehistoric creatures, fossil evidence,
        time periods, diets, habitats, and behavior. Keep answers helpful,
        accurate, and easy to understand. Do not use markdown formatting.
        This is the dino we have

        Dinosaur:
        Name: {dino.get("Name") if dino else request.creatureName}
        Scientific Name: {dino.get("Scientific_Name") if dino else "Unknown"}
        Period: {dino.get("Period") if dino else "Unknown"}
        Diet: {dino.get("Diet") if dino else "Unknown"}
        Length: {dino.get("Length") if dino else "Unknown"}
        Weight: {dino.get("Weight") if dino else "Unknown"}
        Existing Summary: {dino.get("Summary") if dino else "Unavailable"}

        Conversation:
        {conversation}
    """

    try:
        response = client.models.generate_content(
            model="gemini-3.1-flash-lite",
            contents=prompt,
        )
        return {
            "message": response.text,
            "ai_remaining_today": usage_check["remaining"],
        }
    except Exception as error:
        print("Error in CreatureAIChat:", error)
        return {"message": "I could not answer right now. Try again later."}


@app.post("/Signup_User")
def signup_user(request: SignupUserRequest):
    try:
        supabase.auth.sign_up(
            {
                "email": request.email,
                "password": request.password,
                "options": {
                    "data": {
                        "name": request.name,
                    },
                },
            }
        )
        return {"message": "User signed up successfully. Check your email to confirm your account."}
    except Exception as error:
        print("Error signing up user:", error)
        return {"message": f"Error signing up user. {str(error)}"}


@app.post("/Signup_Google")
def signup_google(request: GoogleSignupRequest):
    try:
        auth_query = urlencode(
            {
                "provider": "google",
                "redirect_to": request.redirectUrl,
            }
        )
        return {"url": f"{url}/auth/v1/authorize?{auth_query}"}
    except Exception as error:
        print("Error starting Google signup:", error)
        return {"message": "Error starting Google signup. Try again later."}


@app.get("/Profile")
def profile(authorization: str | None = Header(default=None)):
    user = get_current_user(authorization)
    used_today = get_ai_usage(user.id)
    metadata = user.user_metadata or {}

    return {
        "profile": {
            "email": user.email,
            "name": metadata.get("name") or metadata.get("full_name"),
            "ai_limit": DAILY_AI_LIMIT,
            "ai_used_today": used_today,
            "ai_remaining_today": max(DAILY_AI_LIMIT - used_today, 0),
        }
    }


def get_current_user(authorization):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Login required.")

    access_token = authorization.replace("Bearer ", "", 1)

    try:
        response = supabase.auth.get_user(access_token)
        return response.user
    except Exception as error:
        print("Error getting current user:", error)
        raise HTTPException(status_code=401, detail="Invalid login.")


def get_ai_usage(user_id):
    today = date.today().isoformat()

    try:
        response = supabase2.from_("AI_Usage") \
            .select("*") \
            .eq("user_id", user_id) \
            .eq("usage_date", today) \
            .execute()

        if not response.data:
            return 0

        return response.data[0].get("usage_count", 0)
    except Exception as error:
        print("Error reading AI usage:", error)
        return 0


def check_and_increment_ai_usage(user_id):
    today = date.today().isoformat()
    current_usage = get_ai_usage(user_id)

    if current_usage >= DAILY_AI_LIMIT:
        return {"allowed": False, "remaining": 0}

    next_usage = current_usage + 1

    try:
        if current_usage == 0:
            supabase2.from_("AI_Usage").insert(
                {
                    "user_id": user_id,
                    "usage_date": today,
                    "usage_count": next_usage,
                }
            ).execute()
        else:
            supabase2.from_("AI_Usage") \
                .update({"usage_count": next_usage}) \
                .eq("user_id", user_id) \
                .eq("usage_date", today) \
                .execute()
    except Exception as error:
        print("Error updating AI usage:", error)
        raise HTTPException(status_code=500, detail="Could not update AI usage.")

    return {
        "allowed": True,
        "remaining": max(DAILY_AI_LIMIT - next_usage, 0),
    }



if __name__ == "__main__":
    uvicorn.run("Main:app", host="0.0.0.0", port=8000, reload=True)
