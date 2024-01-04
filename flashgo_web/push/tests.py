from push.config import PushQueue
from push.context import context
from push.forms import Retention
from push.models import PushItem, PushUser


def _test():
    sender = context.sender
    retention_info = Retention('test', 1000)
    item = PushItem([PushUser('test',
                              'd4JB9n6PUEU:APA91bFfQmfg0LvHEhOPut8j2hRaQ66Tt07H3q0_VS2EE-UoGh88d0H2vLCt8h0iERRH_dY-1btwa8fOVhZF66LOW_3dbr1zh8G_K1VPrJERoj8vS2u213sXmuI3RT7e-lo7Zjhf8GsR')],
                    'test', data_message=retention_info.get_data_message())
    sender.send(PushQueue.PUSH_P1, item)


if __name__ == '__main__':
    _test()
