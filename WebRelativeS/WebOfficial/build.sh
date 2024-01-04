npm i cnpm -g
cnpm install
npm run build
docker build . -t sc-homepage
az acr login -n nipcontainerregistries
tag=`date '+%Y%m%d%H%M'`
docker tag sc-homepage:latest nipcontainerregistries.azurecr.io/web/sc-homepage:$tag
docker tag sc-homepage:latest nipcontainerregistries.azurecr.io/web/sc-homepage:latest
docker push nipcontainerregistries.azurecr.io/web/sc-homepage:$tag
docker push nipcontainerregistries.azurecr.io/web/sc-homepage:latest