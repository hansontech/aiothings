<template>
  <!-- <div class="container-fluid mt-4"> -->
  <div style="margin-left:0px; margin-top:5px">
    <tree ref="tree" :data="menuData" :options="treeOptions" v-model="selectedNode" @node:selected="onNodeSelected"/>
    <b-button-group  vertical class="at-sidebar-button" style="width:100%">
      <b-button variant="warning" @click="toMain()" class="text-left">Back to Main</b-button>
    </b-button-group>
  </div>
</template>

<script>
import { eventBus } from '../main'

export default {
  name: 'user',
  props: {
  },
  data: function () {
    return {
      treeObj: null,
      tag: '',
      selectedNode: null,
      treeOptions: {
        multiple: false
      },
      menuData: [
        { 'text': 'Introduction', data: { 'link': 'DocIntroduction' } },
        { 'text': 'Get Started', data: { 'link': 'DocGetStarted' } },
        { 'text': 'AIoThings Services',
          state: { expanded: true },
          'children': [
            { 'text': 'IoT Devices',
              data: { 'link': 'DocThingObject' },
              state: { expanded: true },
              children: [
                { 'text': 'IoT Enabler Hardware',
                  data: { 'link': 'DocThingEnabler' },
                  state: { expanded: true },
                  'children': [
                    { 'text': 'Raspberry Pi',
                      data: { 'link': 'DocPi' },
                      children: [
                        { 'text': 'Node-RED', data: { 'link': 'DocNodeRed' } }
                      ]
                    },
                    { 'text': 'ESP32/ESP8266',
                      data: { 'link': 'DocESP8266' },
                      children: [
                        { 'text': 'Mongoose OS', data: { 'link': 'DocMongooseOs' } }
                      ]
                    }
                  ]
                },
                { 'text': 'Edge computing',
                  data: { 'link': 'DocThingEdge' },
                  state: { expanded: true },
                  children: [
                        { 'text': 'Configuration',
                          data: { 'link': 'DocThingEdgeConfiguration' }
                        },
                        { 'text': 'Machine Learning',
                          data: { 'link': 'DocThingEdgeMachineLearning' }
                        }
                      ]
                }
              ]
            },
            { 'text': 'Microservices',
              data: { 'link': 'DocMicroservice' },
              state: { expanded: true },
              children: [
                { 'text': 'Private & shared', data: { 'link': 'DocMicroserviceShared' } },
                { 'text': 'Message topic', data: { 'link': 'DocMicroserviceTopic' } },
                { 'text': 'Message tree', data: { 'link': 'DocMessageTopicTree' } },
                { 'text': 'Deploy microservice', data: { 'link': 'DocMicroserviceDeploy' } },
                { 'text': 'Export microservices', data: { 'link': 'DocMicroserviceExport' } }
              ]
            },
            { 'text': 'REST APIs', data: { 'link': 'DocApi' } },
            { 'text': 'App Connectors', data: { 'link': 'DocAppConnector' } },
            { 'text': 'Shared Solutions', data: { 'link': 'DocSharedSolution' } },
            { 'text': 'Console', data: { 'link': 'DocConsole' } },
            { 'text': 'IoT Data Access',
                  data: { 'link': 'DocIotData' }
            }
          ]
        },
        { 'text': 'Microservice APIs',
          data: { 'link': 'DocMicroserviceApi' },
          state: { expanded: false },
          'children': [
            { 'text': 'Node.js',
              state: { expanded: true },
              'children': [
                { 'text': 'messagePublish',
                  data: { 'link': 'DocNodejsMessagePublish' }
                },
                { 'text': 'messageQueueSend',
                  data: { 'link': 'DocNodejsMessageQueueSend' }
                },
                { 'text': 'messageQueueGet',
                  data: { 'link': 'DocNodejsMessageQueueGet' }
                },
                { 'text': 'storePutObject',
                  data: { 'link': 'DocNodejsStorePutObject' }
                },
                { 'text': 'storeGetObject',
                  data: { 'link': 'DocNodejsStoreGetObject' }
                },
                { 'text': 'setInterval',
                  data: { 'link': 'DocNodejsSetInterval' }
                },
                { 'text': 'clearInterval',
                  data: { 'link': 'DocNodejsClearInterval' }
                },
                { 'text': 'consoleOutput',
                  data: { 'link': 'DocNodejsConsoleOutput' }
                }
              ]
            }
           ]
        },
        { 'text': 'Programming Environment', data: { 'link': 'DocProgramming' } }
        /*,
        { 'text': 'Examples',
          state: { expanded: true },
          'children': [
            { 'text': 'Cloud to Claw machine', data: { 'link': 'DocExamplesClawMachine' } }
            // ,
            // { 'text': 'Online Order to POS' }
          ]
        } */
      ]
    }
  },
  computed: {
    isLoggedIn () {
      let status = this.$store.getters.isAuthenticated
      return status
    },
    routeName () {
      return this.$route.path
    },
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
    },
    isBackButtonNeed () {
      let { title } = this.$route.meta
      if (title && title === 'thing') {
        return true
      } else {
        return false
      }
    }
  },
  created () {
    eventBus.$on('changeDocId', this.onChangeDocId)
    // this on handler must be a separate function instead of an instant function parameter
    // otherwise, it cannot access the local variables such as this.xxx
  },
  mounted () {
    this.treeObj = this.$refs.tree
  },
  methods: {
    onChangeDocId (id) {
      // console.log('onChangeDocId: ', id)
      // https://amsik.github.io/liquor-tree/#Tree-selected
      let selection = this.treeObj.find({ data: { link: id } })
      if (selection !== undefined && selection !== null) {
        selection.select(true)
      }
    },
    onNodeSelected (node) {
      // this.$router.replace('/docs', undefined, () => { window.location.href = '#SHARED_ECONOMY' })
      if (node.data.hasOwnProperty('link')) {
        this.tag = '#' + node.data.link
        // console.log(this.tag)
        // https://router.vuejs.org/guide/essentials/navigation.html
        // onComplete and onAbort callbacks to router.push or router.replace as the 2nd and 3rd arguments.
        this.$router.replace('/docs/main', () => { window.location.href = this.tag; this.$forceUpdate() }, () => { window.location.href = this.tag; this.$forceUpdate() })
      } else if (node.hasOwnProperty('children')) {
        // DO Nothing
      } else {
        this.$router.replace('/docs')
      }
    },
    toMain () {
      this.$router.push({name: 'home'})
    }
  }
}
</script>

