import axios from 'axios'
import * as Config from '../libs/config'

export const commonGet = async (url) => {
  let requestHeader = {
    "appversion": "3008",
    'X-User-Id': 'web',
  };
  let axiosOptions = {
    method: 'GET',
    url: Config.apiDomain + url,
    headers: requestHeader
  }
  let response = await axios(axiosOptions)
  return response.data.data
}

export const commonGets = async (url) => {
  let requestHeader = {
    "appversion": "3008",
    'X-User-Id': 'web',
  };
  let axiosOptions = {
    method: 'GET',
    url: Config.apiDomain + url,
    headers: requestHeader
  }
  let response = await axios(axiosOptions)
  return response.data
}

export const commonPost = async (url, params) => {
  let axiosOptions = {
    method: 'POST',
    url: Config.apiDomain + url,
    data: JSON.stringify(params),
  }
  let response = await axios(axiosOptions)
  return response.data.data
}

export const commonFeedPost = async (url, params) => {
  let requestHeader = {
    "appversion": "3008",
    'X-User-Id': "web",
  };
  let axiosOptions = {
    method: 'POST',
    url: Config.apiDomain + url,
    data: JSON.stringify(params),
    headers: requestHeader
  }
  let response = await axios(axiosOptions)
  return response.data.data
}
