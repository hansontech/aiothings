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
            <b-form-input type="text" placeholder="Or search for solutions?"/>
            <b-button type="submit">Search</b-button>
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
              <img v-if="userHasPhoto" v-bind:src="pictureUrl" height="25" width="25" />
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
import { Auth } from 'aws-amplify'

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
      options: [
        { value: null, text: 'Select solution' },
        { value: 'a', text: 'First option' },
        { value: 'b', text: 'Second option' },
        { value: {'C': '3PO'}, text: 'With object value' },
        { value: 'd', text: 'Disabled', disabled: true }
      ]
    }
  },
  created () {
    console.log('App.vue created')
  },
  mounted () {
    console.log('App.vue mounted')

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

img {
    border-radius: 50%;
}
/*
div {
    outline-color:cornflowerblue
}
*/
</style>
