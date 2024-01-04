from voluptuous import Required, All, Length, Range, Schema, Optional

video_feeds_schema = Schema({
    Required('user_id'): All(str, Length(max=1000)),
    Required('count'): All(int, Range(min=1)),
    Required('page_id'): All(int, Range(min=0))
})
video_schema = Schema({
    Required('user_id'): All(str, Length(max=1000)),
    Required('video_id'): All(int, Range(min=1)),
})
video_deal_schema = Schema({
    Required('user_id'): All(str, Length(max=1000)),
    Required('video_id'): All(int, Range(min=1)),
    Required('count'): All(int, Range(min=1)),
    Required('page_id'): All(int, Range(min=0))
})
