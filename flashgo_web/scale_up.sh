#!/bin/sh
NODE_NUM=${1:-4}
SERVICE_NUM=${2:-3}

aws autoscaling set-desired-capacity --auto-scaling-group-name cekiceki-auto-scaling --desired-capacity ${NODE_NUM}
aws ecs update-service --service flashgo-service --desired-count ${SERVICE_NUM}