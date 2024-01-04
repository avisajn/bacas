import base64

from common.constants import RedisKeyPrefix, NEGATIVE_WORDS_SET
from common.es_client import es_client
from common.redisclient import cache, redis_client
from common.utils import UniqueItemList, check_negative_words_valid
from search.models import Suggest
from topic.utils import get_topic_data, get_pageable_topic_ids


def get_hot_words():
    res = ['Samsung galaxy m20', 'tas import batam', 'eye shadow focallure', 'sepatu futsal', 'Xiaomi redmi 6a']
    hot_words = redis_client.get_show_hot_words()
    if hot_words is not None and len(hot_words) > 0:
        return hot_words
    else:
        return res


def get_deal_ids(keywords: str, page_id, count):
    keywords = keywords.strip().lower()
    ids = redis_client.get_hot_keyword_ids(keywords)
    if len(ids) >= (page_id + 1) * count:
        return list(ids[count * page_id:])
    else:
        return []


@cache(key=lambda keyword: 'KW_TERMS_%s' % base64.b64encode(keyword.encode('utf-8')).decode('utf-8'),
       ex=10 * 60, cache_on_memory=5)
def get_terms(keywords):
    return es_client.get_terms(keywords)[:10]


@cache(key=lambda keyword, search_type: 'hit_kw_%s_%s' % (
        base64.b64encode(keyword.encode('utf-8')).decode('utf-8'), search_type),
       ex=5 * 60, cache_on_memory=5)
def get_hit_counts(keyword, search_type):
    return es_client.get_hit_counts(keyword, search_type)


@cache(key=lambda keyword, search_type: 'suggest_%s_%s' % (
        base64.b64encode(keyword.encode('utf-8')).decode('utf-8'), search_type),
       ex=20 * 60, cache_on_memory=30)
def _get_suggest(keyword, search_type):
    if keyword is None or len(str(keyword).strip()) == 0:
        return [Suggest(keyword, search_type, None).to_json() for keyword in get_hot_words()]
    else:
        keyword = keyword.strip()
        sugs = []
        product_count = int(get_hit_counts(keyword, 'product'))
        if product_count != 0:
            sugs.append(Suggest(keyword, 'product', '%s produk' % product_count).to_json())
        news_count = int(get_hit_counts(keyword, 'review'))
        if news_count != 0:
            sugs.append(Suggest(keyword, 'review', '%s review' % news_count).to_json())
        topic_ids = search_relative_topic_ids(keyword)
        if len(topic_ids) > 0:
            try:
                topic_data = get_topic_data(topic_ids[0])
                if check_negative_words_valid(topic_data['name'].lower().strip(), NEGATIVE_WORDS_SET):
                    sugs.append(Suggest(suggest=topic_data['name'], search_type='topic', extra='',
                                item_id=topic_data['topic_id'], font_bold=True, num_red=True).to_json())
            except:
                pass
        suggest_texts = UniqueItemList()
        for fuzziness in [None, 1, 2]:
            data = es_client.get_suggest(keyword, 10, fuzziness=fuzziness)
            for sug in data:
                suggest_texts.append(sug)
            if len(suggest_texts) >= 10:
                break

        sugs += [Suggest(keyword, search_type, None).to_json() for keyword in suggest_texts.to_list()]

        filtered_sug = []
        for sug in sugs:
            if check_negative_words_valid(sug['suggest'].lower().strip(), NEGATIVE_WORDS_SET):
                filtered_sug.append(sug)
        return filtered_sug[:10]


@cache('topic_suggest', ex=20 * 60, cache_on_memory=30, prefix=RedisKeyPrefix.TOPIC)
def get_default_topic_suggest():
    topic_ids = get_pageable_topic_ids(page_id=0, count=3)
    topic_sug = []
    for topic_id in topic_ids:
        try:
            topic_data = get_topic_data(topic_id)
            topic_sug.append(Suggest(suggest=topic_data['name'], search_type='topic', extra='',
                                     item_id=topic_data['topic_id'], font_bold=True,
                                     num_red=True).to_json())
        except:
            pass
    return topic_sug


@cache(key=lambda keyword: 'Search_topics_{}'.format(base64.b64encode(keyword.encode('utf-8')).decode('utf-8')),
       ex=10 * 60, prefix=RedisKeyPrefix.SEARCH)
def search_relative_topic_ids(keyword):
    topic_ids = es_client.search_topic_ids_by_conditions(keyword)
    return topic_ids
