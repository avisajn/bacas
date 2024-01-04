const data =   {
  title: "test survey",
  showCompletedPage: false,
  elements: [
   {
    type: "radiogroup",
    name: "Age range",
    title: "Usia",
    isRequired: true,
    choices: [
     {
      value: "0",
      text: "10 - 18"
     },
     {
      value: "1",
      text: "19 - 24"
     },
     {
      value: "2",
      text: "25 - 30"
     },
     {
      value: "3",
      text: "31 - 40"
     },
     {
      value: "4",
      text: "41+"
     }
    ]
   },
   {
    type: "radiogroup",
    name: "Does he have online sales experience?",
    title: "Apakah ada pengalaman berjualan online?",
    isRequired: true,
    choices: [
     {
      value: "1",
      text: "Ya"
     },
     {
      value: "0",
      text: "Tidak"
     }
    ]
   },
   {
    type: "text",
    name: "How long (months) is your online selling experience?",
    visibleIf: "{Does he have online sales experience?} = 1",
    title: "Berapa lama (bulan) pengalaman Anda berjualan online?",
    isRequired: true
   },
   {
    type: "text",
    name: "How much is you highest earning in a month?",
    visibleIf: "{Does he have online sales experience?} = 1",
    title: "Berapa omset tertinggi Anda dalam sebulan?",
    isRequired: true
   },
   {
    type: "text",
    name: "If you start selling online, how much monthly earning you expect to have?",
    visibleIf: "{Does he have online sales experience?} = 0",
    title: "Bila mulai berjualan online, berapa omset perbulan yang Anda harapkan?",
    isRequired: true
   },
   {
    type: "radiogroup",
    name: "Does he have offline sales experience?",
    title: "Apakah ada pengalaman berjualan offline? (mis: buka toko)",
    isRequired: true,
    choices: [
     {
      value: "1",
      text: "Ya"
     },
     {
      value: "0",
      text: "Tidak"
     }
    ]
   },
   {
    type: "text",
    name: "question2",
    visibleIf: "{Does he have offline sales experience?} = 1",
    title: "Berapa lama (bulan) pengalaman Anda berjualan online?",
    isRequired: true
   },
   {
    type: "text",
    name: "question3",
    visibleIf: "{Does he have offline sales experience?} = 1",
    title: "Berapa omset tertinggi Anda dalam sebulan?",
    isRequired: true
   },
   {
    type: "text",
    name: "question4",
    visibleIf: "{Does he have offline sales experience?} = 0",
    title: "Bila mulai berjualan online, berapa omset perbulan yang Anda harapkan?",
    isRequired: true
   },
   {
    type: "radiogroup",
    name: "Occupation",
    title: "Pekerjaan utama sekarang",
    isRequired: true,
    choices: [
     {
      value: "0",
      text: "Pegawai kantoran"
     },
     {
      value: "1",
      text: "Pekerja harian"
     },
     {
      value: "2",
      text: "Penjual online"
     },
     {
      value: "3",
      text: "Ibu rumah tangga"
     },
     {
      value: "4",
      text: "Wirausaha"
     },
     {
      value: "5",
      text: "Lainnya"
     }
    ]
   },
   {
    type: "checkbox",
    name: "His preferred category (= what products he wants to sell)",
    title: "Jenis produk yang ingin Anda jual",
    isRequired: true,
    choicesByUrl: {
     url: "https://static.test.api.mokkaya.com/api/v2/categories",
     path: "data",
     valueName: "id",
     titleName: "name"
    }
   },
   {
    type: "dropdown",
    name: "Geographic location",
    title: "Propinsi ",
    isRequired: true,
    choicesByUrl: {
     url: "https://static.test.api.mokkaya.com/api/v1/location/provinces",
     path: "data",
     valueName: "id",
     titleName: "name"
    }
   },
   {
    type: "dropdown",
    name: "city",
    visibleIf: "{Geographic location} notempty",
    title: "Kota ",
    requiredIf: "{Geographic location} notempty",
    choicesByUrl: {
     url: "https://static.test.api.mokkaya.com/api/v1/location/cities?province_id={Geographic location}",
     path: "data",
     valueName: "id",
     titleName: "name"
    }
   },
   {
    type: "dropdown",
    name: "question1",
    visibleIf: "{city} notempty",
    title: "Kabupaten ",
    requiredIf: "{city} notempty",
    choicesByUrl: {
     url: "https://static.test.api.mokkaya.com/api/v1/location/districts?city_id={city}",
     path: "data",
     valueName: "id",
     titleName: "name"
    }
   }
  ]
 }

 module.exports = data