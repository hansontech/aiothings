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
      searchString: ''
    }
  },
  watch: {
    searchString: {
      handler: function (newS) {
        this.$parent.searchString.mservice = newS
        // console.log('MyApplications set: ', this.$parent.searchString.mservice)
      }
    }
  },
  mounted () {
    // console.log('MyApplications get: ', this.$parent.searchString.mservice)
    this.searchString = this.$parent.searchString.mservice
  }
}
</script>

<style>
</style>
