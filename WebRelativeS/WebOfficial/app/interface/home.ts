export interface remoteConfig {
  title: string,
  domainTemp?: string,
  picLength: number,
  showButton?: boolean,
  showBlock?: boolean,
  logKey: string,
  picList?: Array<string>,
  buttonBg: string,
  buttonText: string
  versionKey: string
}


export interface baseConfigType {
  dev: string,
  prod: string
}


export interface remotePageConfig {
  title: string,
  imgs: Array<string>,
  showButton?: boolean
  showBlock?: boolean,
  logKey: string,
  buttonBg?: string,
  buttonText: string,
  versionKey: string
}

export interface logosticData {
  city_code: string,
  cod_price: number,
  combined_key: string,
  express_id: number,
  express_label_printed: number,
  express_order_num: string,
  is_combined_order: boolean,
  order_no: string,
  product_title: string,
  receiver_name: string,
  recipient_address: string,
  recipient_city: string,
  recipient_code: string,
  recipient_landmark?: string,
  recipient_province: string,
  recipient_sub_district: string,
  reseller_phone_number: string,
  sender_name: string,
  sku_details: Array<any>
  telepon: string
  total_amount: number
  user_payment_type: number
}

export interface termPageConfig {
  temp: string,
  title: string,
  googleTag?: string
}

export interface sharePageInfo {
  timestamp?: number,
  name: string,
  uid?: string,
  dim?: string,
  code: string,
  gaTag: string
}


export interface videoItem {
  id: number,
  serise: number,
  title: string,
  origin_url: string,
  cover: string,
  video_id: string,
  duration: number,
  serise_order: number,
  rs?: string
}
export interface expressCompanyItem {
  id: number,
  name: string,
  tag: string,
  template: string
}

export interface productInfo {
  code: string,
  title: string,
  cover_image: string,
  current_price?: number,
  stock?: number,
  status?: 0,
  shop?: string
}

export interface nativeLoginConfig {
  code: string,
  url: string,
}

export interface nativeLoginPage extends nativeLoginConfig {
  gtag: string
}

