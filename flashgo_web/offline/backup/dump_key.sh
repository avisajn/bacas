#!/usr/bin/env bash

bash redis_sale.prod --raw dump $1 | head -c-1 > /datadrive/flashgo/redis_backup/$1