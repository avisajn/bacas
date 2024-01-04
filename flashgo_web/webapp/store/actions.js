
import Config from '~/libs/config'
import axios from 'axios'
export const commonGetApi = async (store, url,params) => {
  let axiosOptions = {
    method: 'get',
    url: Config.apiDomain + url,
    data: JSON.stringify(params)
  }
  let response = await axios(axiosOptions)
  return response.data.data
}
export const commonPostApi = async (store, params) => {
  var userId = Math.random().toString(36).substr(2);
  let axiosOptions = {
    method: 'post',
    url: Config.apiDomain + params.url,
    data: JSON.stringify({
      page_id: params.pageId, 
      user_id: userId,
      count: params.count
    })
  }
  let response = await axios(axiosOptions)
  return response.data.data
}
export const CommonPost = async (store,params) => {
  let axiosOptions = {
    method: 'post',
    url: Config.apiDomain + params.url,
    data: JSON.stringify(params.data)
  }
  let response = await axios(axiosOptions)
  return response.data.data
}

