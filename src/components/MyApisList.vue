<template>
  <div>
        <b-row align-v="center" class="at-bottombar">
          <b-col sm="4" align="start">
            <h4>REST APIs <small>({{apis.length}})</small></h4>
          </b-col>
          <b-col sm="4">
            <b-form-input class="at-border"
              type="text" 
              v-model="$parent.searchString"
              required
              placeholder="Search ...">
            </b-form-input>
          </b-col>  
          <b-col sm="4" align="end">
            <!-- <b-button variant="info" @click="testApi()">Test</b-button> -->
            <b-button variant="info" @click="reloadApis()"><i class="fas fa-sync-alt" /></b-button>
            <b-button variant="success" class="ml-1" @click="createApi()" ><i class="fas fa-plus" /></b-button>
          </b-col>
        </b-row>
        <div v-if="isApiReloading" class="mb-2">
          <b-row>
            <b-col align="center">
              <spinner  size="medium" />
            </b-col>
          </b-row>
        </div>
        <div v-if="isApiActionRunning" class="mb-2">
          <b-row>
            <b-col align="center">
              <!-- <spinner  size="medium" />{{timeLeftBeforeActionComplete}}s -->
              <b-button variant="primary" disabled>
                <b-spinner type="grow"></b-spinner> &ensp;
                <strong><font size="+2">{{timeLeftBeforeActionComplete}}s..</font></strong>
              </b-button>
            </b-col>
          </b-row>
        </div>
            <div class="text-center" v-if="apis.length === 0">
              No APIs available.
            </div>
            <div class="at-scroll">
              <b-card-group columns>
                <b-modal id="modalDeleteConfirm"
                      hide-header 
                      size="sm"
                      @ok="deleteApi(deletingApiIndex)"
                      >
                  <div class="text-center">
                    <h5>Delete this API?</h5>
                  </div>                  
                </b-modal>
                <b-card v-for="(api, index) in filteredApis" :key="index"
                    header = " "
                    class="at-card-api" 
                >
                    <b-row align-v="center">
                      <b-col lg="9">
                        <h5 class="card-text">
                          {{api.ApiName}}
                        </h5>
                      </b-col>
                      <b-col lg="3" align="end">   
                        <b-dropdown variant="secondary" class="mx-0" right >
                          <!-- VUE reference: https://vuejs.org/v2/guide/events.html -->
                          <b-dropdown-item @click = "showApiDetail(apis.indexOf(api))" >Edit</b-dropdown-item>
                          <b-dropdown-item @click = "copyApi(apis.indexOf(api))" >Copy</b-dropdown-item>
                          <b-dropdown-item v-b-modal.modalDeleteConfirm @click="deletingApiIndex=apis.indexOf(api)" :disabled="$store.getters.isGuestLoggedin">Delete</b-dropdown-item>
                        </b-dropdown>
                      </b-col>
                    </b-row>
                    <b-row class="ml-0 mt-1">  
                      <b-col class="at-border">
                        <markdown-it-vue :content="api.Desc" />
                      </b-col>
                    </b-row>
                    <b-row class="ml-0 mt-2" style="border-bottom: 1px solid green; padding-bottom: 5px;">  
                      <b-col>
                        <!-- <h5><b-badge variant="info">{{api.Handler}}</b-badge></h5> -->
                        <i class="fas fa-arrow-alt-circle-right"></i>&ensp;{{api.Handler}}
                      </b-col>
                    </b-row>
                    <b-row class="ml-0 mt-2">
                      <b-col>  
                        <b-list-group>
                          <!-- string is truncated as abcde... form by text-overflow: ellipsis; -->
                          <b-list-group-item style="white-space: nowrap; overflow:hidden; text-overflow: ellipsis;" v-for="(path, index) in api.Paths" v-b-popover.hover.bottom="'https://api.aiothings.com/' + api.ApiName.toLowerCase() + '/' + path.toLowerCase()" :key="index">
                            <code>{{path}}</code>
                          </b-list-group-item>
                        </b-list-group>
                      </b-col>
                    </b-row>
                </b-card>
              </b-card-group>
            </div>
  </div>
