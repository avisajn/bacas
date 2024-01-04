from django.test import TestCase

from common import trackinglink


class RedisModelTestCase(TestCase):
    def setUp(self):
        pass

    def test_tracking_link(self):
        print(trackinglink.get_tracking_link(3,
                                             deep_link='bukalapak://www.bukalapak.com/p/sepeda/equipment-tools/gembok/1003e9-jual-kunci-gembok-sepeda-taiwan-high-quality'))
        print(trackinglink.get_tracking_link(5, web_link='https://shopee.co.id/0-i.61443109.1000042057'))
        print(trackinglink.get_tracking_link(2, web_link='https://www.lazada.co.id/products/lars-rak-piring-lipat-i205044830-s250649452.html'))
