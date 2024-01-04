# 和客户端的推送协议
from push.models import PushItem


class DataMessageItem(object):
    @property
    def batch_id(self):
        raise NotImplementedError

    @property
    def content_id(self):
        return 0


class _DataMessageItem(DataMessageItem):
    def __init__(self, batch_id, content_id):
        self._batch_id = batch_id
        self._content_id = content_id

    @property
    def batch_id(self):
        return self._batch_id

    @property
    def content_id(self):
        return self._content_id


class DataMessage(DataMessageItem):
    def __init__(self, name):
        self.name = name

    @property
    def batch_id(self):
        return self.get_data_message().get('batchId', '')

    def get_data_message(self):
        raise NotImplementedError()


class Retention(DataMessage):
    def __init__(self, batch_id, money):
        super().__init__('retention')
        self._batch_id = batch_id
        self.title = 'Ada Rp %s di akun Anda, cek dan dapatkan lebih banyak!' % money

    @property
    def batch_id(self):
        return self._batch_id

    def get_data_message(self):
        return {
            'title': self.title,
            'click_action': 'FLUTTER_NOTIFICATION_CLICK',
            'routeName': 'wallet',
            'batchId': self.batch_id,
        }


class Login(DataMessage):
    def get_data_message(self):
        pass


class Remind(DataMessage):
    def get_data_message(self):
        pass


class Daily(DataMessage):
    def get_data_message(self):
        pass


class Item(DataMessage):
    # TODO 区分下文章各种类型的推送
    def get_data_message(self):
        pass

    def get_content_id(self):
        pass


def parse(push_item: PushItem) -> DataMessageItem:
    keys = ['videoId', 'dealId', 'commentId', 'id']
    batch_id = push_item.data_message.get('batchId', '')
    content_id = 0
    for key in keys:
        if key in push_item.data_message:
            content_id = push_item.data_message[key]
            break
    return _DataMessageItem(batch_id, content_id)
