from voluptuous import Required, All, Schema, Range, Optional, Length

from common.validutils import Int

get_user_comments_schema = Schema({
    Required('page_id', default=0): All(Int, Range(min=0)),
    Optional('count', default=10): All(Int, Range(min=1))
})

get_news_comments_schema = Schema({
    Required('news_id'): All(Int, Range(min=1)),
    Required('page_id', default=0): All(Int, Range(min=0)),
    Optional('count', default=10): All(Int, Range(min=1))
})

add_comment_schema = Schema({
    Required('news_id'): All(int, Range(min=1)),
    Required('content'): All(str),
    Optional('comment_id_be_replied', default=0): All(int, Range(min=0)),
    Optional('root_id', default=0): All(int, Range(min=0))
})

get_likes_notifications_schema = Schema({
    Required('page_id', default=0): All(Int, Range(min=0)),
    Optional('count', default=10): All(Int, Range(min=1))
})

add_comment_likes_schema = Schema({
    Required('comment_id'): All(int, Range(min=1)),
    Required('comment_user_id'): All(str, Length(min=1))
})

del_comment_likes_schema = Schema({
    Required('comment_id'): All(int, Range(min=1))
})

get_attention_status_schema = Schema({
    Optional('like_comment_att_time'): All(Int, Range(min=0)),
    Optional('be_replied_att_time'): All(Int, Range(min=0))
})

get_sub_comments_schema = Schema({
    Optional('page_id', default=0): All(Int, Range(min=0)),
    Optional('count', default=5): All(Int, Range(min=1))
})


get_comments_notifications_schema = Schema({
    Required('page_id', default=0): Int,
    Optional('count', default=8): Int,
    Required('type', default=1): Int
})


admin_clear_cache_schema = Schema({
    Required('token'): All(str),
    Required('email'): All(str)
})

modify_comment_like_cache_schema = Schema({
    Required('token'): All(str),
    Required('email'): All(str),
    Required('user_id'): All(str),
    Required('comment_id'): All(Int),
    Required('comment_user_id'): All(str)
})
