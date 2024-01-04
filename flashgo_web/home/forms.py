from voluptuous import Schema, Optional, In, All

from common.validutils import Int

get_news_homepage_schema = Schema({
    Optional('gender', default='Male'): In(['Male', 'Female']),
    Optional('sex_id', default=1): All(Int)
})
