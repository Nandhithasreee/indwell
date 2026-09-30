from rest_framework.generics import ListCreateAPIView

from .serializers import FeedbackSerializer


class FeedbackListCreateView(ListCreateAPIView):
    """GET/POST /api/feedback/ -- called by feedbackService.submit()/list()."""

    serializer_class = FeedbackSerializer

    def get_queryset(self):
        return self.request.user.feedback.all()

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        response.data = {"success": True, "message": "Thanks for the feedback!", "feedback": response.data}
        return response
