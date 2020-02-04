<template>
   <div> 
      <b-row align-v="center" class="at-bottombar">
        <b-col align="start">
          <h4>Console</h4>
        </b-col>
      </b-row>
      <b-row>
        <b-col sm="6">  <!-- left half -->
          <b-row align-v="center">
            <b-col sm="6" align="start">
              <h5>Console output</h5>
            </b-col>
            <b-col sm="6" align="end">
              <b-button variant="info" @click="scrollToEnd()" v-b-popover.hover.bottom="'Scroll to the end'">To end</b-button>
              <b-button variant="info" @click="resetConsoleOutput()">Clear</b-button> 
            </b-col>
          </b-row>
          <b-row class="mt-2 ml-0 mr-0" style="height:440px;" >
            <b-container style="border: 1px solid black; padding: 10px 0px 10px 5px; height: 100%;">
              <b-row v-if="consoleOutputs === null || consoleOutputs.length === 0" align-v="center" style="height:100%;">
                <b-col align="center" style="color: grey;">
                  Display messages with 'console/output' topic.
                </b-col>
              </b-row>
              <div v-else id="consoleOutputContainer" class="at-scroll">
                  <p style="line-height: 1.1; margin-top:0em; margin-bottom:5px; " v-for="(output, index) in consoleOutputs" :key="index">
                    <small><b>{{output.date}}</b>:<b>{{output.fromService}}</b></small>: {{output.body}}
                  </p>     
              </div>
            </b-container>
          </b-row>
        </b-col>
        <b-col sm="6">  <!-- right half -->
          <b-row align-v="center">
            <b-col sm="6" align="start">
              <h5>Console input</h5>
            </b-col>
            <b-col sm="6" align="end">
              <b-button variant="info" @click="publishMessage()">Publish Message</b-button>
            </b-col>
          </b-row>
          <b-row class="mt-2">
            <b-col>
              <b-form @submit.prevent="onSubmit" @reset="onReset">
                <b-form-group id="publishMessageTopicGroup"
                        label="Message topic"
                        label-for="publishTopic"
                        >
                  <b-form-input class="at-border" id="publishTopic"
                          type="text" 
                          v-model="inputMessage.topic"
                          required
                          placeholder="Enter topic ( e.g. console/output )">
                  </b-form-input>
                </b-form-group>
              </b-form>
            </b-col>
          </b-row>
          <b-modal ref="missJsonModal" ok-only title="Failed to publish message" >
                The message body is not a JSON.
          </b-modal>
          <b-row>
            <b-col>
              <b-form @submit.prevent="onSubmit" @reset="onReset">
                <b-form-group id="publishMessageBodyGroup"
                        label="Message body"
                        label-for="publishTopic"
                        description="Use this to publish message to AIoThings."
                        >
                  <codemirror v-model="inputMessage.body" ref="sourceEditor" placeholder='Must be a JSON, e.g. { "item": "value" }'>
                  </codemirror>
                </b-form-group>
              </b-form>
            </b-col>
          </b-row>         
        </b-col>
      </b-row>
  </div> 
</template>

<script>

import { PubSub } from 'aws-amplify'
import { eventBus } from '../main'
import JSON5 from 'json5'

export default {
  name: 'myconsole',
  data: function () {
    return {
      inputMessage: {
        topic: '',
        body: ''
      },
      consoleOutputs: []
    }
  },
  computed: {
    codemirror () {
      console.log('codemirror')
      return this.$refs.sourceEditor.codemirror
    }
  },
  watch: {
    inputMessage: {
        handler: function (newMessage) {
          if (newMessage.topic === undefined || newMessage.body === undefined) {
            return
          }
          // console.log('input: ', newMessage)
          this.$store.commit('setConsoleInput', newMessage)
        },
        deep: true
    }
  },
  created () {
    this.inputMessage.topic = this.$store.getters.consoleInputTopic
    this.inputMessage.body = this.$store.getters.consoleInputBody
    eventBus.$on('newConsoleOutput', this.onNewConsoleOutput)
     this.consoleOutputs = this.$store.getters.consoleOutputs
  },
  beforeDestroy () {
  },
  methods: {
    scrollToEnd () {
      var container = this.$el.querySelector('#consoleOutputContainer')
      container.scrollTop = container.scrollHeight
    },
    onSubmit () {
    },
    onReset () {
    },
    resetConsoleOutput () {
      this.consoleOutputs = null
      this.$store.commit('setConsoleOutputs', this.consoleOutputs)
    },
    onNewConsoleOutput () {
      this.consoleOutputs = this.$store.getters.consoleOutputs
      this.scrollToEnd()
      // this.$forceUpdate()
    },
    async publishMessage () {
      if (this.inputMessage.topic && this.inputMessage.topic !== ' ' && this.inputMessage.topic !== '') {
        let bodyJson = null
        try {
          bodyJson = JSON5.parse(this.inputMessage.body)
        } catch (e) {
          this.$refs.missJsonModal.show()
          return
        }
        let topic = 'aiot/' + this.$store.getters.userId + '/console/' + this.inputMessage.topic
        await PubSub.publish(topic, bodyJson)
        console.log('message sent: ', topic)
      }
    }
  }
}
</script>

<style scoped>
div.at-scroll {
  /* height : 500px ; */
  overflow-y: scroll; /* auto */
  max-height: 100%; /* 65vh; 100% */
}
</style>
