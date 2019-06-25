<template>
  <div>
      <div class="at-bottombar">
        <b-row align-v="center">
          <b-col  align="start">
            <p class="h4">My Microservices ({{mservicesCounter}})</p>
          </b-col>
          <b-col sm="auto" align="end">
            <b-button variant="info" v-b-modal.walkTreeModal v-b-popover.hover.bottom="'Show microservices\' message trees'" @click="walkTree()">Tree</b-button> 
            <b-button variant="info" @click="exportServices()" v-b-popover.hover.bottom="'Export all designs to local files'">Export</b-button> 
            <b-button variant="info" @click="reloadServices()">Refresh</b-button>
            <b-button variant="success" @click="createService()" >Create</b-button>
          </b-col>
        </b-row>
      </div>
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
        <div class="at-scroll">
          <b-card-group columns>
           <!--  img-src="https://picsum.photos/600/300/?image=25" -->
           <b-card v-for="(service, index) in services" :key="service.ServiceName"
              img-src="/static/photo-27.png"
              img-top
            >
              <b-row>
                <b-col>
                  <h5 class="card-text">
                    {{service.ServiceName}}
                  </h5>
                </b-col>
                <b-col align="end">   
                  <b-dropdown variant="secondary" class="mx-0" right >
                    <!-- VUE reference: https://vuejs.org/v2/guide/events.html -->
                    <b-dropdown-item @click = "showServiceDetail(index)" >Edit</b-dropdown-item>
                    <b-dropdown-item @click = "copyService(index)" >Duplicate</b-dropdown-item>        
                    <b-dropdown-item @click.stop="deleteService(index)" >Delete</b-dropdown-item>
                  </b-dropdown>
                </b-col>
              </b-row>
              <b-row class="ml-0 mt-1 at-bar">  
                <p class="card-text">
                  {{service.ServiceDesc}}
                </p>
              </b-row>
              <b-row class="ml-0 mt-1">  
                <p class="card-text">
                  Subscribe: <code>{{service.InputMessageTopic}}</code>
                </p>
              </b-row>
              <b-row class="ml-0">  
                <p class="card-text">
                  Publish: <code>{{service.OutputMessageTopic}}</code>
                </p>
              </b-row>
            </b-card>
          </b-card-group>
        </div>
      </b-row>
  </div>
</template>

<script>
import Sidebar from './Sidebar'
import atHelper from '../aiot-helper'
import store from '../store'
import { API } from 'aws-amplify'
import MQTTPattern from 'mqtt-pattern'

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
      services: {},
      testResult: '',
      walkTreeLoading: false,
      isLoading: false
    }
  },
  watch: {
    services: {
        handler: function (newList, oldList) {
          console.log('services changed:')
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
  computed: {},
  created () {
  },
  async mounted () { // enter everytime the page becomes active
    this.services = this.$store.getters.mservices
    if (this.services !== null) {
      this.mservicesCounter = this.services.length
    } else {
      this.services = {}
      this.mservicesCounter = 0
      await this.reloadServices()
    }
    console.log('mounted services no.:', this.mservicesCounter)
  },
  methods: {
    async exportServices () {
      for (let service of this.services) {
        await atHelper.exportService(service)
      }
    },
    async reloadServices () {
      const username = store.getters.username
      console.log('reloadServices: username: ', username)
      this.isLoading = true
      const result = await API.get('mserviceApi', '/mservices', {
          'queryStringParameters': {
               'userId': username
          }
      })
      this.isLoading = false
      this.testResult = result
      let resultJson = JSON.parse(result)
      console.log('result: ', resultJson)
      store.commit('setMservices', resultJson)
      // atHelper.reloadServices()
      this.services = this.$store.getters.mservices
      if (this.services === null) {
        this.services = {}
      }
      this.mservicesCounter = this.services.length
    },
    createService () {
      console.log('createService')
      this.$router.push({ name: 'newService' })
    },
    showServiceDetail (index) {
      this.$router.push({name: 'editService', params: { serviceIndex: index, serviceSource: this.services }})
    },
    copyService (index) {
      console.log('copyService to: ', this.services[index])
      this.$router.push({name: 'newService', params: { serviceIndex: index, copiedService: this.services[index] }})
    },
    deleteService (index) {
      const username = this.$store.getters.username
      let mservice = this.$store.getters.mservices[index]
      API.del('mserviceApi', '/mservices', {
            'queryStringParameters': {
                 'userId': username,
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
      let map = {__root__: { topic: '__root__', element: [], children: [] }}
      let msList = flat
      for (let msListIndex in msList) {
          let ms = msList[msListIndex]
          let inputTopic = ms.InputMessageTopic
          let outputTopic = ms.OutputMessageTopic

          if (!map.hasOwnProperty(inputTopic)) { // for input topic
              map[inputTopic] = { topic: inputTopic, element: [], children: [] }
              map['__root__'].children.push({ms: null, map: map[inputTopic]})
          }
          // init self
          if (!map.hasOwnProperty(outputTopic)) { // for output topic
              map[outputTopic] = { topic: outputTopic, element: [], children: [] }
          } else {
              map['__root__'].children = map['__root__'].children.filter(entry => entry.map.topic !== outputTopic)
          }
          map[outputTopic].element.push(ms)
          map[inputTopic].children.push({ms: ms, map: map[outputTopic]})
      }
      let rootChildrenList = [...map['__root__'].children]
      for (let mapEntryIndex in map) {
          let mapEntry = map[mapEntryIndex]
          let mapEntryOutputTopic = mapEntry.topic
          for (let rootChildrenIndex in rootChildrenList) {
            let mapScan = rootChildrenList[rootChildrenIndex].map
            let mapScanInputTopic = mapScan.topic
            if (mapScanInputTopic !== mapEntryOutputTopic) {
              let topicMatched = MQTTPattern.exec(mapScanInputTopic, mapEntryOutputTopic)
              if (topicMatched !== null) {
                // console.log('matched: ', mapScanInputTopic)
                if (rootChildrenList[rootChildrenIndex].ms === null && mapScan.element.length > 0) {
                  for (let ms of mapScan.element) {
                    let found = mapEntry.children.find(child => child.ms === ms)
                    if (typeof found !== 'undefined' && found !== null) {
                    } else {
                      mapEntry.children.push({ms: ms, map: mapScan})
                    }
                  }
                } else {
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
      indent = indent || []
      let that = this
      branch.forEach(function (node, i) {
          decorator(node.ms, node.map.topic, node.map.element, indent.concat(
              i === branch.length - 1 ? cfg.isLastChild : cfg.hasNextSibling
          ))

          that.treeIndent(node.map.children, cfg, decorator, indent.concat(
              i === branch.length - 1 ? cfg.ancestorIsLastChild : cfg.ancestorHasNextSibling
          ))
      })
    },
    async walkTree () {
      this.walkTreeLoading = true
      const username = store.getters.username
      const result = await API.get('mserviceApi', '/messagetrees', {
          'queryStringParameters': {
               'userId': username
          }
      })
      let mservicesList = JSON.parse(result)
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
      }, function (ms, topic, element, indent) {
        if (typeof element === 'undefined') {
          return
        }
        let msName = ''
        if (ms !== null) {
          msName = '[' + ms.ServiceName + '] '
        }
        log.innerHTML += indent.join(' ') + ' ' + msName + topic + '\n'
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
div.at-bottombar {
  /* background-color : grey; */
  padding-bottom: 5px;
  margin-bottom: 5px;
  border-bottom: 1px solid grey
}

.at-bar {
  border-bottom: 1px solid green;
}

</style>
