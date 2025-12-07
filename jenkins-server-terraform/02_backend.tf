# Specify the backend configuration for storing Terraform state files in S3.
terraform {
  backend "s3" {
    # The S3 bucket where the Terraform state file will be stored.
    bucket         = "codeboard-bucket-s3"
    
    # The AWS region where the S3 bucket and DynamoDB table are located.
    region         = "us-east-1"
    
    # The key (path) within the S3 bucket for storing the state file.
    key            = "codeboard-project/jenkins-server-terraform/terraform.tfstate"
    
    # The DynamoDB table used for state locking to prevent concurrent state changes.
    dynamodb_table = "lock-files"
    
    # Ensures the state file is encrypted at rest in the S3 bucket.
    encrypt        = true
  }

  # Specifies the minimum Terraform version required for this configuration.
  required_version = ">=0.13.0"

  # Specifies the required provider configurations for this Terraform project.
  required_providers {
    aws = {
      # The minimum version of the AWS provider required for this configuration.
      version = ">= 2.7.0"
      
      # The source of the AWS provider, using the HashiCorp registry.
      source  = "hashicorp/aws"
    }
  }
}
