# Cloud Infrastructure as Code (Terraform on AWS EKS)

This directory contains production-grade Terraform configurations to provision a complete, highly available, and cost-conscious AWS cloud environment for the **Hate Speech Classifier** application.

---

## 1. Architecture Overview

```
                          Internet
                             │
                     ┌───────┴───────┐
                     │ Internet GW   │
                     └───────┬───────┘
                             │
     ┌───────────────────────┼───────────────────────┐
     │                       │                       │
┌────┴────────────────┐ ┌────┴────────────────┐ ┌────┴───────────────┐
│ Public Subnet (AZ A)│ │ Public Subnet (AZ B)│ │ AWS ECR            │
│ [NAT Gateway (EIP)] │ │                     │ │ • hate-speech-     │
└────────────┬────────┘ └─────────────────────┘ │   backend          │
             │                                  │ • hate-speech-     │
    ┌────────┴────────┐                         │   frontend         │
    │  Route (0.0/0)  │                         └────────────────────┘
    └────────┬────────┘
             │
     ┌───────┴───────────────────────────────────────┐
     │               Private Subnets                 │
     │ ┌───────────────────┐   ┌───────────────────┐ │
     │ │ Node 1 (AZ A)     │   │ Node 2 (AZ B)     │ │
     │ │ • Backend Pod     │   │ • Frontend Pod    │ │
     │ │ • Prometheus      │   │ • Grafana         │ │
     │ └───────────────────┘   └───────────────────┘ │
     └───────────────────────┬───────────────────────┘
                             │
              ┌──────────────┴──────────────┐
              │ AWS EKS Control Plane (1.31)│
              │ • Cluster IAM Role          │
              │ • OIDC Provider (IRSA)      │
              └─────────────────────────────┘
```

### Components Provisioned:
1. **Virtual Private Cloud (VPC)**:
   - Dedicated VPC (`10.0.0.0/16`) across 2 Availability Zones.
   - 2 Public Subnets with Internet Gateway and auto-assigned public IPs.
   - 2 Private Subnets with a shared NAT Gateway for secure outbound pod communication (model download from HF Hub, image pulls).
   - Standard Kubernetes & ELB subnet tags (`kubernetes.io/role/elb`, `kubernetes.io/role/internal-elb`).
2. **Amazon EKS Cluster**:
   - Managed EKS control plane (v1.31) with API & ConfigMap authentication (`API_AND_CONFIG_MAP`).
   - IAM Roles with least-privilege AWS-managed policies.
   - IAM OpenID Connect (OIDC) provider for IRSA (IAM Roles for Service Accounts).
3. **Managed Node Group**:
   - Deployed in private subnets with auto-scaling (1 to 3 nodes, default: 2x `t3.large`).
   - Dedicated security group allowing inter-node and cluster-to-node communication.
4. **Amazon Elastic Container Registry (ECR)**:
   - Repositories for `hate-speech-backend` and `hate-speech-frontend`.
   - Automated vulnerability scan on push (`scan_on_push = true`).
   - Lifecycle policy expiring untagged images (>1 day) and retaining the last 10 tagged images to minimize AWS S3 storage costs.

---

## 2. Prerequisites

- **AWS CLI** (configured with appropriate IAM credentials)
- **Terraform** >= 1.5.0
- **kubectl**

---

## 3. Quickstart: Deployment Walkthrough

### Step 1: Initialize Terraform
```bash
cd terraform
terraform init
```

### Step 2: Review Infrastructure Plan
```bash
terraform plan
```

### Step 3: Apply Infrastructure
```bash
terraform apply
```
*(Note: EKS cluster provisioning typically takes 8-12 minutes).*

### Step 4: Configure kubectl
Once `terraform apply` completes, configure your local `kubectl` using the output command:
```bash
aws eks update-kubeconfig --region us-east-1 --name hate-speech-classifier-eks
```

Verify cluster access:
```bash
kubectl get nodes -o wide
```

---

## 4. Pushing Container Images to ECR

Log in to Amazon ECR:
```bash
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION=$(aws configure get region || echo "us-east-1")

aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com
```

Build, tag, and push images:
```bash
# Backend
docker build -t hate-speech-backend:v1 ../backend
docker tag hate-speech-backend:v1 ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/hate-speech-backend:v1
docker tag hate-speech-backend:v1 ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/hate-speech-backend:latest
docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/hate-speech-backend:v1
docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/hate-speech-backend:latest

# Frontend
docker build -t hate-speech-frontend:v1 ../frontend
docker tag hate-speech-frontend:v1 ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/hate-speech-frontend:v1
docker tag hate-speech-frontend:v1 ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/hate-speech-frontend:latest
docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/hate-speech-frontend:v1
docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/hate-speech-frontend:latest
```

---

## 5. Cost-Conscious Teardown

To avoid ongoing AWS charges when the cluster is not in use:

```bash
cd terraform
terraform destroy
```
*(All created resources including NAT Gateway, EIP, EKS Cluster, Node Groups, and ECR Repositories will be cleanly removed).*
