# infra/tests/unit.tftest.hcl

variables {
  project_id            = "test-project-id"
  region                = "asia-east1"
  frontend_service_name = "test-frontend"
  repository_id         = "test-repo"
  github_repo           = "test-owner/test-repo"
  github_repo_id        = "12345678"
}

provider "google" {
  project      = "test-project-id"
  region       = "asia-east1"
  access_token = "dummy-token"
}

run "verify_services_plan" {
  command = plan

  # 1. Artifact Registry
  assert {
    condition     = google_artifact_registry_repository.repo.repository_id == "test-repo"
    error_message = "Artifact Registry ID mismatch"
  }

  assert {
    condition     = google_artifact_registry_repository.repo.format == "DOCKER"
    error_message = "Artifact Registry format mismatch"
  }

  # 2. Secret Manager
  assert {
    condition     = google_secret_manager_secret.neon_db_url.secret_id == "neon-database-url"
    error_message = "Secret ID mismatch"
  }

  # 3. Service Accounts
  assert {
    condition     = google_service_account.runtime_sa.account_id == "portfolio-frontend-runtime"
    error_message = "Runtime SA account_id mismatch"
  }

  assert {
    condition     = google_service_account.app_deployer_sa.account_id == "portfolio-app-deployer"
    error_message = "App Deployer SA account_id mismatch"
  }

  # 4. Cloud Run Frontend
  assert {
    condition     = google_cloud_run_v2_service.frontend.name == "test-frontend"
    error_message = "Frontend service name mismatch"
  }

  assert {
    condition     = google_cloud_run_v2_service.frontend.template[0].containers[0].ports[0].container_port == 3000
    error_message = "Frontend should listen on port 3000"
  }

  # Verify Cloud Run Service Account Binding
  assert {
    condition     = google_cloud_run_v2_service.frontend.template[0].service_account == google_service_account.runtime_sa.email
    error_message = "Cloud Run service not bound to the correct runtime Service Account"
  }

  # Check Env Vars
  assert {
    condition = length([
      for env_var in google_cloud_run_v2_service.frontend.template[0].containers[0].env : env_var
      if env_var.name == "DATABASE_URL" && env_var.value_source[0].secret_key_ref[0].secret == google_secret_manager_secret.neon_db_url.secret_id
    ]) == 1
    error_message = "DATABASE_URL not linked to Secret"
  }

  assert {
    condition = length([
      for env_var in google_cloud_run_v2_service.frontend.template[0].containers[0].env : env_var
      if env_var.name == "GCP_PROJECT_ID" && env_var.value == "test-project-id"
    ]) == 1
    error_message = "GCP_PROJECT_ID not configured correctly"
  }

  # 5. IAM Bindings (Runtime SA)
  assert {
    condition     = google_secret_manager_secret_iam_member.runtime_access_secret.role == "roles/secretmanager.secretAccessor"
    error_message = "Runtime SA should have secretAccessor role"
  }

  assert {
    condition     = google_secret_manager_secret_iam_member.runtime_access_secret.member == "serviceAccount:${google_service_account.runtime_sa.email}"
    error_message = "Runtime SA secret access member mismatch"
  }

  # 6. IAM Bindings (App Deployer SA)
  assert {
    condition     = google_artifact_registry_repository_iam_member.app_deployer_pusher.role == "roles/artifactregistry.writer"
    error_message = "App Deployer should be Artifact Registry Writer"
  }

  assert {
    condition     = google_project_iam_member.app_deployer_run_dev.role == "roles/run.developer"
    error_message = "App Deployer should be Cloud Run Developer"
  }

  assert {
    condition     = google_service_account_iam_member.app_deployer_act_as_runtime.role == "roles/iam.serviceAccountUser"
    error_message = "App Deployer should be Service Account User"
  }
}