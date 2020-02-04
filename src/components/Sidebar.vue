<template>
  <!-- <div class="container-fluid mt-4"> -->
  <div style="margin-left:0px; margin-top:5px">  
    <div id="normalSizeScreen">
      <!-- <p>{{$route.path}}</p> -->
      <b-button-group vertical class="at-sidebar-button" style="width:100%">
        <!-- :disabled="!isLoggedIn" -->
        <b-button size=" " :variant="reachRoute('mythings','')" @click="toMyThings()">IoT Devices</b-button>
        <b-button size=" " :variant="reachRoute('mymicroservices')" @click="toMyMicroservices()">Microservices</b-button> <!-- My &#181;Services -->
        <b-button size=" " :variant="reachRoute('myapis')" @click="toMyApis()">REST APIs </b-button>
        <b-button size=" " :variant="reachRoute('myapplications')" @click="toMyApps()">Applications </b-button>
        <!-- &#160&#160&#160&#160&#160 -->
        <b-button size=" " :variant="reachRoute('myfavorites')" v-b-popover.hover.bottom="'Shared services marked favorite'" @click="toMyFavorites()">Favorites</b-button>
        <!-- <b-button :variant="reachRoute('recommended')" @click="toRecommended()">Recommended</b-button> -->
        <b-button v-if="isBackButtonNeed" :variant="reachRoute('recommended')" @click="toQuit()">Quit</b-button>
      </b-button-group> 

      <b-button-group vertical class="at-sidebar-button" style="width:100%">
        <b-button size=" " v-b-popover.hover.bottom="'Shared microservices and Node-RED flows'" :variant="reachRoute('solutions')" @click="toSolutions()">Shared Solutions</b-button>
      </b-button-group>  

      <p></p>
      <b-button-group vertical class="at-sidebar-button" style="width:100%">
        <b-button size=" " :variant="reachRoute('mydashboard')" @click="toMyDashboard()">Dashboard</b-button>
        <b-button size=" " v-b-popover.hover.bottom="'Console input output for test'" :variant="reachRoute('myconsole')" @click="toMyConsole()">Test Console</b-button>
      </b-button-group> 
      <!-- Depreciated, not recommended anymore 2019/12/22 -->
      <b-button-group vertical class="at-sidebar-button" style="width:100%">
        <b-button size=" " variant="info" v-b-popover.hover.bottom="'Download App configuration files'" v-b-modal.modalDownloadConfigConfirm>Configuration</b-button>
      </b-button-group>
      <b-modal id="modalDownloadConfigConfirm"
            hide-header 
            size="sm"
            @ok="downloadConfig()"
            >
        <div class="text-center">
          <h6>Download AIoThings configuration files for web and mobile software development?</h6>
        </div>                  
      </b-modal>
      <p></p>
      <b-button-group vertical class="at-sidebar-button" style="width:100%">
        <b-button size=" " :variant="reachRoute('docs')" @click="toDocs()">Docs</b-button>
      </b-button-group> 
    </div>
    <!--
    <div id="smallSizeScreen">
      <b-row>
        <b-col>
          <b-dropdown text="Functions" variant="secondary" class="m-2" style="width:100%;">
            <b-dropdown-item size=" " :active="reachRoute('mythings','') === 'primary'" @click="toMyThings()">IoT Devices</b-dropdown-item>
            <b-dropdown-item size=" " :active="reachRoute('mymicroservices') === 'primary'" @click="toMyMicroservices()">Microservices</b-dropdown-item>
            <b-dropdown-item size=" " :active="reachRoute('myapis') === 'primary'" @click="toMyApis()">REST APIs </b-dropdown-item>
            <b-dropdown-item size=" " :active="reachRoute('myapplications') === 'primary'" @click="toMyApps()">Applications </b-dropdown-item>
            <b-dropdown-item size=" " :active="reachRoute('myfavorites') === 'primary'" v-b-popover.hover.bottom="'Shared services marked favorite'" @click="toMyFavorites()">Favorites</b-dropdown-item>
            <b-dropdown-item v-if="isBackButtonNeed" :active="reachRoute('recommended') === 'primary'" @click="toQuit()">Quit</b-dropdown-item>
            <b-dropdown-divider />
            <b-dropdown-item size=" " v-b-popover.hover.bottom="'Shared microservices and Node-RED flows'" :active="reachRoute('solutions') === 'primary'" @click="toSolutions()">Shared Solutions</b-dropdown-item>
            <b-dropdown-divider />      
            <b-dropdown-item size=" " :active="reachRoute('mydashboard') === 'primary'" @click="toMyDashboard()">Dashboard</b-dropdown-item>
            <b-dropdown-item size=" " v-b-popover.hover.bottom="'Console input output for test'" :active="reachRoute('myconsole') === 'primary'" @click="toMyConsole()">Test Console</b-dropdown-item>
            <b-dropdown-divider />
            <b-dropdown-item size=" " :active="reachRoute('docs') === 'primary'" @click="toDocs()">Docs</b-dropdown-item>

          </b-dropdown>
        </b-col>
      </b-row> 
    </div>
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
    toMyApps () {
      this.$router.replace('/user/myapplications')
    },
    async toMyMicroservices () {
      /*
      console.log('to my IoT')
      const username = 'denniskung123'
      const body = { username }
      const result = await API.post('thingApi', '/things', { body })
      console.log('result: ', result)
      */
      this.$router.replace('/user/mymicroservices')
    },
    async toMyApis () {
      this.$router.replace('/user/myapis')
    },
    async toMyDashboard () {
      this.$router.replace('/user/mydashboard')
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

<style scoped>
@media only screen and (max-width: 600px) {
  #smallSizeScreen div {
    visibility: visible;
  }
  #normalSizeScreen div {
    visibility: hidden;
    height: 0px;
    display: none;
  }
}
@media only screen and (min-width: 600px) {
  #smallSizeScreen div {
    visibility: hidden;
    height: 0px;
    display: none;
  }
  #normalSizeScreen div {
    visibility: visible;
  }
}
</style>
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