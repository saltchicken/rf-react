import argparse
import asyncio
from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from rfanalyze import ReaderFFT
import os


args = argparse.Namespace(command='fft', host='10.0.0.5', port=5000, sample_rate=2000000.0, freq_offset=-550000.0, chunk_size=4096, chunks_per_frame=16, decimation_factor=64)
readerFFT = ReaderFFT(args)
reader_task: asyncio.Task | None = None


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static assets (JS, CSS, etc.)
app.mount("/assets", StaticFiles(directory="dist/assets"), name="assets")


# Serve index.html at root
@app.get("/")
def serve_index():
    return FileResponse("dist/index.html")

@app.post("/api/button-click")
async def button_clicked():
    response = await readerFFT.set_setting("gain", 10.0)
    print(response)
    return {"message": "Button clicked!"}


@app.on_event("startup")
async def start_readerfft():
    global reader_task
    reader_task = asyncio.create_task(readerFFT.run())
    print("ReaderFFT started.")

@app.on_event("shutdown")
async def shutdown_readerfft():
    global reader_task
    if reader_task:
        print("Cancelling ReaderFFT...")
        reader_task.cancel()
        try:
            await reader_task
        except asyncio.CancelledError:
            print("ReaderFFT cancelled cleanly.")
