<template>
  <b-container>
    <div>
       <b-row align-v="center" style="border-bottom: 1px solid grey">
          <b-col align="start">
            <h3>New API</h3>
          </b-col>
          <b-col sm="auto" align="end" >
            <b-button variant="success" @click="createApi()"
                  v-b-popover.hover.bottom="'Create new api'">
                    Create
            </b-button>
            <b-button variant="dark" @click="$router.go(-1)">Cancel</b-button>
          </b-col>
      </b-row>
      <spinner v-if="isCreating === true" size="medium" />
      <b-modal ref="createdNotifyModal" ok-only @ok="returnSuccess()" >
                New api has been created.
              <!-- <b-btn class="mt-3" variant="outline-danger" block @click="returnSuccess()">Ok</b-btn>
              --> 
      </b-modal>
      <b-row align-v="center" class="mt-3">
        <b-col>
        </b-col>
        <b-col align-self="end">
          <b-alert variant="danger"
                dismissible
                :show="showDescCannotEmptyAlert"
                @dismissed="showDescCannotEmptyAlert=false">
                Name or description cannot be empty.
          </b-alert>
          <b-alert variant="danger"
                dismissible
                :show="showHandlerEmptyAlert"
                @dismissed="showHandlerEmptyAlert=false">
                Handler microservice must be defined first.
          </b-alert>
          <b-alert variant="danger"
                dismissible
                :show="showPathsEmptyAlert"
                @dismissed="showPathsEmptyAlert=false">
                Needs at least one path.
          </b-alert>
          <b-alert variant="danger"
                dismissible
                :show="showApiNameIsUsedAlert"
                @dismissed="showApiNameIsUsedAlert=false">
                The name has been used by another api.
          </b-alert>
          
        </b-col>
      </b-row>
    </div>
            <div class="mt-3">
              <p class="h4">API Name</p>
            </div>
            <b-row>
                <b-col md align="start">
                  <b-form-input class="at-border" v-model="api.ApiName" placeholder="API name"></b-form-input>
                </b-col>
                <b-col md="auto" align="end">
                  <b-button variant="secondary" v-b-popover.hover.bottomleft="'Check if the name is available to use'" @click="checkApiName()">Check name</b-button>
                </b-col>
            </b-row>
            <b-row>
                <b-col align-h="end" align="end">
                  <b-collapse v-model="showCheckNameMessage" id="collapse1" class="mt-2">
                    <b-card>
                      {{checkNameResultMessage}} 
                      <b-btn variant="primary" v-b-toggle.collapse1 @click="showCheckNameMessage = !showCheckNameMessage" size="sm">Confirm</b-btn>
                    </b-card>
                  </b-collapse>
                </b-col>
            </b-row>
            <b-row class="mt-3" v-if="api.ApiName !== null && api.ApiName !== ''">
                <b-col sm="3" align="end">
                  <h5 id="popoverInvokeUrl"> Invoke URL <i class="fas fa-info-circle"></i></h5>
                </b-col>
                <b-col >
                  <h6>https://api.aiothings.com/{{api.ApiName.toLowerCase()}}/{path}</h6>
                </b-col>
                <b-popover target="popoverInvokeUrl" triggers="hover focus">
                    Call a REST API through HTTP methods (GET, POST..) with the URL address
                </b-popover>
            </b-row>
            <b-row>
              <b-col>
                <div class="mt-3">
                  <p class="h4">Description</p>
                </div>
                <div style="height: 100px; background-color: rgba(255,0,0,0.1);">
                  <textarea class="at-border w-100 h-100" v-model="api.Desc" placeholder="Api description"></textarea>
                </div>
              </b-col>
            </b-row>
            <b-row class="mt-2" align-v="center">
              <b-container fluid>
                     <form @submit.stop.prevent="handleNewPathSubmit">
                      <b-row align-v="center">
                        <b-col sm="3">
                          <h4> Add Path </h4>
                        </b-col>
                        <b-col sm="7">
                          <b-form-input v-model="newPath" type="text" placeholder="path1/path2/path3"></b-form-input>
                        </b-col>
                        <b-col align="start">
                          <b-button @click="handleNewPathSubmit">Enter</b-button>
                        </b-col>
                      </b-row>
                    </form>
              </b-container>
            </b-row>
            <b-row v-if="api.Paths.length === 0">
                  <!--
                  <b-col sm="2"/>
                  <b-col class="text-center" >
                      No path is defined yet
                  </b-col>
                  -->
            </b-row>
            <b-row class="mt-1" align-v="center" v-else>
                  <b-col align="end" sm="3">
                    <h5> Paths </h5>
                  </b-col>
                  <b-col>
                      <b-list-group>
                        <b-list-group-item v-for="(path, index) in api.Paths" :key="index">
                          <b-row>
                            <b-col sm="9">
                              {{path}}
                            </b-col>
                            <b-col sm="3" align="end">
                              <b-button size="sm" @click="deletePath(index)">
                                <i class="fas fa-trash-alt"></i>
                              </b-button>
                            </b-col>
                          </b-row>
                        </b-list-group-item>
                      </b-list-group>
                    </b-col>
            </b-row>
            <b-row class="mt-3" align-v="center">
              <b-col sm="3">
                  <h4 id="popoverAuthOption">Authorization <i class="fas fa-info-circle"></i></h4>
              </b-col>
              <b-col sm="7"> 
                <b-form-select v-model="api.AuthorizationType" class="mb-3">
                  <option :value="'NONE'">None</option>
                  <option :value="'AWS_IAM'">Auth - Authentication required</option>
                  <!-- <option :value="'COGNITO_USER_POOLS'">OAuth 2.0</option> -->
                </b-form-select>
              </b-col>
              <b-popover target="popoverAuthOption" triggers="hover focus">
                    <template slot="title">Authorization Types</template>
                    When <strong><span class="text-danger">Auth</span></strong> is set, Cloud verifies the caller's signature. The tokens building this signature are obtained from caller’s login procedure.
                    <p>
                    When <em><strong>None</strong></em> is set, the API does not need caller's authentication.
                    </p>
              </b-popover>
            </b-row>
            <b-row class="mt-3" align-v="center">
              <b-col sm="3">
                <h4> Handler</h4>
              </b-col>
              <b-col sm="7">  
                <b-form-select v-model="apiService" class="mb-3">
                  <option :value="null">
                    Select the handler microservice
                  </option>
                  <option v-for="(mservice, index) in unselecetedMservices" :key="index" :value="mservice">
                    {{mservice.ServiceName}}
                  </option>
                </b-form-select>
              </b-col>
            </b-row>
  </b-container>
