# 1. 啟用必要的 APIs
resource "google_project_service" "run_api" {
  service            = "run.googleapis.com"
  disable_on_destroy = false
}

resource "google_project_service" "firestore_api" {
  service            = "firestore.googleapis.com"
  disable_on_destroy = false
}

resource "google_project_service" "artifact_registry_api" {
  service            = "artifactregistry.googleapis.com"
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

# 3. Firestore Database (Native Mode)
resource "google_firestore_database" "database" {
  name        = "(default)"
  location_id = var.region
  type        = "FIRESTORE_NATIVE"

  # 開發階段允許刪除，生產環境建議設為 ENABLED
  delete_protection_state = "DELETE_PROTECTION_DISABLED"
  deletion_policy         = "DELETE"

  depends_on = [google_project_service.firestore_api]
}

# 4. Frontend Cloud Run Service (as Monolith)
resource "google_cloud_run_v2_service" "frontend" {
  name     = var.frontend_service_name
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"

  deletion_protection = false

  template {
    containers {
      # Placeholder image
      image = "us-docker.pkg.dev/cloudrun/container/hello"
      
      ports {
        container_port = 3000
      }

      resources {
        limits = {
          cpu    = "1000m"
          memory = "512Mi"
        }
      }

      # Inject Firestore DB Name
      env {
        name = "FIRESTORE_DB_NAME"
        value = google_firestore_database.database.name
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
