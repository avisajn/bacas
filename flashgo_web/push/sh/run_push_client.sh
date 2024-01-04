#!/usr/bin/env bash

export PAYDAY_LOAN_ENV="prod"
export TDSVER=8.0
export PYTHONPATH="/root/sale_aggregator_service"
cd $PYTHONPATH

while true
do
    cmd="python3 push/push_client.py"
    eval ${cmd}
    wait
    sleep 10
done

