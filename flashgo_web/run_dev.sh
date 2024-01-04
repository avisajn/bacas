#!/bin/sh
docker build -t aggregator-test -f ./test.Dockerfile .

docker rm -f aggregator

docker run -d --rm --name aggregator \
-v /datadrive/Paydayloan/test:/datadrive/Paydayloan/test \
-h aggregator \
aggregator-test
