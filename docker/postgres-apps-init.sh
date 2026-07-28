#!/bin/bash
# Cria os bancos do flag-service e do targeting-service na mesma instância
# PostgreSQL e aplica os schemas montados em /schemas.
set -e

psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB" <<-EOSQL
  CREATE DATABASE flag_db;
  CREATE DATABASE targeting_db;
EOSQL

psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d flag_db      -f /schemas/flag.sql
psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d targeting_db -f /schemas/targeting.sql
