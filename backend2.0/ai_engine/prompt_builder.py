"""
Prompt engineering layer.

This is the "intelligent prompt enhancement" step: the frontend's Generate
Design form collects room_type, length_ft, width_ft, interior_style,
color_palette, and a free-text `prompt` describing the room -- no budget
field anymore. The LLM is asked to:
  1. understand the user's short/vague prompt and rewrite it into a
     detailed, professional interior-design brief ("enhanced_prompt"),
  2. estimate a reasonable INR budget itself (since none is given), and
  3. produce the structured room JSON the existing A-Frame viewer expects.
"""

FEET_TO_METERS = 0.3048


def to_meters(feet) -> float:
    return round(float(feet) * FEET_TO_METERS, 2)


def build_prompt(data: dict) -> tuple[str, dict]:
    """
    Returns (prompt_text, dimensions_meters).
    `data` is the validated output of GenerateDesignInputSerializer.
    """
    length_m = to_meters(data["length_ft"])
    width_m = to_meters(data["width_ft"])
    height_m = 2.7  # standard ceiling height
    user_prompt = (data.get("prompt") or "").strip() or "No additional description was provided."

    dimensions = {"length_m": length_m, "width_m": width_m, "height_m": height_m}

    prompt = f"""
You are an expert interior designer and a precise 3D scene planner.

A user wants to design a {data['room_type']} and described it like this:
"{user_prompt}"

Additional constraints they gave:
- Room size: {length_m}m (length) x {width_m}m (width) x {height_m}m (height)
- Interior style: {data['interior_style']}
- Preferred color palette: {data.get('color_palette') or "designer's choice"}

Understand their intent, preserve every explicit requirement they gave, and
intelligently expand missing architectural details, materials, and mood --
even if their description was as short as "modern bedroom". Improve grammar
and add realistic interior-design terminology.

Return ONE JSON object with keys "presentation" and "scene".
Respond with ONLY the raw JSON object -- no markdown fences, no commentary.

1. "presentation" -- human-readable design details:
    - enhanced_prompt: the user's brief rewritten as a detailed, professional
      interior-design prompt (2-3 sentences), e.g. turning "modern bedroom"
      into "Design a luxurious Scandinavian-inspired master bedroom featuring
      oak wood flooring, a king-size upholstered bed, floor-to-ceiling
      windows, warm ambient lighting, indoor plants, and minimalist furniture."
    - summary: a 3-4 sentence description of the design concept

2. "scene" -- a structured room description used to render a real-time 3D scene.
   COORDINATE SYSTEM (critical, must follow exactly):
   - Units are meters. Origin (0,0,0) is the centre of the floor.
   - x axis spans the room WIDTH, from -{width_m / 2} to {width_m / 2}.
   - z axis spans the room LENGTH, from -{length_m / 2} to {length_m / 2}.
   - y axis is height, 0 = floor, {height_m} = ceiling.
   - Every furniture item must fit fully inside these bounds and must NOT overlap other items.
   - "rotation" values are degrees around each axis (usually only y matters, 0/90/180/270).

   The "scene" object must contain exactly these keys: room, walls, floor, ceiling,
   doors, windows, furniture, lighting, decorations -- following this structure:

   {{
     "room": {{"type": "{data['room_type']}", "length": {length_m}, "width": {width_m}, "height": {height_m}, "unit": "m"}},
     "walls": {{"color": "#hex", "material": "paint|wallpaper|wood_panel", "accent_wall": {{"side": "north|south|east|west|none", "color": "#hex"}}}},
     "floor": {{"material": "wood|tile|carpet|marble", "color": "#hex", "texture": "short description"}},
     "ceiling": {{"color": "#hex", "design": "short description, e.g. false ceiling with cove lighting"}},
     "doors": [{{"wall": "north|south|east|west", "position": {{"x":0,"y":0,"z":0}}, "width": 0.9, "height": 2.1}}],
     "windows": [{{"wall": "north|south|east|west", "position": {{"x":0,"y":1.2,"z":0}}, "width": 1.2, "height": 1.2}}],
     "furniture": [
       {{
         "id": "unique-slug",
         "name": "King bed",
         "category": "bed|seating|storage|table|desk|decor|plant|lighting",
         "shape": "box|cylinder|sphere|cone",
         "model_key": "optional key like 'bed_double' if a matching free GLB model likely exists, else omit",
         "position": {{"x":0,"y":0,"z":0}},
         "rotation": {{"x":0,"y":0,"z":0}},
         "dimensions": {{"x":1.6,"y":0.5,"z":2.0}},
         "color": "#hex"
       }}
     ],
     "lighting": [
       {{"type": "ambient|point|spot|directional", "position": {{"x":0,"y":2.5,"z":0}}, "color": "#hex", "intensity": 0.8}}
     ],
     "decorations": [
       {{"name": "Indoor plant", "shape": "cylinder", "model_key": "plant_fiddle_leaf", "position": {{"x":0,"y":0,"z":0}}, "rotation": {{"x":0,"y":0,"z":0}}, "dimensions": {{"x":0.4,"y":1.2,"z":0.4}}, "color": "#2f5233"}}
     ]
   }}

Include at least 6 furniture items and at least 2 decoration items appropriate for a {data['room_type']}.
""".strip()

    return prompt, dimensions


def build_image_prompt(data: dict, presentation: dict) -> str:
    """A short, purely visual prompt for the (separate) image generation provider."""
    return (
        f"A photorealistic, professionally lit interior photograph of a {data['interior_style']} "
        f"{data['room_type'].lower()}. {presentation.get('enhanced_prompt') or presentation.get('summary', '')} "
        f"Wide-angle real-estate photography style, natural light, no people, no text overlays."
    ).strip()
