// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import Vuex from 'vuex'
import App from './App'
import AppFooter from './components/AppFooter'
import Sidebar from './components/Sidebar'
import DocSidebar from './components/DocSidebar'
import router from './router'
import BootstrapVue from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import VueAxios from 'vue-axios'
import VueAuthenticate from 'vue-authenticate'
import axios from 'axios'
import LiquorTree from 'liquor-tree'
// import VueMarkdown from 'vue-markdown'
import store from './store/index.js'
import Amplify, {Auth, Hub, Logger} from 'aws-amplify'
import { AWSIoTProvider } from '@aws-amplify/PubSub/lib/Providers'
// import Amplify from 'aws-amplify'
import awsmobile from './aws-exports'
import config from './config'
import atHelper from './aiot-helper'
import atWhitepaper from './assets/aiothings-wp'
import VueCodemirror from 'vue-codemirror'
import Spinner from 'vue-simple-spinner'
import SocialSharing from 'vue-social-sharing'
import VueStripeCheckout from 'vue-stripe-checkout'
import { library, dom } from '@fortawesome/fontawesome-svg-core'
import { faCoffee, faHeart, faTrashAlt, faPhone, faEnvelope, faInfoCircle, faInfo, faCube } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faGithub, faSlack, faFacebookF, faFacebook, faLinkedin, faTwitter, faGooglePlus, faLine, faWeibo, faWeixin } from '@fortawesome/free-brands-svg-icons'
// https://fontawesome.com/icons?d=gallery
// website shows - replace by camel style: fa-trash-alt => faTrashAlt
// require styles

// codemirror imports --------------------------------
import 'codemirror/lib/codemirror'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/base16-dark.css'

// language python
import 'codemirror/mode/python/python.js'
// import 'codemirror/addon/lint/python-lint.js'
import './lib/python-lint.js'

// language js
import 'codemirror/mode/javascript/javascript.js'
import 'codemirror/addon/lint/javascript-lint.js'
// import 'codemirror/addon/hint/javascript-hint.js'

// lint
import 'codemirror/addon/lint/lint.css'
import 'codemirror/addon/lint/lint.js'

// hint
// import 'codemirror/addon/hint/show-hint.js'
// import 'codemirror/addon/hint/show-hint.css'
// import 'codemirror/addon/selection/active-line.js'

// highlightSelectionMatches
  import 'codemirror/addon/scroll/annotatescrollbar.js'
  import 'codemirror/addon/search/matchesonscrollbar.js'
  import 'codemirror/addon/search/searchcursor.js'
  import 'codemirror/addon/search/match-highlighter.js'

// keyMap
  import 'codemirror/mode/clike/clike.js'
  import 'codemirror/addon/edit/matchbrackets.js'
  import 'codemirror/addon/comment/comment.js'
  import 'codemirror/addon/dialog/dialog.js'
  import 'codemirror/addon/dialog/dialog.css'
  // import 'codemirror/addon/search/searchcursor.js'
  import 'codemirror/addon/search/search.js'
  import 'codemirror/keymap/sublime.js'

// foldGutter
  import 'codemirror/addon/fold/foldgutter.css'
  import 'codemirror/addon/fold/brace-fold.js'
  import 'codemirror/addon/fold/comment-fold.js'
  import 'codemirror/addon/fold/foldcode.js'
  import 'codemirror/addon/fold/foldgutter.js'
  import 'codemirror/addon/fold/indent-fold.js'
  import 'codemirror/addon/fold/markdown-fold.js'
  import 'codemirror/addon/fold/xml-fold.js'

import 'codemirror/addon/display/autorefresh.js'

import { JSHINT } from 'jshint'
window.JSHINT = JSHINT
// JS hint options :  https://jshint.com/docs/options/
const cmJsOption = {
  tabSize: 4,
  styleActiveLine: true,
  lineNumbers: true,
  styleSelectedText: false,
  // lint: true,
  line: true,
  autofocus: true,
  foldGutter: true,
  // gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter', 'CodeMirror-lint-markers'],
  gutters: ['CodeMirror-lint-markers'],
  // highlightSelectionMatches: { showToken: /\w/, annotateScrollbar: true },
  mode: 'text/javascript',
  // hint.js options
  hintOptions: {
    // 当匹配只有一项的时候是否自动补全
    completeSingle: false
  },
  // 快捷键 可提供三种模式 sublime、emacs、vim
  // keyMap: 'sublime',
  matchBrackets: true,
  showCursorWhenSelecting: true,
  theme: 'default', // 'base16-dark',
  // extraKeys: { 'Ctrl': 'autocomplete' },
  autoRefresh: true,
  lint: {
    globalstrict: true,
    strict: false,
    esversion: 8,
    asi: true
  }
}

