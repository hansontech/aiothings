
export default {
  state: {
    deviceGroups: null,
    things: null
  },
  getters: {
    things: state => state.things,
    deviceGroups: state => {
      if (state.deviceGroups === undefined) {
        state.deviceGroups = null
      }
      return state.deviceGroups
    }
  },
  mutations: {
    setThings: (state, things) => {
      state.things = things
    },
    setDeviceGroups: (state, deviceGroups) => {
      state.deviceGroups = deviceGroups
    }
  },
  actions: {
    resetLoadedThingsCaches: function (context) {
      context.commit('setThings', null)
      context.commit('setDeviceGroups', null)
    },
    replaceThing: function (context, newThing) {
      let things = context.getters.things
      let newList = things.map(th => {
        if (th.ThingId !== newThing.ThingId) {
          return th
        } else {
          let modifiedThing = Object.assign({}, newThing)
          return modifiedThing
        }
      })
      things = newList
      context.commit('setThings', things)
    },
    replaceDeviceGroup: function (context, newDeviceGroup) {
      let deviceGroups = context.getters.deviceGroups
      let newList = deviceGroups.map(th => {
        if (th.DeviceGroupId !== newDeviceGroup.DeviceGroupId) {
          return th
        } else {
          let modifiedDeviceGroup = Object.assign({}, newDeviceGroup)
          return modifiedDeviceGroup
        }
      })
      deviceGroups = newList
      context.commit('setDeviceGroups', deviceGroups)
    }
  }
}
