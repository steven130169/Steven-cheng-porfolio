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
  description = "The name of the Frontend Cloud Run service"
  type        = string
  default     = "portfolio-frontend"
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