/**
 * Gera o Relatório de Entrega da Fase 4.
 *
 * Uso:
 *   npm install pdfmake
 *   node gerar_pdf_fase4.js
 *
 * Antes de gerar, preencha LINK_VIDEO abaixo e coloque os 4 prints
 * obrigatórios na pasta ./evidencias (ver constante EVIDENCIAS).
 */
const pdfmake = require("pdfmake");
const fs = require("fs");
const path = require("path");

// pdfmake 0.3 no Node não traz fontes registradas por padrão. Helvetica é uma
// das 14 fontes padrão do PDF, então basta declará-la (não precisa de arquivo).
pdfmake.addFonts({
  Helvetica: {
    normal: "Helvetica",
    bold: "Helvetica-Bold",
    italics: "Helvetica-Oblique",
    bolditalics: "Helvetica-BoldOblique",
  },
});

// ----------------------------------------------------------------
// Preencher antes de gerar
// ----------------------------------------------------------------
const LINK_VIDEO = "(link será inserido)";

const EVIDENCIAS = [
  {
    arquivo: "evidencias/01-grafana-dashboard.png",
    titulo: "Evidência 1 — Dashboard do Grafana",
    legenda:
      "Dashboard customizado 'ToggleMaster - Visão Geral', versionado no repositório como ConfigMap e importado automaticamente pelo sidecar do Grafana. Exibe recursos do cluster, taxa de requisições e latência p95 por microsserviço (métricas vindas do OpenTelemetry) e painel de logs em tempo real via Loki.",
  },
  {
    arquivo: "evidencias/02-datadog-trace.png",
    titulo: "Evidência 2 — Trace distribuído no APM (Datadog)",
    legenda:
      "Trace de uma requisição em /evaluate. A cascata mostra o span de entrada no evaluation-service e as chamadas paralelas ao flag-service e ao targeting-service, comprovando a propagação de contexto entre serviços.",
  },
  {
    arquivo: "evidencias/03-discord-chatops.png",
    titulo: "Evidência 3 — Notificação de incidente no ChatOps (Discord)",
    legenda:
      "Notificação detalhada enviada ao canal do Discord pelo contact point do Grafana no momento em que o alerta entrou em Firing, informando o alerta, o serviço afetado e a ação automática acionada.",
  },
  {
    arquivo: "evidencias/04-self-healing.png",
    titulo: "Evidência 4 — Execução da automação de Self-Healing",
    legenda:
      "Log do workflow 'Self-Healing' no GitHub Actions, disparado por repository_dispatch a partir do webhook do Grafana. Executa o rollout restart do deployment afetado e registra o estado dos pods antes e depois da ação corretiva.",
  },
];

// ----------------------------------------------------------------
const tableLayout = {
  hLineWidth: () => 0.5,
  vLineWidth: () => 0.5,
  hLineColor: () => "#cccccc",
  vLineColor: () => "#cccccc",
  paddingLeft: () => 8,
  paddingRight: () => 8,
  paddingTop: () => 6,
  paddingBottom: () => 6,
};

/** Monta o bloco de uma evidência; avisa no PDF se o print estiver faltando. */
function blocoEvidencia(ev) {
  const existe = fs.existsSync(path.join(__dirname, ev.arquivo));
  const conteudo = [{ text: ev.titulo, style: "h2" }];

  if (existe) {
    conteudo.push({
      image: path.join(__dirname, ev.arquivo),
      width: 480,
      margin: [0, 0, 0, 8],
    });
  } else {
    conteudo.push({
      text: `[ PRINT AUSENTE: ${ev.arquivo} ]`,
      color: "#cc0000",
      italics: true,
      margin: [0, 0, 0, 8],
    });
    console.warn(`AVISO: print não encontrado -> ${ev.arquivo}`);
  }

  conteudo.push({
    text: ev.legenda,
    fontSize: 10,
    color: "#555555",
    italics: true,
    margin: [0, 0, 0, 20],
  });

  return conteudo;
}

