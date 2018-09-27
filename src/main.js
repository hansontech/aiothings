// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import Vuex from 'vuex'
import App from './App'
import Sidebar from './components/Sidebar'
import router from './router'
import BootstrapVue from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import VueAxios from 'vue-axios'
import VueAuthenticate from 'vue-authenticate'
import axios from 'axios'
import store from './store/index.js'
import Amplify, {Auth, Hub, Logger} from 'aws-amplify'
import { AWSIoTProvider } from '@aws-amplify/PubSub/lib/Providers'
// import Amplify from 'aws-amplify'
import awsmobile from './aws-exports'
import config from './config'
import atHelper from './aiot-helper'

Amplify.configure(awsmobile)

// const hostUrl = window.location.protocol + '//' + window.location.host
// const hostUrl = 'https://d2hfv3g2kqqll0.cloudfront.net'
const hostUrl = 'http://localhost:8080'

const oauth = {
  // Domain name
  domain: config.awsCognitoDomain,
  // Authorized scopes
  scope: ['phone', 'email', 'profile', 'openid', 'aws.cognito.signin.user.admin'],

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

Amplify.configure({
  Auth: {
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
      oauth: oauth
  },
  PubSub: {
    // This was not in the examples and I wonder if I can omit it
    // uuidv4() is from https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript#answer-2117523
    clientId: uuidv4()
  }
})

function uuidv4 () {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    let r = Math.random() * 16 | 0
    let v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

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

Vue.use(BootstrapVue)

Vue.use(Vuex)

Vue.use(VueAxios, axios)
Vue.use(VueAuthenticate, {
  baseUrl: 'http://localhost:3000', // Your API domain
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
authLogger.onHubCapsule = (capsule) => {
  console.log('event:', capsule.payload.event)
  if (capsule.payload.event === 'cognitoHostedUI') {
    console.log('Hosted UI detected')
    Auth.currentSession()
    .then(session => { store.dispatch('profileUpdate', session.idToken.payload) })
    .catch(err => console.log('failed get user session: ', err))

    Auth.currentCredentials()
    .then(credentials => {
      console.log('credentials: ', credentials)
      const identityId = credentials._identityId
      atHelper.allowLoginIdentityUseIoT(identityId)
    })
    .catch(err => console.log('get current credentials err', err))

    router.push({ name: 'mythings' })
  }
}

Hub.listen('auth', authLogger)

Vue.component('at-sidebar', Sidebar)

export var eventBus = new Vue({})

Vue.config.productionTip = false
// window.LOG_LEVEL = 'DEBUG'
// Amplify.Logger.LOG_LEVEL = 'DEBUG'

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: {
    App
  }
})
