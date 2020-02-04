<template>
    <div>
       <b-row align-v="center" class="at-bottombar">
          <b-col align="start" sm="4">
            <h4>IoT Devices <small>({{things.length}})</small></h4>
          </b-col>
         <b-col sm="4">
            <b-form-input class="at-border" id="publishTopic"
              type="text" 
              v-model="$parent.searchString"
              required
              placeholder="Search ...">
            </b-form-input>
          </b-col>          
          <b-col sm="4" align="end">
            <b-button variant="info" @click="refreshThings()">Refresh</b-button>
            <b-button variant="success" @click="createThing()" v-b-popover.hover.bottom="'Create new IoT device'" >Create</b-button>
            <!-- <b-button variant="light" v-b-modal.scanDeviceModal v-b-popover.hover.bottom="'Add new device from QR Code'" >Scan</b-button> -->
          </b-col>
          <!--  <qrcode-stream @decode="onQRCodeDecode"></qrcode-stream> -->
      </b-row>
      <b-modal id="scanDeviceModal" ref="scanDeviceModalRef" title="Scan Device" ok-only ok-variant="secondary" ok-title="Cancel">
        <qrcode-stream @decode="onQRCodeDecode"></qrcode-stream>
      </b-modal>
      <!-- VUE reference https://vuejs.org/v2/guide/list.html -->
        <!-- <router-view class="child"></router-view> -->
       <!-- style="max-width: 20rem;" 
       :title="thing.ThingId"
       <b-button :href="'/user/edit/'+index" variant="primary">Go somewhere</b-button>
       v-if="typeof thingsMap[thing.ThingId] !== 'undefined'"
       -->
       <div v-if="isLoading" class="mb-2">
        <b-row>
          <b-col align="center">
            <spinner  size="medium" />
          </b-col>
        </b-row>
      </div>
       <div class="text-center mt-5" v-if="things.length === 0">
              No IoT devices available.
      </div>
      <b-row class="mt-2">
        <b-col class="at-scroll">
          <b-card-group columns>
            <b-modal id="modalDeleteConfirm"
                  hide-header 
                  size="sm"
                  @ok="deleteThing(deletingThingIndex)"
                  >
              <div class="text-center">
                <h5>Delete the thing?</h5>
              </div>                  
            </b-modal>
          <!-- img-src="/static/photo-54.png" -->
           <b-card v-for="(thing) in filteredThings" :key="thing.ThingId"
              header = " "
              class="at-card-thing" 
              >
              <b-row align-v="center">
                <b-col lg="9">
                  <h5 class="card-text">
                    {{thing.ThingName}}
                  </h5>
                </b-col>
                <b-col lg="3" align="end">
                  <b-dropdown variant="secondary">
                    <!-- VUE reference: https://vuejs.org/v2/guide/events.html -->
                    <b-dropdown-item @click.stop="showThingStatus(things.indexOf(thing))">Dashboard</b-dropdown-item>
                    <b-dropdown-item @click.stop="showThingDetail(things.indexOf(thing))">Edit</b-dropdown-item>
                    <b-dropdown-item v-b-modal.modalDeleteConfirm @click="deletingThingIndex=things.indexOf(thing)">Delete</b-dropdown-item>
                  </b-dropdown>
                </b-col>
              </b-row>
              <b-row class="mt-1">
                <b-col align="center">
                  <b-button size="sm" variant="success" v-b-popover.hover.bottomright="thingsMap[thing.ThingId]" v-if="typeof thingsMap[thing.ThingId] !== 'undefined'" @click.stop="launchThingNodeRed(thingsMap[thing.ThingId])"><i class="fas fa-bullseye"></i></b-button>
                  <!-- 'Launch Node-RED from device' -->
                </b-col>
              </b-row>
              <b-row class="ml-0 mt-1">
                <b-col class="at-border at-desc-display">
                  <vue-markdown>{{thing.ThingDesc}}</vue-markdown>
                </b-col>               
              </b-row>
            </b-card>
          </b-card-group>
        </b-col>
      </b-row>
    </div>
</template>

<script>
// import { API, Auth } from 'aws-amplify'
import atHelper from '../aiot-helper'
import { API, PubSub } from 'aws-amplify'
// AWS Amplify API reference
// https://aws-amplify.github.io/amplify-js/media/api_guide.html

