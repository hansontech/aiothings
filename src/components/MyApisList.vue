<template>
   <b-container fluid> 
      <div class="at-bottombar">
        <b-row align-v="center">
            <b-col align="start">
              <h4>My REST APIs ({{apis.length}})</h4>
            </b-col>
            <b-col sm="auto" align="end">
              <b-button variant="info" @click="reloadApis()">Refresh</b-button>
              <b-button variant="success" @click="createApi()" >Create</b-button>
            </b-col>
        </b-row>
      </div>
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
                <b-card v-for="(api, index) in apis" :key="index"
                    class="mb-2 at-card">
                    <b-row style="height: 30px">
                      <b-col class="color-box" style="background-color: MediumAquamarine; height: 30px">
                      </b-col>
                    </b-row>
                    <b-row class="mt-2">
                      <b-col>
                        <p class="card-text">
                          {{api.ApiName}}
                        </p>
                      </b-col>
                      <b-col align="end">   
                        <b-dropdown variant="secondary" class="mx-0" right >
                          <!-- VUE reference: https://vuejs.org/v2/guide/events.html -->
                          <b-dropdown-item @click = "showApiDetail(index)" >Edit</b-dropdown-item>
                          <b-dropdown-item @click = "copyApi(index)" >Copy</b-dropdown-item>
                          <b-dropdown-item @click.stop="deleteApi(index)" >Delete</b-dropdown-item>
                        </b-dropdown>
                      </b-col>
                    </b-row>
                    <b-row class="ml-0 mt-2" style="border-bottom: 1px solid green; padding-bottom: 5px;">  
                      <b-col>
                        {{api.Desc}}
                      </b-col>
                    </b-row>
                    <b-row class="ml-0 mt-2" style="border-bottom: 1px solid green; padding-bottom: 5px;">  
                      <b-col>
                        {{api.Handler}}
                      </b-col>
                    </b-row>
                    <b-row class="ml-0 mt-2">
                      <b-col>  
                        <b-list-group>
                          <b-list-group-item v-for="(path, index) in api.Paths" :key="index">
                            {{path}}
                          </b-list-group-item>
                        </b-list-group>
                      </b-col>
                    </b-row>
                </b-card>
              </b-card-group>
            </div>

  </b-container> 
</template>

<script>

import atHelper from '../aiot-helper'
import { API } from 'aws-amplify'

export default {
  name: 'myapis',
  data: function () {
    return {
      loading: false,
      loadedUserData: null,
      loadingUsers: {},
      select_options: {text: 'toggle'},
      apis: {},
      isApiActionRunning: false,
      isApiReloading: false,
      timeLeftBeforeActionComplete: 0,
      apiActionTimer: null
    }
  },
  computed: {
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
    console.log('apis mounted')
    this.apis = this.$store.getters.apis
    if (this.apis === null || this.apis.length === 0) {
      this.apis = {}
      console.log('reload api')
      this.reloadApis()
    }
    this.loadedUserData = this.$store.getters.atusers
    if (this.loadedUserData === null) {
      this.loadedUserData = {}
    }
  },
  created () {
    console.log('apis created')
  },
  beforeDestroy () {
    // Unsubscribe client connected
    // Unsubscribe client disconnected
  },
  methods: {
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
        this.apis = {}
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

div.at-bottombar {
  /* background-color : grey; */
  padding-bottom: 5px;
  margin-bottom: 5px;
  border-bottom: 1px solid grey
}

.at-bottombar {
  /* background-color : grey; */
  padding-bottom: 5px;
  margin-bottom: 5px;
  border-bottom: 1px solid grey
}

.color-box {
    width: 100%;
    display: inline-block;
    background-color: var(--color);
    position: absolute;
    right: 0px;
    left: 0px;
    top: 0px;
}

</style>
