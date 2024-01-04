#!/usr/bin/env bash

SCRIPTPATH="$(
  cd "$(dirname "$0")"
  pwd -P
)"

function_name=$1
mods=$2
requirements_txt=$SCRIPTPATH/$3

rm function.zip
rm -r v-env

python3 -m venv v-env
source v-env/bin/activate
pip3 install -r ${requirements_txt}
deactivate

cd v-env/lib/python3.6/site-packages/

for mod in ${mods}; do
  cp -r "${SCRIPTPATH}/${mod}" .
done

zip -r9 ../../../../function.zip .

cd $SCRIPTPATH
# example bash lambda_deployer.sh flashgo_send_create_news_notification "push" push/lambdas/requirements.txt
aws lambda update-function-code --function-name ${function_name} --zip-file "fileb://function.zip"
