import datetime
import time
from typing import Dict

from comments.utils import get_comment_info
from common import userutils, utils, loggers
from common.mysqlclient import mysql_client
from common.redisclient import cache, redis_client
from common.sql_models import UserFollowing
from news.constants import NewsStatus
from news.utils import get_news_info
from push import context, config
from push.config import gen_batch_id, PUSH_TYPE_ARTICLE, PUSH_TYPE_IMAGE_TEXT, PUSH_TYPE_VIDEO, PushQueue
from push.item_push import generate_message
from push.models import PushUser, PushItem
from push.redis_client import PushRedisClient
from users.constants import UserTypeMapping
from users.utils import get_user_info, get_user_author_info


@cache(key=lambda media_id: 'AUTHOR_F_%s' % media_id, ex=10 * 60)
def _get_follows(media_id):
    follows = mysql_client.retrieve_objects_by_conditions(UserFollowing,
                                                          UserFollowing.author_id == media_id,
                                                          limit=2000)
    return [follow.user_id for follow in follows]


def get_news_push_info(news_id):
    news_info = get_news_info(news_id, user_id='test')
    news_type = news_info['type']
    title = news_info['title']
    valid = news_info['valid'] > 0
    if news_type == 0:
        return PUSH_TYPE_ARTICLE, title, valid
    elif news_type == 2:
        return PUSH_TYPE_IMAGE_TEXT, title, valid
    elif news_type == 3:
        return PUSH_TYPE_VIDEO, title, valid
    else:
        raise Exception('unsupported  news type %s' % news_type)


def get_follows(author_id):
    follows_count = redis_client.get_followers_count(author_id)
    if follows_count is not None and follows_count > 0:
        follows = _get_follows(author_id)
        if len(follows) != follows_count:
            redis_client.clear_object_cache('AUTHOR_F_%s' % author_id)
        return follows
    else:
        return _get_follows(author_id)


def _unique_fcm_tokens(user_tokens) -> Dict[str, str]:
    token_users = {v: k for k, v in user_tokens.items()}
    return {v: k for k, v in token_users.items()}


def get_user_fcm_tokens(user_ids) -> Dict[str, str]:
    user_fcm_tokens = redis_client.get_user_fcm_tokens(user_ids)
    left_user_id = [user_id for user_id in user_ids if user_id not in user_fcm_tokens]
    left_fcm_tokens = userutils.retrieve_fcm_tokens(left_user_id)
    redis_client.cache_user_fcm_tokens(left_fcm_tokens)
    for k, v in left_fcm_tokens.items():
        user_fcm_tokens[k] = v
    return _unique_fcm_tokens(user_fcm_tokens)


BATCH_SIZE = 50

logger = loggers.get_logger('handler_events', 'handler_events.log')


class Handler(object):
    __handlers = {}

    @staticmethod
    def get_handlers(event_name):
        return Handler.__handlers.get(event_name, lambda x: x)

    @staticmethod
    def set_handler(name, function):
        Handler.__handlers[name] = function

    def __init__(self, name):
        self.name = name

    def __call__(self, f):
        Handler.set_handler(self.name, f)
        return f


