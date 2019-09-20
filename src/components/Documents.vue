<template>
  <b-container>
    
        <!-- https://www.codeply.com/go/p2pModdHxc/bootstrap-independent-scrolling-columns -->
        <!--
          <div class="row">
        <div class="col-md-4" style="border-right: 1px solid blue; overflow-y: scroll; position: fixed; width: 300px;">
          <doc-sidebar></doc-sidebar>
        </div>
        <div class="col-md-8" style="overflow-y: scroll;">
          <router-view />
        </div>
        </div>
        -->
        <!-- reference source CSS https://amsik.github.io/liquor-tree/#Guides -->
        <div class="menu" style="border-right: 1px solid blue; top: 70px;" >         
          <doc-sidebar></doc-sidebar>
        </div>
        <div id="docMain" class="page">
            <router-view/>
        </div>

    
  </b-container>
</template>

<script>
// import Sidebar from './Sidebar'
// import { Auth } from 'aws-amplify'
// import * as apiGateway from '../lib/api-gateway'
// import jwt from 'jwt-decode'

import { PubSub } from 'aws-amplify'
import { eventBus } from '../main'

export default {
  /*
  components: {
    sidebar: Sidebar
  }, */
  name: 'user',
  data: function () {
    return {
      activeMenu: 'app',
      response: 'unknown',
      guess: 123,
      what: 0,
      loading: false,
      inputMessage: {
        date: 0,
        body: null
      },
      consoleOutputs: [],
      consoleSub: null
    }
  },
  computed: {
    isActiveMenu (order) {},
    accessToken () {
      return this.$store.getters.accessToken
    },
    idToken () {
      return this.$store.getters.idToken
    },
    profile () {
      return this.$store.getters.profile
    },
    firstname () {
      return this.$store.getters.profile.name.split(' ')[0]
    }
  },
  created () {
    // Subscribe
    let subscribeConsoleOutputTopic = 'aiot/' + this.$store.getters.username + '/+/console/output'

    console.log('subscribe topic: ', subscribeConsoleOutputTopic)
    this.consoleSub = PubSub.subscribe(subscribeConsoleOutputTopic).subscribe({
          next: data => {
              console.log('console output:', data)
              this.consoleOutputs = this.$store.getters.consoleOutputs
              this.inputMessage.date = (new Date().toLocaleTimeString())
              this.inputMessage.body = data.value
              let newMessage = Object.assign({}, this.inputMessage)
              if (this.consoleOutputs === null) {
                this.consoleOutputs = []
              }
              this.consoleOutputs.push(newMessage)
              this.$store.commit('setConsoleOutputs', this.consoleOutputs)
              eventBus.$emit('newConsoleOutput')
          },
          error: error => console.error('error: ', error)
    })
  },
  beforeDestroy () {
    this.consoleSub.unsubscribe()
  },
  methods: {

  }
}
</script>
<style>

/* 
  Explain to the position definitions,
  https://www.w3schools.com/css/css_positioning.asp 
*/
.menu {
  position: fixed; /* fixed to top/left/right/bottom viewport */
  top: 0;
  left: 0;
  right: 75%; /* right boundary is at 75% from the rightmost */
  bottom: 0;
  width: 25%;
  overflow-y: scroll;
  -webkit-overflow-scrolling: touch; /* for iphone .. touch devices */
  border-right: 1px solid #efefef; 
}

.page {
  position: fixed;
  left: 25%;
  top: 70px;  /* below the top menu portion */
  right: 0%;  /* from rightmost */
  bottom: 0%; /* to the end of the bottom */
  overflow-y: scroll;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 80px;
}

</style>

