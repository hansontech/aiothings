<template>
  <b-container fluid>
      <b-row align-v="center" style="border-bottom: 1px solid grey; padding-bottom: 5px; margin-bottom: 5px;">
        <b-col align="start">
            <h4>Edit REST API </h4>
        </b-col>
        <b-col sm="auto" align="end" >
          <b-button variant="success" :disabled="api.UserId !== $store.getters.username" @click="updateApi()">Update</b-button>
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
        </b-col>
      </b-row>
          <b-row align-v="center" class="mt-3">
            <b-col sm="3">
              <p class="h5">API Name</p>
            </b-col>
            <b-col> 
              <b-list-group>
                <b-list-group-item>
                  <h5>{{api.ApiName}}</h5>
                </b-list-group-item>
              </b-list-group>
            </b-col>
          </b-row>
          <b-row class="mt-3">
            <b-col>
              <p class="h5">Description</p>
              <div style="height: 100px; background-color: rgba(255,0,0,0.1);">
                <textarea class="at-border w-100 h-100" v-model="api.Desc" placeholder="Api description"></textarea>
              </div>
            </b-col>
          </b-row>
          <b-row class="mt-3" v-if="api.ApiName !== null && api.ApiName !== ''">
                <b-col sm="3" align="start" >
                  <h5 id="popoverInvokeUrl"> Invoke URL <i class="fas fa-info-circle"></i></h5>
                </b-col>
                <b-col >
                  <h6>https://api.aiothings.com/{{api.ApiName.toLowerCase()}}/{path}</h6>
                </b-col>
                <b-popover target="popoverInvokeUrl" triggers="hover focus">
                    Call the REST API through HTTP methods (GET, POST..) with the URL address
                </b-popover>
          </b-row>
          <b-row class="mt-2" align-v="center">
              <b-container fluid>
                  <form @submit.stop.prevent="handleNewPathSubmit">
                    <b-row align-v="center">
                      <b-col sm="2">
                        <h5> Add Path </h5>
                      </b-col>
                      <b-col sm="5">
                        <b-form-input v-model="newPath" type="text" placeholder="path1/path2/path3"></b-form-input>
                      </b-col>
                      <b-col sm="3" id="popoverAuthOption"> 
                        <b-form-select v-model="newPathAuth" :options="authOptions">
                        </b-form-select>
                      </b-col>
                      <b-col sm="2" @click="handleNewPathSubmit" align="start" >
                        <b-button>Enter</b-button>
                      </b-col>
                    </b-row>
                  </form>
              </b-container>
              <b-popover target="popoverAuthOption" triggers="hover focus">
                    <template slot="title">Authorization Types</template>
                    When <strong><span class="text-info">Auth Type</span></strong> is set, Cloud needs to verify the user through login procedure.
                    <p>
                    When <strong>Public</strong> is set, the API can be accessed without authentication.
                    </p>
                <!--
                    <template slot  ="title">Authorization Types</template>
                    When <strong><span class="text-danger">Auth</span></strong> is set, Cloud verifies the caller's signature. The tokens building this signature are obtained from caller’s login procedure.
                    <p>
                    When <em><strong>Public</strong></em> is set, the API does not need caller's authentication.
                    </p>
                -->
              </b-popover>
          </b-row>
          <b-row v-if="api.Paths.length === 0">
          </b-row>
          <b-row class="mt-1" align-v="center" v-else>
              <b-col align="end" sm="2">
                <h5> Paths </h5>
              </b-col>
              <b-col>
                <b-list-group>
                  <b-list-group-item v-for="(path, index) in api.Paths" :key="index">
                    <b-row>
                      <b-col sm="6">
                        {{path}}
                      </b-col>
                      <b-col sm="4" align="center">
                        <h5><b-badge>{{authOption[api.PathAuth[path]]}}</b-badge></h5>
                      </b-col>
                      <b-col sm="2" align="end">
                        <b-button size="sm" @click="deletePath(index)">
                          <i class="fas fa-trash-alt"></i>
                        </b-button>
                      </b-col>
                    </b-row>
                  </b-list-group-item>
                </b-list-group>
              </b-col>
          </b-row>
          <!--
          <b-row class="mt-3" align-v="center">
             <b-col sm="3">
                  <h4 id="popoverAuthOption">Authorization <i class="fas fa-info-circle"></i></h4>
              </b-col>
              <b-col sm="7"> 
                <b-form-select v-model="api.AuthorizationType" class="mb-3">
                  <option :value="'NONE'">Public access</option>
                  <option :value="'AWS_IAM'" :disabled="true">Authentication required</option>
                  <option :value="'AUTH-SHARE'">Authenticated access</option>
                  <option :value="'AUTH'">Owner access only</option>
                  <option :value="'COGNITO_USER_POOLS'" :disabled="true">OAuth 2.0</option>
                </b-form-select>
              </b-col>
          </b-row>
          -->
          <b-row class="mt-3 mb-3" align-v="center">
            <b-col sm="2">
              <h5> Handler</h5>
            </b-col>
            <b-col sm="7">  
              <b-form-select v-model="apiService">
                <option :value="null">
                  Select the handler microservice
                </option>
                <option v-for="(mservice, index) in unselecetedMservices" :key="index" :value="mservice">
                  {{mservice.ServiceName}}
                </option>
              </b-form-select>
            </b-col>
            <b-col sm="3">
              <b-form-input 
                type="text" 
                v-model="funcFilterString"
                required
                placeholder="Select filter ...">
              </b-form-input>
            </b-col>
          </b-row>
  </b-container>
 </template>

