from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


class CommonIncentiveAction(Base):
    __tablename__ = "common_incentive_actions"

    id = Column(Integer, primary_key=True)
    title = Column(String)
    description = Column(String)
    name = Column(String)
    coin = Column(Integer)
    money = Column(Integer)
    max_count_per_day = Column(Integer)
    show_on_task = Column(Integer)
    status = Column(Integer)
    start_time = Column(DateTime)
    start_timestamp = Column(Integer)
    end_timestamp = Column(Integer)
    award_type = Column(Integer)

    PREMIUM_ACTION_IDS = [29001, 29002]

    def to_json(self):
        return {k: v for k, v in self.__dict__.items() if not k.startswith('_')}

    def to_task_json(self, basic_data=None):
        if basic_data is None:
            return {
                'action_id': self.id,
                'action_title': self.title,
                'action_description': self.description,
            }
        else:
            return {
                'action_id': basic_data['id'],
                'title': basic_data['title'],
                'action_description': basic_data['description']
            }


class UserAwardDetails(Base):
    __tablename__ = 'user_award_details'

    id = Column(Integer, primary_key=True)
    user_id = Column(String)
    action_id = Column(Integer)
    complete_order = Column(Integer, default=1)
    news_id = Column(Integer, default=None)
    order_id = Column(String)
    created_timestamp = Column(Integer)
    created_time = Column(DateTime)
    order_status = Column(Integer)


class ActivityTopic(Base):
    __tablename__ = 'activity_topic'

    id = Column(Integer, primary_key=True)
    action_id = Column(Integer)
    topic_id = Column(Integer)
    status = Column(Integer)
    created_time = Column(DateTime)
    created_timestamp = Column(Integer)
