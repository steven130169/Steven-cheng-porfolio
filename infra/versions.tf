terraform {
  required_version = ">= 1.9.0"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = ">= 6.0.0" # 使用最新的 v6
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}
