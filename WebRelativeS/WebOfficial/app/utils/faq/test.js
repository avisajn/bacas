var data = {
  "success": true,
  "code": 0,
  "msg": "",
  "data": {
    "id": 245797,
    "combined_key": "6606004211206131607",
    "total_price": 84645,
    "discount_price": 22205,
    "product_price": 84645,
    "product_discount": 9405,
    "logistics_price": 0,
    "logistics_discount": 12800,
    "cod_price": 546466,
    "cod_admin_fee": 0,
    "cod_admin_fee_is_valid": false,
    "cod_admin_fee_message": "",
    "cod_complaint_message": "Pesanan ini sukses terkirim. Margin akan dicairkan otomatis setelah 5x24 jam apabila Anda tidak mengajukan komplain apapun.",
    "delivered_time": 1638772284,
    "created_time": 1638771367,
    "source": 1,
    "status": 4,
    "sub_status": 402,
    "settlement_status": 1,
    "is_combined_order": false,
    "user_payment_type": 3,
    "receiver_location": {
      "name": "ceshi",
      "phone_number": "62818813175625",
      "province_id": 1890,
      "province_name": "DKI JAKARTA",
      "city_id": 1958,
      "city_name": "KOTA JAKARTA PUSAT",
      "district_id": 1975,
      "district_name": "KEMAYORAN",
      "post_code_id": 1979,
      "post_code": "10640",
      "detail_address": "uxu",
      "landmark": "uxu"
    },
    "sender_location": {
      "name": "yuan",
      "phone_number": "628618813175625",
      "province_id": 1890,
      "province_name": "DKI JAKARTA",
      "city_id": 2008,
      "city_name": "KOTA JAKARTA SELATAN",
      "district_id": 2015,
      "district_name": "JAGAKARSA",
      "post_code_id": 2019,
      "post_code": "12630",
      "detail_address": "????",
      "landmark": null
    },
    "order_sku": [
      {
        "order_no": "6606004211206131607",
        "product_id": 135343,
        "product_code": 920963,
        "product_title": "SETELAN WANITA AGNESCA MOSCREPE VTJC-1462",
        "sku_id": 943579,
        "sku_properties": {
          "Warna": "Mustard"
        },
        "image_url": "https://mokkayatest.blob.core.windows.net/mark-spu-images/3dace9cb-a3dc-4b5e-b7fd-fe10cd18599a",
        "amount": 1,
        "unit_price": 94050,
        "product_status": 1,
        "status": 0,
        "status_description": "",
        "reseller_refund": 0,
        "product_stock": 119,
        "refund_amount": 0
      }
    ],
    "order_payment": {
      "expired_time": null,
      "sub_payment_url": null,
      "paid_at": 1638771367
    },
    "order_express_info": {
      "express_name": "SiCepat Express",
      "express_no": "001292536718",
      "started": true,
      "records": [
        {
          "time": 1638613620,
          "description": "Paket di kembalikan di Lebak [Lebak Malingping Selatan COD] - (CU) Cnee Unknown\n"
        },
        {
          "time": 1638579900,
          "description": "Paket dibawa [SIGESIT - Supriadi]\n"
        },
        {
          "time": 1638578340,
          "description": "Paket telah di terima di Lebak [Lebak Malingping Selatan COD]\n"
        },
        {
          "time": 1638532440,
          "description": "Paket di kembalikan di Lebak [Lebak Malingping Selatan COD] - (HOLD) Hold / Pending\n"
        },
        {
          "time": 1638492360,
          "description": "Paket dibawa [SIGESIT - Zihan Firmansyah]\n"
        },
        {
          "time": 1638446820,
          "description": "Paket telah di terima di Lebak [Lebak Malingping Selatan COD]\n"
        },
        {
          "time": 1638410460,
          "description": "Paket keluar dari Serang [Cilegon Sortation]\n"
        },
        {
          "time": 1638410340,
          "description": "Paket telah di terima di Serang [Cilegon Sortation]\n"
        },
        {
          "time": 1638388380,
          "description": "Paket keluar dari DKI Jakarta [Sortation Bodetabek]\n"
        },
        {
          "time": 1638388320,
          "description": "Paket telah di terima di DKI Jakarta [Sortation Bodetabek]\n"
        },
        {
          "time": 1638368400,
          "description": "Paket keluar dari Bogor [Bogor Ciampea]\n"
        },
        {
          "time": 1638363000,
          "description": "Paket telah di input (manifested) di Bogor [Bogor Ciampea]\n"
        },
        {
          "time": 1638362940,
          "description": "Paket telah di drop di gerai [Bogor Ciampea]\n"
        },
        {
          "time": 1638346920,
          "description": "Terima permintaan pick up dari [Partner MK]"
        }
      ],
      "has_valid_records": true,
      "pickup_time": 1638362940,
      "created_time": 1638771549
    },
    "shop": {
      "shop_id": "BoIG94svcIRi20x0reUdmBdP1k83",
      "shop_name": "yuan_shop",
      "city_name": "KOTA YOGYAKARTA",
      "district_name": "WIROBRAJAN",
      "province_name": "DI YOGYAKARTA",
      "post_code": "55253",
      "status": true
    },
    "status_description": "Terkirim",
    "voucher_ids": [],
    "vendor_id": "BoIG94svcIRi20x0reUdmBdP1k83",
    "group_key": null,
    "total_product_price": 94050,
    "total_product_discount": 9405,
    "total_logistics_price": 12800,
    "total_logistics_discount": 12800,
    "total_discount_price": 22205,
    "pay_together_combined_keys": null,
    "estimated_settlment_time": 1638776184,
    "estimated_cancellation_time": null
  },
  "trace": null
}
const order = require('./order_status.es5')

order(data)