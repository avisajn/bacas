import hashlib
from typing import List


class Bucket(object):

    def __init__(self, name, suffixes: list):
        self.name = name
        self.suffixes = set(suffixes)


default_bucket = Bucket('ctr', [13, 14, 16])
user_cf_bucket = Bucket('user_cf', [0])
ctr_bucket = Bucket('user_cf_ctr', [3])
all_user_bucket = Bucket('all', list(range(16)))

exps = [all_user_bucket]


def get_user_bucket(user_id):
    return _get_user_exp(user_id, buckets=exps, default=all_user_bucket, bucket_count=16)


def play_video_directly_exp(user_id):
    # return len(str(user_id)) > 0 and str(user_id).endswith(("0", "1", "2", "3", "4", "5"))
    return True


class Group(object):
    TEST = 1
    CONTROL = 2
    OTHER = 3


def get_gif_bucket(user_id):
    hash_ = _get_user_bucket(user_id, 4)
    if is_default_bucket(get_user_bucket(user_id)):
        if hash_ in {1, 3}:
            return Group.TEST
        else:
            return Group.CONTROL
    else:
        return Group.OTHER


def is_follow_bucket(bucket):
    return bucket.name == default_bucket.name


def is_all_user_bucket(bucket):
    return bucket.name == all_user_bucket.name


def is_default_bucket(bucket):
    return bucket.name == default_bucket.name


def is_follow_exp(user_id):
    return is_follow_bucket(get_user_bucket(user_id))


def _get_user_exp(user_id: str, buckets: List[Bucket], default: Bucket, bucket_count=None):
    if bucket_count is None or bucket_count == 0:
        return default
    else:
        bucket_number = _get_user_bucket(user_id, bucket_count)
        for bucket in buckets:
            if bucket_number in bucket.suffixes:
                return bucket
    return default


def _get_user_bucket(user_id: str, bucket_count):
    user_id = str(user_id)
    md5_data = hashlib.md5(user_id.encode('utf-8'))
    hash_number = int(md5_data.hexdigest()[:5], 16) % bucket_count
    return hash_number
