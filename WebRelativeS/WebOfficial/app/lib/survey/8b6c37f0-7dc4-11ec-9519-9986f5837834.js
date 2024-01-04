module.exports = {
  "title": "Survey Kilat (Hanya 2 Menit)",
  "logoPosition": "right",
  "pages": [
    {
      "name": "page1",
      "elements": [
        {
          "type": "radiogroup",
          "name": "Age range",
          "title": "Berapa usia Anda?",
          "isRequired": true,
          "choices": [
            {
              "value": "0",
              "text": "10 - 18"
            },
            {
              "value": "1",
              "text": "19 - 24"
            },
            {
              "value": "2",
              "text": "25 - 30"
            },
            {
              "value": "3",
              "text": "31 - 40"
            },
            {
              "value": "4",
              "text": "41+"
            }
          ]
        }
      ]
    },
    {
      "name": "page2",
      "elements": [
        {
          "type": "radiogroup",
          "name": "online sales experience",
          "title": "Apakah ada pengalaman berjualan online?",
          "isRequired": true,
          "choices": [
            {
              "value": "1",
              "text": "Ya"
            },
            {
              "value": "0",
              "text": "Tidak"
            }
          ]
        }
      ]
    },
    {
      "name": "page3",
      "elements": [
        {
          "type": "radiogroup",
          "name": "online yes how long",
          "visibleIf": "{online sales experience} = 1",
          "title": "Berapa lama (bulan) pengalaman Anda berjualan online?",
          "isRequired": true,
          "choices": [
            {
              "value": "0",
              "text": "Kurang dari 3 bulan"
            },
            {
              "value": "1",
              "text": "3 - 6 bulan"
            },
            {
              "value": "2",
              "text": "7 - 12 bulan"
            },
            {
              "value": "3",
              "text": "Lebih dari 12 bulan"
            }
          ]
        }
      ]
    },
    {
      "name": "page4",
      "elements": [
        {
          "type": "radiogroup",
          "name": "online yes how much",
          "visibleIf": "{online sales experience} = 1",
          "title": "Berapa omset tertinggi Anda dalam sebulan?",
          "isRequired": true,
          "choices": [
            {
              "value": "0",
              "text": "Kurang dari 500.000"
            },
            {
              "value": "1",
              "text": "500.000 - 1.000.000"
            },
            {
              "value": "2",
              "text": "1.000.000 - 2.000.000"
            },
            {
              "value": "3",
              "text": "2.000.001 - 4.000.000"
            },
            {
              "value": "4",
              "text": "Lebih dari 4.000.000"
            }
          ]
        }
      ]
    },
    {
      "name": "page5",
      "elements": [
        {
          "type": "radiogroup",
          "name": "online no how much",
          "visibleIf": "{online sales experience} = 0",
          "title": "Bila mulai berjualan online, berapa omset perbulan yang Anda harapkan?",
          "isRequired": true,
          "choices": [
            {
              "value": "0",
              "text": "Kurang dari 500.000"
            },
            {
              "value": "1",
              "text": "500.000 - 1.000.000"
            },
            {
              "value": "2",
              "text": "1.000.000 - 2.000.000"
            },
            {
              "value": "3",
              "text": "2.000.001 - 4.000.000"
            },
            {
              "value": "4",
              "text": "Lebih dari 4.000.000"
            }
          ]
        }
      ]
    },
    {
      "name": "page6",
      "elements": [
        {
          "type": "radiogroup",
          "name": "offline sales experience",
          "title": "Apakah ada pengalaman berjualan offline? (mis: buka toko)",
          "isRequired": true,
          "choices": [
            {
              "value": "1",
              "text": "Ya"
            },
            {
              "value": "0",
              "text": "Tidak"
            }
          ]
        }
      ]
    },
    {
      "name": "page7",
      "elements": [
        {
          "type": "radiogroup",
          "name": "offline yes how long",
          "visibleIf": "{offline sales experience} = 1",
          "title": "Berapa lama (bulan) pengalaman Anda berjualan offline?",
          "isRequired": true,
          "choices": [
            {
              "value": "0",
              "text": "Kurang dari 3 bulan"
            },
            {
              "value": "1",
              "text": "3 - 6 bulan"
            },
            {
              "value": "2",
              "text": "7 - 12 bulan"
            },
            {
              "value": "3",
              "text": "Lebih dari 12 bulan"
            }
          ]
        }
      ]
    },
    {
      "name": "page8",
      "elements": [
        {
          "type": "radiogroup",
          "name": "offline yes how much",
          "visibleIf": "{offline sales experience} = 1",
          "title": "Berapa omset tertinggi Anda dalam sebulan?",
          "isRequired": true,
          "choices": [
            {
              "value": "0",
              "text": "Kurang dari 500.000"
            },
            {
              "value": "1",
              "text": "500.000 - 1.000.000"
            },
            {
              "value": "2",
              "text": "1.000.000 - 2.000.000"
            },
            {
              "value": "3",
              "text": "2.000.001 - 4.000.000"
            },
            {
              "value": "4",
              "text": "Lebih dari 4.000.000"
            }
          ]
        }
      ]
    },
    {
      "name": "page9",
      "elements": [
        {
          "type": "radiogroup",
          "name": "offline no how much",
          "visibleIf": "{offline sales experience} = 0",
          "title": "Bila mulai berjualan offline, berapa omset perbulan yang Anda harapkan?",
          "isRequired": true,
          "choices": [
            {
              "value": "0",
              "text": "Kurang dari 500.000"
            },
            {
              "value": "1",
              "text": "500.000 - 1.000.000"
            },
            {
              "value": "2",
              "text": "1.000.000 - 2.000.000"
            },
            {
              "value": "3",
              "text": "2.000.001 - 4.000.000"
            },
            {
              "value": "4",
              "text": "Lebih dari 4.000.000"
            }
          ]
        }
      ]
    },
    {
      "name": "page10",
      "elements": [
        {
          "type": "radiogroup",
          "name": "Occupation",
          "title": "Pekerjaan utama sekarang",
          "isRequired": true,
          "choices": [
            {
              "value": "0",
              "text": "Pegawai kantoran"
            },
            {
              "value": "1",
              "text": "Pekerja harian"
            },
            {
              "value": "2",
              "text": "Penjual online"
            },
            {
              "value": "3",
              "text": "Ibu rumah tangga"
            },
            {
              "value": "4",
              "text": "Wirausaha"
            },
            {
              "value": "5",
              "text": "Lainnya"
            }
          ]
        }
      ]
    },
    {
      "name": "page11",
      "elements": [
        {
          "type": "checkbox",
          "name": "category",
          "title": "Jenis produk yang ingin Anda jual (bisa lebih dari 1 pilihan)",
          "isRequired": true,
          "choicesByUrl": {
            "url": "https://static.api.mokkaya.com/api/v2/categories?semua=0",
            "path": "data",
            "valueName": "id",
            "titleName": "name"
          }
        }
      ]
    },
    {
      "name": "page12",
      "elements": [
        {
          "type": "dropdown",
          "name": "Geographic location",
          "title": "Di mana tempat tinggal Anda?",
          "isRequired": true,
          "choicesByUrl": {
            "url": "https://static.test.api.mokkaya.com/api/v1/location/provinces",
            "path": "data",
            "valueName": "id",
            "titleName": "name"
          }
        },
        {
          "type": "dropdown",
          "name": "city",
          "visibleIf": "{Geographic location} notempty",
          "title": "Kota ",
          "isRequired": true,
          "requiredIf": "{Geographic location} notempty",
          "choicesByUrl": {
            "url": "https://static.test.api.mokkaya.com/api/v1/location/cities?province_id={Geographic location}",
            "path": "data",
            "valueName": "id",
            "titleName": "name"
          }
        },
        {
          "type": "dropdown",
          "name": "district",
          "visibleIf": "{city} notempty",
          "title": "Kabupaten ",
          "isRequired": true,
          "requiredIf": "{city} notempty",
          "choicesByUrl": {
            "url": "https://static.test.api.mokkaya.com/api/v1/location/districts?city_id={city}",
            "path": "data",
            "valueName": "id",
            "titleName": "name"
          }
        }
      ]
    },
    // {
    //   "name": "page13",
    //   "elements": [

    //   ]
    // },
    // {
    //   "name": "page14",
    //   "elements": [

    //   ]
    // }
  ],
  "showCompletedPage": false
}