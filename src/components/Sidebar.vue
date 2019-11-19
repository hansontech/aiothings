<template>
  <!-- <div class="container-fluid mt-4"> -->
  <div style="margin-left:5px; margin-top:5px">  
    <div >
    <!-- <p>{{$route.path}}</p> -->
    <b-button-group vertical class="at-sidebar-button" style="width:100%">
      <b-button size=" " :variant="reachRoute('mythings','')" @click="toMyThings()" :disabled="!isLoggedIn" >My IoT Devices</b-button>
      <b-button size=" " :variant="reachRoute('myapps')" @click="toMyApps()" :disabled="!isLoggedIn">My &#181;Services</b-button>
      <b-button size=" " :variant="reachRoute('myapis')" @click="toMyApis()" :disabled="!isLoggedIn">My REST APIs </b-button>
      <!-- &#160&#160&#160&#160&#160 -->
      <b-button size=" " :variant="reachRoute('myfavorites')" @click="toMyFavorites()" :disabled="!isLoggedIn">My Favorites</b-button>
      <!-- <b-button :variant="reachRoute('recommended')" @click="toRecommended()">Recommended</b-button> -->
      <b-button v-if="isBackButtonNeed" :variant="reachRoute('recommended')" @click="toQuit()">Quit</b-button>
    </b-button-group> 

    <b-button-group vertical class="at-sidebar-button" style="width:100%">
      <b-button size=" " v-b-popover.hover.bottom="'Shared microservices and Node-RED flows'" :variant="reachRoute('solutions')" @click="toSolutions()">Shared Solutions</b-button>
    </b-button-group>  

    <p></p>
    <b-button-group vertical class="at-sidebar-button" style="width:100%">
      <b-button size=" " v-b-popover.hover.bottom="'Console IO from/to services'" :variant="reachRoute('myconsole')" @click="toMyConsole()" :disabled="!isLoggedIn">My Console</b-button>
    </b-button-group> 
    <b-button-group vertical class="at-sidebar-button" style="width:100%">
      <b-button size=" " variant="info" v-b-popover.hover.bottom="'Download App configuration files'" @click="downloadConfig()">App Config</b-button>
    </b-button-group>
    <p></p>
    <b-button-group vertical class="at-sidebar-button" style="width:100%">
      <b-button size=" " :variant="reachRoute('docs')" @click="toDocs()">Docs</b-button>
    </b-button-group> 
    </div>
    <!-- 
    <b-button-group vertical>
      <b-button :pressed="activeMenu=='app'" @click="activeMenu='app', toMyApps()">My applications</b-button>
      <b-button :pressed="activeMenu=='user'" @click="activeMenu='user', toUser()">My applications</b-button>
      <b-button :pressed="activeMenu=='iot'" @click="activeMenu='iot', toMyThings()">My IoT devices</b-button>
      <b-button :pressed="activeMenu=='fav'" @click="activeMenu='fav', toMyFavorites()">My favorite solutions</b-button>
      <b-button :pressed="activeMenu=='rec'" @click="activeMenu='rec', toRecommended()">Recommendations</b-button>
    </b-button-group>  
    -->  
    <!--
      <b-form @submit.prevent="onSubmit">
        <b-form-group id="exampleInputGroup1"
                    label="Guess"
                    label-for="exampleInput1"
                    >
          <b-form-input id="exampleInput1"
                      type="number"
                      v-model="guess"
                      required
                      placeholder="Enter number">
          </b-form-input>
          <b-button type="submit" variant="primary">Submit</b-button>
        </b-form-group>
      </b-form>
    -->
  </div>
</template>

<script>
// import axios from 'axios'
import { API } from 'aws-amplify'
import { eventBus } from '../main'
// import { Auth } from 'aws-amplify'
// import jwt from 'jwt-decode'
// import FileSaver from 'file-saver'
import atHelper from '../aiot-helper'

