<template>
  <b-container fluid> 
    <!-- component matched by the route will render here -->
    <router-view /> 
  </b-container> 
</template>

<script>
export default {
  data: function () {
    return {
      searchString: '',
      servicesLogging: {}
    }
  },
  watch: {
    searchString: {
      handler: function (newS) {
        this.$parent.searchString.mservice = newS
        // console.log('MyApplications set: ', this.$parent.searchString.mservice)
      }
    },
    servicesLogging: {
      handler: function (newValue) {
        this.$parent.servicesLogging = newValue
      }
    }
  },
  mounted () {
    // console.log('MyApplications get: ', this.$parent.searchString.mservice)
    this.searchString = this.$parent.searchString.mservice
    this.servicesLogging = this.$parent.servicesLogging
  }
}
</script>

<style>
</style>
