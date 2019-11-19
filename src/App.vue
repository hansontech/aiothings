<template>
  <div id="app2" >
    <!-- for fixed-top  https://mdbootstrap.com/docs/vue/utilities/position/ --> 
    <b-navbar toggleable="md" type="dark" variant="dark" class="fixed-top">
      <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>
      <b-navbar-brand to="/">
        <img src="./assets/aiothings-logo-wb.png" height="40" alt="AIoThings">
      </b-navbar-brand>
      <b-collapse is-nav id="nav_collapse">
        <!-- Right aligned nav items -->
        <b-navbar-nav> <!-- v-if="isAuthenticated" -->
          <b-nav-text>&ensp;Solutions&ensp;</b-nav-text>
          <b-nav-form>
            <b-form-input v-model="searchText" type="text" placeholder="Search keywords.."/>
          </b-nav-form>
          &ensp;
          <b-nav-form>
            <b-button type="button" v-b-popover.hover.bottomleft="'Search from the shared resources'" @click="searchSolutions()">Search</b-button>
          </b-nav-form>
        </b-navbar-nav>
        <b-navbar-nav class="ml-auto">
          <b-nav-item center @click="gotoShop()"><i class="fas fa-cube"></i>&ensp;Shop</b-nav-item>
        </b-navbar-nav>
        <b-navbar-nav class="ml-auto">
          <b-nav-item @click="gotoDocuments()"><i class="fas fa-info"></i>&ensp;Docs</b-nav-item>
          &ensp;
          <b-nav-item v-if="!isAuthenticated" @click="authenticate()">Log in / Sign up</b-nav-item>
          <b-nav-item-dropdown right v-if="isAuthenticated">
            <!-- Using button-content slot -->
            <template slot="button-content">
              <img class="at-imageRound" v-if="userHasPhoto" v-bind:src="pictureUrl" height="25" width="25" />
              <em>{{userName}}</em>
            </template>
            <b-dropdown-item @click="gotoUserProfile()">Profile</b-dropdown-item>
            <b-dropdown-item @click="gotoUserPage()">User Home</b-dropdown-item>
            <b-dropdown-item @click="signout()">Sign Out</b-dropdown-item>
          </b-nav-item-dropdown>

        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
    <!-- routes will be rendered here -->
    <div class="mt-3">
      <!-- must reserve more space for header, TODO -->
      <pre style="background-color: white; border: 0px; padding: 0px;"> 
      </pre>
      <!-- <router-view></router-view>  -->
    </div>
    <!-- <at-footer v-if="isDocumentPath" class="modal__footer"/> -->
 </div> 
</template>

<script>

import { eventBus } from './main'
import { Auth, API } from 'aws-amplify'
import atHelper from './aiot-helper'

