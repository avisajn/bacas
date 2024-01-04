import json
from typing import List

import boto3

from common.config import SQS_CONFIG
from common.proxy import LazyProxy


class SQSQueue(object):
    @property
    def queue_url(self):
        raise NotImplementedError

    @property
    def queue_name(self):
        raise NotImplementedError


class SQSQueueEntry(SQSQueue):
    def __init__(self, name, url):
        self.name = name
        self.url = url

    @property
    def queue_url(self):
        return self.url

    @property
    def queue_name(self):
        return self.name


class SQSMessage(object):
    def __init__(self, message, receipt_handle: str):
        self.message = message
        self.receipt_handle = receipt_handle


class SQSClient(object):
    def __init__(self, region_name,
                 aws_access_key_id,
                 aws_secret_access_key):
        self.client = boto3.client(
            'sqs',
            region_name=region_name,
            aws_access_key_id=aws_access_key_id,
            aws_secret_access_key=aws_secret_access_key
        )

    def send_message(self, queue: SQSQueue, message):
        self.client.send_message(
            QueueUrl=queue.queue_url,
            MessageBody=json.dumps(message, separators=(",", ":")),
            MessageAttributes={
                'message_type': {
                    'StringValue': queue.queue_name,
                    'DataType': 'String'
                }
            },
        )

    def receive_message(self, queue: SQSQueue, wait_time_seconds) -> List[SQSMessage]:
        messages = self.client.receive_message(
            QueueUrl=queue.queue_url,
            WaitTimeSeconds=wait_time_seconds,
            MessageAttributeNames=[
                'message_type'
            ],
        ).get("Messages", [])
        return [SQSMessage(json.loads(message.get('Body', '')), message.get('ReceiptHandle', '')) for message in
                messages if
                len(message.get('Body', '')) > 0]

    def delete_message(self, queue: SQSQueue, message: SQSMessage):
        self.client.delete_message(
            QueueUrl=queue.queue_url,
            ReceiptHandle=message.receipt_handle
        )


# noinspection PyTypeChecker
sqs_client = LazyProxy(SQSClient, **SQS_CONFIG)  # type: SQSClient
