import Config from '~/libs/config'

var Common = {
  arrayContains: function(array, item) {
    for (let i in array) {
      if (array[i] === item) return true
    }
    return false
  },

  arrayDelete: function(array, item) {
    for (let i in array) {
      if (array[i] === item) array.splice(i, 1)
    }
  },

  buildQueryParams: function(obj) {
    var res = {}
    for (var i in obj) {
      if (obj[i]) {
        res[i] = obj[i]
      }
    }
    return res
  },
  getFromlocalStorage_: function(key) {
    var res = localStorage.getItem(key)
    if (res) {
      return JSON.parse(res)
    } else {
      return null
    }
  },

  saveToLocalStorage_: function(key, value) {
    if (key == null) {
      return
    }
    if (value == null) {
      localStorage.removeItem(key)
    } else {
      localStorage.setItem(key, JSON.stringify(value))
    }
  },
  downLoadGp(source) {
    try {
      BacaAndroid.openThirdPartWeb(Config.downloadUrl + '&c=' + source)
    } catch (error) {
      window.open(Config.downloadUrl+ '&c=' + source)
    }
  },
  goToOwnPage(url) {
    try {
      BacaAndroid.openOwnWeb('', Config.webUrl + url)
    } catch (error) {
      $nuxt.$router.push({ path: url})
    }
  },
  goBack() {
    try {
      BacaAndroid.goBack()
    } catch (error) {
      $nuxt.$router.back()
    }
  },
  goToOutsidePage(target) {
    try {
      BacaAndroid.openThirdPartWeb(target)
    } catch (error) {
      window.location.href = target
    }
  },
  cachePageData(key, api) {
    let data = []
    if (Common.getFromlocalStorage_(key) == null) {
      data = api
      Common.saveToLocalStorage_(key, data)
    } else {
      data = Common.getFromlocalStorage_(key)
    }
    return data
  }
}

export default Common
