import requests

from common import loggers

BANNER_AD = 'http://impression.appsflyer.com/com.tokopedia.tkpd?af_adset=flashgo&pid=newsinpalm_int&c=installs_march_2019&af_click_lookback=7d&advertising_id={gaid}'

logger = loggers.get_logger(__name__)


def record_impression(gaid, url=BANNER_AD):
    if gaid is None or len(gaid) == 0:
        logger.info('gaid is NULL')
        return False
    else:
        url = url.format(gaid=gaid)
        requests.get(url)
        return True
