import inspect
import json


class Bean(object):
    @classmethod
    def parse(cls, data):
        if isinstance(data, str) or isinstance(data, bytes):
            data = json.loads(data)
        return cls(**{k: v for k, v in data.items() if k in cls.get_item_names()})

    def __str__(self):
        return self.to_json_string()

    def __repr__(self):
        return self.to_json_string()

    def to_dict(self):
        return {k: v for k, v in self.__dict__.items() if not k.startswith('_')}

    def to_json_string(self):
        return json.dumps(self.to_dict(), separators=(",", ":"))

    def get(self, keyword, default=None):
        return self.__dict__[keyword] if keyword in self.__dict__ else default

    def items(self):
        return self.to_dict().items()

    @classmethod
    def get_item_names(cls):
        if hasattr(cls, 'INIT_KEYWORDS'):
            return getattr(cls, 'INIT_KEYWORDS')
        else:
            keywords = [arg for arg in inspect.getfullargspec(cls.__init__).args if arg != 'self']
            setattr(cls, 'INIT_KEYWORDS', keywords)
            return keywords


def _get_columns(cls):
    import inspect
    from sqlalchemy.orm.attributes import InstrumentedAttribute
    variables = [attr for attr in dir(cls) if not inspect.ismethod(attr) and not attr.startswith('_')]
    parent_variables = []
    for parent in cls.__mro__:
        if parent != cls:
            for attr in dir(parent):
                if not inspect.ismethod(attr) and not attr.startswith('_'):
                    parent_variables.append(attr)
    return [v for v in variables if v not in parent_variables and isinstance(getattr(cls, v), InstrumentedAttribute)]


class DBBean(Bean):
    @classmethod
    def get_item_names(cls):
        if hasattr(cls, 'INIT_KEYWORDS'):
            return getattr(cls, 'INIT_KEYWORDS')
        else:
            keywords = _get_columns(cls)
            setattr(cls, 'INIT_KEYWORDS', keywords)
            return keywords
