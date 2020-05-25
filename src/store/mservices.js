
export default {
  state: {
    mservices: null,
    sharedMservices: null,
    sharedMServicesContinueIndex: null,
    favoriteMservices: null,
    favoriteMserviceList: null
  },
  getters: {
    mservices: state => state.mservices,
    sharedMservices: state => state.sharedMservices,
    favoriteMservices: state => state.favoriteMservices,
    favoriteMserviceList: state => state.favoriteMserviceList
  },
  mutations: {
    setMservices: (state, mservices) => {
      state.mservices = mservices
    },
    setSharedMservices: (state, sharedMservices) => {
      state.sharedMservices = sharedMservices
    },
    setSharedMServicesContinueIndex: (state, continueIndex) => {
      state.sharedMServicesContinueIndex = continueIndex
    },
    setFavoriteMservices: (state, favoriteMservices) => {
      state.favoriteMservices = favoriteMservices
    },
    setFavoriteMserviceList: (state, favoriteMserviceList) => {
      state.favoriteMserviceList = favoriteMserviceList
    }
  },
  actions: {
    removeFavorite: function (context, serviceName) {
      let favoriteList = context.getters.favoriteMserviceList
      delete favoriteList[serviceName]
      context.commit('setFavoriteMserviceList', favoriteList)
      let favoriteMservices = context.getters.favoriteMservices
      let updatedFavoriteMservices = favoriteMservices.filter(function (service) {
        // console.log('inside filer: ', service.ServiceName, '::', serviceName)
        return (service.ServiceName !== serviceName)
      })
      context.commit('setFavoriteMservices', updatedFavoriteMservices)
    },
    resetLoadedMserviceCaches: function (context) {
      context.commit('setMservices', null)
      context.commit('setSharedMservices', null)
      context.commit('setFavoriteMservices', null)
      context.commit('setFavoriteMserviceList', null)
    },
    replaceMservice: function (context, newData) {
      // only one parameter is allowed for actions.?
      console.log('replacing: ', newData)
      let newMs = newData.replacingService
      let mservices = newData.services
      console.log('replaceM mservices: ', mservices)
      console.log('replaceM mservices: ', context)
      let newList = mservices.map(ms => {
        if (ms.ServiceName !== newMs.ServiceName) {
          return ms
        } else {
          let modifiedService = Object.assign({}, newMs)
          modifiedService.ServiceCode = ms.ServiceCode
          return modifiedService
        }
      })
      if (context.getters.mservices === mservices) {
        context.commit('setMservices', newList)
      } else if (context.getters.sharedMservices === mservices) {
        context.commit('setSharedMservices', newList)
      }
    }
  }
}
