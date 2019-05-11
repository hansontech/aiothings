
export default {
  state: {
    things: null
  },
  getters: {
    things: state => state.things
  },
  mutations: {
    setThings: (state, things) => {
      state.things = things
    }
  },
  actions: {
    resetLoadedThingsCaches: function (context) {
      context.commit('setThings', null)
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
    }
  }
}
