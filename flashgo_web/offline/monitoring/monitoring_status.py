from offline.loader.redisclient import redis_client
from common.redisclient import DEAL_CACHE
from offline.loader.mysqlclient import mysql_client
from common.sql_models import FlashDeal
from common.loggers import get_offline_logger
import time
import datetime
from common.mailsender import mail_sender
import requests
import json
from offline.monitoring.config import FLASH_RECEIVERS, FLASH_SUBJECT, FLASH_MESSAGE_CONTENT, FLASH_REQUEST_BODY, \
    REDIS_RECEIVERS, REDIS_SUBJECT, REDIS_MESSAGE_CONTENT, CHANNELS_MESSAGE_CONTENT, CHANNELS_RECEIVERS, \
    CHANNELS_SUBJECT, RECOMMEND_RECEIVERS, RECOMMEND_SUBJECT, RECOMMEND_MESSAGE_CONTENT, SHARE_RECEIVERS, \
    SHARE_SUBJECT, SHARE_MESSAGE_CONTENT


logger = get_offline_logger(__name__, 'monitor_mail.log')


def _flash_need_alert():
    # ongoing 的flash deal 数量
    ongoing_response = requests.post(url='http://flashgo.online/sales/deals/ongoing_flash_deal_feeds/',
                                     json=FLASH_REQUEST_BODY)
    ongoing_count = len(json.loads(ongoing_response.content.decode())['data'])

    # coming 的flash deal 数量
    coming_response = requests.post(url='http://flashgo.online/sales/deals/comming_flash_deal_feeds/',
                                    json=FLASH_REQUEST_BODY)
    coming_count = len(json.loads(coming_response.content.decode())['data'])

    if ongoing_count < 30 or coming_count < 30:
        return True
    else:
        return False


def _flash_check_mysql():
    ongoing_count = mysql_client.execute_sql('select count(*) from deals_flashdeals where now() > starttime and now() < endtime')[0][0]
    invalid_count = mysql_client.execute_sql('select count(*) from deals_flashdeals where (now() > starttime and now() < endtime and current_price <= 0)')[0][0]
    return {
        'ongoing': ongoing_count,
        'invalid_count': invalid_count
    }


def _flash_check_redis():
    flash_deal_ids = redis_client.get_flash_deal()
    deals_time = redis_client.batch_get_start_and_end_time(flash_deal_ids)
    deals = redis_client.batch_get_deal_cache(flash_deal_ids)
    ongoing_count = 0
    coming_count = 0
    current_price_zero = 0
    now = int(time.time())
    for deal_id, v in deals_time.items():
        if v['start_time'] <= now < v['end_time']:
            ongoing_count += 1
            if deals.get(int(deal_id)).get('current_price', 0) <= 0:
                current_price_zero += 1
        else:
            coming_count += 1
    return {
        'ongoing': ongoing_count,
        'coming': coming_count,
        'current_price_zero': current_price_zero
    }


def _redis_need_alert():

    def _to_float(float_str):
        return float(float_str[:-1])

    info = redis_client.get_info()
    if _to_float(info['used_memory_human']) >= 20.0:
        return info
    elif _to_float(info['used_memory_rss_human']) >= 20.0:
        return info
    elif _to_float(info['used_memory_peak_human']) >= 20.0:
        return info
    else:
        return {}


def _channels_need_alert():
    # 低价频道
    ret = {}
    cheapest_response = requests.post(url='http://flashgo.online/sales/deals/get_channel_feeds/',
                                      json={"user_id": "test", "channel_id": 1, "page_id": 0, "count": 30})
    ret['cheapest_count'] = len(json.loads(cheapest_response.content.decode())['data'])

    # 男装频道
    men_response = requests.post(url='http://flashgo.online/sales/deals/get_channel_feeds/',
                                 json={"user_id": "test", "channel_id": 2, "page_id": 0, "count": 30})
    ret['men_count'] = len(json.loads(men_response.content.decode())['data'])

    # 女装频道
    women_response = requests.post(url='http://flashgo.online/sales/deals/get_channel_feeds/',
                                   json={"user_id": "test", "channel_id": 3, "page_id": 0, "count": 30})
    ret['women_count'] = len(json.loads(women_response.content.decode())['data'])

    # 视频频道
    food_response = requests.post(url='http://flashgo.online/sales/deals/get_channel_feeds/',
                                  json={"user_id": "test", "channel_id": 4, "page_id": 0, "count": 30})
    ret['food_count'] = len(json.loads(food_response.content.decode())['data'])

    # 团购频道
    food_response = requests.post(url='http://flashgo.online/sales/deals/get_channel_feeds/',
                                  json={"user_id": "test", "channel_id": -2, "page_id": 0, "count": 30})
    ret['share_count'] = len(json.loads(food_response.content.decode())['data'])
    return ret


