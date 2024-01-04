import $lan from '../../lan' 

const wordLang:any = {
  logout: {
    en: 'exit',
    zh:'退出登录',
    yn: 'keluar'
  },
  cancelRate: {
    en: 'cancel rate',
    zh: '订单取消率',
    yn: 'Pembatalan'
  },
  cancelRateNote: {
    en: 'Order cancellation rate of this vendor.',
    yn: 'Tingkat pembatalan pesanan oleh vendor ini.',
    zh: '订单取消百分比'
  },
  complaintRate: {
    en: 'complaint rate',
    zh: '投诉率',
    yn: 'Komplain'
  },
  complaintRateNote: {
    en: 'Order complaint rate of this vendor.',
    zh: '订单投诉百分比',
    yn: 'Tingkat komplain pesanan dari vendor ini.'
  },
  deliverySpeed: {
    en: 'delivery speed',
    zh: '物流速度',
    yn: 'Kecepatan'
  },
  deliverySpeedNote: {
    en: 'Average order process time, from being created to handed over to courier.',
    zh: '物流平均送达时长',
    yn: 'Rata-rata waktu proses pesanan, dari sejak dibuat hingga diserahkan ke kurir.'
  },
  shopRatingFaild: {
    en: 'Failed to obtain Vendor Rating, please try again !',
    zh: '获取店铺评分你失败，点击重试',
    yn: 'Gagal mendapatkan Peringkat Vendor, silakan coba lagi!'
  }
}

const obj:any = {}

for (const item in wordLang) {
  obj[item] = $lan(wordLang[item], null)
}

export const word = obj