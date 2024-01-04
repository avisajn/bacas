REDIS_CLIENT_CONFIG = {
    'host': 'flashgo-cache.kub6uf.0001.apse1.cache.amazonaws.com',
    'db': 0,
    'port': 6379,
    'password': None
}

OFFLINE_REDIS_CLIENT_CONFIG = {
    'host': 'flashgo-cache.kub6uf.0001.apse1.cache.amazonaws.com',
    'db': 0,
    'port': 6379,
    'password': None
}
MYSQL_CLIENT_CONFIG = "mysql+pymysql://baca:e4b054013c95@paydayloan-aggregator.csidpbq21yh5.ap-southeast-1.rds.amazonaws.com:3306/flashgo?charset=utf8mb4"
OFFLINE_MYSQL_CLIENT_CONFIG = "mysql+pymysql://baca:e4b054013c95@paydayloan-aggregator.csidpbq21yh5.ap-southeast-1.rds.amazonaws.com:3306/flashgo?charset=utf8mb4"

MAIL_SENDER_CONFIG = {
    'username': 'robot@newsinpalm.com',
    'password': 'nqFfucJWWo3h8fTa',
    'host': 'smtp.exmail.qq.com'
}

S3_CLIENT_CONFIG = {
    'region_name': 'ap-southeast-1',
    'access_key_id': 'AKIAJJ67HQDFLENG63QQ',
    'secret_access_key': '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'
}

UPLOAD_S3_CLIENT_CONFIG = {
    'region_name': 'ap-southeast-1',
    'access_key_id': 'AKIATPVKNSSBAJU6H3M5',
    'secret_access_key': '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'
}

ES_CLIENT_CONFIG = {
    'region_name': 'ap-southeast-1',
    'access_key_id': 'AKIAJJ67HQDFLENG63QQ',
    'secret_access_key': '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'
}

S3_BUCKET = "flashgoadmin"

ON_LAMBDA = False

SQS_CONFIG = dict(region_name='ap-southeast-1',
                  aws_access_key_id='AKIAJJ67HQDFLENG63QQ',
                  aws_secret_access_key='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')
