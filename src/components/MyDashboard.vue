<template>
   <div>
    <b-row align-v="center" class="at-bottombar">
      <b-col align="start">
        <h4>Dashboard</h4>
      </b-col>
      <b-col sm="auto" align="end">
        <b-button variant="info" @click="refreshDashboard()">Refresh</b-button>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
          <b-tabs card>
            <b-tab title="Layout">
              <b-row align-v="center" class="at-border" >
                <b-col align="start"> Charts </b-col>  
                <b-col sm="7" align="end"> 
                  <b-button variant="info"  @click="resetNewChart">New</b-button> 
                  <!-- v-b-toggle.collapseAddNewChart -->
                </b-col> 
              </b-row>
              <b-modal ref="requestMessageBodyWrongJsonModal" ok-only title="Failed to register new chart" >
                  The request message body is not a JSON.
              </b-modal>
              <b-modal ref="chartOptionsWrongJsonModal" ok-only title="Failed to register new chart" >
                  The chart option is not a JSON.
              </b-modal>
              <b-modal ref="responseDataFilterWrongJsonModal" ok-only title="Failed to register new chart" >
                  The response data filter is not a JSON.
              </b-modal>
              <b-modal ref="missingFieldsModal" ok-only title="Failed to register new chart" >
                  Fields can not be empty.
              </b-modal>
              <!-- <b-collapse id="collapseAddNewChart" class="mt-2 at-border"> -->
              <b-modal @ok="addNewChart" id="addNewChartModal" ref="addNewChartModalRef" :title="(editChartIndex>=0) ? 'Edit Chart': 'New Chart'" class="my-modal">
               <b-row class="mt-2" align-v="center">
                  <b-container fluid>
                    <form @submit.stop.prevent="handleAddNewChart">
                        <b-row>
                          <b-col sm="6">
                            <b-form-input v-model="newChart.ChartName" type="text" placeholder="Chart name"></b-form-input>
                          </b-col>
                          <b-col sm="6">
                            <b-form-select v-model="newChart.ChartType" :options="chartTypes"></b-form-select>
                          </b-col>
                        </b-row>
                        <b-row class="mt-1">
                          <b-col sm="6">
                            <b-form-input v-model="newChart.RequestDataTopic" type="text" placeholder="Data request topic i.e. aiot_iotdata/query"></b-form-input>  
                          </b-col>
                          <b-col sm="6"> 
                            <textarea class="at-desc-edit" v-model.lazy="newChartInput.strRequestDataMessageBody" placeholder="Data request message body in JSON. For example,
  {
      ThingId:    'XYZ',
      StartTime:  12345678,
      EndTime:    12456789
  }" 
                            />
                          </b-col>                         
                        </b-row>
                        <b-row class="mt-1">
                          <b-col sm="6">
                            <b-form-input  v-model="newChart.ResponseDataTopic" type="text" placeholder="Data response topic i.e. aiot_iotdata/response"></b-form-input>
                          </b-col>
                          <b-col sm="6"> 
                            <textarea class="at-desc-edit" v-model.lazy="newChartInput.strResponseDataFilter" placeholder="Data response message filter in JSON. 
