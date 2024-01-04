#!/usr/bin/env bash

export PAYDAY_LOAN_ENV="prod"
export TDSVER=8.0
export PYTHONPATH="/root/sale_aggregator_service"
cd $PYTHONPATH

python3 push/handler_create_news.py