const docDefinition = {
  defaultStyle: { font: "Helvetica", fontSize: 11, lineHeight: 1.4 },
  pageMargins: [50, 60, 50, 60],
  content: [
    // ===== CAPA =====
    { text: "\n\n\n\n\n\n", fontSize: 6 },
    { text: "POSTECH — FIAP", style: "centered", fontSize: 14, bold: true, color: "#333333" },
    {
      text: "Pós-Graduação em Tecnologia",
      style: "centered",
      fontSize: 12,
      color: "#555555",
      margin: [0, 5, 0, 40],
    },
    {
      text: "Tech Challenge — Fase 4",
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
      text: "Observabilidade Total e Resposta Ativa",
      style: "centered",
      fontSize: 13,
      italics: true,
      color: "#666666",
      margin: [0, 0, 0, 10],
    },
    {
      text: "OpenTelemetry · Prometheus · Loki · Grafana · Datadog · PagerDuty · Self-Healing",
      style: "centered",
      fontSize: 10,
      color: "#888888",
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
    },
    { text: "", pageBreak: "after" },

    // ===== 1. IDENTIFICAÇÃO =====
    { text: "1. Identificação", style: "h1" },
    {
      table: {
        widths: [150, "*"],
        body: [
          [{ text: "Aluno", bold: true }, "Philipe de Oliveira Marchezini"],
          [{ text: "RM", bold: true }, "369453"],
          [{ text: "Discord", bold: true }, "philipemarchezini"],
          [
            { text: "Repositório", bold: true },
            {
              text: "github.com/PhilipeMarchezini/entrega_3",
              link: "https://github.com/PhilipeMarchezini/entrega_3",
              color: "#0066cc",
            },
          ],
          [{ text: "Vídeo", bold: true }, { text: LINK_VIDEO, italics: LINK_VIDEO.startsWith("(") }],
        ],
      },
      layout: tableLayout,
      margin: [0, 10, 0, 20],
    },

    // ===== 2. RESUMO =====
    { text: "2. Resumo da Entrega", style: "h1" },
    {
      text: "Esta fase adiciona observabilidade completa sobre a arquitetura construída nas fases anteriores: cinco microsserviços conteinerizados, infraestrutura provisionada por Terraform, pipelines DevSecOps no GitHub Actions e deploy no EKS gerenciado por GitOps com ArgoCD.",
      margin: [0, 0, 0, 10],
    },
    {
      text: "O problema descrito no enunciado — falha silenciosa no evaluation-service, seis horas até a equipe ser avisada e mais quatro procurando a causa em logs espalhados — foi atacado em quatro frentes: telemetria padronizada com OpenTelemetry, métricas e logs centralizados em Prometheus, Loki e Grafana, visibilidade profunda com APM comercial, e resposta automática a incidentes com alerta, plantão, ChatOps e self-healing.",
      margin: [0, 0, 0, 20],
    },

    // ===== 3. ARQUITETURA OTEL =====
    { text: "3. Arquitetura do OpenTelemetry", style: "h1" },
    {
      text: "O OTel Collector é a peça central da telemetria. As aplicações não conhecem os backends: emitem OTLP para um único endereço, e o Collector roteia cada sinal para o destino correto.",
      margin: [0, 0, 0, 10],
    },
    {
      text: [
        "aplicações (OTel SDK) --OTLP--> otel-collector (Deployment)\n",
        "        traces  -> Datadog (APM, Service Map)\n",
        "        metrics -> Datadog + exporter Prometheus (:8889)\n\n",
        "logs dos pods --> otel-collector-logs (DaemonSet, filelog)\n",
        "        logs    -> Loki (OTLP nativo) + Datadog\n\n",
        "Grafana <- datasources: Prometheus e Loki",
      ],
      fontSize: 9,
      color: "#333333",
      margin: [10, 0, 0, 12],
      preserveLeadingSpaces: true,
    },
    {
      text: "São dois Collectors por uma razão prática: log em arquivo é local ao nó e exige DaemonSet, enquanto o OTLP das aplicações precisa de um endereço estável, o que pede um Deployment com Service.",
      margin: [0, 0, 0, 10],
    },
    {
      text: "A instrumentação foi feita de duas formas. Nos serviços em Go (auth e evaluation), manualmente, com o SDK do OpenTelemetry e o handler otelhttp — Go é compilado e não permite injeção em tempo de execução. Nos três serviços em Python, de forma automática, com o opentelemetry-instrument no Dockerfile, sem alterar uma linha do código da aplicação.",
      margin: [0, 0, 0, 10],
    },
    {
      text: "No evaluation-service foi necessário propagar o context.Context da requisição por toda a cadeia de chamadas até as requisições HTTP de saída. Sem isso, cada serviço apareceria como um trace isolado e o Service Map não se formaria.",
      margin: [0, 0, 0, 10],
    },
    {
      text: [
        { text: "Benefício da abordagem: ", bold: true },
        "trocar o APM significa alterar um exporter no Collector, versionado no Git. Nenhuma aplicação é recompilada, e não há lock-in no SDK proprietário de um fornecedor.",
      ],
      margin: [0, 0, 0, 20],
    },

    // ===== 4. STACK OPENSOURCE =====
    { text: "4. Monitoramento Opensource (Métricas e Logs)", style: "h1" },
    {
      text: "Toda a stack foi adicionada ao repositório GitOps como Applications do ArgoCD que instalam Helm charts — o ArgoCD passa a gerenciar o próprio monitoramento.",
      margin: [0, 0, 0, 10],
    },
    {
      ul: [
        { text: [{ text: "Prometheus: ", bold: true }, "via kube-prometheus-stack, com node-exporter e kube-state-metrics. Faz scrape do exporter Prometheus do OTel Collector."] },
        { text: [{ text: "Loki: ", bold: true }, "modo SingleBinary com storage em filesystem. O modo distribuído exigiria bucket S3 e, com ele, uma IAM Role — impossível no AWS Academy."] },
        { text: [{ text: "Grafana: ", bold: true }, "datasources, dashboard, regra de alerta e contact points provisionados como código."] },
      ],
      margin: [0, 0, 0, 10],
    },
    {
      text: "O dashboard customizado reúne recursos do cluster (CPU e memória por nó, pods por deployment), a taxa de requisições e a latência p95 por microsserviço, a taxa de erros 5xx do auth-service e um painel de logs em tempo real vindo do Loki.",
      margin: [0, 0, 0, 20],
    },

    // ===== 5. ALERTAS E SELF-HEALING =====
    { text: "5. Alertas Inteligentes e Self-Healing", style: "h1" },
    {
      text: "O alerta dispara quando a taxa de respostas 5xx do auth-service ultrapassa 5% numa janela de cinco minutos, sustentada por pelo menos um minuto. A espera do 'for' é deliberada: alerta que dispara em pico momentâneo vira alerta que ninguém lê — combate direto a alert fatigue.",
      margin: [0, 0, 0, 10],
    },
    {
      text: "Um detalhe encontrado durante a implementação merece registro. O endpoint /validate do auth-service convertia qualquer erro de consulta — inclusive banco de dados inacessível — em HTTP 401. O serviço respondia 'chave inválida' quando o problema real era de infraestrutura, e nenhum 5xx era emitido. Era exatamente a falha silenciosa descrita no enunciado. O código foi corrigido para distinguir chave inexistente (401) de falha de infraestrutura (503), o que tornou o problema observável e o alerta possível.",
      margin: [0, 0, 0, 10],
    },
    {
      text: "Quando o alerta entra em Firing, três ações acontecem em paralelo:",
      margin: [0, 0, 0, 6],
    },
    {
      ol: [
        { text: [{ text: "PagerDuty: ", bold: true }, "incidente aberto automaticamente via Events API v2, com severidade crítica."] },
        { text: [{ text: "Discord (ChatOps): ", bold: true }, "notificação detalhada no canal do time, com alerta, serviço e runbook acionado."] },
        { text: [{ text: "Self-Healing: ", bold: true }, "webhook para a API do GitHub (repository_dispatch) aciona um workflow que autentica na AWS, obtém o kubeconfig do EKS e executa kubectl rollout restart no deployment afetado, registrando o estado dos pods antes e depois."] },
      ],
      margin: [0, 0, 0, 10],
    },
    {
      text: [
        { text: "Limite consciente da automação: ", bold: true },
        "o restart mitiga a classe de falha que restart resolve — memory leak, conexão presa, estado corrompido em memória. Quando a causa raiz é externa, como um firewall fechado, o restart não resolve, o incidente permanece aberto no PagerDuty e o plantonista assume. A automação não substitui o on-call: ela compra tempo para ele.",
      ],
      margin: [0, 0, 0, 20],
    },

    // ===== 6. EVIDÊNCIAS =====
    { text: "6. Evidências Visuais", style: "h1", pageBreak: "before" },
    ...EVIDENCIAS.flatMap(blocoEvidencia),

    // ===== 7. JUSTIFICATIVAS =====
    { text: "7. Justificativa das Escolhas", style: "h1", pageBreak: "before" },
    { text: "7.1 Datadog vs New Relic", style: "h2" },
    {
      text: "Ambos recebem OTLP nativamente, o que dispensa agente proprietário no cluster — vantagem relevante no AWS Academy, onde não é possível criar roles de IAM. O Datadog foi escolhido pela riqueza do Service Map e por ser a ferramenta mais difundida no mercado brasileiro, o que dá valor prático ao aprendizado.",
      margin: [0, 0, 0, 8],
    },
    {
      text: "A desvantagem é o trial de catorze dias, enquanto o New Relic oferece free tier permanente de 100 GB por mês. Como quem conversa com o APM é o Collector, e não a aplicação, migrar significa trocar um exporter e reaplicar o manifesto.",
      margin: [0, 0, 0, 14],
    },
    { text: "7.2 PagerDuty vs Opsgenie", style: "h2" },
    {
      text: "O Opsgenie foi absorvido pelo ecossistema Atlassian e o cadastro gratuito independente foi descontinuado, o que inviabiliza o uso em um projeto acadêmico. O PagerDuty mantém plano gratuito para times pequenos e sua Events API v2 é aceita nativamente pelo contact point do Grafana, sem intermediários.",
      margin: [0, 0, 0, 14],
    },
    { text: "7.3 Discord como ChatOps", style: "h2" },
    {
      text: "O Grafana tem contact point nativo para Discord, e o webhook de canal é criado em segundos, sem depender de aprovação administrativa de workspace — diferente do Slack, que exige criar e instalar um app.",
      margin: [0, 0, 0, 14],
    },
    { text: "7.4 GitHub Actions como motor de Self-Healing", style: "h2" },
    {
      text: "A automação reaproveita os secrets de AWS já usados pelos cinco pipelines e produz um log de execução auditável na aba Actions — evidência clara de que a ação corretiva ocorreu. As alternativas avaliadas (AWS Lambda e operador no cluster) exigiriam permissões de IAM indisponíveis no Academy ou expor um endpoint adicional.",
      margin: [0, 0, 0, 20],
    },

    // ===== 8. DESAFIOS =====
    { text: "8. Desafios Encontrados", style: "h1" },
    {
      ul: [
        {
          text: [
            { text: "Falha silenciosa no auth-service: ", bold: true },
            "erro de banco mascarado como 401. Sem a correção, o alerta de 5xx nunca dispararia.",
          ],
        },
        {
          text: [
            { text: "Propagação de contexto em Go: ", bold: true },
            "foi preciso alterar a assinatura de toda a cadeia de funções do evaluation-service para que o trace atravessasse os serviços.",
          ],
        },
        {
          text: [
            { text: "Restrições do AWS Academy: ", bold: true },
            "sem IAM Roles, o Loki roda com storage em disco em vez de S3, e o roteamento ao APM depende de API key em Secret em vez de IRSA.",
          ],
        },
        {
          text: [
            { text: "Capacidade do cluster: ", bold: true },
            "a stack de observabilidade não coube no node group original de 2x t3.medium; foi necessário redimensionar para 3x t3.large.",
          ],
        },
        {
          text: [
            { text: "Payload do webhook de Self-Healing: ", bold: true },
            "o repository_dispatch do GitHub exige o campo event_type, incompatível com o corpo padrão do webhook do Grafana. Resolvido com custom payload; um relay em cluster foi versionado como alternativa.",
          ],
        },
      ],
      margin: [0, 0, 0, 20],
    },

    // ===== 9. CÓDIGO =====
    { text: "9. Código no Repositório", style: "h1" },
    {
      ul: [
        "gitops/monitoring/ — Applications do ArgoCD para kube-prometheus-stack, Loki e os dois OTel Collectors, além do dashboard customizado",
        "auth-service-main/otel.go e evaluation-service-main/otel.go — instrumentação manual dos serviços em Go",
        "*/Dockerfile e */requirements.txt — instrumentação automática dos serviços em Python",
        ".github/workflows/self-healing.yml — automação de resposta ao incidente",
        "gitops/monitoring/setup-secrets.sh — criação dos Secrets fora do versionamento",
        "ROTEIRO-VIDEO-FASE4.md — roteiro e script de fala da demonstração",
        "terraform/ — infraestrutura como código das fases anteriores, atualizada",
      ],
      margin: [0, 0, 0, 10],
    },
    {
      text: "Nenhuma credencial foi versionada: chaves de API, integration key do PagerDuty, webhook do Discord e token do GitHub são injetados por Secrets do Kubernetes criados fora do Git.",
      margin: [0, 0, 0, 0],
    },
  ],
  styles: {
    h1: { fontSize: 16, bold: true, color: "#1a1a1a", margin: [0, 10, 0, 10] },
    h2: { fontSize: 13, bold: true, color: "#333333", margin: [0, 6, 0, 6] },
    centered: { alignment: "center" },
  },
};

const outPath = path.join(__dirname, "Relatorio_Entrega_Fase4.pdf");

// Em pdfmake 0.3 o getBuffer devolve uma Promise.
pdfmake
  .createPdf(docDefinition)
  .getBuffer()
  .then((buffer) => {
    fs.writeFileSync(outPath, buffer);
    console.log("PDF gerado em: " + outPath);
  })
  .catch((err) => {
    console.error("Falha ao gerar o PDF:", err);
    process.exit(1);
  });
