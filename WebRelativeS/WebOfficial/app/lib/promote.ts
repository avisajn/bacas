const $envTest = process.env.MODE?.trim() === 'test'

export default {
  promote: {
    domainTemp: `https://nipidpraise.blob.core.windows.net/webviewbanner/web-img/promote/promote#index#.jpg`,
    picLength: 11,
    showButton: true,
    logKey: $envTest ? 'G-X6K7X9Z2L3' : 'G-KL9JTFHCB7',
    title: 'promote',
    buttonBg: '#531B96',
    buttonText: 'Yuk segera jual produk Mokkaya dan raih untungnya!',
    versionKey: '20210924'
  },
  promote2: {
    picList: '*'.repeat(15).split('').map((_val: string, index: number) => `/public/promote2/${index + 1}.jpg`),
    showButton: true,
    logKey: $envTest ? 'G-X6K7X9Z2L3' : 'G-KL9JTFHCB7',
    title: 'promote',
    buttonBg: '#b82420',
    buttonText: 'Yuk tingkatkan penjualan dan raih bonusnya!',
    versionKey: '20220225'
  },
  promote3: {
    picList: '*'.repeat(2).split('').map((_val: string, index: number) => `/public/promote3/${index + 1}.jpg`),
    showButton: true,
    logKey: $envTest ? 'G-X6K7X9Z2L3' : 'G-KL9JTFHCB7',
    title: 'promote',
    buttonBg: '#FEAE01',
    buttonText: "Ya, saya telah membaca dan memahaminya",
    versionKey: '20211111'
  },
  promote4: {
    picList: '*'.repeat(9).split('').map((_val: string, index: number) => `/public/promote4/${index + 1}.jpg`),
    showButton: true,
    logKey: $envTest ? 'G-X6K7X9Z2L3' : 'G-KL9JTFHCB7',
    title: 'promote',
    buttonBg: '#531B96',
    buttonText: "Yuk segera jual produk Mokkaya dan raih untungnya!",
    versionKey: '20210924'
  },
  promote5: {
    picList: '*'.repeat(3).split('').map((_val: string, index: number) => `/public/promote5/${index + 1}.jpg`),
    showButton: true,
    logKey: $envTest ? 'G-X6K7X9Z2L3' : 'G-KL9JTFHCB7',
    title: 'promote',
    buttonBg: '#F4090E',
    buttonText: 'Ya, saya telah membaca dan memahaminya',
    versionKey: '20210309'
  },
  promote6: {
    picList: '*'.repeat(1).split('').map((_val: string, index: number) => `/public/promote6/${index + 1}.jpg`),
    showButton: true,
    logKey: $envTest ? 'G-X6K7X9Z2L3' : 'G-KL9JTFHCB7',
    title: 'promote',
    buttonBg: '#ccc',
    buttonText: "Undang Teman Kamu Sekarang",
    versionKey: '20211220'
  },
  promote7: {
    picList: '*'.repeat(1).split('').map((_val: string, index: number) => `/public/promote7/${index + 1}.jpg`),
    showButton: true,
    logKey: $envTest ? 'G-X6K7X9Z2L3' : 'G-KL9JTFHCB7',
    title: 'promote',
    buttonBg: '#5C09A2',
    buttonText: "Yuk belanja sekarang!",
    versionKey: '20220124'
  },
  promote8: {
    picList: '*'.repeat(10).split('').map((_val: string, index: number) => `/public/promote8/${index + 1}.jpg`),
    showButton: true,
    logKey: $envTest ? 'G-X6K7X9Z2L3' : 'G-KL9JTFHCB7',
    title: 'promote',
    buttonBg: '#8B93D1',
    buttonText: "Yuk, pesan sekarang juga! ",
    versionKey: '20220222'
  },
  // promote9: {
  //   picList: '*'.repeat(1).split('').map((_val: string, index: number) => `/public/promote9/${index + 1}.jpg`),
  //   showButton: true,
  //   logKey: $envTest ? 'G-X6K7X9Z2L3' : 'G-KL9JTFHCB7',
  //   title: 'promote',
  //   buttonBg: '#d7d3d0',
  //   buttonText: "Yuk belanja sekarang! dan Menangkan Hadiahnya!",
  //   versionKey: '20220120'
  // },
  promote10: {
    picList: '*'.repeat(7).split('').map((_val: string, index: number) => `/public/promote10/${index + 1}.jpg`),
    showButton: true,
    logKey: $envTest ? 'G-X6K7X9Z2L3' : 'G-KL9JTFHCB7',
    title: 'promote',
    buttonBg: '#702255',
    buttonText: "Kembali ke halaman Katalog",
    versionKey: '20220207'
  },
  promote1111: {
    picList: [`https://nipidpraise.blob.core.windows.net/webviewbanner/web-img/promote.jpg`],
    showButton: false,
    logKey: $envTest ? 'G-X6K7X9Z2L3' : 'G-KL9JTFHCB7',
    title: 'promote',
    buttonBg: '',
    buttonText: '',
    versionKey: '20210902'
  },
  promotecod: {
    picList: ['https://nipidpraise.blob.core.windows.net/webviewbanner/web-img/COD120401.jpg', 'https://nipidpraise.blob.core.windows.net/webviewbanner/web-img/COD120402.jpg'],
    showButton: true,
    logKey: $envTest ? 'G-X6K7X9Z2L3' : 'G-KL9JTFHCB7',
    title: 'promote cod',
    buttonBg: '#ffcd33',
    buttonText: 'Pesan sekarang dan gunakan COD!',
    versionKey: '20210902'
  },
  promote_cashback: {
    picList: '*'.repeat(1).split('').map((_val: string, index: number) => `/public/promote_cashback/${index + 1}.jpeg`),
    showButton: false,
    logKey: $envTest ? 'G-X6K7X9Z2L3' : 'G-KL9JTFHCB7',
    title: 'PESTA CASHBACK MOKKAYA',
    buttonBg: '#ffcd33',
    buttonText: 'Pesan sekarang dan gunakan COD!',
    versionKey: '20220308'
  }
}