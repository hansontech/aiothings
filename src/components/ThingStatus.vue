<template>
  <div>
    <div v-bind:titleString="changeTitle()">
      <b-modal id="modalReturnConfirm"
             hide-header
             ref="modalReturnConfirmRef"
             @ok="returnDiscardChangesOk"
             @cancel="returnCancel">
             <h5>Discard changes and return?</h5>
      </b-modal>
      <b-row align-v="center" style="border-bottom: 1px solid grey; padding-bottom: 5px; margin-bottom: 5px;">
        <b-col align="start">
            <h4>IoT Device : {{thingName}}</h4>
        </b-col>
        <b-col sm="auto" align="end">
          <b-button variant="dark" @click="backHome()">Return<sub><b-badge class="ml-1" variant="warning" v-if="isChangedNotSaved">&nbsp;</b-badge></sub></b-button>
        </b-col>
      </b-row>
      <spinner v-if="isDeploying === true" size="medium" />
      <!-- 
      <b-row align-v="center" class="mt-3">
        <b-col sm align="start">
          <h4 style="display: inline;" class="mr-0">Thing Name: &ensp;</h4> 
          <h5 v-if="isShowEdit === false" style="display: inline;">{{thingName}} </h5>
          <b-form-input v-if="isShowEdit === true" class="at-border" v-model="thingName" placeholder="Thing name"></b-form-input>
        </b-col>
      </b-row>
      -->
      <b-tabs card>
        <!-- -- dashboard -->
        <b-tab title="State" active>
          <b-row>
            <b-col align="end"> 
              <b-button variant="light" @click="updateThingStatus()"><i class="fas fa-sync" style='font-size:20px'></i></b-button>
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
                <b-row>
                  <b-col>
                    {{key}}
                  </b-col>
                  <b-col>
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

import { API, Storage, PubSub } from 'aws-amplify'
import atHelper from '../aiot-helper'
import config from '../config'
// -- dashboard
import { GChart } from 'vue-google-charts'
// import { PubSub } from 'aws-amplify'
import JSON5 from 'json5'

