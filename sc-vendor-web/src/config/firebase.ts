import BASECONFIG from '../baseConfig.json';

// console.log(BASECONFIG)

// console.log()

const envTag:string = process.env.REACT_APP_ENV_TAG || 'dev'

export default BASECONFIG.firebase[envTag]

// export default {
//   // apiKey: "AIzaSyC-kkP3aASoH4TDCNoUiE4aResQGtbHN8w",
//   // authDomain: "nip-social-ecommerce.firebaseapp.com",
//   // databaseURL: "https://nip-social-ecommerce.firebaseio.com",
//   // projectId: "nip-social-ecommerce",
//   // storageBucket: "nip-social-ecommerce.appspot.com",
//   // messagingSenderId: "533195842181",
//   // appId: "1:533195842181:web:0543ced4aec8cadf51ffec",
//   // measurementId: "G-KL9JTFHCB7"
//   apiKey: "AIzaSyABxYnt6-P9My7c5giJuMGip7VFMUjA4Nk",
//   authDomain: "nip-sc-supplier-test.firebaseapp.com",
//   databaseURL: "https://nip-sc-supplier-test.firebaseio.com",
//   projectId: "nip-sc-supplier-test",
//   storageBucket: "nip-sc-supplier-test.appspot.com",
//   messagingSenderId: "55563450039",
//   appId: "1:55563450039:web:460f8e1f664eb1c384bf32",
//   measurementId: "G-EDDGYX9MFY"
// }