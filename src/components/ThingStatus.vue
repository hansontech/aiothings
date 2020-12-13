<template>
  <div>
    <div>
      <b-row align-v="center" style="border-bottom: 1px solid grey; padding-bottom: 5px; margin-bottom: 5px;">
        <b-col align="start">
            <h4>IoT Device : {{thingName}}</h4>
        </b-col>
        <b-col sm="auto" align="end">
          <b-button variant="dark" @click="backHome()"><i class="fas fa-arrow-left" /></b-button>
        </b-col>
      </b-row>
      <b-tabs card>
        <!-- -- dashboard -->
        <b-tab title="State" active>
          <b-row>
            <b-col align="end"> 
              <b-button variant="light" :disabled="isUpdatingStatus" @click="$router.go() /* updateThingStatus() */"><i class="fas fa-sync" style='font-size:20px'></i></b-button>
            </b-col>
          </b-row>
          <div v-if="deviceStatus === null">
            <b-row>
              <b-col align="center">
                <spinner  size="medium" />
              </b-col>
            </b-row>
          </div>
          <div v-else>
            <b-list-group>
              <b-list-group-item v-for="(key, index) in Object.keys(deviceStatus)" :key="index">
                <b-row v-if="key === 'aiot_image'">
                  <b-col>
                    <b-img :src="imageFromBase64(deviceStatus[key])" />
                  </b-col>
                </b-row>
                <b-row v-else>
                  <b-col>
                    {{key}}
                  </b-col>
                  <b-col>
                    <!--
                    {{JSON.stringify(deviceStatus[key], undefined, 4)}}
                    <pre :id="'status_' + key"></pre>
                    {{syntaxHighlight(deviceStatus[key])}}
                    -->
                    {{deviceStatus[key]}}
                  </b-col>
                </b-row>
              </b-list-group-item>    
            </b-list-group>
          </div>
        </b-tab>
        <b-tab title="IoT Data" @click="startIoTDataDashboard()">
          <b-row class="mt-2">
            <b-col align="center">
              <b-form-group>
                <b-form-radio-group
                  id="chart-interval-radio-options"
                  v-model="chartInterval"
                  name="chart-interval-radio-options"
                >
                  <b-form-radio value="Day">Day</b-form-radio>
                  <b-form-radio value="Week">Week</b-form-radio>
                  <b-form-radio value="Month">Month</b-form-radio>
                  <b-form-radio value="Year">Year</b-form-radio>
                </b-form-radio-group>
              </b-form-group>
            </b-col>
          </b-row>
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
          <!-- <div class="at-scroll"> -->
              <!-- <b-card class = "mt-1" v-for="(chart, index) in charts" :key="index"
                  header = " "
                  > -->
              <div class="mt-1" v-for="(chart, index) in charts" :key="index">
                  <b-row align-v="center">
                    <b-col lg="2">
                      <h5>
                        <!-- {{chart.ChartName}}  -->
                      </h5>
                    </b-col>
                    <b-col >
                        <small v-if="chart.ChartData !== null && chart.ChartData.length>1">{{showLocalTime(chart, chart.ChartData[1][0])}}</small>
                    </b-col>                        
                    <b-col > 
                      <b-button v-if="isLoading === false" variant="light" :disabled="chart.ChartDataContinueValue===null" @click="loadMoreChart(chart)"><i class="fas fa-angle-double-right"></i></b-button>
                    </b-col>
                    <b-col >
                        <small v-if="chart.ChartData !== null && chart.ChartData.length>2">{{showLocalTime(chart, chart.ChartData[chart.ChartData.length-1][0])}}</small>
                    </b-col>                        
                    <b-col align="end"> 
                      <b-button variant="light" @click="reloadChart(chart)"><i class="fas fa-sync" style='font-size:20px'></i></b-button>
                    </b-col>
                  </b-row>
                  <b-row v-for="(chartData, index) in chart.ChartDataSplits" :key="index">
                    <b-col>
                      <!-- https://www.npmjs.com/package/vue-google-charts -->
                      <GChart
                          id="googleChart"
                          ref="googleChart"
                          :settings="{ packages: ['corechart', 'table', 'map'] }"
                          :type="chart.ChartType"
                          :data="chartData"
                          :events="chartEvents"
                          @ready="onChartReady"
                          :options="(chart.hasOwnProperty('ChartOptions')) ? chart.ChartOptions : {}"
                        />
                        <!-- :options="chart.ChartOptions" -->
                    </b-col>
                  </b-row>
              </div>
              <!-- </b-card> -->
          <!-- </div> -->
        </b-tab>
      </b-tabs>
      <b-row class="mt-3">
      </b-row>
    </div>
  </div>
 </template>

