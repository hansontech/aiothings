
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
      const newList = things.map(th => {
        if (th.ThingId !== newThing.ThingId) {
          return th
        } else {
          const modifiedThing = Object.assign({}, newThing)
          return modifiedThing
        }
      })
      things = newList
      context.commit('setThings', things)
    },
    replaceDeviceGroup: function (context, newDeviceGroup) {
      let deviceGroups = context.getters.deviceGroups
      const newList = deviceGroups.map(th => {
        if (th.DeviceGroupName !== newDeviceGroup.DeviceGroupName) {
          return th
        } else {
          const modifiedDeviceGroup = Object.assign({}, newDeviceGroup)
          return modifiedDeviceGroup
        }
      })
      deviceGroups = newList
      context.commit('setDeviceGroups', deviceGroups)
    }
  }
}
