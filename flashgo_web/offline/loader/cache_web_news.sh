#!/usr/bin/env bash

for index in 1 2 3 4 5 6 7 8 9 0; do
  curl "http://dev.hadoop.network/sales/news/cache_web_feeds?start_pos=-1&index=${index}&force=true"
  curl "http://flashgo.online/sales/news/cache_web_feeds?start_pos=-1&index=${index}&force=false"
done
