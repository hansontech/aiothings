<template>
  <b-container fluid> 
      <div class="at-bottombar">
       <b-row align-v="center" class="at-sidebar">
            <b-col align="start" class="mt-1">
              <h4 v-b-popover.hover.bottom="'Use Search to query microservices'">Shared Solutions &ensp;<small><i class="fas fa-info-circle"></i></small></h4>
            </b-col>
            <b-col align="end">
              <b-button variant="info" @click="refreshSolutions()">Refresh</b-button>
              <!-- <b-button align="end" variant="info" @click="createSolution()" >Add new solution</b-button> -->
            </b-col>
        </b-row>
      </div>
      <b-card no-body>
         <b-tabs card>
          <b-tab title="Node-RED Flows">
            <div class="holds-the-iframe embed-responsive embed-responsive-16by9">
              <iframe id="nodered" class="embed-responsive-item" :src="nodeRedLink" allowfullscreen></iframe>
            </div>
          </b-tab>
          <!--
          <b-tab title="AWS solutions">
            <div class="text-center" v-if="solutions.length === 0">
              No shared solution is found.
            </div>
            <div class="at-scroll">
              <b-card-group columns>
              <b-card v-for="(solution, index) in solutions" :key="solution.SolutionId"
                  img-src="https://picsum.photos/600/300/?image=25"
                  img-alt="Image"
                  img-top
                  @click = "showSolutionDetail(index)"
                  tag="article"
                  class="mb-2 at-card">
                  <b-row>
                    <b-col align="start">
                      <b-badge variant="primary">{{solution.SolutionName}}</b-badge>
                    </b-col>
                    <b-col align="end">   
                      <b-dropdown variant="success" class="mx-1" right >
                        <b-dropdown-item @click.stop="deploySolution(solution)" >Deploy</b-dropdown-item>
                        <b-dropdown-item @click.stop="deleteSolution(index)" >Delete</b-dropdown-item>
                      </b-dropdown>
                    </b-col>
                  </b-row>
                  <b-row class="ml-1 mt-2">  
                    <p class="card-text">
                      {{solution.SolutionDesc}}
                    </p>
                  </b-row>
                </b-card>
              </b-card-group>
            </div>
          </b-tab>
          -->
         <b-tab :title="'Shared Microservices ( '+ services.length + ' )'" active>
            <div v-if="isLoadingServices">
              <spinner size="medium" />
            </div>
            <div class="text-center" v-if="services.length === 0 && isLoadingServices === false">
              <p>No shared micoservices from others found.</p>
            </div>
            <div class="at-scroll">
              <b-card-group columns>
                <b-card v-for="(service, index) in services" :key="service.ServiceName"
                    img-top
                    tag="article"
                    class="mb-2 at-card">
                    <b-row style="height: 30px">
                      <b-col class="color-box" style="background-color: gainsboro; height: 30px">
                      </b-col>
                    </b-row>
                    <b-row class="mt-2">
                      <b-col>
                        <p class="card-text">
                          {{service.ServiceName}}
                        </p>
                      </b-col>
                      <b-col align="end">   
                       <b-dropdown variant="secondary" class="mx-0" right >
                           <!-- VUE reference: https://vuejs.org/v2/guide/events.html -->
                          <b-dropdown-item @click = "showServiceDetail(index)" >Edit</b-dropdown-item>
                          <b-dropdown-item @click = "copyService(index)" >Copy</b-dropdown-item>
                        </b-dropdown>
                      </b-col>
                    </b-row>
                    <b-row align-v="center">
                      <b-col>
                        <b-button size="sm" variant="light" v-b-popover.hover.bottomright="'Owner'" @click="loadUser(service.UserId)"><em>{{getUsername(service.UserId)}}</em></b-button>
                      </b-col>
                      <b-col align="end" class="mt-2" v-if="$store.getters.isAuthenticated"> 
                          <input id="toggle" v-b-popover.hover.bottom="'Set as favorite'"  @click="toggleSelect(service.ServiceName, index)" type="checkbox" v-model="favoriteServices[service.ServiceName]" class="check_box"><label for="toggle"></label>
                      </b-col>
                      &ensp;
                    </b-row>                    
                    <b-row class="ml-0 mt-1 at-bar" style="border-bottom: 1px solid green;">  
                      <p class="card-text">
                        {{service.ServiceDesc}}
                      </p>
                    </b-row>
                    <b-row class="ml-0 mt-1">  
                      <p class="card-text">
                       Subscribe: <code>{{service.InputMessageTopic}}</code>
                      </p>
                    </b-row>
                    <b-row class="ml-0">  
                      <p class="card-text">
                        Publish: <code>{{service.OutputMessageTopic}}</code>
                      </p>
                    </b-row>
                </b-card>
              </b-card-group>
            </div>
          </b-tab>
        </b-tabs>
      </b-card>
      <!-- 
      <b-row v-if="isSearchFromNodeRed == true">
        <div class="embed-responsive embed-responsive-16by9">
          <iframe id="nodered" class="embed-responsive-item" :src="nodeRedLink" allowfullscreen></iframe>
        </div>
      </b-row>
      <b-row v-if="isSearchFromNodeRed == false" class="mt-2">
        <div class="at-scroll">
          <b-card-group columns>
           <b-card v-for="(solution, index) in solutions" :key="solution.SolutionId"
              img-src="https://picsum.photos/600/300/?image=25"
              img-alt="Image"
              img-top
              @click = "showSolutionDetail(index)"
              tag="article"
              class="mb-2 at-card">
              <b-row>
                  <b-col align="start">
                  <b-badge variant="primary">{{solution.SolutionName}}</b-badge>
                </b-col>
                <b-col align="end">   
                  <b-dropdown variant="success" class="mx-1" right >
                    <b-dropdown-item @click.stop="deploySolution(solution)" >Deploy</b-dropdown-item>
                    <b-dropdown-item @click.stop="deleteSolution(index)" >Delete</b-dropdown-item>
                  </b-dropdown>
                </b-col>
              </b-row>
              <b-row class="ml-1 mt-2">  
                <p class="card-text">
                  {{solution.SolutionDesc}}
                </p>
              </b-row>
            </b-card>
          </b-card-group>
        </div>
      </b-row>
      -->
  </b-container> 