</template>

<script>

import atHelper from '../aiot-helper'
import { Auth, API } from 'aws-amplify'

export default {
  name: 'myapis',
  data: function () {
    return {
      loading: false,
      loadedUserData: null,
      loadingUsers: {},
      select_options: {text: 'toggle'},
      apis: [],
      isApiActionRunning: false,
      isApiReloading: false,
      timeLeftBeforeActionComplete: 0,
      apiActionTimer: null,
      deletingApiIndex: -1
    }
  },
  computed: {
    filteredApis () {
      let foundApis = this.apis.filter(api => {
        return api.ApiName.toLowerCase().includes(this.$parent.searchString.toLowerCase())
      })
      foundApis.sort(function (a, b) {
        return a.ApiName.localeCompare(b.ApiName)
      })
      return foundApis
    }
  },
  watch: {
    apis: {
        handler: function () {
          this.$forceUpdate()
        },
        deep: true
    }
  },
  mounted () {
    // console.log('apis mounted')
    this.apis = this.$store.getters.apis
    if (this.apis === null || this.apis.length === 0) {
      this.apis = []
      console.log('reload api')
      this.reloadApis()
    }
    this.loadedUserData = this.$store.getters.atusers
    if (this.loadedUserData === null) {
      this.loadedUserData = {}
    }
  },
  created () {
    // console.log('apis created')
  },
  beforeDestroy () {
    // Unsubscribe client connected
    // Unsubscribe client disconnected
  },
  methods: {
    async testApi () {
      let accessToken = (await Auth.currentSession()).getAccessToken().getJwtToken()
      try {
        // console.log('token: ', accessToken)
        let result = await API.get('myApi', '/query', {
              headers: {
                'Authorization': 'Bearer ' + accessToken,
                'Accept': 'application/json',
                'Cache-Control': 'no-cache'
              },
              queryStringParameters: {
                'ThingId': 'Facebook_10212683421500597_1536893927497'
              }
        })
        console.log('result: ', result)
      } catch (e) {
        console.log('test api error: ', e)
      }
    },
    createApi () {
      console.log('createApi')
      this.$router.push({ name: 'newApi' })
    },
    releaseApiActionLock () {
      this.timeLeftBeforeActionComplete--
      if (this.timeLeftBeforeActionComplete > 0) {
      } else {
        window.clearInterval(this.apiActionTimer)
        this.isApiActionRunning = false
        console.log('released lock')
      }
      this.$forceUpdate()
    },
    deleteApi (index) {
      console.log('deleteApi')
      if (this.isApiActionRunning) {
        return
      }
      this.isApiActionRunning = true
      this.timeLeftBeforeActionComplete = 32
      this.apiActionTimer = window.setInterval(this.releaseApiActionLock, 1000)
      let api = this.$store.getters.apis[index]
      API.del('apiApi', '/apis', {
            'queryStringParameters': {
                 'api': JSON.stringify(api)
            }
      }).then(response => {
        // remove api entry from list
        if (response.error === null) {
          let apis = this.$store.getters.apis
          apis.splice(index, 1)
          this.$store.commit('setApis', apis)
          this.apis = apis
        } else {
          console.log('deleteApi error: ', response.error)
        }
      }).catch(err => {
        console.log(err)
      })
    },
    async reloadApis () {
      this.isApiReloading = true
      await atHelper.reloadApis()
      this.isApiReloading = false
      this.apis = this.$store.getters.apis
      if (this.apis === null) {
        this.apis = []
      }
      console.log('apis: ', this.apis)
      this.$forceUpdate()
    },
    showApiDetail (index) {
      console.log('showApiDetail: ', index)
      this.$router.push({name: 'editApi', params: { apiIndex: index, apiSource: this.apis }})
    },
    copyApi (index) {
      this.$router.push({name: 'newApi', params: { apiIndex: index, copiedApi: this.apis[index] }})
    }
  }
}
</script>

<style>
</style>
