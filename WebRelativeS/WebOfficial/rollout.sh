kubectl set image deployments.apps/homepage homepage=nipcontainerregistries.azurecr.io/web/sc-homepage:latest --namespace=social-ecommerce-production --record=true
kubectl rollout status deployment/homepage --namespace=social-ecommerce-production
