<template>
  <b-container fluid >
    <div style="min-height: 500px">
      <b-row v-if="isWaitingAuthFinish" align-v="center" align-h="center" > 
        <spinner size="large" />
      </b-row>
      <b-row v-if="isLoginFailed" align-v="center" align-h="center" > 
        <h3>Sign-in did not succeed, please try again. </h3> 
      </b-row>
    </div>
  </b-container>
</template>

<script>
import { eventBus } from '../main'
// import store from '../store'
// import router from '../router'
// import { Auth } from 'aws-amplify'
// import Amplify from 'aws-amplify'
// import { CognitoAuth } from 'amazon-cognito-auth-js'
// import authService from '../services/auth'
/*
const oauth = {
  // Domain name
  domain: 'aiothings.auth.ap-southeast-2.amazoncognito.com',
  // Authorized scopes
  scope: ['profile', 'openid', 'aws.cognito.signin.user.admin'],

  // Callback URL
  redirectSignIn: 'http://localhost:8080/callback',
  // Sign out URL
  redirectSignOut: 'http://localhost:8080/signout',

  // 'code' for Authorization code grant,
  // 'token' for Implicit grant
  responseType: 'code',

  // optional, for Cognito hosted ui specified options
  options: {
      // Indicates if the data collection is enabled to support Cognito advanced security features. By default, this flag is set to true.
      AdvancedSecurityDataCollectionFlag: false
  }
} */
/*
CognitoAuth.userhandler = {
      onSuccess: function (result) {
        console.log('Sign in success')
        // let self = this
        // self.$router.push('user')
      },
      onFailure: function (err) {
        console.log('login failed err:', err)
      }
    }
*/
/* function test () {
  // let self = this
  let curUrl = window.location.href
  console.log('callback url: ', curUrl)
  let auth = new CognitoAuth()
  auth.parseCognitoWebResponse(curUrl)
} */

export default {
  name: 'auth callback',
  data () {
    return {
      isWaitingAuthFinish: true,
      isLoginFailed: false
    }
  },
  /* beforeCreate () {
    Amplify.configure(awsmobile)
    Amplify.configure({
      Auth: {
        oauth: oauth
      }
    })
  }, */

  created () {
    // let self = this
    // const curUrl = window.location.href
    // CognitoAuth.parseCognitoWebResponse(curUrl)
    // test()
    // --https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp
    /*
    var accessToken = this.$route.hash.match(/(?:access_token)=([^&]+)/)
    var idToken = this.$route.hash.match(/(?:id_token)=([^&]+)/)
    var verification = this.$route.hash.match(/(?:state)=([^&]+)/)
    var expiresIn = this.$route.hash.match(/(?:expires_in)=(\d+)/)

    console.log('Callback created:')
    const currentUser = Auth.userPool.getCurrentUser()
    if (currentUser != null) {
        currentUser.signOut()
    }

    if (!accessToken) {
      router.push({ name: 'error', params: { message: 'The authentication response did not contain a valid access_token' } })
      return
    }

    if (!idToken) {
      router.push({ name: 'error', params: { message: 'The authentication response did not contain a valid id_token' } })
      return
    }

    if (!verification) {
      router.push({ name: 'error', params: { message: 'The authentication response did not contain a valid verification state value' } })
      return
    }

    if (!expiresIn) {
      router.push({ name: 'error', params: { message: 'The authentication response did not contain a valid token expiry date' } })
      return
    }

    store.dispatch('authenticate', {
      accessToken: accessToken[1],
      idToken: idToken[1],
      verification: verification[1],
      expiresIn: expiresIn[1]
    })
    */
    var curUrl = window.location.href
    console.log('callback is called: ', curUrl)
    /*
    Auth.configure({
      oauth: Auth.configure().oauth
      // mandatorySignIn: true
    })
    */
    /*
    try {
      let authData = authService.authenticateData()
      console.log('authData: ', authData)
      let auth = new CognitoAuth(authData)
      auth.userhandler = {
        onSuccess: function (result) {
          console.log('Sign in success')
          console.log(result)
          // let self = this
          // self.$router.push('user')
        },
        onFailure: function (err) {
          console.log('login failed err:', err)
        }
      }
      var curUrl = window.location.href
      auth.parseCognitoWebResponse(curUrl)
    } catch (e) {
      console.log('error from auth???')
    } */
    // set this flag later after receiving profile information, this.$store.commit('setAuthenticated', true)
    /*
    Auth.currentAuthenticatedUser()
    .then(user => {
      console.log('confirmed user: ', user)
      router.push({ name: 'home' })
    }).catch(err => console.log('currentUserError: ', err))
    */
    // router.push({ name: 'user' })
    // this.$router.push('user')
    console.log('dispatch')
    /*
    Hub.dispatch(
    'auth',
    {
      event: 'cognitoHostedUI'
    })
    */
  },
  mounted () {
       eventBus.$on('loginFailed', this.onLoginFailed)
  },
  methods: {
    onLoginFailed () {
      this.isWaitingAuthFinish = false
      this.isLoginFailed = true
      let routerObj = this.$router
      setTimeout(function () {
        routerObj.replace({name: 'home'})
      }, 5000)
    }
  }
}
</script>