# InDwell API Documentation

Base URL: `http://127.0.0.1:8000/api`

Every error response looks like:
```json
{ "success": false, "message": "Human readable message.", "errors": { "field": ["..."] } }
```

Authenticated endpoints require `Authorization: Bearer <access_token>`.

---

## Authentication

### `POST /api/auth/register/`
```json
// request
{ "username": "Ananya Rao", "email": "ananya@example.com", "password": "SuperSecret123" }

// response 201
{
  "success": true,
  "message": "Account created successfully.",
  "user": { "id": 1, "username": "Ananya Rao", "email": "ananya@example.com", "avatar": null,
            "phone_number": "", "theme_preference": "dark", "date_joined": "...",
            "preferences": { "preferred_style": "", "preferred_palette": "", "currency": "INR", "measurement_unit": "ft" } },
  "tokens": { "access": "eyJ...", "refresh": "eyJ..." }
}
```

### `POST /api/auth/login/`
```json
// request
{ "email": "ananya@example.com", "password": "SuperSecret123" }
// response 200 -- same shape as register
```

### `POST /api/auth/logout/`
```json
// request
{ "refresh": "eyJ..." }
// response 200
{ "success": true, "message": "Logged out successfully." }
```

### `POST /api/auth/token/refresh/`
```json
// request
{ "refresh": "eyJ..." }
// response 200
{ "access": "eyJ...", "refresh": "eyJ..." }
```

### `GET /api/auth/profile/`
```json
{ "success": true, "user": { "...": "same shape as above" } }
```

### `PATCH /api/auth/profile/`
```json
// request (any subset)
{ "username": "Ananya R.", "phone_number": "+91...", "preferences": { "preferred_style": "Scandinavian" } }
// response 200
{ "success": true, "message": "Profile updated.", "user": { "...": "..." } }
```

### `POST /api/auth/change-password/`
```json
// request
{ "old_password": "SuperSecret123", "new_password": "EvenBetter456" }
// response 200
{ "success": true, "message": "Password changed." }
```

### `POST /api/auth/forgot-password/`
```json
// request
{ "email": "ananya@example.com" }
// response 200
{ "success": true, "message": "If that account exists, a reset link was sent.", "email": "..." }
```

---

## AI (generation)

### `POST /api/ai/generate/`
The full pipeline: prompt -> LLM (with automatic provider fallback) ->
schema validation -> optional image generation -> persisted design.

```json
// request -- no budget field; the LLM estimates one itself
{
  "room_type": "Bedroom", "length_ft": 15, "width_ft": 12,
  "interior_style": "Scandinavian", "color_palette": "warm neutrals",
  "prompt": "I want a modern bedroom with wooden flooring, large windows, warm lighting, indoor plants and a cozy atmosphere."
}

// response 201
{
  "success": true,
  "message": "Design generated successfully.",
  "design": {
    "id": 1, "room_type": "Bedroom", "length_ft": "15.00", "width_ft": "12.00",
    "interior_style": "Scandinavian", "color_palette": "warm neutrals",
    "user_prompt": "I want a modern bedroom with wooden flooring...",
    "enhanced_prompt": "Design a luxurious Scandinavian-inspired master bedroom featuring oak wood flooring, a king-size upholstered bed, floor-to-ceiling windows, warm ambient lighting, and indoor plants.",
    "summary": "...", "room_json": { "room": {...}, "walls": {...}, "...": "..." },
    "budget": "150000.00", "budget_breakdown": { "furniture": 100000, "decor": 50000 },
    "maintenance_tips": "...", "image_url": null, "llm_provider_used": "groq",
    "image_provider_used": "", "is_saved": false, "created_at": "...", "updated_at": "..."
  },
  "presentation": {
    "enhanced_prompt": "...", "summary": "...", "furniture_list": [{ "name": "Bed", "purpose": "bed", "estimated_cost": 12000 }],
    "budget_breakdown": {"...": "..."}, "luxury_version": "...", "budget_version": "...", "maintenance_tips": "..."
  }
}
```
Errors: `429` (daily quota used), `502` (every configured LLM provider failed).

### `POST /api/ai/regenerate/<id>/`
Same response shape as generate, using the design's stored brief.

### `POST /api/ai/generate-async/` *(optional, not used by the current frontend)*
```json
// response 202
{ "success": true, "message": "Generation queued.", "job": { "id": 7, "status": "pending", "design": null, "error_message": "", "...": "..." } }
```

### `GET /api/ai/status/<job_id>/` *(optional)*
```json
{ "success": true, "job": { "id": 7, "status": "completed", "design": 1, "...": "..." }, "design": { "...": "full design object, only when completed" } }
```

### `GET /api/ai/history/`
Raw prompt history per the LLM engine spec (distinct from the activity feed below).
```json
{ "success": true, "history": [{ "id": 1, "room_type": "Bedroom", "user_prompt": "modern bedroom", "enhanced_prompt": "Design a luxurious...", "raw_prompt": "...", "summary": "...", "llm_provider_used": "groq", "created_at": "..." }] }
```

---

## Designs

### `GET /api/designs/?saved=true`
Returns a **plain array** (no pagination wrapper):
```json
[{ "id": 1, "room_type": "Bedroom", "interior_style": "Scandinavian", "length_ft": "15.00",
   "width_ft": "12.00", "budget": "200000.00", "is_saved": true, "image_url": null, "created_at": "..." }]
```

### `GET /api/designs/<id>/`
```json
{ "success": true, "design": { "...": "full design object, same shape as generate's design field" } }
```

### `PATCH /api/designs/<id>/` / `DELETE /api/designs/<id>/`
```json
{ "success": true, "message": "Design updated." }
{ "success": true, "message": "Design deleted." }
```

### `POST /api/designs/<id>/toggle-save/`
```json
{ "success": true, "message": "Design saved.", "is_saved": true }
```

### `GET /api/designs/history/`
Plain array of activity log entries:
```json
[{ "id": 12, "action": "generated", "design": 1, "design_room_type": "Bedroom", "created_at": "..." }]
```

### `GET /api/designs/stats/`
```json
{
  "success": true,
  "stats": { "total_designs": 3, "saved_designs": 1, "remaining_generations": 8, "daily_limit": 10 },
  "recent_designs": [{ "...": "up to 5 DesignListSerializer objects" }]
}
```

---

## Feedback

### `GET /api/feedback/` / `POST /api/feedback/`
```json
// POST request
{ "category": "feature", "rating": 5, "message": "Love the 3D viewer!" }
// POST response 201
{ "success": true, "message": "Thanks for the feedback!", "feedback": { "id": 1, "category": "feature", "rating": 5, "message": "...", "created_at": "..." } }
```

---

## System

### `GET /api/health/` *(no auth required)*
```json
{
  "success": true, "status": "ok", "database": "sqlite3",
  "llm_providers_configured": { "groq": true, "gemini": false, "openai": false, "claude": false, "ollama": false },
  "image_providers_configured": { "flux": false, "openai": false, "stability": false, "replicate": false, "fal": false },
  "image_generation_enabled": false
}
```

---

## Axios usage example (already implemented in `src/services/`)

```js
import api from "./api.js";

// api.js attaches the JWT automatically and refreshes it on 401
const { data } = await api.post("/ai/generate/", formData);
```
