import datetime

from sqlalchemy.ext.declarative import declarative_base

ORMModelBase = declarative_base()


class ORMBase:
    @staticmethod
    def __parse_datetime(d):
        if isinstance(d, datetime.datetime):
            return d.strftime('%Y-%m-%dT%H:%M:%S.%f')[:-3] + 'Z'
        else:
            return d

    @classmethod
    def get_deal_id_attr(cls):
        return cls.deal_id

    def to_dict(self):
        return {k: self.__parse_datetime(v) for k, v in self.__dict__.items() if not k.startswith('_')}

    @classmethod
    def from_json(cls, data):
        # TODO
        pass
