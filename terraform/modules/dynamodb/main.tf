resource "aws_dynamodb_table" "analytics" {
  name         = "ToggleMasterAnalytics"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "flag_id"
  range_key    = "timestamp"

  attribute {
    name = "flag_id"
    type = "S"
  }
  attribute {
    name = "timestamp"
    type = "S"
  }

  tags = { Name = "ToggleMasterAnalytics" }
}
