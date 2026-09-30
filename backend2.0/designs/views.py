from django.conf import settings
from django.utils import timezone
from rest_framework import status
from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import ActivityLog, Design
from .serializers import ActivityLogSerializer, DesignDetailSerializer, DesignListSerializer


class DesignListView(ListAPIView):
    """
    GET /api/designs/?saved=true -- called by designService.list(savedOnly).
    Returns a plain JSON array (no pagination wrapper), matching the mock.
    """

    serializer_class = DesignListSerializer

    def get_queryset(self):
        qs = Design.objects.filter(owner=self.request.user)
        if self.request.query_params.get("saved") == "true":
            qs = qs.filter(is_saved=True)
        return qs


class DesignDetailView(APIView):
    """GET/PATCH/DELETE /api/designs/<id>/ -- called by designService.get/remove()."""

    def get_object(self, request, pk):
        return Design.objects.filter(owner=request.user, pk=pk).first()

    def get(self, request, pk):
        design = self.get_object(request, pk)
        if not design:
            return Response({"success": False, "message": "Design not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response({"success": True, "design": DesignDetailSerializer(design).data})

    def patch(self, request, pk):
        design = self.get_object(request, pk)
        if not design:
            return Response({"success": False, "message": "Design not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = DesignDetailSerializer(design, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"success": True, "message": "Design updated.", "design": serializer.data})

    def delete(self, request, pk):
        design = self.get_object(request, pk)
        if not design:
            return Response({"success": False, "message": "Design not found."}, status=status.HTTP_404_NOT_FOUND)
        ActivityLog.objects.create(user=request.user, design=None, action="deleted")
        design.delete()
        return Response({"success": True, "message": "Design deleted."})


class ToggleSaveDesignView(APIView):
    """POST /api/designs/<id>/toggle-save/ -- called by designService.toggleSave(id)."""

    def post(self, request, pk):
        design = Design.objects.filter(owner=request.user, pk=pk).first()
        if not design:
            return Response({"success": False, "message": "Design not found."}, status=status.HTTP_404_NOT_FOUND)
        design.is_saved = not design.is_saved
        design.save(update_fields=["is_saved"])
        ActivityLog.objects.create(
            user=request.user, design=design, action="saved" if design.is_saved else "deleted"
        )
        return Response(
            {
                "success": True,
                "message": "Design saved." if design.is_saved else "Removed from saved.",
                "is_saved": design.is_saved,
            }
        )


class HistoryView(ListAPIView):
    """GET /api/designs/history/ -- called by designService.history(). Plain array response."""

    serializer_class = ActivityLogSerializer

    def get_queryset(self):
        return ActivityLog.objects.filter(user=self.request.user)


class DashboardStatsView(APIView):
    """GET /api/designs/stats/ -- called by designService.stats()."""

    def get(self, request):
        user = request.user
        designs = Design.objects.filter(owner=user)
        total = designs.count()
        saved = designs.filter(is_saved=True).count()
        generated_today = ActivityLog.objects.filter(
            user=user, action="generated", created_at__date=timezone.localdate()
        ).count()
        remaining = max(settings.DAILY_GENERATION_LIMIT - generated_today, 0)

        return Response(
            {
                "success": True,
                "stats": {
                    "total_designs": total,
                    "saved_designs": saved,
                    "remaining_generations": remaining,
                    "daily_limit": settings.DAILY_GENERATION_LIMIT,
                },
                "recent_designs": DesignListSerializer(designs[:5], many=True).data,
            }
        )
