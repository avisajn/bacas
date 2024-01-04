import datetime

from common.es_client import es_client
from common.redisclient import redis_client


def main():
    for gender in ['Male', 'Female']:
        data = redis_client.get_gender_click_news(gender, with_scores=True,
                                                  date=datetime.datetime.now() - datetime.timedelta(days=1))
        es_client.update_news_click(data)


if __name__ == '__main__':
    main()
