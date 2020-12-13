
export default {
  state: {
    apis: null,
    apps: null
  },
  getters: {
    apis: state => state.apis,
    apps: state => state.apps
   },
  mutations: {
    setApis: (state, apis) => {
      state.apis = apis
    },
    setApps: (state, apps) => {
      if (apps === null) {
        state.apps = []
      } else {
        state.apps = apps
      }
    }
  },
  actions: {
    resetLoadedApisCaches: function (context) {
      context.commit('setApis', null)
      context.commit('setApps', null)
    },
    replaceApi: function (context, newApi) {
      let apis = context.getters.apis
      const newList = apis.map(ms => {
        if (ms.ApiName !== newApi.ApiName) {
          return ms
        } else {
          const modifiedApi = Object.assign({}, newApi)
          return modifiedApi
        }
      })
      apis = newList
      context.commit('setApis', apis)
    },
    replaceApp: function (context, newApp) {
      let apps = context.getters.apps
      const newList = apps.map(ms => {
        if (ms.ClientId !== newApp.ClientId) {
          return ms
        } else {
          const modifiedApp = Object.assign({}, newApp)
          return modifiedApp
        }
      })
      apps = newList
      context.commit('setApps', apps)
    }
  }
}
