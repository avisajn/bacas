from voluptuous import Schema, All, Range, In, Required, Length, Optional

from common.validutils import Int, Boolean

generate_promo_code_schema = Schema({
    Required('SkuId'): All(Int, Range(min=1001)),
    Required('UserId'): All(str, Length(min=1)),
    Required('Date'): All(str, Length(min=1)),
})

promo_code_schema = Schema({
    Required('promo_code'): All(str, Length(min=1)),
})

exchange_promo_code_view_schema = Schema({
    # 0 成功, 1失败
    Required('Status'): All(Int, In([0, 1])),
    # promo的码
    Required('Code'): All(str, Length(min=1)),
    # 码的过期时间
    Required('ExpiredDate'): All(str, Length(min=1)),
    # 失败的原因
    Optional('Reason', default=''): All(str),
})

# ('sku/<int:sku_id>', views.get_sku_info, name='get_sku_info'),
# 如果sku_id只有一个，就返回下面的列表
# 如果sku_id以逗号分隔，有多个，就返回一个list每个都是下面的结构
sku_view_schema = Schema({
    Required('SkuId'): All(Int, Range(min=1001)),
    Required('SkuType'): All(Int, In([3, 4, 5, 6, 7, 8])),
    Required('Price'): All(Int, Range(min=1)),
    Required('Value'): All(Int, Range(min=1)),
    Required('Title'): All(str, Length(min=1)),
    Required('SubTitle'): All(str, Length(min=1)),
    Required('ImageUrl'): All(str, Length(min=1)),
    # 是否生效
    Required('Online'): All(Boolean, Length(min=1)),
    # 是否自动通过（不需要审核）
    Optional('AutoApproval', default=False): All(Boolean),
})

get_sku_list_schema = Schema({
    Required('exchange_type'): All(Int, In([1, 2])),
    Optional('user_id', ''): All(str),
})