</template>

<script>

import { API } from 'aws-amplify'
import atHelper from '../aiot-helper'
import 'codemirror/addon/display/placeholder'

export default {
  name: 'device',
  props: ['copiedApi'],
  data: function () {
    return {
      activeMenu: 'app',
      response: 'unknown',
      what: 0,
      isCreating: false,
      mservices: null,
      apiService: null,
      api: {
        UserId: this.$store.getters.username,
        Desc: '',
        ApiName: '',
        AuthorizationType: 'NONE', // NONE | AWS_IAM | COGNITO_USER_POOLS
        Paths: []
      },
      newPath: null,
      showDescCannotEmptyAlert: false,
      showHandlerEmptyAlert: false,
      showPathsEmptyAlert: false,
      showApiNameIsUsedAlert: false,
      showCheckNameMessage: false,
      checkNameResultMessage: '',
      runtimeOptions: {'nodejs': 'Node.js 8.10', 'nodejs6.10': 'Node.js 6.10', 'nodejs8.10': 'Node.js 8.10', 'python2.7': 'Python 2.7', 'python3.7': 'Python 3.7', 'python': 'Python 3.7'},
      templateCode: {
        nodejs: '',
        python: ''
      }
    }
  },
  computed: {
     unselecetedMservices () {
      if (this.mservices === null) {
        return null
      }
      if (this.apiService === null) {
        return this.mservices
      }
      let unselectedList = []
      for (let mservice of this.mservices) {
        let isFound = false
        if (this.apiService !== null && (this.apiService.Name === mservice.ServiceName)) {
          isFound = true
        }
        if (isFound === false) {
          unselectedList.push(mservice)
        }
      }
      console.log('unselected: ', unselectedList)
      return unselectedList
    },
    codemirror () {
      return this.$refs.sourceEditor.codemirror
    }
  },
  async created () {
    // console.log('new api: copied? ', this.copiedApi)
    if (typeof this.copiedApi !== 'undefined') {
      console.log('copied from')
      this.api = Object.assign({}, this.copiedApi)
      this.api.ApiName = this.copiedApi.ApiName + '_copy'
      this.api.UserId = this.$store.getters.username
    }
    console.log('new api: copied? ', this.api)
  },
  async mounted () {
    this.mservices = this.$store.getters.mservices
    if (this.mservices === null) {
      await atHelper.reloadServices()
      this.mservices = this.$store.getters.mservices
    }
  },
  methods: {
    handleNewPathSubmit () {
      if (this.newPath === null || this.newPath === '') {
        return
      }
      let existingFound = this.api.Paths.find(path => { return this.newPath === path })
      console.log('path found: ', existingFound)
      if (existingFound === undefined || existingFound.length === 0) {
        this.api.Paths.push(this.newPath)
        console.log('Paths:', this.api.Paths)
      }
    },
    deletePath (index) {
      this.api.Paths.splice(index, 1)
    },
    setCmActive () {
      console.log('setCmActive')
      var that = this
      setTimeout(function () {
        that.codemirror.refresh()
      }, 1)
    },
    async checkApiName () {
      console.log('checkApiName')
      // this.showCollapse = !this.showCollapse
      if (this.api.ApiName === null || this.api.ApiName === '') {
        return
      }
      if (this.showCheckNameMessage) {
        this.showCheckNameMessage = false
        return
      }
      const result = await API.get('apiApi', '/checkname', {
          'queryStringParameters': {
            'apiName': this.api.ApiName
          }
      })
      console.log('result: ', result)
      if (result.error !== null) {
        this.checkNameResultMessage = result.error
      } else {
        if (result.hasOwnProperty('api') && result.api.length > 0) {
          this.checkNameResultMessage = 'This API Name has been used already.'
        } else {
          this.checkNameResultMessage = 'This API Name is available to use.'
        }
      }
      this.showCheckNameMessage = true
    },
    async createApi () {
      console.log('api: ', this.api)
      if (this.api.Desc === '' || this.api.ApiName === '') {
        this.showDescCannotEmptyAlert = true
        return
      }
      if (this.apiService === null) {
        this.showHandlerEmptyAlert = true
        return
      }
      if (this.api.Paths.length === 0) {
        this.showPathsEmptyAlert = true
        return
      }
      if (this.api.UserId !== null) {
        this.isCreating = true
        const checkResult = await API.get('apiApi', '/checkname', {
          'queryStringParameters': {
            'apiName': this.api.ApiName
          }
        })
        if (checkResult.error !== null || (checkResult.api !== undefined && checkResult.api.length > 0)) {
          this.isCreating = false
          this.checkNameResultMessage = 'This API Name has been used already.'
          this.showCheckNameMessage = true
          return
        }

        let mservice = this.apiService // mserviceFound[0] // must exist
        this.api.Handler = this.apiService.ServiceName
        const result = await API.post('apiApi', '/apis', { body: { api: this.api, handler: mservice } })
        if (result.error === null) {
          this.api = result.result
        }
        this.isCreating = false
        this.$refs.createdNotifyModal.show()
      }
    },
    async returnSuccess () {
      this.$refs.createdNotifyModal.hide()
      await atHelper.reloadApis()
      this.$router.go(-1)
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

</style>
