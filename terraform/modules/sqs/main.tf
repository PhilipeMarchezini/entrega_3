resource "aws_sqs_queue" "evaluation_events" {
  name                       = "${var.name_prefix}-evaluation-events"
  visibility_timeout_seconds = 60
  message_retention_seconds  = 345600 # 4 dias
  receive_wait_time_seconds  = 10

  tags = { Name = "${var.name_prefix}-evaluation-events" }
}
