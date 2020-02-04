<template>
  <div>
        <b-row align-v="center" class="at-bottombar">
          <b-col sm="4" align="start">
            <h4>Applications <small>({{applications.length}})</small></h4>
          </b-col>
          <b-col sm="4">
            <b-form-input class="at-border" id="publishTopic"
              type="text" 
              v-model="$parent.searchString"
              required
              placeholder="Search ...">
            </b-form-input>
          </b-col>  
          <b-col sm="4" align="end">
            <!-- <b-button variant="info" @click="testApplications()">Test</b-button> -->
            <!--
            <b-button variant="info" @click="reloadApplicationss()">Refresh</b-button>
            <b-button variant="success" @click="createApplications()" >Create</b-button>
            -->
          </b-col>
        </b-row>
        <div v-if="isApplicationsReloading" class="mb-2">
          <b-row>
            <b-col align="center">
              <spinner  size="medium" />
            </b-col>
          </b-row>
        </div>
        <div v-if="isApplicationsActionRunning" class="mb-2">
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
            <div class="text-center" v-if="applications.length === 0">
              No Applications available.
            </div>
            <div class="at-scroll">
              <b-card-group columns>
                <b-modal id="modalDeleteConfirm"
                      hide-header 
                      size="sm"
                      @ok="deleteApplications(deletingApplicationsIndex)"
                      >
                  <div class="text-center">
                    <h5>Delete this Application?</h5>
                  </div>                  
                </b-modal>
                <b-card v-for="(api, index) in filteredApplications" :key="index"
                    header = " "
                    class="at-card-api" 
                >
                    <b-row align-v="center">
                      <b-col lg="9">
                        <h5 class="card-text">
                          {{api.ApplicationsName}}
                        </h5>
                      </b-col>
                      <b-col lg="3" align="end">   
                        <b-dropdown variant="secondary" class="mx-0" right >
                          <!-- VUE reference: https://vuejs.org/v2/guide/events.html -->
                          <b-dropdown-item @click = "showApplicationsDetail(applications.indexOf(api))" >Edit</b-dropdown-item>
                          <b-dropdown-item @click = "copyApplications(applications.indexOf(api))" >Copy</b-dropdown-item>
                          <b-dropdown-item v-b-modal.modalDeleteConfirm @click="deletingApplicationsIndex=applications.indexOf(api)" >Delete</b-dropdown-item>
                        </b-dropdown>
                      </b-col>
                    </b-row>
                    <b-row class="ml-0 mt-1">  
                      <b-col class="at-border">
                        <vue-markdown>{{api.Desc}}</vue-markdown>
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
                          <b-list-group-item style="white-space: nowrap; overflow:hidden; text-overflow: ellipsis;" v-for="(path, index) in api.Paths" v-b-popover.hover.bottom="'https://api.aiothings.com/' + api.ApplicationsName.toLowerCase() + '/' + path.toLowerCase()" :key="index">
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
  name: 'myapplications',
  data: function () {
    return {
      loading: false,
      loadedUserData: null,
      loadingUsers: {},
      select_options: {text: 'toggle'},
      applications: [],
      isApplicationsActionRunning: false,
      isApplicationsReloading: false,
      timeLeftBeforeActionComplete: 0,
      apiActionTimer: null,
      deletingApplicationsIndex: -1
    }
  },
  computed: {
    filteredApplicationss () {
      let foundApplicationss = this.applications.filter(api => {
        return api.ApplicationsName.toLowerCase().includes(this.$parent.searchString.toLowerCase())
      })
      foundApplicationss.sort(function (a, b) {
        return a.ApplicationsName.localeCompare(b.ApplicationsName)
      })
      return foundApplicationss
    }
  },
  watch: {
    applications: {
        handler: function () {
          this.$forceUpdate()
        },
        deep: true
    }
  },
  mounted () {
    // console.log('applications mounted')
    this.applications = this.$store.getters.applications
    if (this.applications === null || this.applications.length === 0) {
      this.applications = []
      console.log('reload api')
      this.reloadApplicationss()
    }
    this.loadedUserData = this.$store.getters.atusers
    if (this.loadedUserData === null) {
      this.loadedUserData = {}
    }
  },
  created () {
    // console.log('applications created')
  },
  beforeDestroy () {
    // Unsubscribe client connected
    // Unsubscribe client disconnected
  },
  methods: {
    async testApplications () {
      let accessToken = (await Auth.currentSession()).getAccessToken().getJwtToken()
      try {
        // console.log('token: ', accessToken)
        let result = await API.get('myApplications', '/query', {
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
    createApplications () {
      console.log('createApplications')
      this.$router.push({ name: 'newApplications' })
    },
    releaseApplicationsActionLock () {
      this.timeLeftBeforeActionComplete--
      if (this.timeLeftBeforeActionComplete > 0) {
      } else {
        window.clearInterval(this.apiActionTimer)
        this.isApplicationsActionRunning = false
        console.log('released lock')
      }
      this.$forceUpdate()
    },
    deleteApplications (index) {
      console.log('deleteApplications')
      if (this.isApplicationsActionRunning) {
        return
      }
      this.isApplicationsActionRunning = true
      this.timeLeftBeforeActionComplete = 32
      this.apiActionTimer = window.setInterval(this.releaseApplicationsActionLock, 1000)
      let api = this.$store.getters.applications[index]
      API.del('apiApplications', '/applications', {
            'queryStringParameters': {
                 'api': JSON.stringify(api)
            }
      }).then(response => {
        // remove api entry from list
        if (response.error === null) {
          let applications = this.$store.getters.applications
          applications.splice(index, 1)
          this.$store.commit('setApplicationss', applications)
          this.applications = applications
        } else {
          console.log('deleteApplications error: ', response.error)
        }
      }).catch(err => {
        console.log(err)
      })
    },
    async reloadApplicationss () {
      this.isApplicationsReloading = true
      await atHelper.reloadApplicationss()
      this.isApplicationsReloading = false
      this.applications = this.$store.getters.applications
      if (this.applications === null) {
        this.applications = []
      }
      console.log('applications: ', this.applications)
      this.$forceUpdate()
    },
    showApplicationsDetail (index) {
      console.log('showApplicationsDetail: ', index)
      this.$router.push({name: 'editApplications', params: { apiIndex: index, apiSource: this.applications }})
    },
    copyApplications (index) {
      this.$router.push({name: 'newApplications', params: { apiIndex: index, copiedApplications: this.applications[index] }})
    }
  }
}
</script>

<style>
</style>
