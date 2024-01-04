# 接口说明 


### 二、个人页面
> table: users
---
> userid, sex, coins, createdtime, updatedtime
---
> signin
---
> userid, createdtime
---
> share
---
> userid, product(app, deal), createdtime
---
> exchange
---
> userid, coin, rate, createdtime



#### 浏览记录
* 参数：用户id
* 返回：

```json
{ "errno": 0, 
  "errmsg": "ok"
  "data": [{"soldout": 0,
          "image": "http://www.baidu.com/img",
          "deeplink": "http://www.baidu.com",
          "discount": 0.75,
          "title": "小猫牌吹风机",
          "endtime": "2018-11-22 13:00:00",
          "original_price": 80000000,
          "current_price": 65000000,
          "stars": 5,
          "stock": 10,
          "source": "jd",
          "description": "超级好用！！！！",
          "total": 100,
          "remaining": 0.1,
          "remaind": 1},
          {}]
}
```
#### 删除浏览记录
* 参数：用户id, [productid, ...]
* 返回：

```json
{ "errno": 0, 
  "errmsg": "ok"}
 ```

### 三、收藏夹
#### 返回收藏夹list
* 参数：用户id
* 返回：

```json
{ "errno": 0, 
  "errmsg": "ok"
  "data": [{"soldout": 0,
          "image": "http://www.baidu.com/img",
          "deeplink": "http://www.baidu.com",
          "discount": 0.75,
          "title": "小猫牌吹风机",
          "endtime": "2018-11-22 13:00:00",
          "original_price": 80000000,
          "current_price": 65000000,
          "stars": 5,
          "stock": 10,
          "source": "jd",
          "description": "超级好用！！！！",
          "total": 100,
          "remaining": 0.1,
          "remaind": 1},
          {}]
}
```
#### 删除收藏夹商品

* 参数：用户id， [productid, ..]
* 返回：

```json
{ "errno": 0, 
  "errmsg": "ok"}
```
### 四、闪购
#### 1. 首页闪购列表请求
* 参数：用户id
* 返回：
> 返回8个商品list
```json

{ "errno": 0, 
  "errmsg": "ok",
  "account": 8,
  "data": [{"soldout": 0,
          "image": "http://www.baidu.com/img",
          "deeplink": "http://www.baidu.com",
          "discount": 0.75,
          "title": "小猫牌吹风机",
          "endtime": "2018-11-22 13:00:00",
          "original_price": 80000000,
          "current_price": 65000000,
          "stars": 5,
          "stock": 10,
          "source": "jd",
          "description": "超级好用！！！！",
          "total": 100,
          "remaining": 0.1,
          "remaind": 1},
          {}]
}
```
#### 2. 闪购页
* 参数：用户id
* 返回：

