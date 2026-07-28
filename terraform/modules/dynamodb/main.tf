################################################################
# Tabela de analytics consumida pelo analytics-service.
#
# A chave primária é 'event_id' (UUID gerado por evento), que é o
# que o app.py do analytics-service realmente grava em put_item.
# Os demais campos do item (user_id, flag_name, result, timestamp)
# são livres de schema - só precisam ser declarados aqui os
# atributos usados como chave de tabela ou de índice.
#
# O GSI permite consultar os eventos de uma flag em ordem
# cronológica, que é o acesso natural para análise.
################################################################
resource "aws_dynamodb_table" "analytics" {
  name         = "ToggleMasterAnalytics"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "event_id"

  attribute {
    name = "event_id"
    type = "S"
  }
  attribute {
    name = "flag_name"
    type = "S"
  }
  attribute {
    name = "timestamp"
    type = "S"
  }

  global_secondary_index {
    name            = "flag_name-timestamp-index"
    hash_key        = "flag_name"
    range_key       = "timestamp"
    projection_type = "ALL"
  }

  tags = { Name = "ToggleMasterAnalytics" }
}
