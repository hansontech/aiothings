import router from '../router'
import jwt from 'jwt-decode'

export default {
  state: {
    profile: null,
    accessToken: null,
    idToken: null,
    refreshToken: null,
    verification: null,
    isAuthenticated: false,
    count: 0
  },

  getters: {
    profile: state => state.profile,
    verification: state => state.verification,
    accessToken: state => state.accessToken,
    idToken: state => state.idToken,
    refreshToken: state => state.refreshToken,
    isAuthenticated: state => state.isAuthenticated,
    username: state => {
      try {
        let cognitoUsername = state.profile['cognito:username']
        let username = cognitoUsername.replace(/\./g, '_') // for Apple User name case .
            // as the username is going to be used as UserId, and it cannot have characters other than a-zA-Z_
            // Apple returned sub field has the formatlike 'SignInWithApple_001315.e4ff039ee97a4392bde22a525c7bc2ff.0226'
            // must replace the . to _
        return username
      } catch (e) {
        return null
      }
    },
    userId: state => {
      // sub field is the UUID of the authenticated user.
      // sub is globally unique and hence is unique for user pool as well.
      // Unlike username, which can be reassigned to another user in user pool, sub is never reassigned.
      return state.profile['sub']
    }
  },
  mutations: {
    setProfile: (state, profile) => {
      state.profile = profile
    },
    setAccessToken: (state, accessToken) => {
      state.accessToken = accessToken
    },
    setIdToken: (state, idToken) => {
      state.idToken = idToken
    },
    setRefreshToken: (state, refreshToken) => {
      state.refreshToken = refreshToken
    },
    setVerification: (state, verification) => {
      state.verification = verification
    },
    setAuthenticated: (state, isAuthenticated) => {
      state.isAuthenticated = isAuthenticated
    }
  },

  actions: {
    clearCache: function (context) {
      context.dispatch('resetLoadedMserviceCaches')
      context.dispatch('resetLoadedThingsCaches')
      context.dispatch('resetLoadedApisCaches')
      context.dispatch('resetLoadedUsageCaches')
      context.dispatch('resetDashboard')
    },
    signout: function (context, payload) {
      context.commit('setProfile', null)
      context.commit('setAccessToken', null)
      context.commit('setAuthenticated', false)
      context.dispatch('clearCache')
      // router.push({ name: 'login' })
    },
    profileUpdate: function (context, payload) {
      if (context.getters.username !== payload['cognito:username']) {
        console.log('reset all cached buffers')
        context.dispatch('clearCache')
      }
      context.commit('setProfile', payload)
      context.commit('setAuthenticated', true)
    },
    authenticate: function (context, payload) {
      if (payload.verification === null || payload.verification !== context.getters.verification) {
        router.push({ name: 'error', params: { message: 'The verification state in the authentication response did not match our original request' } })
        return
      }

      if (payload.idToken === null || (jwt(payload.idToken).token_use || null) !== 'id') {
        router.push({ name: 'error', params: { message: 'The authentication response did not include a valid ID token' } })
        return
      }

      context.commit('setProfile', jwt(payload.idToken))
      context.commit('setAccessToken', payload.accessToken)
      context.commit('setIdToken', payload.idToken)
      context.commit('setAuthenticated', true)
      // -- 20180901 router.push({ name: 'user' })
    },
    update: function (context, payload) {
      context.commit('setProfile', jwt(payload.idToken))
      context.commit('setAccessToken', payload.accessToken)
      context.commit('setIdToken', payload.idToken)
      context.commit('setAuthenticated', true)
      // -- 20180901 router.push({ name: 'user' })
    }

  }
}
