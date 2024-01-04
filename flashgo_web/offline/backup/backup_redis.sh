#!/usr/bin/env bash

# 用于备份redis重要的key
cd $(dirname "$0")

cat import_keys | grep -v '#' | xargs -n 1 bash dump_key.sh
