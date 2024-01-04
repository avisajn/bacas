#!/usr/bin/env bash

# 用于恢复重要的key

# 用于备份redis重要的key
cd $(dirname "$0")

cat import_keys | xargs -n 1 bash restore_key.sh
