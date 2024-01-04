# coding: utf-8
"""添加自定义过滤器"""
from jinja2 import Environment


def format_number(data):
    try:
        return format(int(data), ',').replace(',', '.')
    except:
        return '0'


def to_int(data):
    try:
        return str(int(data))
    except:
        return '0'


class Env(Environment):
    def __init__(self, *args, **kw):
        Environment.__init__(self, *args, **kw)
        self.filters.update({'format_number': format_number,
                             'to_int': to_int})
