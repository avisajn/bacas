#!/bin/sh
TAG=${1:-latest}
AWS_USER="aws-us"
REPOSITORY="239801832578.dkr.ecr.ap-southeast-1.amazonaws.com"

DOCKER_LOGIN=`aws ecr get-login --no-include-email --region ap-southeast-1`
${DOCKER_LOGIN}

docker rmi flashgo-webapp
docker build . -t flashgo-webapp --rm -f Dockerfile.webapp

# push to us repository
if [ ${TAG} != "latest" ]; then
    docker rmi ${REPOSITORY}/flashgo-webapp:v_${TAG}
fi
docker rmi ${REPOSITORY}/flashgo-webapp:latest

if [ ${TAG} != "latest" ]; then
    docker tag flashgo-webapp:latest ${REPOSITORY}/flashgo-webapp:v_${TAG}
    docker push ${REPOSITORY}/flashgo-webapp:v_${TAG}
fi
docker tag flashgo-webapp:latest ${REPOSITORY}/flashgo-webapp:latest
docker push ${REPOSITORY}/flashgo-webapp:latest

CLUSTER="default"


aws ecs register-task-definition --profile ${AWS_USER} --region ap-southeast-1 --cli-input-json file://aws/webapp.taskdefinition.json
TASK_REVISION=`aws ecs describe-task-definition --profile ${AWS_USER} --region ap-southeast-1 --task-definition flashgo-webapp | egrep "revision" | tr "/" " " | awk '{print $2}' | sed 's/"$//'`
DESIRED_COUNT=`aws ecs describe-services --profile ${AWS_USER} --region ap-southeast-1 --service flashgo-webapp --cluster ${CLUSTER} | egrep "desiredCount" | tr "/" " " | awk '{if(NR==1)print $2}' | sed 's/,$//'`
aws ecs update-service --profile ${AWS_USER} --region ap-southeast-1 --cluster ${CLUSTER} --service flashgo-webapp --task-definition flashgo-webapp:${TASK_REVISION} --desired-count ${DESIRED_COUNT}
