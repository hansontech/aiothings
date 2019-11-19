<template>
  <router-view></router-view>
</template>

<script>
import { PubSub } from 'aws-amplify'
import { eventBus } from './main'
import pako from 'pako'

export default {
  name: 'app',
  data () {
    return {
      consoleSub: null,
      loggingSub: null,
      servicesLogging: {}
    }
  },
  created () {
    console.log('Root.vue created too')
  },
  mounted () {
    eventBus.$on('login', this.onLogin)
    eventBus.$on('logout', this.onLogout)
  },
  beforeDestroy () {
    this.logoutClean()
  },
  methods: {
    logoutClean () {
      if (this.consoleSub !== null) {
        this.consoleSub.unsubscribe()
        this.consoleSub = null
      }
      if (this.loggingSub !== null) {
        this.loggingSub.unsubscribe()
        this.loggingSub = null
      }
    },
    onLogout () {
      console.log('onLogout')
      this.logoutClean()
    },
    onLogin () {
      console.log('onLogin')
      this.logoutClean()
      // Subscribe
      let subscribeConsoleOutputTopic = 'aiot/' + this.$store.getters.username + '/+/console/output'
      this.consoleSub = PubSub.subscribe(subscribeConsoleOutputTopic).subscribe({
          next: data => {
              // console.log('console output:', data)
              const topic = data.value[Object.getOwnPropertySymbols(data.value)[0]]
              let consoleOutputs = this.$store.getters.consoleOutputs
              let inputMessage = {}
              inputMessage.date = (new Date().toLocaleTimeString())
              if (typeof data.value === 'object' && data.value !== null && data.value.hasOwnProperty('message')) {
                inputMessage.body = data.value.message
              } else {
                inputMessage.body = data.value
              }
              inputMessage.fromService = ''
              if (topic !== undefined) {
                try {
                  inputMessage.fromService = topic.split('/')[2]
                } catch (err) {
                  // not a valid aiot message
                }
              }
              let newMessage = Object.assign({}, inputMessage)
              if (consoleOutputs === null) {
                consoleOutputs = []
              }
              consoleOutputs.push(newMessage)
              this.$store.commit('setConsoleOutputs', consoleOutputs)
              eventBus.$emit('newConsoleOutput')
          },
          error: error => console.error('user subscribe console error: ', error),
          close: () => console.log('Done')
      })
      this.loggingSub = PubSub.subscribe('aiot/+/+/logging/output').subscribe({
            next: data => {
              // console.log('logging output:', data)

              // https://github.com/aws-amplify/amplify-js/issues/1025
              // PubSub: How do I know data from which topic
              // const topic = data.value[Object.getOwnPropertySymbols(data.value)[0]]
              // console.log('logging topic: ', topic)

              // https://stackoverflow.com/questions/14620769/decompress-gzip-and-zlib-string-in-javascript
              // The log message is compressed/encoded as zipped first, and then Base64 encoded.
              // We need to reverse this process to decode/decompress messages.
              let strData = atob(data.value.data)
              // Convert binary string to character-number array
              var charData = strData.split('').map(function (x) { return x.charCodeAt(0) })
              // Turn number array into byte-array
              var binData = new Uint8Array(charData)
              // Pako magic
              let dataByte = pako.inflate(binData)
              // Convert gunzipped byteArray back to ascii string:
              var textData = String.fromCharCode.apply(null, new Uint16Array(dataByte))
              // console.log('decoded: ', textData)
              let logData = JSON.parse(textData)
              // console.log('decoded after')
              let serviceName = logData.logGroup.split('/')[3]
              // console.log('log serviceName: ', serviceName)
              // console.log('logData: ', logData)
              if (this.servicesLogging.hasOwnProperty(serviceName)) {
                let events = []
                if (this.servicesLogging[serviceName].hasOwnProperty('events') === false) {
                  events = logData.logEvents
                } else {
                  events = logData.logEvents.concat(this.servicesLogging[serviceName].events)
                }
                events.sort(function (a, b) {
                  return b.timestamp - a.timestamp
                })
                // console.log('new events: ', events)
                this.servicesLogging[serviceName].events = events
                eventBus.$emit('newLoggingOutput')
              }
          },
          error: error => console.error('user subscribe logging error: ', error),
          close: () => console.log('Done')
      })
    }
  }
}
</script>

<style>
body {
  margin: 0;
}

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

main {
  text-align: center;
  margin-top: 40px;
}

header {
  margin: 0;
  height: 56px;
  padding: 0 16px 0 24px;
  background-color: #35495E;
  color: #ffffff;
}

header span {
  display: block;
  position: relative;
  font-size: 20px;
  line-height: 1;
  letter-spacing: .02em;
  font-weight: 400;
  box-sizing: border-box;
  padding-top: 16px;
}

img.at-imageRound {
    border-radius: 50%;
}

/*
.color-box {
    width: 100%;
    display: inline-block;
    background-color: var(--color);
    position: absolute;
    right: 0px;
    left: 0px;
    top: 0px;
    bottom: 0px;
}
*/

:root {
    --color-thing: lightblue;
    --color-mservice: gainsboro;
    --color-api: MediumAquamarine;
    --color-at-card-header: var(--color-thing, rgb(199, 174, 174));
    --height-at-card-header: 30px;
    --height-at-dynamic: 10px;
    --color-at-dynamic: red;
}

.at-card-thing {
  --color-at-card-header: var(--color-thing);
}
.at-card-mservice {
  --color-at-card-header: var(--color-mservice);
}
.at-card-api {
  --color-at-card-header: var(--color-api);
}

.at-card-thing .card-header {   /* multiple classes together */
    background-color: var(--color-at-card-header);
    height: var(--height-at-card-header);
    padding: 0px 0px;
    margin-bottom: 0; 
    /* 
    padding: 0.75rem 1.25rem;
    margin-bottom: 0;
    background-color: #fff;
    border-bottom: 1px solid rgba(0, 0, 0, 0.125);
    */
}

.at-card-mservice .card-header {   /* multiple classes together */
    background-color: var(--color-at-card-header);
    height: var(--height-at-card-header);
}

.at-card-api .card-header {   /* multiple classes together */
    background-color: var(--color-at-card-header);
    height: var(--height-at-card-header);    
}

.at-card-thing-dynamic .card-header {   /* multiple classes together */
    background-color: var(--color-at-dynamic);
    height: var(--height-at-dynamic);    
}

.at-card:hover {
  /* background-color: red;
     opacity: 0.5;
  */
  box-shadow : 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
  /* box-shadow: 1px -1px teal; */
}
/*
.modal {
    display: block;
    overflow: hidden;
    height: 100%;
    min-height: 100%; 
    left: 0;
    position: relative; 
    width: 100%;
}
.modal.open {
   display: block;
}
.modal__content {
    bottom: 100px;
    top: 100px;
    padding-top: 100px
}
.modal__footer {
    bottom: 0;
}
*/

/*
div {
    outline-color:cornflowerblue
}
*/
</style>
