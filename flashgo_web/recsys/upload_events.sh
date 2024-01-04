#!/usr/bin/env bash
export PAYDAY_LOAN_ENV="prod"
export TDSVER=8.0
export PYTHONPATH=/app/sale_aggregator_service
cd /app/sale_aggregator_service/recsys/ && python3 upload_events.py
