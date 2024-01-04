from voluptuous import Schema, Optional, Required, All, Range, ALLOW_EXTRA, In

from common.validutils import Int, Boolean, DictList

cache_web_feeds_schema = Schema({
    Optional('start_pos', default=0): Int,
    Optional('index', default=0): Int,
    Optional('force', default=True): Boolean,
})

get_recommendation_feed_schema = Schema({
    Required('page_id', default=0): All(Int),
    Optional('count', default=10): All(Int)
})

get_topic_news_schema = Schema({
    Required('page_id', default=0): All(Int),
    Optional('count', default=10): All(Int, Range(min=1)),
    Optional('only_short_video', default=False): Boolean,
    Optional('order_by', default='hot'): In(['hot', 'created_time'])
})

web_news_info_schema = Schema({
    Required('news_id'): All(Int),
    Optional('impression_id', default=''): All(str),
    Optional('token', default=''): All(str),
    Optional('content_html'): All(str),
    Optional('from_page', default=''): All(str)
}, extra=ALLOW_EXTRA)

user_news_feedback_schema = Schema({
    Required('news_id'): All(int),
    Required('reason_id'): In({-1, 1, 2, 3, 4, 5, 6, 7, 8})
})

relative_video_schema = Schema({
    Required('page_id', default=0): All(Int),
    Required('count', default=8): All(Int)
})

set_single_click_impression_schema = Schema({
    Required('news_id'): All(Int),
    Required('impression_id'): All(str),
    Optional('from_page', default=''): All(str),
}, extra=ALLOW_EXTRA)

_images_of_create_news_schema = Schema({
    Required('image_guid'): All(str),
    Required('width'): All(int),
    Required('height'): All(int)
})

_video_schema = Schema({
    Required('video_guid'): All(str),
    Required('width'): All(int),
    Required('height'): All(int),
    Required('duration'): All(int)
})

create_news_schema = Schema({
    Required('title'): All(str),
    Required('images'): All(DictList(_images_of_create_news_schema)),
    Required('news_type'): In([0, 2, 3]),
    Optional('video'): All(_video_schema),
    Optional('topic_id'): int,
    Optional('tags'): list
}, extra=ALLOW_EXTRA)

news_audit_pass_schema = Schema({
    Required('token'): All(str),
    Required('email'): All(str)
})

get_my_news_schema = Schema({
    Required('page_id', default=0): All(Int),
    Optional('only_short_video', default=False): Boolean,
})

search_suggest_tags_schema = Schema({
    Required('keyword'): All(str)
})

news_detail_schema = Schema({
    Required('news_id'): All(Int),
    Optional('impression_id', default=''): All(str),
    Optional('from_page', default=''): All(str)
})