export default {
  name: 'user',
  props: {
    menu: {
      type: String,
      required: true
    }
  },
  data: function () {
    return {
      activeMenu: 'app',
      response: 'unknown',
      guess: 123,
      what: 0,
      loading: false
    }
  },
  computed: {
    isLoggedIn () {
      let status = this.$store.getters.isAuthenticated
      return status
    },
    routeName () {
      return this.$route.path
    },
    isActiveMenu (order) {},
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
    isBackButtonNeed () {
      let { title } = this.$route.meta
      if (title && title === 'thing') {
        return true
      } else {
        return false
      }
    }
  },
  created () {
    /*
    var http = axios.create({
      baseURL: process.env.AUTH_TEST_API_ENDPOINT,
      headers: {
        Authorization: this.$store.getters.idToken
      }
    })

    http
      .post('/ping')
      .then(response => {
        this.response = response
      })
      .catch(err => {
        this.response = err
      })
    */
  },
  methods: {
    async downloadConfig () {
      await atHelper.downloadUrlToLocal('/static/aws-exports.js', 'aws-exports.js')
      await atHelper.downloadUrlToLocal('/static/awsconfiguration.json', 'awsconfiguration.json')
    },
    toQuit () {
      eventBus.$emit('pageBack')
    },
    reachRoute (matchRoute, defaultRoot) {
      let paths = this.$route.path.split('/')
      let currentRoute = ''
      if (paths[1] === 'user') {
        currentRoute = paths[2]
      } else {
        currentRoute = paths[1]
      }

      // console.log('currentRoute: ', currentRoute, ' : ', matchRoute, ' :path: ', this.$route.path)
      if ((defaultRoot === '' && (currentRoute === undefined || currentRoute === '')) || currentRoute === matchRoute) {
        return 'primary'
      }
      return 'warning'
    },
    async toMyApps () {
      /*
      console.log('to my IoT')
      const username = 'denniskung123'
      const body = { username }
      const result = await API.post('thingApi', '/things', { body })
      console.log('result: ', result)
      */
      this.$router.replace('/user/myapps')
    },
    async toMyApis () {
      this.$router.replace('/user/myapis')
    },
    toMyThings () {
      this.$router.replace('/user/mythings')
    },
    toMyFavorites () {
      this.$router.replace('/user/myfavorites')
    },
    toMyConsole () {
      this.$router.replace('/user/myconsole')
    },
    toRecommended () {
      this.$router.replace('/user/recommended')
    },
    toSolutions () {
      // this.$router.replace({name: 'solutions'})
      this.$router.replace('/solutions')
    },
    toDocs () {
      this.$router.push({name: 'docs'})
    },
    onSubmit () {
      this.makeGuess(this.guess)
    },
    async makeGuess (guessWhat) {
      const guess = guessWhat
      const body = { guess }
      this.what = 333
      // piResource
      const { result } = await API.post('apiResource', '/number', { body })
      // Guesses
      this.what = result

      /* Auth.currentCredentials()
      .then(credentials => {
        console.log('credentials: ', credentials)
      }) */

      /* Auth.currentAuthenticatedUser()
      .then(user => {
          Auth.currentSession().then(session => {
            console.log('session: ', session)
            let payload = session.idToken.payload
            console.log('username ', payload['cognito:username'])
          })
          console.log('confirmed user: ', user)
          // let accessToken = user.signInUserSession.accessToken
          // let idToken = user.signInUserSession.idToken
      }).catch(err => console.log('currentUserError: ', err)) */

      /* Auth.currentAuthenticatedUser()
        .then(user => Auth.userAttributes(user))
        .then(attributes => console.log('attr: ', attributes))
        .catch(err => console.log('attr error: ', err)) */
      // const { result } = apiGateway.testGuess(guess)
      /* apiGateway.testGuess(guess).then((reply) => {
        const { result } = reply
        console.log('after wait:', reply)
        this.what = result
      }) */

      /*
      Auth.currentSession().then(session => {
        console.log(JSON.stringify(session))
      }).catch(err => {
        console.log(err)
      })
      Auth.currentAuthenticatedUser().then(user => {
        console.log('USER: ' + JSON.stringify(user))
      })
      Auth.currentAuthenticatedUser()
      .then(user => console.log('user:', user))
      .catch(err => console.log('err:', err))
      */
    }
  }
}
</script>

<style>
/*
.at-sidebar b-link.router-link-exact-active {
    background-color : #2c8fbb;
    color : #ffff;
}
*/
/* ------
a.router-link-active {
  color: #f66;
} */
/*
li.router-link-active a {
  color: #f66;
}*/
/*
a.router-link-active {
  color: #f66;
}
*/
/*
nav a.router-link-active {
  color: #f66;
}

a.router-link-active {
  color: #f66;
}

b-nav-item a.router-link-active {
  color: #f66;
}

a.active-class {
  color: #f66;
}

b-button {
  color: #8064A2;
}

btn .btn-primary, .btn-primary:hover, .btn-primary:active, .btn-primary:visited {
    background-color: #8064A2 !important;
}
*/
.nav-pills.at-sidebar a.router-link-active {
   background-color : #2c8fbb;
   color : #ffff;
}

div.a {
    outline-color:black;
    outline-style: solid;
    background-color : red
}

.center {
  margin: auto;
  width: 50%;
  border: 3px solid green;
}

.at-sidebar-button button {
  margin-bottom : 5px;
  width: 80%
}


/*
.at-sidebar-button .btn:focus {
  outline: none;
}
*/


</style>