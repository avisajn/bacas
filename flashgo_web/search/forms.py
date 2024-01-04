from voluptuous import Required, All, Length, Range, Schema, Optional, In

from common.validutils import Int, StrJsonList
from search.models import SORT_MODES, SortMode

search_schema = Schema({
    Required('user_id'): All(str, Length(max=1000)),
    Required('keywords'): All(str, Length(max=1000)),
    Required('count'): All(int, Range(min=1)),
    Required('page_id'): All(int, Range(min=0)),
    Required('channel', default='no_channel'): All(str, Length(max=256)),
    Required('search_type', default='product'): All(str, Length(min=3, max=7)),
    Optional('search_id'): All(str)
})

SUPPORTED_SEARCH_TYPE = {'review', 'all', 'product'}
MAX_PRICE = 2147483647

suggest_schema = Schema({
    Optional('keyword', default=''): All(str, Length(max=1000)),
    Optional('search_type', default='all'): In(SUPPORTED_SEARCH_TYPE),
})

search_by_conditions_schema = Schema({
    Required('keyword', default=''): All(str),
    Optional('search_type', default='all'): In(SUPPORTED_SEARCH_TYPE),
    Optional('sort_mode', default=SortMode.DEFAULT): In(SORT_MODES),
    Optional('min_price', default=-1): All(Int),
    Optional('max_price', default=MAX_PRICE): All(Int),
    Optional('filter_ids', default='[]'): All(StrJsonList),
    Optional('impression_id', default=''): All(str),
    Optional('page_id', default=0): All(Int),
    Optional('count', default=10): All(Int)
})
