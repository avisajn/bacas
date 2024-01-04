import json

from voluptuous import Invalid, Schema


def valid_int(number):
    if number is None or number == '':
        raise Invalid('expected int get None')
    elif isinstance(number, int):
        return number
    try:
        return int(number)
    except ValueError:
        raise Invalid('expected int')


def valid_json(json_data):
    try:
        return json.loads(json_data)
    except Exception as e:
        raise Invalid('expected json data, error is %s' % str(e))


def valid_bool(data):
    if isinstance(data, str):
        data = data.lower()
        if data in ('1', 'true', 'yes', 'on', 'enable'):
            return True
        if data in ('0', 'false', 'no', 'off', 'disable'):
            return False
        raise Invalid('expected bool, got %s' % data)
    elif isinstance(data, int):
        return data != 0
    elif isinstance(data, bool):
        return data
    else:
        raise Invalid('expected bool')


class NestJson(object):
    def __init__(self, schema):
        self.schema = schema

    def __call__(self, data):
        return self.schema(valid_json(data))


def _identity(self):
    return self


class JsonList(object):
    def __init__(self, schema=_identity):
        self.schema = schema

    def __call__(self, data):
        json_list = valid_json(data)
        if isinstance(json_list, list):
            return [self.schema(item) for item in json_list]
        else:
            raise Invalid('expected json list, get type %s' % json_list.__type__)


class DictList(object):
    def __init__(self, schema=_identity):
        self.schema = schema

    def __call__(self, data):
        if isinstance(data, list):
            return [self.schema(item) for item in data]
        else:
            raise Invalid('expected dict list, get type %s' % data.__type__)


Int = Schema(valid_int)
IntJsonList = JsonList(Int)
Boolean = Schema(valid_bool)
StrJsonList = JsonList(Schema(str))


def _test_int():
    from voluptuous import Optional, Range, All, MultipleInvalid
    page_id_schema = Schema({Optional('page_id', default=0): All(Int, Range(-1, 20))})

    try:
        page_id_schema({'page_id': ''})
        assert False, 'expect raise exception'
    except:
        pass

    data = page_id_schema({})
    assert data['page_id'] == 0, 'cannot process None'

    data = page_id_schema({'page_id': 10})
    assert data['page_id'] == 10, 'cannot process normal'

    data = page_id_schema({'page_id': '10'})
    assert data['page_id'] == 10, 'cannot process str'

    try:
        page_id_schema({'page_id': '30'})
        assert False, 'page_id do not in range, but do not raise exception'
    except MultipleInvalid as e:
        pass

    try:
        page_id_schema({'page_id': 'abc'})
        assert False, 'page_id do not in range, but do not raise exception'
    except MultipleInvalid as e:
        pass


def _test_json_list():
    schema = Schema(IntJsonList)
    data = schema('[1,2,3,4]')
    assert data == [1, 2, 3, 4], 'parse list error'


def _test_nest_json():
    schema = Schema(NestJson(Schema({'page_id': Int})))
    data = json.dumps({'page_id': '12'})
    data = schema(data)
    assert data == {'page_id': 12}, 'parse json error'


def _test():
    _test_int()
    _test_json_list()
    _test_nest_json()


if __name__ == '__main__':
    _test()
