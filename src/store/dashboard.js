import { Storage } from 'aws-amplify'
import {_} from 'vue-underscore'

export default {
  state: {
    charts: null
  },
  getters: {
    charts: state => {
      if (state.charts === null) {
        return []
      } else {
        return state.charts
      }
    }
   },
  mutations: {
    setDashboard: (state, charts) => {
      state.charts = charts
    },
    setCharts: (state, charts) => {
      state.charts = charts
    }
  },
  actions: {
    resetDashboard: function (context) {
      context.commit('setCharts', null)
    },
    setDashboard: function (context, charts) {
      context.commit('setDashboard', charts)
      let templateCharts = []
      for (let chart of charts) {
        templateCharts.push(_.omit(chart, ['ChartData', 'ChartDataSet', 'subscribe', 'ChartDataContinueValue']))
      }
      let fileName = '.' + context.getters.userId + '/.aiothings/dashboard.def'
      Storage.put(fileName, JSON.stringify(templateCharts), {
          level: 'private',
          contentType: 'application/json'
      })
      .then(result => {
        console.log(result)
      })
      .catch(err => {
        console.log('storage put error: ', err)
      })
    },
    getDashboard: async function (context) {
      console.log('getDashboard')
      // let charts = context.getters.charts
      // console.log('charts: ', charts)
      // if (charts === null || (Array.isArray(charts) && charts.length === 0)) {
        let charts = []
        try {
          let fileName = '.' + context.getters.userId + '/.aiothings/dashboard.def'
          let resultUrl = await Storage.get(fileName, { level: 'private' })
          let dataResponse = await fetch(resultUrl)
           let dataStr = await dataResponse.text()
          charts = JSON.parse(dataStr)
          // console.log('charts ===> ', charts)
          context.dispatch('setDashboard', charts)
        } catch (err) {
          console.error(err)
        }
      // }
      return charts
    }
  }
}
