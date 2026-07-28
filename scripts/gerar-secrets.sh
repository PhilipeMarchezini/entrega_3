#!/bin/bash
################################################################
# Etapa 8 - gera o gitops/secrets.yaml a partir das saidas reais
# do terraform apply.
#
# Substitui a edicao manual no nano, que e' onde mais se erra:
# endpoint de um apply antigo, senha divergente, e principalmente o
# redis_addr sem o prefixo redis:// (que derruba o evaluation-service
# em CrashLoopBackOff com "invalid URL scheme").
#
#   export TF_VAR_rds_master_password='<A_SENHA_DO_APPLY>'
#   ./scripts/gerar-secrets.sh
#
# O arquivo gerado esta' no .gitignore - contem as senhas reais.
################################################################
set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DESTINO="$REPO/gitops/secrets.yaml"

SENHA="${TF_VAR_rds_master_password:-}"
if [ -z "$SENHA" ]; then
  echo "ERRO: exporte TF_VAR_rds_master_password com a senha usada no apply." >&2
  exit 1
fi

# A senha entra numa URL postgres://user:senha@host. Estes caracteres
# quebrariam o parsing e o pod subiria so' para falhar na conexao.
case "$SENHA" in
  *[@/:]*)
    echo "ERRO: a senha contem @, / ou : - caracteres que quebram a" >&2
    echo "      database_url. Refaca o apply com uma senha sem eles." >&2
    exit 1 ;;
esac

cd "$REPO/terraform"

echo "Lendo as saidas do terraform..."
RDS_JSON=$(terraform output -json rds_endpoints)
REDIS=$(terraform output -raw redis_endpoint)
SQS=$(terraform output -raw sqs_queue_url)

RDS_AUTH=$(printf '%s' "$RDS_JSON" | python -c "import json,sys; print(json.load(sys.stdin)['auth'])")
RDS_FLAG=$(printf '%s' "$RDS_JSON" | python -c "import json,sys; print(json.load(sys.stdin)['flag'])")
RDS_TARG=$(printf '%s' "$RDS_JSON" | python -c "import json,sys; print(json.load(sys.stdin)['targeting'])")

# Verificado no apply de 28/07/2026: o output devolve os RDS SEM a porta
# (host puro), ao contrario do que a doc antiga dizia. Sem porta explicita
# a URL ainda funciona (o driver assume 5432), mas deixar implicito e' o
# tipo de coisa que confunde na hora de depurar. Normaliza os dois casos.
porta_se_faltar() {
  case "$1" in
    *:[0-9]*) printf '%s' "$1" ;;
    *)        printf '%s:%s' "$1" "$2" ;;
  esac
}
RDS_AUTH=$(porta_se_faltar "$RDS_AUTH" 5432)
RDS_FLAG=$(porta_se_faltar "$RDS_FLAG" 5432)
RDS_TARG=$(porta_se_faltar "$RDS_TARG" 5432)
REDIS_HP=$(porta_se_faltar "$REDIS" 6379)

for v in RDS_AUTH RDS_FLAG RDS_TARG REDIS_HP SQS; do
  if [ -z "${!v}" ]; then
    echo "ERRO: saida vazia para $v - o apply terminou mesmo?" >&2
    exit 1
  fi
done

cat > "$DESTINO" <<YAML
################################################################
# GERADO POR scripts/gerar-secrets.sh - nao editar a mao.
# Contem senhas reais; esta' no .gitignore de proposito.
# Regerar a cada terraform apply: os endpoints mudam.
################################################################
apiVersion: v1
kind: Secret
metadata:
  name: auth-secrets
  namespace: togglemaster
type: Opaque
stringData:
  database_url: "postgres://togglemaster:${SENHA}@${RDS_AUTH}/auth_db"
  master_key:   "admin-secreto-123"
---
apiVersion: v1
kind: Secret
metadata:
  name: flag-secrets
  namespace: togglemaster
type: Opaque
stringData:
  database_url: "postgres://togglemaster:${SENHA}@${RDS_FLAG}/flag_db"
---
apiVersion: v1
kind: Secret
metadata:
  name: targeting-secrets
  namespace: togglemaster
type: Opaque
stringData:
  database_url: "postgres://togglemaster:${SENHA}@${RDS_TARG}/targeting_db"
---
apiVersion: v1
kind: Secret
metadata:
  name: evaluation-secrets
  namespace: togglemaster
type: Opaque
stringData:
  # O prefixo redis:// e' obrigatorio: o codigo usa redis.ParseURL().
  redis_addr:      "redis://${REDIS_HP}"
  sqs_queue_url:   "${SQS}"
  service_api_key: "admin-secreto-123"
---
apiVersion: v1
kind: Secret
metadata:
  name: analytics-secrets
  namespace: togglemaster
type: Opaque
stringData:
  # A mesma fila do evaluation: ele produz, o analytics consome.
  sqs_queue_url: "${SQS}"
YAML

echo "gerado: gitops/secrets.yaml"
echo
echo "conferencia (sem a senha):"
printf '  auth      %s\n' "$RDS_AUTH"
printf '  flag      %s\n' "$RDS_FLAG"
printf '  targeting %s\n' "$RDS_TARG"
printf '  redis     redis://%s\n' "$REDIS_HP"
printf '  sqs       %s\n' "$SQS"
echo
echo "aplicar com:"
echo "  kubectl apply -f gitops/namespace.yaml"
echo "  kubectl apply -f gitops/secrets.yaml"
