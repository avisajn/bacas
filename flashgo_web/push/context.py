from push.config import REDIS_CLIENT_CONFIG
from common.config import SQS_CONFIG
from push.events import Sender, Receiver, SQSSender, SQSReceiver
from push.rate_limit import ServerRateLimit, UserRateLimit
from common.sqs_client import SQSClient


class Context(object):
    def __init__(self):
        self._sender = None
        self._receiver = None
        self._sqs_client = None
        self._server_rate_limit = None
        self._user_rate_limit = None

    @property
    def sqs_client(self) -> SQSClient:
        if self._sqs_client is not None:
            return self._sqs_client
        else:
            self._sqs_client = SQSClient(**SQS_CONFIG)
            return self._sqs_client

    @property
    def sender(self) -> Sender:
        if self._sender is not None:
            return self._sender
        else:
            self._sender = SQSSender(self.sqs_client)
            return self._sender

    @property
    def receiver(self) -> Receiver:
        if self._receiver is not None:
            return self._receiver
        else:
            self._receiver = SQSReceiver(self.sqs_client)
            return self._receiver

    @property
    def server_rate_limit(self) -> ServerRateLimit:
        return ServerRateLimit(1000)

    @property
    def user_rate_limit(self) -> UserRateLimit:
        return self.redis_user_rate_limit

    @property
    def redis_user_rate_limit(self) -> UserRateLimit:
        if self._user_rate_limit is None:
            self._user_rate_limit = UserRateLimit(**REDIS_CLIENT_CONFIG)
        return self._user_rate_limit


context = Context()
