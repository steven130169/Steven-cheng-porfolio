# infra/tests/unit.tftest.hcl

variables {
  project_id            = "test-project-id" # Dummy project ID for testing
  region                = "asia-east1"
  frontend_service_name = "test-frontend"
  repository_id         = "test-repo"
  ci_cd_service_account = "ci-cd-sa@example.com"
}

provider "google" {
  project      = "test-project-id" # Must match project_id from variables
  region       = "asia-east1"      # Must match region from variables
  access_token = "dummy-token"     # Provide a dummy token for the test
}

run "verify_services_plan" {
  command = plan

  assert {
    condition     = google_cloud_run_v2_service.frontend.name == "test-frontend"
    error_message = "Frontend service name mismatch"
  }

  assert {
    condition     = google_cloud_run_v2_service.frontend.template[0].containers[0].ports[0].container_port == 3000
    error_message = "Frontend should listen on port 3000"
  }

  # Verify Secret Creation
  assert {
    condition     = google_secret_manager_secret.neon_db_url.secret_id == "neon-database-url"
    error_message = "Secret ID mismatch"
  }

  # Verify DATABASE_URL is injected via Secret
  assert {
    condition = length([
      for env_var in google_cloud_run_v2_service.frontend.template[0].containers[0].env : env_var
      if env_var.name == "DATABASE_URL" && env_var.value_source[0].secret_key_ref[0].secret == google_secret_manager_secret.neon_db_url.secret_id
    ]) == 1
    error_message = "DATABASE_URL environment variable not correctly configured with Secret"
  }

  assert {
    condition = length([
      for env_var in google_cloud_run_v2_service.frontend.template[0].containers[0].env : env_var
      if env_var.name == "GCP_PROJECT_ID"
    ]) == 1
    error_message = "GCP_PROJECT_ID environment variable not configured"
  }

  # Verify IAM Binding for CI/CD
  assert {
    condition     = google_artifact_registry_repository_iam_member.docker_pusher[0].member == "serviceAccount:ci-cd-sa@example.com"
    error_message = "CI/CD SA Artifact Registry IAM not configured correctly"
  }
}