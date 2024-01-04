const pkg = require('./package')
const nuxtPageCache = require('nuxt-page-cache')


module.exports = {
  mode: 'universal',

  /*
   ** Headers of the page
   */
  head: {
    title: pkg.name,
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: pkg.description }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },

  /*
   ** Customize the progress-bar color
   */
  loading: { color: '#fff' },

  router: {
    base: '/webapp/'
  },

  /*
   ** Global CSS
   */
  css: [
    { src: 'swiper/dist/css/swiper.css' }
  ],

  server: {
    port: 3000, // default: 3000
    host: '0.0.0.0' // default: localhost
  },

  /*
   ** Plugins to load before mounting the App
   */
  plugins: [
    { src: '~/plugins/vue-awesome-swiper.js', ssr: false },
    { src: '~/plugins/flashgo-filters.js' },
    {
      src: '~/plugins/vue-waterfall2.js',
      ssr: false
    }
  ],

  /*
   ** Nuxt.js modules
   */
  build: {
    vendor: ['axios']
  },
  modules: [
    // Doc: https://axios.nuxtjs.org/usage
    '@nuxtjs/axios',
    '@nuxtjs/proxy'

  ],
  // proxy: [
  //       ['/app', { target: 'http://cdn.flashgo.online' }]
  //   ],
  /*
   ** Axios module configuration
   */
  axios: {
    // proxy: true,
    // prefix: '/news-article',
    // credentials: true,
  },
  // proxy: {
  //   '/news-article': {
  //     target: 'http://cdn.flashgo.online', 
  //     changeOrigin: true, 
  //     pathRewrite: {
  //       '^/news-article': '',
  //     },
  //   }
  // },

  /*
   ** Build configuration
   */
  build: {
    /*
     ** You can extend webpack config here
     */
    extend(config, ctx) {}
  },

  generate: {
    routes: [
      '/home'
    ],
    subFolders: false,
    fallback: true
  },

  serverMiddleware: [
    nuxtPageCache.cacheSeconds(300, req => {
      if (req.query && req.query.cache) {
        return req.query.cache
      }
      return false
    })
  ]
}