const cmPyOption = {
  tabSize: 4,
  styleActiveLine: true,
  lineNumbers: true,
  styleSelectedText: false,
  // lint: true,
  line: true,
  autofocus: true,
  foldGutter: true,
  // gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter', 'CodeMirror-lint-markers'],
  gutters: ['CodeMirror-lint-markers'],
  // highlightSelectionMatches: { showToken: /\w/, annotateScrollbar: true },
  mode: 'text/x-python',
  // hint.js options
  hintOptions: {
    // 当匹配只有一项的时候是否自动补全
    completeSingle: false
  },
  // 快捷键 可提供三种模式 sublime、emacs、vim
  // keyMap: 'sublime',
  matchBrackets: true,
  showCursorWhenSelecting: true,
  theme: 'default', // 'base16-dark',
  // extraKeys: { 'Ctrl': 'autocomplete' },
  autoRefresh: true,
  lint: {
    globalstrict: true,
    strict: false,
    asi: true
  }
}

// -- Tree for submenu structure user <tree ...
// https://amsik.github.io/liquor-tree/#Installation
// global registration
Vue.use(LiquorTree)

// codemirror imports end ----------------------------------

library.add(faCoffee, faHeart, faTrashAlt, faPhone, faEnvelope, faInfoCircle, faInfo, faCube)
library.add(faGithub, faSlack, faFacebook, faFacebookF, faLinkedin, faTwitter, faGooglePlus, faLine, faWeibo, faWeixin)

// require more codemirror resource...
// you can set default global options and events when use
Vue.use(VueCodemirror, {
  options: cmJsOption
}
 /* ,  {
  options: { theme: 'base16-dark', ... },
  events: ['scroll', ...]
} */)
// theme: 'base16-dark',

// AWS CLI cloudfront reference:
// https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Invalidation.html
// to invalidate cloudfront cache, force to update contents to edges.
// > aws cloudfront create-invalidation --distribution-id $CDN_DISTRIBUTION_ID --paths "/*"

const hostUrl = window.location.protocol + '//' + window.location.host
// const hostUrl = 'https://d3n2wrf9ttsajg.cloudfront.net'
// const hostUrl = 'https://www.aiothings.com'
// const hostUrl = 'http://localhost:8080'
let awsmobile2 = awsmobile
awsmobile2.oauth.redirectSignIn = hostUrl + '/callback/'
awsmobile2.oauth.redirectSignOut = hostUrl + '/signout/'

Amplify.configure(awsmobile2)

/*
const oauth = {
  // Domain name
  domain: config.awsCognitoDomain,
  // Authorized scopes
  scope: ['profile', 'openid', 'aws.cognito.signin.user.admin'],

  // Callback URL
  redirectSignIn: hostUrl + '/callback',
  // Sign out URL
  redirectSignOut: hostUrl + '/signout',

  // 'code' for Authorization code grant,
  // 'token' for Implicit grant
  responseType: 'code',

  // optional, for Cognito hosted ui specified options
  options: {
      // Indicates if the data collection is enabled to support Cognito advanced security features. By default, this flag is set to true.
      AdvancedSecurityDataCollectionFlag: true
  }
}
*/
// 0528 remarked, to reflect new settings Auth.configure({ oauth: oauth })

// Amplify.configure({
  // Auth: {
      // other configurations...
      /*
      identityPoolId: 'ap-southeast-2:00294c49-1629-49e7-88d7-4720566c1377',
      // REQUIRED - Amazon Cognito Identity Pool ID
      region: 'ap-southeast-2', // REQUIRED - Amazon Cognito Region
      userPoolId: 'ap-southeast-2_lL7aXmrN3',
      // OPTIONAL - Amazon Cognito User Pool ID
      userPoolWebClientId: 'plnvmu6sfd30444ggvknv4vq9',
      // OPTIONAL - Amazon Cognito Web Client ID
      */
      // ....
      // oauth: oauth
  // },
  // PubSub: {
    // This was not in the examples and I wonder if I can omit it
    // uuidv4() is from https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript#answer-2117523
   // clientId: uuidv4()
  // }
