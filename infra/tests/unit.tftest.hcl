# infra/tests/unit.tftest.hcl

variables {
  project_id            = "test-project-id" # Dummy project ID for testing
  region                = "asia-east1"
  frontend_service_name = "test-frontend"
  repository_id         = "test-repo"
}

provider "google" {
  project = "test-project-id" # Must match project_id from variables
  region  = "asia-east1"   # Must match region from variables
  access_token = "dummy-token" # Provide a dummy token for the test
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

  assert {
    condition = length([
      for env_var in google_cloud_run_v2_service.frontend.template[0].containers[0].env : env_var
      if env_var.name == "FIRESTORE_DB_NAME"
    ]) == 1
    error_message = "FIRESTORE_DB_NAME environment variable not configured"
  }

  assert {
    condition = length([
      for env_var in google_cloud_run_v2_service.frontend.template[0].containers[0].env : env_var
      if env_var.name == "GCP_PROJECT_ID"
    ]) == 1
    error_message = "GCP_PROJECT_ID environment variable not configured"
  }
}
