import store from '../store'
// import config from '../config'
import { Auth } from 'aws-amplify'

export default {

  authenticate: function () {
    const config = Auth.configure()
    let {
        domain,
        redirectSignIn,
        // redirectSignOut,
        responseType } = config.oauth
    const clientId = config.userPoolWebClientId

    var verification = generateVerification()
    store.commit('setVerification', verification)
    var scope = 'openid%20profile'
    responseType = 'code'
    const url = 'https://' + domain + '/login?redirect_uri=' + redirectSignIn + '&response_type=' + responseType + '&client_id=' + clientId + '&state=' + verification + '&scope=' + scope

    console.log('url:: ', url)
    // Launch hosted UI
    window.location.assign(url)
  },
  /*
  authenticateData: function () {
    var authData = {
      ClientId: config.awsCognitoUserPoolAppClientId, // Your client id here
      AppWebDomain: process.env.AWS_COGNITO_USER_POOL_DOMAIN,
      TokenScopesArray: ['profile', 'openid'],
      RedirectUriSignIn: window.location.protocol + '//' + window.location.host + '/callback',
      RedirectUriSignOut: window.location.protocol + '//' + window.location.host + '/signout',
      IdentityProvider: `cognito-idp.${config.awsRegion}.amazonaws.com/${config.awsCognitoUserPoolId}`, // e.g. 'Facebook',
      UserPoolId: config.awsCognitoUserPoolId, // Your user pool id here
      AdvancedSecurityDataCollectionFlag: true // e.g. true
      // Storage: '<TODO the storage object>' // OPTIONAL e.g. new CookieStorage(), to use the specified storage provided
    }
    return authData
  }, */
  authenticateOld: function (provider) {
    var domain = process.env.AWS_COGNITO_USER_POOL_DOMAIN
    var clientId = process.env.AWS_COGNITO_CLIENT_ID
    var type = 'token'
    var scope = 'openid profile'

    var callback = window.location.protocol + '//' + window.location.host + '/callback'

    console.log('callback: ', callback)
    // Save the 'verification' value, so it can be verified later to prevent CSRF attacks
    var verification = generateVerification()
    store.commit('setVerification', verification)

    if (provider !== undefined) {
      // Go straight to the provider, skipping the hosted UI
      window.location.href = 'https://' + domain + '/authorize?identity_provider=' + provider + '&response_type=' + type + '&client_id=' + clientId + '&redirect_uri=' + callback + '&state=' + verification + '&scope=' + scope
    } else {
      // Use the hosted UI
      let url = 'https://' + domain + '/login?response_type=' + type + '&client_id=' + clientId + '&redirect_uri=' + callback + '&state=' + verification + '&scope=' + scope
      console.log('url** ', url)
      window.location.href = url
    }
  }

}

// generateVerification creates a random string for including in the OAuth2
// request, which is then validated in the response.
function generateVerification () {
  var verification = ''
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  for (var i = 0; i < 32; i++) {
    verification += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return verification
}