class AddCommentErrorData(object):
    # 评论成功
    COMMENT_SUCCESS = {'client_errno': 0,
                       'client_errmsg': ''}

    # 评论包含非法字符
    CONTENT_INVALID = {'client_errno': -1,
                       'client_errmsg': ''}
    # 网络错误
    NETWORK_ERROR = {'client_errno': -2,
                     'client_errmsg': ''}
    # 用户被封禁
    USER_BANNED = {'client_errno': -3,
                   'client_errmsg': ''}
    # 评论过长
    CONTENT_TOO_LONG = {'client_errno': -4,
                        'client_errmsg': ''}
    # 评论为空串
    CONTENT_EMPTY = {'client_errno': -5,
                     'client_errmsg': ''}
    # 用户未登录
    USER_NOT_LOGIN = {'client_errno': -6,
                      'client_errmsg': ''}

    # 被评论的新闻状态失效
    NEWS_BE_COMMENTED_INVALID = {'client_errno': -7,
                                 'client_errmsg': 'Maaf, konten ini tidak tersedia'}


class CommentNotificationType(object):
    SENT_BY_ME = 1
    REPLY_TO_ME = 2
    ALL = 3


COMMENT_NEGATIVE_WORDS = {'θ2o', 'obât', 'õθl', 'titid', 'puki', 'v1agra', 'pki', 'muhammad', 'ereksi', 'ngac3ng',
                          'jing', 'q8lձձ9lձqҙq', 'cialis', 'tempik', 'rangsang', 'dungu', 'kuàt', 'bunuh', 'yesus',
                          'tai', 'v14gra', '0bãt', 'sperma', 'tetek', 'øbãt', 'peler', 's3ks', 'c0k1l', 'ejaklsi',
                          'l0tr3', 'goblok', 'tod', 'viagra', 'impoten', 'ngaceng', 'h4mm3r', 'komunis', 'kicu',
                          'perek', '6otђ', 'penls', 'terroris', 'penirium', '60tн', 'jablay', '3597', '53x', 'fpi',
                          'casino', '60тн', 'obαt', 'syahwat', 'penggal', 'pler', 'kondom', 'yahudi', 'v1agr4', 'b3g0',
                          'forex', 'n9ac3n9', 'kasino', 'õθl23507lθ2õ', '08lձձ9lձqҙq', 'qontol', 'dajjal', 'birahi',
                          'kafir', 'bajingan', 'entod', '6oth', 'lonte', 'memek', 'v14gr4', '60τђ', 'judi', 'cokil',
                          'pelacur', 'purwaceng', 'obãt', 'ju4l', 's3x', 'b390', '60тh', 'ewe', 'njing', '6oтн',
                          'pepek', 'sex', 'bego', '235g', 'gairah', 'sipit', 'condom', 'viagr4', 'hamm3r', 'idiot',
                          'ngentot', 'tolol', 'p3r3k', 'c0l1', 'ngewek', 'cina', 'vegas', 'θ2õ', 'pnis', 'vagina',
                          'bāt', 'congor', 'b00l', '53k5', 'entot', 'babi', 'kalempong', '0bàt', 'øbàt', 'penis',
                          '0bat', 'боth', 'juâl', 'lotre', 'udud', 'óbat', 'óbàt', 'ɸb', 'p3r3q', 'perangsang',
                          'jalang', 'kuåt', 'vi4gra', 'arab', '23507l', 'blackjack', 'rizieq', 'l0tre', 'eek', 'bet',
                          'kontol', 'kuãt', 'tempek', 'ngewe', 'ng4c3ng', 'tot', 'óbãt', 'domino', 'erexsi', 'seks',
                          'bangcat', 'øbat', 'titit', 'asu', 'rokok', 'bedebah', 'pantat', 'sahwat', 'assu', '54n93',
                          'ejakulasi', '6õth', 'pentil', '6oтh', 'sange', 'lacur', 'vi4gr4', 'erogan', 'dildo', 'tiko',
                          'kuδt', 'kampret', 'peju', 'teroris', 'goblog', 'itil', 'bât', 'p3ju', 'bool', 'laknat',
                          's4ng3', 'udut', 'bangsat', 'j4bl4y', 'coli', 'jancuk', 'silit', 'obàt', 'juāl', 'jembut',
                          'cuki', 'turuk'}