def _recommend_need_alert():
    recommend_response = requests.post(url='http://flashgo.online/sales/deals/get_recommendation_feeds/',
                                       json={"user_id": "test", "page_id": 0, "count": 30})
    count = len(json.loads(recommend_response.content.decode())['data'])
    return True if count == 0 else False


def _share_need_alert():
    share_response = requests.post(url='http://flashgo.online/sales/deals/share_deal_top_feeds/',
                                   json={"user_id": "test", "page_id": 0, "count": 30})
    count = len(json.loads(share_response.content.decode())['data'])
    ret = {}
    if count <= 10:
        share_deals = [deal.deal_id for deal in mysql_client.get_share_deals()]
        ret['count_sharedeals'] = len(share_deals)
        deals = mysql_client.retrieve_deals_by_deal_id_list(share_deals)
        ret['count_deal_deals'] = len(deals)
        invalid_count = 0
        valid_count = 0
        for deal in deals:
            if deal.valid == 1:
                valid_count += 1
            elif deal.valid == 0:
                invalid_count += 1
        ret['valid_count'] = valid_count
        ret['invalid_count'] = invalid_count
    return ret


def repeat_execute_request(func, times=3):
    ret = set()
    for i in range(times):
        ret.add(func())
    for alert in ret:
        if alert:
            return True
    pass


def main():
    import sys
    if len(sys.argv) > 1:
        action = sys.argv[1]
    else:
        action = None
    try:
        # flash deals数量要求大于30
        if action == 'flash-deals':
            if _flash_need_alert():
                data_mysql = _flash_check_mysql()
                data_redis = _flash_check_redis()
                message_content = FLASH_MESSAGE_CONTENT.format(
                    data_mysql['ongoing'],
                    data_mysql['invalid_count'],
                    data_redis['ongoing'],
                    data_redis['current_price_zero'],
                    data_redis['coming']
                )
                logger.info(message_content)
                mail_sender.send(FLASH_RECEIVERS, FLASH_SUBJECT, message_content)

        # redis 内存使用在20G以下
        elif action == 'redis-info':
            info = _redis_need_alert()
            if info:
                message_content = REDIS_MESSAGE_CONTENT.format(
                    info['used_memory_human'],
                    info['used_memory_rss_human'],
                    info['used_memory_peak_human']
                )
                logger.info(message_content)
                mail_sender.send(REDIS_RECEIVERS, REDIS_SUBJECT, message_content)

        # channel feeds数量要大于30
        elif action == 'channel':
            channels_count = _channels_need_alert()
            alert = False
            for channel, count in channels_count.items():
                if count < 30:
                    alert = True
                    continue
            if alert:
                message_content = CHANNELS_MESSAGE_CONTENT.format(
                    channels_count['cheapest_count'],
                    channels_count['men_count'],
                    channels_count['women_count'],
                    channels_count['food_count'],
                    channels_count['share_count']
                )
                logger.info(message_content)
                mail_sender.send(CHANNELS_RECEIVERS, CHANNELS_SUBJECT, message_content)

        # 推荐的feed流数量要大于30
        elif action == 'recommend':
            alert = _recommend_need_alert()
            if alert:
                logger.info(RECOMMEND_MESSAGE_CONTENT)
                mail_sender.send(RECOMMEND_RECEIVERS, RECOMMEND_SUBJECT, RECOMMEND_MESSAGE_CONTENT)

        # share的数量要大于20
        elif action == 'share':
            alert = _share_need_alert()
            if alert:
                message_content = SHARE_MESSAGE_CONTENT.format(
                    alert['count_sharedeals'],
                    alert['count_deal_deals'],
                    alert['valid_count'],
                    alert['invalid_count']
                )
                logger.info(message_content)
                mail_sender.send(SHARE_RECEIVERS, SHARE_SUBJECT, message_content)
    except:
        logger.exception('send mail error.')


if __name__ == '__main__':
    try:
        main()
    except:
        logger.exception('monitoring error')
