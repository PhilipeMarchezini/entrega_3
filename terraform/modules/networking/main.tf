resource "aws_vpc" "this" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name                                           = "${var.name_prefix}-vpc"
    "kubernetes.io/cluster/${var.cluster_name}"    = "shared"
  }
}

resource "aws_internet_gateway" "this" {
  vpc_id = aws_vpc.this.id
  tags   = { Name = "${var.name_prefix}-igw" }
}

resource "aws_subnet" "public" {
  count                   = length(var.azs)
  vpc_id                  = aws_vpc.this.id
  cidr_block              = cidrsubnet(var.vpc_cidr, 8, count.index)
  availability_zone       = var.azs[count.index]
  map_public_ip_on_launch = true

  tags = {
    Name                                          = "${var.name_prefix}-public-${var.azs[count.index]}"
    "kubernetes.io/role/elb"                      = "1"
    "kubernetes.io/cluster/${var.cluster_name}"   = "shared"
  }
}

resource "aws_subnet" "private" {
  count             = length(var.azs)
  vpc_id            = aws_vpc.this.id
  cidr_block        = cidrsubnet(var.vpc_cidr, 8, count.index + 10)
  availability_zone = var.azs[count.index]

  tags = {
    Name                                          = "${var.name_prefix}-private-${var.azs[count.index]}"
    "kubernetes.io/role/internal-elb"             = "1"
    "kubernetes.io/cluster/${var.cluster_name}"   = "shared"
  }
}

# Route table pública -> IGW
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.this.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.this.id
  }
  tags = { Name = "${var.name_prefix}-rt-public" }
}

resource "aws_route_table_association" "public" {
  count          = length(aws_subnet.public)
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

# Para o AWS Academy (custo), usamos route table privada SEM NAT Gateway.
# Os pods que precisarem de internet usam VPC endpoints ou as subnets públicas via Service.
resource "aws_route_table" "private" {
  vpc_id = aws_vpc.this.id
  tags   = { Name = "${var.name_prefix}-rt-private" }
}

resource "aws_route_table_association" "private" {
  count          = length(aws_subnet.private)
  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private.id
}
