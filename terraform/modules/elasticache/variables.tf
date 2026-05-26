variable "name_prefix" { type = string }
variable "vpc_id"      { type = string }
variable "vpc_cidr"    { type = string }
variable "subnet_ids"  { type = list(string) }
