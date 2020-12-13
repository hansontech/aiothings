<template>
  <div>
        <b-row align-v="center" class="at-bottombar">
          <b-col sm="4" align="start">
            <h4>Applications <small>({{applications.length}})</small></h4>
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
            <!-- <b-button variant="info" @click="testApplications()">Test</b-button> -->
            
            <b-button variant="info" @click="reloadApplications()"><i class="fas fa-sync-alt" /></b-button>
            <b-button variant="success" class="ml-1" @click="createApplication()" ><i class="fas fa-plus" /></b-button>
            
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
                      @ok="deleteApplication(deletingApplicationIndex)"
                      >
                  <div class="text-center">
                    <h5>Delete this Application?</h5>
                  </div>                  
                </b-modal>
                <b-card v-for="(app, index) in filteredApplications" :key="index"
                    header = " "
                    class="at-card-api" >
                    <b-row align-v="center">
                      <b-col lg="9">
                        <h5 class="card-text">
                          {{app.ClientName}}
                        </h5>
                      </b-col>
                      <b-col lg="3" align="end">   
                        <b-dropdown variant="secondary" class="mx-0" right >
                          <!-- VUE reference: https://vuejs.org/v2/guide/events.html -->
                          <b-dropdown-item @click = "showApplicationDetail(applications.indexOf(app))" >Edit</b-dropdown-item>
                          <b-dropdown-item v-b-modal.modalDeleteConfirm @click="deletingApplicationIndex=applications.indexOf(app)" >Delete</b-dropdown-item>
                        </b-dropdown>
                      </b-col>
                    </b-row>
                    <b-row class="ml-0 mt-2" style="border-bottom: 1px solid green; padding-bottom: 5px;">  
                      <b-col>
                        <i class="fas fa-arrow-alt-circle-right"></i>&ensp;{{app.ClientId}}
                      </b-col>
                    </b-row>
                    <b-row class="ml-0 mt-2" style="border-bottom: 1px solid green; padding-bottom: 5px;">  
                      <b-col>
                       <i class="fas fa-arrow-alt-circle-right"></i>&ensp;{{app.CallbackURL}}
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
      applications: [],
      isApplicationsActionRunning: false,
      isApplicationsReloading: false,
      deletingApplicationIndex: -1
    }
  },
  computed: {
    filteredApplications () {
      let foundApplications = this.applications.filter(app => {
        return app.ClientName.toLowerCase().includes(this.$parent.searchString.toLowerCase())
      })
      foundApplications.sort(function (a, b) {
        return a.ClientName.localeCompare(b.ClientName)
      })
      return foundApplications
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
    this.applications = this.$store.getters.apps
    if (this.applications === null || this.applications.length === 0) {
      this.applications = []
      console.log('reload auth app')
      this.reloadApplications()
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
    createApplication () {
      console.log('createApplication')
      this.$router.push({name: 'newAuthApp', params: { apiIndex: -1, apiSource: this.applications }})
    },
    releaseApplicationsActionLock () {
      this.$forceUpdate()
    },
    deleteApplication (index) {
      console.log('deleteApplications')
      this.isApplicationActionRunning = true
      let app = this.$store.getters.applications[index]
      API.del('apiApi', '/apps', {
            'queryStringParameters': {
                 'app': JSON.stringify(app)
            }
      }).then(response => {
        // remove api entry from list
        if (response.error === null) {
          let apps = this.$store.getters.apps
          apps.splice(index, 1)
          this.$store.commit('setApps', apps)
          this.applications = apps
        } else {
          console.log('deleteApplications error: ', response.error)
        }
      }).catch(err => {
        console.log(err)
      })
    },
    async reloadApplications () {
      this.isApplicationsReloading = true
      await atHelper.reloadAuthApplications()
      this.isApplicationsReloading = false
      this.applications = this.$store.getters.apps
      if (this.applications === null) {
        this.applications = []
      }
      console.log('applications: ', this.applications)
      this.$forceUpdate()
    },
    showApplicationsDetail (index) {
      console.log('showApplicationsDetail: ', index)
      this.$router.push({name: 'editAuthApp', params: { appIndex: index, appSource: this.applications }})
    }
  }
}
</script>

<style>
</style>
