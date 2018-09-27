<template>
  <div>
    <h1>Authenticating...</h1>
  </div>
</template>

<script>

import store from '../store'
// import router from '../router'
// import { Auth } from 'aws-amplify'
import { Auth } from 'aws-amplify'
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
  /* beforeCreate () {
    Amplify.configure(awsmobile)
    Amplify.configure({
      Auth: {
        oauth: oauth
      }
    })
  }, */
  async created () {
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
    console.log('callback: ', curUrl)

    Auth.configure({
      /*
      identityPoolId: 'ap-southeast-2:00294c49-1629-49e7-88d7-4720566c1377',
      // REQUIRED - Amazon Cognito Identity Pool ID
      region: 'ap-southeast-2', // REQUIRED - Amazon Cognito Region
      userPoolId: 'ap-southeast-2_lL7aXmrN3',
      // OPTIONAL - Amazon Cognito User Pool ID
      userPoolWebClientId: 'plnvmu6sfd30444ggvknv4vq9', // '7bsh3bbbl4onns8h4d6ceof3kd',
      // OPTIONAL - Amazon Cognito Web Client ID
      // ....
      */
      oauth: Auth.configure().oauth
      // mandatorySignIn: true
    })
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
    store.commit('setAuthenticated', true)
    /*
    Auth.currentAuthenticatedUser()
    .then(user => {
      console.log('confirmed user: ', user)
      router.push({ name: 'home' })
    }).catch(err => console.log('currentUserError: ', err))
    */
    // router.push({ name: 'user' })
    // this.$router.push('user')
  }
}
</script>