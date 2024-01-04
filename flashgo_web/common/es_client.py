import json
import math
import time
from typing import List

import arrow
import requests
from requests_aws4auth import AWS4Auth

from common import loggers
from common.config import ES_CLIENT_CONFIG
from common.utils import UniqueItemList
from search.models import SortMode

DEAL_INDEX_NAME = 'deal'
NEWS_INDEX_NAME = 'news'
OFFER_INDEX_NAME = "cps_offer"

MAX_PRICE = 2147483647

logger = loggers.get_logger(__name__)

MIN_SCORE = 5

ES_TIMEOUT = 2


class ESClient(object):
    def __init__(self, host, hot_deal_index='hot'):
        self.host = host
        self.hot_deal_index = hot_deal_index
        self.awsauth = AWS4Auth(ES_CLIENT_CONFIG['access_key_id'], ES_CLIENT_CONFIG['secret_access_key'],
                                ES_CLIENT_CONFIG['region_name'], 'es', session_token=None)

    def search_deals(self, keyword, page_id, size):
        url = '%s/%s/_search' % (self.host, DEAL_INDEX_NAME)
        data = {
            "from": page_id * size, "size": size,
            "query": {
                "multi_match": {
                    "query": keyword,
                    "type": "most_fields",
                    "fields": [
                        "data_deal_data_title",
                        "data_deal_data_description",
                        "data_category_data_categories",
                        "data_ecom_category_data_ecom_categories"
                    ]
                },
            },
            "post_filter": {
                "match": {"data_deal_data_valid": 1}
            },
        }
        resp = requests.get(url, auth=self.awsauth, json=data, timeout=ES_TIMEOUT)
        if resp.ok and resp.json() is not None:
            hits = resp.json().get('hits', {}).get('hits', {})
            data = [hit['_source'] for hit in hits]
            for item in data:
                if 'deal_id' in item:
                    item['id'] = item['deal_id']
            return data
        else:
            return []

    def search_news(self, keyword, page_id, count, news_type=None):
        url = '%s/%s/_search' % (self.host, NEWS_INDEX_NAME)
        filters = [
            {
                'range': {
                    'news_valid': {
                        'gte': 1
                    }
                }
            }
        ]
        if news_type is not None:
            filters.append(
                {
                    "term": {
                        "news_type": news_type
                    }
                }
            )
        data = {
            "from": page_id * count,
            "size": count,
            'query': {
                'bool': {
                    'should': [
                        {
                            'match': {
                                "news_abstract": keyword
                            }
                        },
                        {
                            'match': {
                                "news_categories": keyword
                            }
                        },
                        {
                            'match': {
                                "news_detail_html": keyword
                            }
                        },
                        {
                            'match': {
                                "news_detail_title": keyword
                            }
                        },
                        {
                            'match': {
                                "news_tag_list.name": keyword
                            }
                        }
                    ],
                    'filter': filters
                }
            }
        }
        resp = requests.get(url, auth=self.awsauth, json=data, timeout=ES_TIMEOUT)
        if resp.ok and (resp.json() is not None):
            hits = resp.json().get('hits', {}).get('hits', {})
            return hits
        else:
            return []

    def get_deal(self, weblinks, max_size=None):
        if max_size is None:
            max_size = len(weblinks)
        url = '%s/%s/_search' % (self.host, DEAL_INDEX_NAME)
        data = {
            'size': max_size,
            'query': {
                'terms': {
                    "data_deal_data_weblink.keyword": weblinks
                }
            }
        }
        resp = requests.get(url, auth=self.awsauth, json=data)
        if resp.ok and resp.json() is not None:
            hits = resp.json().get('hits', {}).get('hits', {})
            url_maps = {}
            for hit in hits:
                source = hit['_source']
                if 'data_deal_data_weblink' in source and 'deal_id' in source:
                    url_maps[source['data_deal_data_weblink']] = source['deal_id']
            return url_maps
        else:
            return []

    def get_hot_deals(self, size=2000, sell_id=None):
        url = '%s/%s/_search' % (self.host, self.hot_deal_index)
        data = {
            'size': size,
            'sort': [
                {'time': {
                    'order': 'desc'
                }},
                {'meta_page_num': {
                    'order': 'asc'
                }}
            ]
        }
        if sell_id is not None:
            data['query'] = {
                'term': {
                    'main_ecommerce_id': sell_id
                }
            }
        resp = requests.get(url, auth=self.awsauth, json=data)
        if resp.ok and resp.json() is not None:
            hits = resp.json().get('hits', {}).get('hits', {})
            for hit in hits:
                if '_id' in hit:
                    hit['_source']['deal_id'] = hit['_id']
            data = sorted([hit['_source'] for hit in hits], key=lambda deal: deal.get('meta_page_num', 1000))
            for item in data:
                if 'deal_id' in item:
                    item['id'] = item['deal_id']
                if 'main_ecommerce_id' in item:
                    item['e_id'] = item['main_ecommerce_id']
            return data
        else:
            return []

    @staticmethod
    def format_deal_data(data):
        ret = {}
        for k, v in data.items():
            if k.startswith('data_deal_data_'):
                deal_data = ret.get('deal', {})
                deal_data.update({k[len('data_deal_data_'):]: v})
                ret['deal'] = deal_data
            elif k.startswith('data_image_data_'):
                image_data = ret.get('image', {})
                image_data.update({k[len('data_image_data_'):]: v})
                ret['image'] = image_data
            elif k.startswith('data_flash_data_'):
                flash_data = ret.get('flash', {})
                flash_data.update({k[len('data_flash_data_'):]: v})
                ret['flash'] = flash_data
            elif k.startswith('data_share_data_'):
                flash_data = ret.get('share', {})
                flash_data.update({k[len('data_share_data_'):]: v})
                ret['share'] = flash_data
            elif k.startswith('url_info_dict_'):
                url_data = ret.get('url_info', {})
                url_data.update({k[len('url_info_dict_'):]: v})
                ret['url_info'] = url_data
            elif k.startswith('data_category_data_'):
                ret['category'] = v
            elif k.startswith('data_ecom_category_data_'):
                ret['ecom_category'] = v
            elif k.startswith('data_article_data_'):
                ret['article'] = v
        ret['deal_id'] = data['deal_id']
        ret['deal']['deal_id'] = data['deal_id']
        ret['deal']['id'] = data['deal_id']
        if 'flash' in ret:
            ret['flash']['starttime'] = arrow.get(ret['flash']['starttime'])
            ret['flash']['endtime'] = arrow.get(ret['flash']['endtime'])
        if 'share' in ret:
            ret['share']['starttime'] = arrow.get(ret['share']['starttime'])
            ret['share']['endtime'] = arrow.get(ret['share']['endtime'])
        return ret

    def get_deal_detail(self, deal_id):
        url = '%s/%s/deal/%s' % (self.host, DEAL_INDEX_NAME, deal_id)
        data = {}
        resp = requests.get(url, auth=self.awsauth, json=data)
        if resp.ok and (resp.json() is not None) and (resp.json()['found'] is True):
            data = resp.json().get('_source', {})
            ret = self.format_deal_data(data)
            return ret
        else:
            return {}

    def get_news_detail(self, news_id):
        url = '%s/%s/news/%s' % (self.host, NEWS_INDEX_NAME, news_id)
        data = {}
        resp = requests.get(url, auth=self.awsauth, json=data)
        if resp.ok and (resp.json() is not None) and (resp.json()['found'] is True):
            data = resp.json().get('_source')
            data['news_id'] = resp.json().get('_id')
            return data
        else:
            return {}

    def batch_get_deals_detail(self, deal_ids):
        url = '%s/%s/_mget' % (self.host, DEAL_INDEX_NAME)
        data = {
            'ids': deal_ids
        }
        resp = requests.get(url, auth=self.awsauth, json=data)
        ret = []
        if resp.ok and resp.json() is not None:
            for data in resp.json()['docs']:
                if data['found'] is True:
                    ret.append(self.format_deal_data(data['_source']))
        return ret

    def batch_get_news_detail(self, news_ids):
        url = '%s/%s/_mget' % (self.host, NEWS_INDEX_NAME)
        data = {
            'ids': news_ids
        }
        resp = requests.get(url, auth=self.awsauth, json=data)
        ret = []
        if resp.ok and resp.json() is not None:
            for data in resp.json()['docs']:
                if data['found'] is True:
                    news = data['_source']
                    news['news_id'] = data['_id']
                    ret.append(news)
        return ret

    def _get_total_hits(self, start_time, end_time, index_name=DEAL_INDEX_NAME):
        url = '%s/%s/_search' % (self.host, index_name)
        data = {
            'query': {
                'bool': {
                    'filter': {
                        'range': {
                            'time': {
                                'gte': start_time,
                                'lte': end_time
                            }
                        }
                    }
                }
            }
        }
        resp = requests.get(url, auth=self.awsauth, json=data, timeout=ES_TIMEOUT)
        if resp.ok and resp.json() is not None:
            return resp.json()['hits']['total']
        else:
            return 0

    def get_update_recently_deals(self, start_time: str, end_time: str, size=2000):
        url = '%s/%s/_search' % (self.host, DEAL_INDEX_NAME)
        total_size = self._get_total_hits(start_time, end_time)
        for start_index in range(0, total_size + 1, size):
            data = {
                'from': start_index,
                'size': size,
                'query': {
                    'bool': {
                        'filter': {
                            'range': {
                                'time': {
                                    'gte': start_time,
                                    'lte': end_time
                                }
                            }
                        }
                    }
                },
                '_source': [
                    'deal_id'
                ],
                'sort': [
                    {
                        'time': {
                            'order': 'desc'
                        }
                    }
                ]
            }
            resp = requests.get(url, auth=self.awsauth, json=data)
            if resp.ok and (resp.json() is not None):
                hits = resp.json().get('hits', {}).get('hits', {})
                data = [hit['_source']['deal_id'] for hit in hits]
                yield data

    def get_update_recently_news(self, start_time: str, end_time: str, size=2000):
        url = '%s/%s/_search' % (self.host, NEWS_INDEX_NAME)
        total_size = self._get_total_hits(start_time, end_time, index_name=NEWS_INDEX_NAME)
        for start_index in range(0, total_size + 1, size):
            data = {
                'from': start_index,
                'size': size,
                'query': {
                    'bool': {
                        'filter': {
                            'range': {
                                'news_updated_time': {
                                    'gte': start_time,
                                    'lte': end_time
                                }
                            }
                        }
                    }
                }
            }
            resp = requests.get(url, auth=self.awsauth, json=data)
            if resp.ok and resp.json() is not None:
                hits = resp.json().get('hits', {}).get('hits', [])
                ret = []
                for news in hits:
                    data = news['_source']
                    data['news_id'] = news['_id']
                    ret.append(data)
                yield ret

    def search_relative_news(self, news_id, count=5, only_video=False):
        detail_resp = requests.get('%s/%s/news/%s' % (self.host, NEWS_INDEX_NAME, news_id), auth=self.awsauth, json={})
        if detail_resp.ok and (detail_resp.json() is not None) and (detail_resp.json()['found'] is True):
            title = detail_resp.json().get('_source').get('news_title', '')
            filters = [
                {
                    'range': {
                        'news_valid': {
                            'gte': 1
                        }
                    }
                }
            ]

            categories = detail_resp.json().get('_source').get('news_categories', [])
            if categories is not None and len(categories) > 0:
                category_id = categories[0].get('category_id')
                filters.append(
                    {
                        'match': {
                            'news_categories.category_id': category_id
                        }
                    }
                )

            data = {
                'from': 0,
                'size': count,
                'query': {
                    'bool': {
                        'must': [
                            {
                                'match': {
                                    "news_title": title
                                }
                            }
                        ],
                        'filter': filters
                    }
                }
            }

            if only_video:
                data.update({'post_filter': {'match': {'news_news_type': 3}}})
            resp = requests.get('%s/%s/_search' % (self.host, NEWS_INDEX_NAME), auth=self.awsauth, json=data)
            if detail_resp.ok and (detail_resp.json() is not None):
                return [int(news['_id']) for news in resp.json().get('hits', {}).get('hits', [])
                        if int(news['_id']) != news_id]
            else:
                return []
        else:
            return []

    def search_relative_news_feed(self, news_id, page_id, count):
        detail_resp = requests.get('%s/%s/news/%s' % (self.host, NEWS_INDEX_NAME, news_id), auth=self.awsauth, json={})
        if detail_resp.ok and (detail_resp.json() is not None) and (detail_resp.json()['found'] is True):
            title = detail_resp.json().get('_source').get('news_title', '')
            filters = [
                {
                    'range': {
                        'news_valid': {
                            'gte': 1
                        }
                    }
                }
            ]

            data = {
                'from': page_id * count,
                'size': count,
                'min_score': 10,
                'query': {
                    'bool': {
                        'must': [
                            {
                                'match': {
                                    "news_title": title
                                }
                            }
                        ],
                        'filter': filters
                    }
                }
            }
            categories = detail_resp.json().get('_source').get('news_categories', [])
            if categories is not None and len(categories) > 0:
                category_id = categories[0].get('category_id')
                data['query']['bool']['must'].append(
                    {
                        'match': {
                            'news_categories.category_id': category_id
                        }
                    }
                )
            resp = requests.get('%s/%s/_search' % (self.host, NEWS_INDEX_NAME), auth=self.awsauth, json=data)
            if detail_resp.ok and (detail_resp.json() is not None):
                return [int(news['_id']) for news in resp.json().get('hits', {}).get('hits', [])
                        if int(news['_id']) != news_id]
            else:
                return []
        else:
            return []

    def get_suggest(self, keyword: str, count: int, fuzziness=None):
        url = '%s/%s/_search' % (self.host, 'search_complete_keywords')
        if fuzziness is None:
            data = {
                "_source": "suggest",
                "suggest": {
                    "deal-suggest": {
                        "prefix": keyword,
                        "completion": {
                            "field": "suggest",
                            "skip_duplicates": True,
                            "size": count,
                        }
                    }
                }
            }
        else:
            data = {
                "_source": "suggest",
                "suggest": {
                    "deal-suggest": {
                        "prefix": keyword,
                        "completion": {
                            "field": "suggest",
                            "skip_duplicates": True,
                            "size": count,
                            "fuzzy": {
                                "fuzziness": fuzziness
                            }
                        }
                    }
                }
            }
        resp = requests.post(url, json=data, timeout=ES_TIMEOUT)
        if resp.ok and resp.json() is not None:
            sug = UniqueItemList()
            data = resp.json().get('suggest', {}).get('deal-suggest', [])
            for item in data:
                for option in item.get('options', []):
                    if len(option.get('text', '')) > 0:
                        sug.append(option.get('text', ''))
            return sug.to_list()
        else:
            return None

    def get_hit_counts(self, keyword: str, search_type: str):
        if search_type == 'product':
            return self.search_deal_by_conditions(keyword, 0, 1, only_count=True)
        elif search_type == 'review':
            return self.search_news_by_conditions(keyword, 0, 1, only_count=True)
        else:
            return 0

    def search_deal_by_conditions(self, keyword, page_id: int, size: int,
                                  min_price=0,
                                  max_price=MAX_PRICE,
                                  e_ids=None,
                                  discount_ids=None,
                                  sort_mode: SortMode = None,
                                  tags=None,
                                  only_count=False,
                                  only_cashback=False,
                                  **kwargs):
        if sort_mode is not None and sort_mode.mode == SortMode.PRICE_ASCENDING:
            if min_price <= 0:
                min_price = 1
        # 过滤被删除的作者
        filters = [{
            "range": {
                "data_deal_data_current_price": {
                    "gte": min_price,
                    "lte": max_price,
                }
            }
        }]
        if e_ids is not None and len(e_ids) > 0:
            e_id_conditions = []
            for e_id in e_ids:
                e_id_conditions.append({
                    "term": {
                        "data_deal_data_ecommerce_id": e_id
                    }
                })
            filters.append({
                "bool": {
                    "should": e_id_conditions
                }
            })
        if discount_ids is not None and len(discount_ids) > 0:
            if 'discount' in discount_ids and 'no_discount' in discount_ids:
                pass
            else:
                bool_conditions = {
                    'bool': {
                        'should': [
                            {
                                "terms": {
                                    "data_deal_data_type.keyword": discount_ids
                                }
                            }
                        ]
                    }
                }
                if 'discount' in discount_ids:
                    bool_conditions['bool']['should'].append({
                        'range': {
                            'data_deal_data_off': {
                                'gt': 0.0
                            }
                        }
                    })
                elif 'no_discount' in discount_ids:
                    bool_conditions['bool']['should'].append({
                        'range': {
                            'data_deal_data_off': {
                                'gte': 1.0
                            }
                        }
                    })
                filters.append(bool_conditions)
        if tags is not None and len(tags) > 0:
            keyword = tags[0]
        query = {
            "bool": {
                "should": [
                    {
                        "match": {
                            "data_deal_data_title": keyword
                        }
                    },
                    {
                        "match": {
                            "data_deal_data_description": keyword
                        }
                    },
                    {
                        "match": {
                            "data_category_data_categories": keyword
                        }
                    },
                    {
                        "match": {
                            "data_ecom_category_data_ecom_categories": keyword
                        }
                    },
                ],
                "filter": filters
            },
        }
        data = {
            "from": page_id * size,
            "size": size,
            "query": query,
            "min_score": MIN_SCORE,
            "post_filter": {
                "match": {"data_deal_data_valid": 1}
            },
        }
        sort_mappings = {
            SortMode.PRICE_ASCENDING: ('data_deal_data_current_price', 'asc'),
            SortMode.PRICE_DESCENDING: ('data_deal_data_current_price', 'desc'),
            SortMode.BEST_SELLING: ('data_flash_data_sales', 'desc'),
            SortMode.BEST_RATING: ('data_deal_data_stars', 'desc'),
        }
        if sort_mode is not None and sort_mode.mode in sort_mappings:
            field, order = sort_mappings[sort_mode.mode]
            data['sort'] = {
                field: {
                    'order': order
                }
            }

        now = int(time.time())
        if only_cashback:
            url = '%s/%s/_search' % (self.host, OFFER_INDEX_NAME)
            filters.append({
                "range": {
                    "data_cps_offer_data_start_timestamp": {
                        "lte": now
                    }
                }
            })
            filters.append({
                "range": {
                    "data_cps_offer_data_end_timestamp": {
                        "gte": now + 30 * 60
                    }
                }
            })
        else:
            url = '%s/%s/_search' % (self.host, DEAL_INDEX_NAME)
        resp = requests.get(url, auth=self.awsauth, json=data, timeout=ES_TIMEOUT)
        if resp.ok and resp.json() is not None:
            if only_count:
                return resp.json().get('hits', {}).get('total', 0)
            else:
                hits = resp.json().get('hits', {}).get('hits', {})
                data = [hit['_source'] for hit in hits]
                for item in data:
                    if 'deal_id' in item:
                        item['id'] = item['deal_id']
                return data
        else:
            if only_count:
                return 0
            else:
                return []

    def search_news_by_conditions(self, keyword: str, page_id, size=10, news_type_ids=None,
                                  sort_mode: SortMode = None, tags=None, only_count=False, **kwargs):
        # TODO 需要对新闻的作者进行过滤
        url = '%s/%s/_search' % (self.host, 'news')
        filters = [{
            "range": {
                "news_valid": {
                    'gte': 1
                }
            }
        }]
        if news_type_ids is not None and len(news_type_ids) > 0:
            news_type_conditions = []
            for type_id in news_type_ids:
                news_type_conditions.append({
                    "term": {
                        "news_news_type": type_id
                    }
                })
            filters.append({
                "bool": {
                    "should": news_type_conditions
                }
            })
        if tags is not None and len(tags) > 0:
            keyword = tags[0]
        query = {
            "bool": {
                "should": [
                    {
                        "match": {
                            "news_title": keyword
                        }
                    },
                    {
                        "match": {
                            "news_abstract": keyword
                        }
                    },
                    {
                        "match": {
                            "news_categories": keyword
                        }
                    },
                    {
                        "match": {
                            "news_detail_html": keyword
                        }
                    }, {
                        "match": {
                            "news_detail_title": keyword
                        }
                    }, {
                        "match": {
                            "news_image": keyword
                        }
                    }
                ],
                "filter": filters
            },
        }
        data = {
            "from": page_id * size,
            "size": size,
            'min_score': MIN_SCORE,
            "query": query,
        }
        sort_mappings = {
            SortMode.HOTTEST: ('news_click', 'desc'),
            SortMode.LATEST: ('news_created_time', 'desc'),
        }
        if sort_mode is not None and sort_mode.mode in sort_mappings:
            field, order = sort_mappings[sort_mode.mode]
            data['sort'] = {
                field: {
                    'order': order
                }
            }
        resp = requests.get(url, auth=self.awsauth, json=data, timeout=ES_TIMEOUT)
        text = resp.text.encode('utf-8').decode('utf-8')
        if resp.ok and (json.loads(text) is not None):
            data = json.loads(text)
            if only_count:
                return data.get('hits', {}).get('total', {})
            else:
                hits = data.get('hits', {}).get('hits', {})
                return hits
        else:
            if only_count:
                return 0
            else:
                return []

    def update_news_click(self, news_click: dict):
        array = {}

        def update(array: dict):
            data = []
            update_json_1 = r'{ "update" : {"_id" : "%s", "_type" : "news", "_index" : "news"} }'
            update_json_2 = r'{"script": {"source":"ctx._source.news_click = ctx._source.containsKey(\"news_click\")? ctx._source.news_click + params.count :  params.count", "params":{"count": %s}}}'
            for key, value in array.items():
                data.append(update_json_1 % key)
                data.append(update_json_2 % value)
            body = '\n'.join(data) + '\n'
            url = '%s/%s' % (self.host, '_bulk')
            requests.post(url, data=body, headers={'Content-Type': 'application/x-ndjson'})

        for k, v in news_click.items():
            array[int(k)] = int(v)
            if len(array) >= 100:
                update(array)
                array = {}
        if len(array) > 0:
            update(array)

    def get_news_terms(self, news_id: int) -> list:
        url = '%s/news/news/%s/_termvectors' % (self.host, news_id)
        body = {
            "fields": ["news_title"],
            "offsets": True,
            "payloads": True,
            "positions": True,
            "term_statistics": True
        }
        resp = requests.get(url, auth=self.awsauth, json=body)
        text = resp.text.encode('utf-8').decode('utf-8')
        if resp.ok and (json.loads(text) is not None):
            data = json.loads(text)
            terms = data['term_vectors']['news_title']['terms'] if 'term_vectors' in data else dict()  # type: dict
            terms_tf_idf = [(value['term_freq'] / (math.log2(value['doc_freq']) + 1), term) for term, value in
                            terms.items()]
            return [term[1] for term in sorted(terms_tf_idf)]
        else:
            return []

    def get_terms(self, keyword: str) -> list:
        url = '%s/_analyze' % self.host
        body = {
            "text": keyword
        }
        resp = requests.get(url, auth=self.awsauth, json=body)
        text = resp.text.encode('utf-8').decode('utf-8')
        if resp.ok and (json.loads(text) is not None):
            data = json.loads(text)
            return [token['token'] for token in data['tokens']]
        else:
            return []

    def search_topic_ids_by_conditions(self, keyword: str, count: int = 10) -> List[int]:
        url = '%s/%s/_search' % (self.host, 'flashgo_index')
        data = {
            'size': count,
            'min_score': 1.5,
            'query': {
                'match': {
                    'keywords': keyword
                }
            },
            'post_filter': {
                'term': {'status': 1}
            }
        }
        resp = requests.get(url, auth=self.awsauth, json=data)
        text = resp.text.encode('utf-8').decode('utf-8')
        if resp.ok and (json.loads(text) is not None):
            data = json.loads(text)
            hits = data.get('hits', {}).get('hits', {})
            return [source.get('_source', {}).get('id') for source in hits]

    def search_ins_video_ids(self, news_id: int, max_count: int) -> List[int]:
        detail_resp = requests.get('%s/%s/news/%s' % (self.host, NEWS_INDEX_NAME, news_id), auth=self.awsauth, json={})
        if detail_resp.ok and (detail_resp.json() is not None) and (detail_resp.json()['found'] is True):

            filters = [
                {
                    'range': {
                        'news_valid': {
                            'gte': 1
                        }
                    }
                },
            ]

            data = {
                'size': max_count,
                'min_score': 1,
                'query': {
                    'bool': {
                        'must': [
                            {
                                'match': {
                                    'news_news_type': 3
                                }
                            },
                            # {
                            #     'match': {
                            #         'news_url': 'instagram'
                            #     }
                            # }
                        ],
                        'should': [
                            {
                                'match': {
                                    "news_title": detail_resp.json().get('_source').get('news_title', '')
                                }
                            }
                        ],
                        'filter': filters
                    }
                },
                "post_filter": {
                    'range': {
                        'news_video_duration': {
                            'lte': 300
                        }
                    }
                }
            }

            categories = detail_resp.json().get('_source').get('news_categories', [])
            if categories is not None and len(categories) > 0:
                category_id = categories[0].get('category_id')
                data['query']['bool']['should'].append(
                    {
                        'match': {
                            'news_categories.category_id': category_id
                        }
                    }
                )

            media_id = detail_resp.json().get('_source').get('news_media_id', None)
            if media_id is not None:
                data['query']['bool']['should'].append(
                    {
                        'match': {
                            'news_media_id': media_id
                        }
                    }
                )

            resp = requests.get('%s/%s/_search' % (self.host, 'news'), auth=self.awsauth, json=data)
            text = resp.text.encode('utf-8').decode('utf-8')
            if resp.ok and (json.loads(text) is not None):
                data = json.loads(text)
                hits = data.get('hits', {}).get('hits', {})
                return [int(source.get('_id')) for source in hits if
                        'instagram' in source['_source']['news_url'] and int(source.get('_id')) != news_id]
        else:
            return []

    def get_relative_deal_ids(self, deal_id, only_cashback, count=1000):
        deal_resp = requests.get(f"{self.host}/{DEAL_INDEX_NAME}/deal/{deal_id}", auth=self.awsauth, json={})
        deal_resp_json = deal_resp.json()
        if deal_resp.ok and (deal_resp_json is not None) and (deal_resp_json["found"] is True):
            title = deal_resp_json["_source"]["data_deal_data_title"]
            categories = deal_resp_json["_source"].get("data_category_data_categories", [])
        else:
            return []
        filters = [
            {
                'range': {
                    "data_deal_data_valid": {
                        'gte': 1
                    }
                }
            }
        ]

        now = int(time.time())
        if only_cashback:
            filters.append({
                "range": {
                    "data_cps_offer_data_start_timestamp": {
                        "lte": now
                    }
                }
            })
            filters.append({
                "range": {
                    "data_cps_offer_data_end_timestamp": {
                        "gte": now + 30 * 60
                    }
                }
            })

        if categories is not None and len(categories) > 0:
            category_id = categories[0].get("category_id")
            filters.append(
                {
                    "match": {
                        "data_category_data_categories.category_id": category_id
                    }
                }
            )

        data = {
            "from": 0,
            "size": count,
            "min_score": 0.1,
            "query": {
                "bool": {
                    "must": [
                        {
                            "match": {
                                "data_deal_data_title": title
                            }
                        }
                    ],
                    "filter": filters
                }
            }
        }

        if only_cashback:
            search_resp = requests.get("%s/%s/_search" % (self.host, OFFER_INDEX_NAME), auth=self.awsauth, json=data)
        else:

            search_resp = requests.get('%s/%s/_search' % (self.host, DEAL_INDEX_NAME), auth=self.awsauth, json=data)

        if search_resp.ok and (search_resp.json() is not None):
            return [int(deal['_id']) for deal in search_resp.json().get('hits', {}).get('hits', [])
                    if int(deal['_id']) != deal_id]
        else:
            return []


es_client = ESClient('https://vpc-flashgo-es-pycb7s4oyr5bb7arh5uzrlqooi.ap-southeast-1.es.amazonaws.com')
