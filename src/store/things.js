
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
    },
    setUsername: (state, username) => {
      state.username = username
    }
  },
  actions: {
  }
}