</template>

<script>
// import { API, Auth } from 'aws-amplify'
import { API } from 'aws-amplify'
import atHelper from '../aiot-helper'
import { eventBus } from '../main'
// import * as IoT from '../lib/aws-iot'
// import { API, PubSub } from 'aws-amplify'

// AWS Amplify API reference
// https://aws-amplify.github.io/amplify-js/media/api_guide.html

export default {
  name: 'mysolutions',
  props: [ 'queryString' ],
  data: function () {
    return {
      activeMenu: 'app',
      response: 'unknown',
      guess: 123,
      what: 0,
      loading: false,
      items: [ 'apple', 'monkey' ],
      iotClient: null,
      subs: [],
      testFlag: false,
      solutions: null,
      services: null,
      isSearchFromNodeRed: false,
      nodeRedLink: null,
      searchText: null,
      searchArea: null,
      loadedUserData: null,
      loadingUsers: {},
      select_options: {text: 'toggle'},
      favoriteServices: {},
      favoriteActiveSelected: '',
      isLoadingServices: false
    }
  },
  computed: {
    // solutions () {
    //   let solutionList = this.$store.getters.solutions
      // console.log('solutions: ', solutionList)
    //   return solutionList // this.items
    // },
  },
  watch: {
    favoriteServices: {
        handler: async function (updatedFavoriteList) {
          if (updatedFavoriteList === null || this.favoriteActiveSelected === '') {
            return
          }
          let favoriteStatusChanged = updatedFavoriteList[this.favoriteActiveSelected]
          const UserId = this.$store.getters.username
          const ServiceName = this.favoriteActiveSelected
          this.favoriteActiveSelected = ''
          if (typeof favoriteStatusChanged === 'undefined') {
            // DO NOTHING
          } else if (favoriteStatusChanged === true) {
            const body = { UserId, ServiceName }
            const result = await API.post('mserviceApi', '/favorites', { body })
            console.log('set favorite result: ', result)
            this.$store.commit('setFavoriteMservices', null)
          } else {
            const result = await API.del('mserviceApi', '/favorites', {
              'queryStringParameters': {
                'userId': UserId,
                'serviceName': ServiceName
              }
            })
            console.log(result)
            this.$store.commit('setFavoriteMservices', null)
          }
        },
        deep: true
    },
    solutions: function () {
      // this.testFlag = true
    },
    searchText: function (newText, oldText) {
      console.log('watch searchText')
      if ((typeof newText !== 'undefined' && newText !== null) ||
          (typeof newText !== 'undefined' && newText !== null)) {
          if ((typeof newText !== 'undefined' && newText !== null) &&
              (typeof newText !== 'undefined' && newText !== null)) {
            if (newText !== oldText) {
              this.searchFromNodeRed()
              this.refreshSolutions()
            }
          } else {
            this.searchFromNodeRed()
            this.refreshSolutions()
          }
      }
    }
  },
 async mounted () {
    console.log('solutions mounted')
    this.updateSearchSetting()
    eventBus.$on('pageRefresh', () => {
      console.log('refresh')
      // this.updateSearchSetting()
      // this.solutions = this.$store.getters.solutions
      this.refreshSolutions()
    })
    this.loadedUserData = this.$store.getters.atusers
      // await this.$store.commit('setAtusers', null)
    console.log('loadedUserData: ', this.loadedUserData)
    console.log('store: ', this.$store)
    if (typeof this.loadedUserData === 'undefined' || this.loadedUserData === null) {
      this.loadedUserData = {}
      this.$store.commit('setAtusers', this.loadedUserData)
    }
    this.favoriteServices = this.$store.getters.favoriteMserviceList
    if (this.favoriteServices === null) {
      this.favoriteServices = {}
    }
    if (this.services === null || this.services.length === 0) {
      await this.refreshSolutions()
    }
  },
  created () {
    console.log('solutions created')
    this.nodeRedLink = 'https://flows.nodered.org/?sort=downloads'
    this.solutions = this.$store.getters.solutions
    if (this.solutions === null) {
        this.solutions = []
    }
    this.services = this.$store.getters.sharedMservices
    if (this.services === null) {
        this.services = []
    }
    this.updateSearchSetting()
  },
  beforeDestroy () {
    // Unsubscribe client connected
    // Unsubscribe client disconnected
  },
  methods: {
    async reloadFavoriteServices () {
      await atHelper.reloadFavoriteServiceList()
      this.favoriteServices = this.$store.getters.favoriteMserviceList
      if (this.favoriteServices === null) {
        this.favoriteServices = {}
      }
      // console.log('favorites: ', this.favoriteServices)
      this.$forceUpdate()
    },
    toggleSelect (serviceName) {
      this.favoriteActiveSelected = serviceName
      // console.log('toggleSelect: ', this.favoriteServices[serviceName])
    },
    isFavorites (userId, serviceName) {
      if (this.loadedUserData !== null && (typeof this.loadedUserData[userId] !== 'undefined')) {
        return this.loadedUserData[userId].name
      } else if (typeof this.loadingUsers[userId] !== 'undefined') {
        return ''
      } else {
        this.loadingUsers[userId] = 'loading'
        this.loadUser(userId)
        return 'loading...'
      }
    },
    getUsername (userId) {
      if (this.loadedUserData !== null && (typeof this.loadedUserData[userId] !== 'undefined')) {
        return this.loadedUserData[userId].name
      } else if (typeof this.loadingUsers[userId] !== 'undefined') {
        return ''
      } else {
        this.loadingUsers[userId] = 'loading'
        this.loadUser(userId)
        return 'loading...'
      }
    },
    async loadUser (userId) {
      await atHelper.loadUser(userId)
      this.loadedUserData = this.$store.getters.atusers
      if (this.loadedUserData === null) {
        this.loadedUserData = {}
      }
      this.$forceUpdate()
    },
    async reloadSharedServices (searchText) {
      let username = this.$store.getters.username
      if (username === null) {
        username = ' '
      }
      this.isLoadingServices = true
      console.log('reloadServices: username: ', username, ' search: ', searchText)
      const result = await API.get('mserviceApi', '/mservices', {
          'queryStringParameters': {
               'userId': username,
               isShared: true,
               searchText: searchText
          }
      })
      // console.log(result)
      let resultJson = JSON.parse(result)
      this.$store.commit('setSharedMservices', resultJson)
      // atHelper.reloadServices()
      this.services = this.$store.getters.sharedMservices
      let usersToLoad = []
      for (let ms of this.services) {
        if (typeof this.loadedUserData[ms.UserId] === 'undefined') {
          if (usersToLoad.indexOf(ms.UserId) < 0) {
            usersToLoad.push(ms.UserId)
          }
        }
      }
      for (let userId of usersToLoad) {
        await this.loadUser(userId)
      }
      this.isLoadingServices = false
      this.$forceUpdate()
    },
    updateSearchSetting () {
      if (this.$store.getters.searchText === null || this.$store.getters.searchText === '') {
        this.searchText = this.$store.getters.searchKeywords
      } else {
        this.searchText = this.$store.getters.searchText
      }
      console.log('searchText: ', this.searchText)
    },
    searchFromNodeRed () {
      console.log('searchFromNodeRed')
      let flowsQueryText = encodeURIComponent(this.searchText)
      // let flowsResponse = await fetch('https://flows.nodered.org/api/v1/search?term=' + flowsQueryText + 'sort=downloads&per_page=30', { mode: 'no-cors' })
      // let flowsJson = await flowsResponse.json()
      this.nodeRedLink = 'https://flows.nodered.org/?sort=downloads&term=' + flowsQueryText

      this.isSearchFromNodeRed = !(this.isSearchFromNodeRed)
    },
    async refreshSolutions () {
      this.updateSearchSetting()
      await atHelper.reloadSolutions()
      await this.reloadSharedServices(this.searchText)
      await this.reloadFavoriteServices()
    },
    createSolution () {
      this.$router.push({ name: 'newsolution' })
    },
    showSolutionDetail (index) {
      this.$router.push({name: 'editSolution', params: { solutionIndex: index }})
    },
    deleteSolution (index) {
    },
    deploySolution (solution) {
    },
    showServiceDetail (index) {
      this.$router.push({name: 'editSharedService', params: { serviceIndex: index, serviceSource: this.services }})
    },
    copyService (index) {
      this.$router.push({name: 'copySharedService', params: { serviceIndex: index, copiedService: this.services[index] }})
    }
  }
}
</script>

<style>


.at-scroll {
  /* height : 500px ; */
  overflow-y: auto;
}

.at-card:hover {
  /* background-color: red;
   opacity: 0.5;
   */
  box-shadow : 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
  /* box-shadow: 1px -1px teal; */
}

div.at-bottombar {
  /* background-color : grey; */
  padding-bottom: 5px;
  margin-bottom: 5px;
  border-bottom: 1px solid grey
}

/*
 https://stackoverflow.com/questions/8626638/how-to-display-loading-message-when-an-iframe-is-loading
*/

.holds-the-iframe {
  background:url(../assets/loader.gif) center center no-repeat;
  /* spinner indicator effect */
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