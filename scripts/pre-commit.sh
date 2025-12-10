#!/bin/sh
set -e # Exit immediately if a command exits with a non-zero status.

echo "🔍 Running Lint..."
npm run lint

echo "🧪 Running Frontend Unit Tests..."
npm run test:frontend:unit

echo "🏗️  Running Terraform Checks..."
cd infra
# Initialize terraform backend=false to download providers for validation and test
terraform init -backend=false > /dev/null

echo "  - Formatting check..."
terraform fmt -check -recursive .

echo "  - Validation check..."
terraform validate

echo "  - Running Terraform Tests..."
terraform test # This will run unit.tftest.hcl

cd ..

echo "✅ Pre-commit checks passed!"