from pydantic import BaseModel, Field


class PredictRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=2000, description="Text to classify")


class PredictResponse(BaseModel):
    label: str
    hateful_score: float
    not_hateful_score: float


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool


class BenchmarkMetrics(BaseModel):
    macro_f1: float
    macro_auc: float
    hateful_f1: float
    not_hateful_f1: float


class ModelInfoResponse(BaseModel):
    name: str
    architecture: str
    base_model: str
    labels: list[str]
    description: str
    benchmark: BenchmarkMetrics
