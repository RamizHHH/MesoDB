import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(url, key)

def main():
    dino = input("What dinosaur do you want to know about? ")
    response = (
        supabase.table("Dinosaurs")
        .select("*")
        .text_search("Name", f"{dino}")
        .execute()
    )
    if response.data:
        dino_info = response.data[0]
        print(f"Name: {dino_info['Name']}")
        print(f"Period: {dino_info['Period']}")
        print(f"Diet: {dino_info['Diet']}")
    else:
        print("Dinosaur not found.")

if __name__ == "__main__":
    main()