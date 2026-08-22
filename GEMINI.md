# GEMINI.md

This file provides guidance and project context for Gemini (Antigravity) when working with code in this repository.

---

## 1. Project Overview & Objective

This is a portfolio DevOps/MLOps project targeting cloud and DevOps engineering roles. It takes a trained DistilBERT hate speech classifier (originally developed in a separate research/dissertation project `~/Dissertation` using spaCy notebooks) and operationalizes it into a production-shaped, observable, cloud-native system.

### Layer-by-Layer Roadmap
The DevOps layers are constructed incrementally in discrete, explainable steps:

1. [x] **Layer 1: App (FastAPI + Streamlit)** — Fully working Python-only multi-service app.
2. [x] **Layer 2: Containerization (Docker & Compose)** — Multi-container setup with Hugging Face Hub model download.
3. [x] **Layer 3: Kubernetes (Local `kind` manifests)** — Deployments, Services, ConfigMaps, Probes, Resource constraints.
4. [x] **Layer 4: Observability (Prometheus + Grafana)** — `kube-prometheus-stack`, custom FastAPI & spaCy metrics, auto-imported Grafana dashboard.
5. [x] **Layer 5: Terraform (AWS / EKS)** — Complete VPC, EKS cluster (v1.31), Managed Node Groups, IAM + OIDC, ECR repositories with lifecycle policies.
6. [x] **Layer 6: CI/CD (GitHub Actions)** — Fully automated lint/test, multi-platform container build, Amazon ECR push, and AWS EKS rollout pipeline.


> **Sequencing Rationale**:
> - Monitoring was completed locally on `kind` *before* cloud infrastructure to rapidly validate observability with zero cloud spend and no retrofitting overhead.
> - Terraform comes *before* GitHub Actions because CI/CD requires a stable cloud target (EKS + ECR) to automate deployments against.

---

## 2. Key Architecture & Design Decisions (Do Not Re-litigate)

