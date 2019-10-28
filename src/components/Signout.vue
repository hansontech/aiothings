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
export default {
  /* beforeCreate () {
    Amplify.configure(awsmobile)
    Amplify.configure({
      Auth: {
        oauth: oauth
      }
    })
  }, */

  created () {
    var curUrl = window.location.href
    console.log('signout is called: ', curUrl)
    this.$router.replace({name: 'home'})
  }
}
</script>