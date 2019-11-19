<template>
  <b-container fluid>
    <b-row>
      <b-col>
        {{userid}}
      </b-col>
    </b-row>
     <b-row>
      <b-col>
        This is a test for dashboard page
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        {{userid}}
      </b-col>
    </b-row>
        <b-row>
      <b-col>
        {{userid}}
      </b-col>
    </b-row>
  </b-container>
 </template>

<script>

// import {API} from 'aws-amplify'
// import atHelper from '../aiot-helper'

export default {
  name: 'dashboard',
  props: ['userid'], // VUE reference https://router.vuejs.org/guide/essentials/passing-props.html
  data: function () {
    return {
    }
  },
  computed: {
  },
  beforeCreate () {
  },
  created () {
  },
  mounted () {
    console.log('dashboard mounted: ', this.userid)
  },
  beforeDestroy () {
  },
  watch: {
  },
  methods: {
  }
}
</script>

<style>
</style>
