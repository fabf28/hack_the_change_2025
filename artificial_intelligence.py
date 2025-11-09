from pathlib import Path
from typing import Literal

from google import genai
from google.genai import types

# Your three classes (change to whatever you need)
CLASSES = ["roads", "lighting & signals", "snow & ice", "waste & sanitation"]

client = genai.Client(api_key="AIzaSyANOOrY1lo_WHP7yUzakr_6XYNZuK2gzLk")  # reads GEMINI_API_KEY env var

# JSON Schema that constrains output to exactly our three labels
response_schema = {
    "type": "object",
    "properties": {
        "filename": {"type": "string", "description": "Base name of the image file"},
        "label": {"type": "string", "enum": CLASSES, "description": "One of the allowed categories"},
        "confidence": {"type": "number", "minimum": 0, "maximum": 1}
    },
    "required": ["filename", "label", "confidence"],
    # Optional: keep a stable key order in the response
    "propertyOrdering": ["filename", "label", "confidence"]
}

def classify_image(img_bytes: bytes, filename: str, mime_type: str):
    """Classify image bytes using Gemini"""
    img_part = types.Part.from_bytes(data=img_bytes, mime_type=mime_type)

    prompt = (
        "Classify this image into exactly one of the categories: "
        f"{', '.join(CLASSES)}. "
        "Return a short confidence in [0,1]. If unsure, choose the closest fit."
    )

    resp = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=[img_part, prompt],
        config={
            "response_mime_type": "application/json",
            "response_json_schema": response_schema
        },
    )
    return resp.text

# def classify_image(path: Path):
#     # Read bytes and build an image Part
#     img_bytes = path.read_bytes()
#     img_part = types.Part.from_bytes(data=img_bytes, mime_type="image/jpeg" if path.suffix.lower() in [".jpg", ".jpeg"] else "image/png")
#
#     prompt = (
#         "Classify this image into exactly one of the categories: "
#         f"{', '.join(CLASSES)}. "
#         "Return a short confidence in [0,1]. If unsure, choose the closest fit."
#     )
#
#     resp = client.models.generate_content(
#         model="gemini-2.5-flash",   # Use Pro if you want more reasoning budget
#         contents=[img_part, prompt],
#         config={
#             "response_mime_type": "application/json",
#             "response_json_schema": response_schema
#         },
#     )
#     return resp.text  # JSON string matching our schema
#
# # Run over a folder
# image_dir = Path("images")
# results = []
# for p in sorted(image_dir.iterdir()):
#     if p.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"}:
#         results.append(classify_image(p))
#
# print("\n".join(results))
