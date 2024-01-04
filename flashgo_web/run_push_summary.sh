#!/usr/bin/env bash
export PAYDAY_LOAN_ENV="prod"
export TDSVER=8.0

python3 manage.py parse_push_log