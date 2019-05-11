<template>
  <b-container> 
   <div style="min-height: 500px">
    <b-row align-v="center" class="mt-2 at-bottombar">
      <h4>Account Information</h4>
    </b-row>
    <b-row v-if="userHasPhoto" align-v="center" class="mt-2 mb-2 text-center">
      <b-col align="center">
        <img class="at-imageRound" v-if="userHasPhoto" v-bind:src="pictureUrl" height="100" width="100" />
      </b-col>
    </b-row>
    <h5>
    <b-row v-if="userHasPhoto" align-v="center" class="mt-2 at-bottombar">
    </b-row>
    <b-row align-v="center" class="mt-2 at-bottombar">
      <b-col> User name: </b-col>
      <b-col> {{userName}} </b-col>
    </b-row>
    <b-row align-v="center" class="mt-2 at-bottombar">
      <b-col> Email address: </b-col>
      <b-col> {{profile.email}} </b-col>  
    </b-row>
    <b-row align-v="center" class="mt-2 at-bottombar">
      <b-col> Registered through: </b-col>
      <b-col> {{registeredFrom}} </b-col>  
    </b-row>
    <b-row align-v="center" class="mt-2 at-bottombar">
      <b-col> Created since: </b-col>
      <b-col> <h6> {{createdDate}} </h6> </b-col> 
    </b-row>
    </h5>
    <!--
    <b-row align-v="center" class="mt-2 at-bottombar">
      {{profile}}
    </b-row>
    -->
   </div>
  </b-container>
</template>

<script>

// import axios from 'axios'
import atHelper from '../aiot-helper'

export default {
  name: 'home',
  data: function () {
    return {
      response: 'unknown',
      userData: {}
    }
  },
  computed: {
    createdDate () {
      if (this.userData.hasOwnProperty('UserCreateDate')) {
        return (new Date(this.userData.UserCreateDate)).toISOString()
      } else {
        return ' '
      }
    },
    userName () {
      if (this.profile.hasOwnProperty('name')) {
        return this.profile.name
      } else {
        return this.profile['cognito:username']
      }
    },
    registeredFrom () {
      if (this.profile.hasOwnProperty('identities')) {
        return this.profile.identities[0].providerName
      } else {
        return 'email'
      }
    },
    accessToken () {
      return this.$store.getters.accessToken
    },
    idToken () {
      return this.$store.getters.idToken
    },
    profile () {
      return this.$store.getters.profile
    },
    firstname () {
      return this.$store.getters.profile.name.split(' ')[0]
    },
    userHasPhoto () {
      try {
        let photo = this.$store.getters.profile.picture
        if (photo != null) {
          return true
        } else {
          return false
        }
      } catch (e) {
        return false
      }
    },
    pictureUrl () {
      try {
        // facebook profile case
        let picJson = JSON.parse(this.$store.getters.profile.picture)
        // console.log('url: ', picJson.data.url)
        return picJson.data.url
      } catch (e) {
        // google profile case
        let pictureUrl = this.$store.getters.profile.picture
        return pictureUrl
      }
    }
  },
  async created () {
    /*
    var http = axios.create({
      baseURL: process.env.AUTH_TEST_API_ENDPOINT,
      headers: {
        Authorization: this.$store.getters.idToken
      }
    })
    http.post('/ping')
      .then(response => {
        this.response = response
      })
      .catch(err => {
        this.response = err
      })
    */
    this.userData = await atHelper.loadUser(this.profile['cognito:username'])
  }
}
</script>

<style>
div.at-bottombar {
  border-bottom: 1px solid grey
}
</style>