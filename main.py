from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
import os

app = FastAPI()

# Serve static assets (JS, CSS, etc.)
app.mount("/assets", StaticFiles(directory="dist/assets"), name="assets")

# Serve index.html at root
@app.get("/")
def serve_index():
    return FileResponse("dist/index.html")
