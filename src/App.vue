<template>
  <div id="app">
    <!--
    <header>
      <span>Vue.js PWA</span>
    </header>
    <main>
      <img src="./assets/logo.png" alt="Vue.js PWA">
      <router-view></router-view>
    </main>
    -->
    <b-navbar toggleable="md" type="dark" variant="dark">
      <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>
      <b-navbar-brand to="/">AIoThings</b-navbar-brand>
      <b-collapse is-nav id="nav_collapse">
        <!-- Right aligned nav items -->
        <b-navbar-nav v-if="isAuthenticated">
          <b-nav-form>
              <b-form-select id="solutionQuery"
                v-model="selected"
                :options="options">
              </b-form-select>
          </b-nav-form>
          <b-nav-form>
            <b-form-input v-model="searchText" type="text" placeholder="Or search for solutions?"/>
          </b-nav-form>
          <b-nav-form>
            <b-button type="button" @click="searchSolutions()">Search</b-button>
          </b-nav-form>
        </b-navbar-nav>
        <b-navbar-nav class="ml-auto">
          <b-nav-item-dropdown id="langDropDown" :text="currentLang" right>
            <b-dropdown-item href="#" @click="changeLanguage('EN')">{{languages['EN']}}</b-dropdown-item>
            <b-dropdown-item href="#" @click="changeLanguage('CN')">{{languages['CN']}}</b-dropdown-item>
            <b-dropdown-item href="#" @click="changeLanguage('JP')">{{languages['JP']}}</b-dropdown-item>
            <b-dropdown-item href="#" @click="changeLanguage('KR')">{{languages['KR']}}</b-dropdown-item>
          </b-nav-item-dropdown>
          <b-nav-item v-if="!isAuthenticated" @click="authenticate()">Log in / Sign up</b-nav-item>
          <!--
          <b-nav-item v-if="isAuthenticated" @click="signout()">Log out</b-nav-item>
          <b-nav-item to="/user-login/login" v-if="!isUserLoggedIn">Log in / Sign up</b-nav-item>
          <b-nav-item href="#" @click.prevent="logout" v-else>Log out</b-nav-item>
          -->
          <b-nav-item-dropdown right v-if="isAuthenticated">
            <!-- Using button-content slot -->
            <template slot="button-content">
              <img class="at-imageRound" v-if="userHasPhoto" v-bind:src="pictureUrl" height="25" width="25" />
              <em>{{userName}}</em>
            </template>
            <b-dropdown-item href="#">Profile</b-dropdown-item>
            <b-dropdown-item @click="gotoUserPage()">User page</b-dropdown-item>
            <b-dropdown-item @click="signout()">Sign out</b-dropdown-item>
          </b-nav-item-dropdown>

        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
    <!-- routes will be rendered here -->
    <router-view />
  </div>
</template>

<script>

import { eventBus } from './main'
import auth from './services/auth'
import { Auth, API } from 'aws-amplify'

// Helpers
/* import {
  loadFbSdk,
  getFbLoginStatus,
  getFbUserData,
  fbLogout
} from './helpers/facebook-helpers.js' */

