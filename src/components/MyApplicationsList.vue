<template>
  <div>
        <b-row align-v="center" class="at-bottombar">
          <b-col align="start" sm="3">
            <p class="h4">Microservices <small>({{mservicesCounter}})</small></p>
          </b-col>
          <b-col sm="4">
            <b-form-input class="at-border"
              type="text" 
              v-model="$parent.searchString"
              required
              placeholder="Search ...">
            </b-form-input>
          </b-col>
          <b-col sm="1">
            <b-form-checkbox
              id="checkbox-1"
              v-model="searchDeployableOnly"
              size="sm"
              v-b-popover.hover.bottom="'Show deployable services only'"
              name="checkbox-1"
              value="true"
              unchecked-value="false">
              <small>Deployable</small>
            </b-form-checkbox>
          </b-col>
          <b-col sm="4" align="end">
            <b-dropdown variant="info" text="Actions" right>
              <b-dropdown-item  v-b-modal.walkTreeModal v-b-popover.hover.left="'Show microservices\' message trees'" @click="walkTree()">Tree</b-dropdown-item>
              <b-dropdown-item  @click="exportServices()" v-b-popover.hover.left="'Export all designs to local files'">Export</b-dropdown-item>
            </b-dropdown>
            <!--
            <b-button variant="info" v-b-modal.walkTreeModal v-b-popover.hover.bottom="'Show microservices\' message trees'" @click="walkTree()">Tree</b-button> 
            <b-button variant="info" @click="exportServices()" v-b-popover.hover.bottom="'Export all designs to local files'">Export</b-button> 
            -->
            <b-button variant="info" @click="reloadServices()">Refresh</b-button>
            <b-button variant="success" @click="createService()" >Create</b-button>
          </b-col>
        </b-row>
        <spinner v-if="isExporting === true" size="medium" />
      <b-modal id="walkTreeModal" ok-only title="Trees by Message Topics">
        <spinner v-if="walkTreeLoading === true" size="medium" />
        <div>
          <pre id="log"></pre>
        </div>
        <div>
          <code>    </code>
        </div>  
      </b-modal>
      <div v-if="isLoading" class="mb-2">
        <b-row>
          <b-col align="center">
            <spinner  size="medium" />
          </b-col>
        </b-row>
      </div>
      <div class="text-center mt-5" v-if="services.length === 0">
              No services available.
      </div>
      <b-row class="mt-2">
        <b-col class="at-scroll">
          <b-card-group columns>
            <b-modal id="modalDeleteConfirm"
                  hide-header 
                  size="sm"
                  @ok="deleteService(deletingServiceIndex)"
                  >
              <div class="text-center">
                <h5>Delete the microservice?</h5>
              </div>                  
            </b-modal>
           <!--  img-src="https://picsum.photos/600/300/?image=25" -->
           <!-- 
              img-src="/static/photo-27.png"
              img-top
           -->
           <!--
              :footer-bg-variant="(service.IsShared === 'true') ? 'secondary' : 'default'"
              :footer-text-variant="(service.IsShared === 'true') ? 'white' : 'default'"
              :footer="(service.IsShared === 'true') ? ' ' : ''"
           -->
           <b-card v-for="service in filteredServices" :key="service.ServiceName"
              header = " "
              class="at-card-mservice"
              :header-bg-variant="(service.IsShared === 'true') ? 'secondary' : 'default'"
           >
              <b-row align-v="center">
                <!-- for unexplainable reason, need set cols to 9 -->
                <b-col lg="9">
                  <h5 class="card-text">
                    {{service.ServiceName}}
                  </h5>
                </b-col>
                <b-col lg="3" align="end">   
                  <b-dropdown :variant="service.hasOwnProperty('DeployMessage') ? (service.hasOwnProperty('IsDeployed') && service.IsDeployed === 'true' ? 'success' : 'Primary') : 'secondary'" class="mx-0" right >
                    <!-- VUE reference: https://vuejs.org/v2/guide/events.html -->
                    <b-dropdown-item v-if="service.hasOwnProperty('DeployMessage') && service.IsDeployed !== 'true'" @click ="deployService(service)" ><b>Deploy</b></b-dropdown-item>
                    <b-dropdown-item v-if="service.hasOwnProperty('DeployMessage') && service.IsDeployed === 'true'" @click ="deployService(service)" ><b>Redeploy</b></b-dropdown-item>
                    <b-dropdown-item v-if="service.hasOwnProperty('UndeployMessage') && service.IsDeployed === 'true'" @click ="undeployService(service)" ><b>Undeploy</b></b-dropdown-item>
                    <b-dropdown-item @click ="showServiceDetail(services.indexOf(service))" >Edit</b-dropdown-item>
                    <b-dropdown-item @click ="copyService(services.indexOf(service))">Duplicate</b-dropdown-item>        
                    <b-dropdown-item v-b-modal.modalDeleteConfirm @click="deletingServiceIndex=services.indexOf(service)" >Delete</b-dropdown-item>
                    <b-dropdown-divider></b-dropdown-divider>
                    <b-dropdown-item v-b-popover.hover.bottom="'Runtime logs with realtime updates'" @click ="showServiceLog(service)" >
                      <b-row>
                        <b-col>
                          Logs
                        </b-col>
                        <b-col align="end">
                          <!-- v-bind:value="(servicesLogging.hasOwnProperty(service.ServiceName) && servicesLogging[service.ServiceName].enabled) ? servicesLogging[service.ServiceName].enabled : false" -->
                          <b-form-checkbox
                            v-model="servicesLoggingCheckbox[service.ServiceName]"
                            value="true"
                            unchecked-value="false"
                          >
                          </b-form-checkbox>
                        </b-col>
                      </b-row>
                    </b-dropdown-item>
                  </b-dropdown>
                </b-col>
              </b-row>
              <b-row class="ml-0 mt-1">
                <b-col class="at-desc-display">
                  <vue-markdown>{{service.ServiceDesc}}</vue-markdown>
                </b-col>
                <!--
                    {{truncatedString( service.ServiceDesc, 256 )}}
                <p class="card-text">
                  {{service.ServiceDesc).replace(/(\r\n|\n|\r)/gm,'\&#13;\&#10;")}}
                </p>
                -->
              </b-row>
              <b-row v-if="service.InputMessageTopic !== 'null'" class="ml-0 mt-1">  
                <p class="card-text">
                  <i class="fas fa-arrow-alt-circle-right"></i> <code>{{service.InputMessageTopic}}</code>
                </p>
              </b-row>
              <b-row v-if="service.OutputMessageTopic !== 'null'" class="ml-0">  
                <p class="card-text">
                  <i class="fas fa-arrow-alt-circle-left"></i> <code>{{service.OutputMessageTopic}}</code>
                </p>
              </b-row>
              <b-row class="mt-1" v-if="isLogLoading.hasOwnProperty(service.ServiceName) && isLogLoading[service.ServiceName] === true">
                <b-col><spinner size="small" /></b-col>
              </b-row>
              <b-row v-if="servicesLogging.hasOwnProperty(service.ServiceName) && servicesLogging[service.ServiceName].enabled === true && (serviceEvents(service.ServiceName).length > 0)">
                <b-col>
                  <b-row class="mt-2" align-v="center">
                    <b-col align="start">
                      Log:
                    </b-col>
                    <b-col align="end">
                      <b-button variant="light" @click="reloadLogging(service)"><i class="fas fa-sync" style='font-size:12px'></i></b-button>
                    </b-col>
                  </b-row>
                  <b-row class="at-border mt-1">
                    <b-col style="overflow-x: scroll; overflow-y: scroll; white-space: nowrap; display: inline-block; height:150px; width:90%">
                      <b-row v-for="(event, index) in serviceEvents(service.ServiceName)" :key="index">
                        <b-col><small>{{(new Date(event.timestamp)).toLocaleDateString('En', { month: 'numeric', day: 'numeric' })}}&nbsp;{{(new Date(event.timestamp)).toLocaleTimeString()}}:&nbsp;</small><small>{{event.message}}</small></b-col>
                        <!-- {{(new Date(event.timestamp)).toLocaleTimeString()}} -->
                      </b-row>
                    </b-col>
                  </b-row>
                </b-col>
              </b-row> 
              <!-- 
              <b-row v-if="servicesLogging.hasOwnProperty(service.ServiceName) && servicesLogging[service.ServiceName].enabled === true" class="ml-0">  
                <b-col>
                  <div>
                    <b-table striped hover :items="servicesLogging[service.ServiceName].data.events"></b-table>
                  </div>
                </b-col>
              </b-row>
              -->
            </b-card>
          </b-card-group>
        </b-col>
      </b-row>
  </div>
</template>

<script>
import Sidebar from './Sidebar'
import atHelper from '../aiot-helper'
import store from '../store'
import { API, PubSub } from 'aws-amplify'
import MQTTPattern from 'mqtt-pattern'
import JSON5 from 'json5'
import { eventBus } from '../main'

export default {
  components: {
    sidebar: Sidebar
  },
  name: 'applications',
  data: function () {
    return {
      activeMenu: 'app',
      response: 'unknown',
      guess: 123,
      what: 0,
      mservicesCounter: 0,
      loading: false,
      services: [],
      testResult: '',
      walkTreeLoading: false,
      isLoading: false,
      isLogLoading: {},
      isExporting: false,
      searchDeployableOnly: 'false',
      deletingServiceIndex: -1,
      servicesLoggingCheckbox: []
    }
  },
  watch: {
    services: {
        handler: function (newList, oldList) {
          // console.log('services changed:')
          if (newList !== null) {
            this.mservicesCounter = newList.length
          } else {
            this.mservicesCounter = 0
          }
          this.$forceUpdate()
        },
        deep: true
    }
  },
  computed: {
    servicesLogging () {
      let sl = this.$parent.$parent.$parent.servicesLogging
      return sl
    },
    filteredServices () {
      let foundServices = this.services.filter(service => {
        return service.ServiceName.toLowerCase().includes(this.$parent.searchString.toLowerCase()) &&
               (this.searchDeployableOnly !== 'true' ||
                  (this.searchDeployableOnly === 'true' &&
                    (service.hasOwnProperty('DeployMessage') && service.DeployMessage !== '')
                  )
               )
      })
      foundServices.sort(function (a, b) {
        return a.ServiceName.localeCompare(b.ServiceName)
      })
      return foundServices
    }
  },
  created () {
  },
  async mounted () { // enter everytime the page becomes active
    this.services = this.$store.getters.mservices
    if (this.services !== null) {
      this.mservicesCounter = this.services.length
    } else {
      this.services = []
      this.mservicesCounter = 0
      await this.reloadServices()
    }
    eventBus.$on('newLoggingOutput', this.onNewLoggingOutput)
  },
  methods: {
    /*
    servicesLoggingCheckbox (service) {
      try {
        let flag = this.servicesLogging[service.ServiceName].enabled
        if (flag !== undefined) {
          return flag
        }
        return false
      } catch (err) {
        return false
      }
    },
    */
    onNewLoggingOutput () {
      // console.log('logging update')
      this.$forceUpdate()
    },
    serviceEvents (serviceName) {
      try {
        let events = this.servicesLogging[serviceName].events
        if (events === undefined) {
          return []
        }
        return events
      } catch (err) {
        return []
      }
    },
    truncatedString (textStr, length) {
      return (textStr.length < (length)) ? textStr : (textStr.substring(0, length - 4) + '...')
    },
    async deployService (service) {
      // console.log('deploy: ', service.DeployMessage)
      let result = await this.servicePublish(service, service.DeployMessage)
      if (result === true) {
        service.IsDeployed = 'true'
        await this.updateService(service)
      }
    },
    async undeployService (service) {
      // console.log('undeploy: ', service.UndeployMessage)
      let result = await this.servicePublish(service, service.UndeployMessage)
      if (result === true) {
        service.IsDeployed = 'false'
        await this.updateService(service)
      }
    },
    async servicePublish (service, messageStr) {
      let message = null
      try {
        // https://stackoverflow.com/questions/9637517/parsing-relaxed-json-without-eval
        // message = JSON.parse(messageStr.replace(/(['"])?([a-z0-9A-Z_]+)(['"])?:/g, '"$2": '))
        message = JSON5.parse(messageStr)
      } catch (e) {
        console.log('invalid JSON')
        return false
      }
      console.log('message: ', message)
      if (message.hasOwnProperty('topic') === false) {
        return false
      }
      const senderId = this.$store.getters.userId
      let messageTopic = 'aiot/' + senderId + '/' + service.ServiceName + '/' + message.topic
      let messageData = {}
      if (message.hasOwnProperty('data')) {
        messageData = { data: message.data }
      }
      await PubSub.publish(messageTopic, messageData)
      return true
    },
    async exportServices () {
      /*
      for (let service of this.services) {
        await atHelper.exportService(service)
      }
      */
      this.isExporting = true
      await atHelper.exportServices(this.services)
      this.isExporting = false
    },
    async reloadServices () {
      const userId = store.getters.userId
      this.isLoading = true
      const result = await API.get('mserviceApi', '/mservices', {
          'queryStringParameters': {
               'userId': userId
          }
      })
      this.isLoading = false
      this.testResult = result
      if (result.hasOwnProperty('error')) {
        console.log('reloadService error: ', result.error)
      } else {
        // let resultJson = JSON.parse(result)
        let resultJson = result
        // console.log('result: ', resultJson)
        store.commit('setMservices', resultJson)
        // atHelper.reloadServices()
        this.services = this.$store.getters.mservices
        if (this.services === null) {
          this.services = []
        }
        this.mservicesCounter = this.services.length
      }
    },
    createService () {
      console.log('createService')
      this.$router.push({ name: 'newService' })
    },
    showServiceDetail (index) {
      this.$router.push({name: 'editService', params: { serviceIndex: index, serviceSource: this.services }})
    },
    async showServiceLog (service) {
      try {
        this.servicesLogging[service.ServiceName].enabled = !(this.servicesLogging[service.ServiceName].enabled)
      } catch (err) {
        this.servicesLogging[service.ServiceName] = {enabled: true}
      }
      this.servicesLoggingCheckbox[service.ServiceName] = this.servicesLogging[service.ServiceName].enabled
      await this.reloadLogging(service)
    },
    async reloadLogging (service) {
      this.isLogLoading[service.ServiceName] = true
      this.$forceUpdate()
      let currentTime = new Date().getTime() / 1000 // in seconds
      let startTime = currentTime - (30 * 24 * 60 * 60) // one month before
      let logGroupName = '/aws/lambda/' + service.ServiceName
      let queryString = 'fields @timestamp, @message | sort @timestamp desc'
      const result = await API.post('mserviceApi', '/logging', { body: {
        /*
        filterParameter: {
          logGroupName: logGroupName,
          // endTime: 'NUMBER_VALUE',
          // filterPattern: 'STRING_VALUE',
          // interleaved: true || false,
          limit: 10
          // logStreamNamePrefix: 'STRING_VALUE',
          // nextToken: 'STRING_VALUE',
          // startTime: 'NUMBER_VALUE'
        },
        */
        queryParameter: {
          endTime: currentTime, /* required */
          queryString: queryString, /* required */
          startTime: startTime, /* required */
          limit: 20,
          logGroupName: logGroupName
        },
        serviceName: service.ServiceName,
        loggerName: 'aiotLogReceiver',
        enableLogging: this.servicesLogging[service.ServiceName].enabled
      }})
      // console.log('logging: result: ', result)
      if (result.hasOwnProperty('error')) {
        console.log('logging error:', result.error)
      } else if (this.servicesLogging[service.ServiceName].enabled) {
        let queryEvents = result.results
        let logEvents = []
        for (let queryEvent of queryEvents) {
          let logEvent = {}
          for (let fieldValuePair of queryEvent) {
            logEvent[fieldValuePair.field.replace('@', '')] = fieldValuePair.value
          }
          for (let event of logEvents) {
            // the result events have, strangely, string format timestamp occationally.
            // as the string timestamps are lack of 'Z', we add 'Z' to it to comply to OTC time format.
            try {
              // console.log('time: ', event.timestamp)
              event.timestamp = new Date(event.timestamp.replace(' ', 'T') + 'Z').getTime()
              // console.log('time: to:', event.timestamp)
            } catch (err) {
              // continue
            }
          }
          logEvents.push(logEvent)
        }
        console.log('logging: events: ', logEvents)
        this.servicesLogging[service.ServiceName].events = logEvents
      }
      this.isLogLoading[service.ServiceName] = false
      this.$forceUpdate()
    },
    copyService (index) {
      console.log('copyService to: ', this.services[index])
      this.$router.push({name: 'newService', params: { serviceIndex: index, copiedService: this.services[index] }})
    },
    deleteService (index) {
      const userId = this.$store.getters.userId
      let mservice = this.$store.getters.mservices[index]
      API.del('mserviceApi', '/mservices', {
            'queryStringParameters': {
                 'userId': userId,
                 'mserviceName': mservice.ServiceName
            }
      }).then(response => {
        if (response.error === null) {
          // remove the mservice entry from list
          let mservices = this.$store.getters.mservices
          mservices.splice(index, 1)
          this.$store.commit('setMservices', mservices)
          this.services = mservices
        } else {
          console.log(response.error)
        }
      }).catch(error => {
        console.log(error.response)
      })
    },
    async updateService (mservice) {
        this.isLoading = true
        const body = mservice
        const result = await API.post('mserviceApi', '/mservices', { body })
        console.log('updateService: result: ', result)
        if (result.hasOwnProperty('success')) {
          let newMservice = result.microservice.Attributes
          this.$store.dispatch('replaceMservice', {replacingService: newMservice, services: this.services})
        }
        this.isLoading = false
    },
    shuffle (array) {
      /**
       * @see https://bost.ocks.org/mike/shuffle/
       *
       * @param array
       * @returns {*}
       */
      /*
      var m = array.length
      var t, i

      // While there remain elements to shuffle…
      while (m) {
          // Pick a remaining element…
          i = Math.floor(Math.random() * m--)

          // And swap it with the current element.
          t = array[m]
          array[m] = array[i]
          array[i] = t
      }
      */
      return array
    },
    treeify (flat) { // flat has all microservices list
      /*
        map is a set object that is indexed by topic strings
        each entry of the map object has
          'topic': the topic string
          'children': the list of microservices (ms) their input topic is the 'topic'.
            'ms': field to link to the ms, and
            'map': field to link to its output topic's map entry.
          'element': a list of ms, their output topics are this map entry's 'topic'
        __root__ is the head entry of the whole map structure,
          that includes children their input topics cannot find any ms with its output topic to feed in.
      */
      let map = {__root__: { topic: '__root__', element: [], children: [] }}
      let msList = flat
      for (let msListIndex in msList) {
          let ms = msList[msListIndex]
          let inputTopic = ms.InputMessageTopic
          let outputTopic = ms.OutputMessageTopic

          if (inputTopic !== 'null') { // 'null' is ignored for the tree generation
            if (!map.hasOwnProperty(inputTopic)) { // for input topic
                map[inputTopic] = { topic: inputTopic, element: [], children: [] }
                map['__root__'].children.push({ms: null, map: map[inputTopic]})
                // not yet find any ms that has its out topic equals to this input topic, assigning null
            }
          }
          // init self
          if (outputTopic !== 'null') {
            if (!map.hasOwnProperty(outputTopic)) { // for output topic
                map[outputTopic] = { topic: outputTopic, element: [], children: [] }
            } else {
                map['__root__'].children = map['__root__'].children.filter(entry => entry.map.topic !== outputTopic)
                // as we found a ms with its output topic,
                // we remove entries from __root__'s children if the entries have input topics that are equal to this output topic
            }
            map[outputTopic].element.push(ms)
            // add ms to the element list, as the ms' output topic is equal to the map entry's topic
          }
          if (inputTopic !== 'null') {
            if (outputTopic !== 'null') {
              map[inputTopic].children.push({ms: ms, map: map[outputTopic]})
            } else {
              map[inputTopic].children.push({ms: ms, map: null})
            }
            // by it's definition
          }
      }
      let rootChildrenList = [...map['__root__'].children] // shallow cloning using spread operator
      // to process the cases of that input topics are with patterns, including wildcards, such as 't1/+/t3/+' fiting tp 't1/t2/t3'
      // if a map entry's 'topic' fit to one of root's children's input topics,
      // then, move the root's child to join as the map entry's children.
      for (let mapEntryIndex in map) {
          let mapEntry = map[mapEntryIndex]
          let mapEntryOutputTopic = mapEntry.topic
          for (let rootChildrenIndex in rootChildrenList) {
            let mapScan = rootChildrenList[rootChildrenIndex].map
            let mapScanInputTopic = mapScan.topic
            if (mapScanInputTopic !== mapEntryOutputTopic) {
              // check if the entry's topic fits to the root's child's input topic pattern
              // (input topic may be a pattern, including wildcards, expression)
              let topicMatched = MQTTPattern.exec(mapScanInputTopic, mapEntryOutputTopic)
              if (topicMatched !== null) { // means fitting to the output topic is input pattern
                // console.log('matched: ', mapScanInputTopic)
                if (rootChildrenList[rootChildrenIndex].ms === null && mapScan.element.length > 0) {
                  // __root__ supposes have children solely that cannot find their cooresponding ms
                  // 'element' is a number of ms that have the common output topic as this map entry's 'topic'
                  // 'children' is a number of {ms, map entry} their output topic is the 'topic' of this map entry.
                  for (let ms of mapScan.element) {
                    let found = mapEntry.children.find(child => child.ms === ms)
                    if (typeof found !== 'undefined' && found !== null) {
                    } else {
                      mapEntry.children.push({ms: ms, map: mapScan})
                    }
                  }
                } else { // this case is probably not exist ...
                  mapEntry.children.push({ms: rootChildrenList[rootChildrenIndex].ms, map: mapScan})
                }
                map['__root__'].children = map['__root__'].children.filter(entry => entry.map.topic !== mapScanInputTopic)
              }
            }
          }
      }
      // console.log('tree map: ', map)
      return map.__root__.children
    },
    /*
      cfg: {
        hasNextSibling: '&boxvr;',
        isLastChild: '&boxur;',
        ancestorHasNextSibling: '&boxv;',
        ancestorIsLastChild: ' '
      },
      decorator: function to add string to innerHTML,
      indent: indent string, account for depth level, used by decorator
    */
    treeIndent (branch, cfg, decorator, indent) {
      // console.log('treeIndent')
      indent = indent || []
      let that = this
      branch.forEach(function (node, i) {
          // console.log('node: ', node)
          if (node.map !== null) {
            decorator(node.ms, node.map.topic, node.map.element, indent.concat(
                i === branch.length - 1 ? cfg.isLastChild : cfg.hasNextSibling
            ))

            that.treeIndent(node.map.children, cfg, decorator, indent.concat(
                i === branch.length - 1 ? cfg.ancestorIsLastChild : cfg.ancestorHasNextSibling
            ))
          } else { // null case
            decorator(node.ms, '', null, indent.concat(
                i === branch.length - 1 ? cfg.isLastChild : cfg.hasNextSibling
            ))
          }
      })
    },
    async walkTree () {
      this.walkTreeLoading = true
      const userId = store.getters.userId
      const result = await API.get('mserviceApi', '/messagetrees', {
          'queryStringParameters': {
               'userId': userId
          }
      })
      // let mservicesList = JSON.parse(result)
      let mservicesList = result
      this.walkTreeLoading = false
      // console.log('message trees: ', mservicesList)
      /*
      var input = [
        { id: 1, parent_id: null, name: 'root' },
          { id: 2, parent_id: 1, name: 'bar' },
              { id: 5, parent_id: 2, name: 'baz' },
                  { id: 6, parent_id: 5, name: 'qux' },
                      { id: 7, parent_id: 6, name: 'quux' },
                      { id: 8, parent_id: 6, name: 'corge' },
              { id: 9, parent_id: 2, name: 'but' },
          { id: 3, parent_id: 1, name: 'fizz' },
          { id: 4, parent_id: 1, name: 'buzz' }
      ]
      */
      let log = document.getElementById('log')
      log.innerHTML = ''
      let that = this
      that.treeIndent(that.treeify(that.shuffle(mservicesList)), {
        hasNextSibling: '&boxvr;',
        isLastChild: '&boxur;',
        ancestorHasNextSibling: '&boxv;',
        ancestorIsLastChild: ' '
      }, function (ms, topic, element, indent) { // the decorator
        if (typeof element === 'undefined') {
          return
        }
        let msName = ''
        if (ms !== null) {
          msName = '<em class="reverse">' + ms.ServiceName + '</em> '
          // '<ins><em>' + ms.ServiceName + '</em></ins> '
        }
        log.innerHTML += indent.join(' ') + ' ' + msName +
                        ((topic !== '') ? ((msName !== '') ? '&boxh; ' : '') + topic : '') +
                        '\n'
        // let nameField = 'ServiceName' // 'name'
        // console.log('service name: ', element[nameField])
        /*
        for (let ms of element) {
          log.innerHTML += indent.join(' ') + ' ' + ms['InputMessageTopic'] + ' [' + ms[nameField] + '] ' + ms['OutputMessageTopic'] + '\n'
        }
        */
      })
      log.innerHTML += '\n\n'
    }
  } // methods
}
</script>

<style>
.at-bar {
  border-bottom: 1px solid green;
}

.reverse {
  background-color:black;
  color: white;
}

</style>
