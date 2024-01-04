from voluptuous import Schema, Required, All, Optional, Length

from common.validutils import Int, Boolean

get_total_topics_schema = Schema({
    Required('page_id', default=0): All(Int),
    Optional('count', default=8): All(Int)
})

admin_update_topic_schema = Schema({
    Required('email'): All(str, Length(min=16)),
    Required('token'): All(str)
})

get_follow_topics_schema = Schema({
    Required('page_id', default=0): All(Int),
    Required('carry_follows'): All(Boolean)
})
