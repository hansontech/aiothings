<template>
  <b-container fluid>
      <b-row align-v="center" class="at-bottombar">
        <b-col align="start">
            <h4>Edit Application </h4>
        </b-col>
        <b-col sm="auto" align="end" >
          <b-button variant="success"  @click="updateApp()">Update</b-button>
          <b-button variant="dark" @click="backHome()">Return</b-button>
          <b-modal id="modalReturnConfirm"
             ref="modalReturnConfirmRef"
             hide-header
             @ok="returnDiscardChangesOk"
             @cancel="returnCancel">
             Discard the changes and return?
          </b-modal>
        </b-col>
      </b-row>
      <b-modal id="modalInvalidInputs"
             ref="modalInvalidInputsRef" 
             ok-only
             >
       Input and output message topics cannot be empty.
      </b-modal>
      <spinner v-if="isUpdating === true" size="medium" />
      <b-row align-v="center" class="mt-3">
        <b-col>
        </b-col>
        <b-col align-self="end">
          <b-alert variant="danger"
                dismissible
                :show="showClientNameEmptyAlert"
                @dismissed="showDescCannotEmptyAlert=false">
                Name cannot be empty.
          </b-alert>
          <b-alert variant="danger"
                dismissible
                :show="showURLEmptyAlert"
                @dismissed="showHandlerEmptyAlert=false">
                URLs cannot be empty.
          </b-alert>
        </b-col>
      </b-row>
          <b-form-group
                :label-cols="3"
                breakpoint="md"
                label-size="lg"
                label="App client name">
              <b-form-input v-model="app.ClientName" :placeholder="'Client name'"></b-form-input>
          </b-form-group>
          <b-row v-if="app.ClientId!==''" align-v="center" class="mt-3">
            <b-col sm="3">
              <p class="h5">App client id</p>
            </b-col>
            <b-col>
              <b-list-group>
                <b-list-group-item>
                  <h5>{{app.ClientId}}</h5>
                </b-list-group-item>
              </b-list-group>
            </b-col>
          </b-row>
          <b-row v-if="app.ClientSecret!==''" align-v="center" class="mt-3 mb-3">
            <b-col sm="3">
              <p class="h5">App client secret</p>
            </b-col>
            <b-col> 
              <b-list-group>
                <b-list-group-item>
                  <h5>{{app.ClientSecret}}</h5>
                </b-list-group-item>
              </b-list-group>
            </b-col>
          </b-row>
          <b-form-group
                :label-cols="3"
                breakpoint="md"
                label-size="lg"
                label="Token Refresh Period">
              <b-form-input v-model="app.RefreshTokenValidity" :placeholder="'In days up to 3650'"></b-form-input>
          </b-form-group>
          <b-form-group
                :label-cols="3"
                breakpoint="md"
                label-size="lg"
                label="Callback URL">
              <b-form-input v-model="app.CallbackURL" :placeholder="'https://example.com/callback'"></b-form-input>
           </b-form-group>
           <b-form-group
                :label-cols="3"
                breakpoint="md"
                label-size="lg"
                label="Logout URL">
              <b-form-input v-model="app.LogoutURL" :placeholder="'https://example.com/logout'"></b-form-input>
          </b-form-group>
  </b-container>
 </template>

<script>

import {API} from 'aws-amplify'

export default {
  name: 'device',
  props: ['appIndex', 'appSource'], // VUE reference https://router.vuejs.org/guide/essentials/passing-props.html
  data: function () {
    return {
      app: {
        ClientName: '',
        ClientId: '',
        ClientSecret: '',
        RefreshTokenValidity: 3650,
        RedirectURL: '',
        SignoutURL: ''
      },
      isChangedNotSaved: null,
      isUpdating: false,
      showClientNameEmptyAlert: false,
      showURLEmptyAlert: false
    }
  },
  computed: {
  },
  beforeCreate () {
    console.log('EditSource beforeCreate')
  },
  created () {
    console.log('EditAuthApplication created')
    let index = this.appIndex
    // https://scotch.io/bar-talk/copying-objects-in-javascript
    // only shallow copying, is enough
    // 20181112 this.api = Object.assign({}, this.$store.getters.apis[index])
    if (index >= 0) {
      let appStr = JSON.stringify(this.$store.getters.app[index])
      this.app = JSON.parse(appStr)
    } else {
    }
  },
  async mounted () {
  },
  beforeDestroy () {
  },
  watch: {
    app: function () {
      console.log('app changed')
    }
  },
  methods: {
    async updateApp () {
      if (this.app.ClientName === '') {
        this.showClientNameEmptyAlert = true
        return
      }
      if (this.app.RedirectURL === '' || this.app.LogoutURL === '') {
        this.showURLEmptyAlert = true
        return
      }
      this.isUpdating = true
      const result = await API.post('apiApi', '/apps', { body: {app: this.app} })
      if (result.error === null) {
        this.app = result.result
        this.$store.dispatch('replaceApp', this.app)
        console.log('new app: ', this.app)
      } else {
        console.log('error: ', result.error)
      }
      this.isChangedNotSaved = false
      this.isUpdating = false
    },
    returnDiscardChangesOk (evt) {
      // Prevent modal from closing
      // evt.preventDefault()
      this.$refs.modalReturnConfirmRef.hide()
      this.$router.go(-1)
    },
    returnCancel () {
      this.$refs.modalReturnConfirmRef.hide()
    },
    backHome () {
      console.log('quit')
      if (this.isChangedNotSaved === true) {
        console.log('real quit')
        this.$refs.modalReturnConfirmRef.show()
      } else {
        this.$router.go(-1)
      }
    }
  }
}
</script>

<style>
.btn:hover { outline: 0 !important }
</style>