- **Repository Separation**: Standalone repo (`sri-sandeep108/hate-speech-classifier`) to decouple production deployment code from dissertation research notebooks.
- **Python-Only Architecture**: FastAPI backend (`backend/`) + Streamlit frontend (`frontend/`) communicating over HTTP. Avoids frontend JavaScript frameworks while preserving realistic multi-service networking.
- **Model Distribution (Hugging Face Hub)**:
  - The trained DistilBERT spaCy pipeline (~265MB) is hosted publicly at [`thenewguyhere/hate-speech-distilbert`](https://huggingface.co/thenewguyhere/hate-speech-distilbert).
  - Runtime containers fetch the model dynamically via `HF_MODEL_REPO` at startup (no local bind mount or weights in git).
  - `MODEL_PATH` remains supported as a local development override to point directly to disk.
- **Kubernetes Strategy**:
  - Local dev: `kind` (Kubernetes in Docker).
  - Production target: **AWS EKS** provisioned via **Terraform**.

---

## 3. Directory Layout & Key Components

```
hate-speech-classifier/
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI entrypoint, routes (/health, /info, /predict), metrics instrumentation
│   │   ├── model.py           # Model loader (HF Hub / local), singleton inference, custom Prometheus metrics
│   │   ├── model_info.py      # Benchmark metrics & architecture metadata for GET /info
│   │   └── schemas.py         # Pydantic request/response models
│   ├── Dockerfile             # Multi-stage/optimized backend image (runs uvicorn on port 8000)
│   └── requirements.txt       # spaCy, spacy-transformers, torch, fastapi, uvicorn, prometheus-fastapi-instrumentator
├── frontend/
│   ├── .streamlit/config.toml # Dark theme configuration
│   ├── streamlit_app.py       # Streamlit UI with input form, confidence gauges, benchmark metadata
│   ├── Dockerfile             # Frontend image (runs streamlit on port 8501)
│   └── requirements.txt       # streamlit, requests
├── k8s/
│   ├── backend.yaml           # Deployment + ClusterIP Service + Startup/Liveness/Readiness probes + 3Gi memory limits
│   ├── frontend.yaml          # Deployment + NodePort 30501 Service + Streamlit health probes
│   ├── configmap.yaml         # Environment configuration (`HF_MODEL_REPO`, `API_URL`)
│   ├── backend-servicemonitor.yaml # Prometheus Operator CRD to scrape backend /metrics
│   ├── kind-config.yaml       # kind cluster config with extraPortMappings for 8501 (frontend) & 3000 (Grafana)
│   ├── kustomization.yaml     # Kustomize manifest bundle + Grafana dashboard ConfigMap generator
│   └── monitoring/
│       ├── values.yaml        # Tuned Helm values for kube-prometheus-stack (Alertmanager disabled, probe tweaks)
│       └── dashboards/
│           └── backend.json   # Pre-configured Grafana dashboard (7 panels: requests, latency, custom classification stats)
├── terraform/
│   ├── versions.tf            # Terraform & AWS provider requirements with standard tags
│   ├── variables.tf           # Input variables for region, CIDRs, node sizing, single NAT GW toggle
│   ├── vpc.tf                 # VPC, 2x Public + 2x Private subnets, IGW, NAT GW, route tables
│   ├── iam.tf                 # EKS cluster and node group IAM roles + policies, OIDC provider
│   ├── security_groups.tf     # Cluster & Node group security groups and inter-communication rules
│   ├── eks.tf                 # EKS Control Plane (1.31) and Managed Node Group
│   ├── ecr.tf                 # ECR repos for backend & frontend with scan-on-push & lifecycle rules
│   ├── outputs.tf             # Cluster endpoint, ECR URLs, and kubectl configure helper
│   ├── terraform.tfvars.example # Example variable definitions
│   └── README.md              # Infrastructure usage, deployment, ECR push, and destroy guide
├── scripts/
│   └── upload_model_to_hf.py  # Utility script to push spaCy model artifacts to HF Hub
├── docker-compose.yml         # Local Docker Compose orchestrator
├── CLAUDE.md                  # Historical context & previous agent logs
└── GEMINI.md                  # Primary guidance file for Gemini / Antigravity
```

---

## 4. Observability & Custom Metrics

Backend exposes Prometheus metrics at `GET /metrics`:
- **HTTP Metrics** (via `prometheus-fastapi-instrumentator`):
  - `http_requests_total`
  - `http_request_duration_seconds`
- **Domain/Model Metrics** (in `backend/app/model.py`):
  - `predict_classifications_total{label}` — Counter of Hateful vs. Not-Hateful classifications.
  - `predict_hateful_score` — Histogram tracking confidence score distribution.
  - `predict_inference_seconds` — Histogram tracking pure PyTorch/spaCy inference latency (excluding HTTP).
  - `predict_input_text_length_chars` — Histogram tracking input text length.

---

## 5. Critical Troubleshooting History & Gotchas

1. **Backend Memory Requirements (OOMKilled)**:
   - PyTorch + DistilBERT transformer pipeline needs substantial headroom at startup.
   - Set resources in `k8s/backend.yaml` to `requests: 1Gi`, `limits: 3Gi` (2Gi was prone to OOM when running alongside the Prometheus monitoring stack).
2. **ServiceMonitor Selector Matching**:
   - `ServiceMonitor` matches the Kubernetes `Service`'s `metadata.labels`, **not** its pod `spec.selector`.
   - The backend `Service` in `k8s/backend.yaml` **must** carry `labels: { app: backend }`.
3. **Grafana Startup Probe Timeouts**:
   - Under CPU contention on a single-node local cluster, Grafana 13 boots slowly.
   - `k8s/monitoring/values.yaml` overrides `livenessProbe` and `readinessProbe` with increased `initialDelaySeconds` and `failureThreshold`.
4. **Streamlit UI Layout**:
   - Use `st.container(border=True)` for cards.
   - Do **not** wrap multiple Streamlit widgets in custom multi-block HTML markdown tags (`<div>...</div>`), as Streamlit sanitization breaks the DOM structure.
5. **Local Environment Notes (Linux / aarch64)**:
   - Tooling package manager: `uv` is preferred for virtual environments (`uv venv`, `uv pip install`).
   - If running locally on WSL 2, ensure Docker Desktop WSL 2 integration is enabled when issuing Docker/Kubernetes commands.

---

## 6. Commands Quick Reference

### Local Development
```bash
# Backend (from backend/ directory)
HF_MODEL_REPO=thenewguyhere/hate-speech-distilbert uvicorn app.main:app --reload --port 8000

# Frontend (from frontend/ directory)
API_URL=http://localhost:8000 streamlit run streamlit_app.py
```

### Docker Compose
```bash
docker compose up --build
```

### Kubernetes (`kind`) & Monitoring
```bash
# 1. Spin up cluster with port mappings
kind create cluster --config k8s/kind-config.yaml

# 2. Build and load images
docker build -t hate-speech-backend:local ./backend
docker build -t hate-speech-frontend:local ./frontend
kind load docker-image hate-speech-backend:local hate-speech-frontend:local --name hate-speech-classifier

# 3. Install Monitoring Stack (Helm)
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install monitoring prometheus-community/kube-prometheus-stack \
  -n monitoring --create-namespace -f k8s/monitoring/values.yaml --wait

# 4. Apply App Manifests & Grafana Dashboard ConfigMap
kubectl apply -k k8s/

# 5. Access Services
# Frontend: http://localhost:8501
# Grafana:  http://localhost:3000 (User: admin, Password retrieved via:)
kubectl get secret -n monitoring monitoring-grafana -o jsonpath="{.data.admin-password}" | base64 -d && echo
```

### Cloud Infrastructure (Terraform AWS / EKS)
```bash
cd terraform
terraform init
terraform plan
terraform apply

# Authenticate kubectl to provisioned EKS
aws eks update-kubeconfig --region us-east-1 --name hate-speech-classifier-eks
kubectl get nodes
```

---

## 7. CI/CD Pipeline (GitHub Actions)

The repository includes a production-grade CI/CD pipeline in `.github/workflows/ci-cd.yml`:
1. **Lint & Test**: Ruff linting across backend & frontend, and Pytest unit test execution.
2. **Build & Push**: Docker Buildx builds `linux/amd64` images with layer caching and pushes to Amazon ECR tagged with Git SHA and `latest`.
3. **Deploy to EKS**: Configures AWS credentials, updates Kubernetes manifests dynamically with `kustomize edit set image`, applies manifests to AWS EKS, and verifies zero-downtime rollouts (`kubectl rollout status`).

### Required GitHub Repository Secrets:
- `AWS_ACCESS_KEY_ID`: IAM Access Key ID for deployment.
- `AWS_SECRET_ACCESS_KEY`: IAM Secret Access Key.


