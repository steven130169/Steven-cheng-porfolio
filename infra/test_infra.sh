#!/bin/bash
set -e

echo "Running Terraform Validation..."
cd infra
terraform init -backend=false
terraform validate
echo "Terraform configuration is valid."
