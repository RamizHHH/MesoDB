
def getRelated(supabase2, family: str, name: str):
    response = supabase2.from_('Dinosaurs').select('*').eq('Family', family).neq('Name', name).execute()

    if not response.data:
        return {"message": response.data}

    return {"message": response.data}
