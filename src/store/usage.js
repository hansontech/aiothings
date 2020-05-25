
export default {
  state: {
    searchArea: null,
    searchText: null,
    searchKeywords: null,
    solutions: null,
    consoleOutputs: null,
    consoleInputTopic: null,
    consoleInputBody: null,
    consoleInputFrom: null,
    consoleSubscribeTopic: null
  },

  getters: {
    searchArea: state => state.searchArea,
    searchText: state => state.searchText,
    searchKeywords: state => state.searchKeywords,
    solutions: state => state.solutions,
    consoleOutputs: state => state.consoleOutputs,
    consoleSubscribeTopic: state => state.consoleSubscribeTopic,
    consoleInputTopic: state => state.consoleInputTopic,
    consoleInputFrom: state => state.consoleInputFrom,
    consoleInputBody: state => {
      console.log('read body: ', state.consoleInputBody)
      if (state.consoleInputBody !== null) {
        return state.consoleInputBody
      } else {
        return ''
      }
    }
  },
  mutations: {
    setSearchArea: (state, area) => {
      state.searchArea = area
    },
    setSearchText: (state, text) => {
      state.searchText = text
    },
    setSearchKeywords: (state, text) => {
      state.searchKeywords = text
    },
    setQueriedSolutions: (state, solutions) => {
      state.solutions = solutions
    },
    setConsoleOutputs: (state, consoleOutputs) => {
      state.consoleOutputs = consoleOutputs
    },
    setConsoleInput: (state, consoleInput) => {
      if (consoleInput === null) {
        state.consoleInputTopic = null
        state.consoleInputBody = null
      } else {
        if (consoleInput.hasOwnProperty('topic')) {
          state.consoleInputTopic = consoleInput.topic
          // console.log('write topic: ', consoleInput.topic)
        }
        if (consoleInput.hasOwnProperty('fromService')) {
          state.consoleInputFrom = consoleInput.fromService
          // console.log('write body: ', consoleInput.body)
        }
        if (consoleInput.hasOwnProperty('body')) {
          state.consoleInputBody = consoleInput.body
          // console.log('write body: ', consoleInput.body)
        }
      }
    },
    setConsoleSubscribeTopic: (state, topic) => {
      state.consoleSubscribeTopic = topic
    }
  },
  actions: {
    resetLoadedUsageCaches: function (context) {
      context.commit('setSearchArea', null)
      context.commit('setSearchText', null)
      context.commit('setSearchKeywords', null)
      context.commit('setQueriedSolutions', null)
      context.commit('setConsoleOutputs', null)
      context.commit('setConsoleInput', null)
      context.commit('setConsoleSubscribeTopic', null)
    }
  }
}