// })
/*
function uuidv4 () {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    let r = Math.random() * 16 | 0
    let v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}
*/
// AWS IoT reference about protocol
// https://docs.aws.amazon.com/iot/latest/developerguide/protocols.html
// Important 2018/9/16
// The MQTT specification provides a provision for the publisher to request
// that the broker retain the last message sent to a topic and send it to
// all future topic subscribers. AWS IoT does not support retained messages.
// If a request is made to retain messages, the connection is disconnected.

// AWS Amplify reference
// https://aws-amplify.github.io/amplify-js/api/classes/authclass.html#currentcredentials
// https://aws-amplify.github.io/

// Apply plugin with configuration
Amplify.addPluggable(new AWSIoTProvider({
  aws_pubsub_region: config.awsRegion,
  aws_pubsub_endpoint: 'wss://' + config.awsIotHost + '/mqtt'
}))

// Vue.component('vue-markdown', VueMarkdown)

Vue.use(VueStripeCheckout, 'pk_live_zocZmh9i0DOGAcmgI7i6MwzH00JJO7x6bH') // publishable key

Vue.use(BootstrapVue)

Vue.use(Vuex)

Vue.use(VueAxios, axios)
// Vue.use(SocialSharing)
Vue.component('social-sharing', SocialSharing)

// FA core library
Vue.component('font-awesome-icon', FontAwesomeIcon)
dom.watch() // This will kick of the initial replacement of i to svg tags and configure a MutationObserver

// 'http://localhost:3000' ??
Vue.use(VueAuthenticate, {
  baseUrl: hostUrl, // Your API domain
  providers: {
    facebook: {
      clientId: '265383824068284',
      redirectUri: 'http://localhost:8080/auth/callback' // Your client app URL
    }
  },
  bindRequestInterceptor: function () {
    console.log('request intercepter')
    this.$http.interceptors.request.use((config) => {
      if (this.isAuthenticated()) {
        config.headers['Authorization'] = [
          this.options.tokenType, this.getToken()
        ].join(' ')
      } else {
        delete config.headers['Authorization']
      }
      return config
    })
  },
  bindResponseInterceptor: function () {
    console.log('response intercepter')
    this.$http.interceptors.response.use((response) => {
      this.setToken(response)
      console.log('response intercepter loop')
      // let email = this.$auth.providers.facebook.scope['email']
      // console.log(email)
      return response
    })
  }
})

const authLogger = new Logger('Auth Watcher')
authLogger.onHubCapsule = async (capsule) => {
  console.log('event:', capsule.payload.event)
  if (capsule.payload.event === 'cognitoHostedUI') {
    console.log('Hosted UI detected')
    /*
    Auth.currentSession()
    .then(session => {
      // console.log('user session: ', session)
      store.dispatch('profileUpdate', session.idToken.payload)
    })
    .catch(err => console.log('failed get user session: ', err))

    Auth.currentCredentials()
    .then(credentials => {
      console.log('credentials: ', credentials)
      const identityId = credentials._identityId
      atHelper.allowLoginIdentityUseIoT(identityId)
    })
    .catch(err => console.log('get current credentials err', err))
    */

    let authSessionPromise = Auth.currentSession()
    authSessionPromise.catch(err => console.log('failed get user session: ', err))
    let session = await authSessionPromise
    console.log('user session: ', session)
    store.dispatch('profileUpdate', session.idToken.payload)

    let authCredentialsPromise = Auth.currentCredentials()
    authCredentialsPromise.catch(err => console.log('get current credentials err', err))
    let credentials = await authCredentialsPromise
    console.log('credentials: ', credentials)
    const identityId = credentials._identityId
    await atHelper.allowLoginIdentityUseIoT(identityId)
    // console.log('jump to mythings')
    router.replace({ name: 'myapps' })
  }
}

Hub.listen('auth', authLogger)

Vue.component('at-sidebar', Sidebar)
Vue.component('doc-sidebar', DocSidebar)
Vue.component('spinner', Spinner)
Vue.component('at-footer', AppFooter)
export var eventBus = new Vue({})

Vue.component('at-whitepaper', atWhitepaper)
Vue.config.productionTip = false
// window.LOG_LEVEL = 'DEBUG'
// Amplify.Logger.LOG_LEVEL = 'DEBUG'

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  cmJsOption,
  cmPyOption,
  template: '<App/>',
  data: {
    message: 'Hello Vue!'
  },
  components: {
    App
  }
})
