import time
from typing import List

from common.sql_models import TopicNews
from favorite.sql_model import UserLike
from offline.loader.mysqlclient import mysql_client


class Award(object):
    def __init__(self, action_id, start_timestamp: int, end_timestamp: int, award_type: int, coin: int):
        self.action_id = action_id
        self.start_timestamp = start_timestamp
        self.end_timestamp = end_timestamp
        self.award_type = award_type
        self.coin = coin

    def check_available(self, news_publish_timestamp) -> bool:
        return self.start_timestamp <= news_publish_timestamp <= self.end_timestamp

    def meet_conditions(self, user_id, news_id, news_publish_timestamp) -> bool:
        raise NotImplementedError('This function must be implemented.')


class UserLikeAward(Award):
    def __init__(self, min_like_count, **kwargs):
        super(UserLikeAward, self).__init__(**kwargs)
        self._min_like_count = min_like_count

    def meet_conditions(self, user_id, news_id, news_publish_timestamp) -> bool:
        like_count = mysql_client.get_instances_count(UserLike.id, UserLike.news_id == news_id)
        return self.check_available(news_publish_timestamp) and like_count >= self._min_like_count


class TopicAward(Award):
    def __init__(self, topic_ids, **kwargs):
        super(Award, self).__init__(**kwargs)
        self._topic_ids_set = set(topic_ids)

    def meet_conditions(self, user_id, news_id, news_publish_timestamp) -> bool:
        news_topic = mysql_client.retrieve_objects_by_conditions(TopicNews, TopicNews.topic_id.in_(self._topic_ids_set),
                                                                 TopicNews.news_id == news_id,
                                                                 TopicNews.status == 1)
        return self.check_available(news_publish_timestamp) and len(news_topic) > 0


class AwardFactory(object):
    def __init__(self):
        self.__last_refresh_time = 0
        self.__online_award = []
        self.refresh()

    def refresh(self):
        if time.time() - self.__last_refresh_time > 5 * 60:
            # 暂时写死任务, 不需要更新
            user_like_20 = UserLikeAward(action_id=29001, start_timestamp=1579626000, end_timestamp=2145888000,
                                         min_like_count=20, award_type=1, coin=400)
            user_like_50 = UserLikeAward(action_id=29002, start_timestamp=1579626000, end_timestamp=2145888000,
                                         min_like_count=50, award_type=2, coin=1000)
            self.__online_award = [user_like_20, user_like_50]
            self.__last_refresh_time = time.time()

    def get_available_tasks(self, news_publish_timestamp) -> List[Award]:
        self.refresh()
        available_tasks = []
        for award in self.__online_award:
            if award.check_available(news_publish_timestamp):
                available_tasks.append(award)
        return available_tasks


award_factory = AwardFactory()
