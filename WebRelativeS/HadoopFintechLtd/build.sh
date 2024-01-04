docker build . -t sc-hadoop-fintech-ltd
az acr login -n nipcontainerregistries
tag=`date '+%Y%m%d%H%M'`
docker tag sc-hadoop-fintech-ltd:latest nipcontainerregistries.azurecr.io/web/sc-hadoop-fintech-ltd:$tag
docker tag sc-hadoop-fintech-ltd:latest nipcontainerregistries.azurecr.io/web/sc-hadoop-fintech-ltd:latest
docker push nipcontainerregistries.azurecr.io/web/sc-hadoop-fintech-ltd:$tag
docker push nipcontainerregistries.azurecr.io/web/sc-hadoop-fintech-ltd:latest