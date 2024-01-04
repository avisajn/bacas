"""
从各个平台抓取热闹搜索词的商品
"""
import datetime
import json
import urllib
import urllib.parse
import lxml.html
import requests

from common import loggers, utils
from common.es_client import es_client
from offline.loader.redisclient import redis_client

logger = loggers.get_offline_logger(__name__, 'hot_word_deals.log')

search_url_pattern = {
    'jd': 'https://www.jd.id/search?keywords={keyword}&page={page_id}&sortType=sort_default_desc',
    'bk': 'https://www.bukalapak.com/products/s?from=omnisearch&page={page_id}&search%5Bhashtag%5D=&search%5Bkeywords%5D={keyword}&search_source=omnisearch_organic&source=navbar&utf8=%E2%9C%93',
    # 'tokopedia': 'https://www.tokopedia.com/search?st=product&q={keyword}&page={page_id}',
    'tokopedia': 'https://ace.tokopedia.com/search/product/v3?scheme=https&device=desktop&source=search&st=product&rows=60&start={start_pos}&q={keyword}',
    'shopee': 'https://shopee.co.id/api/v2/search_items/?by=relevancy&keyword={keyword}&limit=60&newest={start_pos}&order=desc&page_type=search',
    'blibli': 'https://www.blibli.com'
}

deal_path_pattern = {
    'jd': "//div[contains(@class, 'list-products-t')]//a[contains(@itemprop, 'itemListElement')]/@href",
    'bk': "//div[contains(@class,'product-card')]//a[contains(@class, 'link')]/@href",
    'tokopedia': "//div[contains(@class, 'ta-product')]//a/@href",
    'shopee': "//div[contains(@class, 'search-item-result')]//a/@href",
    'blibli': 'https://www.blibli.com'
}

domain_base_url = {
    'jd': 'https://www.jd.id',
    'bk': 'https://www.bukalapak.com',
    'tokopedia': 'https://www.tokopedia.com',
    'shopee': 'https://shopee.co.id',
    'blibli': 'https://www.blibli.com'
}


def get_deal_link(keyword, e_name, page_id=1):
    k = urllib.parse.urlencode({'q': keyword})
    return search_url_pattern[e_name].format(keyword=k[len('q='):], page_id=page_id, start_pos=60 * (page_id - 1))


def parse_html(e_name, text):
    if e_name == 'tokopedia':
        data = json.loads(text)
        products = data.get('data', {}).get('products', [])
        data = [product['url'] for product in products if len(product['url']) > 0]
    elif e_name == 'shopee':
        data = json.loads(text)
        items = data.get('items', [])
        data = []
        for item in items:
            data.append(
                'https://shopee.co.id/{name}-i.{shopid}.{itemid}'.format(name=item.get('name', '').replace(' ', '-'),
                                                                         shopid=item.get('shopid', ''),
                                                                         itemid=item.get('itemid', '')))
    else:
        xpath = deal_path_pattern.get(e_name)
        tree = lxml.html.document_fromstring(text)
        data = tree.xpath(xpath)
    return [urllib.parse.urljoin(domain_base_url.get(e_name), link) for link in data]


def search_keyword(keyword, e_name, size=120):
    links = utils.UniqueItemList()
    for page_id in range(1, 15):
        url = get_deal_link(keyword, e_name, page_id)
        resp = requests.get(url, headers={
            'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/535.11 (KHTML, like Gecko) Ubuntu/11.10 Chromium/27.0.1453.93 Chrome/27.0.1453.93 Safari/537.36'})
        data = parse_html(e_name, resp.text)
        for link in data:
            links.append(link)
        if len(links) >= size:
            break
    return links.to_list()


def get_hot_words():
    return [word.lower() for word in redis_client.get_show_hot_words()] + list(
        redis_client.get_hot_word(50, datetime.datetime.now()).keys())


def query_for_keyword(keyword):
    link_lists = []
    platforms = {'jd', 'tokopedia', 'shopee', 'bk'}
    for platform in platforms:
        try:
            link_lists.append(search_keyword(keyword, platform, 30))
        except:
            logger.exception('query %s error' % platform)
    return utils.pick_from_array(link_lists)


def crawler(url):
    return requests.post('http://127.0.0.1:8889/crawl/put_ecom_url_into_spider_queue',
                         json={'url': url}, timeout=3).text


def query_links():
    all_linkes = []
    for keyword in get_hot_words():
        logger.info('process %s' % keyword)
        links = query_for_keyword(keyword)
        all_linkes += links
        logger.info('process %s, result %s' % (keyword, len(links)))
        redis_client.cache_hot_keyword_url(keyword, links)


def crawler_deals():
    for keyword in get_hot_words():
        urls = redis_client.get_hot_keyword_urls(keyword)
        for link in urls:
            res = crawler(link)
            logger.info('crawler link %s, result %s, keywrods %s' % (link, res, keyword))


def format_url(url: str):
    if url.startswith('https://www.bukalapak.com'):
        if '?' in url:
            return url[:url.rindex('?')]
        else:
            return url
    elif url.startswith('https://www.tokopedia.com'):
        return urllib.parse.unquote(url)
    else:
        return url


def cache_deal_ids():
    for keyword in get_hot_words():
        urls = redis_client.get_hot_keyword_urls(keyword)
        urls = [format_url(url) for url in urls]
        deals = es_client.get_deal(urls)
        deal_ids = [deals[url] for url in urls if url in deals]
        redis_client.cache_hot_keyword_deals(keyword, deal_ids)
        logger.info('keyword %s, urls %s, deal_ids %s' % (keyword, len(urls), len(deal_ids)))


def main():
    import sys
    if len(sys.argv) < 2:
        raise ValueError()
    if sys.argv[1] == 'query_links':
        query_links()
    elif sys.argv[1] == 'crawler_deals':
        crawler_deals()
    else:
        cache_deal_ids()


if __name__ == '__main__':
    main()
