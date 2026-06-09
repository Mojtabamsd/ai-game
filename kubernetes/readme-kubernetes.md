# Deploying the Plankton AI Game on Kubernetes 

## Certificate Issuer

You must have a letsencrypt certificate issuer created and running already. This is set by the "cert-manager.io/cluster-issuer" line in the wobigong-deployment.yaml.
By default it expects one called letsencrypt-imfe. Change this if the name is different.

## Create the Namespace

`kubectl create namespace ai-game`

## Deploy the Configuration

`kubectl apply -f ai-game-deployment.yaml`
