from voluptuous import Required, All, Length, Range, Schema, Any, Optional, Date, Datetime

from common.validutils import Int, Boolean

add_favorite_schema = Schema({
    Required('user_id'): All(str, Length(max=1000)),
    Optional('deal_id'): All(int, Range(min=1)),
    Optional('id'): All(int, Range(min=1)),
    Required('type', default='deal'): All(str, Length(max=20))
})

cancel_favorite_schema = Schema({
    Required('user_id'): All(str, Length(max=1000)),
    Optional('deal_id'): All(int, Range(min=1)),
    Optional('id'): All(int, Range(min=1)),
    Required('type', default='deal'): All(str, Length(max=20))
})

batch_cancel_favorite_schema = Schema({
    Required('user_id'): All(str, Length(max=1000)),
    Optional('deal_ids'): All([int], Length(max=10000)),
    Optional('ids'): All([int], Length(max=10000)),
    Required('type', default='deal'): All(str, Length(max=20))
})

get_my_favorite_schema = Schema({
    Required('user_id'): All(str, Length(max=1000)),
    Required('count'): All(int, Range(min=1)),
    Required('page_id'): All(int, Range(min=0)),
    Required('type', default='deal'): All(str, Length(max=20)),
    Optional('channel', default='no_channel'): All(str)
})

cancel_not_valid_favorite_schema = Schema({
    Required('user_id'): All(str, Length(max=1000)),
    Required('type', default='deal'): All(str, Length(max=20))
})

add_user_interests_schema = Schema({
    Required('user_id'): All(str, Length(max=1000)),
    Required('interest_id'): All(int, Range(min=1)),
})

get_interests_schema = Schema({
    Required('user_id'): All(str, Length(max=1000)),
})

add_user_reportdealerrors_schema = Schema({
    Required('user_id'): All(str, Length(max=1000)),
    Required('deal_id'): All(int, Range(min=1)),
    Required('error'): All(str, Length(max=1000)),
})

flash_add_remind_schema = Schema({
    Required('user_id'): All(str, Length(max=1000)),
    Required('deal_id'): All(int, Range(min=1)),
})

add_or_remove_user_like_schema = Schema({
    Optional('user_id'): All(str),
    Required('news_id'): All(int, Range(min=1)),
    Optional('type'): All(int, Range(min=0, max=3))
})

add_selected_interest_schema = Schema({
    Optional('user_id'): All(str, Length(max=1024)),
    Required('selected_interest_ids'): All(list)
})

get_received_like_schema = Schema({
    Required('page_id', default=0): All(Int),
    Optional('count', default=8): All(Int)
})

get_favorite_deals_schema = Schema({
    Required('page_id', default=0): All(Int),
    Optional('count', default=10): All(Int),
    Required('carry_favorites'): All(Boolean)
})
