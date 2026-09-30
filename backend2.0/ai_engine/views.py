from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from common.ai_errors import AllProvidersFailedError
from designs.models import ActivityLog, Design, GenerationJob
from designs.serializers import DesignDetailSerializer, GenerateDesignInputSerializer, GenerationJobSerializer

from .tasks import generate_design_task, run_generation


def _quota_remaining(user) -> int:
    from django.conf import settings
    from django.utils import timezone

    used_today = ActivityLog.objects.filter(
        user=user, action="generated", created_at__date=timezone.localdate()
    ).count()
    return max(settings.DAILY_GENERATION_LIMIT - used_today, 0)


class GenerateDesignView(APIView):
    """
    POST /api/ai/generate/ -- called by designService.generate(formData).

    Synchronous by design: the current frontend does a single `await` and
    expects the finished design back in one response, so this runs the
    full LLM -> validate -> (optional image) -> persist pipeline inline
    rather than going through Celery. The same pipeline is also available
    as an async Celery task (see /api/ai/generate-async/) for a future
    polling-based UI without any change to this endpoint's contract.
    """

    def post(self, request):
        input_serializer = GenerateDesignInputSerializer(data=request.data)
        input_serializer.is_valid(raise_exception=True)
        data = input_serializer.validated_data

        if _quota_remaining(request.user) <= 0:
            return Response(
                {"success": False, "message": "You've used all your AI generations for today. Try again tomorrow."},
                status=status.HTTP_429_TOO_MANY_REQUESTS,
            )

        try:
            design = run_generation(request.user, data)
        except AllProvidersFailedError as exc:
            return Response(
                {"success": False, "message": f"AI generation failed: {exc}"},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        return Response(
            {
                "success": True,
                "message": "Design generated successfully.",
                "design": DesignDetailSerializer(design).data,
                "presentation": design._presentation,
            },
            status=status.HTTP_201_CREATED,
        )


class RegenerateDesignView(APIView):
    """POST /api/ai/regenerate/<pk>/ -- called by designService.regenerate(id)."""

    def post(self, request, pk):
        design = Design.objects.filter(owner=request.user, pk=pk).first()
        if not design:
            return Response({"success": False, "message": "Design not found."}, status=status.HTTP_404_NOT_FOUND)

        if _quota_remaining(request.user) <= 0:
            return Response(
                {"success": False, "message": "You've used all your AI generations for today. Try again tomorrow."},
                status=status.HTTP_429_TOO_MANY_REQUESTS,
            )

        data = {
            "room_type": design.room_type,
            "length_ft": design.length_ft,
            "width_ft": design.width_ft,
            "interior_style": design.interior_style,
            "color_palette": design.color_palette,
            "prompt": design.user_prompt,
        }

        try:
            design = run_generation(request.user, data, existing_design=design)
        except AllProvidersFailedError as exc:
            return Response(
                {"success": False, "message": f"AI generation failed: {exc}"},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        return Response(
            {
                "success": True,
                "message": "Design regenerated successfully.",
                "design": DesignDetailSerializer(design).data,
                "presentation": design._presentation,
            }
        )


class GenerateDesignAsyncView(APIView):
    """
    POST /api/ai/generate-async/ -- queues a Celery job and returns its id
    immediately. Not used by the current frontend (see GenerateDesignView),
    provided for a future polling-based "Generation Status" UI.
    """

    def post(self, request):
        input_serializer = GenerateDesignInputSerializer(data=request.data)
        input_serializer.is_valid(raise_exception=True)
        data = input_serializer.validated_data

        job = GenerationJob.objects.create(user=request.user, status="pending")
        generate_design_task.delay(job.id, request.user.id, {k: str(v) for k, v in data.items()})

        return Response(
            {"success": True, "message": "Generation queued.", "job": GenerationJobSerializer(job).data},
            status=status.HTTP_202_ACCEPTED,
        )


class GenerationStatusView(APIView):
    """GET /api/ai/status/<job_id>/ -- poll an async generation job's status."""

    def get(self, request, job_id):
        job = GenerationJob.objects.filter(user=request.user, pk=job_id).first()
        if not job:
            return Response({"success": False, "message": "Job not found."}, status=status.HTTP_404_NOT_FOUND)

        payload = {"success": True, "job": GenerationJobSerializer(job).data}
        if job.status == "completed" and job.design:
            payload["design"] = DesignDetailSerializer(job.design).data
        return Response(payload)


class PromptHistoryView(APIView):
    """GET /api/ai/history/ -- raw prompt + summary history, per the LLM engine spec."""

    def get(self, request):
        designs = Design.objects.filter(owner=request.user).order_by("-created_at")[:50]
        return Response(
            {
                "success": True,
                "history": [
                    {
                        "id": d.id,
                        "room_type": d.room_type,
                        "user_prompt": d.user_prompt,
                        "enhanced_prompt": d.enhanced_prompt,
                        "raw_prompt": d.raw_prompt,
                        "summary": d.summary,
                        "llm_provider_used": d.llm_provider_used,
                        "created_at": d.created_at,
                    }
                    for d in designs
                ],
            }
        )
