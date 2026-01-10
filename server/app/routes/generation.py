import time
import uuid
from fastapi import APIRouter, HTTPException, BackgroundTasks

from ..services import OpenAIService, FalService
from ..schemas import (
    PromptCleanRequest,
    PromptCleanResponse,
    ImageGenerateRequest,
    ImageGenerateResponse,
    TrellisRequest,
    TrellisResponse,
    PipelineRequest,
    PipelineResponse,
    JobStatus,
)

router = APIRouter(tags=["Generation"])

# In-memory job storage (use Redis for production)
jobs: dict[str, JobStatus] = {}


# =============================================================================
# Individual Stage Endpoints
# =============================================================================

@router.post("/clean-prompt", response_model=PromptCleanResponse)
async def clean_prompt(request: PromptCleanRequest):
    """
    Clean and enhance user prompt for architectural 3D generation.
    Uses GPT-4 to create optimized prompts for DALL-E.
    """
    openai_svc = OpenAIService()
    if not openai_svc.is_configured:
        raise HTTPException(status_code=503, detail="OpenAI not configured. Set OPENAI_API_KEY.")

    try:
        return await openai_svc.clean_prompt(request.prompt, request.style)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prompt cleaning failed: {e}")


@router.post("/generate-image", response_model=ImageGenerateResponse)
async def generate_image(request: ImageGenerateRequest):
    """
    Generate architectural 2D images using DALL-E 3.
    Can generate multiple views for multi-image Trellis mode.
    """
    openai_svc = OpenAIService()
    if not openai_svc.is_configured:
        raise HTTPException(status_code=503, detail="OpenAI not configured. Set OPENAI_API_KEY.")

    try:
        return await openai_svc.generate_images(
            prompt=request.prompt,
            num_images=request.num_images,
            size=request.size,
            quality=request.quality,
            style=request.style
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image generation failed: {e}")


@router.post("/generate-3d", response_model=TrellisResponse)
async def generate_3d(request: TrellisRequest):
    """
    Generate 3D model from image(s) using fal.ai Trellis.
    Outputs GLB format with PBR textures.
    """
    fal_svc = FalService()
    if not fal_svc.is_configured:
        raise HTTPException(status_code=503, detail="fal.ai not configured. Set FAL_KEY.")

    if not request.image_url and not request.image_urls:
        raise HTTPException(status_code=400, detail="Must provide image_url or image_urls")

    try:
        return await fal_svc.generate_3d(
            image_url=request.image_url,
            image_urls=request.image_urls,
            use_multi=request.use_multi,
            seed=request.seed,
            texture_size=request.texture_size,
            mesh_simplify=request.mesh_simplify,
            ss_guidance_strength=request.ss_guidance_strength,
            slat_guidance_strength=request.slat_guidance_strength
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"3D generation failed: {e}")


# =============================================================================
# Full Pipeline
# =============================================================================

@router.post("/generate-architecture", response_model=PipelineResponse)
async def generate_architecture(request: PipelineRequest):
    """
    Full pipeline: Text prompt → Clean → DALL-E 2D → Trellis 3D GLB

    This is the main endpoint for architecture generation.
    For better quality, use num_views=2-4 with high_quality=True.
    """
    openai_svc = OpenAIService()
    fal_svc = FalService()

    if not openai_svc.is_configured:
        raise HTTPException(status_code=503, detail="OpenAI not configured")
    if not fal_svc.is_configured:
        raise HTTPException(status_code=503, detail="fal.ai not configured")

    job_id = uuid.uuid4().hex
    start_time = time.time()
    stages = {}

    try:
        # Stage 1: Clean prompt
        stage_start = time.time()
        clean_result = await openai_svc.clean_prompt(request.prompt, request.style)
        stages["prompt_cleaning"] = time.time() - stage_start

        # Stage 2: Generate images
        stage_start = time.time()
        image_result = await openai_svc.generate_images(
            prompt=clean_result.dalle_prompt,
            num_images=request.num_views,
            quality="hd" if request.high_quality else "standard"
        )
        stages["image_generation"] = time.time() - stage_start

        # Stage 3: Generate 3D
        stage_start = time.time()
        use_multi = request.num_views > 1 and len(image_result.images) > 1

        trellis_result = await fal_svc.generate_3d(
            image_url=image_result.images[0] if not use_multi else None,
            image_urls=image_result.images if use_multi else None,
            use_multi=use_multi,
            texture_size=request.texture_size
        )
        stages["3d_generation"] = time.time() - stage_start

        return PipelineResponse(
            job_id=job_id,
            status="completed",
            original_prompt=request.prompt,
            cleaned_prompt=clean_result.cleaned_prompt,
            dalle_prompt=clean_result.dalle_prompt,
            image_urls=image_result.images,
            model_url=trellis_result.model_url,
            model_file=trellis_result.file_name,
            download_url=f"/download/{trellis_result.file_name}",
            total_time=time.time() - start_time,
            stages=stages
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pipeline failed: {e}")


# =============================================================================
# Async Pipeline
# =============================================================================

async def _run_pipeline_async(job_id: str, request: PipelineRequest):
    """Background task for async pipeline execution."""
    openai_svc = OpenAIService()
    fal_svc = FalService()

    jobs[job_id] = JobStatus(
        job_id=job_id,
        status="pending",
        progress=0,
        message="Starting pipeline..."
    )

    try:
        # Stage 1
        jobs[job_id].status = "cleaning_prompt"
        jobs[job_id].progress = 10
        jobs[job_id].message = "Cleaning prompt with AI..."

        clean_result = await openai_svc.clean_prompt(request.prompt, request.style)

        # Stage 2
        jobs[job_id].status = "generating_images"
        jobs[job_id].progress = 30
        jobs[job_id].message = "Generating 2D images with DALL-E..."

        image_result = await openai_svc.generate_images(
            prompt=clean_result.dalle_prompt,
            num_images=request.num_views,
            quality="hd" if request.high_quality else "standard"
        )

        # Stage 3
        jobs[job_id].status = "generating_3d"
        jobs[job_id].progress = 60
        jobs[job_id].message = "Generating 3D model with Trellis..."

        use_multi = request.num_views > 1 and len(image_result.images) > 1

        trellis_result = await fal_svc.generate_3d(
            image_url=image_result.images[0] if not use_multi else None,
            image_urls=image_result.images if use_multi else None,
            use_multi=use_multi,
            texture_size=request.texture_size
        )

        # Complete
        jobs[job_id].status = "completed"
        jobs[job_id].progress = 100
        jobs[job_id].message = "3D model ready!"
        jobs[job_id].result = PipelineResponse(
            job_id=job_id,
            status="completed",
            original_prompt=request.prompt,
            cleaned_prompt=clean_result.cleaned_prompt,
            dalle_prompt=clean_result.dalle_prompt,
            image_urls=image_result.images,
            model_url=trellis_result.model_url,
            model_file=trellis_result.file_name,
            download_url=f"/download/{trellis_result.file_name}",
            total_time=0,
            stages={}
        )

    except Exception as e:
        jobs[job_id].status = "failed"
        jobs[job_id].progress = 0
        jobs[job_id].message = f"Error: {e}"


@router.post("/generate-architecture-async")
async def generate_architecture_async(
    request: PipelineRequest,
    background_tasks: BackgroundTasks
):
    """
    Async version of the full pipeline.
    Returns immediately with a job_id to poll for status.
    """
    openai_svc = OpenAIService()
    fal_svc = FalService()

    if not openai_svc.is_configured:
        raise HTTPException(status_code=503, detail="OpenAI not configured")
    if not fal_svc.is_configured:
        raise HTTPException(status_code=503, detail="fal.ai not configured")

    job_id = uuid.uuid4().hex
    background_tasks.add_task(_run_pipeline_async, job_id, request)

    return {
        "job_id": job_id,
        "status": "started",
        "poll_url": f"/job/{job_id}"
    }


@router.get("/job/{job_id}", response_model=JobStatus)
async def get_job_status(job_id: str):
    """Get status of an async generation job."""
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    return jobs[job_id]
