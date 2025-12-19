output "workload_identity_provider" {
  description = "The Workload Identity Provider resource name"
  value       = google_iam_workload_identity_pool_provider.github_provider.name
}

output "service_account_email" {
  description = "The App Deployer Service Account Email"
  value       = google_service_account.app_deployer_sa.email
}