<style>
.nav-pills.at-sidebar a.router-link-active {
   background-color : #2c8fbb;
   color : #ffff;
}

div.a {
    outline-color:black;
    outline-style: solid;
    background-color : red
}

.center {
  margin: auto;
  width: 50%;
  border: 3px solid green;
}

.at-sidebar-button button {
  margin-bottom : 5px;
  width: 80%
}

/* --------------- */
      .hello {
        font-size: 1em;
        padding: 0;
        height: 80px;
        vertical-align: middle;
        box-sizing: border-box;
        text-align: center;
        display: flex;
        align-items: center;
        justify-content: space-around;
      }

      #app {
        position: absolute;
        top: 0;
        width: 100%;
        bottom: 0;
        right: 0;
      }

      .navigation {
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 280px;
        overflow-y: scroll;
        background-color: #f9f9f9;
      }

      .navigation-filter {
        padding: 5px 10px;
      }

      .navigation-filter input {
        position: relative;
        display: block;
        width: 100%;
        height: 100%;
        font-size: .875rem;
        background: #fff;
        border: 1px solid;
        border-color: #d2d2d2;
        border-radius: 3px;
        padding: 6px;
        box-sizing: border-box;
      }

      .content {
        overflow: auto;
        position: absolute;
        left: 280px;
        right: 0;
        top: 0;
        bottom: 0;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      /*
      .tree-arrow.has-child:after {
        background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAQAAAC1+jfqAAAAAmJLR0QA/4ePzL8AAAAJcEhZcwAADdcAAA3XAUIom3gAAAAHdElNRQfiBBQOCQ0YTpzfAAAAjklEQVQoz2NmYGBgYGAIdAw/LPHu6kUGDMAEoXjt+WXM5kck4VTAwMDAwMhoOgdTCRMyB5sSJlQuphImdCPRlTBhOgtVCRYFECWBjngUMDAwMDAy4VVwJnvdXjwKTmcvn47HDadzlk/D44szecun4gmHM/nLJuMJyTMFyyahm8gCoT4f+fz8ZtuyKZguAgDLtyS94NiAKwAAAABJRU5ErkJggg==')
;
        border: 0;
        width: 16px;
        height: 16px;
        background-repeat: no-repeat;
        transform: rotate(0deg) translateY(-50%) translateX(-2px);
      }

      .tree-arrow.expanded.has-child:after {
        transform: rotate(90deg) translateY(0%) translateX(-8px);
      }
      

      .tree-node.selected > .tree-content {
        background: #398df0;
      }

      .tree-node.selected > .tree-content > .tree-anchor {
        color: #fff;
      }
      */

      .tree-content {
        padding: 2px 0;
      }

      .tree-scope {
        width: 100%;
        display: flex;
        justify-content: space-between;
      }

      .release {
        color: #a9a9a9;
      }
</style>