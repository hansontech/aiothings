<template>
   <div>
    <b-row align-v="center" class="at-bottombar">
      <b-col align="start">
        <h4>Favorites <small>({{favoriteServices.length}})</small></h4>
      </b-col>
      <b-col sm="auto" align="end">
        <b-button variant="info" @click="reloadFavoriteServices()"><i class="fas fa-sync-alt" /></b-button>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <b-card no-body>
          <b-tabs card>
            <b-tab title="Favorite Microservices" active>
              <div v-if="isLoading" class="mb-2">
                <b-row>
                  <b-col align="center">
                    <spinner  size="medium" />
                  </b-col>
                </b-row>
              </div>
              <div class="text-center" v-if="favoriteServices.length === 0">
                No favorites selected.
              </div>
              <div class="at-scroll">
                <b-card-group columns>
                  <b-card v-for="(service, index) in favoriteServices" :key="service.ServiceName"
                      header = " "
                      class="at-card-mservice">
                      <b-row align-v="center">
                        <b-col lg="9">
                          <h5>
                            {{service.ServiceName}}
                          </h5>
                        </b-col>
                        <b-col lg="3" align="end">   
                          <b-dropdown variant="secondary" class="mx-0" right >
                            <!-- VUE reference: https://vuejs.org/v2/guide/events.html -->
                            <b-dropdown-item @click.stop="deleteFavorite(index)" >Unfavourite</b-dropdown-item>
                            <b-dropdown-item @click = "showServiceDetail(index)" >Edit</b-dropdown-item>
                            <b-dropdown-item @click = "copyService(index)" >Copy</b-dropdown-item>
                          </b-dropdown>
                        </b-col>
                      </b-row>
                      <b-row class="mt-2">
                        <b-col sm="10">
                          <b-button size="sm" variant="light" @click="loadUser(service.UserId)"><em>{{getUsername(service.UserId)}}</em></b-button>
                        </b-col>
                      </b-row>
                      <b-row class="ml-0 mt-1">
                        <b-col class="at-border at-desc-display">
                          <markdown-it-vue :content="service.ServiceDesc" />
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
  </div> 
</template>

<script>

import atHelper from '../aiot-helper'

export default {
  name: 'myfavorites',
  data: function () {
    return {
      loadedUserData: null,
      loadingUsers: {},
      select_options: {text: 'toggle'},
      favoriteServices: {},
      isLoading: false
    }
  },
  computed: {
  },
  watch: {
    favoriteServices: {
        handler: function () {
          this.$forceUpdate()
        },
        deep: true
    }
  },
  mounted () {
    // console.log('favorites mounted')
    this.favoriteServices = this.$store.getters.favoriteMservices
    if (this.favoriteServices === null || this.favoriteServices.length === 0) {
      this.favoriteServices = {}
      this.reloadFavoriteServices()
    }
    this.loadedUserData = this.$store.getters.atusers
    if (this.loadedUserData === null) {
      this.loadedUserData = {}
    }
  },
  created () {
    // console.log('favorites created')
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
      this.isLoading = true
      await atHelper.reloadFavoriteServices()
      this.isLoading = false
      this.favoriteServices = this.$store.getters.favoriteMservices
      if (this.favoriteServices === null) {
        this.favoriteServices = {}
      }
      console.log('favorites: ', this.favoriteServices)
      this.$forceUpdate()
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
      this.$forceUpdate()
    },
    createFavorite () {
      this.$router.push({ name: 'newsolution' })
    },
    async deleteFavorite (index) {
      let serviceName = this.favoriteServices[index].ServiceName
      await atHelper.deleteFavorite(serviceName)
      this.favoriteServices = this.$store.getters.favoriteMservices
      if (this.favoriteServices === null) {
        this.favoriteServices = {}
      }
    },
    deployFavorite (solution) {
    },
    showServiceDetail (index) {
      this.$router.push({name: 'editService', params: { serviceIndex: index, serviceSource: this.favoriteServices }})
    },
    copyService (index) {
      this.$router.push({name: 'newService', params: { serviceIndex: index, copiedService: this.favoriteServices[index] }})
    }
  }
}
</script>

<style>

</style>
