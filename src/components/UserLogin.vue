<template>
  <div>
    <!-- <fb:login-button 
      scope="public_profile,email"
      onlogin="checkLoginState();">
    </fb:login-button>
    -->
    <b-container class="bv-example-row bv-example-row-flex-cols">
      <b-row class="mb-3">
      </b-row>
      <b-row align-h="center" class="mb-3">
        <b-button-group size="lg">
          <b-button :pressed.sync="collapseLogin" id="loginButton" class="mx-1" @click="toggleTab(true)" >LOG IN</b-button>
          <b-button :pressed.sync="collapseSignup" id="signupButton" class="mx-1" @click="toggleTab(false)">SIGN UP</b-button>
        </b-button-group>
      </b-row>
      
    </b-container>
    
    <b-container class="bv-example-row bv-example-row-flex-cols" v-if="checkLogin('login')">
      <b-form @submit="onSubmit" @reset="onReset" v-if="show">
        <facebook-login class="button"
              appId="326022817735322"
              version="v3.1"
              @login="onLogin"
              @logout="onLogout"
              @sdk-loaded="sdkLoaded">
        </facebook-login>
            <b-form-group id="exampleInputGroup1"
                          label="Email address:"
                          label-for="exampleInput1"
                          description="We'll never share your email with anyone else.">
              <b-form-input id="exampleInput1"
                            type="email"
                            v-model="form.email"
                            required
                            placeholder="Enter email">
              </b-form-input>
            </b-form-group>    
            <b-form-group id="exampleInputGroup2"
                          label="Your Name:"
                          label-for="exampleInput2">
              <b-form-input id="exampleInput2"
                            type="text"
                            v-model="form.name"
                            required
                            placeholder="Enter name">
              </b-form-input>
            </b-form-group>
            <b-form-group id="exampleGroup4">
              <b-form-checkbox-group v-model="form.checked" id="exampleChecks">
                <b-form-checkbox value="me">Check me out</b-form-checkbox>
                <b-form-checkbox value="that">Check that out</b-form-checkbox>
              </b-form-checkbox-group>
            </b-form-group>
            <b-button type="submit" variant="primary">Submit</b-button>
            <b-button type="reset" variant="danger">Reset</b-button>
        </b-form>
    </b-container>  

     <b-container class="bv-example-row bv-example-row-flex-cols" v-if="checkLogin('signup')">
      <b-form @submit="onSubmit" @reset="onReset" v-if="show">
            <facebook-login class="button"
              appId="326022817735322"
              version="v3.1"
              loginLabel= "Sign in to Facebook"
              @login="onLogin"
              @logout="onLogout"
              @sdk-loaded="sdkLoaded">
            </facebook-login>
            <!-- <button @click="authenticate('facebook')">auth Facebook</button> -->
            <b-form-group id="exampleInputGroup1"
                          label="Email address:"
                          label-for="exampleInput1"
                          description="We'll never share your email with anyone else.">
              <b-form-input id="exampleInput1"
                            type="email"
                            v-model="form.email"
                            required
                            placeholder="Enter email">
              </b-form-input>
            </b-form-group>    
            <b-form-group id="exampleInputGroup2"
                          label="Your Name:"
                          label-for="exampleInput2">
              <b-form-input id="exampleInput2"
                            type="text"
                            v-model="form.name"
                            required
                            placeholder="Enter name">
              </b-form-input>
            </b-form-group>
            <b-form-group id="exampleInputGroup3"
                          label="Food:"
                          label-for="exampleInput3">
              <b-form-select id="exampleInput3"
                            :options="foods"
                            required
                            v-model="form.food">
              </b-form-select>
            </b-form-group>
            <b-form-group id="exampleGroup4">
              <b-form-checkbox-group v-model="form.checked" id="exampleChecks">
                <b-form-checkbox value="me">Check me out</b-form-checkbox>
                <b-form-checkbox value="that">Check that out</b-form-checkbox>
              </b-form-checkbox-group>
            </b-form-group>
            <b-button type="submit" variant="primary">Submit</b-button>
            <b-button type="reset" variant="danger">Reset</b-button>
        </b-form>
    </b-container>

  </div>
</template>

<script>

import { eventBus } from '../main'
import facebookLogin from '@/components/facebook-login'

export default {
  data () {
    return {
      collapseLogin: null,
      collapseSignup: null,
      form: {
        email: '',
        password: '',
        name: '',
        food: null,
        checked: []
      },
      foods: [
        { text: 'Select One', value: null },
        'Carrots', 'Beans', 'Tomatoes', 'Corn'
      ],
      show: true,
      FB: undefined
    }
  },
  components: {
    facebookLogin
  },
  methods: {
    checkLoginState: function () {
      /*
      FB.getLoginStatus(function (response) {
        // statusChangeCallback(response)
      })
      */
    },
    onSubmit (evt) {
    },
    onReset (evt) {
    },
    login: function () {
      let email = this.form.email
      let password = this.form.password
      this.$auth.login({ email, password }).then(function () {
        // Execute application logic after successful login
      })
    },
    register: function () {
      let email = this.form.email
      let password = this.form.password
      this.$auth.register({ name, email, password }).then(function () {
        // Execute application logic after successful registration
      })
    },
    toggleTab (isLogin) {
      this.collapseLogin = isLogin
      this.collapseSignup = !isLogin
    },
    checkLogin: function (type) {
      const self = this
      const pathFrom = self.$route.params.option
      let isLogin = true
      if (this.collapseLogin == null) {
        if (pathFrom === 'login') {
          isLogin = true
        } else {
          isLogin = false
        }
        this.collapseLogin = isLogin
        this.collapseSignup = !isLogin
      }

      if (type === 'login') {
        return (this.collapseLogin === true)
      } else {
        return (this.collapseSignup === true)
      }
    },
    authenticate: function (provider) {
      const self = this
      this.$auth.authenticate(provider).then(function () {
        // Execute application logic after successful social authentication
        console.log('authonticate')
      }).catch(function () {
        console.log('no need authonticate')
        eventBus.$emit('loggedInUser', 'test')
        self.$router.push(`/`)
      })
    },
    getUserData () {
      this.FB.api('/me', 'GET', { fields: 'id,name,email' },
        userInformation => {
        }
      )
    },
    sdkLoaded (payload) {
      this.FB = payload.FB
      if (payload.isConnected) this.getUserData()
    },
    onLogin () {
      this.$router.push(`/`)
      eventBus.$emit('login')
    },
    onLogout () {
      console.log('onLogout')
      this.$router.push(`/`)
    }
  }
}
</script>

.<style>

.button {
  margin: auto;
}
</style>