export default {
  name: 'mythings',
  data: function () {
    return {
      activeMenu: 'app',
      response: 'unknown',
      guess: 123,
      what: 0,
      loading: false,
      items: [ 'apple', 'monkey' ],
      iotClient: null,
      subs: [],
      thingsMap: {'x': 1},
      testFlag: false,
      things: null,
      isLoading: false,
      deletingThingIndex: -1
    }
  },
  computed: {
    // things () {
    //   let thingList = this.$store.getters.things
      // console.log('things: ', thingList)
    //   return thingList // this.items
    // },
    testCall (thingId) {
      console.log('testCall called:')
      let ip = this.thingsMap.get(thingId)
      if (ip !== undefined && ip !== null) {
        console.log('testCall: ', ip)
        return ip
      }
      return ''
    },
    filteredThings () {
      let foundThings = this.things.filter(thing => {
        if (thing.hasOwnProperty('ThingName') === false) {
          return false
        }
        return thing.ThingName.toLowerCase().includes(this.$parent.searchString.toLowerCase())
      })
      foundThings.sort(function (a, b) {
        return a.ThingName.localeCompare(b.ThingName)
      })
      return foundThings
    }
  },
  watch: {
    things: {
        handler: function (newList, oldList) {
          this.$forceUpdate()
        },
        deep: true
    }
  },
  async created () {
      // console.log('MyThingsList created:')
      this.things = this.$store.getters.things
      if (this.things === null) {
        this.things = []
      }
      console.log('things now: ', this.things)
      this.thingsMap = new Map()
      if (this.things.length === 0) {
        await this.refreshThings()
      }

      for (let i in this.things) {
        let thing = this.things[i]

        // Subscribe client connected
        this.subs.push(PubSub.subscribe('$aws/events/presence/connected' + thing.ThingId).subscribe({
          next: data => {
            console.log(data.value.clientId, ': ', data.value.eventType)
            PubSub.publish('aiot/' + thing.ThingId + '/alive/req', { msg: 'update alive' })
          },
          error: error => console.error('error: ', error),
          close: () => console.log('Done')
        }))
        // Subscribe client disconnected
        this.subs.push(PubSub.subscribe('$aws/events/presence/disconnected' + thing.ThingId).subscribe({
          next: data => {
            console.log(data.value.clientId, ': ', data.value.eventType)
            this.thingsMap.delete(thing.ThingId)
          },
          error: error => console.error('error: ', error),
          close: () => console.log('Done')
        }))
        // Subscribe alive response
        this.subs.push(PubSub.subscribe(['aiot/' + thing.ThingId + '/alive/resp', 'aiot/' + thing.UserId + '/' + thing.ThingId + '/alive/resp']).subscribe({
          next: data => {
              console.log('alive resp:', data)
              if (data.hasOwnProperty('value') && data.value.hasOwnProperty('hostIp')) {
                let deviceIpAddr = data.value.hostIp
                // const regex = new RegExp('/contact\\b', 'g');
                // or /.../;
                let thingsMatched = this.things.filter(function (thy) {
                  // console.log('match: ', thy)
                  return thy.ThingId.match(thing.ThingId)
                })
                thingsMatched[0].ipAddr = deviceIpAddr
                this.thingsMap[thing.ThingId] = deviceIpAddr
                this.$set(this.thingsMap, thing.ThingId, deviceIpAddr)
                this.$set(this.things, 0, this.things[0])
                // console.log('thingsMap: ', this.thingsMap)
                // console.log('thingsMap value: ', this.thingsMap[thing.ThingId])
                this.testFlag = true
              }
          },
          error: error => console.error('error: ', error),
          close: () => console.log('Done')
        }))
        // Publish client alive-req, wait for alive-resp
        await PubSub.publish('aiot/' + thing.ThingId + '/alive/req', { msg: 'update alive' })
      } // for loop
  },
  mounted () {
  },
  beforeDestroy () {
    // Unsubscribe client connected
    // Unsubscribe client disconnected
    for (let i in this.subs) {
      let subscribe = this.subs[i]
      subscribe.unsubscribe()
    }
    // console.log('MyThingsList beforeDestroy:')
  },
  methods: {
    truncatedString (textStr, length) {
      return (textStr.length < (length)) ? textStr : (textStr.substring(0, length - 4) + '...')
    },
    launchThingNodeRed (ipAddr) {
      // this.$router.push({name: 'thing', params: { url: ipAddr }})
      window.open('http://' + ipAddr + ':1880')
    },
    connectCallback () {
      // console.log('connectCallback')
    },
    messageCallback () {
      // console.log('messageCallback')
    },
    closeCallback () {
      // console.log('closeCallback')
    },
    async refreshThings () {
      this.isLoading = true
      await atHelper.reloadThings()
      this.isLoading = false
      this.things = this.$store.getters.things
      if (this.things === null) {
        this.things = []
      }
    },
    createThing () {
      console.log('createThing')
      this.$router.push({ name: 'newthing' })
    },
    showThingDetail (index) {
      // console.log('detail things:')
      this.$router.push({name: 'edit', params: { thingIndex: index }})
    },
    showThingStatus (index) {
      // console.log('detail things:')
      this.$router.push({name: 'thing_status', params: { thingIndex: index }})
    },
    deleteThing (index) {
      console.log('deleteThing')
      const userId = this.$store.getters.userId
      let thing = this.$store.getters.things[index]
      console.log('deleteThing: thing: ', thing)
      API.del('thingApi', '/things', {
            'queryStringParameters': {
                 'userId': userId,
                 'certId': thing.CertId,
                 'thingId': thing.ThingId
            }
      }).then(response => {
        // TODO remove the thing entry from list
        // console.log('response: ', response)
        if (response === 'success' || response.hasOwnProperty('success')) {
          // console.log('update things local')
          this.things.splice(index, 1)
          this.$store.commit('setThings', this.things)
        }
      }).catch(error => {
        console.log(error.response)
      })
    },
    showDeleteConfirm () {
      console.log('showDeleteConfirm')
      console.log('refs:', this.$refs)
      this.$refs['modalConfirmRef'].show()
    },
    onQRCodeDecode (decodedString) {
      console.log('d: ', decodedString)
      this.$refs.scanDeviceModalRef.hide()
    }
  }
}
</script>

<style>
.at-scroll {
  /* height : 500px ; */
  overflow-y: auto;
}

</style>

<style scoped>

</style>