@Handler('create_news')
def handler_create_news_event(message: dict):
    event_name = message.get('event_name', '')
    media_id = message.get('media_id', 0)
    news_id = message.get('news_id', 0)
    created_time = message.get('created_time', '')
    author_info = get_user_author_info(media_id)
    if event_name == 'create_news' \
            and media_id > 0 \
            and author_info['user_type'] == UserTypeMapping.SPIDER_USER \
            and author_info['show_on_feed'] > 0 \
            and news_id > 0 \
            and int(time.time()) - created_time < 24 * 60 * 60:
        rate_limit = context.context.redis_user_rate_limit
        author_user_id = 'AUTHOR_%s' % media_id
        news_type, news_title, valid = get_news_push_info(news_id)
        push_type = 'author%s' % news_type
        play_video_directly = get_news_info(news_id, user_id='test', play_video_directly=True)['play_video_directly']
        if valid and author_user_id in rate_limit.try_acquire_permit([author_user_id], 1, 1):
            batch_id = gen_batch_id(datetime.datetime.now(), push_type, news_id, 'all')
            data_message = generate_message(batch_id=batch_id, push_type=news_type,
                                            title='%s baru saja memposting sesuatu, cek sekarang!' %
                                                  get_user_info(str(media_id))['name'],
                                            body=news_title,
                                            image=get_news_info(news_id, 'test')['thumb_image']['url'],
                                            content_id=news_id, play_video_directly=play_video_directly)
            follows = get_follows(media_id)
            logger.info('media %s have %s follows, will post' % (media_id, len(follows)))
            if len(follows) > 0:
                fcm_tokens = get_user_fcm_tokens(follows)
                logger.info('media %s have %s follows and %s have tokens, will post' % (
                    media_id, len(follows), len(fcm_tokens)))
                if len(fcm_tokens) > 0:
                    to_push_users = [PushUser(user_id=user_id, fcm_token=fcm_token) for user_id, fcm_token in
                                     fcm_tokens.items() if not utils.is_empty(fcm_token)]
                    for i in range((len(to_push_users) // BATCH_SIZE) + 1):
                        start_index, end_index = i * BATCH_SIZE, (i + 1) * BATCH_SIZE
                        context.context.sender.send(PushQueue.PUSH_P4, PushItem(
                            users=to_push_users[start_index:end_index],
                            push_type=push_type,
                            data_message=data_message
                        ))
        else:
            logger.info('media %s do not push, because news is not valid or not acquire permit' % media_id)


@Handler('comment_like')
def handler_comment_like_event(message: dict, debug=False):
    event_name = message.get('event_name', '')
    comment_id = message.get('comment_id', 0)
    user_id = message.get('user_id', '')
    comment_user_id = message.get('comment_user_id', '')
    created_time = message.get('created_time', '')
    user_name = get_user_info(user_id)['name']
    if event_name == 'comment_like' \
            and comment_id > 0 \
            and user_id.startswith('Facebook') \
            and comment_user_id.startswith('Facebook') \
            and user_id != comment_user_id \
            and not utils.is_empty(user_name) \
            and int(time.time()) - created_time < 6 * 60 * 60:
        batch_id = gen_batch_id(datetime.datetime.now(), 'comment_like', comment_id, 'single')
        title = '<strong>@%s</strong> memberikan like ke kamu' % user_name
        data_message = {
            'title': title,
            'body': title,
            'click_action': 'FLUTTER_NOTIFICATION_CLICK',
            'routeName': 'comment_like',
            'commentId': comment_id,
            'batchId': batch_id,
        }
        fcm_tokens = get_user_fcm_tokens([comment_user_id])
        logger.info('comment_like for user_id %s, comment_user_id %s, fcm_tokens size %s' % (
            user_id, comment_user_id, len(fcm_tokens)))
        if len(fcm_tokens) > 0:
            to_push_users = [PushUser(user_id=comment_user_id, fcm_token=fcm_token) for _, fcm_token in
                             fcm_tokens.items() if not utils.is_empty(fcm_token)]
            if debug:
                return PushItem(
                    users=to_push_users,
                    push_type='comment_like',
                    data_message=data_message
                )
            else:
                context.context.sender.send(PushQueue.PUSH_P4, PushItem(
                    users=to_push_users,
                    push_type='comment_like',
                    data_message=data_message
                ))
    else:
        logger.info('event do not process %s' % message)


def handler(message: dict):
    event_name = message.get('event_name', '')
    return Handler.get_handlers(event_name)(message)


@Handler('comment_replied')
def handler_comment_replied_event(message: dict, debug=False):
    event_name = message.get('event_name', '')
    comment_id = message.get('comment_id', 0)
    created_time = message.get('created_time', '')

    comment_info = get_comment_info('test', comment_id)

    user_id = comment_info.get('user_info').get('user_id', '')
    user_name = comment_info.get('user_info').get('name', '')
    user_info = get_user_info(user_id)
    user_id_be_replied = comment_info.get('user_info_be_replied').get('user_id', '')
    comment_content = comment_info.get('content', '')
    if event_name == 'comment_replied' and \
            comment_id > 0 and \
            (user_id.startswith('Facebook') or user_info['user_type'] == 1) and \
            user_id_be_replied.startswith('Facebook') and \
            len(comment_content) > 0 and \
            not utils.is_empty(user_name) and \
            user_id != user_id_be_replied and \
            int(time.time()) - created_time < 6 * 60 * 60:
        batch_id = gen_batch_id(datetime.datetime.now(), 'comment_replied', comment_id, 'single')
        title = f'<strong>@{user_name}</strong> mengomentari kamu'
        comment_content = f'<strong>{comment_content}</strong>'
        data_message = {
            'title': title,
            'body': comment_content,
            'click_action': 'FLUTTER_NOTIFICATION_CLICK',
            'routeName': 'comment_replied',
            'commentId': comment_id,
            'batchId': batch_id,
        }
        fcm_tokens = get_user_fcm_tokens([user_id_be_replied])
        fcm_tokens_size = len(fcm_tokens)
        logger.info(f'comment_replied for user_id_be_replied {user_id_be_replied}, '
                    f'comment_id {comment_id}, fcm_tokens size {fcm_tokens_size}')
        if len(fcm_tokens) > 0:
            to_push_users = [PushUser(user_id=user_id_be_replied, fcm_token=fcm_token) for _, fcm_token in
                             fcm_tokens.items() if not utils.is_empty(fcm_token)]
            if debug:
                return PushItem(
                    users=to_push_users,
                    push_type='comment_replied',
                    data_message=data_message
                )
            else:
                context.context.sender.send(PushQueue.PUSH_P4, PushItem(
                    users=to_push_users,
                    push_type='comment_replied',
                    data_message=data_message
                ))
    else:
        logger.info('event do not process %s' % message)


@Handler('news_audit')
def handler_news_audit_event(message: dict, debug: bool = False):
    event_name = message.get('event_name', '')
    news_id = message.get('news_id', 0)
    created_time = message.get('created_time', 0)

    news_info = get_news_info(news_id=news_id, user_id='test', play_video_directly=True)
    user_id = news_info['author']['user_id']
    user_type = news_info['author']['user_type']
    if event_name == 'news_audit' and \
            news_id > 0 and \
            user_id.startswith('Facebook') and \
            user_type == UserTypeMapping.REAL_USER and \
            news_info['news_status']['valid_id'] == NewsStatus.SUCCESS and \
            int(time.time()) - created_time < 6 * 60 * 60:
        batch_id = gen_batch_id(datetime.datetime.now(), 'news_audit', news_id, 'single')
        data_message = {
            'title': '',
            'body': '<strong>Konten kamu telah disetujui!</strong>',
            'click_action': 'FLUTTER_NOTIFICATION_CLICK',
            'routeName': 'news_audit',
            'newsId': news_id,
            'batchId': batch_id,
            'play_video_directly': news_info['play_video_directly']
        }
        fcm_tokens = get_user_fcm_tokens([user_id])
        fcm_tokens_size = len(fcm_tokens)
        logger.info(f'news_audit for user_id {user_id}, '
                    f'news_id {news_id}, fcm_tokens size {fcm_tokens_size}')
        if len(fcm_tokens) > 0:
            to_push_users = [PushUser(user_id=_user_id, fcm_token=fcm_token) for _user_id, fcm_token in
                             fcm_tokens.items() if not utils.is_empty(fcm_token)]
            if debug:
                return PushItem(
                    users=to_push_users,
                    push_type='news_audit',
                    data_message=data_message
                )
            else:
                context.context.sender.send(PushQueue.PUSH_P4, PushItem(
                    users=to_push_users,
                    push_type='news_audit',
                    data_message=data_message
                ))
    else:
        logger.info('event do not process %s' % message)


@Handler('news_be_commented')
def handler_news_be_commented_event(message: dict, debug: bool = False):
    event_name = message.get('event_name', '')
    comment_id = message.get('comment_id', 0)
    created_time = message.get('created_time', 0)

    comment_info = get_comment_info('test', comment_id)
    news_info = get_news_info(comment_info['news_id'], 'test', with_tiny_article=False)
    user_id_be_replied = news_info['author']['user_id']

    if event_name == 'news_be_commented' and \
            comment_id > 0 and \
            user_id_be_replied.startswith('Facebook') and \
            news_info['author']['user_type'] == UserTypeMapping.REAL_USER and \
            user_id_be_replied != comment_info['user_info']['user_id'] and \
            int(time.time()) - created_time < 6 * 60 * 60:
        batch_id = gen_batch_id(datetime.datetime.now(), 'news_be_commented', comment_id, 'single')
        data_message = {
            'title': f'<strong>@{comment_info["user_info"]["name"]}</strong> mengomentari kamu',
            'body': f'<strong>{comment_info["content"]}</strong>',
            'click_action': 'FLUTTER_NOTIFICATION_CLICK',
            'routeName': 'news_be_commented',
            'batchId': batch_id,
        }
        fcm_tokens = get_user_fcm_tokens([user_id_be_replied])
        fcm_tokens_size = len(fcm_tokens)
        logger.info(f'news_be_commented for user_id_be_replied {user_id_be_replied}, '
                    f'comment_id {comment_id}, fcm_tokens size {fcm_tokens_size}')
        if len(fcm_tokens) > 0:
            to_push_users = [PushUser(user_id=_user_id, fcm_token=fcm_token) for _user_id, fcm_token in
                             fcm_tokens.items() if not utils.is_empty(fcm_token)]
            if debug:
                return PushItem(
                    users=to_push_users,
                    push_type='news_be_commented',
                    data_message=data_message
                )
            else:
                context.context.sender.send(PushQueue.PUSH_P4, PushItem(
                    users=to_push_users,
                    push_type='news_be_commented',
                    data_message=data_message
                ))
    else:
        logger.info('event do not process %s' % message)


@Handler('news_be_liked')
def handler_news_be_liked_event(message: dict, debug: bool = False):
    event_name = message.get('event_name', '')
    news_id = message.get('news_id', 0)
    thumb_up_user_id = message.get('like_user_id', '')
    created_time = message.get('created_time', 0)

    news_info = get_news_info(news_id, 'test', with_tiny_article=False)
    user_id_be_liked = news_info['author']['user_id']
    thumb_up_user_info = get_user_info(thumb_up_user_id, with_avatar=False)

    if event_name == 'news_be_liked' and \
            news_id > 0 and \
            thumb_up_user_id.startswith('Facebook') and \
            user_id_be_liked.startswith('Facebook') and \
            thumb_up_user_id != user_id_be_liked and \
            news_info['author']['user_type'] == UserTypeMapping.REAL_USER and \
            int(time.time()) - created_time < 6 * 60 * 60:
        batch_id = gen_batch_id(datetime.datetime.now(), 'news_be_liked', news_id, 'single')
        data_message = {
            'title': '',
            'body': f'<strong>@{thumb_up_user_info["name"]}</strong> memberikan like ke kamu',
            'click_action': 'FLUTTER_NOTIFICATION_CLICK',
            'routeName': 'news_be_liked',
            'batchId': batch_id,
        }
        fcm_tokens = get_user_fcm_tokens([user_id_be_liked])
        fcm_tokens_size = len(fcm_tokens)
        logger.info(f'news_be_liked for thumb_up_user_id {thumb_up_user_id}, '
                    f'news_id {news_id}, fcm_tokens size {fcm_tokens_size}')
        if len(fcm_tokens) > 0:
            to_push_users = [PushUser(user_id=_news_author_id, fcm_token=fcm_token) for _news_author_id, fcm_token
                             in fcm_tokens.items() if not utils.is_empty(fcm_token)]
            if debug:
                return PushItem(
                    users=to_push_users,
                    push_type='news_be_liked',
                    data_message=data_message
                )
            else:
                context.context.sender.send(PushQueue.PUSH_P4, PushItem(
                    users=to_push_users,
                    push_type='news_be_liked',
                    data_message=data_message
                ))
    else:
        logger.info('event do not process %s' % message)


@Handler('incentive_income')
def handler_incentive_income_event(message: dict, debug: bool = False):
    event_name = message.get('event_name', '')
    user_id = message.get('user_id', '')
    total_award = message.get('total_award', 0)
    created_time = message.get('created_time', 0)

    if event_name == 'incentive_income' and \
            int(time.time()) - created_time < 6 * 60 * 60:
        batch_id = gen_batch_id(datetime.datetime.now(), 'incentive_income', user_id, 'single')
        data_message = {
            'title': '',
            'body': f"konten yang kamu posting kemarin mendapatkan <font color='#FF6203'>{total_award} koin</font>!",
            'click_action': 'FLUTTER_NOTIFICATION_CLICK',
            'routeName': 'incentive_income',
            'batchId': batch_id,
        }
        fcm_tokens = get_user_fcm_tokens([user_id])
        fcm_tokens_size = len(fcm_tokens)
        logger.info(f'incentive income for user_id {user_id}, fcm_tokens size {fcm_tokens_size}')
        if len(fcm_tokens) > 0:
            to_push_users = [PushUser(user_id=user_id, fcm_token=fcm_token) for user_id, fcm_token
                             in fcm_tokens.items() if not utils.is_empty(fcm_token)]
            if debug:
                return PushItem(
                    users=to_push_users,
                    push_type='incentive_income',
                    data_message=data_message
                )
            else:
                context.context.sender.send(PushQueue.PUSH_P4, PushItem(
                    users=to_push_users,
                    push_type='incentive_income',
                    data_message=data_message
                ))
    else:
        logger.info('event do not process %s' % message)


def _test(handler_function):
    # event = {
    #     'event_name': 'incentive_income',
    #     'user_id': 'Facebook_101764261224675',
    #     'total_award': 1000,
    #     'created_time': int(time.time())
    # }
    # push_item = handler_function(event, debug=True)
    user_list = [PushUser(user_id='Facebook_533242040476625',
                          fcm_token='fdVEBnQ5HxQ:APA91bGKlyC1Bkvx4YcWv52Na9duL0fQWWI0-GcV3L1SPapica66n1gOBxuFyFHhNcy6lzzecm5vuDHvVPSuzaRxwvir5SszrJ9to6TfUJS1BDnYAtAKXVR3-adMq4G3pPIcVqnburpu')]

    push_item = PushItem(
        users=user_list,
        push_type='video',
        data_message= {
            'title': 'title',
            'body': 'body',
            'click_action': 'FLUTTER_NOTIFICATION_CLICK',
            'routeName': 'videoDetail',
            'videoId': 100919022,
            'batchId': 'batch_id',
            'image': "https://cdn.flashgo.online/news-images/thumbs/refine/cd0e7e52-a5bf-4984-a1c9-f03714ed005a.jpg",
            'play_video_directly': True
        }
    )
    print(push_item)
    from push.push_client import PushClient
    push_client = PushClient(None, None)
    print(push_client.push(push_item))


def main():
    push_redis_client = PushRedisClient(**config.REDIS_CLIENT_CONFIG)
    for event_lambda in [
        push_redis_client.receive_create_news_event,
        push_redis_client.receive_comment_like_event,
        push_redis_client.receive_comment_replied_event,
        push_redis_client.receive_news_audit_event,
        push_redis_client.receive_news_be_commented,
        push_redis_client.receive_news_be_liked,
        push_redis_client.receive_incentive_income,
    ]:
        events = event_lambda()
        logger.info("receiver %s events" % len(events))
        if len(events) > 0:
            logger.info("first event is %s" % events[0])
        for event in events:
            try:
                handler(event)
            except:
                logger.exception('handler event error, %s' % event)


if __name__ == '__main__':
    main()
    # _test(handler_incentive_income_event)
