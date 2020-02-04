<template>
  <div> 
   <App></App>
   <b-container style="min-height: 620px; margin-top: 65px;">
    <b-row align-v="center" class="mt-2 at-bottombar">
      <h4>Account Information</h4>
    </b-row>
    <b-row v-if="userHasPhoto" align-v="center" class="mt-2 mb-2 text-center">
      <b-col align="center">
      </b-col>
      <b-col align="left" sm="7">
        <img class="at-imageRound" v-if="userHasPhoto" v-bind:src="pictureUrl" style="max-height:1000px; max-width:1000px; height:auto; width:auto;" />
      </b-col>
    </b-row>
    <h5>
    <b-row v-if="userHasPhoto" align-v="center" class="mt-2 at-bottombar">
    </b-row>
    <b-row align-v="center" class="mt-2 at-bottombar">
      <b-col> User name: </b-col>
      <b-col sm="7"> {{userName}} </b-col>
    </b-row>
    <b-row align-v="center" class="mt-2 at-bottombar">
      <b-col>User ID:</b-col>
      <b-col sm="7"><code>{{$store.getters.userId}}</code></b-col>
    </b-row>
    <b-row align-v="center" class="mt-2 at-bottombar">
      <b-col> Email address: </b-col>
      <b-col sm="7"> {{profile.email}} </b-col>  
    </b-row>
    <b-row align-v="center" class="mt-2 at-bottombar">
      <b-col> Registered through: </b-col>
      <b-col sm="7"> {{registeredFrom}} </b-col>  
    </b-row>
    <b-row align-v="center" class="mt-2 at-bottombar">
      <b-col> Created since: </b-col>
      <b-col sm="7"> {{createdDate}} </b-col> 
    </b-row>
    <b-row v-if="registeredFrom == 'email'" align-v="center" class="mt-2 at-bottombar">
      <b-col> Password: </b-col>
      <b-col sm="7"> 
        <b-button variant="info"  v-b-toggle.collapseChangePassword @click="changePasswordErrorMessage = '';inputNewPassword = ''; inputOldPassword = ''; inputNewPasswordAgain = '';">Change</b-button> 
      </b-col> 
    </b-row>
    <b-collapse id="collapseChangePassword" class="mt-2">
     <b-row align-v="center" class="mt-2 at-bottombar">
      <b-col> Password: </b-col>
      <b-col sm="7">
        <!--
        <b-modal ref="changePasswordErrorModal">
           <b-badge variant="danger">
            {{changePasswordErrorMessage}}
            </b-badge>
        </b-modal>
        -->
        <b-row v-if="changePasswordErrorMessage != ''">
          <b-col>
            <b-badge variant="danger">
              <b-row align-v="center">
                <b-col col="11">
                  {{changePasswordErrorMessage}}
                </b-col>
                <b-col col="1">
                  <b-button variant="warning" @click="changePasswordErrorMessage = ''">
                    OK
                  </b-button>
                </b-col>
              </b-row>
            </b-badge>
          </b-col>
        </b-row>   
        <b-row class="mt-2" style="font-size: smaller;">
          <b-col>
            <b-form-group
              id="fieldset-1"
              label="Old Password"
              label-for="inputOldPassword"
              :invalid-feedback="invalidPassword(inputOldPassword)"
              :valid-feedback="validPassword(inputOldPassword)"
              :state="statePassword(inputOldPassword)"
            >
              <b-form-input id="inputOldPassword" v-model="inputOldPassword" :state="statePassword(inputOldPassword)" type="password" trim></b-form-input>
            </b-form-group>
            <b-form-group
              id="fieldset-2"
              label="New Password"
              label-for="inputNewPassword"
              :invalid-feedback="invalidPassword(inputNewPassword)"
              :valid-feedback="validPassword(inputNewPassword)"
              :state="statePassword(inputNewPassword)"
            >
              <b-form-input id="inputNewPassword" v-model="inputNewPassword" :state="statePassword(inputNewPassword)" type="password" trim></b-form-input>
            </b-form-group>
            <b-form-group
              id="fieldset-3"
              label="New Password Again"
              label-for="inputNewPasswordAgain"
              :invalid-feedback="invalidPassword(inputNewPasswordAgain)"
              :valid-feedback="validPassword(inputNewPasswordAgain)"
              :state="statePassword(inputNewPasswordAgain)"
            >
              <b-form-input id="inputNewPasswordAgain" v-model="inputNewPasswordAgain" :state="statePassword(inputNewPasswordAgain)" type="password" trim></b-form-input>
            </b-form-group>
            <b-row>
              <b-col>
                <b-button variant="info" @click="changePassword();">Update</b-button> 
                <b-button variant="info" v-b-toggle.collapseChangePassword>Cancel</b-button> 
              </b-col>
            </b-row>
          </b-col>
        </b-row>
      </b-col> 
    </b-row>
    </b-collapse>
    <b-row align-v="center" class="mt-2 at-bottombar">
      <b-col> Membership: </b-col>
      <b-col sm="7"> 
        <b-button variant="info" @click="checkout()" disabled>Upgrade</b-button> 
      </b-col> 
    </b-row>
    <!-- for Stripe Checkout integration https://stripe.com/docs/payments/checkout/live -->
         <!-- Create a button that your customers click to complete their purchase. Customize the styling to suit your branding. -->
    <!--
    <b-row class="mt-5">
      <b-col>
        <button
          style="background-color:#6772E5;color:#FFF;padding:8px 12px;border:0;border-radius:4px;font-size:1em"
          id="checkout-button-plan_F31aTZdZaDhNry"
          role="link"
        >
          Checkout
        </button>
      </b-col>
    </b-row>
    -->
    <!-- https://www.npmjs.com/package/vue-stripe-checkout -->
    <!--
    <b-row class="mt-5">
      <b-col>
        
        <vue-stripe-checkout
          ref="checkoutRef"
          :image="image"
          :name="name"
          :description="description"
          :currency="currency"
          :amount="amount"
          :allow-remember-me="false"
          @done="done"
          @opened="opened"
          @closed="closed"
          @canceled="canceled"
        ></vue-stripe-checkout>
        <b-button variant="info"  @click="checkout()">Subscribe</b-button>
      </b-col>
    </b-row>
    -->
    </h5>
    <!--
    <b-row align-v="center" class="mt-2 at-bottombar">
      {{profile}}
    </b-row>
    -->
   </b-container>
   <at-footer/>
  </div>
