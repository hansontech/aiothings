<template>
  <b-container>
    <div>
       <b-row align-v="center" style="border-bottom: 1px solid grey">
          <b-col align="start">
            <h3>New Service</h3>
          </b-col>
          <b-col sm="auto" align="end" >
            <b-button variant="success" @click="createService()"
                  v-b-popover.hover.bottom="'Create new service'">
                    Create
            </b-button>
            <b-button variant="dark" @click="$router.go(-1)">Cancel</b-button>
          </b-col>
      </b-row>
      <spinner v-if="isCreating === true" size="medium" />
      <b-modal ref="createdNotifyModal" ok-only @ok="returnSuccess()" >
                New microservice has been created.
              <!-- <b-btn class="mt-3" variant="outline-danger" block @click="returnSuccess()">Ok</b-btn>
              --> 
      </b-modal>
      <b-modal ref="createErrorModal" ok-only @ok="$refs.createErrorModal.hide()" >
                {{createErrorMessage}}
      </b-modal>
      <b-row align-v="center" class="mt-3">
        <b-col>
        </b-col>
        <b-col align-self="end">
          <b-alert variant="danger"
                dismissible
                :show="showDescCannotEmptyAlert"
                @dismissed="showDescCannotEmptyAlert=false">
                Device name or description cannot be empty.
          </b-alert>
          <b-alert variant="danger"
                dismissible
                :show="showInvalidInputsAlert"
                @dismissed="showInvalidInputsAlert=false">
                Input and output message topics cannot be empty.
          </b-alert>
          <b-alert variant="danger"
                dismissible
                :show="showServiceNameIsUsedAlert"
                @dismissed="showServiceNameIsUsedAlert=false">
                The name has been used by another microservice.
          </b-alert>
          
        </b-col>
      </b-row>
    </div>
    <b-tabs card>
      <b-tab title="Info" active>
            <div class="mt-3">
              <p class="h5">Service Name</p>
            </div>
            <div>
              <b-row>
                <b-col md align="start">
                  <b-form-input class="at-border" v-model="mservice.ServiceName" placeholder="Service name"></b-form-input>
                </b-col>
                <b-col md="auto" align="end">
                  <b-button variant="secondary" v-b-popover.hover.bottomleft="'Check if the name is available to use'" @click="checkServiceName()">Check name</b-button>
                </b-col>
              </b-row>
              <b-row>
                <b-col align-h="end" align="end">
                  <b-collapse v-model="showCheckNameMessage" id="collapse1" class="mt-2">
                    <b-card>
                      {{checkNameResultMessage}} 
                      <b-button variant="primary" 
                        :class="showCheckNameMessage ? 'collapsed' : null"
                        :aria-expanded="showCheckNameMessage ? 'true' : 'false'"
                        aria-controls="collapse1"
                        @click="showCheckNameMessage = !showCheckNameMessage" size="sm">Confirm</b-button>
                    </b-card>
                  </b-collapse>
                </b-col>
              </b-row>
            </div>
            <div class="mt-3">
              <p class="h5">Description</p>
            </div>
            <div style="height: 100px; background-color: rgba(255,0,0,0.1);">
              <textarea class="at-border w-100 h-100" v-model="mservice.ServiceDesc" placeholder="Service description"></textarea>
            </div>
            <b-form-group
                  label-cols-sm="3"
                  label="Runtime:"
                  label-size="lg"
                  label-class="font-weight-bold"
                  class="mt-3">
              <b-dropdown variant="secondary" class="mx-1" :text="currentRuntime">
                <b-dropdown-item @click="changeRuntime('nodejs8.10')">Node.js 8.10</b-dropdown-item>
                <b-dropdown-item @click="changeRuntime('nodejs6.10')">Node.js 6.10</b-dropdown-item>
                <b-dropdown-item @click="changeRuntime('python3.7')">Python 3.7</b-dropdown-item>
                <b-dropdown-item @click="changeRuntime('python2.7')">Python 2.7</b-dropdown-item>
              </b-dropdown>
            </b-form-group>
            <b-form-group
                  label-cols-sm="3"
                  label="Sharing:"
                  label-size="lg"
                  label-class="font-weight-bold"
                  class="mt-3">
            <b-form-radio-group class="pt-3" v-model="mservice.IsShared" :options="[{text: 'Yes', value: 'true'}, {text: 'No', value: 'false'}]" />
            </b-form-group>
                        <b-form-group
                :label-cols="3"
                breakpoint="md"
                label-size="lg"
                label-class="font-weight-bold"
                label="Deploy message"
                label-for="inputHorizontal">
            <b-form-input v-model="mservice.DeployMessage" :placeholder="deployMessageFormat" id="inputHorizontal"></b-form-input>
            </b-form-group>
                       <b-form-group
                :label-cols="3"
                breakpoint="md"
                label-size="lg"
                label-class="font-weight-bold"
                label="Undeploy message"
                label-for="inputHorizontal">
              <b-form-input v-model="mservice.UndeployMessage" :placeholder="deployMessageFormat" id="inputHorizontal"></b-form-input>
            </b-form-group>
      </b-tab>
      <b-tab title="Source Code" @click="setCmActive">
          <b-alert variant="danger"
                  dismissible
                  :show="showZipOnlySupportPython"
                  @dismissed="showZipOnlySupportPython=false">
                  Currently, Zip file is only supported from Python sources.
          </b-alert>
          <b-row>
            <b-col sm>
              <b-form-group label-cols-sm="3" label="Code entry type:" label-align="right">
                 <b-form-select v-model="mservice.CodeEntryType" :options="codeEntryOptions" v-on:change="changeCodeEntry(mservice.CodeEntryType)"></b-form-select>
              </b-form-group>
            </b-col>
          </b-row>
          <b-row v-if="mservice.CodeEntryType === 'inline'">
            <codemirror class="mt-2 w-100 h-100" v-bind:class="languageType" v-model="mservice.ServiceCode" ref="sourceEditor" placeholder="Microservice code" :lintOptions="{}">
              <!-- :lintOptions="{sub: true, notypeof: true}-->
            </codemirror>
          </b-row>
          <div v-else-if="mservice.CodeEntryType === 'zip'">
            <b-row class = "mt-2">
              <b-alert variant="danger"
                  dismissible
                  :show="showEmptyServiceNameAlert"
                  @dismissed="showEmptyServiceNameAlert=false">
                  Please assign service name first and try again.
              </b-alert>
              <b-alert variant="danger"
                  dismissible
                  :show="showInvalidCodeHandlerAlert"
                  @dismissed="showInvalidCodeHandlerAlert=false">
                  Invalid handler format, should be 'main.handler'.
              </b-alert>
            </b-row>
            <b-row class="mt-2">
              <b-form-file
                v-model="zipFile"
                :state="Boolean(zipFile)"
                placeholder="Choose a file or drop it here..."
                drop-placeholder="Drop file here..."
                accept=".zip"
              ></b-form-file>
            </b-row>
            <b-row class="mt-2">
              <spinner v-if="isZipDownloading === true" size="medium" />
            </b-row>
            <b-row class="mt-2">
              <div>Zip file {{ (mservice.CodeFileName !== ' ') ? 'has been uploaded.' : 'needs to be assigned.' }}&ensp;&ensp;&ensp;</div>
              <b-button v-if="mservice.CodeFileName !== '' && isZipDownloading === false" style="display: inline;" id="downloadZipFileButton" variant="info" @click="downloadZipFile()">Download zip file</b-button>
            </b-row>

            <b-form-group class="mt-2" id="mserviceHandlerNameFormGroup"
              :label-cols="4"
              breakpoint="md"
              label-size="lg"
              label-class="font-weight-bold"
              label="Entry handler"
              description="main module and entry handler"
              label-for="inputHorizontal">
              <b-form-input v-model="mservice.CodeHandler" placeholder="example: main.handler"></b-form-input>
            </b-form-group>
          </div>
          <!--
          <div style="height: 300px; background-color: rgba(255,0,0,0.1);" class="mt-3">
            <textarea class="at-border w-100 h-100" v-model="mservice.ServiceCode" placeholder="Service codes"></textarea>
          </div>
          -->
          <div class="mt-4">
            <b-form-group id="fieldsetHorizontal"
                :label-cols="4"
                label-size="lg"
                label-class="font-weight-bold"
                breakpoint="md"
                label="Input message topic:"
                label-for="inputHorizontal">
              <b-form-input v-model="mservice.InputMessageTopic" placeholder="Input topic" id="inputHorizontal"></b-form-input>
            </b-form-group>
            <b-form-group id="fieldsetHorizontal"
                :label-cols="4"
                breakpoint="md"
                label-size="lg"
                label-class="font-weight-bold"
                label="Input microservice:"
                description="Optional, limit the input message only from this microservice"
                label-for="inputHorizontal">
              <b-form-input v-model="inputMicroservice" placeholder="Input message microservice name"></b-form-input>
            </b-form-group>

            <b-form-group id="fieldsetHorizontal"
                :label-cols="4"
                label-size="lg"
                label-class="font-weight-bold"
                breakpoint="md"
                label="Output message topic:"
                label-for="inputHorizontal">
              <b-form-input v-model="mservice.OutputMessageTopic" placeholder="Output topic" ></b-form-input>
            </b-form-group>
          </div>
      </b-tab>
    </b-tabs>

  </b-container>