export default {
  name: 'device',
  props: ['thingIndex'], // VUE reference https://router.vuejs.org/guide/essentials/passing-props.html
  components: {
    GChart
  },
  data: function () {
    return {
      // -- dashboard
      chartInterval: 'Day',
      isLoading: false,
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
          LimitPerReturn: 720,
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
      /* edgeResources: [], */
      errorMessage: {header: '', message: ''},
      funcFilterString: '',
      thingBackup: null,
      isChangedNotSaved: false,
      isDownloading: false,
      isEdgeUpdating: false,
      isDeploying: false,
      isEditDesc: true,
      thingDesc: null,
      thingName: null,
      isShowEdit: false,
      testList: {},
      cboxColor: 'blue',
      initialGgLocalDeviceResource: {
          Id: null, // 'STRING_VALUE'
          Name: null, // 'STRING_VALUE'
          ResourceDataContainer: {
            LocalDeviceResourceData: {
              GroupOwnerSetting: {
                AutoAddGroupOwner: true, // Automatically add OS group permissions of the Linux group that owns the resource
                GroupOwner: null // ignored if AutoAddGroupOwner is true
              },
              SourcePath: null // 'STRING_VALUE'
            }
          }
      },
      initialGgLocalVolumeResource: {
          Id: null, // 'STRING_VALUE'
          Name: null, // 'STRING_VALUE'
          ResourceDataContainer: {
            LocalVolumeResourceData: {
              DestinationPath: null, // 'STRING_VALUE',
              GroupOwnerSetting: {
                AutoAddGroupOwner: true, // Automatically add OS group permissions of the Linux group that owns the resource
                GroupOwner: null // ignored if AutoAddGroupOwner is true
              },
              SourcePath: null // 'STRING_VALUE'
            }
          }
      },
      initialGgS3MachineLearningResource: {
          Id: null, // 'STRING_VALUE'
          Name: null, // 'STRING_VALUE'
          ResourceDataContainer: {
            S3MachineLearningModelResourceData: {
              DestinationPath: null, // 'STRING_VALUE',
              S3Uri: null // 'STRING_VALUE'
            }
          }
      },
      initialGgLSageMakerMachineLearningResource: {
          Id: null, // 'STRING_VALUE'
          Name: null, // 'STRING_VALUE'
          ResourceDataContainer: {
            SageMakerMachineLearningModelResourceData: {
              DestinationPath: null, // 'STRING_VALUE',
              SageMakerJobArn: null // 'STRING_VALUE'
            }
          }
      },
      initialGgSecretResource: {
          Id: null, // 'STRING_VALUE'
          Name: null, // 'STRING_VALUE'
          ResourceDataContainer: {
            SecretsManagerSecretResourceData: {
              ARN: 'STRING_VALUE',
              AdditionalStagingLabelsToDownload: [
                // 'STRING_VALUE',
                /* more items */
              ]
            }
          }
      },
      initialGgMLConnector: {
          ConnectorArn: null, // 'STRING_VALUE'
          Id: null, // 'STRING_VALUE'
          Parameters: {
            MLModelDestinationPath: null, // "/path-to-model",
            MLModelResourceId: null, // "my-ml-resource",
            // MLModelSageMakerJobArn: "arn:aws:sagemaker:uswest-2:123456789012:training-job:MyImageClassifier",
            LocalInferenceServiceName: null, // "imageClassification",
            LocalInferenceServiceTimeoutSeconds: '10',
            LocalInferenceServiceMemoryLimitKB: '500000',
            GPUAcceleration: 'CPU'
          }
      },
      initialGgModbusConnector: {
          ConnectorArn: null, // 'STRING_VALUE'
          Id: null, // 'STRING_VALUE'
          Parameters: {
            'ModbusSerialDevice-ResourceId': null, // "MyLocalModbusSerialPort",
            ModbusSerialDevice: null // "/path-to-port"
          }
      },
      initialGgRaspPiGpioConnector: {
          ConnectorArn: null, // 'STRING_VALUE'
          Id: null, // 'STRING_VALUE'
          Parameters: {
            'GpioMem-ResourceId': null, // "my-gpio-resource",
            'InputGpios': '5,6U,7D',
            'InputPollPeriod': 50,
            'OutputGpios': '8H,9,27L'
          }
      },
      initialGgFunction: {
            FunctionArn: null,
            FunctionConfiguration: {
              EncodingType: 'json',
              Environment: {
                AccessSysfs: true, // only if GreengrassContainer // true only when set GreengrassContainer,
                Execution: {
                  IsolationMode: 'GreengrassContainer' // GreengrassContainer | NoContainer
                  /*
                  ,
                  RunAs: {
                    Gid: 0,
                    Uid: 0
                  }
                  */
                },
                ResourceAccessPolicies: [
                  /*
                  {
                    Permission: 'rw',
                    ResourceId: 'STRING_VALUE'
                  }
                  more items
                  */
                ],
                Variables: {
                  /* '<__string>': 'STRING_VALUE',
                  '<__string>': ... */
                  'AIOT_RUN_FROM_EDGE': 'true',
                  EDGE_THING_ID: ' '
                }
              },
              // ExecArgs: 'STRING_VALUE',
              // Executable: 'STRING_VALUE',

              MemorySize: 64000, // only available when GreengrassContainer is set. 16M works, in KB // 16K was not enough.
              Pinned: true, // Pinned means the function is long-lived and starts when the core starts.
              Timeout: 20 // in seconds
            },
            Id: null // 'STRING_VALUE'
      },
      ggMLConnector: {},
      ggModbusConnector: {},
      ggRaspPiGpioConnector: {},
      ggLocalVolumeResource: {},
      ggLocalDeviceResource: {},
      ggS3BucketName: 'aiot-greengrass-bucket',
      ggMLResource: {},
      ggFunction: {},
      ggFunctionResourceId: null,
      services: [],
      favoriteServices: [],
      connectors: [
        {ConnectorName: 'Image Classification ARMv7', ARN: 'arn:aws:greengrass:' + config.awsRegion + '::/connectors/ImageClassificationARMv7/versions/1', cardColor: 'DeepSkyBlue'},
        {ConnectorName: 'Image Classification Aarch64 JTX2', ARN: 'arn:aws:greengrass:' + config.awsRegion + '::/connectors/ImageClassificationAarch64JTX2/versions/1', cardColor: 'DodgerBlue'},
        {ConnectorName: 'Image Classification x86_64', ARN: 'arn:aws:greengrass:' + config.awsRegion + '::/connectors/ImageClassificationx86-64/versions/1', cardColor: 'CornflowerBlue'},
        // {ConnectorName: 'Kinesis Firehose', ARN: 'arn:aws:greengrass:' + config.awsRegion + '::/connectors/KinesisFirehose/versions/1', cardColor: 'Khaki'},
        {ConnectorName: 'Modbus-RTU Protocol Adapter', ARN: 'arn:aws:greengrass:' + config.awsRegion + '::/connectors/ModbusRTUProtocolAdapter/versions/1', cardColor: 'DarkCyan'},
        // {ConnectorName: 'Twilio Notifications', ARN: 'arn:aws:greengrass:' + config.awsRegion + '::/connectors/TwilioNotifications/versions/1', cardColor: 'Gold'},
        {ConnectorName: 'Raspberry Pi GPIO', ARN: 'arn:aws:greengrass:' + config.awsRegion + '::/connectors/RaspberryPiGPIO/versions/1', cardColor: 'MediumOrchid'}
      ],
      resources: [
        // https://www.quackit.com/css/css_color_codes.cfm
        {ResourceType: 'Local Volume', cardColor: 'MediumSeaGreen'},
        {ResourceType: 'Local Device', cardColor: 'LightSkyBlue'},
        {ResourceType: 'Machine Learning', cardColor: 'SandyBrown'}
        ],
      mlResourceModelFile: null,
      localInferenceServiceName: null,
      mlModelDestPath: null,
      initialFunctionDefinition: {
        // No Arn field, means newly created definition
        CreationTimestamp: '0',
        Definition: {
          DefaultConfig: {
            /*
            Execution: {
              IsolationMode: 'NoContainer', // 'GreengrassContainer'
              RunAs: {
                    Gid: '0',
                    Uid: '0'
              }
            }
            */
          },
          Functions: []
        }
      },
      initialResourceDefinition: {
        // No Arn field, means newly created definition
        CreationTimestamp: '0',
        Definition: {
          Resources: []
        }
      },
      initialConnectorDefinition: {
        // No Arn field, means newly created definition
        CreationTimestamp: '0',
        Definition: {
          Connectors: []
        }
      },
      initialSubscriotionDefinition: {
        // No Arn field, means newly created definition
        CreationTimestamp: '0',
        Subscriptions: [
          {
            Id: 'CloudToEdge',
            Source: 'cloud',
            Subject: '#',
            Target: 'GGShadowService'
          },
          {
            Id: 'EdgeToCloud',
            Source: 'GGShadowService',
            Subject: '#',
            Target: 'cloud'
          },
          {
            Id: 'EdgeToEdge',
            Source: 'GGShadowService',
            Subject: '#',
            Target: 'GGShadowService'
          }
        ]
      },
      initialEdgeDefinition: {
        // Core Definition will be created by backend
        // Group Definition will be created by backend
        subscriptionDefinition: {
          // No Arn field, means newly created definition
          CreationTimestamp: '0',
          // No SubscriptionDefinitionId field for new definition
          Definition: {
            Subscriptions: [
              {
                Id: 'CloudToEdge',
                Source: 'cloud',
                Subject: '#',
                Target: 'GGShadowService'
              },
              {
                Id: 'EdgeToCloud',
                Source: 'GGShadowService',
                Subject: '#',
                Target: 'cloud'
              },
              {
                Id: 'EdgeToEdge',
                Source: 'GGShadowService',
                Subject: '#',
                Target: 'GGShadowService'
              }
            ]
          }
        }
      }
    }
  },
  computed: {
    edgeFunctions () {
      if (this.thing !== null && this.thing.EdgeDefinition !== undefined && this.thing.EdgeDefinition.functionDefinition !== undefined) {
        return this.thing.EdgeDefinition.functionDefinition.Definition.Functions
      } else {
        return []
      }
    },
    edgeConnectors () {
      if (this.thing != null && this.thing.EdgeDefinition !== undefined && this.thing.EdgeDefinition.connectorDefinition !== undefined) {
        return this.thing.EdgeDefinition.connectorDefinition.Definition.Connectors
      } else {
        return []
      }
    },
    edgeResources () {
       if (this.thing !== null && this.thing.hasOwnProperty('EdgeDefinition') && this.thing.EdgeDefinition.resourceDefinition !== undefined) {
        return this.thing.EdgeDefinition.resourceDefinition.Definition.Resources
      } else {
        return []
      }
    },
    unselectedEdgeFunctionResources () {
      let unselectedList = []
      for (let edgeResource of this.edgeResources) {
        let isFound = false
        if (this.ggFunction.FunctionConfiguration.Environment.ResourceAccessPolicies !== undefined) {
          for (let resourceAccessPolicy of this.ggFunction.FunctionConfiguration.Environment.ResourceAccessPolicies) {
            if (resourceAccessPolicy.ResourceId === edgeResource.Id) {
              isFound = true
            }
          }
        }
        if (isFound === false) {
          unselectedList.push(edgeResource)
        }
      }
      return unselectedList
    },
    unselectedConnectors () {
      let unselectedList = []
      for (let connector of this.connectors) {
        if (this.edgeConnectors.includes(connector) === false) {
          unselectedList.push(connector)
        }
      }
      return unselectedList
    },
    unselectedMicroservices () {
      let selectedSet = new Set()
      for (let edgeFunction of this.edgeFunctions) {
        selectedSet.add(this.edgeFunctionArnToName(edgeFunction).toLowerCase())
      }
      let unselectedServices = this.services.filter(service => {
        let serviceName = service.ServiceName.toLowerCase()
        let result = serviceName.includes(this.funcFilterString.toLowerCase()) &&
                      (selectedSet.has(service.ServiceName.toLowerCase()) === false)
        return result
      })
      unselectedServices.sort(function (a, b) {
        return a.ServiceName.localeCompare(b.ServiceName)
      })
      return unselectedServices
    },
    unselectedFavorites () {
      let selectedSet = new Set()
      for (let edgeFunction of this.edgeFunctions) {
        selectedSet.add(this.edgeFunctionArnToName(edgeFunction).toLowerCase())
      }
      let unselectedServices = this.favoriteServices.filter(service => {
        let serviceName = service.ServiceName.toLowerCase()
        let result = serviceName.includes(this.funcFilterString.toLowerCase()) &&
                      (selectedSet.has(service.ServiceName.toLowerCase()) === false)
        return result
      })
      unselectedServices.sort(function (a, b) {
        return a.ServiceName.localeCompare(b.ServiceName)
      })
      return unselectedServices
    },
    ggMLResourceModelFileName () {
      let uri = this.ggMLResource.ResourceDataContainer.S3MachineLearningModelResourceData.S3Uri
      if (uri) {
        let fileName = uri.split(config.awsGreengrassBucket + '/public/' + this.thing.UserId + '_')[1]
        return fileName
      } else {
        return null
      }
    },
    isEdgeAbleToDelete () {
      if (this.thing.hasOwnProperty('EdgeData')) {
        let edgeData = this.thing.EdgeData
        if (edgeData.ggFunction === undefined && edgeData.ggResource === undefined) {
          return true
        }
      }
      return false
    },
    isEdgeAbleToDeploy () {
      if (this.thing.hasOwnProperty('EdgeData') && this.isEdgeAbleToDelete === false) {
        return true
      }
      return false
    }
  },
  async created () {
    this.ggMLConnector = this.initialGgMLConnector
    this.ggModbusConnector = this.initialGgModbusConnector
    this.ggRaspPiGpioConnector = this.initialGgRaspPiGpioConnector
    this.ggFunction = this.initialGgFunction
    this.ggLocalDeviceResource = this.initialGgLocalDeviceResource
    this.ggLocalVolumeResource = this.initialGgLocalVolumeResource
    this.ggMLResource = this.initialGgS3MachineLearningResource
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
    console.log('thing status: ')
    // this.services = this.$store.getters.mservices
    if (this.services === null) {
      await atHelper.reloadServices()
      this.services = this.$store.getters.mservices
    }
    this.favoriteServices = this.$store.getters.favoriteMservices
    if (this.favoriteServices === null) {
      await atHelper.reloadFavoriteServices()
      this.favoriteServices = this.$store.getters.favoriteMservices
    }
    this.isEditDesc = false

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
                gridlines: {count: 7}
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
                gridlines: {count: 6}
              }
              break
          }
          this.newChartTemplate.ChartOptions.hAxis = hAxis
          this.refreshDashboard()
        }
      }
    },
    thing: {
      handler: function (newThing) {
        if (this.thingBackup !== null) {
          let compareOld = this.$_.omit(this.thingBackup, ['edgeData'])
          let compareNew = this.$_.omit(newThing, ['edgeData'])
          let isEqual = this.$_.isEqual(compareOld, compareNew)
          if (isEqual === false && this.isChangedNotSaved !== true) {
            this.isChangedNotSaved = true
          }
        }
        this.thingBackup = this.$_.clone(newThing)
        this.$forceUpdate()
      },
      deep: true
    },
    cboxColor (val) {
      this.$el.style.setProperty('--color', val)
    },
    ggFunctionResourceId: function (newValue, oldValue) {
      if (newValue !== undefined && newValue !== null && newValue !== oldValue) {
        let newResourcePolicy = {
            Permission: 'ro',
            ResourceId: newValue
        }
        this.ggFunction.FunctionConfiguration.Environment.ResourceAccessPolicies.push(newResourcePolicy)
        this.ggFunctionResourceId = null
      }
      this.$forceUpdate()
    },
    mlResourceModelFile: function (newFile, oldFile) {
      if (newFile !== undefined && newFile !== null && newFile !== oldFile) {
        // console.log('file: ', newValue)
        this.uploadModelFile(newFile)
      }
    },
    thingDesc: function (newDesc, oldDesc) {
      if (newDesc !== oldDesc && this.isChangedNotSaved !== null && oldDesc !== null) {
        this.isChangedNotSaved = true
      }
    },
    thingName: function (newName, oldName) {
      console.log('thingName changed: ', oldName)
      if (newName !== oldName && this.isChangedNotSaved !== null && oldName !== null) {
        console.log('thingName changed now')
        this.isChangedNotSaved = true
      }
    }
   },
  methods: {
    async reloadThing () {
      let index = this.thingIndex
      this.thing = this.$store.getters.things[index]
      this.thingDesc = this.thing.ThingDesc
      this.thingName = this.thing.ThingName
      if (this.thing !== null && this.thing.hasOwnProperty('EdgeData')) {
        // this.thing.EdgeData
        try {
          let definitionData = await API.get('thingApi', '/edge/definition', {
            'queryStringParameters': {
              'edgeData': JSON.stringify(this.thing.EdgeData)
            }
          })
          // console.log('definitionData: ', definitionData)
          // console.log('result: ', definitionData.edgeDefinition)
          if (definitionData.edgeDefinition === null) {
            // this.$delete(this.thing, 'EdgeData')
            this.$delete(this.thing, 'EdgeDefinition')
          } else {
            this.$set(this.thing, 'EdgeDefinition', definitionData.edgeDefinition)
          }
        } catch (err) {
          console.error(err)
        }
      }
    },
    mlResourceModelFileName (edgeResource) {
      let uri = edgeResource.ResourceDataContainer.S3MachineLearningModelResourceData.S3Uri
      if (uri !== null) {
        let fileNameFilter = uri.split(config.awsGreengrassBucket + '/public/' + this.thing.UserId + '_')
        // console.log('file names: ', fileNameFilter)
        let fileName = fileNameFilter[1] // uri.split(config.awsGreengrassBucket + '/public/' + this.thing.UserId + '_')[1]
        return fileName
      } else {
        return ''
      }
    },
    mlResourceModelDestPath (edgeResource) {
      let destPath = edgeResource.ResourceDataContainer.S3MachineLearningModelResourceData.DestinationPath
      if (destPath !== null) {
        return destPath
      } else {
        return ''
      }
    },
    connectorDescription (edgeConnector) {
      for (let connector of this.connectors) {
        if (edgeConnector.ConnectorArn === connector.ARN) {
          return connector.ConnectorName
        }
      }
      return 'unknown connector'
    },
    edgeFunctionToService (edgeFunction) {
      // console.log('edgeFunction: ', edgeFunction)
      let serviceName = this.edgeFunctionArnToName(edgeFunction)
      for (let service of this.services) {
        if (service.ServiceName === serviceName) {
          return service
        }
      }
      return null
    },
    edgeFunctionArnToName (edgeFunction) {
      if (edgeFunction !== null) {
        let nameAliasPair = edgeFunction.FunctionArn.split(':function:')[1]
        let name = nameAliasPair.split(':')[0]
        return name
      }
      return 'unknown'
    },
    connectorCboxColor (edgeConnector) {
      for (let connector of this.connectors) {
        if (connector.ARN === edgeConnector.ConnectorArn) {
          // this.cboxColor = resource.cardColor
          return connector.cardColor
        }
      }
      // this.cboxColor = 'LightGrey'
      return 'LightGrey'
    },
    resourceCboxColor (edgeResource) {
      let type = this.resourceType(edgeResource)
      for (let resource of this.resources) {
        if (resource.ResourceType === type) {
          // this.cboxColor = resource.cardColor
          return resource.cardColor
        }
      }
      // this.cboxColor = 'LightGrey'
      return 'LightGrey'
    },
    changeCboxColor (color) {
      this.cboxColor = color
    },
    copyJson (dataJson) {
      return JSON.parse(JSON.stringify(dataJson))
    },
    deleteEdgeFunctionResource (index) {
      this.ggFunction.FunctionConfiguration.Environment.ResourceAccessPolicies.splice(index, 1)
    },
    switchResourcePolicyPermission (index) {
      if (this.ggFunction.FunctionConfiguration.Environment.ResourceAccessPolicies[index].Permission === 'rw') {
        this.ggFunction.FunctionConfiguration.Environment.ResourceAccessPolicies[index].Permission = 'ro'
      } else {
        this.ggFunction.FunctionConfiguration.Environment.ResourceAccessPolicies[index].Permission = 'rw'
      }
      // this.$forceUpdate()
    },
    editResourceDetail (edgeResourceOrigin) {
      let edgeResource = this.copyJson(edgeResourceOrigin)
      this.mlResourceModelFile = null
      if (edgeResource.ResourceDataContainer.hasOwnProperty('LocalDeviceResourceData')) {
        console.log('show edit resource:', edgeResource)
        this.ggLocalDeviceResource = edgeResource
        this.$refs.setLocalDeviceResourceModalRef.show()
      } else if (edgeResource.ResourceDataContainer.hasOwnProperty('LocalVolumeResourceData')) {
        this.ggLocalVolumeResource = edgeResource
        this.$refs.setLocalVolumeResourceModalRef.show()
      } else if (edgeResource.ResourceDataContainer.hasOwnProperty('S3MachineLearningModelResourceData')) {
        this.ggMLResource = edgeResource
         this.$refs.setMLResourceModalRef.show()
      }
    },
    resourceType (edgeResource) {
      this.mlResourceModelFile = null
      if (edgeResource.ResourceDataContainer.hasOwnProperty('LocalDeviceResourceData')) {
        return 'Local Device'
      } else if (edgeResource.ResourceDataContainer.hasOwnProperty('LocalVolumeResourceData')) {
        return 'Local Volume'
      } else if (edgeResource.ResourceDataContainer.hasOwnProperty('S3MachineLearningModelResourceData')) {
        return 'Machine Learning'
      }
    },
    editFunctionDetail (edgeFunction) {
      this.ggFunction = this.copyJson(edgeFunction)
      this.ggFunctionResourceId = null
      this.$refs.setEdgeMicroserviceModalRef.show()
    },
    editConnectorDetail (edgeConnectorOrigin) {
      let edgeConnector = this.copyJson(edgeConnectorOrigin)
      let description = this.connectorDescription(edgeConnector)
      switch (description) {
        case 'Image Classification ARMv7':
          this.ggMLConnector = edgeConnector
          this.$refs.setImageClassArmv7ConnectorModalRef.show()
          break
        case 'Image Classification Aarch64 JTX2':
          this.ggMLConnector = edgeConnector
          this.$refs.setImageClassArmv8ConnectorModalRef.show()
          break
        case 'Image Classification x86_64':
          this.ggMLConnector = edgeConnector
          this.$refs.setImageClassX86ConnectorModalRef.show()
          break
        case 'Kinesis Firehose':
          this.$refs.setKinesisFirehoseConnectorModalRef.show()
          break
        case 'Modbus-RTU Protocol Adapter':
          this.ggModbusConnector = edgeConnector
          this.$refs.setModbusConnectorModalRef.show()
          break
        case 'Raspberry Pi GPIO':
          this.ggRaspPiGpioConnector = edgeConnector
          this.$refs.setRaspPiGpioConnectorModalRef.show()
          break
        case 'Twilio Notifications':
          this.$refs.setTwilioConnectorModalRef.show()
          break
        default:
          break
      }
    },
    deleteConnectorFromEdge (index) {
      this.edgeConnectors.splice(index, 1)
      this.thing.EdgeDefinition.connectorDefinition.CreationTimestamp = '0'
      this.uploadEdge()
    },
    deleteResourceFromEdge (index) {
      this.edgeResources.splice(index, 1)
      this.thing.EdgeDefinition.resourceDefinition.CreationTimestamp = '0'
      this.uploadEdge()
    },
    deleteFunctionFromEdge (index) {
      let functionToDelete = this.edgeFunctions[index]
      // let functionName = this.edgeFunctionArnToName(functionToDelete)
      let subList = this.thing.EdgeDefinition.subscriptionDefinition.Definition.Subscriptions.filter(subscription => {
        return (subscription.Source !== functionToDelete.FunctionArn && subscription.Target !== functionToDelete.FunctionArn)
      })
      this.thing.EdgeDefinition.subscriptionDefinition.Definition.Subscriptions = subList
      this.edgeFunctions.splice(index, 1)
      this.thing.EdgeDefinition.functionDefinition.CreationTimestamp = '0'
      this.thing.EdgeDefinition.subscriptionDefinition.CreationTimestamp = '0'
      this.uploadEdge()
    },
    async deleteEdge () {
      try {
        await API.del('thingApi', '/edge', {
            'queryStringParameters': {
              userId: this.thing.UserId,
              certId: this.thing.CertId,
              thingId: this.thing.ThingId,
              edgeData: JSON.stringify(this.thing.EdgeData)
            }
        })
        this.$delete(this.thing, 'EdgeDefinition')
        this.$delete(this.thing, 'EdgeData')
        // TODO update thing
        let storedThings = this.$store.getters.things
        storedThings[this.thingIndex] = this.thing
        this.$store.commit('setThings', storedThings)
      } catch (err) {
        console.log(err)
      }
      this.$forceUpdate()
    },
    confirmAddEdgeService (service) {
      console.log('service: ', service)
      this.ggFunction = JSON.parse(JSON.stringify(this.initialGgFunction))
      this.ggFunction.FunctionArn = service.ServiceArn
      this.ggFunction.Id = service.ServiceName
      this.ggFunction.FunctionConfiguration.Environment.Variables.EDGE_THING_ID = this.thing.ThingId
      this.$refs.addEdgeServiceModalRef.hide()
      this.$refs.setEdgeMicroserviceModalRef.show()
      // this.$forceUpdate()
    },
    prepareEdgeDefinition () {
      if (this.thing.hasOwnProperty('EdgeDefinition') === false) {
        this.thing.EdgeDefinition = JSON.parse(JSON.stringify(this.initialEdgeDefinition))
        // done by backend
        // this.thing.EdgeDefinition.coreDefinition.Cores[0].CertificateArn = this.thing.CertificateArn
        // this.thing.EdgeDefinition.coreDefinition.Cores[0].ThingArn = this.thing.ThingArn
      }
    },
    confirmSetEdgeMicroservice (newFunction) {
      this.prepareEdgeDefinition()
      if (this.thing.EdgeDefinition.hasOwnProperty('functionDefinition') === false) {
        this.thing.EdgeDefinition.functionDefinition = this.copyJson(this.initialFunctionDefinition)
      }
      let newList = this.thing.EdgeDefinition.functionDefinition.Definition.Functions.filter(func => {
        return func.FunctionArn !== newFunction.FunctionArn
      })
      this.thing.EdgeDefinition.functionDefinition.Definition.Functions = newList
      this.thing.EdgeDefinition.functionDefinition.Definition.Functions.push(newFunction)
      this.thing.EdgeDefinition.functionDefinition.CreationTimestamp = '0'
      let functionName = this.edgeFunctionArnToName(newFunction)
      this.thing.EdgeDefinition.subscriptionDefinition.Definition.Subscriptions = this.thing.EdgeDefinition.subscriptionDefinition.Definition.Subscriptions.filter(subscription => {
        return subscription.Id.includes(functionName) === false
      })
      this.thing.EdgeDefinition.subscriptionDefinition.Definition.Subscriptions.push({
          Id: 'subFrom_' + functionName,
          Source: newFunction.FunctionArn,
          Subject: '#',
          Target: 'cloud'
      })
      this.thing.EdgeDefinition.subscriptionDefinition.Definition.Subscriptions.push({
          Id: 'subTo_' + functionName,
          Source: 'cloud',
          Subject: '#',
          Target: newFunction.FunctionArn
      })
      this.thing.EdgeDefinition.subscriptionDefinition.CreationTimestamp = '0'
      this.uploadEdge()
    },
    async uploadEdge () {
        let body = {}
        body.userId = this.thing.UserId
        body.certId = this.thing.CertId
        body.thingId = this.thing.ThingId
        body.thingNameTag = this.thing.ThingName
        body.edgeDefinition = this.thing.EdgeDefinition
        console.log('body: ', body)
        if (this.thing.hasOwnProperty('EdgeData')) {
          body.edgeData = this.thing.EdgeData
        }
        this.isEdgeUpdating = true
        try {
          const result = await API.post('thingApi', '/edge', { body })
          console.log('uploadEdge result: ', result)
          if (result.edgeDefinition !== null && result.edgeData !== null) {
            this.$set(this.thing, 'EdgeDefinition', result.edgeDefinition)
            this.$set(this.thing, 'EdgeData', result.edgeData)
            // update to current cached things array
            let storedThings = this.$store.getters.things
            storedThings[this.thingIndex] = this.thing
            this.$store.commit('setThings', storedThings)
          }
        } catch (err) {
          console.log('uploadEdge error: ', err)
          this.reloadThing() // recover from the error
          this.errorMessage.header = err.message
          this.errorMessage.message = err.response.data.message
          this.$bvModal.show('modalErrorMessage')
        }
        this.isEdgeUpdating = false
        this.$forceUpdate()
    },
    async deployEdge () {
      if (this.thing.hasOwnProperty('EdgeData')) {
        let body = {}
        body.edgeData = this.thing.EdgeData
        try {
          const deployResult = await API.post('thingApi', '/edge/deploy', { body })
          console.log('deploy result: ', deployResult)
          if (deployResult.DeploymentStatus === 'Failure') {
            this.$refs.deployErrorModalRef.show()
          } else if (deployResult.DeploymentStatus === 'Success') {
            console.log('Deployment succeeded')
          } else {
            /*
            let that = this
            let edgeData = JSON.stringify(that.thing.EdgeData)
            let timer = setInterval(async function () {
                this.isDeploying = true
                try {
                  const statusResult = await API.get('thingApi', '/edge/deploy/status', {
                    'queryStringParameters': {
                        deployId: deployResult.DeploymentId,
                        edgeData: edgeData
                    }
                  })
                  let deployStatus = statusResult.deployStatus
                  console.log('deploy status: ', deployStatus)
                  console.log('deploy status value: ', deployStatus.DeploymentStatus)
                  switch (deployStatus.DeploymentStatus) {
                    case 'Pending':
                    case 'InProgress':
                      break
                    case 'Success':
                      this.isDeploying = false
                      clearInterval(timer)
                      break
                    case 'Failure':
                      this.isDeploying = false
                      that.$refs.deployErrorModalRef.show()
                      clearInterval(timer)
                      break
                    default:
                      this.isDeploying = false
                      that.$refs.deployErrorModalRef.show()
                      clearInterval(timer)
                      break
                  }
                } catch (err) {
                  console.log(err)
                  this.isDeploying = false
                  that.$refs.deployErrorModalRef.show()
                  clearInterval(timer)
                }
            }, 3000) // in ms, run every 3 seconds
            */
          } // if after successful deployment
        } catch (err) {
          this.$refs.deployErrorModalRef.show()
          console.log(err)
        }
      } // end if
    },
    uploadModelFile (file) {
      let reader = new window.FileReader() // if window is not used it says File READER is not defined
      let userId = this.thing.UserId
      let that = this
      that.ggMLResource.ResourceDataContainer.S3MachineLearningModelResourceData.S3Uri = 's3://' + config.awsGreengrassBucket + '/public/' + userId + '_' + file.name
      reader.onload = function (event) {
         // dispatch fileAttached to state UI postEditor with event.target.result as read dataURL
        let content = event.target.result
        let fileName = userId + '_' + file.name
        console.log('fileName: ', fileName)
        // still save to project bucket Storage.configure({level: 'public', bucket: this.ggS3BucketName})
        Storage.put(fileName, content, {
            contentType: 'application/zip'
        })
        .then(result => {
          console.log(result)
           // s3://bucket/key
        })
        .catch(err => console.log(err))
      }
      reader.readAsArrayBuffer(file)
    },
    confirmAddConnector (connector) {
      console.log('connector:', connector.ConnectorName)
      this.ggMLConnector.ConnectorArn = connector.ARN
      switch (connector.ConnectorName) {
        case 'Image Classification ARMv7':
          this.ggMLConnector = JSON.parse(JSON.stringify(this.initialGgMLConnector))
          this.$refs.setImageClassArmv7ConnectorModalRef.show()
          break
        case 'Image Classification Aarch64 JTX2':
          this.ggMLConnector = JSON.parse(JSON.stringify(this.initialGgMLConnector))
          this.$refs.setImageClassArmv8ConnectorModalRef.show()
          break
        case 'Image Classification x86_64':
          this.ggMLConnector = JSON.parse(JSON.stringify(this.initialGgMLConnector))
          this.$refs.setImageClassX86ConnectorModalRef.show()
          break
        case 'Kinesis Firehose':
          this.$refs.setKinesisFirehoseConnectorModalRef.show()
          break
        case 'Modbus-RTU Protocol Adapter':
          this.ggModbusConnector = JSON.parse(JSON.stringify(this.initialGgModbusConnector))
          this.$refs.setModbusConnectorModalRef.show()
          break
        case 'Raspberry Pi GPIO':
          this.ggRaspPiGpioConnector = JSON.parse(JSON.stringify(this.initialGgRaspPiGpioConnector))
          this.$refs.setRaspPiGpioConnectorModalRef.show()
          break
        case 'Twilio Notifications':
          this.$refs.setTwilioConnectorModalRef.show()
          break
        default:
          break
      }
      this.$refs.addConnectorModalRef.hide()
    },
    confirmAddResource (resource) {
      this.mlResourceModelFile = null
      this.$refs.addResourceModalRef.hide()
      if (resource.ResourceType === 'Local Volume') {
        this.ggLocalVolumeResource = JSON.parse(JSON.stringify(this.initialGgLocalVolumeResource))
        this.$refs.setLocalVolumeResourceModalRef.show()
      } else if (resource.ResourceType === 'Local Device') {
        this.ggLocalDeviceResource = JSON.parse(JSON.stringify(this.initialGgLocalDeviceResource))
        this.$refs.setLocalDeviceResourceModalRef.show()
      } else if (resource.ResourceType === 'Machine Learning') {
        this.ggMLResource = JSON.parse(JSON.stringify(this.initialGgS3MachineLearningResource))
        this.$refs.setMLResourceModalRef.show()
      }
    },
    confirmSetLocalVolumeResource (evt) {
      if (this.ggLocalVolumeResource.Name !== null &&
            this.ggLocalVolumeResource.ResourceDataContainer.LocalVolumeResourceData.SourcePath !== null &&
            this.ggLocalVolumeResource.ResourceDataContainer.LocalVolumeResourceData.DestinationPath !== null) {
        this.handleLocalVolumeResourceSubmit()
      } else {
        // Prevent modal from closing
        evt.preventDefault()
      }
    },
    handleLocalVolumeResourceSubmit () {
      // this.$refs.setLocalVolumeResourceModalRef.hide()
      this.ggLocalVolumeResource.Id = this.ggLocalVolumeResource.Name
      // The GroupOwner value is ignored if GroupOwnerSetting#AutoAddGroupOwner is true.
      if (this.ggLocalVolumeResource.ResourceDataContainer.LocalVolumeResourceData.GroupOwnerSetting.GroupOwner !== null) {
        this.ggLocalVolumeResource.ResourceDataContainer.LocalVolumeResourceData.GroupOwnerSetting.AutoAddGroupOwner = false
      } else {
        this.ggLocalVolumeResource.ResourceDataContainer.LocalVolumeResourceData.GroupOwnerSetting.AutoAddGroupOwner = true
        delete this.ggLocalVolumeResource.ResourceDataContainer.LocalVolumeResourceData.GroupOwnerSetting.GroupOwner
      }
      this.handleResource(this.ggLocalVolumeResource)
    },
    confirmSetModbusConnector (evt) {
      if (this.ggModbusConnector.Parameters['ModbusSerialPort-ResourceId'] !== null) {
        this.handleModbusConnectorSubmit()
      } else {
        // Prevent modal from closing
        evt.preventDefault()
      }
    },
    handleModbusConnectorSubmit () {
      this.$refs.setModbusConnectorModalRef.hide()
      let modbusResourceId = this.ggModbusConnector.Parameters['ModbusSerialPort-ResourceId']
      let modbusResource = this.edgeResources.find(function (resource) {
        return resource.Id === modbusResourceId
      })
      this.ggModbusConnector.Parameters['ModbusSerialPort'] = modbusResource.ResourceDataContainer.SourcePath
      this.handleConnector(this.ggModbusConnector)
    },
    confirmSetRaspPiGpioConnector (evt) {
      if (this.ggRaspPiGpioConnector.Parameters['GpioMem-ResourceId'] !== null) {
        if (this.ggRaspPiGpioConnector.Parameters.InputGpios === null) {
          delete this.ggRaspPiGpioConnector.Parameters.InputGpios
        }
        if (this.ggRaspPiGpioConnector.Parameters.InputPollPeriod === null) {
          delete this.ggRaspPiGpioConnector.Parameters.InputPollPeriod
        }
        if (this.ggRaspPiGpioConnector.Parameters.OutputGpios === null) {
          delete this.ggRaspPiGpioConnector.Parameters.OutputGpios
        }
        this.handleRaspPiGpioConnectorSubmit()
      } else {
        // Prevent modal from closing
        evt.preventDefault()
      }
    },
    handleRaspPiGpioConnectorSubmit () {
      this.$refs.setRaspPiGpioConnectorModalRef.hide()
      this.handleConnector(this.ggRaspPiGpioConnector)
    },
    confirmSetImageClassArmv7Connector (evt) {
      if (this.ggMLConnector.Id !== null &&
            this.ggMLConnector.Parameters.MLModelDestinationPath !== null &&
            this.ggMLConnector.Parameters.MLModelResourceId !== null &&
            this.ggMLConnector.Parameters.LocalInferenceServiceName !== null) {
        this.handleImageClassArmv7ConnectorSubmit()
      } else {
        // Prevent modal from closing
        evt.preventDefault()
      }
    },
    handleImageClassArmv7ConnectorSubmit () {
      this.$refs.setImageClassArmv7ConnectorModalRef.hide()
      this.handleConnector(this.ggMLConnector)
    },
    confirmSetImageClassArmv8Connector (evt) {
      if (this.ggMLConnector.Name !== null &&
            this.ggMLConnector.ResourceDataContainer.S3MachineLearningModelResourceData.DestinationPath !== null &&
            this.ggMLConnector.ResourceDataContainer.S3Uri !== null) {
        this.handleImageClassArmv8ConnectorSubmit()
      } else {
        // Prevent modal from closing
        evt.preventDefault()
      }
    },
    handleImageClassArmv8ConnectorSubmit () {
      this.$refs.setImageClassArmv8ConnectorModalRef.hide()
      this.handleConnector(this.ggMLConnector)
    },
    confirmSetImageClassX86Connector (evt) {
      if (this.ggMLConnector.Name !== null &&
            this.ggMLConnector.ResourceDataContainer.S3MachineLearningModelResourceData.DestinationPath !== null &&
            this.ggMLConnector.ResourceDataContainer.S3Uri !== null) {
        this.handleImageClassX86ConnectorSubmit()
      } else {
        // Prevent modal from closing
        evt.preventDefault()
      }
    },
    handleImageClassX86ConnectorSubmit () {
      this.$refs.setImageClassX86ConnectorModalRef.hide()
      this.handleConnector(this.ggMLConnector)
    },
    handleConnector (newConnector) {
      this.prepareEdgeDefinition()
      if (this.thing.EdgeDefinition.hasOwnProperty('connectorDefinition') === false) {
        this.thing.EdgeDefinition.connectorDefinition = this.initialConnectorDefinition
      }
      let newList = this.thing.EdgeDefinition.connectorDefinition.Definition.Connectors.filter(connector => {
        return connector.Id !== newConnector.Id
      })
      this.thing.EdgeDefinition.connectorDefinition.Definition.Connectors = newList
      this.thing.EdgeDefinition.connectorDefinition.Definition.Connectors.push(newConnector)

      this.thing.EdgeDefinition.connectorDefinition.CreationTimestamp = '0'
      this.uploadEdge()
    },
    handleResource (newResource) {
      console.log('handleResource')
      this.prepareEdgeDefinition()
      if (this.thing.EdgeDefinition.hasOwnProperty('resourceDefinition') === false) {
        this.thing.EdgeDefinition.resourceDefinition = this.initialResourceDefinition
      }
      let newList = this.thing.EdgeDefinition.resourceDefinition.Definition.Resources.filter(resource => {
        return resource.Id !== newResource.Id
      })
      this.thing.EdgeDefinition.resourceDefinition.Definition.Resources = newList
      this.thing.EdgeDefinition.resourceDefinition.Definition.Resources.push(newResource)
      this.thing.EdgeDefinition.resourceDefinition.CreationTimestamp = '0'
      this.uploadEdge()
    },
    confirmSetLocalDeviceResource (evt) {
      // console.log('confirmSetLocalDeviceResource')
      if (this.ggLocalDeviceResource.Name !== null &&
            this.ggLocalDeviceResource.ResourceDataContainer.LocalDeviceResourceData.SourcePath !== null) {
        this.handleDeviceResourceSubmit()
      } else {
        // Prevent modal from closing
        evt.preventDefault()
      }
    },
    handleDeviceResourceSubmit () {
      // console.log('handleDeviceResourceSubmit')
      this.ggLocalDeviceResource.Id = this.ggLocalDeviceResource.Name
      // The GroupOwner value is ignored if GroupOwnerSetting#AutoAddGroupOwner is true.
      if (this.ggLocalDeviceResource.ResourceDataContainer.LocalDeviceResourceData.GroupOwnerSetting.GroupOwner !== null) {
        this.ggLocalDeviceResource.ResourceDataContainer.LocalDeviceResourceData.GroupOwnerSetting.AutoAddGroupOwner = false
      } else {
        this.ggLocalDeviceResource.ResourceDataContainer.LocalDeviceResourceData.GroupOwnerSetting.AutoAddGroupOwner = true
        delete this.ggLocalDeviceResource.ResourceDataContainer.LocalDeviceResourceData.GroupOwnerSetting.GroupOwner
      }
      this.$refs.setLocalDeviceResourceModalRef.hide()
      this.handleResource(this.ggLocalDeviceResource)
    },
    confirmSetMLResource (evt) {
      console.log('ggMLResource: ', this.ggMLResource)
      if (this.ggMLResourceModelFileName !== null &&
            this.ggMLResource.ResourceDataContainer.S3MachineLearningModelResourceData.DestinationPath != null &&
            this.ggMLResource.Name !== null) {
        this.handleMLResourceSubmit()
      } else {
        // Prevent modal from closing
        evt.preventDefault()
      }
    },
    handleMLResourceSubmit () {
      this.ggMLResource.Id = this.ggMLResource.Name
      this.$refs.setMLResourceModalRef.hide()
      this.handleResource(this.ggMLResource)
    },
    addNewEdgeService () {
    },
    addNewConnector () {
    },
    addNewResource () {
    },
    changeTitle () {
      // console.log('isShowEdit: ', this.isShowEdit)
      if (this.isShowEdit) {
        return 'Edit'
      } else {
        return 'Show'
      }
    },
    async updateThing () {
      // if (this.isChangedNotSaved) {
        this.thing.ThingDesc = this.thingDesc
        this.thing.ThingName = this.thingName
        // console.log('Thing: ', this.thing)
        const userId = this.$store.getters.userId
        const certId = this.thing.CertId
        const thingId = this.thing.ThingId
        const name = this.thing.ThingName
        const desc = this.thing.ThingDesc
        const body = { userId, certId, thingId, name, desc }
        const result = await API.post('thingApi', '/things', { body })
        console.log('updateThing: result: ', result)
        this.$store.dispatch('replaceThing', this.thing)
        this.isChangedNotSaved = false
      // }
    },
    async downloadEdgeCoreSetup () {
      this.isDownloading = true
      // let getThingDetails = '/things?userId=' + userId + '?certId=' + this.thing.certId
      const result = await API.get('thingApi', '/things', {
            'queryStringParameters': {
                'userId': this.thing.UserId,
                'certId': this.thing.CertId,
                'thingName': this.thing.ThingName,
                'thingId': this.thing.ThingId
            }
      })
      console.log('result: ', result)
      let resultJson = result
      console.log('result: ', resultJson)
      await atHelper.downloadEdgeCoreSetup(resultJson)
      this.isDownloading = false
    },
    async downloadCert () {
      this.isDownloading = true
      // let getThingDetails = '/things?userId=' + userId + '?certId=' + this.thing.certId
      console.log('thing: ', this.thing)
      const result = await API.get('thingApi', '/things', {
            'queryStringParameters': {
                'userId': this.thing.UserId,
                'certId': this.thing.CertId,
                'thingName': this.thing.ThingName,
                'thingId': this.thing.ThingId
            }
      })
      console.log('result: ', result)
      let resultJson = result
      console.log('result: ', resultJson)
      await atHelper.downloadCertKey(resultJson)
      this.isDownloading = false
    },
    returnDiscardChangesOk (evt) {
      // Prevent modal from closing
      // evt.preventDefault()
      this.$refs.modalReturnConfirmRef.hide()
      this.$router.go(-1)
    },
    returnCancel () {
      this.$refs.modalReturnConfirmRef.hide()
    },
    backHome () {
      console.log('quit: ', this.isChangedNotSaved)
      if (this.isChangedNotSaved === true) {
        this.$refs.modalReturnConfirmRef.show()
      } else {
        this.$router.go(-1)
      }
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
                    chart.ChartDataContinueValue = null
                  }
                }
              }
              this.chartDataCollect(responseMessage, collectedDataItems)
              // transform from intermediate data to Google Chart requred format
              // console.log('Number of newly collected data: ', collectedDataItems)
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
                  chart.ChartDataSplits[i - 1].push(splitChartColRow)
                }
              }
              // console.log('chartDataSplit new:', chart.ChartDataSplits[0])
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
    async updateThingStatus () {
      let that = this
      this.deviceStatus = null
      if (this.thingStatusSubscribe === null) {
        this.thingStatusSubscribe = PubSub.subscribe('aiot/' + this.thing.UserId + '/' + this.thing.ThingId + '/aiot_device/response').subscribe({
          next: data => {
            if (typeof data.value === 'object' && data.value !== null) {
              let responseMessage = data.value
              let collectedDataItems = {}
              that.deviceStatusCollect(responseMessage, collectedDataItems)
              that.deviceStatus = collectedDataItems
              // console.log(that.deviceStatus)
              that.$forceUpdate()
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
