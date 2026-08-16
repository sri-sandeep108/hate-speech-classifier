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
2. ~~Containerization (Docker)~~ — done, see "Current state" below
3. Kubernetes — up next
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
  *not* committed to this repo. Published to the Hugging Face Hub as
  `thenewguyhere/hate-speech-distilbert` (public) via `scripts/upload_model_to_hf.py`, done
  2026-08-16. Containers (`docker-compose.yml`) pull it via `HF_MODEL_REPO` at startup — no bind
  mount, no dependency on the dissertation repo being checked out locally. `MODEL_PATH` still
  exists as a local-dev override (points straight at a `model-best` dir on disk) but is no longer
  required for anything, including Docker.

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
- `docker-compose.yml` — local multi-container orchestration. Backend pulls the model from the
  Hugging Face Hub at startup via `HF_MODEL_REPO=thenewguyhere/hate-speech-distilbert`.

## Current state / where to pick up

- App works end-to-end locally (tested via curl + browser): backend loads the real model and
  classifies correctly, frontend renders correctly and calls the API successfully.
- Committed and pushed to GitHub, `main` branch, 3 commits so far (app layer, Dockerfiles/compose,
  CLAUDE.md).
- **Working from a new machine as of 2026-08-16** (Linux/aarch64, not the original WSL2 box).
  `python3.12-venv` wasn't preinstalled — needed `sudo apt install python3.12-venv` once. Both
  service venvs recreated with `uv venv` + `uv pip install` (`uv` is available on this box and is
  now the preferred way to set these up — much faster than stdlib `venv`/`pip`). Note: on this
  machine the dissertation project checkout lives at `~/Dissertation`, *not* `~/code/Dissertation`
  like the CLAUDE.md/script default assumes — pass the model path explicitly if re-running
  `scripts/upload_model_to_hf.py` here.
- **Docker layer: done.** Both Dockerfiles build and run cleanly on this machine (docker-group
  permission issue from the old WSL2 box doesn't apply here — `sandy` was already in the `docker`
  group). Full `docker compose up` verified end-to-end: backend pulls the model from
  `HF_MODEL_REPO` on startup, `/health` reports `model_loaded: true`, `/predict` returns correct
  classifications, frontend serves and calls the backend successfully.
- **Hugging Face Hub upload done** (2026-08-16) — see "Model hosting" above. This removed the last
  reason `docker-compose.yml` needed a bind mount into a sibling dissertation checkout, so that's
  been deleted from the compose file; `HOST_MODEL_PATH` no longer exists as a variable.
- **Next step**: containerization phase is complete. Move on to Kubernetes — manifests for
  backend/frontend Deployments + Services, likely a ConfigMap for `HF_MODEL_REPO`/`API_URL`, and
  probably a local cluster (kind/minikube) to test against before Terraform brings in real cloud
  infra.

## Commands

```bash
# Local (non-Docker) dev — see README.md for full venv setup per service
MODEL_PATH=/path/to/model-best uvicorn app.main:app --reload --port 8000   # from backend/
API_URL=http://localhost:8000 streamlit run streamlit_app.py               # from frontend/

# Docker
docker compose up --build
```
