<template>
  <b-container fluid> 
    <div>
       <b-row align-v="center" class="at-sidebar">
          <b-col col cols="7" class="mt-2">
            <h2 class="h2">IoT Devices</h2>
          </b-col>
          <b-col align="end">
            <b-button variant="primary" @click="refreshThings()">Refresh</b-button>
            <b-button aligh="end" variant="success" @click="createThing()" >Add new device</b-button>
          </b-col>
      </b-row>
      <!-- VUE reference https://vuejs.org/v2/guide/list.html -->
        <!-- <router-view class="child"></router-view> -->
       <!-- style="max-width: 20rem;" 
       :title="thing.ThingId"
       <b-button :href="'/user/edit/'+index" variant="primary">Go somewhere</b-button>
       -->
      <b-row class="mt-2">
        <div class="at-scroll">
          <b-card-group columns>
           <b-card v-for="(thing, index) in things" :key="thing.ThingId"
              img-src="https://picsum.photos/600/300/?image=25"
              img-alt="Image"
              img-top
              @click = "showThingDetail(index)"
              tag="article"
              class="mb-2 at-card">
              <b-row>
                <b-col align="start">
                  <b-button size="sm" v-if="thingsMap[thing.ThingId] !== undefined" variant="success" @click.stop="launchThingNodeRed(thingsMap[thing.ThingId])">{{thingsMap[thing.ThingId]}}</b-button>
                </b-col>
                <b-col align="end">   
                  <b-dropdown variant="success" class="mx-1" right >
                    <!-- VUE reference: https://vuejs.org/v2/guide/events.html -->
                    <b-dropdown-item @click.stop="deleteThing(index)" >Delete</b-dropdown-item>
                  </b-dropdown>
                </b-col>
              </b-row>
              <b-row class="ml-3 mt-1">  
                <p class="card-text">
                  {{thing.ThingDesc}}
                </p>
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
// import AWS from 'aws-sdk'

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
    things: function () {
      // this.testFlag = true
    }
  },
  async created () {
      console.log('MyThingsList created:')
      this.things = this.$store.getters.things
      this.thingsMap = new Map()
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
      }
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
    refreshThings () {
      atHelper.reloadThings()
    },
    createThing () {
      console.log('createThing')
      this.$router.push({ name: 'newthing' })
    },
    showThingDetail (index) {
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
        if (response === 'success') {
          let things = this.$store.getters.things
          things.splice(index, 1)
          this.$store.commit('setThings', things)
        }
      }).catch(error => {
        console.log(error.response)
      })
    }
  }
}
</script>

<style>


.at-scroll {
  // height : 500px ;
  overflow-y: auto;
}

.at-card:hover {
  // background-color: red;
  // opacity: 0.5;
  box-shadow : 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
  // box-shadow: 1px -1px teal;
}

div.at-sidebar {
  // background-color : grey;
  border-bottom: 1px solid grey
}
</style>
