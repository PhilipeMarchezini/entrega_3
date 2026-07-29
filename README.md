# ToggleMaster — Tech Challenge Fase 4

Plataforma de feature flags em 5 microsserviços, com observabilidade completa:
OpenTelemetry, Prometheus, Loki, Grafana, Datadog (APM), PagerDuty, ChatOps no Discord
e self-healing automatizado.

---

## Estrutura

| Caminho | O que é |
|---|---|
| `terraform/` | Infraestrutura: VPC, EKS, 3 RDS, ElastiCache, DynamoDB, SQS, ECR, ArgoCD |
| `gitops/apps/` | Deployments, HPAs e Ingress dos 5 microsserviços |
| `gitops/monitoring/` | Stack de observabilidade como Applications do ArgoCD |
| `gitops/argocd/applications.yaml` | App-of-apps: registra tudo no ArgoCD |
| `.github/workflows/` | 5 pipelines de CI com DevSecOps + workflow de self-healing |
| `*-service-main/` | Código dos microsserviços (2 em Go, 3 em Python) |
| `evidencias/` | Prints obrigatórios do relatório |

---

## Como subir

Requer AWS CLI autenticado, Terraform ≥ 1.6 e kubectl.

### 1. Infraestrutura

```bash
cd terraform
export TF_VAR_rds_master_password='<SENHA_SEM @ / :>'
terraform init
terraform apply -auto-approve

aws eks update-kubeconfig --name togglemaster-hml-eks --region us-east-1
```

> O backend fica num bucket S3 cujo nome carrega o ID da conta
> (`terraform/backend.tf`). Crie o bucket antes do primeiro `init`.

### 2. Secrets

As chaves das integrações externas nunca entram no Git — só os nomes dos Secrets são
referenciados nos manifestos.

```bash
# Observabilidade: Datadog, PagerDuty, Discord e um PAT do GitHub com escopo repo
export DD_API_KEY='...'
export PAGERDUTY_INTEGRATION_KEY='...'
export DISCORD_WEBHOOK_URL='...'
export GITHUB_PAT='...'
./gitops/monitoring/setup-secrets.sh

# Aplicações: gerado a partir das saídas do Terraform
export TF_VAR_rds_master_password='<A_MESMA_SENHA>'
./scripts/gerar-secrets.sh

kubectl apply -f gitops/namespace.yaml
kubectl apply -f gitops/secrets.yaml
```

### 3. Bancos de dados

O `terraform apply` cria as instâncias RDS vazias. Este Job aplica o schema e semeia a
API key de serviço e as flags de demonstração:

```bash
kubectl apply -f gitops/db-init-job.yaml
kubectl wait --for=condition=complete job/db-init -n togglemaster --timeout=180s
```

### 4. GitOps

```bash
kubectl apply -f gitops/argocd/applications.yaml
kubectl get applications -n argocd
```

O ArgoCD instala a stack de observabilidade e sincroniza os microsserviços. As imagens
vêm do ECR, publicadas pelos pipelines do GitHub Actions.

Os workflows aceitam `workflow_dispatch`: depois de recriar o ECR, dispare os 5 pela aba
**Actions** para republicar as imagens.

---

## Secrets necessários no GitHub

Em **Settings → Secrets and variables → Actions**:

`AWS_ACCESS_KEY_ID` · `AWS_SECRET_ACCESS_KEY` · `AWS_SESSION_TOKEN` · `DISCORD_WEBHOOK_URL`

---

## Demonstração do incidente

Injeta uma falha no banco do auth-service, que passa a responder 503. O alerta do Grafana
dispara, abre incidente no PagerDuty, notifica o Discord e aciona o workflow de
self-healing.

```bash
kubectl apply -f gitops/incidente-quebrar.yaml     # quebrar
kubectl apply -f gitops/incidente-restaurar.yaml   # restaurar
```

Job é imutável — apague antes de repetir:

```bash
kubectl delete job quebrar-auth restaurar-auth -n togglemaster
```

---

## Observações de ambiente

Provisionado no **AWS Academy**, que não permite criar IAM Roles. Duas consequências:

- Cluster e nodes usam a `LabRole` existente, importada por data source
- Sem IRSA: o Loki roda em modo single binary com storage local em vez de S3, e o
  Prometheus usa `emptyDir` em vez de PVC — o cluster não tem o addon
  `aws-ebs-csi-driver`, então qualquer PersistentVolumeClaim ficaria `Pending`

O `gitops/secrets.yaml` está no `.gitignore`: contém as senhas reais dos bancos. O que
vai versionado é o `gitops/secrets-template.yaml`, com placeholders.
