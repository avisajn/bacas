FROM 239801832578.dkr.ecr.ap-southeast-1.amazonaws.com/nip-python
MAINTAINER zhouhuan

RUN echo "for update docker cache"
RUN apt update
RUN apt install -y apt-utils build-essential python3-dev uwsgi-plugin-python3 redis-tools mysql-client

RUN mkdir -p /datadrive/flashgo/logs/python
RUN mkdir -p /app/sale_aggregator_service
RUN mkdir -p /datadrive/flashgo/static


ADD ./ /app/sale_aggregator_service

WORKDIR /app/sale_aggregator_service

RUN pip install -r requirements.txt --upgrade
RUN pip install django
RUN python --version

ENV PAYDAY_LOAN_ENV prod
ENV BAN_CRAWLER_API true
ENV GOOGLE_APPLICATION_CREDENTIALS /app/sale_aggregator_service/common/google_pubsub_credentials.json
