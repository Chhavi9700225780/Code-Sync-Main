# AWS AMI data source to retrieve the most recent Ubuntu 22.04 AMI image
data "aws_ami" "ami" {
  most_recent = true

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  # Owner of the Ubuntu AMI (Canonical)
  owners = ["099720109477"]
}