import time

from sqlalchemy import desc

from common import loggers
from common.constants import RedisKeyPrefix
from common.gifutils import GIF_HOME, GifGenerator
from common.mysqlclient import mysql_client
from common.redisclient import cache, redis_client
from common.s3client import s3_client, S3_IMAGE_BUCKET
from news.models import NewsVideo

logger = loggers.get_logger(__name__, 'gif_generator.log')


@cache('latest_video', ex=86400 * 7, prefix=RedisKeyPrefix.OFFLINE)
def get_latest_video_id():
    video_ids = [video.video_id for video in
                 mysql_client.get_pageable_instances_by_conditions(NewsVideo, page_id=0, count=100,
                                                                   order_conditions=desc(NewsVideo.video_id))]
    return min(video_ids)


def cache_latest_video_id(video_id):
    redis_client.cache_object('latest_video', video_id, prefix=RedisKeyPrefix.OFFLINE, ex=86400 * 7)


def get_videos():
    latest_video_id = get_latest_video_id()
    videos = mysql_client.retrieve_objects_by_conditions(NewsVideo, NewsVideo.video_id > latest_video_id)
    cache_latest_video_id(max([video.video_id for video in videos]))
    return videos


def process(video: NewsVideo):
    if video.video_guid is not None and len(str(video.video_guid)) > 0:
        video_path = GIF_HOME + '/' + str(video.news_id) + '.mp4'
        s3_client.download_file(video_path, S3_IMAGE_BUCKET, 'news-video/' + video.video_guid)
        with GifGenerator(video_path, delete_video=True, delete_gif=True) as gif_path:
            s3_client.upload_file(gif_path, file_name='news-images/gif/' + str(video.news_id) + '.jpg',
                                  content_type='image/gif')
            logger.info('upload %s to %s' % (gif_path, 'news-images/gif/' + str(video.news_id) + '.jpg'))
    else:
        logger.info('video do not have guid %s' % video.video_id)


def main():
    start_time = time.time()
    videos = get_videos()
    logger.info('videos size %s' % len(videos))
    for video in videos:
        if time.time() - start_time > 5 * 60:
            logger.info('timeout break')
            break
        else:
            try:
                process(video)
            except:
                logger.exception('video process error')


if __name__ == '__main__':
    try:
        main()
    except:
        logger.exception('process error')
