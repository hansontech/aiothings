import Vue from 'vue'
import Vuex from 'vuex'
import persist from 'vuex-localstorage'

// Modules
import auth from './auth.js'
import things from './things.js'
import usage from './usage.js'

Vue.use(Vuex)

const store = new Vuex.Store({
  plugins: [persist({
    namespace: 'aws-vuejs-cognito',
    initialState: {},
    expires: 7 * 24 * 60 * 60 * 1e3 // 1 week
  })],
  modules: {
    auth,
    things,
    usage
  }
})

export default store
