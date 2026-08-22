import { ArchitectureLayer } from '../types';

export const ARCHITECTURE_LAYERS: ArchitectureLayer[] = [
  {
    layer: 1,
    title: "App Microservices (FastAPI)",
    subtitle: "High-Throughput PyTorch / spaCy Inference Service",
    tech: ["FastAPI", "spaCy v3", "PyTorch", "Uvicorn", "Pydantic"],
    icon: "Zap",
    description: "Decoupled asynchronous Python backend utilizing a singleton TextCatEnsemble.v2 transformer pipeline. Exposes /predict, /health, /info, and Prometheus /metrics endpoints.",
    highlights: [
      "Dynamic Hugging Face Hub weights streaming at startup via HF_MODEL_REPO",
      "Pydantic strict schema validation with character truncation safeguards",
      "Pure PyTorch latency instrumentation separated from HTTP roundtrip overhead",
    ],
    codeSnippet: {
      filename: "backend/app/main.py",
      language: "python",
      code: `@app.post("/predict", response_model=PredictResponse)
def predict(payload: PredictRequest):
    text = payload.text.strip()
    if not text:
        raise HTTPException(status_code=422, detail="Text cannot be empty")
    
    result = model_loader.predict(text)
    return PredictResponse(**result)`
    }
  },
  {
    layer: 2,
    title: "Containerization (Docker)",
    subtitle: "Multi-Stage OCI-Compliant Container Images",
    tech: ["Docker", "Docker Compose", "Multi-stage Build", "Hugging Face"],
    icon: "Box",
    description: "Production Docker image packaging PyTorch with an unprivileged non-root user (uid 1000). Decouples heavy model weights from git history by streaming directly from Hugging Face Hub.",
    highlights: [
      "Optimized multi-stage layer caching for fast CI builds",
      "Public Hugging Face repository: thenewguyhere/hate-speech-distilbert",
      "Zero model weights stored in Git, keeping repo lightweight (<1MB)",
    ],
    codeSnippet: {
      filename: "backend/Dockerfile",
      language: "dockerfile",
      code: `FROM python:3.12-slim AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

FROM python:3.12-slim
WORKDIR /app
RUN useradd -m -u 1000 appuser
USER appuser
COPY --from=builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]`
    }
  },
  {
    layer: 3,
    title: "Kubernetes Orchestration",
    subtitle: "Declarative Cloud-Native Workload Management",
    tech: ["Kubernetes", "EKS", "Kustomize", "Probes", "Resource Limits"],
    icon: "Cpu",
    description: "Container orchestration across AWS EKS worker nodes with declarative deployments, ClusterIP and LoadBalancer services, calibrated health probes, and 4Gi memory headroom.",
    highlights: [
      "StartupProbe with 5s timeout & 30 failure thresholds to prevent init kills",
      "Memory requests (2Gi) and limits (4Gi) tuned to avoid OOMKilled events",
      "LoadBalancer ingress exposing high-availability Streamlit frontend",
    ],
    codeSnippet: {
      filename: "k8s/backend.yaml",
      language: "yaml",
      code: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
spec:
  replicas: 1
  template:
    spec:
      containers:
      - name: backend
        image: hate-speech-backend:local
        resources:
          requests:
            cpu: 500m
            memory: 2Gi
          limits:
            cpu: 1000m
            memory: 4Gi`
    }
  },
  {
    layer: 4,
    title: "Cloud Observability",
    subtitle: "Real-time Metrics, Histograms & Grafana Dashboards",
    tech: ["Prometheus Operator", "Grafana", "ServiceMonitor", "Helm"],
    icon: "Activity",
    description: "End-to-end telemetry stack scraped via Prometheus Operator CRDs. Tracks real-time classification ratios, inference latency histograms, and text length distributions.",
    highlights: [
      "Custom metric: predict_classifications_total{label='Hateful|Not-Hateful'}",
      "Histogram: predict_inference_seconds tracking pure PyTorch compute time",
      "Auto-provisioned Grafana dashboard imported via Kubernetes ConfigMap generator",
    ],
    codeSnippet: {
      filename: "k8s/backend-servicemonitor.yaml",
      language: "yaml",
      code: `apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: backend-monitor
  labels:
    release: monitoring
spec:
  selector:
    matchLabels:
      app: backend
  endpoints:
  - port: http
    path: /metrics
    interval: 15s`
    }
  },
  {
    layer: 5,
    title: "Infrastructure as Code (Terraform)",
    subtitle: "Complete AWS EKS VPC, IAM & ECR Provisioning",
    tech: ["Terraform", "AWS EKS v1.31", "AWS VPC", "IAM & OIDC", "Amazon ECR"],
    icon: "Cloud",
    description: "Fully automated, reproducible AWS cloud infrastructure written in modular Terraform. Builds isolated VPCs, NAT gateways, EKS managed node groups, and ECR registries.",
    highlights: [
      "Custom VPC: 2 Public Subnets + 2 Private Subnets with single NAT Gateway toggle",
      "EKS Cluster v1.31 with Managed Node Group (2x t3.large instances)",
      "IAM Roles for Service Accounts (IRSA) via OIDC identity provider",
      "Amazon ECR repositories with scan-on-push & automated lifecycle pruning",
    ],
    codeSnippet: {
      filename: "terraform/eks.tf",
      language: "hcl",
      code: `resource "aws_eks_cluster" "main" {
  name     = var.cluster_name
  version  = "1.31"
  role_arn = aws_iam_role.cluster.arn

  vpc_config {
    subnet_ids              = aws_subnet.private[*].id
    endpoint_private_access = true
    endpoint_public_access  = true
  }
}`
    }
  },
  {
    layer: 6,
    title: "CI/CD Pipeline (GitHub Actions)",
    subtitle: "Automated Testing, Multi-Arch Build & EKS Rollout",
    tech: ["GitHub Actions", "Docker Buildx", "Amazon ECR", "Kustomize", "Pytest"],
    icon: "GitBranch",
    description: "Zero-touch deployment automation triggered on every push to main. Executes code linters, unit tests, multi-platform Docker builds, and zero-downtime rolling updates to EKS.",
    highlights: [
      "Stage 1: Ruff check + Pytest unit tests across API endpoints and schemas",
      "Stage 2: Docker Buildx builds linux/amd64 with layer caching and pushes to ECR",
      "Stage 3: Dynamic image manifest updates with kustomize edit set image",
      "Stage 4: Automated deployment to AWS EKS with kubectl rollout status verification",
    ],
    codeSnippet: {
      filename: ".github/workflows/ci-cd.yml",
      language: "yaml",
      code: `- name: Deploy to Amazon EKS
  run: |
    cd k8s
    kustomize edit set image hate-speech-backend=$ECR_REGISTRY/hate-speech-backend:$IMAGE_TAG
    kustomize edit set image hate-speech-frontend=$ECR_REGISTRY/hate-speech-frontend:$IMAGE_TAG
    kubectl apply -k .
    kubectl rollout status deployment/backend -n default --timeout=180s
    kubectl rollout status deployment/frontend -n default --timeout=180s`
    }
  }
];
