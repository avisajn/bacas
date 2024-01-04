import time
from datetime import datetime
from typing import List

from sqlalchemy import Column, String, Float, create_engine
from sqlalchemy.dialects.mssql import DATETIMEOFFSET
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from common import utils, loggers, userutils
from common.redisclient import redis_client
from push.config import PushQueue, gen_batch_id
from push.context import Context
from push.models import PushUser, PushItem

context = Context()
BATCH_SIZE = 100

logger = loggers.get_push_logger(__name__)

Base = declarative_base()


class InviteCode(Base):
    __tablename__ = "InviteCode"

    user_id = Column(String(256), name="UserId", primary_key=True)
    code = Column(String(256), name="Code")
    money = Column(Float, name="Money")
    contribute = Column(Float, name="Contribute")
    timestamp = Column(DATETIMEOFFSET, name="Timestamp")
    update_time = Column(DATETIMEOFFSET, name="UpdateTime")
    token = Column(String(256), name="Token")


class BacaDbClient(object):
    def __init__(self, connection_string):
        engine = create_engine(connection_string)
        Session = sessionmaker(bind=engine)
        self.session = Session()

    def get_users_with_balance(self) -> dict:
        ret = dict()
        try:
            for invite_code in self.session.query(InviteCode).filter(InviteCode.money > 0).all():
                ret.setdefault(invite_code.money, list()).append(invite_code.user_id)
        finally:
            self.session.close()
        return ret


def main():
    baca_db_client = BacaDbClient(
        connection_string='mssql+pymssql://baca@zgp0k2xr0i:5Qiei!dfQh@zgp0k2xr0i.database.windows.net:1433/flashgo')
    balance_dict = baca_db_client.get_users_with_balance()

    now = int(time.time())
    batch_id = gen_batch_id(datetime.now(), 'retention', 0, 'all')
    logger.info('retention push begin batch_id: %s' % batch_id)

    for money, user_id_list in balance_dict.items():
        for i in range((len(user_id_list) // BATCH_SIZE) + 1):
            batch_user_list = list()
            start_index, end_index = i * BATCH_SIZE, (i + 1) * BATCH_SIZE
            launch_time_dict = redis_client.batch_get_launch_history(user_id_list[start_index:end_index])
            for user_id in user_id_list[start_index:end_index]:
                if now - launch_time_dict.get(user_id, 0) > 3600 * 36:
                    batch_user_list.append(user_id)
            if not utils.is_empty(batch_user_list):
                user_fcm_tokens = userutils.retrieve_fcm_tokens(batch_user_list)
                to_push_users = [PushUser(user_id=user_id, fcm_token=fcm_token) for user_id, fcm_token
                                 in user_fcm_tokens.items() if not utils.is_empty(fcm_token)]
                try:
                    push_message(push_user_list=to_push_users, batch_id=batch_id, balance=money)
                except:
                    logger.exception('retention push error')
    logger.info('retention push end batch_id: %s' % batch_id)


def push_message(push_user_list: List[PushUser], batch_id: str, balance: float):
    title = 'Ada Rp %s di akun Anda, cek dan dapatkan lebih banyak!' % (format(balance, ',').replace(',', '.'))
    context.sender.send(PushQueue.PUSH_P3, PushItem(
        users=push_user_list,
        push_type='profile',
        data_message={
            'title': title,
            'body': '',
            'click_action': 'FLUTTER_NOTIFICATION_CLICK',
            'routeName': 'wallet',
            'batchId': batch_id,
            'image': ''},
        pass_through=True
    ))


if __name__ == '__main__':
    main()
