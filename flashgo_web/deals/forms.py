from voluptuous import Required, All, Length, Range, Schema, Optional, In

from common.validutils import Int

deal_schema = Schema({
    Required('user_id'): All(str, Length(max=2000)),
    Required('count'): All(int, Range(min=1)),
    Required('page_id'): All(int, Range(min=0)),
    Optional('deal_id'): All(int, Range(min=1)),
    Optional('from'): All(str),
    Optional('channel'): All(str)
})

channel_deal_schema = Schema({
    Required('user_id'): All(str, Length(max=2000)),
    Required('count'): All(int, Range(min=1)),
    Required('page_id'): All(int, Range(min=0)),
    Required('channel_id'): All(int, Range(min=-3)),
    Optional('channel'): All(str)
})

deal_article_schema = Schema({
    Required('user_id'): All(str, Length(max=2000)),
    Required('deal_id'): All(int, Range(min=1)),
    Optional('impression_id'): All(str)
})

flash_deal_schema = Schema({
    Required('user_id'): All(str, Length(max=1000)),
    Required('count'): All(int, Range(min=1)),
    Required('page_id'): All(int, Range(min=0)),
    Optional('channel'): All(str)
})

top_seller_schema = Schema({
    Optional('channel'): All(str)
})

share_deal_schema = Schema({
    Required('user_id'): All(str, Length(max=1000)),
    Required('count'): All(int, Range(min=1)),
    Required('page_id'): All(int, Range(min=0)),
    Optional('channel'): All(str)
})

advertisement_data_schema = Schema({
    Required('image_url'): All(str, Length(min=7)),
    Required('trackinglink'): All(str, Length(min=7)),
    Required('title'): All(str),
    Required('price_title'): All(str)
})

get_topic_deals_feed_schema = Schema({
    Required('page_id', default=0): All(Int),
    Optional('count', default=10): All(Int, Range(min=1))
})

get_channel_feeds_v2_schema = Schema({
    Required('page_id', default=0): All(Int),
    Optional('count', default=10): All(Int, Range(min=1))
})

get_recommendation_feeds_v2_schema = Schema({
    Required('page_id', default=0): All(Int),
    Optional('count', default=10): All(Int, Range(min=1))
})

get_relative_deals_schema = Schema({
    Required('page_id', default=0): All(Int),
    Optional('count', default=10): All(Int, Range(min=1))
})

get_flash_deals_schema = Schema({
    Required('page_id', default=0): All(Int),
    Optional('count', default=10): All(Int, Range(min=1)),
    Optional('feed_type', default='ongoing'): In(['ongoing', 'coming'])
})

get_user_browsing_history_v2_schema = Schema({
    Required('page_id', default=0): All(Int),
    Optional('count', default=10): All(Int, Range(min=1))
})

get_user_offer_records_schema = Schema({
    Required('page_id', default=0): All(Int),
    Optional('count', default=10): All(Int, Range(min=1)),
    Optional("order_type", default="all"): In(["", "all", "pending", "successful", "failed"])
})
