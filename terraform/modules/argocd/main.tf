################################################################
# ArgoCD instalado no EKS via Helm
################################################################

resource "kubernetes_namespace" "argocd" {
  metadata {
    name = "argocd"
  }
}

resource "helm_release" "argocd" {
  name       = "argocd"
  repository = "https://argoproj.github.io/argo-helm"
  chart      = "argo-cd"
  version    = "7.6.12"
  namespace  = kubernetes_namespace.argocd.metadata[0].name

  # Expõe a UI via LoadBalancer (no Academy o ELB é gratuito de criar)
  set =[{ 
    name  = "server.service.type"
    value = "LoadBalancer"
  },
{
    name  = "configs.params.server\\.insecure"
    value = "true"
  }]

  timeout = 900
}
