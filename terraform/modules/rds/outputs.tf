output "endpoints" {
  description = "map de banco -> endpoint"
  value       = { for k, db in aws_db_instance.this : k => db.address }
}

output "ports" {
  value = { for k, db in aws_db_instance.this : k => db.port }
}
