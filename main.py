import argparse
import asyncio
import numpy as np
from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from rfanalyze import ReaderFFT, ReaderListener
from pydantic import BaseModel
import os


# TODO: Get correct center_freq
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


@app.on_event("startup")
async def start_readerfft():
    app.state.reader_task = asyncio.create_task(readerFFT.run())
    app.state.reader_task2 = asyncio.create_task(readerListener.run())
    print("ReaderFFT tasks started.")


async def cancel_task(task, name):
    if task:
        print(f"Cancelling {name}...")
        task.cancel()
        try:
            await task
        except asyncio.CancelledError:
            print(f"{name} cancelled cleanly.")


@app.on_event("shutdown")
async def shutdown_readerfft():
    await cancel_task(app.state.reader_task, "ReaderFFT")
    await cancel_task(app.state.reader_task2, "ReaderListener")


class SettingPayload(BaseModel):
    setting: str
    value: float


@app.post("/api/set-setting")
async def button_click(setting: SettingPayload):
    response = await readerFFT.set_setting(setting.setting, setting.value)
    if setting.setting == "center_freq":
        print("Setting Center Freq")
        readerFFT.center_freq = setting.value
        readerListener.center_freq = setting.value
        # freqs = np.fft.fftshift(
        #     np.fft.fftfreq(readerFFT.fft_size, 1 / readerFFT.sample_rate)
        # ).astype(np.float32)
        # freqs += float(setting.value)
        await readerFFT.publisher.message_queue.put(setting.value)
    return {"message": f"{response}"}


class XValue(BaseModel):
    x: float


@app.post("/api/selected_x")
async def receive_x(value: XValue):
    print(f"Received x value: {value.x}")
    offset = round(value.x - readerFFT.center_freq)
    readerFFT.freq_offset = offset
    readerListener.freq_offset = offset
    # Do something with the x value (e.g. store, trigger something)
    return {"status": "ok", "x_received": value.x}
