<template>
   <b-container fluid> 
      <b-row align-v="center" class="at-bottombar">
        <b-col align="start">
          <h4>Console</h4>
        </b-col>
      </b-row>
      <b-row>
        <b-col sm="8" lg="6">
          <b-row align-v="center">
             <b-col align="start">
              <h6>Console output</h6>
             </b-col>
            <b-col sm="auto" align="end">
              <b-button variant="info" @click="scrollToEnd()" v-b-popover.hover.bottom="'Scroll to the end'">To end</b-button>
              <b-button variant="info" @click="resetConsoleOutput()">Clear</b-button> 
            </b-col>
          </b-row>
          <b-row class="mt-3" style="border: 1px solid black; height:410px;" >
            <b-container style="padding: 10px 0px 10px 5px; height: 100%;">
              <div id="consoleOutputContainer" class="at-scroll">
                  <p style="line-height: 1.1; margin-top:0em; margin-bottom:5px; " v-for="(output, index) in consoleOutputs" :key="index">
                    <small><b>{{output.date}}</b>:</small> {{output.body}}
                  </p>     
              </div>
            </b-container>
          </b-row>
        </b-col>
        <b-col sm="4" lg="6">
          <b-row align-v="center">
            <b-col align="start">
              <h6>Console input</h6>
            </b-col>
            <b-col sm="auto" align="end">
              <b-button variant="info" @click="publishMessage()">Publish Message</b-button>
            </b-col>
          </b-row>
          <b-row class="ml-1">
            <b-form @submit="onSubmit" @reset="onReset" style="width:95%">
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
          </b-row>
          <b-modal ref="missJsonModal" ok-only title="Failed to publish message" >
                The message body is not a JSON.
          </b-modal>
          <b-row class="ml-1">
            <b-form @submit="onSubmit" @reset="onReset" style="width:95%">
              <b-form-group id="publishMessageBodyGroup"
                      label="Message body"
                      label-for="publishTopic"
                      description="Use this to publish message to AIoThings."
                      >
                <codemirror v-model="inputMessage.body" ref="sourceEditor" placeholder='Must be a JSON, e.g. { "item": "value" }'>
                </codemirror>
              </b-form-group>
            </b-form>
          </b-row>         
        </b-col>
      </b-row>
      <p></p>
  </b-container> 
</template>

<script>

import { PubSub } from 'aws-amplify'
import { eventBus } from '../main'

export default {
  name: 'myconsole',
  data: function () {
    return {
      inputMessage: {
        topic: '',
        body: ''
      },
      incomingMessage: {
        topic: '',
        body: null
      },
      consoleOutputs: [],
      consoleSub: null
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
          console.log('input: ', newMessage)
          this.$store.commit('setConsoleInput', newMessage)
        },
        deep: true
    }
  },
  mounted () {
  },
  created () {
    this.inputMessage.topic = this.$store.getters.consoleInputTopic
    this.inputMessage.body = this.$store.getters.consoleInputBody
    eventBus.$on('newConsoleOutput', this.onNewConsoleOutput)
     this.consoleOutputs = this.$store.getters.consoleOutputs
     console.log('console outputs: ', this.consoleOutputs)

     let subscribeConsoleOutputTopic = 'aiot/' + this.$store.getters.username + '/+/console/output'
     console.log('subscribe topic: ', subscribeConsoleOutputTopic)
     this.consoleSub = PubSub.subscribe(subscribeConsoleOutputTopic).subscribe({
          next: data => {
              console.log('console output:', data)
              this.consoleOutputs = this.$store.getters.consoleOutputs
              this.incomingMessage.date = (new Date().toLocaleTimeString())
              this.incomingMessage.body = data.value
              let newMessage = Object.assign({}, this.incomingMessage)
              if (this.consoleOutputs === null) {
                this.consoleOutputs = []
              }
              this.consoleOutputs.push(newMessage)
              this.$store.commit('setConsoleOutputs', this.consoleOutputs)
              eventBus.$emit('newConsoleOutput')
          },
          error: error => console.error('error: ', error)
      })
      this.consoleSub.unsubscribe()
  },
  beforeDestroy () {
    // Unsubscribe client connected
    // Unsubscribe client disconnected
    // this.consoleSub.unsubscribe()
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
          bodyJson = JSON.parse(this.inputMessage.body)
        } catch (e) {
          this.$refs.missJsonModal.show()
          return
        }
        let topic = 'aiot/' + this.$store.getters.username + '/console/' + this.inputMessage.topic
        await PubSub.publish(topic, bodyJson)
        console.log('message sent: ', topic)
      }
    }
  }
}
</script>

<style>

div.at-bottombar {
  /* background-color : grey; */
  padding-bottom: 5px;
  margin-bottom: 5px;
  border-bottom: 1px solid grey
}

.CodeMirror {
  border: 1px solid #a78;
  padding: 5px;
}
.CodeMirror pre.CodeMirror-placeholder {
  color: #999;
}

.at-border {
  border: 1px solid #a78;
  padding: 5px;
}

div.at-scroll {
  /* height : 500px ; */
  overflow-y: scroll; /* auto */
  max-height: 100%; /* 65vh; 100% */
}
</style>