export default {
  name: 'app',
  data () {
    return {
      fbData: {
        facebookAppId: '265383824068284',
        facebookVersion: 'v3.1',
        personalID: null,
        email: null,
        name: null
      },
      isUserLoggedIn: false,
      currentLang: 'English',
      languages: {'EN': 'English', 'CN': '中文', 'JP': '日本語', 'KR': '한국어'},
      activeUser: null,
      selected: null,
      searchText: null,
      searchKeywordsMap: {'x': 1},
      options: [
        { value: null, text: 'Select from solutions' },
        { value: null, text: '━━━━━━━━━━━', disabled: true },
        { value: 'video', text: 'Video Processing' },
        { value: 'security', text: 'Security', keyword: 'security' },
        { value: 'retail', text: 'Retail and Hospitality', keyword: 'retail shop' },
        { value: 'agriculture', text: 'Precision Agriculture', keyword: 'agriculture' },
        { value: 'industry', text: 'Industrial Maintenance', keyword: 'industry' },
        { value: 'home', text: 'Home Automation', keyword: 'home automation' },
        { value: null, text: '━━━━━━━━━━━', disabled: true },
        { value: 'video_image_detect', text: 'Detect from Image', keyword: 'image recognition' },
        { value: 'video_detect', text: 'Detect from Video', keyword: 'video recognition' },
        { value: 'speech_tts', text: 'Text to Speech', keyword: 'text to speech' },
        { value: 'speech_stt', text: 'Audio to Text', keyword: 'speech to text' },
        { value: 'machine_learnig', text: 'Machine Learning', keyword: 'machine learning' },
        { value: 'modbus', text: 'Modbus', keyword: 'modbus' },
        { value: 'bacnet', text: 'BACnet', keyword: 'backnet' }
        // add horitontal line, patterns, between options
        // https://stackoverflow.com/questions/4317025/how-do-i-add-a-horizontal-line-in-a-html-select-control
      ]
    }
  },
  watch: {
    selected: function (newValue, oldValue) {
      this.$store.commit('setSearchArea', this.selected)
      let keyword = this.searchKeywordsMap[this.selected]
      console.log('keyword: ', keyword)
      this.$store.commit('setSearchKeywords', keyword)
    },
    searchText: function (newValue, oldValue) {
      this.$store.commit('setSearchText', this.searchText)
    }
  },
  created () {
    console.log('App.vue created')
    // console.log('profile: ', this.profile)
    for (let i in this.options) {
      this.searchKeywordsMap[this.options[i].value] = this.options[i].keyword
    }
    console.log('map: ', this.searchKeywordsMap)
  },
  mounted () {
    console.log('App.vue mounted')
    this.selected = this.$store.getters.searchArea
    this.searchText = this.$store.getters.searchText
    /* loadFbSdk(this.fbData.facebookAppId, this.fbData.facebookVersion)
      .then(response => {
        console.log('fb loadFbSdk completed')
        getFbLoginStatus().then(response => {
          console.log(response)
          let loginStatus = response.status
          console.log(loginStatus)
          if (loginStatus === 'connected') {
            getFbUserData().then(userInformation => {
              this.fbData.personalID = userInformation.id
              this.fbData.email = userInformation.email
              this.fbData.name = userInformation.name
              this.isUserLoggedIn = true
              console.log(this.fbData.name)
            })
          }
        })
      })
      .catch(function (err) {
        console.log(err)
      }) */

    eventBus.$on('login', () => {
      this.isUserLoggedIn = true
    })
  },
  computed: {
    isAuthenticated: function () {
      return this.$store.getters.isAuthenticated
    },
    profile () {
      return this.$store.getters.profile
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
    userName () {
      try {
        let fullname = this.$store.getters.profile.name
        if (fullname != null) {
          return fullname.split(' ')[0]
        }
        let username = this.$store.getters.profile['cognito:username']
        // username = this.$store.getters.profile
        // console.log('username: ', username)

        return username
      } catch (e) {
        return ' '
      }
    },
    pictureUrl () {
      let picJson = JSON.parse(this.$store.getters.profile.picture)
      // console.log('url: ', picJson.data.url)
      return picJson.data.url
    }
  },
  methods: {
    async searchSolutions () {
      /*
      let result = await API.get('solutionApi', '/solutions', {
          'queryStringParameters': {
            SolutionId: 'smart-greenhouse-iot'
          }
      })
      console.log('seach result: ', result)
      */
      let queryResult = await API.get('solutionApi', '/solutions', {
          'queryStringParameters': {
            SolutionCategory: this.selected,
            SearchText: this.searchText
          }
      })
      console.log('seach result: ', queryResult)
      // if (queryResult.length > 0) {
      this.$store.commit('setQueriedSolutions', queryResult)
      console.log('searchText : ', this.searchText)
      this.$router.push({name: 'queriedSolutions'})
      eventBus.$emit('pageRefresh')
      //, params: { queryString: this.searchText }
      // }
    },
    changeLanguage (newLang) {
      let e = document.getElementById('langDropDown')
      console.log('e: ', e)
      this.currentLang = this.languages[newLang]
    },
    gotoUserPage () {
      console.log('gotoUserPage')
      this.$router.push({name: 'mythings'})
    },
    authenticate () {
      auth.authenticate()
    },
    signout () {
      const currentUser = Auth.userPool.getCurrentUser()
      if (currentUser != null) {
          currentUser.signOut()
      }
      this.$store.dispatch('signout').then(() => {
        this.$router.push({ name: 'home' })
      })
    },
    login: function () {
      console.log('login')
      /*
      this.$auth.login({ email, password }).then(function () {
        // Execute application logic after successful login
      })
      */
    },
    logout: function () {
      /* fbLogout().then(response => {
        console.log(response)
        this.isUserLoggedIn = false
      }).catch(function (err) {
        console.log(err)
      }) */
    },
    register: function () {
      console.log('Sign up')
      /*
      this.$auth.register({ name, email, password }).then(function () {
        // Execute application logic after successful registration
      })
      */
    },
    getFbUserData () {
      window.FB.api('/me', 'GET', { fields: 'id,name,email' },
        userInformation => {
          this.fbData.personalID = userInformation.id
          this.fbData.email = userInformation.email
          this.fbData.name = userInformation.name
          console.log(this.fbData.name)
        }
      )
    }
  }
}
</script>

<style>
body {
  margin: 0;
}

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

main {
  text-align: center;
  margin-top: 40px;
}

header {
  margin: 0;
  height: 56px;
  padding: 0 16px 0 24px;
  background-color: #35495E;
  color: #ffffff;
}

header span {
  display: block;
  position: relative;
  font-size: 20px;
  line-height: 1;
  letter-spacing: .02em;
  font-weight: 400;
  box-sizing: border-box;
  padding-top: 16px;
}

img.at-imageRound {
    border-radius: 50%;
}
/*
div {
    outline-color:cornflowerblue
}
*/
</style>
