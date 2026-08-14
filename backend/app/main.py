from fastapi import FastAPI, HTTPException

from app.model import get_nlp, predict
from app.model_info import MODEL_INFO
from app.schemas import HealthResponse, ModelInfoResponse, PredictRequest, PredictResponse

app = FastAPI(
    title="Hate Speech Classifier API",
    description="Serves a spaCy + DistilBERT text classification pipeline.",
    version="0.1.0",
)


@app.get("/health", response_model=HealthResponse)
def health():
    try:
        get_nlp()
        model_loaded = True
    except Exception:
        model_loaded = False
    return HealthResponse(status="ok", model_loaded=model_loaded)


@app.get("/info", response_model=ModelInfoResponse)
def info():
    return ModelInfoResponse(**MODEL_INFO)


@app.post("/predict", response_model=PredictResponse)
def run_predict(request: PredictRequest):
    try:
        result = predict(request.text)
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    return PredictResponse(**result)
