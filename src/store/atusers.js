export default {
  state: {
    atusers: null
  },
  getters: {
    atusers: state => state.atusers
  },
  mutations: {
    setAtusers: (state, atusers) => {
      if (typeof atusers === 'undefined') {
        state.atusers = null
      } else {
        state.atusers = atusers
      }
    }
  },
  actions: {
  }
}
