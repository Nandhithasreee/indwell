"""Uniform error responses across the whole API.

Every error the frontend receives looks like:
{ "success": false, "message": "...human readable...", "errors": {...optional...} }
This matches the shape the frontend's mock services already throw
(err.response.data.message), so no page/component needs to change.
"""
from rest_framework.views import exception_handler


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is not None:
        detail = response.data
        message = "Something went wrong. Please try again."

        if isinstance(detail, dict):
            for value in detail.values():
                if isinstance(value, list) and value:
                    message = str(value[0])
                    break
                if isinstance(value, str):
                    message = value
                    break
        elif isinstance(detail, list) and detail:
            message = str(detail[0])

        response.data = {
            "success": False,
            "message": message,
            "errors": detail if isinstance(detail, dict) else None,
        }

    return response
