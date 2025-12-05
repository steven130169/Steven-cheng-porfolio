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
  description   = "Docker repository for Portfolio Backend"
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

# 4. Cloud Run v2 Service
resource "google_cloud_run_v2_service" "default" {
  name     = var.service_name
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"

  # 開發便利性：允許 Terraform 刪除重建
  deletion_protection = false

  template {
    containers {
      # 這裡先用一個 placeholder image，之後 CI/CD 會換成真正的 Image
      # 這是 Terraform + CI/CD 雞生蛋問題的標準解法
      image = "us-docker.pkg.dev/cloudrun/container/hello"
      
      resources {
        limits = {
          cpu    = "1000m"
          memory = "512Mi"
        }
      }

      # 環境變數 (從 List 變 Set 的部分，Terraform 6.x 自動處理)
      env {
        name  = "GCP_PROJECT_ID"
        value = var.project_id
      }
      
      env {
        name = "FIRESTORE_DB_NAME"
        value = google_firestore_database.database.name
      }
    }
  }

  depends_on = [google_project_service.run_api]
}

# 5. 公開存取權限 (Public Access)
resource "google_cloud_run_service_iam_member" "public_access" {
  location = google_cloud_run_v2_service.default.location
  service  = google_cloud_run_v2_service.default.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}
