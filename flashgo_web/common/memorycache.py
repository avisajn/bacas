import codecs
import importlib
import json
import time

from common import loggers

logger = loggers.get_logger(__name__)


class CacheItem(object):
    def __init__(self, name, value, exp=None, abs_exp_time=None):
        self.name = name
        self.value = value
        if exp is not None:
            self.exp_time = int(time.time()) + exp
        elif abs_exp_time is not None:
            self.exp_time = abs_exp_time
        else:
            raise ValueError('must have exp time')

    def valid(self):
        return time.time() < self.exp_time

    def to_bytes(self, to_json):
        data = {
            'name': self.name,
            'value': to_json(self.value),
            'abs_exp_time': self.exp_time
        }
        return codecs.encode(json.dumps(data).encode('utf-8'), "zlib")

    @staticmethod
    def from_bytes(data, from_json):
        try:
            data = json.loads(codecs.decode(data, 'zlib').decode('utf-8'))
            return CacheItem(data['name'], from_json(data['value']), abs_exp_time=data['abs_exp_time'])
        except:
            return None


class MemoryCache(object):
    def __init__(self, max_size=2000, size_per_item=100):
        self._instances = {}
        self.max_size = max_size
        self.size_per_item = size_per_item
        self.max_item_size = self.max_size * size_per_item
        self.current_size = 0

    def __get_size(self, obj):
        try:
            if obj is None:
                return 0
            else:
                return len(obj)
        except:
            return self.size_per_item * 2

    def cache_object(self, name, value, exp=None, abs_exp_time=None):
        item = CacheItem(name, value, exp=exp, abs_exp_time=abs_exp_time)
        self._instances[name] = item
        size = self.__get_size(value)
        self.current_size += size
        if len(self._instances) > self.max_size or self.current_size > self.max_item_size:
            logger.info(
                f"gc: len: {len(self._instances)}, max len: {self.max_size}, "
                f"size: {self.current_size}, max_size: {self.max_item_size}")
            self._instances = {name: item}
            self.current_size = size

    def get_cache(self, name, getter=None, exp=None):
        obj = self._instances.get(name, None)
        if obj is not None and not obj.valid():
            # 去掉对象后不处理current_size，并不影响内存缓存的效果
            del self._instances[name]
            obj = None
        if obj is not None:
            obj = obj.value
        if getter is None or exp is None or obj is not None:
            return obj
        else:
            obj = getter()
            self.cache_object(name, obj, exp)
            return obj


class UWSGICache(object):
    def __init__(self, max_size=10):
        self._uwsgi_enable = None
        self._cache = MemoryCache(max_size=max_size, size_per_item=204800)
        try:
            self.__uwsgi = importlib.import_module('uwsgi')
            self._uwsgi_enable = True
            logger.info('uwsgi is enable')
        except:
            logger.exception('cannot load uwsgi')
            self._uwsgi_enable = False

    def _get_uwsgi_cache(self, name):
        if not self._uwsgi_enable:
            return None
        try:
            raw_value = self.__uwsgi.cache_get(name)
            return raw_value
        except:
            pass

    def _set_uwsgi_cache(self, name, value: bytes):
        if not self._uwsgi_enable:
            return
        try:
            if value is None:
                self.__uwsgi.cache_del(name)
                return
            if self.__uwsgi.cache_exists(name):
                self.__uwsgi.cache_update(name, value)
            else:
                self.__uwsgi.cache_set(name, value)
        except:
            # ignore
            pass

    def get_cache(self, name, getter, exp, to_json, from_json):
        value = self._cache.get_cache(name)
        if value is None:
            cache_item = CacheItem.from_bytes(self._get_uwsgi_cache(name), from_json=from_json)
            if cache_item is not None and cache_item.valid() and cache_item.value is not None:
                self._cache.cache_object(cache_item.name, cache_item.value, abs_exp_time=cache_item.exp_time)
                return cache_item.value
            else:
                current_value = getter()
                cache_item = CacheItem(name, current_value, exp)
                self._cache.cache_object(cache_item.name, cache_item.value, abs_exp_time=cache_item.exp_time)
                self._set_uwsgi_cache(name, cache_item.to_bytes(to_json=to_json))
                return current_value
        else:
            return value


cache = MemoryCache()
