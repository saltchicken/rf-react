import argparse
import asyncio
from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from rfanalyze import ReaderFFT, ReaderListener
from pydantic import BaseModel
import os


args = argparse.Namespace(
    command="fft",
    host="10.0.0.5",
    port=5000,
    sample_rate=2000000.0,
    center_freq=1000000.0,
    freq_offset=-550000.0,
    chunk_size=4096,
    chunks_per_frame=16,
    decimation_factor=64,
    publisher_port=8767,
)
readerFFT = ReaderFFT(args)
reader_task: asyncio.Task | None = None

args = argparse.Namespace(
    command="fft",
    host="10.0.0.5",
    port=5000,
    sample_rate=2000000.0,
    center_freq=1000000.0,
    freq_offset=-550000.0,
    chunk_size=4096,
    chunks_per_frame=16,
    decimation_factor=64,
    publisher_port=8767,
)
readerListener = ReaderListener(args)
reader_task2: asyncio.Task | None = None

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


class NumberPayload(BaseModel):
    number: float


@app.post("/api/button-click")
async def button_click(payload: NumberPayload):
    response = await readerFFT.set_setting("gain", payload.number)
    return {"message": f"{response}"}


class XValue(BaseModel):
    x: float


@app.post("/api/selected_x")
async def receive_x(value: XValue):
    print(f"Received x value: {value.x}")
    readerFFT.freq_offset = round(value.x - readerFFT.center_freq)
    readerListener.freq_offset = round(value.x - readerListener.center_freq)
    # Do something with the x value (e.g. store, trigger something)
    return {"status": "ok", "x_received": value.x}


@app.on_event("startup")
async def start_readerfft():
    global reader_task
    global reader_task2
    reader_task = asyncio.create_task(readerFFT.run())
    reader_task2 = asyncio.create_task(readerListener.run())
    print("ReaderFFT started.")


@app.on_event("shutdown")
async def shutdown_readerfft():
    global reader_task
    global reader_task2
    if reader_task:
        print("Cancelling ReaderFFT...")
        reader_task.cancel()
        try:
            await reader_task
        except asyncio.CancelledError:
            print("ReaderFFT cancelled cleanly.")
    if reader_task2:
        print("Cancelling ReaderFFT...")
        reader_task2.cancel()
        try:
            await reader_task2
        except asyncio.CancelledError:
            print("ReaderFFT cancelled cleanly.")
