<template>
  <div> 
    <!-- component matched by the route will render here -->
    <router-view /> 
  </div> 
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
      }
    },
    servicesLogging: {
      handler: function (newValue) {
        this.$parent.servicesLogging = newValue
      }
    }
  },
  mounted () {
    this.searchString = this.$parent.searchString.mservice
    this.servicesLogging = this.$parent.servicesLogging
  }
}
</script>

<style>
</style>
