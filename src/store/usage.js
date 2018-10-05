
export default {
  state: {
    searchArea: null,
    searchText: null,
    searchKeywords: null,
    solutions: null
  },

  getters: {
    searchArea: state => state.searchArea,
    searchText: state => state.searchText,
    searchKeywords: state => state.searchKeywords,
    solutions: state => state.solutions
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
    }
  },
  actions: {
  }
}
