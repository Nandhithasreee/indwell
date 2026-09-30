"""
The single source of truth for the shape of a "room design" JSON object.

CRITICAL: this schema matches what the *existing* frontend component
(src/components/RoomViewer3D.jsx) already parses -- room/walls/floor/
ceiling/doors/windows/furniture/lighting/decorations, using {x,y,z}
vectors in meters. Every LLM provider must return exactly this shape.
We validate every response against this schema before it is ever saved
or sent to React -- LLM output is never trusted blindly.

Coordinate system (matches A-Frame / three.js, units = meters):
  - origin (0,0,0) sits at the centre of the floor
  - +x points right, +z points toward the viewer/camera start position, +y is up
  - room spans roughly [-width/2, width/2] on x and [-length/2, length/2] on z
"""

ROOM_SCHEMA = {
    "type": "object",
    "required": ["room", "walls", "floor", "ceiling", "furniture", "lighting"],
    "properties": {
        "room": {
            "type": "object",
            "required": ["type", "length", "width", "height", "unit"],
            "properties": {
                "type": {"type": "string"},
                "length": {"type": "number"},
                "width": {"type": "number"},
                "height": {"type": "number"},
                "unit": {"type": "string", "enum": ["m"]},
            },
        },
        "walls": {
            "type": "object",
            "required": ["color", "material"],
            "properties": {
                "color": {"type": "string"},
                "material": {"type": "string"},
                "accent_wall": {
                    "type": "object",
                    "properties": {
                        "side": {"type": "string", "enum": ["north", "south", "east", "west", "none"]},
                        "color": {"type": "string"},
                    },
                },
            },
        },
        "floor": {
            "type": "object",
            "required": ["material", "color"],
            "properties": {
                "material": {"type": "string"},
                "color": {"type": "string"},
                "texture": {"type": "string"},
            },
        },
        "ceiling": {
            "type": "object",
            "required": ["color"],
            "properties": {
                "color": {"type": "string"},
                "design": {"type": "string"},
            },
        },
        "doors": {
            "type": "array",
            "items": {
                "type": "object",
                "required": ["wall", "position", "width", "height"],
                "properties": {
                    "wall": {"type": "string", "enum": ["north", "south", "east", "west"]},
                    "position": {"$ref": "#/definitions/vec3"},
                    "width": {"type": "number"},
                    "height": {"type": "number"},
                },
            },
        },
        "windows": {
            "type": "array",
            "items": {
                "type": "object",
                "required": ["wall", "position", "width", "height"],
                "properties": {
                    "wall": {"type": "string", "enum": ["north", "south", "east", "west"]},
                    "position": {"$ref": "#/definitions/vec3"},
                    "width": {"type": "number"},
                    "height": {"type": "number"},
                },
            },
        },
        "furniture": {
            "type": "array",
            "items": {
                "type": "object",
                "required": ["id", "name", "category", "shape", "position", "rotation", "dimensions", "color"],
                "properties": {
                    "id": {"type": "string"},
                    "name": {"type": "string"},
                    "category": {"type": "string"},
                    "shape": {"type": "string", "enum": ["box", "cylinder", "sphere", "cone"]},
                    "model_key": {"type": "string"},
                    "position": {"$ref": "#/definitions/vec3"},
                    "rotation": {"$ref": "#/definitions/vec3"},
                    "dimensions": {"$ref": "#/definitions/vec3"},
                    "color": {"type": "string"},
                },
            },
        },
        "lighting": {
            "type": "array",
            "items": {
                "type": "object",
                "required": ["type", "position", "color", "intensity"],
                "properties": {
                    "type": {"type": "string", "enum": ["ambient", "point", "spot", "directional"]},
                    "position": {"$ref": "#/definitions/vec3"},
                    "color": {"type": "string"},
                    "intensity": {"type": "number"},
                },
            },
        },
        "decorations": {
            "type": "array",
            "items": {
                "type": "object",
                "required": ["name", "shape", "position", "color"],
                "properties": {
                    "name": {"type": "string"},
                    "shape": {"type": "string", "enum": ["box", "cylinder", "sphere", "cone"]},
                    "model_key": {"type": "string"},
                    "position": {"$ref": "#/definitions/vec3"},
                    "rotation": {"$ref": "#/definitions/vec3"},
                    "dimensions": {"$ref": "#/definitions/vec3"},
                    "color": {"type": "string"},
                },
            },
        },
    },
    "definitions": {
        "vec3": {
            "type": "object",
            "required": ["x", "y", "z"],
            "properties": {"x": {"type": "number"}, "y": {"type": "number"}, "z": {"type": "number"}},
        }
    },
}

PRESENTATION_REQUIRED_KEYS = {
    "enhanced_prompt",
    "summary",
}
