# InDwell Backend

Django + DRF backend for InDwell, built to plug into the **existing**
React frontend with minimal changes (see "Frontend integration" below for
exactly what changed and why).

## Architecture

```
config/            settings, urls, celery app
common/             shared exception handling, provider error types, health check
accounts/           custom User, JWT auth (register/login/logout/refresh), profile
ai_engine/           the "reasoning engine" -- LLM provider abstraction + orchestration
  providers/         GroqProvider, GeminiProvider, OpenAIProvider, ClaudeProvider, OllamaProvider
  schema.py           room JSON schema (matches the frontend's existing RoomViewer3D.jsx)
  prompt_builder.py   turns a form into an engineered prompt (+ a separate image prompt)
  service.py          generate_room_design(prompt) -- tries providers in priority
                       order, distinguishes "rate limit/quota" failures (skip to next
                       provider immediately) from "malformed response" failures
                       (retry the same provider once), validates every response
  tasks.py             shared pipeline (LLM -> image -> persist), used synchronously
                       today and available as a Celery task for later
image_generation/   entirely separate from ai_engine -- the LLM never touches pixels
  providers/         FluxProvider, OpenAIImageProvider (DALL-E), StabilityProvider, ReplicateProvider, FalProvider
  service.py          generate_image(prompt) -- same priority/fallback pattern,
                       but NEVER raises: image generation is optional and
                       non-blocking, so a missing/failed image provider never
                       breaks the core 3D generation flow
designs/             Design/DesignVersion/ActivityLog/GenerationJob models + CRUD API
feedback/            feedback API
```

## Why the LLM and image layers are separate

The LLM's only job is understanding intent and producing structured JSON
(the room schema + the human-readable presentation). It never generates
pixels. `image_generation` is a completely independent module that takes a
short visual prompt (derived from the LLM's own summary) and asks an image
provider for a photo. If no image provider is configured, or every
configured one fails, generation still succeeds -- `image_url` is just
`null`. This matches the spec's requirement that image generation "must be
completely separate from the LLM" and that "the application should work
even if only one provider is configured."

## Quick start

```bash
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# open .env and add at least one LLM key, e.g. GEMINI_API_KEY=...
python manage.py migrate
python manage.py createsuperuser   # optional, for /admin/
python manage.py runserver
```

The API is now live at `http://127.0.0.1:8000/api/`. Check
`http://127.0.0.1:8000/api/health/` to see which providers it detected.

Database is SQLite by default (zero setup) -- flip `DB_ENGINE=postgres` in
`.env` whenever the real database design is ready; no code changes needed.

## Configuring providers

You only need **one** LLM provider to run the app. Set
`LLM_PROVIDER_PRIORITY` in `.env` to control the fallback order; only
providers with a key set are actually tried. Default order:
**Groq → OpenAI → Gemini → Claude → Ollama**.

| Provider | Env var | Notes |
|---|---|---|
| Groq | `GROQ_API_KEY` | hosts Llama models, very generous free tier, extremely fast |
| OpenAI | `OPENAI_API_KEY` | also reused for DALL-E images |
| Gemini | `GEMINI_API_KEY` | Google AI Studio |
| Claude | `CLAUDE_API_KEY` | Anthropic |
| Ollama | `OLLAMA_BASE_URL` | local, e.g. `http://127.0.0.1:11434`, no key needed, never runs out of "free tokens" since it's your own machine -- a solid last resort |

### How fallback actually decides what to do

Two different failure modes are handled differently (see `ai_engine/service.py`):

- **Provider-level failure** (`ProviderCallError`) -- rate limit hit, daily
  quota exceeded, auth error, network/service outage. There's nothing a
  retry can fix, so the orchestrator skips straight to the **next**
  provider in the chain immediately. This is what makes the "stack
  providers, move to the next when today's free tokens run out" pattern
  work: if Groq's daily limit is hit, it moves to OpenAI on the very next
  call, with zero wasted retries.
- **Malformed response** (`AIProviderError` / schema validation failure)
  -- the provider responded, but the JSON was broken or didn't match the
  room schema. This is often just a formatting slip, so the **same**
  provider gets one corrective retry (with a follow-up prompt) before
  moving on.

Image generation is optional and **off by default**
(`IMAGE_GENERATION_ENABLED=False`). Turn it on and set any of
`REPLICATE_API_KEY` (powers both `replicate` and the explicit `flux`
provider) / `STABILITY_API_KEY` / `FAL_API_KEY` (or reuse `OPENAI_API_KEY`
for DALL-E) to enable it.

## The Generate Design form (current contract)

The frontend's form collects `room_type`, `length_ft`, `width_ft`,
`interior_style`, `color_palette`, and a free-text `prompt` describing the
room -- **there is no budget field**. The LLM is asked to:
1. rewrite the user's short prompt into a professional design brief
   (`enhanced_prompt`, stored on the design),
2. estimate a reasonable INR budget itself, broken down by category
   (`Design.budget` is computed as the sum of that breakdown), and
3. produce the structured room JSON the existing A-Frame viewer renders.

## Async generation (optional)

By default `CELERY_TASK_ALWAYS_EAGER=True`, so the async task machinery
exists but every request is still handled synchronously in-process --
matching the current frontend, which awaits one response. To run true
background jobs later:

```bash
# .env: CELERY_TASK_ALWAYS_EAGER=False, REDIS_URL=redis://127.0.0.1:6379/0
redis-server &
celery -A config worker -l info
```

Then `POST /api/ai/generate-async/` returns a job id immediately, and
`GET /api/ai/status/<job_id>/` polls it.

## Frontend integration

Your uploaded frontend already had two changes from the version this was
originally built against: the Generate Design form now sends
`room_type`/`length_ft`/`width_ft`/`interior_style`/`color_palette`/`prompt`
(no `budget`/`existing_furniture`/`special_requirements`), and the results
panel still shows a budget breakdown. The backend was adapted to that
exactly as it found it -- no frontend page was touched for this. Only the
service layer changed, same as before:

- `src/services/api.js` -- new file, axios instance + JWT refresh
- `src/services/authService.js` -- mock localStorage calls replaced with real requests
- `src/services/designService.js` -- same
- `src/pages/Settings.jsx` -- one line: `changePassword()` now passes the
  password fields it already collects (`changePassword(passwordForm)`),
  since the mock previously ignored them entirely
- `package.json` -- `axios` added back as a dependency

Every function in `authService`/`designService` kept its exact name and
return shape, so `AuthContext.jsx`, `Dashboard.jsx`, `GenerateDesign.jsx`,
`RoomViewerPage.jsx`, `SavedDesigns.jsx`, `History.jsx`, and `Feedback.jsx`
all work completely unchanged.

See `API_DOCUMENTATION.md` for every endpoint with request/response samples.
