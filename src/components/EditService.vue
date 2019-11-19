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
          <b-button variant="dark" @click="backHome()">Return<sub><b-badge class="ml-1" variant="warning" v-if="isChangedNotSaved">&nbsp;</b-badge></sub></b-button>
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
              <p class="h5">Service Name</p>
            </div>
            <div>
              <b-form-input class="at-border" v-model="mservice.ServiceName" placeholder="Service name" disabled></b-form-input>
            </div>
            <div class="mt-3">
              <p class="h5">Description</p>
            </div>
            <div style="height: 100px; background-color: rgba(255,0,0,0.1);">
              <textarea class="at-border w-100 h-100" v-model.lazy="mservice.ServiceDesc" placeholder="Service description"></textarea>
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
          <b-alert variant="danger"
                  dismissible
                  :show="showInvalidCodeHandlerAlert"
                  @dismissed="showInvalidCodeHandlerAlert=false">
                  Invalid handler format, should be 'main.handler'.
          </b-alert>
          <b-row>
            <b-col sm>
              <b-form-group label-cols-sm="3" label="Code entry type:" label-align="right">
                 <b-form-select v-model="mservice.CodeEntryType" :options="codeEntryOptions" v-on:change="changeCodeEntry(mservice.CodeEntryType)"></b-form-select>
              </b-form-group>
            </b-col>
          </b-row>
          <b-row v-if="mservice.CodeEntryType === 'inline'">
            <spinner v-if="isSourceLoading === true" size="medium" />
            <codemirror id="sourceEditor" v-else class="mt-2 w-100 h-100" v-bind:class="languageType" v-model="mservice.ServiceCode" ref="sourceEditor" placeholder="Microservice code" :lintOptions="{}">
            </codemirror>
          </b-row>
          <div v-else-if="mservice.CodeEntryType === 'zip'">
            <b-row class = "mt-2">
              <b-form-file
                v-model="zipFile"
                :state="Boolean(zipFile)"
                placeholder="Choose a file or drop it here..."
                drop-placeholder="Drop file here..."
                accept=".zip"
              ></b-form-file>
              <!-- <div class="mt-3">Selected zip file: {{ zipFile ? zipFile.name : '' }}</div> -->
            </b-row>
            <b-row class="mt-2">
              <spinner v-if="isZipDownloading === true" size="medium" />
            </b-row>
            <b-row class="mt-2">
              <b-button v-if="mservice.CodeFileName !== ' ' && isZipDownloading === false" style="display: inline;" id="downloadZipFileButton" variant="info" @click="downloadZipFile()">Download zip file</b-button>
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
                :label-cols="4"
                breakpoint="md"
                label-size="lg"
                label-class="font-weight-bold"
                label="Input message topic"
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
// import config from '../config'

