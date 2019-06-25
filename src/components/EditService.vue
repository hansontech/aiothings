<template>
  <b-container fluid>
    <div v-bind:titleString="changeTitle()">
      <b-row align-v="center" style="border-bottom: 1px solid grey; padding-bottom: 5px; margin-bottom: 5px;">
        <b-col align="start">
            <h4>Edit Service : {{mservice.ServiceName}} </h4>
        </b-col>
        <b-col sm="auto" align="end" >
          <b-button v-if="!isShowEdit" variant="info" @click="exportService(mservice)" v-b-popover.hover.bottom="'Export the microservice to a local file'">Export</b-button> 
          <b-button variant="success" :disabled="mservice.UserId !== $store.getters.username" @click="updateService()">Update</b-button>
          <b-button variant="dark" @click="backHome()">Return</b-button>
          <b-modal id="modalReturnConfirm"
             ref="modalReturnConfirmRef"
             title="Discard changes and return?" 
             @ok="returnDiscardChangesOk"
             @cancel="returnCancel">
          </b-modal>
        </b-col>
      </b-row>
      <b-modal id="modalInvalidInputs"
             ref="modalInvalidInputsRef" 
             ok-only
             >
       Input and output message topics cannot be empty.
      </b-modal>
      <spinner v-if="isUpdating === true" size="medium" />
      <b-tabs card>
       <b-tab title="Info" active>
            <div class="mt-3">
              <p class="h4">Service Name</p>
            </div>
            <div>
              <b-form-input class="at-border" v-model="mservice.ServiceName" placeholder="Service name" disabled></b-form-input>
            </div>
            <div class="mt-3">
              <p class="h4">Description</p>
            </div>
            <div style="height: 100px; background-color: rgba(255,0,0,0.1);">
              <textarea class="at-border w-100 h-100" v-model="mservice.ServiceDesc" placeholder="Service description"></textarea>
            </div>
            <div class="mt-3">
              <b-row>
                <b-col sm>
                  <h4 style="display: inline;">Runtime:</h4>
                  <b-dropdown variant="secondary" class="mx-1" :text="currentRuntime">
                    <b-dropdown-item @click="changeRuntime('nodejs8.10')">Node.js 8.10</b-dropdown-item>
                    <b-dropdown-item @click="changeRuntime('nodejs6.10')">Node.js 6.10</b-dropdown-item>
                    <b-dropdown-item @click="changeRuntime('python3.7')">Python 3.7</b-dropdown-item>
                    <b-dropdown-item @click="changeRuntime('python2.7')">Python 2.7</b-dropdown-item>
                 </b-dropdown>
                </b-col>
              </b-row>
            </div>
            <b-form-group horizontal
                  label="Sharing:"
                  label-size="lg"
                  label-class="font-weight-bold"
                  class="mt-3">
              <b-form-radio-group class="pt-3" v-model="mservice.IsShared" :options="[{text: 'Yes', value: 'true'}, {text: 'No', value: 'false'}]" />
            </b-form-group>
      </b-tab>
      <b-tab title="Source Code" @click="setCmActive">
          <spinner v-if="isSourceLoading === true" size="medium" />
          <codemirror v-else class="w-100 h-100" v-model="mservice.ServiceCode" ref="sourceEditor" placeholder="Service description" :lintOptions="{sub: true, notypeof: true}">
          </codemirror>
          <!--
                    @ready="onCmReady"
                    @focus="onCmFocus"
                    @changes="onChange"
                    @input="onCmCodeChange"
 
          <div style="height: 300px; background-color: rgba(255,0,0,0.1);" class="mt-3">
            <textarea class="at-border w-100 h-100" v-model="mservice.ServiceCode" placeholder="Service codes"></textarea>
          </div>
          -->
          <div class="mt-4">
            <b-form-group id="fieldsetHorizontal"
                horizontal
                :label-cols="4"
                breakpoint="md"
                label-size="lg"
                label-class="font-weight-bold"
                label="Input message topic"
                label-for="inputHorizontal">
              <b-form-input v-model="mservice.InputMessageTopic" placeholder="Input topic" id="inputHorizontal"></b-form-input>
            </b-form-group>
            <b-form-group id="fieldsetHorizontal"
                horizontal
                :label-cols="4"
                breakpoint="md"
                label-size="lg"
                label-class="font-weight-bold"
                label="Input microservice"
                description="Optional, limit the input message only from this microservice"
                label-for="inputHorizontal">
              <b-form-input v-model="inputMicroservice" placeholder="Input message microservice name"></b-form-input>
            </b-form-group>

             <b-form-group id="fieldsetHorizontal"
                horizontal
                :label-cols="4"
                label-size="lg"
                label-class="font-weight-bold"
                breakpoint="md"
                label="Output message topic"
                label-for="inputHorizontal">
              <b-form-input v-model="mservice.OutputMessageTopic" placeholder="Output topic" ></b-form-input>
            </b-form-group>
          </div>
      </b-tab>
     </b-tabs>
    </div>
  </b-container>
 </template>

