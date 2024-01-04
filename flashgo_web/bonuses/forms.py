from voluptuous import Schema, Required, All, Optional

from common.validutils import Int

get_news_awards_history_schema = Schema({
    Required('page_id', default=''): All(str),
    Optional('count', default=8): All(Int)
})
