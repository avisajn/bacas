
FLASH_RECEIVERS = ['lingfeng@newsinpalm.com', 'xiansen@newsinpalm.com']
FLASH_SUBJECT = 'Flash Deals Monitoring Alert'
FLASH_REQUEST_BODY = {"user_id": "test",
                      "page_id": 0,
                      "count": 30}
FLASH_MESSAGE_CONTENT = """
    ATTENTION FLASH DEALS PLEASE !!!
        The statistics of flash deals in MySQL is :
            'select count(*) from deals_flashdeals where now() > starttime and now() < endtime' : {}
            'select count(*) from deals_flashdeals where (now() > starttime and now() < endtime and current_price <= 0)': {}

        The statistics of flash deals in Redis is :
            ongoing: {}  
            current_price == '???' in ongoing: {} 
            coming {}
    """

REDIS_RECEIVERS = ['lingfeng@newsinpalm.com', 'xiansen@newsinpalm.com']
REDIS_SUBJECT = 'Redis Monitoring Alert'
REDIS_MESSAGE_CONTENT = """
    ATTENTION Redis PLEASE !!!
        used_memory_human: {} ;
        used_memory_rss_human: {} ;
        used_memory_peak_human: {} .
"""

CHANNELS_RECEIVERS = ['lingfeng@newsinpalm.com', 'xiansen@newsinpalm.com']
CHANNELS_SUBJECT = 'Channels Monitoring Alert'
CHANNELS_MESSAGE_CONTENT = """
    ATTENTION Channels Feeds PLEASE !!!
        cheapest: {}
        men: {}
        women: {}
        food: {}
        share: {}
"""

RECOMMEND_RECEIVERS = ['lingfeng@newsinpalm.com', 'xiansen@newsinpalm.com']
RECOMMEND_SUBJECT = 'Recommend feeds Monitoring Alert'
RECOMMEND_MESSAGE_CONTENT = """
    ATTENTION Recommend Feeds PLEASE !!!
        The amount of recommend feeds is less than 30. 
"""

SHARE_RECEIVERS = ['lingfeng@newsinpalm.com', 'xiansen@newsinpalm.com']
SHARE_SUBJECT = 'Share feeds Monitoring Alert'
SHARE_MESSAGE_CONTENT = """
    ATTENTION Share Feeds PLEASE !!!
        count in table share_deals: {}
        count in table deal_deals: {}
            valid==1:  {}
            valid==0:  {}
"""