<template>
  <b-container fluid> 
    <div>
       <b-row align-v="center" class="at-bottombar">
          <b-col align="start">
            <h4>IoT Devices ({{things.length}})</h4>
          </b-col>
          <b-col sm="auto" align="end">
            <b-button variant="info" @click="refreshThings()">Refresh</b-button>
            <b-button variant="success" @click="createThing()" v-b-popover.hover.bottom="'Create new IoT device'" >Create</b-button>
          </b-col>
      </b-row>
      <!-- VUE reference https://vuejs.org/v2/guide/list.html -->
        <!-- <router-view class="child"></router-view> -->
       <!-- style="max-width: 20rem;" 
       :title="thing.ThingId"
       <b-button :href="'/user/edit/'+index" variant="primary">Go somewhere</b-button>
       v-if="typeof thingsMap[thing.ThingId] !== 'undefined'"
       -->
       <div class="text-center mt-5" v-if="things.length === 0">
              No IoT devices available.
      </div>
      <b-row class="mt-2">
        <div class="at-scroll">
          <b-card-group columns>
           <b-card v-for="(thing, index) in things" :key="thing.ThingId"
              img-src="/static/photo-54.png"
              img-alt="Image"
              img-top
              tag="article"
              class="mb-2 at-card">
              <b-row>
                <b-col align="start">
                  <h5 class="card-text">
                    {{thing.ThingName}}
                  </h5>
                </b-col>
                <b-col align="end">   
                  <b-dropdown variant="secondary" class="mx-0" right >
                    <!-- VUE reference: https://vuejs.org/v2/guide/events.html -->
                    <b-dropdown-item @click.stop="showThingDetail(index)">Edit</b-dropdown-item>
                    <b-dropdown-item @click.stop="deleteThing(index)" >Delete</b-dropdown-item>
                  </b-dropdown>
                </b-col>
              </b-row>
              <b-row>
                <b-col align="start">
                  <b-button size="sm" variant="success" v-b-popover.hover.bottomright="'Launch Node-RED from device'" v-if="typeof thingsMap[thing.ThingId] !== 'undefined'" @click.stop="launchThingNodeRed(thingsMap[thing.ThingId])">{{thingsMap[thing.ThingId]}}</b-button>
                </b-col>
              </b-row>
              <b-row class="ml-0 mt-1">
                <b-col class="at-border" style="white-space: pre-wrap;">{{thing.ThingDesc}}</b-col>
              </b-row>
            </b-card>
          </b-card-group>
        </div>
      </b-row>
    </div>
  </b-container> 
</template>

<script>
// import { API, Auth } from 'aws-amplify'
import atHelper from '../aiot-helper'
// import * as IoT from '../lib/aws-iot'
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
      things: null
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
      console.log('MyThingsList created:')
      this.things = this.$store.getters.things
      if (this.things === null) {
        this.things = []
      }
      // console.log('things now: ', this.things)
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
          error: error => console.error('error: ', error)
        }))
        // Subscribe client disconnected
        this.subs.push(PubSub.subscribe('$aws/events/presence/disconnected' + thing.ThingId).subscribe({
          next: data => {
            console.log(data.value.clientId, ': ', data.value.eventType)
            this.thingsMap.delete(thing.ThingId)
          },
          error: error => console.error('error: ', error)
        }))
        // Subscribe alive response
        this.subs.push(PubSub.subscribe('aiot/' + thing.ThingId + '/alive/resp').subscribe({
          next: data => {
              console.log('alive resp:', data)
              let deviceIpAddr = data.value.hostIp
              // const regex = new RegExp('/contact\\b', 'g');
              // or /.../;
              let thingsMatched = this.things.filter(function (thy) {
                 console.log('match: ', thy)
                 return thy.ThingId.match(thing.ThingId)
              })
              thingsMatched[0].ipAddr = deviceIpAddr
              this.thingsMap[thing.ThingId] = deviceIpAddr
              this.$set(this.thingsMap, thing.ThingId, deviceIpAddr)
              this.$set(this.things, 0, this.things[0])
              console.log('thingsMap: ', this.thingsMap)
              console.log('thingsMap value: ', this.thingsMap[thing.ThingId])
              this.testFlag = true
          },
          error: error => console.error('error: ', error)
        }))
        // Publish client alive-req, wait for alive-resp
        await PubSub.publish('aiot/' + thing.ThingId + '/alive/req', { msg: 'update alive' })
      } // for loop
  },
  beforeDestroy () {
    // Unsubscribe client connected
    // Unsubscribe client disconnected
    for (let i in this.subs) {
      let subscribe = this.subs[i]
      subscribe.unsubscribe()
    }
    console.log('MyThingsList beforeDestroy:')
  },
  methods: {
    launchThingNodeRed (ipAddr) {
      // this.$router.push({name: 'thing', params: { url: ipAddr }})
      window.open('http://' + ipAddr + ':1880')
    },
    connectCallback () {
      console.log('connectCallback')
    },
    messageCallback () {
      console.log('messageCallback')
    },
    closeCallback () {
      console.log('closeCallback')
    },
    async refreshThings () {
      await atHelper.reloadThings()
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
      console.log('detail things:')
      this.$router.push({name: 'edit', params: { thingIndex: index }})
    },
    deleteThing (index) {
      console.log('deleteThing')
      const username = this.$store.getters.username
      let thing = this.$store.getters.things[index]
      console.log('deleteThing: thing: ', thing)
      API.del('thingApi', '/things', {
            'queryStringParameters': {
                 'userId': username,
                 'certId': thing.CertId,
                 'thingId': thing.ThingId
            }
      }).then(response => {
        // TODO remove the thing entry from list
        console.log('response: ', response)
        if (response === 'success' || response.hasOwnProperty('success')) {
          console.log('update things local')
          this.things.splice(index, 1)
          this.$store.commit('setThings', this.things)
        }
      }).catch(error => {
        console.log(error.response)
      })
    }
  }
}
</script>

<style>

.at-border {
  border: 1px solid #a78;
  padding: 5px;
}

.at-scroll {
  /* height : 500px ; */
  overflow-y: auto;
}

.at-card:hover {
  /* background-color: red;
     opacity: 0.5;
  */
  box-shadow : 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
  /* box-shadow: 1px -1px teal; */
}

div.at-bottombar {
  /* background-color : grey; */
  border-bottom: 1px solid grey
}
</style>
