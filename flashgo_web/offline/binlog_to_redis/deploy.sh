#!/usr/bin/env bash

rm function.zip

virtualenv v-env --system-site-packages
source v-env/bin/activate
pip install -r requirements.txt
deactivate

cd v-env/lib/python3.6/site-packages/
ls | grep -v redis | xargs rm -r
zip -r9  ../../../../function.zip .


cd ../../../../


zip -g function.zip function.py



aws lambda update-function-code --function-name flashgo_binlog_to_redis --zip-file fileb://function.zip

