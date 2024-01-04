import re


class NewsFeedbackReasonId(object):
    UNINTERESTED_NEWS = 3
    UNINTERESTED_AUTHOR = 2
    SALACITY_OR_VIOLENCE = 1
    NOTHING = -1
    VULGAR_PORNOGRAPHIC_VIOLENT = 4
    ADVERTISEMENT = 5
    EXTREMIST_OPINIONS = 6
    INSULTING_OTHERS = 7
    OTHER_REASONS = 8


RAW_NEWS_NEGATIVE_WORDS = ['bedebah', 'ngentod', 'dick', 'jalang', 'china', 'tempik', 'yahudi', 'fuck', 'pki', 'peler',
                           'pelacuran', 'pribumi', 'jembut', 'perek', 'qontol', 'bajingan', 'viagra', 'pelacur',
                           'toked', 'bangsat', 'pussy', 'kafir', 'prostitusi', 'bangsad', 'jancuk', 'entot', 'itil',
                           'kontol', 'pler', 'memek', 'pukimak', 'fpi', 'rizieq', 'slut', 'lonte', 'bitch',
                           'masturbasi', 'ngewe', 'silit', 'masturbate', 'puki', 'komunis', 'ngentot', 'toket', 'yesus',
                           'cina', 'entod', 'bgst', 'tetek', 'whore', 'dildo', 'coli', 'bom', 'memeq', 'ewe',
                           'kalempong', 'laknat']

REGEX_NEWS_NEGATIVE_WORDS = [r'\b{}\b'.format(re.escape(word)) for word in RAW_NEWS_NEGATIVE_WORDS]


class CreateNewsErrorData(object):
    # 发帖成功
    CREATE_NEWS_SUCCESS = {'client_errno': 0,
                           'client_errmsg': ''}

    # 用户权限不足
    USER_BANNED = {'client_errno': -101,
                   'client_errmsg': ''}

    # 只包含空格
    ONLY_CONTAINS_SPACE = {'client_errno': -102,
                           'client_errmsg': ''}

    # 字数不符合规范
    LENGTH_UNQUALIFIED = {'client_errno': -103,
                          'client_errmsg': ''}

    # 上传的视频duration超过限制
    DURATION_TOO_LONG = {'client_errno': -104,
                         'client_errmsg': 'Panjang video tidak boleh lebin dari 3 menit'}


class GetNewsErrorData(object):
    # 获取新闻详情成功
    SUCCESS = {'client_errno': 0,
               'client_errmsg': ''}

    # 新闻详情失效
    INVALID = {'client_errno': -201,
               'client_errmsg': ''}


class NewsStatus(object):
    SUCCESS = 1
    IN_AUDIT = 0
    DELETED_BY_ADMIN = -1
    AUDIT_FAILED = -2
    DELETED_BY_USER = -3

    VALID_STATUS = frozenset({SUCCESS})
    SELF_VALID_STATUS = frozenset(VALID_STATUS | {IN_AUDIT, DELETED_BY_ADMIN, AUDIT_FAILED})


FEED_NEWS_VALID_MESSAGE_MAPPING = {
    1: '',
    0: 'Sedang diverifikasi',
    -1: 'Dihapus',
    -2: 'Melanggar ketentuan',
    -3: ''
}

DETAIL_NEWS_VALID_MESSAGE_MAPPING = {
    1: '',
    0: 'Konten kamu sedang diverifikasi dan belum bisa ditampilkan sampai disetujui',
    -1: 'Konten kamu dihapus. Alasannya adalah：Melanggar.',
    -2: 'Konten kamu tidak disetujui karena melanggar ketentuan.',
    -3: ''
}
