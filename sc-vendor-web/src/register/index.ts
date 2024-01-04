

import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/analytics'
import firebaseConfig from '../config/firebase'
import $utils from '../libs/utils'
import $log from '../libs/logger'
import $lan from '../lan'


// import firebase from 'firebase'

 const __register = ():void => {
  // 将所有方法注册
  // 1. firebase
  const app = firebase.initializeApp(firebaseConfig)
  window.$logs = $log(app)
  window.$lan = $lan
  // 2. utils
  window.$utils = {
    $firebase: firebase,
    ...$utils
  }
  // 3. sim
  // 4. localStorage or cookie
  // 5. 注册全局axios
  window.globalData = {}
  // firebase.initApp({})
}

export default __register