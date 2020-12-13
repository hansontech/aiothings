import './custom.scss'
import Vue from 'vue'
import App from './App.vue'
import Home from './components/Home.vue'
import Vuex from 'vuex'
import underscore from 'vue-underscore'
import Root from './Root'
import NewThing from './components/NewThing'
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
import MarkdownItVue from 'markdown-it-vue'
import 'markdown-it-vue/dist/markdown-it-vue.css'
import store from './store/index.js'
import Amplify, { Auth, API, Hub } from 'aws-amplify'
import { AWSIoTProvider } from '@aws-amplify/pubsub/lib/Providers'
// import Amplify from 'aws-amplify'
import awsmobile from './aws-exports.js'
import config from './config'
import atHelper from './aiot-helper'
import VueGoogleCharts from 'vue-google-charts'
import VueCodemirror from 'vue-codemirror'
import Spinner from 'vue-simple-spinner'
import SocialSharing from 'vue-social-sharing'
import VueStripeCheckout from 'vue-stripe-checkout'
import VueQrcodeReader from 'vue-qrcode-reader'
import { library, dom } from '@fortawesome/fontawesome-svg-core'
import { faCoffee, faHeart, faTrashAlt, faPhone, faEnvelope, faInfoCircle, faInfo, faCube, faSync, faSyncAlt, faAngleDoubleRight, faArrowAltCircleRight, faArrowAltCircleLeft, faArrowLeft, faTimes, faEdit, faAngleDoubleDown, faBullseye, faCopy, faPlus, faPlay } from '@fortawesome/free-solid-svg-icons'
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
import VueAwesomeSwiper from 'vue-awesome-swiper'

// import style
import 'swiper/css/swiper.css'
Vue.use(VueAwesomeSwiper, /* { default options with global component } */)

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

// -- Tree for submenu structure user <tree ...
// https://amsik.github.io/liquor-tree/#Installation
// global registration
Vue.use(LiquorTree)

// codemirror imports end ----------------------------------

// To enable output debug messages
// window.LOG_LEVEL = 'DEBUG'
// Amplify.Logger.LOG_LEVEL = 'DEBUG'

library.add(faCopy, faBullseye, faTimes, faAngleDoubleDown, faEdit, faCoffee, faHeart, faTrashAlt, faPhone, faEnvelope, faInfoCircle, faInfo, faCube, faSync, faSyncAlt, faAngleDoubleRight, faArrowAltCircleRight, faArrowAltCircleLeft, faArrowLeft, faPlus, faPlay)
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

Vue.use(VueGoogleCharts)
Vue.use(VueQrcodeReader)
// https://github.com/gruhn/vue-qrcode-reader

const hostUrl = window.location.protocol + '//' + window.location.host
console.log('host url: ', hostUrl)
// const hostUrl = 'https://d3n2wrf9ttsajg.cloudfront.net'
// const hostUrl = 'https://www.aiothings.com'
// const hostUrl = 'http://localhost:8080'
const awsmobile2 = awsmobile
    // 2019/12/25
    // custom auth domain name, need to set 1) Cognito setting, 2) DNS server CNAME alias record too
    // Facebook: developer.facebook.com app to allow access from this domain name
    // Google: Trying login will show a link to add new domain name
    // Apple ID: follow https://aws.amazon.com/blogs/security/how-to-set-up-sign-in-with-apple-for-amazon-cognito/ to modify the address

// if (hostUrl == 'http://localhost:8080') {
//  awsmobile2.aws_user_pools_web_client_id = '1ppjiuenc3r59646sjoforoghg'
  // Also need to add to identity pool authenticated settings
  // Still not work 2020/11/29
// }

awsmobile2.oauth.domain = 'auth.aiothings.com'

awsmobile2.oauth.redirectSignIn = hostUrl + '/callback/'
awsmobile2.oauth.redirectSignOut = hostUrl + '/signout/'
console.log('oauth: ', awsmobile2)
awsmobile2.aws_cloud_logic_custom.push({
  name: 'iotDataApi',
  endpoint: 'https://api.aiothings.com/iotdata'
  // region: 'ap-southeast-2'
})
// 'https://api.aiothings.com/iotdata',
// 'https://zd8d553bfi.execute-api.ap-southeast-2.amazonaws.com/prod'

Amplify.configure(awsmobile2)
API.configure(awsmobile2)

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

// Apply plugin with configuration, need to manually update them
Amplify.addPluggable(new AWSIoTProvider({
  aws_pubsub_region: config.awsRegion,
  aws_pubsub_endpoint: 'wss://' + config.awsIotHost + '/mqtt'
}))

// Vue.component('vue-markdown', VueMarkdown)
// Vue.use(VueMarkdown)
// console.log('Markdown', VueMarkdown)

//--?? Vue.use(VueStripeCheckout, 'pk_live_zocZmh9i0DOGAcmgI7i6MwzH00JJO7x6bH') // publishable key

Vue.use(BootstrapVue)

Vue.use(Vuex)

Vue.use(VueAxios, axios)
// Vue.use(SocialSharing)
Vue.component('social-sharing', SocialSharing)

// FA core library
Vue.component('font-awesome-icon', FontAwesomeIcon)
dom.watch() // This will kick of the initial replacement of i to svg tags and configure a MutationObserver

Hub.listen('auth', listenHandler)

async function listenHandler (data) {
  const { payload } = data
  console.log('listen: ', payload.event)
  await onAuthEvent(payload)
  // console.log('A new auth event has happened: ', data.payload.data.username + ' has ' + data.payload.event)
}

export var eventBus = new Vue({})

async function onAuthEvent (payload) {
  // list of events https://aws-amplify.github.io/docs/js/hub#authentication-events
  console.log('event:', payload.event)
  if (payload.event === 'cognitoHostedUI') {
    // console.log('Hosted UI detected')

    const authSessionPromise = Auth.currentSession()
    authSessionPromise.catch(err => console.log('failed get user session: ', err))
    const session = await authSessionPromise
    console.log('user session: ', session)
    store.dispatch('profileUpdate', session.idToken.payload)

    const authCredentialsPromise = Auth.currentCredentials()
    authCredentialsPromise.catch(err => console.log('get current credentials err', err))
    const credentials = await authCredentialsPromise
    // console.log('credentials: ', credentials)
    const identityId = credentials.identityId
    await atHelper.allowLoginIdentityUseIoT(identityId, store.getters.userId, store.getters.profile)
    // console.log('jump to mythings')
    eventBus.$emit('login')
    store.commit('setGuestLoggedin', false)
    router.replace({ name: 'mythings' })
  } else if (payload.event === 'signOut') {
    eventBus.$emit('logout')
  } else if (payload.event === 'signIn_failure') {
    eventBus.$emit('loginFailed')
  }
}

Vue.component('at-sidebar', Sidebar)
Vue.component('doc-sidebar', DocSidebar)
Vue.component('spinner', Spinner)
Vue.component('at-footer', AppFooter)
Vue.component('at-new-thing', NewThing)
Vue.use(underscore)

Vue.config.productionTip = false

Vue.component('markdown-it-vue', MarkdownItVue)
Vue.component('App', App)
new Vue({
  el: '#app',
  template: '<Root/>',
  // render: h => h(Home),
  router,
  store,
  cmJsOption,
  awsmobile,
  components: {
    Root
  }
})

/*
Vue.component('App', App)
new Vue({
  el: '#app',
  router,
  store,
  cmJsOption,
  template: '<Root/>',
  data: {
    message: 'Hello AIoThings!'
  },
  components: {
    Root
  }
}).$mount('#app')
*/