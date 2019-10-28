<template>
  <b-container fluid class="bv-example-row" >
    <div style="min-height: 500px">
      <!-- <b-alert :show="loading" variant="info">Loading...</b-alert> -->
      <b-row>
        <b-col sm="3" lg="2" style="border-right: 1px solid blue">
          <at-sidebar menu="user"></at-sidebar>
        </b-col>
        <b-col sm="9" lg="10">
          <router-view />
        </b-col>
      </b-row>
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
      consoleSub: null,
      searchString: {
        mservice: '',
        api: '',
        thing: ''
      }
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
          error: error => console.error('error: ', error),
          close: () => console.log('Done')
    })
  },
  mounted () {
    this.$router.replace('/user/mythings')
  },
  beforeDestroy () {
    this.consoleSub.unsubscribe()
  },
  methods: {

  }
}
</script>
