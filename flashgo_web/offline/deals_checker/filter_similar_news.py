from offline.loader.mysqlclient import mysql_client
from offline.loader.redisclient import redis_client
from common import loggers
from common.sql_models import CommonNewsCategories
from common.constants import NEWS_TYPE_MAPPING
from news.models import News
from string import ascii_letters


logger = loggers.get_logger(__name__, 'filter_similar_news.log')

def _parse_title(news, join_words=False):
    words = set()
    word = []
    for char in str(news.title) + '$':
        if char in ascii_letters:
            word.append(char)
        else:
            if len(word):
                words.add(''.join(word))
            word = []
    if join_words:
        words = sorted(list(words))
        return ''.join(words)
    else:
        return words


def _get_jac_card(word1, word2):
    denominator = len(word1 | word2)
    denominator = denominator if denominator != 0 else 1
    return len(word1 & word2) / denominator


def _find_parent(news_obj, similar_tree):
    parent = similar_tree[news_obj.news_id]
    if parent.news_id == news_obj.news_id:
        return parent
    else:
        parent = _find_parent(parent, similar_tree)
        similar_tree[parent.news_id] = parent
        return parent


def _get_invalid_news(news, steps=1, rate=0.9):
    for news_obj in news:
        news_obj.keys = _parse_title(news_obj, join_words=True)
        news_obj.words = _parse_title(news_obj, join_words=False)
    news = sorted(news, key=lambda news: news.keys)
    similar_tree = {news_obj.news_id: news_obj for news_obj in news}
    invalid_set = set()
    for step in range(1, steps):
        for index, news_obj in enumerate(news):
            if index + step < len(news):
                other = news[index + step]
                parent_news = _find_parent(news_obj, similar_tree)
                other_parent_news = _find_parent(other, similar_tree)
                if parent_news.news_id == other_parent_news.news_id:
                    invalid_set.add(parent_news.news_id)
                else:
                    if _get_jac_card(news_obj.words, other.words) >= rate:
                        invalid_set.add(other_parent_news.news_id)
                        similar_tree[other_parent_news.news_id] = parent_news
    return invalid_set



def filter_similar_title(steps=5):
    all_cate_ids = [cate.id for cate in mysql_client.retrieve_objects_by_conditions(CommonNewsCategories,
                                                                                    CommonNewsCategories.valid == 1)]
    for cate_id in all_cate_ids:
        for type_name, news_type in NEWS_TYPE_MAPPING.items():
            news_ids = set(redis_client.get_news_ids_by_category(cate_id, news_type))
            news = mysql_client.retrieve_objects_by_conditions(News, News.news_id.in_(news_ids))
            invalid_news_ids = _get_invalid_news(news, steps=steps)
            redis_client.remove_news_from_list(cate_id, news_type, invalid_news_ids)
            logger.info('{} category {} : {}/{} retained.'.format(type_name, cate_id, len(news) - len(invalid_news_ids), len(news)))


def main():
    try:
        logger.info("-----start-----")
        filter_similar_title(5)
        logger.info("-----end-----")
    except:
        logger.exception('filter news similar title error')


if __name__ == '__main__':
    main()