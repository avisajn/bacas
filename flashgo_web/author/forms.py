from voluptuous import Required, Schema, All, Range, Optional

from common.validutils import Int, Boolean

add_or_cancel_following_schema = Schema({
    Required('author_id'): All(int, Range(min=0))
})

get_user_following_schema = Schema({
    Required('page_id', default=0): All(Int, Range(min=0)),
    Optional('count', default=8): All(Int, Range(min=1))
})

get_author_feed_schema = Schema({
    Required('author_id'): All(Int, Range(min=1)),
    Optional('page_id', default=0): All(Int, Range(min=0)),
    Optional('count', default=8): All(Int),
    Optional("only_short_video", default=False): Boolean,
})
