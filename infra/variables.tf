variable "project_id" {
  description = "The GCP Project ID"
  type        = string
}

variable "region" {
  description = "The GCP Region for resources"
  type        = string
  default     = "asia-east1" # 預設台灣 (或您偏好的區域)
}

variable "frontend_service_name" {
  description = "Cloud Run Service Name"
  type        = string
  default     = "portfolio-frontend"
}

variable "github_repo" {
  description = "GitHub Repository (owner/repo) for WIF"
  type        = string
}

variable "frontend_image" {
  description = "The Docker image URL for the frontend service"
  type        = string
  default     = "us-docker.pkg.dev/cloudrun/container/hello" # Default placeholder
}

variable "repository_id" {
  description = "The Artifact Registry repository ID"
  type        = string
  default     = "portfolio-repo"
}

variable "ci_cd_service_account" {
  description = "The email of the Service Account used for CI/CD (GitHub Actions)"
  type        = string
  default     = "" # Optional, if empty, IAM binding won't be created (we can use count)
}
