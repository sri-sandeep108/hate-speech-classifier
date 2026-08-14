# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A resume/portfolio DevOps project targeting cloud and DevOps roles. It takes the DistilBERT hate
speech classifier from a separate dissertation project (`~/code/Dissertation`, a sibling directory
— spaCy notebooks that trained five text-classification architectures) and turns it into a
deployed, production-shaped system. The app itself (backend + frontend) is basically done; the
DevOps layers on top are the actual point of the project and are being built one at a time, in
this order:

1. ~~App (FastAPI + Streamlit)~~ — done
2. Containerization (Docker) — in progress, see "Current state" below
3. Kubernetes
4. Terraform (cloud deploy)
5. GitHub Actions (CI/CD)
6. Prometheus + Grafana (monitoring)

Work through these one layer at a time; don't jump ahead without checking in, since each layer is
meant to be a discrete, explainable step for interviews.

## Decisions already made (don't re-litigate without reason)

- **Separate repo from the dissertation project**, not a subfolder — keeps research
  notebooks/data separate from production app code. GitHub: `sri-sandeep108/hate-speech-classifier` (public).
- **Two Python services, no JS**: FastAPI backend (`backend/`) + Streamlit frontend (`frontend/`),
  talking over HTTP. Chosen over React/Next.js specifically to keep the stack Python-only, and
  over a single combined FastAPI+Jinja2 app because two independently deployable services gives a
  more realistic multi-service story for the later k8s/networking phases.
- **Model hosting**: the trained model (`output/distilbert/model-best`, ~265MB) is deliberately
  *not* committed to this repo. Plan is to publish it to the Hugging Face Hub (`scripts/upload_model_to_hf.py`
  is ready for this — needs `huggingface-cli login` first, not yet done) and have the backend pull
  it via `HF_MODEL_REPO` at container build/startup. Until that happens, local dev uses `MODEL_PATH`
  pointing straight at the dissertation repo's model directory.

## Architecture

- `backend/app/model.py` — `_resolve_model_path()` picks `MODEL_PATH` (local dir, for dev) over
  `HF_MODEL_REPO` (Hub download, for containers) — see docstring. `get_nlp()` is an `lru_cache`d
  singleton spaCy pipeline load; `predict()` runs it and shapes the output.
  `backend/app/model_info.py` holds static benchmark metrics (from the dissertation's
  `spacy benchmark accuracy` run) served via `GET /info` — the frontend fetches this rather than
  duplicating the numbers.
- `backend/app/main.py` — three routes: `GET /health`, `GET /info`, `POST /predict`.
- `frontend/streamlit_app.py` — single-page Streamlit app, dark/purple themed
  (`frontend/.streamlit/config.toml`), calls the backend over `API_URL`. Cards are built with
  `st.container(border=True)` — **do not** try to wrap multiple `st.*` calls in hand-written
  `<div>...</div>` markdown spanning separate `st.markdown()` calls, it doesn't nest in the real
  DOM and renders as broken empty boxes (hit this once already).
- `docker-compose.yml` — local multi-container orchestration. Backend gets the model via a
  read-only bind mount of `${HOST_MODEL_PATH:-../Dissertation/output/distilbert/model-best}`
  (i.e. assumes the dissertation repo is a sibling directory by default).

## Current state / where to pick up

- App works end-to-end locally (tested via curl + browser): backend loads the real model and
  classifies correctly, frontend renders correctly and calls the API successfully.
- Committed and pushed to GitHub, `main` branch, 2 commits so far (app layer, then Dockerfiles/compose).
- **Docker layer is written but untested.** `backend/Dockerfile` and `frontend/Dockerfile` are
  multi-stage builds (CPU-only torch for the backend specifically, to avoid pulling CUDA wheels;
  non-root `appuser` in both). `docker compose config` validates fine. But `docker compose build`
  fails locally: `permission denied while trying to connect to the docker API at
  unix:///var/run/docker.sock`. There's a real Docker daemon on this WSL2 box (not routed through
  Windows Docker Desktop — `/var/run/docker.sock` exists, owned by root), but the `sandy` user
  isn't in the `docker` group. **Next step**: user needs to run `sudo usermod -aG docker $USER`
  themselves (needs an interactive password, can't be run from here) and start a fresh shell
  (group membership changes don't apply to already-open shells), then retry
  `docker compose up --build`.
- Once containers build successfully: test both images run correctly, then decide whether to
  finally do the Hugging Face Hub upload (needed for a container that doesn't depend on a bind
  mount into the sibling dissertation repo) before moving on to Kubernetes.

## Commands

```bash
# Local (non-Docker) dev — see README.md for full venv setup per service
MODEL_PATH=/path/to/model-best uvicorn app.main:app --reload --port 8000   # from backend/
API_URL=http://localhost:8000 streamlit run streamlit_app.py               # from frontend/

# Docker (once the docker-group permission issue above is resolved)
docker compose up --build
```