>排序：过期时间，提醒，折扣力度，价格
---
>table: source
----
>sourceid  sourcename description domain 
---
>table: product
---
>productid, source_id(平台） title(商品名称）  description(商品介绍） 
discount(折扣）   
 original_price(原价格）original_price(原价格）current_price(现价格）
total（总数量） sales(销售额） stock（存货）comments（评论数）  star(星级） image(缩略图地址）   
   created_time
----
> table: flash
---
> flashid, productid,starttime（起始时间）  endtime(结束时间） 
```json
{ "errno": 0, 
  "errmsg": "ok",
  "data": {"ongoing": [
              {"soldout": 0,
              "productid": 10,
              "sourceid": 8,
              "flashid": 82,
                  "image": "http://www.baidu.com/img",
                  "deeplink": "http://www.baidu.com",
                  "discount": 0.75,
                  "title": "小猫牌吹风机",
                  "endtime": "2018-11-22 13:00:00",
                  "original_price": 80000000,
                  "current_price": 65000000,
                  "stars": 5,
                  "stock": 10,
                  "source": "jd",
                  "description": "超级好用！！！！",
                  "total": 100,
                  "remaining": 0.1,
                  "remaind": 1},
              {}
             ],
            "coming": [
              {"image": "http://www.baidu.com/img",
              "deeplink": "http://www.baidu.com",
              "discount": 0.75,
              "title": "小猫牌吹风机",
              "endtime": "2018-11-22 13:00:00",
              "starttime": "2018-11-22 10:00:00",
              "original_price": 80000000,
              "current_price": 65000000,
              "stars": 5,
              "stock": 10,
              "source": "jd",
              "description": "超级好用！！！！",
              "total": 100,
              "remaining": 0.1},
              {}
             ]
         }
}
```
#### 未来闪购提醒
* 参数：用户id
* 返回：
> table: remiand
> userid, productid, createdtime, 
```json
{ "errno": 0, 
  "errmsg": "ok"
}
```
#### 取消闪购提醒
* 参数：用户id
* 返回：
```json
{ "errno": 0, 
  "errmsg": "ok"
}
```
### 五、搜索
#### 最热关键词(POST)
> table: popular_keywords
---
> userid, keyword, createdtime
---
* api: http://service_domain/get_popular_keywords
```json
{"userid": 1000}
```
return:
```json
{ "errno": 0, 
  "errmsg": "ok",
  "keywords": []
}
```
#### 搜索请求
* 参数：用户id keyword
* 返回：
> 返回8个商品list
```json

{ "errno": 0, 
  "errmsg": "ok",
  "account": 8,
  "data": [{"soldout": 0,
          "image": "http://www.baidu.com/img",
          "deeplink": "http://www.baidu.com",
          "discount": 0.75,
          "title": "小猫牌吹风机",
          "endtime": "2018-11-22 13:00:00",
          "original_price": 80000000,
          "current_price": 65000000,
          "stars": 5,
          "stock": 10,
          "source": "jd",
          "description": "超级好用！！！！",
          "total": 100,
          "remaining": 0.1,
          "remaind": 1},
          {}]
}
```
### 六、详情页
#### 商品详情
  * 参数：用户id
* 返回：
> 
```json

{ "errno": 0, 
  "errmsg": "ok",
  "account" : 20,
  "pagenum": 1,
  "data": {"image": "",
           "title": "",
           "description": "",
           "artical": "",
           "source_name": "",
           "source_logo": "",
          "image": "http://www.baidu.com/img",
          "deeplink": "http://www.baidu.com",
          "discount": 0.75,
          "title": "小猫牌吹风机",
          "endtime": "2018-11-22 13:00:00",
          "original_price": 80000000,
          "current_price": 65000000,
          "stars": 5,
          "stock": 10,
          "source": "jd",
          "description": "超级好用！！！！",
          "total": 100,
           }
}
```
#### 收藏
* 参数：用户id
* 返回：
> table: favorite
> id, userid, productid, createdtime, 
```json
{ "errno": 0, 
  "errmsg": "ok"
}
```
#### 评论（第一期先不做）
#### 上报错误信息
* 参数：用户id, productid, wrong_info(1(sold out),2(wrong price),3(not exist))
* 返回：
> table: wrong_info
> userid, productid, wrong_info, createdtime, 
```json
{ "errno": 0, 
  "errmsg": "ok"
}
```
### 七、频道页
#### 返回频道商品list
 * 参数：用户id
* 返回：
> 返回20个商品list, 分页
```json

{ "errno": 0, 
  "errmsg": "ok",
  "account" : 20,
  "pagenum": 1,
  "data":[{"soldout": 0,
          "image": "http://www.baidu.com/img",
          "deeplink": "http://www.baidu.com",
          "discount": 0.75,
          "title": "小猫牌吹风机",
          "endtime": "2018-11-22 13:00:00",
          "original_price": 80000000,
          "current_price": 65000000,
          "stars": 5,
          "stock": 10,
          "source": "jd",
          "description": "超级好用！！！！",
          "total": 100,
          "remaining": 0.1,
          "remaind": 1},
          {}]
}
```

### 八、推荐
#### 返回推荐list
 * 参数：用户id, pageid
* 返回：
> 返回20个商品list, 分页
```json

{ "errno": 0, 
  "errmsg": "ok",
  "account" : 20,
  "pagenum": 1,
  "data":[{"soldout": 0,
          "image": "http://www.baidu.com/img",
          "deeplink": "http://www.baidu.com",
          "discount": 0.75,
          "title": "小猫牌吹风机",
          "endtime": "2018-11-22 13:00:00",
          "original_price": 80000000,
          "current_price": 65000000,
          "stars": 5,
          "stock": 10,
          "source": "jd",
          "description": "超级好用！！！！",
          "total": 100,
          "remaining": 0.1,
          "remaind": 1},
          {}]
}
```