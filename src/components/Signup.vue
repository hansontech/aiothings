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
import { Auth } from 'aws-amplify'
export default {
  created () {
    Auth.federatedSignIn() // command to show Hosted UI
  }
}
</script>