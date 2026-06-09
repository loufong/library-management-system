output "eks_cluster_name" {
  value       = aws_eks_cluster.eks.name
  description = "The name of the EKS Kubernetes cluster"
}

output "eks_cluster_endpoint" {
  value       = aws_eks_cluster.eks.endpoint
  description = "EKS Kubernetes API server control plane endpoint"
}

output "eks_cluster_security_group_id" {
  value       = aws_eks_cluster.eks.vpc_config[0].cluster_security_group_id
  description = "The security group attached to the EKS cluster"
}

output "vpc_id" {
  value       = aws_vpc.lms_vpc.id
  description = "The ID of the VPC created"
}
