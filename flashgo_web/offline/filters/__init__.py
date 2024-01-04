from string import ascii_letters
import os
from common.utils import list_to_chunk
from offline.loader.mysqlclient import mysql_client
from offline.loader.redisclient import redis_client

ascii_letters = set(ascii_letters)

SIMILARITY_INDICATOR = {'title', 'original_price'}
COMPARE_SEQUENCE = ['sales', 'comments', 'view_count', 'stars', 'id', 'ecommerce_id']
JACCARD_INDEX = 0.6

_cache = {}


class Filter(object):
    def __init__(self, deal_ids: list):
        self.deal_ids = deal_ids
        self._origin_deal_ids = list(deal_ids)
        self._current_result = self._gen_current_result(deal_ids)
        self.deals = self._get_deals(deal_ids)

    def _get_deals(self, deal_ids):
        global _cache
        deals = {}
        _deal_ids = []
        for deal_id in deal_ids:
            if deal_id in _cache:
                deals[deal_id] = _cache[deal_id]
            else:
                _deal_ids.append(deal_id)
        deals.update(self._load_deal(_deal_ids))
        for deal_id in _deal_ids:
            if deal_id in deals:
                _cache[deal_id] = deals[deal_id]
            if len(_cache) > 100000:
                _cache = {}
        self._current_result = self._gen_current_result(list(deals.keys()))
        return deals

    @staticmethod
    def _load_deal(deal_ids):
        deals = {}
        for item in list_to_chunk(deal_ids):
            deals_from_redis = redis_client.batch_get_deals_attributes(item)
            deals_from_mysql = mysql_client.retrieve_deals_by_deal_id_list(
                list(set(item) - deals_from_redis.keys()),
                to_dict=True
            )
            deals.update(deals_from_redis)
            deals.update(deals_from_mysql)
        return {k: v for k, v in deals.items() if v is not None}

    def _gen_current_result(self, deal_ids):
        deal_ids_set = set([int(deal_id) for deal_id in deal_ids])
        return (int(deal_id) for deal_id in self._origin_deal_ids if int(deal_id) in deal_ids_set)

    def all(self):
        return [deal_id for deal_id in self._current_result]

    # filter by similar
    @staticmethod
    def _get_words(deal):
        words = set()
        if 'title' in SIMILARITY_INDICATOR:
            word = []
            for char in deal['title'] + '$':
                if char in ascii_letters:
                    word.append(char)
                else:
                    if len(word):
                        words.add(''.join(word))
                    word = []
        for attribute in SIMILARITY_INDICATOR:
            if attribute == 'title':
                continue
            words.add(attribute + str(deal[attribute]))
        return words

    @staticmethod
    def _get_keys(deal):
        words = set()
        word = []
        for char in deal['title'] + '$':
            if char in ascii_letters:
                word.append(char)
            else:
                if len(word):
                    words.add(''.join(word))
                word = []
        words = sorted(list(words))
        words.append(str(deal['original_price']))
        return ''.join(words)

    @staticmethod
    def _get_jac_card(word1, word2):
        return len(word1 & word2) / (len(word1 | word2))

    @staticmethod
    def _compare_attributes(deal1, deal2):
        if deal1['ecommerce_id'] != deal2['ecommerce_id']:
            return deal1['deal_id'] if int(deal1['deal_id']) > int(deal2['deal_id']) else deal2['deal_id']
        else:
            for indicator in COMPARE_SEQUENCE:
                attribute1 = deal1.get(indicator, -1)
                attribute2 = deal2.get(indicator, -1)
                if attribute1 is None:
                    attribute1 = -1
                if attribute2 is None:
                    attribute2 = -1
                if attribute1 != attribute2:
                    return deal1['deal_id'] if attribute1 < attribute2 else deal2['deal_id']

    def _find_parent(self, deal, deal_parents):
        parent = deal_parents[deal['deal_id']]
        if parent['deal_id'] == deal['deal_id']:
            return parent
        else:
            parent = self._find_parent(parent, deal_parents)
            deal_parents[parent['deal_id']] = parent
            return parent

    def _get_invalid_deals(self, deals, step=1, rate=JACCARD_INDEX):
        invalid_set = set()
        deal_parents = {deal['deal_id']: deal for deal in deals}
        for index, deal in enumerate(deals):
            if index + step < len(deals):
                other = deals[index + step]
                if self._get_jac_card(deal['words'], other['words']) >= rate:
                    deal_parent = self._find_parent(deal, deal_parents)
                    other_deal_parent = self._find_parent(other, deal_parents)
                    invalid_deal = self._compare_attributes(deal_parent, other_deal_parent)
                    invalid_set.add(invalid_deal)
                    deal_parents[invalid_deal] = deal_parent if deal_parent[
                                                                    'deal_id'] != invalid_deal else other_deal_parent
        return invalid_set

    def filter_by_similarity(self, steps=5, rate=JACCARD_INDEX):
        deals = {int(deal_id): self.deals.get(deal_id) for deal_id in self._current_result}
        for item in deals.values():
            item['key'] = self._get_keys(item)
            item['words'] = self._get_words(item)
        invalid_set = set()
        deals_with_attributes = sorted(list(deals.values()), key=lambda deal: deal.get('key'))
        for step in range(1, steps):
            invalid_set |= self._get_invalid_deals(deals_with_attributes, step, rate=rate)
        self._current_result = self._gen_current_result(
            [deal_id for deal_id in deals.keys() if deal_id not in invalid_set])
        return self

    # filter by value
    def filter_by_value(self, attribute, value):
        deals_with_attributes = {deal_id: self.deals.get(deal_id) for deal_id in self._current_result}
        self._current_result = self._gen_current_result(
            [deal_id for deal_id, deal in deals_with_attributes.items() if
             deal is not None and deal.get(attribute, 0) != value])
        return self

    # filter by negative words
    @staticmethod
    def _lower_word(word):
        return word.lower().replace(' ', '').replace(',', '').replace('.', '')

    def _get_negative_keywords(self):
        base_dir = os.path.dirname(os.path.abspath(__file__))
        file_path = os.path.join(base_dir, 'negative_keywords.csv')
        res = {}
        with open(file=file_path, encoding='utf8') as f:
            for item in f:
                word = item.strip('\r\n ')
                res[self._lower_word(word)] = word
        return res

    def filter_by_title(self):
        deals_with_attributes = {deal_id: self.deals.get(deal_id) for deal_id in self._current_result}
        negative_keywords = self._get_negative_keywords()
        ret = []
        for deal_id in deals_with_attributes.keys():
            for keyword in negative_keywords:
                if keyword in self._lower_word(deals_with_attributes[deal_id]['title']):
                    break
            else:
                ret.append(deal_id)
        self._current_result = self._gen_current_result(ret)
        return self

    def filter_by_min_value(self, attribute, min_value):
        deals_with_attributes = {deal_id: self.deals.get(deal_id) for deal_id in self._current_result}
        self._current_result = self._gen_current_result(
            [deal_id for deal_id, deal in deals_with_attributes.items() if deal.get(attribute, 0) > min_value])
        return self

    def filter_by_rules(self):
        self.filter_by_value('valid', 0)
        self.filter_by_min_value('current_price', 2000)
        self.filter_by_title()
        self.filter_by_similarity()
        return self

    def filter_by_invalid(self):
        self.filter_by_value('valid', 0)
        self.filter_by_min_value('current_price', 2000)
        self.filter_by_title()
        return self

    def __iter__(self):
        return iter(self.all())


def filter_by_invalid(deal_ids):
    return Filter(deal_ids).filter_by_invalid().all()


def filter_by_similar(deal_ids, rate=JACCARD_INDEX):
    return Filter(deal_ids).filter_by_similarity(rate=rate).all()


def filter_by_rules(deal_ids):
    return list(Filter(deal_ids).filter_by_rules())


__all__ = [filter_by_rules, filter_by_invalid, filter_by_similar, Filter]
