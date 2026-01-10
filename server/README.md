# Delta Architecture 3D Generation Server

Full-stack architecture 3D generation pipeline: **Text → OpenAI Clean → DALL-E 2D → fal.ai Trellis 3D**

## Features

- **Text-to-3D Pipeline**: Describe a building → Get a 3D model
- **AI Prompt Enhancement**: GPT-4 optimizes prompts for architectural visualization
- **High-Quality 2D Generation**: DALL-E 3 creates photorealistic renders
- **Multi-View Support**: Generate 1-4 views for better 3D reconstruction
- **fal.ai Trellis**: State-of-the-art image-to-3D conversion
- **GLB Output**: Universal 3D format with PBR textures
- **Async Jobs**: Background processing with status polling

## Quick Start

### 1. Install Dependencies

```bash
cd server
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your API keys
```

Required keys:
- `OPENAI_API_KEY` - Get from [OpenAI Platform](https://platform.openai.com/api-keys)
- `FAL_KEY` - Get from [fal.ai Dashboard](https://fal.ai/dashboard/keys)

### 3. Run the Server

```bash
python server.py
```

Server starts on `http://localhost:8000`

## API Endpoints

### Main Pipeline

#### `POST /generate-architecture`
Full synchronous pipeline: text → 2D → 3D

```bash
curl -X POST "http://localhost:8000/generate-architecture" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Classic Parisian Haussmann building with ornate balconies",
    "style": "classical",
    "num_views": 2,
    "texture_size": 1024,
    "high_quality": true
  }'
```

#### `POST /generate-architecture-async`
Async version - returns job ID for polling

```bash
# Start job
curl -X POST "http://localhost:8000/generate-architecture-async" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Modern glass skyscraper", "num_views": 1}'

# Poll status
curl "http://localhost:8000/job/{job_id}"
```

### Individual Stages

#### `POST /clean-prompt`
Clean and enhance prompt with GPT-4

#### `POST /generate-image`
Generate 2D images with DALL-E 3

#### `POST /generate-3d`
Generate 3D model with fal.ai Trellis

### Direct Upload

#### `POST /upload-and-generate`
Upload existing image → 3D model

```bash
curl -X POST "http://localhost:8000/upload-and-generate" \
  -F "file=@building.jpg"
```

### Utility

- `GET /` - Server info
- `GET /health` - Health check
- `GET /download/{filename}` - Download GLB file
- `DELETE /cleanup` - Clean up files

## Pipeline Flow

```
User Text Prompt
       ↓
┌──────────────────────────────────────┐
│  Stage 1: OpenAI GPT-4               │
│  - Clean prompt                      │
│  - Generate DALL-E optimized prompt  │
│  - Extract style tags                │
└──────────────────────────────────────┘
       ↓
┌──────────────────────────────────────┐
│  Stage 2: OpenAI DALL-E 3            │
│  - Generate 1-4 architectural views  │
│  - HD quality, 1024x1024             │
│  - Natural photorealistic style      │
└──────────────────────────────────────┘
       ↓
┌──────────────────────────────────────┐
│  Stage 3: fal.ai Trellis             │
│  - Single or multi-image input       │
│  - 3D reconstruction                 │
│  - GLB output with PBR textures      │
└──────────────────────────────────────┘
       ↓
    GLB File
```

## Configuration Options

### Styles
- `architectural` - Realistic architectural visualization
- `modern` - Contemporary glass/steel design
- `classical` - Traditional elements, columns, ornate
- `futuristic` - Innovative shapes, sustainable tech

### Texture Size
- `512` - Fast, lower quality
- `1024` - Balanced (default)
- `2048` - High quality, slower

### Number of Views
- `1` - Single view, fastest
- `2-4` - Multi-view, better 3D quality

## Costs

| Service | Cost |
|---------|------|
| OpenAI GPT-4 | ~$0.01/prompt |
| OpenAI DALL-E 3 HD | ~$0.08/image |
| fal.ai Trellis | ~$0.02/model |

**Total per model**: ~$0.10-0.40 depending on views

## Performance

| Stage | Time |
|-------|------|
| Prompt cleaning | 1-2s |
| Image generation | 10-20s per view |
| 3D generation | 15-30s |

**Total**: ~30-90 seconds depending on views

## Output Format

GLB files include:
- Optimized mesh geometry
- PBR materials (roughness, metallic, normal maps)
- UV-mapped textures

Compatible with:
- Mapbox GL JS (native model layer)
- Three.js / React Three Fiber
- Blender
- Any glTF 2.0 viewer

## Troubleshooting

### "OpenAI not configured"
Set `OPENAI_API_KEY` in your environment or `.env` file

### "fal.ai not configured"
Set `FAL_KEY` in your environment or `.env` file

### "DALL-E rejected prompt"
The prompt may contain content policy violations. Try rephrasing.

### Slow generation
- Reduce `num_views` to 1
- Use `high_quality: false`
- Use smaller `texture_size`

## Development

Interactive API docs available at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
