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

# 2. Artifact Registry
resource "google_artifact_registry_repository" "repo" {
  location      = var.region
  repository_id = var.repository_id
  description   = "Docker repository for Portfolio"
  format        = "DOCKER"

  depends_on = [google_project_service.artifact_registry_api]
}

# 3. Security & Secrets

# 3.1. Runtime Service Account (Identity of Cloud Run)
resource "google_service_account" "runtime_sa" {
  account_id   = "portfolio-frontend-runtime"
  display_name = "Runtime SA for Portfolio Frontend"
}

# 3.2. App Deployer Service Account (For app-deploy.yml)
resource "google_service_account" "app_deployer_sa" {
  account_id   = "portfolio-app-deployer"
  display_name = "CI/CD App Deployer SA"
}

# 3.3. IAM for App Deployer
# Allow pushing images
resource "google_artifact_registry_repository_iam_member" "app_deployer_pusher" {
  project    = var.project_id
  location   = var.region
  repository = google_artifact_registry_repository.repo.name
  role       = "roles/artifactregistry.writer"
  member     = "serviceAccount:${google_service_account.app_deployer_sa.email}"
}

# Allow deploying Cloud Run
resource "google_project_iam_member" "app_deployer_run_dev" {
  project = var.project_id
  role    = "roles/run.developer"
  member  = "serviceAccount:${google_service_account.app_deployer_sa.email}"
}

# Allow Deployer to act as Runtime SA
resource "google_service_account_iam_member" "app_deployer_act_as_runtime" {
  service_account_id = google_service_account.runtime_sa.name
  role               = "roles/iam.serviceAccountUser"
  member             = "serviceAccount:${google_service_account.app_deployer_sa.email}"
}

# 3.4. Secrets
resource "google_secret_manager_secret" "neon_db_url" {
  secret_id = "neon-database-url"
  replication {
    auto {}
  }
  depends_on = [google_project_service.secretmanager_api]
}

# Grant Runtime SA access to Secret
resource "google_secret_manager_secret_iam_member" "runtime_access_secret" {
  secret_id = google_secret_manager_secret.neon_db_url.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.runtime_sa.email}"
}

# 4. Frontend Cloud Run Service (as Monolith)
resource "google_cloud_run_v2_service" "frontend" {
  name     = var.frontend_service_name
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"

  deletion_protection = false

  template {
    service_account = google_service_account.runtime_sa.email

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

  lifecycle {
    ignore_changes = [
      client,
      client_version,
      template[0].containers[0].image
    ]
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

# 6. Workload Identity Federation (WIF)

resource "google_project_service" "iamcredentials_api" {
  service            = "iamcredentials.googleapis.com"
  disable_on_destroy = false
}

resource "google_iam_workload_identity_pool" "github_pool" {
  workload_identity_pool_id = "github-pool"
  display_name              = "GitHub Actions Pool"
  description               = "Identity pool for GitHub Actions"
}

resource "google_iam_workload_identity_pool_provider" "github_provider" {
  workload_identity_pool_id          = google_iam_workload_identity_pool.github_pool.workload_identity_pool_id
  workload_identity_pool_provider_id = "github-provider-actions"
  display_name                       = "GitHub Actions Provider"
  description                        = "OIDC Identity Provider for GitHub Actions"

  attribute_mapping = {
    "google.subject"       = "assertion.sub"
    "attribute.repository" = "assertion.repository"
  }

  oidc {
    issuer_uri = "https://token.actions.githubusercontent.com"
  }
}

# 7. Grant WIF Access to Service Accounts

# Allow GitHub Actions (via WIF) to impersonate the App Deployer SA
resource "google_service_account_iam_member" "app_deployer_wif" {
  service_account_id = google_service_account.app_deployer_sa.name
  role               = "roles/iam.workloadIdentityUser"
  member             = "principalSet://iam.googleapis.com/${google_iam_workload_identity_pool.github_pool.name}/attribute.repository/${var.github_repo}"

  depends_on = [
    google_project_service.iamcredentials_api,
    google_iam_workload_identity_pool_provider.github_provider
  ]
}
