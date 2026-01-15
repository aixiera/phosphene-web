import base64
import os
import tempfile

# Force matplotlib to non-GUI backend (important on servers)
os.environ.setdefault("MPLBACKEND", "Agg")

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pulse2percept as p2p

app = FastAPI(title="Phosphene Simulator API", version="0.1")

# CORS: allow local dev + your GitHub Pages domain
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://aixiera.github.io",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def percept_to_base64_png(percept) -> str:
    """Save percept to a temporary PNG and return base64 string."""
    with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as f:
        out_path = f.name
    try:
        percept.save(out_path)
        with open(out_path, "rb") as imgf:
            return base64.b64encode(imgf.read()).decode("utf-8")
    finally:
        try:
            os.remove(out_path)
        except OSError:
            pass

def run_one(stim_path: str, implant_name: str) -> str:
    stim = p2p.stimuli.ImageStimulus(stim_path).rgb2gray().invert()

    if implant_name == "AlphaAMS":
        implant = p2p.implants.AlphaAMS()
        model = p2p.models.ScoreboardModel(xrange=(-7, 7), yrange=(-7, 7), xystep=0.1)
    elif implant_name == "ArgusII":
        implant = p2p.implants.ArgusII()
        model = p2p.models.ScoreboardModel(xrange=(-10, 10), yrange=(-10, 10), xystep=1)
    elif implant_name == "PRIMA":
        implant = p2p.implants.PRIMA()
        model = p2p.models.ScoreboardModel(xrange=(-7, 7), yrange=(-7, 7), xystep=0.1)
    else:
        raise ValueError("Unknown implant")

    model.build()
    implant.stim = stim.resize(implant.shape)
    percept = model.predict_percept(implant)

    return percept_to_base64_png(percept)

@app.get("/health")
def health():
    return {"ok": True}

@app.post("/simulate")
async def simulate(file: UploadFile = File(...)):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Please upload an image file.")

    # Save upload to temp file
    suffix = os.path.splitext(file.filename or "")[1] or ".png"
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as f:
        in_path = f.name
        content = await file.read()
        f.write(content)

    try:
        alpha = run_one(in_path, "AlphaAMS")
        argus = run_one(in_path, "ArgusII")
        prima = run_one(in_path, "PRIMA")
        return {"AlphaAMS": alpha, "ArgusII": argus, "PRIMA": prima}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        try:
            os.remove(in_path)
        except OSError:
            pass

## To start API, use the command: python -m uvicorn app:app --reload --port 8000
## Then access at: http://localhost:8000
## API docs at: http://localhost:8000/docs