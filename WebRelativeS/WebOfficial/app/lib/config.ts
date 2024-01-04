import { expressCompanyItem, termPageConfig, baseConfigType } from '../interface/home'


interface termObject {
  [x: string]: termPageConfig
}


const resellerAppGTag:baseConfigType = {
  dev: 'G-X6K7X9Z2L3',
  prod: 'G-KL9JTFHCB7'
}
const domainUrl:baseConfigType = {
  dev: 'https://test.mokkaya.com',
  prod: 'https://mokkaya.com'
}

const vendorUrl:baseConfigType = {
  dev: 'https://test.api.vendor.mokkaya.com',
  prod: 'https://api.vendor.mokkaya.com'
}

const vendorWebUrl:baseConfigType = {
  dev: 'https://test.api.web.vendor.mokkaya.com',
  prod: 'https://api.web.vendor.mokkaya.com'
}

const resellerUrl:baseConfigType = {
  dev: 'https://test.api.mokkaya.com',
  prod: 'https://api.mokkaya.com'
}



const mokkayaAdminUrl:baseConfigType = {
  dev: 'https://test.api.manager.mokkaya.com',
  prod: 'https://api.manager.mokkaya.com',
}


const azureStorage:baseConfigType = {
  dev: 'DefaultEndpointsProtocol=https;AccountName=mokkayatest;AccountKey=st/2w9UmoqXmEVoplDRFkMfguU5KPCszuTy/URnf9XWuT+2Bki5ggLMB63SDf0DbQ4eS7kWp/Q5P+69IYNx5EA==;BlobEndpoint=https://mokkayatest.blob.core.windows.net/;QueueEndpoint=https://mokkayatest.queue.core.windows.net/;TableEndpoint=https://mokkayatest.table.core.windows.net/;FileEndpoint=https://mokkayatest.file.core.windows.net/;',
  prod: 'DefaultEndpointsProtocol=https;AccountName=mokkaya;AccountKey=2C2C4t3ZGNR9pKMii5uFLU6onSw2EFbE1eiyNQPPXcnKKPpQTLWz1kq9td5qFSrb+wirGYQHNcIc8dcR1uwumw==;BlobEndpoint=https://mokkaya.blob.core.windows.net/;QueueEndpoint=https://mokkaya.queue.core.windows.net/;TableEndpoint=https://mokkaya.table.core.windows.net/;FileEndpoint=https://mokkaya.file.core.windows.net/;'
}
const azureContainerName:string = 'front-end-store'

const expressCompanyMap:Array<expressCompanyItem> = [
  {
    id: 2, 
    name: 'JNE',
    tag: 'jne',
    template: 'logistic/jne.ejs',
  },
  {
    id: 4,
    name: 'SIC',
    tag: 'sic',
    template: 'logistic/sic.ejs'
  },
  {
    id: 27,
    name: 'SAP',
    tag: 'sap',
    template: 'logistic/sap.ejs'
  }
]

const termConfig:termObject = {
  question: {
    title: 'PANDUAN MENGGUNAKAN APLIKASI MOKKAYA',
    temp: 'terms/mokkaya/question_faq.ejs',
    googleTag: 'G-7V4FLXYH67'
  },
  term: {
    title: 'Syarat dan Ketentuan',
    temp: 'terms/mokkaya/term.ejs',
    googleTag: 'G-7V4FLXYH67'
  },
  policy: {
    title: 'KEBIJAKAN PRIVASI',
    temp: 'terms/mokkaya/policy.ejs',
    googleTag: 'G-7V4FLXYH67'
  },
  wdpolicy: {
    title: 'Kebijakan Penarikan',
    temp: 'terms/mokkaya/wdpolicy.ejs',
    googleTag: 'G-7V4FLXYH67'
  },
  referral: {
    title: 'Kebijakan referral',
    temp: 'terms/mokkaya/referral.ejs',
    googleTag: 'G-7V4FLXYH67'
  },
  referral_active: {
    title: 'Kebijakan referral',
    temp: 'terms/mokkaya/referral_active.ejs',
    googleTag: 'G-7V4FLXYH67'
  },
  realPictureTerm: {
    title: 'KETENTUAN KONTRIBUSI REAL PIC',
    temp: 'terms/mokkaya/real_pic_term.ejs',
    googleTag: 'G-7V4FLXYH67'
  },
  vendorQA: {
    title: 'BANTUAN PENGGUNA',
    temp: 'terms/vendor/question.ejs',
    googleTag: 'G-7V4FLXYH67'
  },
  vendorPrivacy: {
    title: 'KEBIJAKAN PRIVASI',
    temp: 'terms/vendor/privacy.ejs',
    googleTag: 'G-7V4FLXYH67'
  },
  vendorTerms: {
    title: 'PERJANJIAN PEMASOK/SUPPLIER/MERCHANT',
    temp: 'terms/vendor/terms.ejs',
    googleTag: 'G-7V4FLXYH67'
  },
  vendorWdpolicy: {
    title: 'Kebijakan Penarikan',
    temp: 'terms/vendor/wdpolicy.ejs',
    googleTag: 'G-7V4FLXYH67'
  }
}




export default {
  resellerAppGTag, expressCompanyMap, vendorWebUrl, vendorUrl, resellerUrl, domainUrl, mokkayaAdminUrl,
  azureStorage, azureContainerName, termConfig
}