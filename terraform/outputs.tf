output "aws_region" {
  description = "AWS region used for deployments"
  value       = var.aws_region
}

output "cluster_name" {
  description = "Name of the provisioned EKS Cluster"
  value       = aws_eks_cluster.main.name
}

output "cluster_endpoint" {
  description = "Kubernetes API endpoint for the EKS Cluster"
  value       = aws_eks_cluster.main.endpoint
}

output "cluster_security_group_id" {
  description = "Security Group ID attached to the EKS cluster control plane"
  value       = aws_security_group.cluster.id
}

output "oidc_provider_arn" {
  description = "ARN of the OpenID Connect provider for IAM Roles for Service Accounts (IRSA)"
  value       = aws_iam_openid_connect_provider.eks.arn
}

output "vpc_id" {
  description = "ID of the VPC created for EKS"
  value       = aws_vpc.main.id
}

output "public_subnet_ids" {
  description = "List of public subnet IDs"
  value       = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  description = "List of private subnet IDs"
  value       = aws_subnet.private[*].id
}

output "ecr_repository_urls" {
  description = "Map of ECR repository names to their repository URLs"
  value = {
    for k, v in aws_ecr_repository.repos : k => v.repository_url
  }
}

output "ecr_backend_repository_url" {
  description = "URL of the ECR repository for the backend image"
  value       = aws_ecr_repository.repos["backend"].repository_url
}

output "ecr_frontend_repository_url" {
  description = "URL of the ECR repository for the frontend image"
  value       = aws_ecr_repository.repos["frontend"].repository_url
}

output "configure_kubectl_command" {
  description = "Command to configure kubectl to point to the newly provisioned EKS cluster"
  value       = "aws eks update-kubeconfig --region ${var.aws_region} --name ${aws_eks_cluster.main.name}"
}
