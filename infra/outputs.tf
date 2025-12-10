output "frontend_url" {
  description = "The URL of the Frontend Cloud Run service"
  value       = google_cloud_run_v2_service.frontend.uri
}

output "artifact_registry_repo" {
  description = "The full path of the Artifact Registry repository"
  value       = "${var.region}-docker.pkg.dev/${var.project_id}/${var.repository_id}"
}

output "runtime_sa_email" {
  description = "Email of the Runtime Service Account"
  value       = google_service_account.runtime_sa.email
}

output "app_deployer_sa_email" {
  description = "Email of the App Deployer Service Account (Add key to GCP_APP_DEPLOYER_KEY)"
  value       = google_service_account.app_deployer_sa.email
}