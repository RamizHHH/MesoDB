# MesoDB

MesoDB is a prehistoric creature database for exploring dinosaurs, marine reptiles, pterosaurs, and early mammals from the Triassic, Jurassic, and Cretaceous periods.

The app includes searchable creature pages, featured daily creatures, and AI-assisted creature explanations.

## Features

- Search prehistoric creatures by common or scientific name
- View creature pages with image, taxonomy-style stats, and summaries
- Daily featured creatures selected from each major period
- AI summary
- Responsive layout for desktop and mobile

## Tech Stack

- Frontend: React, TypeScript, Vite, React Router
- Backend: FastAPI, Python
- Database: Supabase
- AI: Google Gemini
- Hosting: Vercel for frontend, Render for backend

## Project Structure

```txt
MesoDB/
  Backend/
    Main.py
    requirements.txt
  Frontend/
    src/
    public/
    package.json
    vercel.json
```

## Local Setup

### 1. Clone the project

```bash
git clone <your-repo-url>
cd MesoDB
```

### 2. Backend setup

```bash
cd Backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Create `Backend/.env`:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_publishable_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
GEMINI_API_KEY=your_gemini_api_key
```

Run the backend:

```bash
python Main.py
```

The backend runs at:

```txt
http://localhost:8000
```

### 3. Frontend setup

Open a second terminal:

```bash
cd Frontend
npm install
```

Create `Frontend/.env.development`:

```env
VITE_API_URL=http://localhost:8000
```

Create `Frontend/.env.production`:

```env
VITE_API_URL=https://your-backend-url
```

Run the frontend:

```bash
npm run dev
```

The frontend runs at:

```txt
http://localhost:5173
```

## Status

MesoDB is actively being developed. Some creature records may be incomplete, and AI responses should be treated as helpful explanations rather than primary scientific sources.
