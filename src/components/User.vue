<template>
  <div>
    <!-- <b-alert :show="loading" variant="info">Loading...</b-alert> -->
    <b-row style="height: 600px">
      <b-col cols="2" style=" border-right: 1px solid blue">
        <at-sidebar menu="user"></at-sidebar>
      </b-col>
      <b-col cols="10">
        <!-- component matched by the route will render here -->
        <!-- <router-view></router-view> -->
        <router-view />
        <!--
        <b-card :title="(model.id ? 'Edit Post ID#' + model.id : 'New Post')">
          <form @submit.prevent="savePost">
            <b-form-group label="Title">
              <b-form-input type="text" v-model="model.title"></b-form-input>
            </b-form-group>
            <b-form-group label="Body">
              <b-form-textarea rows="4" v-model="model.body"></b-form-textarea>
            </b-form-group>
            <div>
              <b-btn type="submit" variant="success">Save Post</b-btn>
            </div>
          </form>
        </b-card>
        -->
      </b-col>
    </b-row>
  </div>
</template>

<script>
// import Sidebar from './Sidebar'
// import { Auth } from 'aws-amplify'
// import * as apiGateway from '../lib/api-gateway'
// import jwt from 'jwt-decode'

export default {
  /*
  components: {
    sidebar: Sidebar
  }, */
  name: 'user',
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
    }
  },
  created () {
  },
  methods: {

  }
}
</script>
