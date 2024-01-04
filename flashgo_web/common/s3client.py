import os
import pathlib
import uuid

import boto3
from botocore.config import Config

from common.config import S3_CLIENT_CONFIG, UPLOAD_S3_CLIENT_CONFIG
from common.constants import UPLOAD_FILE_PATH

S3_IMAGE_BUCKET = "flashgoadmin"
S3_VIDEO_BUCKET = "flashgoadmin"


class S3Exception(Exception):
    pass


class _TokenGenerator(object):
    def __init__(self, region_name, access_key_id, secret_access_key):
        self.sts_client = boto3.client('sts',
                                       config=Config(signature_version='s3v4'),
                                       region_name=region_name,
                                       aws_access_key_id=access_key_id,
                                       aws_secret_access_key=secret_access_key)
        self.region_name = region_name

    def generate(self, duration_in_seconds: int):
        response = self.sts_client.get_session_token(
            DurationSeconds=duration_in_seconds
        )
        """
        response example
        {'Credentials': {'AccessKeyId': 'ASIATPVKNSSBAKUMFEVS',
                             'SecretAccessKey': 'jDa+D6TJZVoT8Y69hduDDv/iJlKJqGVTzwJQ89w0',
                             'SessionToken': 'FwoGZXIvYXdzEJH//////////wEaDJNUjUaA5KxVyIBQkiKBAXr4ft2Y2J7g0D1L7SDu/dZv7IvKlXt/aDV9E4Kz6wZG08AR2epY/7lsIechdVuQg+rbSWkA7KZZ2CRYFyob4+tQynkwyW5aBj99n6IwYgOLqufRB5SN1wqtDUGeNIm7EEpfS32t6g8E/IxPnzc4Dbq2uZ5jj1E4T/e8yrJr08yeAii5r5zxBTIoLICgsuiTi5M/z9d3e+EtNBKJk00fk4mzqPHC39xp0TJ+mEp6LHrmTw==',
                             'Expiration': datetime.datetime(2020, 1, 21, 16, 24, 41, tzinfo=tzutc())},
             'ResponseMetadata': {'RequestId': '254d5d45-3c62-11ea-91fb-3f6ba555b35d', 'HTTPStatusCode': 200,
                                  'HTTPHeaders': {'x-amzn-requestid': '254d5d45-3c62-11ea-91fb-3f6ba555b35d',
                                                  'content-type': 'text/xml', 'content-length': '812',
                                                  'date': 'Tue, 21 Jan 2020 15:24:41 GMT'}, 'RetryAttempts': 0}}
        """
        if response is not None and "Credentials" in response:
            return {
                "access_key_id": response["Credentials"]["AccessKeyId"],
                "secret_access_key": response["Credentials"]["SecretAccessKey"],
                "session_token": response["Credentials"]["SessionToken"],
                "expiration": response["Credentials"]["Expiration"],
                "region_name": self.region_name
            }
        else:
            raise S3Exception("cannot generate token")


class S3Client(object):
    def __init__(self, region_name, access_key_id, secret_access_key, session_token=None, token_generator=None):
        self.s3_client = boto3.resource(
            service_name='s3',
            config=Config(signature_version='s3v4'),
            region_name=region_name,
            aws_access_key_id=access_key_id,
            aws_secret_access_key=secret_access_key,
            aws_session_token=session_token,
        )
        self.token_generator = token_generator  # type: _TokenGenerator
        self.image_bucket = S3_IMAGE_BUCKET
        self.image_path = 'news-images/full/'
        self.image_suffix = '.jpg'
        self.video_bucket = S3_VIDEO_BUCKET
        self.video_path = 'news-video/'
        self.video_suffix = ''

    def upload_photo(self, local_file_path, bucket_name, file_name):
        self.s3_client.meta.client.upload_file(local_file_path, bucket_name, file_name)

    def download_photo(self, local_file_path, bucket_name, file_name):
        with open(local_file_path, 'wb') as tmp_file:
            self.s3_client.meta.client.download_fileobj(bucket_name, file_name, tmp_file)
        return local_file_path

    def download_file(self, local_file_path, bucket_name, file_name):
        with open(local_file_path, 'wb') as tmp_file:
            self.s3_client.meta.client.download_fileobj(bucket_name, file_name, tmp_file)
        return local_file_path

    def upload_file(self, local_file_path, file_name, bucket_name=S3_IMAGE_BUCKET, content_type=None,
                    extra_args=None):
        if extra_args is None:
            extra_args = {}
        if content_type is None:
            self.s3_client.meta.client.upload_file(local_file_path, bucket_name, file_name,
                                                   ExtraArgs={'ACL': 'public-read', **extra_args})
        else:
            self.s3_client.meta.client.upload_file(local_file_path, bucket_name, file_name,
                                                   ExtraArgs={'ACL': 'public-read', 'ContentType': content_type,
                                                              **extra_args})

    def upload_private_file(self, local_file_path, file_name, bucket_name):
        self.s3_client.meta.client.upload_file(local_file_path, bucket_name, file_name)

    def upload_by_src_data(self, src_data, file_name, bucket_name=S3_IMAGE_BUCKET, content_type=None,
                           local_file_name=None, extra_args=None):
        if local_file_name is None:
            local_file_name = str(uuid.uuid4())

        if not os.path.exists(UPLOAD_FILE_PATH):
            pathlib.Path(UPLOAD_FILE_PATH).mkdir(parents=True, exist_ok=True)

        local_file_path = UPLOAD_FILE_PATH + local_file_name
        with open(local_file_path, 'wb+') as destination:
            destination.write(src_data)
        self.upload_file(local_file_path, file_name, bucket_name=bucket_name, content_type=content_type,
                         extra_args=extra_args)
        if local_file_path is not None and os.path.exists(local_file_path):
            os.remove(local_file_path)

    def generate_public_resource_url(self, object_name, bucket_name=S3_IMAGE_BUCKET, expiration=3600,
                                     content_type='application/json'):
        # url即返回的url
        # 生成码的上传示例: curl -H "x-amz-acl:public-read" -H "content-type: application/json"  \
        #          --request PUT --upload-file mytest.json url
        response = self.s3_client.meta.client.generate_presigned_url('put_object',
                                                                     Params={'Bucket': bucket_name,
                                                                             'Key': object_name,
                                                                             'ACL': 'public-read',
                                                                             'ContentType': content_type},
                                                                     ExpiresIn=expiration)
        if response is not None and len(response) > 0 and str(response).startswith("https"):
            return response
        else:
            raise S3Exception("cannot generate public url")

    def copy_s3_file(self, from_object_name, to_object_name, bucket=S3_IMAGE_BUCKET, acl="public-read") -> bool:
        """
        copy object from object inside s3
        raise exception if from_object do not exists
        """
        response = self.s3_client.meta.client.copy_object(ACL=acl, Bucket=bucket,
                                                          CopySource=f"{bucket}/{from_object_name}",
                                                          Key=to_object_name)
        return response is not None and "VersionId" in response and len(response["VersionId"]) > 0

    def get_session_token(self, duration_in_seconds: int = 30 * 60):
        if self.token_generator is None:
            raise NotImplementedError("get_access_token not implement")
        else:
            return self.token_generator.generate(duration_in_seconds)


_token_generator = _TokenGenerator(**UPLOAD_S3_CLIENT_CONFIG)
s3_client = S3Client(**S3_CLIENT_CONFIG, token_generator=_token_generator)