export default {
  name: 'app',
  data () {
    return {
      isVisible: false,
      isUserLoggedIn: false,
      currentLang: 'English',
      languages: {'EN': 'English', 'CN': '中文', 'JP': '日本語', 'KR': '한국어'},
      activeUser: null,
      selected: '',
      searchText: null,
      searchKeywordsMap: {'x': 1},
      options: [
        { value: null, text: 'Solutions by category' },
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
      this.$store.commit('setSearchKeywords', keyword)
    },
    searchText: function (newValue, oldValue) {
      this.$store.commit('setSearchText', this.searchText)
    }
  },
  created () {
    for (let i in this.options) {
      this.searchKeywordsMap[this.options[i].value] = this.options[i].keyword
    }
  },
  mounted () {
    console.log('App.vue mounted')
    this.selected = this.$store.getters.searchArea
    this.searchText = this.$store.getters.searchText

    eventBus.$on('login', () => {
      this.isUserLoggedIn = true
    })
  },
  computed: {
    isDocumentPath: function () {
      let paths = this.$route.path.split('/')
      if (paths[1] === 'docs') {
        return false
      }
      return true
    },
    isAuthenticated: function () {
      return this.$store.getters.isAuthenticated
    },
    profile () {
      return this.$store.getters.profile
    },
    userName () {
      try {
        let fullname = this.$store.getters.profile.name
        if (fullname != null) {
          return fullname.split(' ')[0]
        }
        // cognito username is uniquely assigned even for federated logins
        let username = this.$store.getters.profile['cognito:username']
        return username
      } catch (e) {
        return ' '
      }
    },
    userHasPhoto () {
      return atHelper.userHasPhoto()
    },
    pictureUrl () {
      try {
        // facebook profile case
        let picJson = JSON.parse(this.$store.getters.profile.picture)
        return picJson.data.url
      } catch (e) {
        // google profile case
        let pictureUrl = this.$store.getters.profile.picture
        return pictureUrl
      }
    }
  },
  methods: {
    async searchSolutions () {
      let solutionCategory = this.selected
      if (solutionCategory === null) {
        solutionCategory = ''
      }
      let queryResult = await API.get('solutionApi', '/solutions', {
          'queryStringParameters': {
            SolutionCategory: solutionCategory,
            SearchText: this.searchText
          }
      })
      this.$store.commit('setQueriedSolutions', queryResult)
      this.$router.push({name: 'queriedSolutions'})
      eventBus.$emit('pageRefresh')
    },
    goSolutions () {
      this.$router.push({name: 'queriedSolutions'})
      eventBus.$emit('pageRefresh')
    },
    changeLanguage (newLang) {
      let e = document.getElementById('langDropDown')
      console.log('e: ', e)
      this.currentLang = this.languages[newLang]
    },
    gotoDocuments () {
      console.log('gotoDocuments')
      this.$router.push('/docs/main') // {name: 'docs'})
    },
    gotoShop () {
      this.$router.push('/shop') // {name: 'docs'})
    },
    gotoUserProfile () {
      console.log('gotoUserProfile')
      this.$router.push({name: 'profile'})
    },
    gotoUserPage () {
      console.log('gotoUserPage')
      this.$router.push({name: 'mythings'})
    },
    authenticate () { // Sign In / Sign Up using Hosted UI
      console.log('sign in/up')
      // obsoleted since 2019/10/20, auth.authenticate()
      // To make sure aws-sdk and aws-amplify in node mosules consistent
      // Check by command 'npm list |grep aws'
      Auth.federatedSignIn() // command to show Hosted UI
    },
    signout () {
      Auth.signOut()
      .then(data => {
        console.log('signed out: ')
        this.$store.dispatch('signout').then(() => {
          this.$router.push({ name: 'home' })
        })
      })
      .catch(err => console.log(err))
    },
    login: function () {
      console.log('login')
    },
    logout: function () {
    },
    register: function () {
      console.log('Sign up')
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

:root {
    --color-thing: lightblue;
    --color-mservice: gainsboro;
    --color-api: MediumAquamarine;
    --color-at-card-header: var(--color-thing, rgb(199, 174, 174));
    --height-at-card-header: 30px;
    --height-at-dynamic: 10px;
    --color-at-dynamic: red;
}

.at-border {
  border: 1px solid #a78;
  padding: 5px;
}

.at-card-thing {
  --color-at-card-header: var(--color-thing);
}
.at-card-mservice {
  --color-at-card-header: var(--color-mservice);
}
.at-card-api {
  --color-at-card-header: var(--color-api);
}

.at-card-thing .card-header {   /* multiple classes together */
    background-color: var(--color-at-card-header);
    height: var(--height-at-card-header);
    padding: 0px 0px;
    margin-bottom: 0; 
}

.at-card-mservice .card-header {   /* multiple classes together */
    background-color: var(--color-at-card-header);
    height: var(--height-at-card-header);
}

.at-card-api .card-header {   /* multiple classes together */
    background-color: var(--color-at-card-header);
    height: var(--height-at-card-header);    
}

.at-card-thing-dynamic .card-header {   /* multiple classes together */
    background-color: var(--color-at-dynamic);
    height: var(--height-at-dynamic);    
}

.at-card:hover {
  /* background-color: red;
     opacity: 0.5;
  */
  box-shadow : 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
  /* box-shadow: 1px -1px teal; */
}
</style>
