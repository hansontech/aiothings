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
        let username = state.profile['cognito:username']
        return username
      } catch (e) {
        return null
      }
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
    signout: function (context, payload) {
      context.commit('setProfile', null)
      context.commit('setAccessToken', null)
      context.commit('setAuthenticated', false)
      // router.push({ name: 'login' })
    },
    profileUpdate: function (context, payload) {
      if (context.getters.username !== payload['cognito:username']) {
        console.log('reset all cached buffers')
        context.dispatch('resetLoadedMserviceCaches')
        context.dispatch('resetLoadedThingsCaches')
        context.dispatch('resetLoadedApisCaches')
        context.dispatch('resetLoadedUsageCaches')
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
