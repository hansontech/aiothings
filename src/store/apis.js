
export default {
  state: {
    apis: null
  },
  getters: {
    apis: state => state.apis
   },
  mutations: {
    setApis: (state, apis) => {
      state.apis = apis
    }
  },
  actions: {
    replaceApi: function (context, newApi) {
      let apis = context.getters.apis
      let newList = apis.map(ms => {
        if (ms.ApiName !== newApi.ApiName) {
          return ms
        } else {
          let modifiedApi = Object.assign({}, newApi)
          return modifiedApi
        }
      })
      apis = newList
      context.commit('setApis', apis)
    }
  }
}