<script>

import {API} from 'aws-amplify'
import atHelper from '../aiot-helper'

export default {
  name: 'device',
  props: ['apiIndex', 'apiSource'], // VUE reference https://router.vuejs.org/guide/essentials/passing-props.html
  data: function () {
    return {
      mservices: null,
      api: null,
      newPath: null,
      newPathAuth: 'NONE',
      apiService: null,
      isChangedNotSaved: null,
      isUpdating: false,
      apiDesc: '',
      isShowEdit: false,
      errorMsg: '',
      showDescCannotEmptyAlert: false,
      showHandlerEmptyAlert: false,
      showPathsEmptyAlert: false,
      funcFilterString: '',
      authOption: {'NONE': 'Public', 'AUTH-SHARE': 'Auth Share', 'AUTH': 'Auth Owner '},
      authOptions: [
          {value: 'NONE', text: 'Public access'},
          {value: 'AUTH-SHARE', text: 'Authenticated access'},
          {value: 'AUTH', text: 'Owner access only'}
      ]
    }
  },
  computed: {
     unselecetedMservices () {
      if (this.mservices === null) {
        return null
      }
      let foundServices = this.mservices.filter(service => {
        return (service.ServiceName.toLowerCase().includes(this.funcFilterString.toLowerCase()) ||
                    (this.apiService === service)
               )
      })
      foundServices.sort(function (a, b) {
        return a.ServiceName.localeCompare(b.ServiceName)
      })
      return foundServices
    },
    isShared (sharingStatus) {
      return (sharingStatus === 'true')
    },
    codemirror () {
      return this.$refs.sourceEditor.codemirror
    }
  },
  beforeCreate () {
    console.log('EditSource beforeCreate')
  },
  created () {
    console.log('EditApi created')
    let index = this.apiIndex
    // https://scotch.io/bar-talk/copying-objects-in-javascript
    // only shallow copying, is enough
    // 20181112 this.api = Object.assign({}, this.$store.getters.apis[index])
    let apiStr = JSON.stringify(this.$store.getters.apis[index])
    this.api = JSON.parse(apiStr)
    if (this.api.hasOwnProperty('PathAuth') === false) {
      this.api.PathAuth = {}
      for (let path of this.api.Paths) {
        this.api.PathAuth[path] = this.api.AuthorizationType
      }
      console.log('pathAuth: ', this.api.PathAuth)
    }
    console.log('edit api: ', this.api)
  },
  async mounted () {
    this.mservices = this.$store.getters.mservices
    if (this.mservices === null) {
      await atHelper.reloadServices()
      this.mservices = this.$store.getters.mservices
    }
    let msFound = this.mservices.find(ms => ms.ServiceName === this.api.Handler)
    console.log('msFound: ', msFound)
    if (typeof msFound !== 'undefined' && msFound !== null) {
      this.apiService = msFound
      console.log('found: ', this.apiService)
      this.$forceUpdate()
    }
  },
  beforeDestroy () {
  },
  watch: {
    apiDesc: function (newDesc, oldDesc) {
      if (newDesc !== oldDesc && this.isChangedNotSaved !== null) {
        this.isChangedNotSaved = true
      }
    },
    api: function () {
      console.log('api changed')
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
        this.api.PathAuth[this.newPath] = this.newPathAuth
        console.log('Paths:', this.api.Paths)
      }
    },
    deletePath (index) {
      delete this.api.PathAuth[this.api.Paths[index]]
      this.api.Paths.splice(index, 1)
    },
    setCmActive () {
      console.log('setCmActive')
      var that = this
      setTimeout(function () {
        that.codemirror.refresh()
      }, 1)
    },
    async updateApi () {
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
        this.isUpdating = true
        let mservice = this.apiService // mserviceFound[0] // must exist
        this.api.Handler = this.apiService.ServiceName
        const result = await API.post('apiApi', '/apis', { body: { api: this.api, handler: mservice } })
        if (result.error === null) {
          this.api = result.result
          this.$store.dispatch('replaceApi', this.api)
        } else {
          console.log('error: ', result.error)
        }
        this.isChangedNotSaved = false
        this.isUpdating = false
      }
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
        console.log('real quit')
        this.$refs.modalReturnConfirmRef.show()
      } else {
        this.$router.go(-1)
      }
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

div.at-bottombar {
  /* background-color : grey; */
  padding-bottom: 5px;
  margin-bottom: 5px;
  border-bottom: 1px solid grey
}

.btn:hover { outline: 0 !important }

</style>
