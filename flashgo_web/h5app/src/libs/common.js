import NProgress from 'nprogress'
import Config from './config'
import Router from '../router'

var Common = {
  delayLoad: function (seconds) {
    var loadTimeKey = 'DelayLoadTimestamp'
    var now = Date.now()

    if (seconds == null) {
      var loadTime = localStorage.getItem(loadTimeKey)

      if (loadTime != null) {
        loadTime = parseInt(loadTime, 10)

        if (loadTime > now) {
          seconds = (loadTime - now) / 1000
        }
      }
    }

    if (seconds == null) {
      return false
    }

    localStorage.setItem(loadTimeKey, Math.floor(now + 1000 * seconds).toString())

    return true
  },

  call: function (func) {
    if (func == null) {
      return
    }

    var args = []

    for (var i = 1; i < arguments.length; ++i) {
      args.push(arguments[i])
    }

    func.apply(this, args)
  },

  arrayContains: function (array, item) {
    for (let i in array) {
      if (array[i] === item) return true
    }
    return false
  },

  arrayDelete: function (array, item) {
    for (let i in array) {
      if (array[i] === item) array.splice(i, 1)
    }
  },

  logout: function () {
    localStorage.removeItem('auditorId')
    localStorage.removeItem('roleList')
    localStorage.removeItem('accessToken')
    localStorage.removeItem('auditorEmail')
    Router.push({path: '/login'})
  },

  apiRequest: function (method, url, params, onSuccess, onFail, skipDefaultErrorHandling, isFileUpload) {
    NProgress.start()
    var self = this

    if (self.delayLoad()) {
      return
    }

    skipDefaultErrorHandling = skipDefaultErrorHandling || false

    var getErrorCode = function (data) {
      if (data == null) {
        return 0
      } else {
        var errorCode = data['error_code']

        if (errorCode == null) {
          return null
        } else if (typeof errorCode === 'number') {
          return errorCode
        } else {
          return parseInt(errorCode, 10)
        }
      }
    }
    var handleError = function (errorCode, data) {
      if (!skipDefaultErrorHandling) {
        self.call(self.defaultRequestFailedHandler_, errorCode, data, onFail)
      } else {
        self.call(onFail, errorCode, data)
      }
    }

    var beforeSend = null

    url = Config.apiDomain + url
    self.ajaxRequest(method, url, params, beforeSend, function (data) {
      NProgress.done()
      var errorCode = getErrorCode(data)

      if (errorCode == null) {
        self.call(onSuccess, data)
      } else {
        handleError(errorCode, data)
      }
    }, function (data) {
      NProgress.done()
      var errorCode = 0

      if (data != null) {
        data = data['responseJSON']
        errorCode = getErrorCode(data)
      }

      handleError(errorCode, data)
    }, true, isFileUpload)
  },

  fileDownload: function (method, url, postData, filename, fileDateType, successFunc) {
    $.ajax({
      url: url,
      headers: {uk: localStorage.getItem('accessToken')},
      method: method,
      contentType: 'application/json charset=UTF-8',
      data: JSON.stringify(postData),
      success: function (res) {
        //  只能在chrome上跑
        var blob = new Blob([res])
        var link = document.createElement('a')
        link.href = window.URL.createObjectURL(blob)
        link.download = filename
        link.click()
        successFunc()
      },
      error: function (res) {
        alert('download failed')
        successFunc()
      }
    })
  },

  ajaxRequest: function (method, url, params, beforeSend, onSuccess, onFail, skipDefaultErrorHandling, isFileUpload, currentPath) {
    // fullScreenLoading = fullScreenLoading || true
    // let loading = null
    // if (fullScreenLoading) {
    //   loading = Loading.service({fullscreen: true})
    // }
    var self = this
    var handleError = function (data) {
      if (skipDefaultErrorHandling == null || !skipDefaultErrorHandling) {
        self.call(self.defaultRequestFailedHandler_, data, currentPath)
      }

      self.call(onFail, data)
    }

    var ajaxOption = {
      type: method,
      url: url,
      headers: {uk: localStorage.getItem('accessToken')},
      contentType: params == null || method === 'GET' ? 'application/x-www-form-urlencoded charset=UTF-8' : 'application/json charset=UTF-8',
      data: params == null || method === 'GET' ? params : JSON.stringify(params),
      dataType: 'json',
      xhrFields: {
        withCredentials: true
      },
      beforeSend: beforeSend,
      success: function (data) {
        // if (fullScreenLoading) {
        //   loading.close()
        // }
        if (data == null) {
          handleError()
        } else {
          self.call(onSuccess, data)
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        // if (fullScreenLoading) {
        //   loading.close()
        // }
        handleError(jqXHR.responseJSON)
      }
    }
    if (isFileUpload) {
      ajaxOption.contentType = false
      ajaxOption.data = params
      ajaxOption.processData = false
      ajaxOption.cache = false
    }
    $.ajax(ajaxOption)
  },

  defaultRequestFailedHandler_: function (data, currentPath) {
    if (data.errmsg === 'unauthorized') {
      Router.push({path: '/login', redirect: currentPath})
    } else if (currentPath === '/login') {
      alert('Login failed! Email or password wrong')
    }
  },

  setDefaultRequestFailedHandler: function (handler) {
    this.defaultRequestFailedHandler_ = handler
  },

  buildQueryParams: function (obj) {
    var res = {}
    for (var i in obj) {
      if (obj[i]) {
        res[i] = obj[i]
      }
    }
    return res
  },

  getFromlocalStorage_: function (key) {
    var res = localStorage.getItem(key)
    if (res) {
      return JSON.parse(res)
    } else {
      return null
    }
  },

  saveToLocalStorage_: function (key, value) {
    if (key == null) {
      return
    }

    if (value == null) {
      localStorage.removeItem(key)
    } else {
      localStorage.setItem(key, JSON.stringify(value))
    }
  }
}

export default Common
