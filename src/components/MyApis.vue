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
      searchString: ''
    }
  },
  watch: {
    searchString: {
      handler: function (newS) {
        this.$parent.searchString.api = newS
      }
    }
  },
  mounted () {
    this.searchString = this.$parent.searchString.api
  }
}
</script>

<style>
</style>
