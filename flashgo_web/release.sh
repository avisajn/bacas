#!/bin/sh
TAG=${1:-latest}
AWS_USER="aws-us"
REPOSITORY="239801832578.dkr.ecr.ap-southeast-1.amazonaws.com"

DOCKER_LOGIN=`aws ecr get-login --no-include-email --region ap-southeast-1`
${DOCKER_LOGIN}


function build_image() {
    local dockerfile=$1
    local image_name=$2

    docker rmi ${image_name}
    docker build . -t ${image_name} --rm -f ${dockerfile}

    # push to us repository
    if [ ${TAG} != "latest" ]; then
        docker rmi ${REPOSITORY}/${image_name}:v_${TAG}
    fi
    docker rmi ${REPOSITORY}/${image_name}:latest

    if [ ${TAG} != "latest" ]; then
        docker tag ${image_name}:latest ${REPOSITORY}/${image_name}:v_${TAG}
        docker push ${REPOSITORY}/${image_name}:v_${TAG}
    fi
    docker tag ${image_name}:latest ${REPOSITORY}/${image_name}:latest
    docker push ${REPOSITORY}/${image_name}:latest
}

build_image Dockerfile flashgo-api

CLUSTER="default"


aws ecs register-task-definition --profile ${AWS_USER} --region ap-southeast-1 --cli-input-json file://aws/taskdefinition.json
TASK_REVISION=`aws ecs describe-task-definition --profile ${AWS_USER} --region ap-southeast-1 --task-definition flashgo-service | egrep "revision" | tr "/" " " | awk '{print $2}' | sed 's/"$//'`
DESIRED_COUNT=`aws ecs describe-services --profile ${AWS_USER} --region ap-southeast-1 --service flashgo-service --cluster ${CLUSTER} | egrep "desiredCount" | tr "/" " " | awk '{if(NR==1)print $2}' | sed 's/,$//'`
aws ecs update-service --profile ${AWS_USER} --region ap-southeast-1 --cluster ${CLUSTER} --service flashgo-service --task-definition flashgo-service:${TASK_REVISION} --desired-count ${DESIRED_COUNT}
