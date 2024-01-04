from urllib import parse


def get_tracking_link(ecommerce_id: int, deep_link: str = None, web_link: str = None, sub_id: str = None):
    if ecommerce_id == 3:
        return bukalapak_tracking_link(deep_link=deep_link)
    if ecommerce_id == 2:
        return lazada_tracking_link(web_link=web_link)
    if ecommerce_id == 5:
        return shopee_tracking_link(web_link=web_link)
    if ecommerce_id == 6:
        return blibli_tracking_link(web_link=web_link)
    return ''


def bukalapak_tracking_link(deep_link: str = None, web_link: str = None, sub_id: str = None):
    inner_params = {
        'ho_offer_id': '{offer_id}',
        'ho_trx_id': '{transaction_id}',
        'affiliate_id': '{affiliate_id}',
        'ho_clk_id': '{aff_click_id}',
        'aff_sub1': '{aff_sub}',
        'aff_sub2': '{aff_sub2}',
        'aff_sub3': '{aff_sub3}',
        'aff_sub4': '{aff_sub4}',
        'aff_sub5': '{aff_sub5}',
        'aff_src': '{source}',
        'ref': '{referer}',
        'utm_source': 'hasoffers-{affiliate_id}',
        'utm_medium': 'affiliate',
        'utm_campaign': '{offer_id}'
    }
    params = {
        'offer_id': 15, 'aff_id': 8909,
        'url': '?'.join([deep_link, parse.urlencode(inner_params, safe='{}')])
    }
    return '?'.join(['https://bukalapak.go2cloud.org/aff_c', parse.urlencode(params, safe='{}')])


def lazada_tracking_link(deep_link: str = None, web_link: str = None, sub_id: str = None):
    params = {
        'offer_id': 100328,
        'aff_id': 103015,
        'source': 'deeplink_generator',
        'url': web_link
    }
    return '?'.join(['http://invol.co/aff_m', parse.urlencode(params)])


def jd_tracking_link(deep_link: str = None, web_link: str = None, sub_id: str = None):
    pass


def tokopedia_tracking_link(deep_link: str = None, web_link: str = None, sub_id: str = None):
    pass


def blibli_tracking_link(deep_link: str = None, web_link: str = None, sub_id: str = None):
    params = {
        'offer_id': 2068,
        'aff_id': 103015,
        'source': 'deeplink_generator',
        'url': web_link
    }
    return '?'.join(['http://invol.co/aff_m', parse.urlencode(params)])


def shopee_tracking_link(deep_link: str = None, web_link: str = None, sub_id: str = None):
    params = {
        'offer_id': 100188,
        'aff_id': 103015,
        'source': 'deeplink_generator',
        'url': web_link
    }
    return '?'.join(['http://invol.co/aff_m', parse.urlencode(params)])