export default {
  name: 'device',
  props: ['serviceIndex', 'serviceSource'], // VUE reference https://router.vuejs.org/guide/essentials/passing-props.html
  data: function () {
    return {
      mservice: null,
      zipFile: null,
      inputMicroservice: '',
      isChangedNotSaved: null,
      isUpdating: false,
      isZipDownloading: false,
      isSourceLoading: false,
      mserviceBackup: null,
      isShowEdit: false,
      showZipOnlySupportPython: false,
      showInvalidCodeHandlerAlert: false,
      runtimeOptions: {'nodejs': 'Node.js 8.10', 'nodejs6.10': 'Node.js 6.10', 'nodejs8.10': 'Node.js 8.10', 'python2.7': 'Python 2.7', 'python3.7': 'Python 3.7', 'python': 'Python 3.7'},
      codeEntryOptions: [
          {value: 'inline', text: 'Edit code inline'},
          {value: 'zip', text: 'Upload .zip file'}
      ],
      errorMsg: '',
      deployMessageFormat: 'Optional, a JSON form of { "topic": ... "data": ... }'
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
    console.log('EditSource created: ')
    let index = this.serviceIndex
    // https://scotch.io/bar-talk/copying-objects-in-javascript
    // only shallow copying, is enough
    // 20181112 this.mservice = Object.assign({}, this.$store.getters.mservices[index])
    // this.mservice = Object.assign({}, this.serviceSource[index])
    let mserviceStr = JSON.stringify(this.serviceSource[index])
    this.mservice = JSON.parse(mserviceStr)
    console.log('mservice: ', this.mservice)
    if (this.mservice.hasOwnProperty('CodeEntryType') === false) {
      this.mservice['CodeEntryType'] = 'inline'
      this.mservice['CodeFileName'] = ' '
      if (this.mservice.hasOwnProperty('CodeHandler') === false) {
        this.mservice['CodeHandler'] = 'main.handler'
      }
    }
    if (this.mservice.InputMicroservice === '+') {
      this.inputMicroservice = ''
    } else {
      this.inputMicroservice = this.mservice.InputMicroservice
    }
    console.log('before loadSource')
    this.loadSource()
  },
  mounted () {
  },
  beforeDestroy () {
  },
  watch: {
    isChangedNotSaved: function () {
      console.log('var changed')
    },
    mservice: {
      handler: function (newService) {
        if (this.mserviceBackup !== null) {
          let isEqual = this.$_.isEqual(
            this.$_.omit(this.mserviceBackup, ['ServiceCode']),
            this.$_.omit(newService, ['ServiceCode']))
          // console.log('mservices : ', this.mserviceBackup, newService)
          // console.log('mservice changed: ', isEqual)
          if (isEqual === false && this.isChangedNotSaved !== true) {
            this.isChangedNotSaved = true
            // this.$forceUpdate()
          }
        }
        this.mserviceBackup = this.$_.clone(newService)
      },
      deep: true
    },
    zipFile: function (newValue, oldValue) {
      if (newValue !== oldValue && (newValue !== '' && newValue !== null)) {
        this.uploadZipFile(newValue)
      }
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
    onCodeChangeHandler (cmObject, changeObject) {
        // console.log('content changed: ', cmObject, changeObject)
        this.isChangedNotSaved = true
    },
    setCmActive () {
      console.log('setCmActive: ')
      if (typeof this.$refs.sourceEditor === 'undefined') {
        return
      }
      // var that = this
      let cm = this.codemirror
      cm.on('change', this.onCodeChangeHandler.bind(this))
      let runtime = this.mservice.ServiceRuntime
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
      Storage.configure({level: 'public'})
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
    changeCodeEntry (codeEntryType) {
      console.log('change code entry: ', codeEntryType)
      /*
      if (this.mservice.ServiceRuntime.includes('python') === false) {
        this.mservice.CodeEntryType = 'inline'
        this.showZipOnlySupportPython = true
      }
      */
      this.$forceUpdate()
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
        if (this.mservice.hasOwnProperty('CodeEntryType') && this.mservice.CodeEntryType === 'zip') {
          if (this.mservice.CodeFileName === null || this.mservice.CodeFileName === ' ') {
            return
          }
          let codeHandlerFormat = this.mservice.CodeHandler.split('.')
          if (codeHandlerFormat.length !== 2) {
            this.showInvalidCodeHandlerAlert = true
            return
          }
        }
        this.isUpdating = true
        const body = this.mservice
        const result = await API.post('mserviceApi', '/mservices', { body })
        console.log('updateService: result: ', result)
        if (result.hasOwnProperty('success')) {
          let newMservice = result.microservice.Attributes
          newMservice.ServiceCode = this.mservice.ServiceCode
          this.mservice = newMservice
          this.$store.dispatch('replaceMservice', {replacingService: this.mservice, services: this.serviceSource})
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
    },
    uploadZipFile (file) {
      console.log('uplaodZipFile: ', file)
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
          // s3://bucket/key
          that.mservice.CodeFileName = fileName
          that.$forceUpdate()
        })
        .catch(err => {
          console.log(err)
          that.zipFile = null // means not successful
        })
        // console.log('content: ', content)
      }
      // https://developer.mozilla.org/en-US/docs/Web/API/FileReader
      /*
      .readAsDataURL() return a URL representing the file's data as a base64 encoded string
      .readAsArrayBuffer() return an ArrayBuffer representing the file's data
      .readAsText() return the file's data as a text string.
      */
      reader.readAsArrayBuffer(file)
    },
    async downloadZipFile () {
      if (this.mservice.CodeFileName === '' || this.mservice.CodeFileName === ' ') {
        return
      }
      this.isZipDownloading = true
      let that = this
      let fileName = this.mservice.CodeFileName
      try {
        let result = await Storage.get(fileName)
        await atHelper.downloadBinaryFile(fileName, result)
        that.isZipDownloading = false
      } catch (err) {
        console.log(err)
        that.isZipDownloading = false
      }
      /*
      await Storage.get(fileName)
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
      */
    }
  }
}
</script>

<style>
/*
.at-border {
  border: 1px solid #a78;
  padding: 5px;
}
*/
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

/*
.javascript .cm-tab {
 
}
*/
.python .cm-tab {
  /*
    use 4 spaces per indentation level. 
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
