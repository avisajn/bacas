import $ajax from '../libs/ajax'

const userModel = {
  async getUserInfo ():Promise<any> {
    return $ajax.get('/api/v1/private/info')
  },
  async getVendorRates (id: string = ''):Promise<any> {
    if (!id) {
      return new Error('error vendor id')
    } else {
      return $ajax.get(`/api/v1/get-rate/${id}`)
    }
  }
}

export default userModel