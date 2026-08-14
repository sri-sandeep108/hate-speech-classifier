# Hate Speech Classifier

A small web app around a DistilBERT-based hate speech classifier trained with spaCy. This repo
is the app layer of a larger DevOps portfolio project — containerization, Kubernetes, Terraform,
CI/CD, and monitoring will be layered on top in later phases.

- `backend/` — FastAPI REST API that loads the trained spaCy pipeline and exposes `POST /predict`.
- `frontend/` — Streamlit UI that calls the backend API.
- `scripts/upload_model_to_hf.py` — one-off script to publish the trained model to the Hugging
  Face Hub (used so the model doesn't have to be committed to git).

## Running locally

**Backend**

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
MODEL_PATH=/path/to/model-best uvicorn app.main:app --reload --port 8000
```

`MODEL_PATH` should point at a trained spaCy pipeline directory (e.g. the dissertation project's
`output/distilbert/model-best`). Once the model is published to the Hugging Face Hub, you can use
`HF_MODEL_REPO=<user>/<repo>` instead and it will be downloaded automatically.

**Frontend**

```bash
cd frontend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
API_URL=http://localhost:8000 streamlit run streamlit_app.py
```

## API

- `GET /health` — `{"status": "ok", "model_loaded": true}`
- `POST /predict` — body `{"text": "..."}` → `{"label": "Hateful" | "Not-Hateful", "hateful_score": float, "not_hateful_score": float}`
