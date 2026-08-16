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
3. ~~Kubernetes~~ — done, see "Current state" below
4. Prometheus + Grafana (monitoring, on the local k8s cluster) — up next
5. Terraform (cloud deploy, AWS/EKS)
6. GitHub Actions (CI/CD)

Work through these one layer at a time; don't jump ahead without checking in, since each layer is
meant to be a discrete, explainable step for interviews. Order reasoning (decided 2026-08-16):
monitoring is pulled forward to right after Kubernetes because it only needs a running cluster,
not cloud infra — validating it on the free local `kind` cluster is faster to iterate on than
retrofitting observability onto cloud infra later. Terraform comes before GitHub Actions because
CI/CD only makes sense once there's a stable deploy target to automate against; building it
earlier risks doing the work twice (once for local kind, once for the eventual EKS cluster).

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
- **Kubernetes tooling**: local cluster via **kind** (chosen over minikube — lighter, Docker-only,
  config-as-code). **Terraform cloud target**: **AWS**, using **EKS** for managed Kubernetes.
  Decided 2026-08-16; see roadmap note above for why monitoring is sequenced before Terraform.

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
- `k8s/` — Kubernetes manifests, applied together via `kubectl apply -k k8s/`
  (`kustomization.yaml` lists them). `configmap.yaml` holds `HF_MODEL_REPO`/`API_URL` (mirrors the
  compose env vars); `backend.yaml` and `frontend.yaml` each bundle a Deployment + Service.
  `backend`'s Service is ClusterIP (`http://backend:8000`, resolved via k8s DNS — this is what
  `API_URL` in the ConfigMap points at); `frontend`'s Service is NodePort 30501, wired to host port
  8501 via `kind-config.yaml`'s `extraPortMappings`, so `localhost:8501` works the same as under
  Docker Compose. Backend has a `startupProbe` against `/health` with a generous
  `failureThreshold` (model download from HF Hub can take a couple of minutes cold) before
  `readinessProbe`/`livenessProbe` take over; frontend probes hit Streamlit's built-in
  `/_stcore/health`. Images are built locally (`hate-speech-backend:local`,
  `hate-speech-frontend:local`) and loaded into the `kind` cluster with `kind load docker-image`
  — no registry involved yet, that arrives with the GitHub Actions phase.

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
- **Kubernetes layer: done** (2026-08-16). Local `kind` cluster (`k8s/kind-config.yaml`, cluster
  name `hate-speech-classifier`) with backend + frontend Deployments/Services applied via
  `kubectl apply -k k8s/`. Verified end-to-end: backend pod passes its startup probe once the
  model finishes downloading, `/health` reports `model_loaded: true` through a port-forward,
  `/predict` classifies correctly, frontend is reachable at `localhost:8501` (NodePort → kind
  `extraPortMappings`) and has `API_URL=http://backend:8000` from the ConfigMap resolving via k8s
  Service DNS. One real bug hit and fixed: initial backend memory limit (1Gi) was too low and got
  `OOMKilled` loading the DistilBERT pipeline — raised to `requests: 1Gi` / `limits: 2Gi` in
  `k8s/backend.yaml`, and it now starts clean.
- **Next step**: Prometheus + Grafana on this same local `kind` cluster (`kube-prometheus-stack`
  Helm chart), including instrumenting `backend/app/main.py` with a `/metrics` endpoint since none
  exists yet. Then Terraform brings in real cloud infra (AWS/EKS), then GitHub Actions last.

## Commands

```bash
# Local (non-Docker) dev — see README.md for full venv setup per service
MODEL_PATH=/path/to/model-best uvicorn app.main:app --reload --port 8000   # from backend/
API_URL=http://localhost:8000 streamlit run streamlit_app.py               # from frontend/

# Docker
docker compose up --build

# Kubernetes (local kind cluster)
kind create cluster --config k8s/kind-config.yaml
docker build -t hate-speech-backend:local ./backend
docker build -t hate-speech-frontend:local ./frontend
kind load docker-image hate-speech-backend:local hate-speech-frontend:local --name hate-speech-classifier
kubectl apply -k k8s/
kubectl get pods                 # wait for both to be 1/1 Running
# frontend: http://localhost:8501
# backend:  kubectl port-forward svc/backend 18000:8000
```
