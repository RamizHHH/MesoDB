from pydantic import BaseModel

class ChatMessage(BaseModel):
    role: str
    content: str

class CreatureAIChatRequest(BaseModel):
    creatureName: str = ""
    messages: list[ChatMessage]


def creature_ai_chat(supabase, client, request: CreatureAIChatRequest):
    if not request.messages:
        return {"message": "Ask me a dinosaur question and I can help."}
    
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
        return {"message": response.text}
    except Exception as error:
        print("Error in CreatureAIChat:", error)
        return {"message": "I could not answer right now. Try again later."}
