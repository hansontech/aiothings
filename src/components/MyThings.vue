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
        this.$parent.searchString.thing = newS
      }
    }
  },
  mounted () {
    // console.log('MyThings get: ', this.$parent.searchString.thing)
    this.searchString = this.$parent.searchString.thing
    this.$forceUpdate()
  }
}
</script>

<style>
</style>
