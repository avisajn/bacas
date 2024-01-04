from django.test import TestCase

from common.redismodels import *


class RedisModelTestCase(TestCase):
    def setUp(self):
        self.test_deal_item = DealItem(
            id=1, sales=100, title='test_title', thumbnail='thumbnail', price=10000, original_price=20000, discount=50,
            ecommerce_id=1, category_id_one=1, category_id_two=2, category_id_three=3,
            keyword_list=['test_keyword_1', 'test_keyword_2'], channel_id=1, img_list=['img1', 'img2'],
            start_time='2018-12-01 10:00:00', end_time='2018-12-01 20:00:00', sale_type=1, location='Jakarta',
            detail='testdetail'
        )

    def test_redismodels_funcs(self):
        print(format_ri_deal_item(from_obj=self.test_deal_item))
        print(format_list_deal_item(from_obj=self.test_deal_item))
        print(format_detail_deal_item(from_obj=self.test_deal_item))
        print(parse_detail_deal_item(
            from_byte_array='{"id":1,"img_list":["img1","img2"],"location":"Jakarta","detail":"testdetail"}'.encode(
                'utf-8')))
        print(parse_ri_deal_item(from_byte_array='{"id":1,"sales":100}'.encode('utf-8')))
        print(parse_list_deal_item(
            from_byte_array='{"id":1,"sales":100,"title":"test_title","thumbnail":"thumbnail","price":10000,'
                            '"original_price":20000,"discount":50,"ecommerce_id":1,"start_time":"2018-12-01 10:00:00",'
                            '"end_time":"2018-12-01 20:00:00","sale_type":1}'.encode('utf-8')))