X coordinate key must be first located, For example,
  { 
      DataList: [
        {
          TimeStamp: 0, 
          Data: {
            Sensor: 1.1
          }
      ] 
  }"
                            />
                          </b-col>                         
                        </b-row>
                        <b-row class="mt-1">
                          <b-col sm="6">
                            <b-form-input  v-model="newChart.StartKeyName" type="text" placeholder="key name for h-axis"></b-form-input>
                          </b-col>
                          <b-col sm="6">
                            <b-form-input  v-model="newChart.ContinueKeyName" type="text" placeholder="continue key name for h-axis"></b-form-input>
                          </b-col>                            
                        </b-row>  
                        <b-row class="mt-1">
                          <b-col sm="3">
                            Options
                          </b-col>
                          <b-col sm="9"> 
                            <textarea class="at-desc-edit" v-model.lazy="newChartInput.strChartOptions" placeholder="Google Chart Options. 
For example,
  {
    hAxis: { textPosition: 'none' }
  }"
                            />
                          </b-col>                         
                        </b-row>                       
                    </form>
                    <!--
                    <b-row class="mt-1">
                      <b-col align="end">
                        <b-button v-b-toggle.collapseAddNewChart>Cancel</b-button>
                        <b-button v-b-toggle.collapseAddNewChart @click="addNewChart">Add</b-button>
                      </b-col>
                    </b-row>
                    -->
                  </b-container>
                </b-row>
              <!-- </b-collapse> -->
              </b-modal>
              <b-row class="text-center mt-5" v-if="charts.length === 0">
                <b-col align="center">
                  No charts are defined yet.
                </b-col>
              </b-row>
              <b-row class="mt-1" align-v="center" v-else>
                  <b-col>
                    <b-list-group>
                      <b-list-group-item v-for="(chart, index) in charts" :key="index">
                        <b-row>
                          <b-col sm="3">
                            {{chart.ChartName}}
                          </b-col>
                          <b-col sm="3">
                            {{chart.RequestDataTopic}}
                          </b-col>
                          <b-col sm="3" align="center">
                            <h5><b-badge>{{chartTypeToText[chart.ChartType]}}</b-badge></h5>
                          </b-col>
                          <b-col sm="3" align="end">
                            <b-button variant="light" size="sm" @click="editChart(chart, index)">
                              <i class="fas fa-edit"></i>
                            </b-button>
                            <b-button variant="light" size="sm" @click="deleteChart(chart, index)">
                              <i class="fas fa-trash-alt"></i>
                            </b-button>
                          </b-col>
                        </b-row>
                      </b-list-group-item>
                    </b-list-group>
                  </b-col>
              </b-row>
            </b-tab>
            <b-tab title="Display" active>
              <div v-if="isLoading" class="mb-2">
                <b-row>
                  <b-col align="center">
                    <spinner  size="medium" />
                  </b-col>
                </b-row>
              </div>
              <div class="text-center" v-if="charts.length === 0">
                No chart is defined yet.
              </div>
              <!-- <div class="at-scroll">  -->
                  <!-- <b-card class = "mt-1" v-for="(chart, index) in charts" :key="index"
                      header = " "
                      > -->
                  <b-row class="mt-3 at-border" v-for="(chart, index) in charts" :key="index">
                    <b-col>
                      <b-row align-v="center">
                        <b-col lg="4">
                          <h5>
                            {{chart.ChartName}}
                          </h5>
                        </b-col>
                        <b-col v-if="chart.ChartData !== null && chart.ChartData.length>1">
                            <small>{{showLocalTime(chart, chart.ChartData[1][0])}}</small>
                        </b-col>                        
                        <b-col v-if="chart.ChartData !== null && chart.ChartData.length>1"> 
                          <b-button variant="light" :disabled="chart.ChartDataContinueValue===null" @click="loadMoreChart(chart)"><i class="fas fa-angle-double-right"></i></b-button>
                        </b-col>
                        <b-col v-if="chart.ChartData !== null && chart.ChartData.length>2">
                            <small>{{showLocalTime(chart, chart.ChartData[chart.ChartData.length-1][0])}}</small>
                        </b-col>                        
                        <b-col align="end"> 
                          <b-button variant="light" @click="reloadChart(chart)"><i class="fas fa-sync" style='font-size:12px'></i></b-button>
                        </b-col>
                      </b-row>

                          <!-- https://www.npmjs.com/package/vue-google-charts -->
                          <GChart
                              id="googleChart"
                              ref="googleChart"
                              :settings="{ packages: ['corechart', 'table', 'map'] }"
                              :type="chart.ChartType"
                              :data="chart.ChartData"
                              :events="chartEvents"
                              @ready="onChartReady"
                              :options="(chart.hasOwnProperty('ChartOptions')) ? chart.ChartOptions : {}"
                           />
                           <!-- :options="chart.ChartOptions" -->
                    </b-col>
                  </b-row>
                  <!-- </b-card> -->
              <!-- </div> -->
            </b-tab>
          </b-tabs>
      </b-col>
    </b-row>
  </div> 
</template>

<script>
import { GChart } from 'vue-google-charts'
import { PubSub } from 'aws-amplify'
import JSON5 from 'json5'

export default {
  name: 'myfavorites',
  components: {
    GChart
  },
  data: function () {
    return {
      loadedUserData: null,
      loadingUsers: {},
      select_options: {text: 'toggle'},
      favoriteServices: {},
      isLoading: false,
      userId: null,
      newChartInput: {
        strRequestDataMessageBody: null,
        strResponseDataFilter: null,
        strChartOptions: null
      },
      charts: [],
      newChart: null,
      editChartIndex: -1,
      newChartTemplate: {
        ChartName: null,
        ChartType: 'LineChart',
        RequestDataTopic: null,
        ReceiveDataTopic: null,
        RequestDataMessageBody: null,
        ResponseDataFilter: null,
        ChartDataSet: null,
        ChartData: [
          /*
          ['Year', 'Sales', 'Expenses', 'Profit'],
          ['2014', 1000, 400, 200],
          ['2015', 1170, 460, 250],
          ['2016', 660, 1120, 300],
          ['2017', 1030, 540, 350]
          */
        ],
        StartKeyName: null,
        ContinueKeyName: null,
        ChartDataContinueValue: null,
        ChartOptions: {
          hAxis: { textPosition: 'none' }
          /*
          chart: {
            title: 'Company Performance',
            subtitle: 'Sales, Expenses, and Profit: 2014-2017'
          } */
        }
      },
      chartTypeToText: {
        LineChart: 'Line Chart',
        ColumnChart: 'Column Chart'
      },
      chartTypes: [
          {value: 'LineChart', text: 'Line Chart'},
          {value: 'ColumnChart', text: 'Column Chart'}
      ],
      googleChart: null,
      chartEvents: {
        'select': () => {
          // handle event here
        },
        'error': (gError, google) => {
          this.googleChart.visualization.errors.removeError(gError.id)
        }
      }
    }
  },
  computed: {
  },
  watch: {
    editChartIndex: {
      handler: function (newValue) {
        console.log('editIndex: ', newValue)
      }
    },
    charts: {
        handler: function () {
          this.$forceUpdate()
        },
        deep: true
    }
  },
  async mounted () {
    // for test this.$store.dispatch('resetDashboard')
    // this.charts = this.$store.getters.charts
    // if (this.charts === null || this.charts.length === 0) {
      // TODO avoid reload everytime ?
      // this.charts = await this.$store.dispatch('getDashboard')
      this.refreshDashboard()
    // }
  },
  created () {
    // console.log('favorites created')
    this.newChart = this.newChartTemplate
    this.userId = this.$store.getters.userId
  },
  beforeDestroy () {
    // Unsubscribe client connected
    // Unsubscribe client disconnected
  },
  methods: {
    showLocalTime (chart, date) {
      /*
      let localTime = new Date(date.getTime())
      if (chart.ChartOptions.hasOwnProperty('timeZone')) {
        console.log('test time')
        localTime.setHours(localTime.getHours() + chart.ChartOptions.timeZone)
      }
      return localTime.toGMTString().substring(4).slice(0, -3) // remove GMT characters
      */
     return date.toString().substring(4, date.toString().lastIndexOf('GMT')) // .slice(0, -3)
    },
    onChartReady (chart, google) {
      // console.log('google ready: ', google)
      this.googleChart = google
    },
    resetNewChart () {
      this.newChart = this.$_.clone(this.newChartTemplate)
      console.log('resetNewChart: ', this.newChart)
      this.newChartInput.strRequestDataMessageBody = null
      this.newChartInput.strResponseDataFilter = null
      this.newChartInput.strChartOptions = JSON.stringify(this.newChart.ChartOptions)
      this.editChartIndex = -1 // means it is creating a new
      this.$refs.addNewChartModalRef.show()
    },
    async loadMoreChart (chart) {
      // console.log('loadMoreChart: ', chart)
      chart.ChartData = [] // remove the data loaded already
      if (chart.ChartDataContinueValue !== null) {
        await this.chartLoad(chart)
      }
    },
    async reloadChart (chart) {
      // console.log('reloadChart: ', chart)
      chart.ChartData = [] // remove the data loaded already
      chart.ChartDataSet = new Map() // new Set([])
      chart.ChartDataContinueValue = null
      await this.chartLoad(chart)
    },
    async chartLoad (chart) {
      let that = this
      that.isLoading = true
      // Subscribe client connected
      if (chart.hasOwnProperty('subscribe') && chart.subscribe !== null) {
        try {
          if (chart.subscribe !== null) {
            // chart.subscribe.unsubscribe()
          }
        } catch (err) {
          console.log('release subs:', err)
        }
        chart.subscribe = null
      }
      let fullTopic = 'aiot/' + this.userId + '/+/' + chart.ResponseDataTopic
      chart.subscribe = PubSub.subscribe(fullTopic).subscribe({
        next: data => {
          let responseMessage = data.value.data
          if (responseMessage.hasOwnProperty('SessionName') && responseMessage.SessionName !== chart.ChartName) {
              return
          }
          /*
          if (chart.subscribe !== null) {
            chart.subscribe.unsubscribe()
            chart.subscribe = null
          }
          */
          // console.log('chart data received: ', data)
          // console.log('Received: response:', responseMessage)
          if (typeof data.value === 'object' && data.value !== null) {
            let responseMessage = data.value.data
            /*
              "Time" : "DataList.TimeStamp",
              "Data" : "DataList..Data.WIND"

              DataList: [
                {
                  TimeStamp: 123, // The X coordinate key must put to the uppermost part of the template
                  Data: {
                    WIND: 1.1
                }
              ]
            */
            let collectedDataItems = [] // temporary data among scanning of the incomming items
            if (chart.hasOwnProperty('ContinueKeyName') && chart.ContinueKeyName !== null) {
              // console.log('response: ', responseMessage)
              if (chart.hasOwnProperty('StartKeyName') && chart.StartKeyName !== null) {
                // console.log('continue: 2 ')
                if (responseMessage.hasOwnProperty(chart.ContinueKeyName)) {
                  // console.log('continue: 3 ')
                  chart.ChartDataContinueValue = responseMessage[chart.ContinueKeyName]
                } else {
                  chart.ChartDataContinueValue = null
                }
              }
            }
            this.chartDataCollect(responseMessage, chart.ResponseDataFilter, collectedDataItems)
            // transform from intermediate data to Google Chart requred format
            // console.log('Number of newly collected data: ', collectedDataItems.length)
            let numberOfKeys = 0
            for (let item of collectedDataItems) {
              // check if the start of the row
              if (Array.isArray(chart.ChartData) === false || chart.ChartData.length === 0) {
                let newChartItem = []
                for (let key of Object.keys(item)) {
                  newChartItem.push(key)
                }
                chart.ChartData = [ newChartItem ] // Google chart format: row 0 shows the column names
                numberOfKeys = chart.ChartData[0].length
              }
              let newChartItem = []
              let keys = Object.keys(item)
              for (let key of keys) {
                let keyValue = item[key]
                if (key === 'TimeStamp') {
                  let date = new Date(item[key])
                  if (chart.ChartOptions !== null && chart.ChartOptions.hasOwnProperty('hAxis') && chart.ChartOptions.hAxis.hasOwnProperty('timeZone')) {
                    date.setHours(date.getHours() + date.getTimezoneOffset() / 60 + chart.ChartOptions.hAxis.timeZone)
                  }
                  /*
                  // Hours part from the timestamp
                  let hours = date.getHours()
                  // Minutes part from the timestamp
                  let minutes = '0' + date.getMinutes()
                  // Seconds part from the timestamp
                  let seconds = '0' + date.getSeconds()
                  // let months = date.getMonth()
                  const months = date.toLocaleString('default', { month: 'short' })
                  let days = date.getDate()
                  // Will display time in 10:30:23 format
                  let formattedTime = months + '-' + days + ',' + hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2)
                  */
                  keyValue = date // formattedTime
                }
                newChartItem.push(keyValue)
              }
              if (chart.ChartDataSet.has(item[keys[0]]) === false && newChartItem.length === numberOfKeys) {
                // for set case, chart.ChartDataSet.add(newChartItem[0])
                chart.ChartDataSet.set(item[keys[0]], newChartItem)
              }
            } // for loop
            let sortedChartData = Array.from(chart.ChartDataSet).sort()
            // console.log('chartdata: ', chart.ChartData)
            // console.log('sorted: ', sortedChartData)
            // chart.ChartData = sortedChartData
            // format is [TimeStamp, ]
            chart.ChartData = [ chart.ChartData[0] ]
            for (let chartDataTupple of sortedChartData) {
               chart.ChartData.push(chartDataTupple[1]) // Google chart format: put data from successive rows
            }
            // console.log('chartData new:', chart.ChartData)
            // console.log('chartData: ', chart.ChartData)
            // It is the responsibility of the data source to feed data completely.
            // IoT data query as an example, user modules should be placed in the middle to continue requests until completely receceving data.
          }
          that.isLoading = false
          that.$forceUpdate()
        },
        error: error => console.error('chart subscribe error: ', error),
        close: () => console.log('Done')
      })
      let requestBody = this.$_.clone(chart.RequestDataMessageBody)
      if ((chart.hasOwnProperty('ContinueKeyName') && chart.ContinueKeyName !== null) &&
          (chart.hasOwnProperty('ChartDataContinueValue') && chart.ChartDataContinueValue !== null) &&
          (chart.hasOwnProperty('StartKeyName') && chart.StartKeyName !== null)) {
          requestBody[chart.StartKeyName] = chart.ChartDataContinueValue
          // console.log('chart continue: ', chart.ChartName + ': ' + chart.ChartDataContinueValue)
      }
      requestBody.SessionName = chart.ChartName
      // console.log('request: ', requestBody)
      await PubSub.publish('aiot/' + this.userId + '/aiot_dashboard/' + chart.RequestDataTopic, requestBody)
    },
    chartDataCollect (response, filter, chartData) {
      // console.log('filter: ', filter)
      let that = this
      for (let key of Object.keys(filter)) {
        if (response.hasOwnProperty(key)) {
          if (Array.isArray(filter[key])) {
           for (let item of response[key]) {
              let newChartDataItem = []
              chartData.push(newChartDataItem)
              that.chartDataCollect(item, filter[key][0], newChartDataItem)
            }
          } else if (typeof filter[key] !== 'object') {
            let value = Number(response[key])
            chartData[key] = value
          } else { // object
            that.chartDataCollect(response[key], filter[key], chartData)
          }
        }
      }
    },
    deleteChart (chart, index) {
      if (chart.hasOwnProperty('subscribe') && chart.subscribe !== null) {
        try {
          chart.subscribe.unsubscribe()
        } catch (e) {
        }
        chart.subscribe = null
      }
      this.charts.splice(index, 1)
      this.$store.dispatch('setDashboard', this.charts)
    },
    editChart (chart, index) {
      this.newChart = this.$_.clone(chart)
      if (this.newChart.hasOwnProperty('ChartOptions') === false) {
        this.newChart.ChartOptions = this.$_.clone(this.newChartTemplate.ChartOptions)
      }
      this.editChartIndex = index
      this.newChartInput.strRequestDataMessageBody = JSON.stringify(chart.RequestDataMessageBody)
      this.newChartInput.strResponseDataFilter = JSON.stringify(chart.ResponseDataFilter)
      this.newChartInput.strChartOptions = JSON.stringify(chart.ChartOptions)
      this.$refs.addNewChartModalRef.show()
    },
    addNewChart (bvModalEvent) {
      console.log('addNewChart: ', this.newChart)
      // Prevent modal from closing
      bvModalEvent.preventDefault()
      // Trigger submit handler
      this.handleAddNewChart()
    },
    async handleAddNewChart () {
      if (this.newChart.ChartName === null || this.newChart.RequestDataTopic === null || this.newChart.ResponseDataTopic === null) {
          this.$refs.missingFieldsModal.show()
          return
      }
      if (this.newChartInput.strRequestDataMessageBody === null || this.newChartInput.strResponseDataFilter === null) {
          this.$refs.missingFieldsModal.show()
          return
      }
      try {
        this.newChart.RequestDataMessageBody = JSON5.parse(this.newChartInput.strRequestDataMessageBody)
      } catch (e) {
        this.$refs.requestMessageBodyWrongJsonModal.show()
        return
      }
      try {
        this.newChart.ResponseDataFilter = JSON5.parse(this.newChartInput.strResponseDataFilter)
      } catch (e) {
        this.$refs.responseDataFilterWrongJsonModal.show()
        return
      }
      if (this.newChartInput.strChartOptions === '' || this.newChartInput.strChartOptions === null) {
        delete this.newChart.ChartOptions
      } else {
        try {
          this.newChart.ChartOptions = JSON5.parse(this.newChartInput.strChartOptions)
        } catch (e) {
          this.$refs.chartOptionsWrongJsonModal.show()
          return
        }
      }
      console.log('addNewChart main: ', this.newChart)
      let copyOne = this.$_.clone(this.newChart)
      if (this.editChartIndex >= 0) { // means editing
        if (this.charts[this.editChartIndex].hasOwnProperty('subscribe') && this.charts[this.editChartIndex].subscribe !== null) {
          try {
            this.charts[this.editChartIndex].subscribe.unsubscribe()
          } catch (e) {}
          this.charts[this.editChartIndex].subscribe = null
        }
        console.log('chart replaced')
        this.charts[this.editChartIndex] = copyOne
      } else { // means creating new
        console.log('chart newly added: ', copyOne)
        this.charts.push(copyOne)
      }
      this.$store.dispatch('setDashboard', this.charts)
      this.reloadChart(copyOne)
      this.$forceUpdate() // to refresh new entries
      // Hide the modal manually
      this.$nextTick(() => {
        this.$refs.addNewChartModalRef.hide()
      })
    },
    async refreshDashboard () {
      this.isLoading = true
      // TBD await Applicationper.reloadCharts()
      this.isLoading = false
      // this.charts = this.$store.getters.charts
      this.charts = await this.$store.dispatch('getDashboard')
      console.log('charts: ', this.charts)
      for (let i in this.charts) {
        let chart = this.charts[i]
        this.reloadChart(chart)
      }
    }
  }
}
</script>

<style>

</style>
