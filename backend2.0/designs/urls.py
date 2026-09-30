from django.urls import path

from .views import DashboardStatsView, DesignDetailView, DesignListView, HistoryView, ToggleSaveDesignView

urlpatterns = [
    path("", DesignListView.as_view(), name="design_list"),
    path("<int:pk>/", DesignDetailView.as_view(), name="design_detail"),
    path("<int:pk>/toggle-save/", ToggleSaveDesignView.as_view(), name="design_toggle_save"),
    path("history/", HistoryView.as_view(), name="design_history"),
    path("stats/", DashboardStatsView.as_view(), name="dashboard_stats"),
]