<script>

import { PubSub, API } from 'aws-amplify'
// -- dashboard
import { GChart } from 'vue-google-charts'
// import { PubSub } from 'aws-amplify'
import JSON5 from 'json5'

export default {
  name: 'device',
  props: ['thingBody', 'thingIndex'], // VUE reference https://router.vuejs.org/guide/essentials/passing-props.html
  components: {
    GChart
  },
  data: function () {
    return {
      // -- dashboard
      chartInterval: 'Day',
      isLoading: false,
      isUpdatingStatus: false,
      chartSubscribe: null,
      thingStatusSubscribe: null,
      deviceStatus: null,
      charts: [],
      newChart: null,
      newChartTemplate: {
        ChartName: null,
        ChartType: 'LineChart',
        RequestDataTopic: 'aiot_iotdata/query',
        ResponseDataTopic: 'aiot_iotdata/response',
        RequestDataMessageBody: {
          ThingId: null,
          // - LimitPerReturn: 720,
          ScanForward: false,
          Interval: 'Day'
        },
        ResponseDataFilter: {
          DataList: [ { TimeStamp: 123, Data: {HUM: 1.1} } ]
        },
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
        StartKeyName: 'StartTime',
        ContinueKeyName: 'ContinueTime',
        ChartDataContinueValue: null,
        ChartOptions: {
          legend: {
            position: 'bottom'
          },
          hAxis: {
            format: 'HH:mm',
            gridlines: {count: 7}
          }
          // textPosition: 'none',
        }
      },
      chartEvents: {
        'select': () => {
          // handle event here
        },
        'error': (gError, google) => {
          this.googleChart.visualization.errors.removeError(gError.id)
        }
      },
      // --
      thing: {},
      isDownloading: false,
      thingDesc: null,
      thingName: null
    }
  },
  computed: {
  },
  async created () {
  },
  beforeDestroy () {
    /*
    for (let chart of this.charts) {
      if (chart.hasOwnProperty('subscribe') === true && chart.subscribe !== null) {
        chart.subscribe.unsubscribe()
        delete chart.subscribe
      }
    }
    */
    if (this.chartSubscribe !== null) {
      this.chartSubscribe.unsubscribe()
    }
    if (this.thingStatusSubscribe !== null) {
      this.thingStatusSubscribe.unsubscribe()
    }
  },
  async mounted () {
    await this.reloadThing()
    // -- dashboard
    let chart = this.$_.clone(this.newChartTemplate)
    this.charts = []
    this.charts.push(chart)
    chart.ChartName = this.thing.ThingName
    chart.RequestDataMessageBody.ThingId = this.thing.ThingId
    if (this.thing.hasOwnProperty('ThingTimeZone')) {
      chart.ChartOptions.hAxis.timeZone = this.thing.ThingTimeZone // number +X, or -X of GMT+X
    }
    /*
    let that = this
      setTimeout(async function () {
        that.refreshDashboard()
      }, 1000)
    */
    // this.refreshDashboard()

    // Publish client alive-req, wait for alive-resp
    let that = this
    setTimeout(async function () {
      await that.updateThingStatus()
    }, 300)
  },
  watch: {
    /* right way to force rendering (refresh)
      1. watch the data variable
      2. use this.$set or this.$delete to give chance to VUE to watch
      3. put $forceUpdate()
    */
    chartInterval: {
      handler: function (newInterval, oldInterval) {
        if (newInterval !== oldInterval) {
          let hAxis = null
          // https://developers.google.com/chart/interactive/docs/datesandtimes
          switch (newInterval) {
            case 'Day':
              hAxis = {
                format: 'HH:mm',
                gridlines: {count: 6}
              }
              break
            case 'Week':
              hAxis = {
                format: 'M/d',
                gridlines: {count: 5}
              }
              // hFormat = 'M/d HH'
              break
            case 'Month':
              hAxis = {
                format: 'M/d',
                gridlines: {count: 10}
              }
              break
            case 'Year':
              hAxis = {
                format: 'MMM/yy',
                gridlines: {count: 5}
              }
              break
          }
          this.newChartTemplate.ChartOptions.hAxis = hAxis
          this.refreshDashboard()
        }
      }
    }
   },
  methods: {
    syntaxHighlight (json) {
      if (typeof json != 'string') {
          json = JSON.stringify(json, undefined, 2);
      }
      json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
          var cls = 'number';
          if (/^"/.test(match)) {
              if (/:$/.test(match)) {
                  cls = 'key';
              } else {
                  cls = 'string';
              }
          } else if (/true|false/.test(match)) {
              cls = 'boolean';
          } else if (/null/.test(match)) {
              cls = 'null';
          }
          match = match.replace(/\"/g, '');
          return '<span class="' + cls + '">' + match + '</span>';
      });
    }, 
    imageFromBase64 (imageBase64) {
      return 'data:image/jpeg;base64,' + imageBase64
    },
    async reloadThing () {
      if (this.thingIndex >= 0) {
        let index = this.thingIndex
        this.thing = this.$store.getters.things[index]
      } else {
        this.thing = this.thingBody
      }
      this.thingDesc = this.thing.ThingDesc
      this.thingName = this.thing.ThingName
    },
    returnCancel () {
      this.$refs.modalReturnConfirmRef.hide()
    },
    backHome () {
      this.$router.go(-1)
    },
    // -- dashboard parts
    startIoTDataDashboard () {
      if (this.chartSubscribe === null) {
        this.refreshDashboard()
      }
    },
    showLocalTime (chart, date) {
      let localTime = date // new Date(date.getTime())
      /*
      try {
        localTime.setHours(localTime.getHours() + chart.ChartOptions.hAxis.timeZone)
      } catch (err) {
        // do nothing
      }
      */
      // return localTime.toUTCString().substring(4).slice(0, -3) // remove GMT characters
      return localTime.toString().substring(4, localTime.toString().lastIndexOf('GMT')) // .slice(0, -3)
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
      let fullTopic = 'aiot/' + this.thing.UserId + '/+/' + chart.ResponseDataTopic
      console.log('subscribe topic: ', fullTopic)
      if (this.chartSubscribe !== null) {
        console.log('reuse subscribe')
        // chart.subscribe.unsubscribe()
        // do nothing
      } else {
        console.log('create subscribe')
        this.chartSubscribe = PubSub.subscribe(fullTopic).subscribe({
          next: data => {
            console.log('data received')
            if (data.value.hasOwnProperty('error')) {
              // TODO should consider check the session name for the error
              console.log('error received: ', data.value.error)
              that.isLoading = false
              that.$forceUpdate()
              return
            }
            let responseMessage = data.value.data
            if (responseMessage.hasOwnProperty('SessionName') && responseMessage.SessionName !== chart.ChartName) {
                return
            }
            if (typeof data.value === 'object' && data.value !== null) {
              let responseMessage = data.value.data
              let collectedDataItems = [] // temporary data among scanning of the incomming items
              if (chart.hasOwnProperty('ContinueKeyName') && chart.ContinueKeyName !== null) {
                if (chart.hasOwnProperty('StartKeyName') && chart.StartKeyName !== null) {
                  if (responseMessage.hasOwnProperty(chart.ContinueKeyName)) {
                    chart.ChartDataContinueValue = responseMessage[chart.ContinueKeyName]
                  } else {
                    // the value is pre assigned when subscribing, and will be used when loadMore is called.
                    // chart.ChartDataContinueValue = null
                  }
                }
              }
              this.chartDataCollect(responseMessage, collectedDataItems)
              // transform from intermediate data to Google Chart requred format
              // console.log('Number of newly collected data: ', collectedDataItems)
              if (collectedDataItems.length > 0) {
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
                      if (this.thing.hasOwnProperty('ThingTimeZone')) {
                        date.setHours(date.getHours() + date.getTimezoneOffset() / 60 + this.thing.ThingTimeZone) // number +X, or -X of GMT+X
                      }
                      // date.setHours(date.getHours() - date.getTimezoneOffset() + chart.ChartOptions.hAxis.timeZone)
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

                chart.ChartDataSplits = []
                for (let i = 1; i <= (Object.keys(chart.ChartData[0]).length - 1); i++) {
                  chart.ChartDataSplits.push([])
                }
                for (let chartRow of chart.ChartData) {
                  for (let i = 1; i <= (chartRow.length - 1); i++) {
                    let splitChartColRow = []
                    splitChartColRow.push(chartRow[0])
                    splitChartColRow.push(chartRow[i])
                    if (chart.ChartDataSplits[i - 1] !== undefined) {
                      chart.ChartDataSplits[i - 1].push(splitChartColRow)
                    }
                  }
                }
                // console.log('chartDataSplit new:', chart.ChartDataSplits[0])
                // console.log('chartData: ', chart.ChartData)
                // It is the responsibility of the data source to feed data completely.
                // IoT data query as an example, user modules should be placed in the middle to continue requests until completely receceving data.
              } // if collected items > 0
            }
            that.isLoading = false
            that.$forceUpdate()
          },
          error: error => console.error('chart subscribe error: ', error),
          close: () => console.log('Done')
        })
      } // end of if else

      let requestBody = this.$_.clone(chart.RequestDataMessageBody)
      if ((chart.hasOwnProperty('ContinueKeyName') && chart.ContinueKeyName !== null) &&
          (chart.hasOwnProperty('ChartDataContinueValue') && chart.ChartDataContinueValue !== null) &&
          (chart.hasOwnProperty('StartKeyName') && chart.StartKeyName !== null)) {
          requestBody[chart.StartKeyName] = chart.ChartDataContinueValue
          // console.log('chart continue: ', chart.ChartName + ': ' + chart.ChartDataContinueValue)
      }
      requestBody.Interval = this.chartInterval
      requestBody.SessionName = chart.ChartName

      let currentTime = new Date().getTime()
      let intervalInTime = ((24 * 60 * 60) * 1000) // day
      switch (requestBody.Interval) {
      case 'Day':
        break
      case 'Week':
        intervalInTime = intervalInTime * 7
        break
      case 'Month':
        intervalInTime = intervalInTime * 30
        break
      case 'Year':
        intervalInTime = intervalInTime * 365
        break
      }
      if (requestBody.hasOwnProperty(chart.StartKeyName)) {
        requestBody.EndTime = requestBody[chart.StartKeyName] - intervalInTime
      } else {
        requestBody.EndTime = currentTime - intervalInTime
      }
      chart.ChartDataContinueValue = requestBody.EndTime
      /*
      setTimeout(async function () {
        await PubSub.publish('aiot/' + that.thing.UserId + '/aiot_dashboard/' + chart.RequestDataTopic, requestBody)
        console.log('publishing..')
      }, 5000)
      */
      await PubSub.publish('aiot/' + this.thing.UserId + '/aiot_dashboard/' + chart.RequestDataTopic, requestBody)
    },
    chartDataCollect (response, chartData) {
      // console.log('filter: ', filter)
      let that = this
      for (let key of Object.keys(response)) {
        if (response.hasOwnProperty(key)) {
          if (Array.isArray(response[key])) {
           for (let item of response[key]) {
              let newChartDataItem = []
              chartData.push(newChartDataItem)
              that.chartDataCollect(item, newChartDataItem)
            }
          } else if (typeof response[key] === 'object') {
            that.chartDataCollect(response[key], chartData)
          } else if (isNaN(response[key]) === false) {
            let value = Number(response[key])
            chartData[key] = value
          }
        }
      }
    },
    deviceStatusCollect (response, chartData) {
      // console.log('filter: ', filter)
      let that = this
      for (let key of Object.keys(response)) {
        if (response.hasOwnProperty(key)) {
          if (Array.isArray(response[key])) {
           for (let item of response[key]) {
              let newChartDataItem = []
              chartData.push(newChartDataItem)
              that.deviceStatusCollect(item, newChartDataItem)
            }
          } else if (typeof response[key] === 'object') {
            that.deviceStatusCollect(response[key], chartData)
          } else if (isNaN(response[key]) === false) {
            let value = Number(response[key])
            chartData[key] = value
          } else {
            chartData[key] = response[key]
          }
        }
      }
    },
    async loadThingStatus () {
      console.log('thing: ', this.thing.ThingId)
      const shadow = await API.get('thingApi', '/things', {
            'queryStringParameters': {
                'userId': this.thing.UserId,
                'certId': this.thing.CertId,
                'thingId': this.thing.ThingId,
                'thingName': this.thing.ThingId,
                'command': 'get_properties'
            }
      })
      if (shadow.hasOwnProperty('state') && shadow.state.hasOwnProperty('reported')) {
        console.log('loadThingStatus: ', shadow.state.reported)
        this.retrieveDeviceStatusData(shadow.state.reported)
      } else {
        this.deviceStatus = {}
      }
      this.isUpdatingStatus = false
      this.$forceUpdate()
    },
    retrieveDeviceStatusData (responseMessage) {
      let that = this
      let collectedDataItems = {}
      that.deviceStatusCollect(responseMessage, collectedDataItems)
      if (that.deviceStatus === null) {
        that.deviceStatus = {}
      }
      for (let key of Object.keys(collectedDataItems)) {
        that.deviceStatus[key] = collectedDataItems[key]
      }
      /*
      that.$forceUpdate()
      let docStatus = document.getElementById('status')
      console.log('docStatus: ', that.deviceStatus)
      docStatus.innerHTML = that.syntaxHighlight(that.deviceStatus)
      for (let key of Object.keys(that.deviceStatus)) {
        if (key !== 'aiot_image') {
          let docStatus = document.getElementById('status_' + key)
          docStatus.innerHTML = that.syntaxHighlight(that.deviceStatus[key])
        }
      }
      */
      // that.isUpdatingStatus = false
      that.$forceUpdate()
    },
    async updateThingStatus () {
      let that = this
      that.isUpdatingStatus = true
      await this.loadThingStatus()
      let timer = setInterval(async function () {
          that.isUpdatingStatus = false
          that.$forceUpdate()
          clearInterval(timer)
      }, 10000) // in ms, run every 6 seconds
      // this.deviceStatus = null
      if (this.thingStatusSubscribe === null) {
        this.thingStatusSubscribe = PubSub.subscribe('aiot/' + this.thing.UserId + '/' + this.thing.ThingId + '/aiot_device/response').subscribe({
          next: data => {
            console.log('data received:')
            if (typeof data.value === 'object' && data.value !== null) {
              let responseMessage = data.value
              that.retrieveDeviceStatusData(responseMessage)
            }
          },
          error: error => console.error(error),
          close: () => console.log('Done')
        })
      }
      await PubSub.publish('aiot/' + that.thing.ThingId + '/aiot_device/request', { command: 'status' })
    },
    deleteChart (chart, index) {
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
      this.reloadChart(this.charts[0])
    }
  }
}
</script>
<style>

.at-code {
    white-space: pre-wrap;
    background: hsl(30,80%,90%);
}

.at-scroll {
  /* height : 500px ; */
  overflow-y: scroll; /* auto */
  max-height: 60%;
}

.my-modal .modal-body {
  max-height: 70vh; /* max 70% of the viewport height */
  overflow-y: auto;
}

</style>
