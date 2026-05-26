variable "name_prefix"     { type = string }
variable "vpc_id"          { type = string }
variable "vpc_cidr"        { type = string }
variable "subnet_ids"      { type = list(string) }
variable "databases"       { type = list(string) }
variable "master_username" { type = string }
variable "master_password" {
  type      = string
  sensitive = true
}
