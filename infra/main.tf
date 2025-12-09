# GCS Backend for Terraform State
terraform {
  backend "gcs" {
    bucket = "gen-lang-client-0548141875-tfstate"
    prefix = "terraform/state"
  }
}

# 1. 啟用必要的 APIs
resource "google_project_service" "run_api" {
  service            = "run.googleapis.com"
  disable_on_destroy = false
}

resource "google_project_service" "artifact_registry_api" {
  service            = "artifactregistry.googleapis.com"
  disable_on_destroy = false
}

resource "google_project_service" "secretmanager_api" {
  service            = "secretmanager.googleapis.com"
  disable_on_destroy = false
}

# 2. Artifact Registry (存放 Docker Images)
resource "google_artifact_registry_repository" "repo" {
  location      = var.region
  repository_id = var.repository_id
  description   = "Docker repository for Portfolio"
  format        = "DOCKER"

  depends_on = [google_project_service.artifact_registry_api]
}

# 3. Security & Secrets
resource "google_service_account" "frontend_sa" {
  account_id   = "portfolio-frontend-sa"
  display_name = "Service Account for Portfolio Frontend"
}

resource "google_secret_manager_secret" "neon_db_url" {
  secret_id = "neon-database-url"
  replication {
    auto {}
  }
  depends_on = [google_project_service.secretmanager_api]
}

resource "google_secret_manager_secret_iam_member" "frontend_access_secret" {
  secret_id = google_secret_manager_secret.neon_db_url.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.frontend_sa.email}"
}

# 4. Frontend Cloud Run Service (as Monolith)
resource "google_cloud_run_v2_service" "frontend" {
  name     = var.frontend_service_name
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"

  deletion_protection = false

  template {
    service_account = google_service_account.frontend_sa.email

    containers {
      # Use variable for image, default is placeholder
      image = var.frontend_image

      ports {
        container_port = 3000
      }

      resources {
        limits = {
          cpu    = "1000m"
          memory = "512Mi"
        }
      }

      # Environment Variables
      env {
        name = "DATABASE_URL"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.neon_db_url.secret_id
            version = "latest"
          }
        }
      }

      env {
        name  = "GCP_PROJECT_ID"
        value = var.project_id
      }
    }
  }

  depends_on = [google_project_service.run_api]
}

# 5. Frontend Public Access
resource "google_cloud_run_service_iam_member" "frontend_public_access" {
  location = google_cloud_run_v2_service.frontend.location
  service  = google_cloud_run_v2_service.frontend.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}
