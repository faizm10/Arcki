# Arcki: AI-Powered 3D World Editor

**Overview:**
Arcki is a 3D world visualization tool that lets you reshape any location on Earth. Browse real-world 3D maps, generate custom 3D models with AI, and design urban landscapes to your imagination.

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🌍 Global Coverage | Access detailed 3D maps of any location worldwide powered by Mapbox |
| 🤖 AI 3D Generation | Transform text prompts into detailed 3D models in seconds |
| 📦 Asset Management | Import/export 3D assets (GLTF, GLB, OBJ) and save generated models |
| 🏗️ World Editing | Delete existing buildings and place your own creations on real terrain |
| 🎛️ Layer Controls | Organize designs with layer management, toggle visibility, and grouping |

## 🛠️ Tech Stack

- Next.js 16 + React 19
- Three.js / React Three Fiber
- Mapbox GL
- Tailwind CSS
- Supabase
- FastAPI

## 🚀 Getting Started

### Client

```bash
cd client
npm install
npm run dev
```

Runs on `http://localhost:3000`

### Server

```bash
cd server
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python server.py
```

Runs on `http://localhost:8000`

## ⚙️ Environment Variables

### Client (`client/.env.local`)

```env
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Server (`server/.env`)

```env
OPENAI_API_KEY=your_openai_key
FAL_KEY=your_fal_key
```

## 📖 Usage

1. Choose any location on the globe
2. Generate 3D models from text prompts or import your own
3. Place, rotate, and scale objects on the map
4. Export your designs

---
