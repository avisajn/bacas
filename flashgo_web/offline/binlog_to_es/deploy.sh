#!/usr/bin/env bash

rm function.zip

virtualenv v-env
source v-env/bin/activate
pip install -r requirements.txt
deactivate

cd v-env/lib/python3.6/site-packages/
zip -r9  ../../../../function.zip .

cd ../../../../

zip -g function.zip function.py

aws lambda update-function-code --function-name flashgo_binlog_to_es --zip-file fileb://function.zip

