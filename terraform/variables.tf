variable "aws_region" {
  type        = string
  description = "The target AWS region for deployment"
  default     = "us-east-1"
}

variable "vpc_cidr" {
  type        = string
  description = "CIDR range block for the VPC"
  default     = "10.0.0.0/16"
}

variable "cluster_name" {
  type        = string
  description = "Name of the EKS Kubernetes cluster"
  default     = "lms-production-cluster"
}

variable "node_instance_type" {
  type        = string
  description = "EC2 instance types for the EKS node group"
  default     = "t3.medium"
}
