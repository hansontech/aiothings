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
        <!-- <div style="border-right: 1px solid blue; overflow-y: scroll; position: fixed; width: 250px; top: 70px; left: 0; bottom: 0;"> -->
        <div class="menu" style="border-right: 1px solid blue; top: 70px;" >
         
          <doc-sidebar></doc-sidebar>
        </div>
        <!-- <div style="position: fixed; overflow-y: auto; padding-left: 240px; top: 140px; right: 0; bottom: 0;"> -->
        <div class="page">
          <div class = 'page-content'>
            <router-view/>
          </div>
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
#left {
    position: absolute;
    top: 70px;
    bottom: 0;
    left: 0;
    /* min-width: 100px; */
    width: 30%;
    overflow-y: scroll; 
}
#right {
    position: absolute;
    top: 100px;
    bottom: 0;
    right: 0;
    overflow-y: scroll;
    width: 70%;
}

.menu {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 240px;
  overflow-y: scroll;
  border-right: 1px solid #efefef; }

.page {
  padding-left: 240px; 
  }

.page-content {
  /* padding: 0px;
  margin: 0 auto; */
  width: 885px;
  max-width: 100%;
  padding-bottom: 80px;
  }

</style>