<script>

import { API, Storage } from 'aws-amplify'
import atHelper from '../aiot-helper'
import config from '../config'

export default {
  name: 'device',
  props: ['serviceIndex', 'serviceSource'], // VUE reference https://router.vuejs.org/guide/essentials/passing-props.html
  data: function () {
    return {
      mservice: null,
      inputMicroservice: '',
      isChangedNotSaved: null,
      isUpdating: false,
      isSourceLoading: false,
      serviceDesc: '',
      isShowEdit: false,
      runtimeOptions: {'nodejs': 'Node.js 8.10', 'nodejs6.10': 'Node.js 6.10', 'nodejs8.10': 'Node.js 8.10', 'python2.7': 'Python 2.7', 'python3.7': 'Python 3.7', 'python': 'Python 3.7'},
      errorMsg: ''
    }
  },
  computed: {
    isShared (sharingStatus) {
      return (sharingStatus === 'true')
    },
    codemirror () {
      return this.$refs.sourceEditor.codemirror
    },
    currentRuntime () {
      return this.runtimeOptions[this.mservice.ServiceRuntime]
    }
  },
  beforeCreate () {
    console.log('EditSource beforeCreate')
  },
  created () {
    console.log('EditSource created')
    let index = this.serviceIndex
    // https://scotch.io/bar-talk/copying-objects-in-javascript
    // only shallow copying, is enough
    // 20181112 this.mservice = Object.assign({}, this.$store.getters.mservices[index])
    // this.mservice = Object.assign({}, this.serviceSource[index])
    let mserviceStr = JSON.stringify(this.$store.getters.mservices[index])
    this.mservice = JSON.parse(mserviceStr)
    this.serviceDesc = this.mservice.ServiceDesc
    if (this.mservice.InputMicroservice === '+') {
      this.inputMicroservice = ''
    } else {
      this.inputMicroservice = this.mservice.InputMicroservice
    }
    console.log('edit service: ', this.service)
    this.loadSource()
  },
  beforeDestroy () {
  },
  watch: {
    serviceDesc: function (newDesc, oldDesc) {
      if (newDesc !== oldDesc && this.isChangedNotSaved !== null) {
        this.isChangedNotSaved = true
      }
    },
    mservice: function () {
      console.log('mservice changed')
    }
  },
  methods: {
    // https://github.com/surmon-china/vue-codemirror/blob/master/examples/02-text-javascript.vue
    /*
    onCmReady (cm) {
      // cm.on('keypress', () => {
      //   cm.showHint()
      // })
    },
    onCmFocus () {
    },
    onCmCodeChange (newCode) {
      this.code = newCode
    },
    onChange () {
      // this.codemirror.showHint()
    },
    */
    changeRuntime (runtimeName) {
      this.mservice.ServiceRuntime = runtimeName
    },
    exportService (ms) {
      atHelper.exportService(ms, false) // false means no need to load source code
    },
    setCmActive () {
      console.log('setCmActive')
      var that = this
      let cm = that.codemirror
      let runtime = this.mservice.ServiceRuntime
      if (runtime !== null && runtime.toLowerCase().includes('python')) {
        cm.setOption('mode', 'text/x-python')
        cm.setOption('lint', {
                      // globalstrict: true,
                      // strict: false,
                      asi: true
        })
      } else {
        cm.setOption('mode', 'text/javascript')
        cm.setOption('lint', {
                      // globalstrict: true,
                      // strict: false,
                      esversion: 8,
                      asi: true
        })
      }
      setTimeout(function () {
        cm.refresh()
      }, 1)
    },
    async loadSource () {
      this.isSourceLoading = true
      Storage.configure({level: 'public', bucket: config.awsMserviceBucket})
      console.log('start loadSource key: ', this.mservice.ServiceCode)
      let s3url = await Storage.get(this.mservice.ServiceCode)
      let dataResponse = await fetch(s3url)
      // https://css-tricks.com/using-fetch/
      let dataText = await dataResponse.text()
      this.mservice.ServiceCode = dataText
      this.isSourceLoading = false
    },
    changeTitle () {
      // console.log('isShowEdit: ', this.isShowEdit)
      if (this.isShowEdit) {
        return 'Edit'
      } else {
        return 'Show'
      }
    },
    async updateService () {
      // if (this.isChangedNotSaved) {
        if (this.isSourceLoading) {
          return
        }
        if (this.mservice.InputMessageTopic === '' || this.mservice.OutputMessageTopic === '') {
          this.$refs.modalInvalidInputsRef.show()
          return
        }
        if (this.inputMicroservice === '' || this.inputMicroservice === ' ') {
          this.mservice.InputMicroservice = '+'
        } else {
          this.mservice.InputMicroservice = this.inputMicroservice
        }
        this.isUpdating = true
        const body = this.mservice
        const result = await API.post('mserviceApi', '/mservices', { body })
        console.log('updateService: result: ', result)
        if (result.hasOwnProperty('success')) {
          let newMservice = result.microservice.Attributes
          newMservice.ServiceCode = this.mservice.ServiceCode
          this.mservice = newMservice
          this.$store.dispatch('replaceMservice', this.mservice)
        }
        this.isChangedNotSaved = false
        this.isUpdating = false
      // }
    },
    returnDiscardChangesOk (evt) {
      // Prevent modal from closing
      // evt.preventDefault()
      this.$refs.modalReturnConfirmRef.hide()
      this.$router.go(-1)
    },
    returnCancel () {
      this.$refs.modalReturnConfirmRef.hide()
    },
    backHome () {
      console.log('quit')
      if (this.isChangedNotSaved === true) {
        this.$refs.modalReturnConfirmRef.show()
      } else {
        this.$router.go(-1)
      }
    }
  }
}
</script>

<style>
.at-border {
  border: 1px solid #a78;
  padding: 5px;
}

.CodeMirror {
  border: 1px solid #a78;
  padding: 5px;
}
.CodeMirror pre.CodeMirror-placeholder {
  color: #999;
}

.CodeMirror-focused .cm-matchhighlight {
    background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAFklEQVQI12NgYGBgkKzc8x9CMDAwAAAmhwSbidEoSQAAAABJRU5ErkJggg==);
    background-position: bottom;
    background-repeat: repeat-x;
  }

.lint-error {
  font-family: arial; 
  font-size: 70%; 
  background: #ffa; 
  color: #a00; 
  padding: 2px 5px 3px; 
}
.lint-error-icon {
  color: white; 
  background-color: red; 
  font-weight: bold; 
  border-radius: 50%; 
  padding: 0 3px; 
  margin-right: 7px;
}

div.at-bottombar {
  /* background-color : grey; */
  padding-bottom: 5px;
  margin-bottom: 5px;
  border-bottom: 1px solid grey
}

.btn:hover { outline: 0 !important }

</style>
