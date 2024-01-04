import jwt


class JWTokenGenerator(object):
    def __init__(self, secret):
        self.secret = secret

    def encode(self, data):
        data = jwt.encode(data, key=self.secret)
        if isinstance(data, bytes):
            return data.decode('utf-8')
        else:
            return data

    def decode(self, data):
        return jwt.decode(data, self.secret)


JWT_SECRET = '784ebd80-4d78-4d42-9abb-7edc2c1a4466'

jwt_token_generator = JWTokenGenerator(JWT_SECRET)
