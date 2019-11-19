<template>
  <b-container fluid >
    <div style="min-height: 500px">
      <b-row align-v="center" align-h="center" > 
        <spinner size="large" />
      </b-row>
    </div>
  </b-container>
</template>

<script>
import { eventBus } from '../main'
export default {
  created () {
    var curUrl = window.location.href
    console.log('signout is called: ', curUrl)
    eventBus.$emit('logout')
    this.$router.replace({name: 'home'})
  }
}
</script>