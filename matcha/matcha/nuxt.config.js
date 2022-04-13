export default {
  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'matcha-front',
    htmlAttrs: {
      lang: 'en',
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
      { name: 'format-detection', content: 'telephone=no' },
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/eslint
    '@nuxtjs/eslint-module',
    '@nuxtjs/fontawesome',
    '@nuxtjs/composition-api/module',
  ],

  fontawesome: {
    icons: {
      solid: [
        'faBell',
        'faPowerOff',
        'faUser',
        'faStar',
        'faTrash',
        'faImage',
        'faMars',
        'faVenus',
        'faVenusMars',
        'faHeart',
        'faThumbsDown',
        'faBan',
        'faRobot',
        'faMagnifyingGlass',
        'faPenToSquare',
        'faXmark',
        'faFire',
        'faCakeCandles',
        'faCircleInfo',
        'faPaperPlane',
        'faAngleRight',
        'faAngleUp',
        'faArrowRotateRight',
      ],
    },
  },

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/bootstrap
    'bootstrap-vue/nuxt',
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios',
    '@nuxtjs/auth-next',
    // https://nuxt-socket-io.netlify.app/
    'nuxt-socket-io',
  ],
  ssr: false,

  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  axios: {
    // Workaround to avoid enforcing hard-coded localhost:3000: https://github.com/nuxt-community/axios-module/issues/308
    baseURL: '/api/',
    proxy: true,
    prefix: '/api', // it only work when proxy is enabled
    credentials: true,
  },
  proxy: {
    '/api/getIP': {
      target: 'https://api.ipify.org?format=json',
      changeOrigin: true,
      pathRewrite: { '^/api/getIP': '' },
    },
  },
  auth: {
    cookie: {
      options: {
        sameSite: 'lax',
      },
    },
    strategies: {
      local: {
        token: {
          property: 'token',
          global: true,
          required: true,
          type: 'Bearer',
        },
        user: {
          property: 'user',
          autoFetch: true,
        },
        endpoints: {
          login: { url: '/login', method: 'post' },
          logout: { url: '/logout', method: 'post' },
          user: false,
        },
      },
    },
    redirect: {
      login: '/login',
      logout: '/login',
      callback: '/login',
      home: '/',
    },
  },
  server: {
    host: '0.0.0.0',
  },

  io: {
    server: {
      cors: {
        origin: '*',
      },
    },
    sockets: [
      {
        default: true,
        name: 'main',
        url: 'http://localhost:3001',
        // vuex: {
        //   mutations: [],
        //   actions: [],
        //   emitBacks: [],
        // },
        // namespaces: {
        //   '/': {
        //     emitBacks: [],
        //     // function + content(optional) --> component variable
        //     emitters: ['getNotifications --> notifications'],
        //     listeners: [],
        //   },
        //   '/chat': {
        //     emitBacks: [],
        //     emitters: [],
        //     listeners: [],
        //   },
        // },
      },
    ],
  },

  router: {
    middleware: ['auth'],
  },

  // Express middleware route
  serverMiddleware: {
    '/api': '~/api',
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {},
};
