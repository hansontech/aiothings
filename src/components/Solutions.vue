<template>
  <div> 
    <b-row align-v="center" class="mt-1 at-bottombar">
        <b-col align="start">
          <h4 v-b-popover.hover.bottom="'Use Search to query microservices'">Shared Solutions &ensp;<small><i class="fas fa-info-circle"></i></small></h4>
        </b-col>
        <b-col align="end">
          <b-button variant="info" @click="refreshSolutions()">Refresh</b-button>
          <!-- <b-button align="end" variant="info" @click="createSolution()" >Add new solution</b-button> -->
        </b-col>
    </b-row>
    <b-row>
      <b-col>
        <b-card no-body>
          <b-tabs card>
            <b-tab title="Node-RED Flows">
              <!--
              <div class="holds-the-iframe embed-responsive embed-responsive-16by9">
                <iframe id="nodered" class="embed-responsive-item" :src="nodeRedLink" allowfullscreen></iframe>
              </div>
              -->
              <div>
                <iframe style="width:100%; height:600px;" id="nodered" :src="nodeRedLink" allowfullscreen></iframe>
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
                <p>No shared micoservice is found.</p>
              </div>
              <div class="at-scroll">
                <b-card-group columns>
                  <b-card v-for="(service, index) in services" :key="service.ServiceName"
                      header = " "
                      class="at-card-mservice">
                      <b-row align-v="center">
                        <!-- for unexplainable reason, need set cols to 9 -->
                        <b-col lg="9">
                          <h5 class="card-text">
                            {{service.ServiceName}}
                          </h5>
                        </b-col>
                        <b-col lg="3" align="end">   
                        <b-dropdown variant="secondary" class="mx-0" right >
                            <!-- VUE reference: https://vuejs.org/v2/guide/events.html -->
                            <b-dropdown-item @click = "showServiceDetail(index)" >Edit</b-dropdown-item>
                            <b-dropdown-item @click = "copyService(index)" >Copy</b-dropdown-item>
                          </b-dropdown>
                        </b-col>
                      </b-row>
                      <b-row class="mt-2" >
                        <b-col lg="10">
                          <b-button size="sm" variant="light"  @click="loadUser(service.UserId)"><em>{{getUsername(service.UserId)}}</em></b-button>
                        </b-col>
                        <b-col lg="2" align="end" v-if="$store.getters.isAuthenticated"> 
                            <input i  d="toggle" v-b-popover.hover.bottom="'Set as favorite'"  @click="toggleSelect(service.ServiceName, index)" type="checkbox" v-model="favoriteServices[service.ServiceName]" class="check_box"><label for="toggle"></label>
                        </b-col>
                      </b-row>
                      <b-row class="ml-0 mt-1">
                        <b-col class="at-border at-desc-display">
                          <vue-markdown>{{service.ServiceDesc}}</vue-markdown>
                        </b-col>
                      </b-row>
                      <b-row v-if="service.InputMessageTopic !== 'null'" class="ml-0 mt-1">  
                        <p class="card-text">
                        <i class="fas fa-arrow-alt-circle-right"></i> <code>{{service.InputMessageTopic}}</code>
                        </p>
                      </b-row>
                      <b-row v-if="service.OutputMessageTopic !== 'null'" class="ml-0">  
                        <p class="card-text">
                          <i class="fas fa-arrow-alt-circle-left"></i> <code>{{service.OutputMessageTopic}}</code>
                        </p>
                      </b-row>
                  </b-card>
                </b-card-group>
              </div>
            </b-tab>
          </b-tabs>
        </b-card>
      </b-col>
    </b-row>
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
  </div> 
</template>

<script>
// import { API, Auth } from 'aws-amplify'
import { API } from 'aws-amplify'
import atHelper from '../aiot-helper'
import { eventBus } from '../main'
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
          const UserId = this.$store.getters.userId
          // console.log('userId: ', UserId)
          if (UserId === null || updatedFavoriteList === null || this.favoriteActiveSelected === '') {
            return
          }
          let favoriteStatusChanged = updatedFavoriteList[this.favoriteActiveSelected]
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
    searchText: {
      handler: function (newText, oldText) {
        console.log('watch searchText: ', newText, oldText)
        if (newText !== oldText) {
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
      if (this.searchText !== this.$store.getters.searchText) {
        this.searchText = this.$store.getters.searchText
      }
    })
    this.loadedUserData = this.$store.getters.atusers
      // await this.$store.commit('setAtusers', null)
    // console.log('loadedUserData: ', this.loadedUserData)
    // console.log('store: ', this.$store)
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
    // console.log('solutions created')
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
    truncatedString (str, len) {
      return atHelper.truncatedString(str, len)
    },
    async reloadFavoriteServices () {
      let userId = this.$store.getters.userId
      if (userId === null) {
        return
      }
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
      let username = this.$store.getters.userId
      if (username === null) {
        username = ' '
      }
      this.isLoadingServices = true
      // console.log('reloadServices: username: ', username, ' search: ', searchText)
      const result = await API.get('mserviceApi', '/mservices', {
          'queryStringParameters': {
               'userId': username,
               isShared: true,
               searchText: searchText
          }
      })
      // console.log(result)
      // let resultJson = JSON.parse(result)
      let resultJson = result
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
      // console.log('updateSearchSetting')
      if ((this.$store.getters.searchText === null || this.$store.getters.searchText === '') && (typeof this.$store.getters.searchKeywords !== 'undefined')) {
        this.searchText = this.$store.getters.searchKeywords
      } else {
        this.searchText = this.$store.getters.searchText
      }
      // console.log('update searchText: ', this.searchText)
    },
    searchFromNodeRed () {
      // console.log('searchFromNodeRed')
      let flowsQueryText = encodeURIComponent(this.searchText)
      // let flowsResponse = await fetch('https://flows.nodered.org/api/v1/search?term=' + flowsQueryText + 'sort=downloads&per_page=30', { mode: 'no-cors' })
      // let flowsJson = await flowsResponse.json()
      // https://flows.nodered.org/search?term=ifttt&type=node&type=flow&type=collection&sort=downloads
      this.nodeRedLink = 'https://flows.nodered.org/search?term=' + flowsQueryText + '&type=node&type=flow&type=collection&sort=downloads'

      this.isSearchFromNodeRed = !(this.isSearchFromNodeRed)
    },
    async refreshSolutions () {
      this.updateSearchSetting()
      // await atHelper.reloadSolutions()
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

/*
 https://stackoverflow.com/questions/8626638/how-to-display-loading-message-when-an-iframe-is-loading
*/

.holds-the-iframe {
  background:url(../assets/loader.gif) center center no-repeat;
  /* spinner indicator effect */
 }


</style>