const $toast = function (obj = {}) {
  if (!obj.message) {
    return false
  } else {
    if (document.querySelector('.toast_wrap')) {
      document.body.removeChild(document.querySelector('.toast_wrap'))
    }
    const wrap = document.createElement('div')
    wrap.classList.add('toast_wrap')
    if (obj.wrapClass) {
      wrap.classList.add(obj.wrapClass)
    }
    wrap.innerHTML = `<div class="toast_info">${obj.message}</div>`
    document.body.append(wrap)
    setTimeout(() => {
      document.querySelector('.toast_info').style.opacity = 1
    }, 100)
    setTimeout(() => {
      document.querySelector('.toast_info').style.opacity = 0
    }, Number(obj.time) + 100 || 3100)
  }
}