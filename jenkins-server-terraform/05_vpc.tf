# Resource to create a VPC (Virtual Private Cloud)
resource "aws_vpc" "vpc" {
  # CIDR block for the VPC's private IP range
  cidr_block = "10.0.0.0/16"

  # Tags to identify the VPC, with the name taken from a variable
  tags = {
    Name = var.vpc_name
  }
}

# Resource to create an Internet Gateway for the VPC
resource "aws_internet_gateway" "igw" {
  # Associate the Internet Gateway with the VPC
  vpc_id = aws_vpc.vpc.id

  # Tags for the Internet Gateway, with the name taken from a variable
  tags = {
    Name = var.igw_name
  }
}

# Resource to create a public subnet within the VPC
resource "aws_subnet" "public-subnet" {
  # VPC to associate the subnet with
  vpc_id = aws_vpc.vpc.id
  
  # CIDR block for the subnet's IP range
  cidr_block = "10.0.1.0/24"
  
  # Availability zone where the subnet will be located
  availability_zone = "us-east-1a"
  
  # Automatically assign public IPs to instances launched in this subnet
  map_public_ip_on_launch = true

  # Tags for the subnet, with the name taken from a variable
  tags = {
    Name = var.subnet_name
  }
}

# Resource to create a Route Table for the VPC
resource "aws_route_table" "rt" {
  # VPC to associate the route table with
  vpc_id = aws_vpc.vpc.id

  # Define a route that sends traffic to the Internet Gateway
  route {
    cidr_block = "0.0.0.0/0"  # Destination for all Internet traffic
    gateway_id = aws_internet_gateway.igw.id  # Route traffic through the Internet Gateway
  }

  # Tags for the route table, with the name taken from a variable
  tags = {
    Name = var.route_table_name
  }
}

# Resource to associate the Route Table with the public subnet
resource "aws_route_table_association" "rt-association" {
  # Associate the route table with the public subnet
  route_table_id = aws_route_table.rt.id
  subnet_id      = aws_subnet.public-subnet.id
}

# Resource to create a Security Group for controlling traffic to EC2 instances
resource "aws_security_group" "security-group" {
  # VPC to associate the security group with
  vpc_id = aws_vpc.vpc.id

  # Description of the security group (what it allows)
  description = "Allowing Jenkins, Sonarqube, SSH Access"

  # Ingress rules to allow traffic on specified ports
  ingress = [
    # Loop through a list of ports and define rules for each
    for port in [22, 8080, 9000, 9090, 80] : {
      description      = "TLS from VPC"  # Description for the rule
      from_port        = port           # Port range for ingress
      to_port          = port           # Port range for ingress
      protocol         = "tcp"          # TCP protocol
      ipv6_cidr_blocks = ["::/0"]       # Allow traffic from all IPv6 addresses
      self             = false          # Do not allow traffic from the instance itself
      prefix_list_ids  = []             # No prefix lists
      security_groups  = []             # No additional security groups
      cidr_blocks      = ["0.0.0.0/0"]  # Allow traffic from any IPv4 address
    }
  ]

  # Egress rule to allow all outbound traffic
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"  # All protocols
    cidr_blocks = ["0.0.0.0/0"]  # Allow outbound traffic to any destination
  }

  # Tags for the security group, with the name taken from a variable
  tags = {
    Name = var.security_group_name
  }
}
