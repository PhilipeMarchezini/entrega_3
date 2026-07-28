const pdfmake = require("pdfmake");
const fs = require("fs");

const docDefinition = {
  defaultStyle: { font: "Helvetica", fontSize: 11, lineHeight: 1.4 },
  pageMargins: [50, 60, 50, 60],
  content: [
    // ===== CAPA =====
    { text: "\n\n\n\n\n\n", fontSize: 6 },
    {
      text: "POSTECH — FIAP",
      style: "centered",
      fontSize: 14,
      bold: true,
      color: "#333333",
    },
    {
      text: "Pós-Graduação em Tecnologia",
      style: "centered",
      fontSize: 12,
      color: "#555555",
      margin: [0, 5, 0, 40],
    },
    {
      text: "Tech Challenge — Fase 3",
      style: "centered",
      fontSize: 24,
      bold: true,
      color: "#1a1a1a",
      margin: [0, 0, 0, 10],
    },
    {
      text: "Relatório de Entrega",
      style: "centered",
      fontSize: 18,
      color: "#444444",
      margin: [0, 0, 0, 50],
    },
    {
      text: "IaC, Pipeline DevSecOps, GitOps e ArgoCD",
      style: "centered",
      fontSize: 13,
      italics: true,
      color: "#666666",
      margin: [0, 0, 0, 60],
    },
    {
      text: "Philipe de Oliveira Marchezini",
      style: "centered",
      fontSize: 14,
      bold: true,
      margin: [0, 0, 0, 5],
    },
    { text: "RM: 369453", style: "centered", fontSize: 13, margin: [0, 0, 0, 60] },
    {
      text: "Ambiente: AWS Academy (Opção A)",
      style: "centered",
      fontSize: 11,
      color: "#666666",
      margin: [0, 0, 0, 5],
    },
    { text: "Maio de 2025", style: "centered", fontSize: 11, color: "#666666" },
    { text: "", pageBreak: "after" },

    // ===== DADOS DO PROJETO =====
    { text: "1. Identificação", style: "h1" },
    {
      table: {
        widths: [150, "*"],
        body: [
          [
            { text: "Aluno", bold: true },
            "Philipe de Oliveira Marchezini",
          ],
          [{ text: "RM", bold: true }, "369453"],
          [
            { text: "Repositório", bold: true },
            {
              text: "github.com/PhilipeMarchezini/entrega_3",
              link: "https://github.com/PhilipeMarchezini/entrega_3",
              color: "#0066cc",
            },
          ],
          [
            { text: "Vídeo", bold: true },
            { text: "(link será inserido)", italics: true, color: "#999999" },
          ],
        ],
      },
      layout: {
        hLineWidth: () => 0.5,
        vLineWidth: () => 0.5,
        hLineColor: () => "#cccccc",
        vLineColor: () => "#cccccc",
        paddingLeft: () => 8,
        paddingRight: () => 8,
        paddingTop: () => 6,
        paddingBottom: () => 6,
      },
      margin: [0, 10, 0, 20],
    },

    // ===== RESUMO DO PROJETO =====
    { text: "2. Resumo do Projeto", style: "h1" },
    {
      text: "O projeto ToggleMaster é uma plataforma de Feature Flags composta por cinco microsserviços, desenvolvida ao longo das fases do Tech Challenge da POSTECH. Na Fase 3, o objetivo foi abandonar a operação manual da Fase 2 e adotar práticas modernas de infraestrutura como código (IaC), DevSecOps e GitOps.",
      margin: [0, 0, 0, 10],
    },
    {
      text: "O ambiente utilizado é o AWS Academy (Opção A), reaproveitando a LabRole existente sem criar nenhuma IAM Role ou Policy nova, conforme exigido pelo enunciado.",
      margin: [0, 0, 0, 10],
    },
    {
      text: "Os quatro entregáveis cobrados foram implementados e demonstrados: (1) Infraestrutura como Código com Terraform, (2) Pipeline DevSecOps com GitHub Actions, (3) GitOps com atualização automática de tags e (4) ArgoCD para sincronização contínua dos microsserviços no cluster Kubernetes.",
      margin: [0, 0, 0, 20],
    },

    // ===== ENTREGÁVEL 1 =====
    { text: "3. Entregável 1 — Infraestrutura como Código (IaC)", style: "h1" },
    {
      text: "Toda a infraestrutura foi provisionada via Terraform, componentizado em módulos reutilizáveis:",
      margin: [0, 0, 0, 10],
    },
    {
      ul: [
        { text: [{ text: "Networking: ", bold: true }, "VPC com subnets públicas e privadas, Internet Gateway e route tables."] },
        { text: [{ text: "EKS: ", bold: true }, "Cluster Kubernetes gerenciado com node group (2x t3.medium)."] },
        { text: [{ text: "RDS: ", bold: true }, "3 instâncias PostgreSQL (db.t3.micro) para auth, flag e targeting."] },
        { text: [{ text: "ElastiCache: ", bold: true }, "1 cluster Redis (t3.micro) para cache."] },
        { text: [{ text: "DynamoDB: ", bold: true }, "Tabela ToggleMasterAnalytics em modo on-demand."] },
        { text: [{ text: "SQS: ", bold: true }, "Fila de eventos para comunicação assíncrona."] },
        { text: [{ text: "ECR: ", bold: true }, "5 repositórios de imagens Docker (um por microsserviço)."] },
        { text: [{ text: "ArgoCD: ", bold: true }, "Instalado via Helm pelo próprio Terraform."] },
      ],
      margin: [0, 0, 0, 10],
    },
    {
      text: [
        { text: "Backend remoto: ", bold: true },
        "O terraform.tfstate é armazenado em bucket S3 com versionamento e encrypt habilitados, conforme exigido pelo enunciado. Não fica local.",
      ],
      margin: [0, 0, 0, 10],
    },
    {
      text: [
        { text: "LabRole (Opção A): ", bold: true },
        "A LabRole do AWS Academy é importada via data source e reutilizada como role_arn do cluster EKS e node_role_arn do node group. Nenhuma IAM Role ou Policy é criada pelo Terraform.",
      ],
      margin: [0, 0, 0, 20],
    },

    // ===== ENTREGÁVEL 2 =====
    { text: "4. Entregável 2 — Pipeline DevSecOps", style: "h1" },
    {
      text: "Cada microsserviço possui um workflow dedicado no GitHub Actions com quatro estágios:",
      margin: [0, 0, 0, 10],
    },
    {
      ol: [
        { text: [{ text: "Build & Unit Test: ", bold: true }, "Compila o código e executa os testes unitários."] },
        { text: [{ text: "Linter: ", bold: true }, "golangci-lint para serviços em Go e flake8 para serviços em Python."] },
        { text: [{ text: "Security Scan: ", bold: true }, "SAST com gosec (Go) ou bandit (Python), e SCA + container scan com Trivy."] },
        { text: [{ text: "Docker Build & Push: ", bold: true }, "Build da imagem, scan com Trivy, push para o ECR com tag no formato v1.0.0-<commit_hash>."] },
      ],
      margin: [0, 0, 0, 10],
    },
    {
      text: [
        { text: "Regra de bloqueio: ", bold: true },
        "O Trivy está configurado com severity: CRITICAL e exit-code: 1. Se uma vulnerabilidade crítica for encontrada, o pipeline falha e a imagem não é publicada no ECR, impedindo que código vulnerável chegue ao cluster.",
      ],
      margin: [0, 0, 0, 10],
    },
    {
      text: [
        { text: "Demonstração: ", bold: true },
        "Conforme solicitado pelo enunciado, introduzi uma dependência vulnerável de propósito (requests==2.6.0 com CVE crítico conhecido) no flag-service. O pipeline falhou no passo de segurança. Após corrigir para uma versão segura (requests>=2.32.0), o pipeline passou com sucesso — build, lint, security e docker, todos verdes.",
      ],
      margin: [0, 0, 0, 20],
    },

    // ===== ENTREGÁVEL 3 =====
    { text: "5. Entregável 3 — GitOps", style: "h1" },
    {
      text: "O pipeline de CI/CD não executa kubectl apply diretamente. Em vez disso, um job final chamado update-gitops atualiza automaticamente a tag da imagem no arquivo deployment.yaml do respectivo serviço dentro da pasta gitops/apps/.",
      margin: [0, 0, 0, 10],
    },
    {
      text: "O commit é feito pelo GitHub Actions Bot com a mensagem ci(<serviço>): bump image to v1.0.0-<hash>, alterando apenas a linha da tag da imagem. O repositório Git passa a ser a fonte da verdade do que está rodando no cluster.",
      margin: [0, 0, 0, 20],
    },

    // ===== ENTREGÁVEL 4 =====
    { text: "6. Entregável 4 — ArgoCD", style: "h1" },
    {
      text: "O ArgoCD foi instalado pelo próprio Terraform (módulo argocd via Helm) e gerencia os cinco microsserviços:",
      margin: [0, 0, 0, 10],
    },
    {
      ul: [
        "auth-service (Go)",
        "flag-service (Python)",
        "targeting-service (Python)",
        "evaluation-service (Go)",
        "analytics-service (Python)",
      ],
      margin: [0, 0, 0, 10],
    },
    {
      text: "Todos estão configurados com auto-sync e self-heal. Quando o pipeline atualiza a tag da imagem no repositório Git, o ArgoCD detecta a mudança automaticamente, baixa o deployment.yaml atualizado e sincroniza a nova versão no cluster — sem nenhum kubectl apply manual. O fluxo GitOps é fechado de ponta a ponta.",
      margin: [0, 0, 0, 20],
    },

    // ===== ARQUITETURA =====
    { text: "7. Arquitetura dos Microsserviços", style: "h1" },
    {
      table: {
        headerRows: 1,
        widths: [110, 55, "*"],
        body: [
          [
            { text: "Serviço", bold: true, fillColor: "#e8e8e8" },
            { text: "Linguagem", bold: true, fillColor: "#e8e8e8" },
            { text: "Responsabilidade", bold: true, fillColor: "#e8e8e8" },
          ],
          ["auth-service", "Go", "Autenticação JWT, gerenciamento de usuários. Banco: RDS PostgreSQL."],
          ["flag-service", "Python", "CRUD de feature flags. Banco: RDS PostgreSQL. Cache: ElastiCache Redis."],
          ["targeting-service", "Python", "Regras de segmentação de usuários para feature flags. Banco: RDS PostgreSQL."],
          ["evaluation-service", "Go", "Avaliação em tempo real das flags para um usuário. Consome regras do targeting e publica eventos na SQS."],
          ["analytics-service", "Python", "Consome eventos da SQS e armazena métricas de uso no DynamoDB."],
        ],
      },
      layout: {
        hLineWidth: () => 0.5,
        vLineWidth: () => 0.5,
        hLineColor: () => "#cccccc",
        vLineColor: () => "#cccccc",
        paddingLeft: () => 6,
        paddingRight: () => 6,
        paddingTop: () => 5,
        paddingBottom: () => 5,
      },
      margin: [0, 10, 0, 20],
    },

    // ===== DESAFIOS =====
    { text: "8. Desafios Encontrados e Decisões Tomadas", style: "h1" },
    {
      ul: [
        {
          text: [
            { text: "LabRole imutável (Opção A): ", bold: true },
            "Não foi possível criar IAM via Terraform. Decisão: usar data \"aws_iam_role\" \"lab_role\" e reaproveitar o ARN no cluster e nos nodes.",
          ],
          margin: [0, 0, 0, 6],
        },
        {
          text: [
            { text: "Sem NAT Gateway (custo do Academy): ", bold: true },
            "Subi o node group em subnet pública para ter saída de internet sem precisar de NAT, mantendo as subnets privadas para os bancos.",
          ],
          margin: [0, 0, 0, 6],
        },
        {
          text: [
            { text: "Sessão temporária do Academy: ", bold: true },
            "O AWS_SESSION_TOKEN expira em horas, então o GitHub Actions usa os três secrets (key, secret e token) e eu renovo a cada sessão.",
          ],
          margin: [0, 0, 0, 6],
        },
        {
          text: [
            { text: "Bloqueio em CRITICAL no Trivy: ", bold: true },
            "Configurei severity: CRITICAL, exit-code: 1 e ignore-unfixed: true para falhar apenas em vulnerabilidades críticas que já tenham fix.",
          ],
          margin: [0, 0, 0, 6],
        },
        {
          text: [
            { text: "Senhas fora do código: ", bold: true },
            "O rds_master_password é lido via env TF_VAR_* e as credenciais dos serviços ficam em Secrets do Kubernetes, resolvendo o problema da Fase 2 de credenciais em texto puro.",
          ],
          margin: [0, 0, 0, 6],
        },
        {
          text: [
            { text: "Ordem de instalação do ArgoCD: ", bold: true },
            "Ele depende do node group estar READY, então o módulo declara depends_on = [module.eks].",
          ],
          margin: [0, 0, 0, 6],
        },
      ],
      margin: [0, 0, 0, 20],
    },

    // ===== ESTIMATIVA DE CUSTOS =====
    { text: "9. Estimativa de Custos da AWS", style: "h1" },
    {
      table: {
        headerRows: 1,
        widths: [150, 40, 120],
        body: [
          [
            { text: "Recurso", bold: true, fillColor: "#e8e8e8" },
            { text: "Qtd", bold: true, fillColor: "#e8e8e8", alignment: "center" },
            { text: "Estimativa mensal (USD)", bold: true, fillColor: "#e8e8e8", alignment: "right" },
          ],
          ["EKS Control Plane", { text: "1", alignment: "center" }, { text: "~ $73", alignment: "right" }],
          ["EC2 t3.medium (nodes)", { text: "2", alignment: "center" }, { text: "~ $60", alignment: "right" }],
          ["RDS db.t3.micro", { text: "3", alignment: "center" }, { text: "~ $42", alignment: "right" }],
          ["ElastiCache t3.micro", { text: "1", alignment: "center" }, { text: "~ $12", alignment: "right" }],
          ["DynamoDB on-demand", { text: "1", alignment: "center" }, { text: "~ $1 (uso baixo)", alignment: "right" }],
          ["SQS", { text: "1", alignment: "center" }, { text: "~ $0 (free tier)", alignment: "right" }],
          ["ECR", { text: "5", alignment: "center" }, { text: "~ $1", alignment: "right" }],
          ["ELB (ArgoCD)", { text: "1", alignment: "center" }, { text: "~ $18", alignment: "right" }],
          [
            { text: "Total", bold: true, fillColor: "#f0f0f0" },
            { text: "", fillColor: "#f0f0f0" },
            { text: "~ $207/mês 24x7", bold: true, alignment: "right", fillColor: "#f0f0f0" },
          ],
        ],
      },
      layout: {
        hLineWidth: () => 0.5,
        vLineWidth: () => 0.5,
        hLineColor: () => "#cccccc",
        vLineColor: () => "#cccccc",
        paddingLeft: () => 8,
        paddingRight: () => 8,
        paddingTop: () => 5,
        paddingBottom: () => 5,
      },
      margin: [0, 10, 0, 10],
    },
    {
      text: "No AWS Academy, na prática paga-se apenas as horas do Lab ativo, então o custo real de demonstração é significativamente menor.",
      italics: true,
      color: "#666666",
      fontSize: 10,
      margin: [0, 5, 0, 20],
    },

    // ===== CONCLUSÃO =====
    { text: "10. Conclusão", style: "h1" },
    {
      text: "Todos os quatro entregáveis da Fase 3 foram implementados com sucesso:",
      margin: [0, 0, 0, 10],
    },
    {
      ol: [
        {
          text: [
            { text: "IaC: ", bold: true },
            "Terraform componentizado em módulos, tfstate remoto no S3 e reaproveitamento da LabRole conforme a Opção A.",
          ],
          margin: [0, 0, 0, 4],
        },
        {
          text: [
            { text: "Pipeline DevSecOps: ", bold: true },
            "Build, lint, SAST, SCA e container scan com regra de bloqueio em vulnerabilidade crítica — demonstrado falhando e passando.",
          ],
          margin: [0, 0, 0, 4],
        },
        {
          text: [
            { text: "GitOps: ", bold: true },
            "Pipeline atualiza automaticamente a tag da imagem no repositório de manifestos.",
          ],
          margin: [0, 0, 0, 4],
        },
        {
          text: [
            { text: "ArgoCD: ", bold: true },
            "Gerencia os cinco microsserviços com auto-sync e self-heal, fechando o fluxo GitOps de ponta a ponta.",
          ],
          margin: [0, 0, 0, 4],
        },
      ],
      margin: [0, 0, 0, 10],
    },
    {
      text: "Todo o código-fonte — Terraform, workflows do GitHub Actions e manifestos Kubernetes — está disponível no repositório indicado na seção de identificação.",
      margin: [0, 0, 0, 0],
    },
  ],
  styles: {
    h1: {
      fontSize: 16,
      bold: true,
      color: "#1a1a1a",
      margin: [0, 10, 0, 10],
    },
    centered: {
      alignment: "center",
    },
  },
};

const outPath = "/mnt/c/Users/phili/Desktop/Entrega - Fase 3/Relatorio_Entrega_Fase3.pdf";
const pdfDoc = pdfmake.createPdf(docDefinition);
pdfDoc.getBuffer((buffer) => {
  fs.writeFileSync(outPath, buffer);
  console.log("PDF gerado em: " + outPath);
});
