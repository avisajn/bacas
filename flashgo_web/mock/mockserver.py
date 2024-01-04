import json

from flask import Flask, Response
from flask_cors import CORS

from mock import mockdata

app = Flask(__name__)
CORS(app, supports_credentials=True)


@app.route('/channel/list', methods=['GET'])
def channel_list():
    """
    频道列表接口, 如9.9元特价, 限时闪购, 不同用户的频道列表可能不一样
    :return: 该用户的频道列表
    """
    channels = mockdata.channel_list
    return Response(response=json.dumps({'errno': 0, 'data': channels}, separators=(',', ':')), status=200,
                    mimetype='application/json')


@app.route('/feed/rec', methods=['GET'])
def feed_rec():
    """
    主feed流接口, 一个用户可能多刷，需要根据用户id缓存已经刷过的feed，每一刷出10条左右
    :return: 10条左右结果
    """
    data = [{
        'id': int(key),
        'deep_link': value.get('applink'),
        'image_url': value.get('image_url_mobile'),
        'discount_percentage': int(value.get('discount_percentage')),
        'price': int(value.get('price').replace('Rp ', '').replace('.', '')),
        'title': value.get('title'),
        'wap_url': value.get('url_mobile'),
    } for key, value in mockdata.deal_list.items()]
    return Response(response=json.dumps({'errno': 0, 'data': data}, separators=(',', ':')), status=200,
                    mimetype='application/json')


@app.route('/feed/guess', methods=['GET'])
def feed_guess():
    """
    猜你喜欢接口, 如用户在搜索页下方, 我的收藏下方看到的推荐列表, 一般固定返回10条以内
    :return: 10条以内结果
    """
    data = [{
        'id': int(key),
        'deep_link': value.get('applink'),
        'image_url': value.get('image_url_mobile'),
        'discount_percentage': int(value.get('discount_percentage')),
        'price': int(value.get('price').replace('Rp ', '').replace('.', '')),
        'title': value.get('title'),
        'wap_url': value.get('url_mobile'),
    } for key, value in mockdata.deal_list.items()]
    return Response(response=json.dumps({'errno': 0, 'data': data}, separators=(',', ':')), status=200,
                    mimetype='application/json')


@app.route('/feed/relative/<int:deal_id>', methods=['GET'])
def feed_relative(deal_id: int):
    """
    相关推荐接口, 如用户在商品详情页下方看到的推荐列表, 一般固定返回10条以内
    :param deal_id: 相关推荐的基础优惠id
    :return: 10条以内结果
    """
    data = [{
        'id': int(key),
        'deep_link': value.get('applink'),
        'image_url': value.get('image_url_mobile'),
        'discount_percentage': int(value.get('discount_percentage')),
        'price': int(value.get('price').replace('Rp ', '').replace('.', '')),
        'title': value.get('title'),
        'wap_url': value.get('url_mobile'),
    } for key, value in mockdata.deal_list.items()]
    return Response(response=json.dumps({'errno': 0, 'data': data}, separators=(',', ':')), status=200,
                    mimetype='application/json')


@app.route('/feed/channel/<int:channel_id>', methods=['GET'])
def feed_channel(channel_id: int):
    """
    频道feed流接口, 如用户点九块九特价后看到的列表页，一个用户可能多刷，需要根据用户id缓存已经刷过的feed，每一刷出10条左右
    :param channel_id: 频道id
    :return: 10条左右结果
    """
    data = [{
        'id': int(key),
        'deep_link': value.get('applink'),
        'image_url': value.get('image_url_mobile'),
        'discount_percentage': int(value.get('discount_percentage')),
        'price': int(value.get('price').replace('Rp ', '').replace('.', '')),
        'title': value.get('title'),
        'wap_url': value.get('url_mobile'),
    } for key, value in mockdata.deal_list.items()]
    return Response(response=json.dumps({'errno': 0, 'data': data}, separators=(',', ':')), status=200,
                    mimetype='application/json')


@app.route('/feed/category/<int:category_id>', methods=['GET'])
def feed_category(category_id: int):
    """
    分类feed流接口, 如用户点男装看到的列表页，一个用户可能多刷，需要根据用户id缓存已经刷过的feed，每一刷出10条左右
    :param category_id: 分类id
    :return: 10条左右结果
    """
    data = [{
        'id': int(key),
        'deep_link': value.get('applink'),
        'image_url': value.get('image_url_mobile'),
        'discount_percentage': int(value.get('discount_percentage')),
        'price': int(value.get('price').replace('Rp ', '').replace('.', '')),
        'title': value.get('title'),
        'wap_url': value.get('url_mobile'),
    } for key, value in mockdata.deal_list.items()]
    return Response(response=json.dumps({'errno': 0, 'data': data}, separators=(',', ':')), status=200,
                    mimetype='application/json')


@app.route('/search', methods=['POST'])
def search():
    """
    搜索接口, query通过post bod提交, 一个用户可能多刷，需要根据用户id缓存已经刷过的feed，每一刷出10条左右
    :return: 10条左右结果
    """
    data = [{
        'id': int(key),
        'deep_link': value.get('applink'),
        'image_url': value.get('image_url_mobile'),
        'discount_percentage': int(value.get('discount_percentage')),
        'price': int(value.get('price').replace('Rp ', '').replace('.', '')),
        'title': value.get('title'),
        'wap_url': value.get('url_mobile'),
    } for key, value in mockdata.deal_list.items()]
    return Response(response=json.dumps({'errno': 0, 'data': data}, separators=(',', ':')), status=200,
                    mimetype='application/json')


@app.route('/query/hot', methods=['GET'])
def hot_query():
    """
    热门query接口, 获取热门的query
    :return:  热门query列表
    """
    return ['便宜', '七分裤', '辣条']


@app.route('/favorite/add', methods=['POST'])
def add_favorite():
    """
    添加收藏借口，userid，dealid通过post body上传
    :return:  结果
    """
    return Response(response=json.dumps({'errno': 0, 'errmsg': 'ok'}, separators=(',', ':')), status=200,
                    mimetype='application/json')


@app.route('/favorite/list', methods=['POST'])
def favorite_list():
    """
    我的收藏，userid通过post body上传
    :return:  我的收藏列表
    """
    data = [{
        'id': int(key),
        'deep_link': value.get('applink'),
        'image_url': value.get('image_url_mobile'),
        'discount_percentage': int(value.get('discount_percentage')),
        'price': int(value.get('price').replace('Rp ', '').replace('.', '')),
        'title': value.get('title'),
        'wap_url': value.get('url_mobile'),
    } for key, value in mockdata.deal_list.items()]
    return Response(response=json.dumps({'errno': 0, 'data': data}, separators=(',', ':')), status=200,
                    mimetype='application/json')


@app.route('/user/login', methods=['POST'])
def login():
    """
    登陆, 参考其他项目
    :return:
    """
    return Response(response=json.dumps({'errno': 0, 'errmsg': 'ok'}, separators=(',', ':')), status=200,
                    mimetype='application/json')


@app.route('/user/register', methods=['POST'])
def register():
    """
    注册, 参考其他项目
    :return:
    """
    return Response(response=json.dumps({'errno': 0, 'errmsg': 'ok'}, separators=(',', ':')), status=200,
                    mimetype='application/json')


@app.route('/user/otp', methods=['POST'])
def otp():
    """
    发验证码
    :return: 验证码
    """
    return Response(response=json.dumps({'errno': 0, 'data': {'code': '666666'}}, separators=(',', ':')), status=200,
                    mimetype='application/json')