</template>

<script>
import { API, Storage } from 'aws-amplify'
import atHelper from '../aiot-helper'
import store from '../store'
import 'codemirror/addon/display/placeholder'
// import '../assets/mservice_template.js'
// import '../assets/mservice_template.js'

export default {
  name: 'device',
  props: ['copiedService'],
  data: function () {
    return {
      activeMenu: 'app',
      response: 'unknown',
      service: null,
      guess: 123,
      what: 0,
      zipFile: null,
      isCreating: false,
      isZipDownloading: false,
      mservice: {
        UserId: this.$store.getters.username,
        ServiceDesc: 'This is a sample microservice',
        ServiceName: '',
        IsShared: 'false',
        InputMessageTopic: 'device/data',
        InputMicroservice: '+',
        OutputMessageTopic: 'device/command',
        ServiceCode: '',
        CodeEntryType: 'inline',
        CodeFileName: ' ',
        CodeHandler: 'main.handler',
        ServiceRuntime: 'nodejs8.10'
      },
      inputMicroservice: '',
      showDescCannotEmptyAlert: false,
      showInvalidInputsAlert: false,
      showServiceNameIsUsedAlert: false,
      showCheckNameMessage: false,
      showEmptyServiceNameAlert: false,
      showZipOnlySupportPython: false,
      showInvalidCodeHandlerAlert: false,
      checkNameResultMessage: '',
      createErrorMessage: '',
      runtimeOptions: {'nodejs': 'Node.js 8.10', 'nodejs6.10': 'Node.js 6.10', 'nodejs8.10': 'Node.js 8.10', 'python2.7': 'Python 2.7', 'python3.7': 'Python 3.7', 'python': 'Python 3.7'},
      codeEntryOptions: [
          {value: 'inline', text: 'Edit code inline'},
          {value: 'zip', text: 'Upload .zip file'}
      ],
      templateCode: {
        nodejs: '',
        python: ''
      },
      deployMessageFormat: 'Optional, a JSON form of { "topic": ... "data": ... }'
    }
  },
  watch: {
    zipFile: function (newValue, oldValue) {
      if (newValue !== oldValue && (newValue !== '' && newValue !== null)) {
        this.uploadZipFile(newValue)
      }
      this.$forceUpdate()
    }
  },
  computed: {
    languageType () {
      let runtime = this.mservice.ServiceRuntime
      if (runtime !== null && runtime.toLowerCase().includes('python')) {
        return 'python'
      } else {
        return 'javascript'
      }
    },
    codemirror () {
      return this.$refs.sourceEditor.codemirror
    },
    currentRuntime () {
      return this.runtimeOptions[this.mservice.ServiceRuntime]
    },
    currentCodeEntryText () {
      return this.codeEntryOptions[this.mservice.CodeEntryType]
    }
  },
  async created () {
    console.log('new service: copied? ', this.copiedService)
    this.updateServiceTemplate()
    if (typeof this.copiedService !== 'undefined') {
      console.log('copied from')
      this.mservice = Object.assign({}, this.copiedService)
      this.mservice.ServiceName = this.copiedService.ServiceName + '_copy'
      this.mservice.UserId = this.$store.getters.username
      this.mservice.ServiceCode = await atHelper.loadMserviceSource(this.mservice.ServiceCode)
    }
    console.log('new service: copied 2? ', this.mservice)
  },
  mounted () {
    // this.$refs.sourceEditor.editor.focus()
  },
  methods: {
    setCmActive () {
      console.log('setCmActive')
      var that = this
      let cm = that.codemirror
      let runtime = this.mservice.ServiceRuntime
      // https://jshint.com/docs/options/
      if (runtime !== null && runtime.toLowerCase().includes('python')) {
        cm.setOption('indentWithTabs', true)
        cm.setOption('mode', 'text/x-python')
        cm.setOption('gutters', [])
        cm.setOption('lint', {
            asi: true
        })
      } else {
        cm.setOption('mode', 'text/javascript')
        cm.setOption('gutters', ['CodeMirror-lint-markers'])
        cm.setOption('lint', {
            esversion: 8,
            asi: true
        })
      }
      setTimeout(function () {
        cm.refresh()
      }, 1)
    },
    async checkServiceName () {
      console.log('checkServiceName')
      // this.showCollapse = !this.showCollapse
      if (this.mservice.ServiceName === null || this.mservice.ServiceName === '') {
        return
      }
      if (this.showCheckNameMessage) {
        this.showCheckNameMessage = false
        return
      }
      const result = await API.get('mserviceApi', '/checkname', {
          'queryStringParameters': {
            'serviceName': this.mservice.ServiceName
          }
      })
      // return success : 'used' or 'new'
      if (result.success === 'used') {
        this.checkNameResultMessage = 'This name has been used by another microservice.'
      } else {
        this.checkNameResultMessage = 'This microservice name is available to use.'
      }
      this.showCheckNameMessage = true
    },
    async updateServiceTemplate () {
      if (this.mservice.ServiceCode === '') {
        let templateFile = ''
        if (this.mservice.ServiceRuntime.search(/nodejs/i) !== -1) {
          templateFile = '/static/mservice_template.js'
        } else if (this.mservice.ServiceRuntime.search(/python/i) !== -1) {
          templateFile = '/static/mservice_template.py'
        }
        try {
          let dataResponse = await fetch(templateFile)
          let tempCode = await dataResponse.text()
          this.mservice.ServiceCode = tempCode
          this.templateCode[this.mservice.ServiceRuntime] = tempCode
        } catch (e) {
          console.log('error: ', e)
        }
      }
    },
    changeCodeEntry (codeEntryType) {
      // console.log('change code entry: ', codeEntryType)
      /*
      if (this.mservice.ServiceRuntime.includes('python') === false) {
        this.mservice.CodeEntryType = 'inline'
        this.showZipOnlySupportPython = true
      }
      */
      this.$forceUpdate()
    },
    async changeRuntime (runtimeName) {
      if (this.mservice.ServiceCode === this.templateCode[this.mservice.ServiceRuntime]) {
          this.mservice.ServiceCode = ''
      }
      this.mservice.ServiceRuntime = runtimeName
      if (this.mservice.CodeEntryType === 'zip') {
        if (this.mservice.ServiceName.includes('node')) {

        }
      }
      await this.updateServiceTemplate()
    },
    async createService () {
      if (this.mservice.ServiceDesc === '' || this.mservice.ServiceName === '') {
        this.showDescCannotEmptyAlert = true
        return
      }
      if (this.mservice.InputMessageTopic === '' || this.mservice.OutputMessageTopic === '') {
        this.showInvalidInputsAlert = true
        return
      }
      if (this.mservice.CodeEntryType === 'zip') {
        if (this.mservice.CodeFileName === ' ' || this.mservice.CodeFileName === null) {
          return
        }
        let codeHandlerFormat = this.mservice.CodeHandler.split('.')
        if (codeHandlerFormat.length !== 2) {
          this.showInvalidCodeHandlerAlert = true
          return
        }
      }
      let isUsed = await atHelper.checkMserviceNameIsUsed(this.mservice.ServiceName)
      if (isUsed) {
        this.showServiceNameIsUsedAlert = true
        return
      }
      if (this.inputMicroservice === '' || this.inputMicroservice === ' ') {
        this.mservice.InputMicroservice = '+'
      } else {
        this.mservice.InputMicroservice = this.inputMicroservice
      }
      if (this.mservice.UserId !== null) {
        this.isCreating = true
        const body = this.mservice
        const result = await API.post('mserviceApi', '/mservices', { body })
        console.log('result: ', result)
        this.isCreating = false
        if (result.hasOwnProperty('error')) {
          this.createErrorMessage = result.error
          this.$refs.createErrorModal.show()
        } else {
          this.$refs.createdNotifyModal.show()
        }
      }
    },
    async returnSuccess () {
      this.$refs.createdNotifyModal.hide()
      await this.reloadServices()
      this.$router.go(-1)
    },
    async reloadServices () {
      const username = store.getters.username
      console.log('reloadServices: username: ', username)
      const result = await API.get('mserviceApi', '/mservices', {
            'queryStringParameters': {
                'userId': username
            }
      })
      let resultJson = result
      console.log('reloadServices:: ', resultJson.length)
      store.commit('setMservices', resultJson)
    },
    uploadZipFile (file) {
      console.log('uploadZipFile')
      if (this.mservice.ServiceName === '') {
        this.zipFile = null
        this.showEmptyServiceNameAlert = true
        this.$forceUpdate()
        return
      }
      // console.log('uplaodZipFile: ', file)
      let reader = new window.FileReader() // if window is not used it says File READER is not defined
      let userId = this.mservice.UserId
      let that = this
      reader.onload = function (event) {
         // dispatch fileAttached to state UI postEditor with event.target.result as read dataURL
        let content = event.target.result
        // still save to project bucket Storage.configure({level: 'public', bucket: this.ggS3BucketName})
        let fileName = userId + '_' + that.mservice.ServiceName + '.zip'
        Storage.put(fileName, content, {
            contentType: 'application/zip'
        })
        .then(result => {
          // console.log(result)
          that.mservice.CodeFileName = fileName
          that.$forceUpdate()
        })
        .catch(err => {
          console.log('storage put error: ', err)
          that.zipFile = null // means not successful
        })
        // console.log('content: ', content)
      }
      // console.log('xx: ', file)
      // https://developer.mozilla.org/en-US/docs/Web/API/FileReader
      /*
      .readAsDataURL() return a URL representing the file's data as a base64 encoded string
      .readAsArrayBuffer() return an ArrayBuffer representing the file's data
      .readAsText() return the file's data as a text string.
      */
      reader.readAsArrayBuffer(file)
    },
    downloadZipFile () {
      if (this.mservice.CodeFileName === '' || this.mservice.CodeFileName === ' ') {
        return
      }
      this.isZipDownloading = true
      let that = this
      let fileName = this.mservice.CodeFileName
      Storage.get(fileName)
      .then(function (result) {
        console.log(result)
        // s3://bucket/key
        atHelper.downloadBinaryFile(fileName, result)
        that.isZipDownloading = false
      })
      .catch(err => {
        console.log(err)
        that.isZipDownloading = false
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

.CodeMirror {
  border: 1px solid #a78;
  padding: 5px;
}
.CodeMirror pre.CodeMirror-placeholder {
  color: #999;
}

.python .cm-tab {
  /*
    uses 4 spaces per indentation level. 
    The Python interpreter will however recognize spaces or tabs. 
    The only thing to be careful is that never mixing spaces and tabs, pick one or the other.
  */
  /* set vertical bar per tab 
  background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAACCAYAAACZgbYnAAAAEklEQVQImWOQkpLyZfD09PwPAAfYAnaStpHRAAAAAElFTkSuQmCC) right repeat-y;
  */
  /* set visible tabs */
  background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAMCAYAAAAkuj5RAAAAAXNSR0IArs4c6QAAAGFJREFUSMft1LsRQFAQheHPowAKoACx3IgEKtaEHujDjORSgWTH/ZOdnZOcM/sgk/kFFWY0qV8foQwS4MKBCS3qR6ixBJvElOobYAtivseIE120FaowJPN75GMu8j/LfMwNjh4HUpwg4LUAAAAASUVORK5CYII=);
  background-position: right;
  background-repeat: no-repeat;
}
</style>
