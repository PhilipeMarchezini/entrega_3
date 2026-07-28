#!/bin/bash
################################################################
# Cria os Secrets que a stack de observabilidade precisa.
#
# Estes valores NAO vao para o Git - rode este script uma vez, com
# as chaves reais exportadas no ambiente, antes de sincronizar o
# ArgoCD.
#
#   export DD_API_KEY=...                  # Datadog > Organization Settings > API Keys
#   export PAGERDUTY_INTEGRATION_KEY=...   # PagerDuty > Service > Integrations > Events API v2
#   export DISCORD_WEBHOOK_URL=...         # Discord > Canal > Editar > Integracoes > Webhooks
#   export GITHUB_PAT=...                  # GitHub > PAT com escopo "repo"
#
#   ./gitops/monitoring/setup-secrets.sh
################################################################
set -euo pipefail

NAMESPACE=observability

for var in DD_API_KEY PAGERDUTY_INTEGRATION_KEY DISCORD_WEBHOOK_URL GITHUB_PAT; do
  if [ -z "${!var:-}" ]; then
    echo "ERRO: variavel $var nao definida." >&2
    exit 1
  fi
done

kubectl create namespace "$NAMESPACE" --dry-run=client -o yaml | kubectl apply -f -

# Usado pelos dois OTel Collectors para exportar traces/metricas/logs ao Datadog.
kubectl create secret generic datadog-api-key \
  --namespace "$NAMESPACE" \
  --from-literal=api-key="$DD_API_KEY" \
  --dry-run=client -o yaml | kubectl apply -f -

# Interpolado pelo Grafana nos arquivos de provisionamento de alerting.
kubectl create secret generic grafana-alerting-secrets \
  --namespace "$NAMESPACE" \
  --from-literal=PAGERDUTY_INTEGRATION_KEY="$PAGERDUTY_INTEGRATION_KEY" \
  --from-literal=DISCORD_WEBHOOK_URL="$DISCORD_WEBHOOK_URL" \
  --from-literal=GITHUB_PAT="$GITHUB_PAT" \
  --dry-run=client -o yaml | kubectl apply -f -

echo "Secrets criados no namespace '$NAMESPACE':"
kubectl get secrets -n "$NAMESPACE" datadog-api-key grafana-alerting-secrets
