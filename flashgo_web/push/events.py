from typing import List

from push.config import PushQueue
from push.models import PushItem
from common.sqs_client import SQSClient


class Sender(object):
    """
    发送推送到队列中
    """

    def send(self, queue: PushQueue, *push_items: PushItem):
        raise NotImplementedError


class SQSSender(Sender):
    def __init__(self, sqs_client: SQSClient):
        self.sqs_client = sqs_client

    def send(self, queue: PushQueue, *push_items: PushItem):
        # TODO 根据消息大小，进行自动切分，每个不要超过 256K
        # 需要测试下，正常最多可以同时发多少条请求
        self.sqs_client.send_message(queue, [item.to_dict() for item in push_items])


class Receiver(object):
    """
    获取推送的数据
    """

    def get_messages(self, queue: PushQueue, timeout) -> List[PushItem]:
        raise NotImplementedError


class SQSReceiver(Receiver):
    def __init__(self, sqs_client: SQSClient):
        self.sqs_client = sqs_client

    def get_messages(self, queue, timeout) -> List[PushItem]:
        message_list = self.sqs_client.receive_message(queue, timeout)
        push_items = []  # type: List[PushItem]
        for message in message_list:
            self.sqs_client.delete_message(queue, message)
            for item in message.message:
                push_items.append(PushItem.parse(item))
        return push_items
