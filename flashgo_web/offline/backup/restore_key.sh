#!/usr/bin/env bash

cat /datadrive/flashgo/redis_backup/$1 | bash redis_sale.prod -x restore $1 0
