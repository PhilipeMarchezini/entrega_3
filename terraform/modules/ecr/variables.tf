variable "services" {
  type    = list(string)
  default = ["auth-service", "flag-service", "targeting-service", "evaluation-service", "analytics-service"]
}
