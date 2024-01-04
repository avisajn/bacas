from voluptuous import Required, All, Schema, Range, Optional, ALLOW_EXTRA, Or

from common.validutils import Int, Boolean

upload_user_choices_schema = Schema({
    Required('sex_id'): All(int, Range(min=1, max=2)),
    Required('interest_ids'): All(list),
    Optional('author_ids', default=[]): Or(list, None)
})

header_schema = Schema({
    Optional('X_APP_VERSION', default=0): All(Int),
    Optional('X_USER_ID', default=''): All(str),
    Optional('X_TM_EXTRA_INFO', default=False): All(Boolean),
    Optional('X_GOOGLE_AD_ID'): All(str),
    Optional('X_APP_PACKAGE_ID'): All(str),
    Optional('AUTHORIZATION'): All(str),
    Optional('X_INVITE_CODE'): All(str),
    Optional('X_USER_TOKEN'): All(str),
}, extra=ALLOW_EXTRA)
