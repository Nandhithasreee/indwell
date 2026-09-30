"""
Shared generation pipeline, called either synchronously (by GenerateDesignView,
so the current frontend -- which awaits a single response -- keeps working
unchanged) or asynchronously via the Celery task below (for a future
polling-based UI, per GET /api/ai/status/<job_id>/).
"""
import logging

from django.db import transaction

from common.ai_errors import AllProvidersFailedError
from designs.models import ActivityLog, Design, DesignVersion, GenerationJob
from image_generation.service import generate_image

from .prompt_builder import build_image_prompt, build_prompt
from .service import generate_room_design

logger = logging.getLogger(__name__)


def run_generation(user, data: dict, existing_design: Design | None = None) -> Design:
    """
    Core pipeline: prompt -> LLM -> validated JSON -> (optional) image -> persist.
    Raises AllProvidersFailedError if every configured LLM provider fails.
    """
    prompt, _dimensions = build_prompt(data)
    result, llm_provider = generate_room_design(prompt)
    presentation, scene = result["presentation"], result["scene"]

    # No budget or breakdown is collected or estimated anymore.
    image_prompt = build_image_prompt(data, presentation)
    image_url, image_provider = generate_image(image_prompt)

    with transaction.atomic():
        if existing_design is None:
            design = Design.objects.create(
                owner=user,
                room_type=data["room_type"],
                length_ft=data["length_ft"],
                width_ft=data["width_ft"],
                interior_style=data["interior_style"],
                color_palette=data.get("color_palette", ""),
                user_prompt=data.get("prompt", ""),
                raw_prompt=prompt,
                enhanced_prompt=presentation.get("enhanced_prompt", ""),
                summary=presentation["summary"],
                room_json=scene,
                image_url=image_url,
                llm_provider_used=llm_provider,
                image_provider_used=image_provider or "",
            )
            action = "generated"
        else:
            design = existing_design
            design.raw_prompt = prompt
            design.enhanced_prompt = presentation.get("enhanced_prompt", "")
            design.summary = presentation["summary"]
            design.room_json = scene
            design.image_url = image_url or design.image_url
            design.llm_provider_used = llm_provider
            design.image_provider_used = image_provider or design.image_provider_used
            design.save()
            action = "regenerated"

        DesignVersion.objects.create(design=design, room_json=scene, summary=presentation["summary"])
        ActivityLog.objects.create(user=user, design=design, action=action)

    # Attach for the view to read without a second DB round trip.
    design._presentation = presentation
    return design


try:
    from celery import shared_task
except ImportError:  # pragma: no cover - celery always installed via requirements.txt
    shared_task = None


if shared_task:

    @shared_task
    def generate_design_task(job_id: int, user_id: int, data: dict):
        from django.contrib.auth import get_user_model

        job = GenerationJob.objects.get(pk=job_id)
        job.status = "processing"
        job.save(update_fields=["status"])

        try:
            user = get_user_model().objects.get(pk=user_id)
            design = run_generation(user, data)
            job.status = "completed"
            job.design = design
            job.save(update_fields=["status", "design"])
        except AllProvidersFailedError as exc:
            job.status = "failed"
            job.error_message = str(exc)
            job.save(update_fields=["status", "error_message"])
        except Exception as exc:  # noqa: BLE001 - surface any unexpected failure to the job record
            logger.exception("Unexpected error during async generation")
            job.status = "failed"
            job.error_message = str(exc)
            job.save(update_fields=["status", "error_message"])
