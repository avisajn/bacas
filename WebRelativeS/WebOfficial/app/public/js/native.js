const goToMokkaya = function () {
  var url = document.querySelector('.target_url').innerText || `https://mokkaya.com/webapp/shop`
  console.log(url)
  try {
    MokkayaAndroid.backToMainWindow('true', url)
  } catch (error) {
    location.href = `mokkaya://mokkaya.com/webapp/shop`
  }
}

const errorImageLogs = function() {
  gtag('event', 'promote_image_error', { type: location.href})
  console.log('imageerror')
}

window.appGoBack = function () {
   try {
    MokkayaAndroid.closeWebWindow()
  } catch (error) {
    window.close()
  }
}