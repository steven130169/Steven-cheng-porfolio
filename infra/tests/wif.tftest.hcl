# infra/tests/wif.tftest.hcl

variables {
  project_id    = "test-project-id"
  region        = "asia-east1"
  repository_id = "test-repo"
  github_repo   = "steven130169/Steven-cheng-porfolio"
}

provider "google" {
  project      = "test-project-id"
  region       = "asia-east1"
  access_token = "dummy-token"
}

run "verify_wif_resources" {
  command = plan

  # 1. WIF Pool
  assert {
    condition     = google_iam_workload_identity_pool.github_pool.workload_identity_pool_id == "github-pool"
    error_message = "WIF Pool ID mismatch"
  }

  assert {
    condition     = google_iam_workload_identity_pool.github_pool.display_name == "GitHub Actions Pool"
    error_message = "WIF Pool display name mismatch"
  }

  # 2. WIF Provider
  assert {
    condition     = google_iam_workload_identity_pool_provider.github_provider.workload_identity_pool_provider_id == "github-provider-actions"
    error_message = "WIF Provider ID mismatch"
  }

  assert {
    condition     = google_iam_workload_identity_pool_provider.github_provider.attribute_condition == "assertion.repository == '${var.github_repo}'"
    error_message = "WIF Provider attribute condition mismatch"
  }

  assert {
    condition     = google_iam_workload_identity_pool_provider.github_provider.attribute_mapping["google.subject"] == "assertion.sub"
    error_message = "WIF Provider attribute mapping mismatch"
  }

  assert {
    condition     = google_iam_workload_identity_pool_provider.github_provider.attribute_mapping["attribute.owner"] == "assertion.repository_owner"
    error_message = "WIF Provider owner mapping mismatch"
  }

  assert {
    condition     = google_iam_workload_identity_pool_provider.github_provider.oidc[0].issuer_uri == "https://token.actions.githubusercontent.com"
    error_message = "WIF Provider OIDC Issuer mismatch"
  }

  # 3. IAM Binding for App Deployer
  assert {
    condition     = google_service_account_iam_member.app_deployer_wif.role == "roles/iam.workloadIdentityUser"
    error_message = "App Deployer should have workloadIdentityUser role"
  }
}
