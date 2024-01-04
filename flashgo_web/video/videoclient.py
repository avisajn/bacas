import requests
from news.utils import get_likes_count, check_user_like_status
from common import loggers
from common.redisclient import cache
from favorite.utils import check_user_favorite_status

logger = loggers.get_logger(__name__)


class VideoClient(object):
    def __init__(self, url, deal_url):
        self.url = url
        self.deal_url = deal_url
        self.detail_url = 'http://baca.co.id/api/v1/News/%s?onlyContent=false'
        self.cdn_format = 'http://img.cdn.baca.co.id/%s'

    def parse_video_detail(self, item):
        try:
            data = {
                'id': item['NewsId'],
                'title': item['Title'],
                'image': self.cdn_format % item['Images'][0]['ImageGuid'],
                'url': item['Video']['VideoUrl'],
                'duration': item['Video']['Duration']
            }
            if 'youtube' in data['url']:
                return data
            else:
                return None
        except:
            return None

    def _get_videos(self, url, user_id=None, count=10):
        if count <= 0:
            return []
        headers = {
            'X-User-Id': 'FLASHGO-%s' % user_id,
            'Host': 'baca.co.id'
        }
        resp = requests.get(url=url % count, headers=headers, timeout=5)
        data = resp.json()
        videos = []
        for item in data.get('News', []):
            video = self.parse_video_detail(item)
            if video is not None:
                videos.append(video)
        return videos

    def get_videos(self, user_id=None, count=10):
        deal_videos = self._get_videos(self.deal_url, user_id, count)
        common_videos = self._get_videos(self.url, user_id, count - len(deal_videos))
        video_ids = set()
        res = []
        for video in deal_videos + common_videos:
            if video['id'] not in video_ids:
                res.append(video)
                video_ids.add(video['id'])
        return res

    def get_video_detail(self, user_id, video_id, with_relative_video=False, raise_exception=True):
        try:
            headers = {
                'X-User-Id': 'FLASHGO-%s' % user_id,
                'Host': 'baca.co.id'
            }
            resp = requests.get(url=self.detail_url % int(video_id), headers=headers, timeout=5)
            data = resp.json()
            if with_relative_video:
                relative_videos = data.get('RelativeNews', [])
                return {
                    'detail': self.parse_video_detail(data),
                    'relative_video': [self.parse_video_detail(video) for video in relative_videos if
                                       self.parse_video_detail(video) is not None]
                }
            else:
                return self.parse_video_detail(data)
        except Exception as e:
            if raise_exception:
                raise e
            else:
                return None


video_client = VideoClient('http://baca.co.id/api/v1/News?categoryId=56&count=%s',
                           'http://baca.co.id/api/v1/News?categoryId=57&count=%s')


@cache(key=lambda user_id, video_id, with_relative_video, real_user_id: 'video_detail_%s_%s_%s' % (
        user_id, video_id, with_relative_video), ex=10 * 60)
def _get_video_detail(user_id, video_id, with_relative_video=False, real_user_id=None):
    if real_user_id is None:
        real_user_id = user_id
    return video_client.get_video_detail(real_user_id, video_id, with_relative_video=with_relative_video)


def set_fav_status(user_id, detail):
    video_id = detail.get('id', '')
    detail['favorite_status'] = check_user_like_status(video_id, user_id)


def get_video_detail(user_id, video_id, use_cache=True, with_relative_video=False):
    try:
        if with_relative_video:
            videos = _get_video_detail(user_id, video_id, with_relative_video, user_id)
            set_fav_status(user_id, videos['detail'])
            for detail in videos.get('relative_video', []):
                set_fav_status(user_id, detail)
        else:
            videos = _get_video_detail("CACHE_USER" if use_cache else user_id, video_id, with_relative_video, user_id)
            set_fav_status(user_id, videos)
        videos['likes_count'] = get_likes_count(video_id)
        return videos
    except:
        logger.exception('user %s get video %s error' % (user_id, video_id))
        return None