</template>


<script>
// import axios from 'axios'
import { Auth } from 'aws-amplify'
import atHelper from '../aiot-helper'

export default {
  name: 'home',
  data: function () {
    return {
      response: 'unknown',
      userData: {},
      image: 'https://i.imgur.com/HhqxVCW.jpg',
      name: 'AIoThings',
      description: 'Disc',
      currency: 'AUD',
      amount: 4.9,
      inputNewPassword: '',
      inputNewPasswordAgain: '',
      inputOldPassword: '',
      changePasswordErrorMessage: ''
    }
  },
  computed: {
    createdDate () {
      if (this.userData.hasOwnProperty('UserCreateDate')) {
        let date = new Date(this.userData.UserCreateDate)
        date.setSeconds(0)
        date.setMilliseconds(0)
        let dateStr = date.toISOString()
        dateStr = dateStr.substring(0, dateStr.length - 8)
        dateStr = dateStr.replace(/[a-zA-Z]/g, ' ')
        return dateStr
      } else {
        return ' '
      }
    },
    userName () {
      console.log('user status:', this.profile)
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
      return atHelper.userHasPhoto()
      /*
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
      */
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
  },
  mounted () {
    // let recaptchaScript = document.createElement('script')
    // recaptchaScript.setAttribute('src', 'https://js.stripe.com/v3/')
    // document.head.appendChild(recaptchaScript)

    // this.setUpStripe()
  },
  methods: {
    statePassword (password) {
      // console.log('state password: ', password)
      // let letters = /^[0-9a-zA-Z]+$/
      // if (password.length > 0 && letters.test(password) === false) {
      //  return false
      // }
      return true
    },
    validPassword (password) {
      // this.changePasswordErrorMessage = ''
      return ''
    },
    invalidPassword (password) {
      return 'invalid Password'
    },
    changePassword () {
      if (this.inputNewPassword.length === 0 || this.inputNewPassword.length === 0) {
        this.changePasswordErrorMessage = 'Password cannot be zero length.'
        this.$refs.changePasswordErrorModal.show()
        return
      }
      if (this.inputNewPassword !== this.inputNewPasswordAgain) {
        this.changePasswordErrorMessage = 'New passwords are not consistant.'
        this.$refs.changePasswordErrorModal.show()
        return
      }
      Auth.currentAuthenticatedUser()
      .then(user => {
        console.log('user: ', user)
        return Auth.changePassword(user, this.inputOldPassword, this.inputNewPassword)
      })
      .then(data => {
        console.log('data: ', data)
        this.$root.$emit('bv::toggle::collapse', 'collapseChangePassword')
      })
      .catch(err => {
        this.changePasswordErrorMessage = err.message
        this.$refs.changePasswordErrorModal.show()
        console.log('err: ', err.message)
      })
    },
    userHasPhoto2 () {
      let result = atHelper.userHasPhoto()
      console.log('result: ', result)
      return atHelper.userHasPhoto()
    },
    setUpStripe () {
      if (window.Stripe === undefined) {
        alert('Stripe V3 library not loaded!')
      } else {
        console.log('setup Stripe begin')
        const stripe = window.Stripe('pk_live_zocZmh9i0DOGAcmgI7i6MwzH00JJO7x6bH')

        var checkoutButton = document.getElementById('checkout-button-plan_F31aTZdZaDhNry')
        checkoutButton.addEventListener('click', function () {
          // When the customer clicks on the button, redirect
          // them to Checkout.
          stripe.redirectToCheckout({
            items: [{plan: 'plan_F31aTZdZaDhNry', quantity: 1}],

            // Note that it is not guaranteed your customers will be redirected to this
            // URL *100%* of the time, it's possible that they could e.g. close the
            // tab between form submission and the redirect.
            successUrl: 'https://www.aiothings.com/payment_success',
            cancelUrl: 'https://www.aiothings.com/payment_canceled'
          })
          .then(function (result) {
            if (result.error) {
              // If `redirectToCheckout` fails due to a browser or network
              // error, display the localized error message to your customer.
              var displayError = document.getElementById('error-message')
              displayError.textContent = result.error.message
            }
          })
        })
      } // end else
    },
    async checkout () {
      console.log('checkout')
      // token - is the token object
      // args - is an object containing the billing and shipping address if enabled
      const { token, args } = await this.$refs.checkoutRef.open()
      console.log(': token: ', token)
      console.log(': args: ', args)
    },
    done ({token, args}) {
      // token - is the token object
      // args - is an object containing the billing and shipping address if enabled
      // do stuff...
      console.log('token: ', token)
      console.log('args: ', args)
    },
    opened () {
      // do stuff
      console.log('opened----')
    },
    closed () {
      // do stuff
      console.log('closed----')
    },
    canceled () {
      // do stuff
      console.log('canceled----')
    }
  }
}
</script>

<style>
</style>