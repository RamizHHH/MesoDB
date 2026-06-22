def ai_summary(supabase2, client, query: str = ""):
    dino = get_summary_creature(query, supabase2)
    if not dino:
        return {"message": "No creature found."}

    existing_summary = dino.get("AI_Summary")
    if existing_summary:
        return {"message": existing_summary}

    prompt = build_ai_summary_prompt(dino)
    response = client.models.generate_content(
        model="gemini-3.1-flash-lite",
        contents=prompt,
    )

    summary_text = (response.text or "").strip()
    if not summary_text:
        return {"message": "Could not generate an AI summary."}

    result = (
        supabase2.from_("Dinosaurs")
        .update({"AI_Summary": summary_text})
        .eq("id", dino.get("id"))
        .execute()
    )

    if not result.data:
        return {"message": "Failed to save AI summary to database."}

    return {"message": summary_text}


def get_summary_creature(query, supabase):
    response = supabase.from_("Dinosaurs").select("*").ilike("Name", f"%{query}%").execute()
    if not response.data:
        response = supabase.from_("Dinosaurs").select("*").ilike("Scientific_Name", f"%{query}%").execute()
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