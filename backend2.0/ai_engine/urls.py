from django.urls import path

from .views import (
    GenerateDesignAsyncView,
    GenerateDesignView,
    GenerationStatusView,
    PromptHistoryView,
    RegenerateDesignView,
)

urlpatterns = [
    path("generate/", GenerateDesignView.as_view(), name="generate_design"),
    path("generate-async/", GenerateDesignAsyncView.as_view(), name="generate_design_async"),
    path("status/<int:job_id>/", GenerationStatusView.as_view(), name="generation_status"),
    path("regenerate/<int:pk>/", RegenerateDesignView.as_view(), name="regenerate_design"),
    path("history/", PromptHistoryView.as_view(), name="prompt_history"),
]
