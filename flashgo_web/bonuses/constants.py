class BonusAction(object):
    LOGIN = 5
    SIGN = 20001
    SHARE_LINK = 20002
    INVITE = 7
    DEAL_SHARE = 20003
    DEAL_VIEW = 20004
    NEWS_SHARE = 20005

    PREMIUM_CONTENT_20 = 29001
    PREMIUM_CONTENT_50 = 29002

    __LIKE_MAPPING = {
        29001: 20,
        29002: 50
    }

    @classmethod
    def get_count(cls, action_id):
        return cls.__LIKE_MAPPING.get(action_id, None)

    @classmethod
    def get_action_id(cls, like_count):
        if like_count >= cls.get_count(cls.PREMIUM_CONTENT_50):
            return cls.PREMIUM_CONTENT_50
        elif like_count >= cls.get_count(cls.PREMIUM_CONTENT_20):
            return cls.PREMIUM_CONTENT_20
        else:
            return None


class AwardOrderStatus(object):
    IN_AUDIT = 0
    PENDING = 1
    COMPLETED = 2
