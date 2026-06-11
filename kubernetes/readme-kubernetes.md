# Deploying the Plankton AI Game on Kubernetes 

## Certificate Issuer

You must have a letsencrypt certificate issuer created and running already. This is set by the "cert-manager.io/cluster-issuer" line in the wobigong-deployment.yaml.
By default it expects one called letsencrypt-imfe. Change this if the name is different.

## Ensure Ingress allows configuration snippets

run the command: `kubectl edit cm ingress-nginx-controller --namespace=ingress-nginx`

and ensure you have the following below the line `apiVersion: v1`.

```
data:
  allow-snippet-annotations: "true"
  annotations-risk-level: Critical
```

If you don't do this you will get errors like:

```
error: ingresses.networking.k8s.io "ai-game-ingress" could not be patched: admission webhook "validate.nginx.ingress.kubernetes.io" denied the request: annotation group ConfigurationSnippet contains risky annotation based on ingress configuration
```

when deploying the configuration.

## Create the Namespace

`kubectl create namespace ai-game`

## Deploy the Configuration

`kubectl apply -f ai-game-deployment.yaml`
