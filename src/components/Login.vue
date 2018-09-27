<template>
  <div>
    <h1>Not Authenticated</h1>
  </div>
</template>

<script>

import auth from '../services/auth'

/*
import 'vue-awesome/icons/sign-in'
import 'vue-awesome/icons/facebook-official'
import 'vue-awesome/icons/google'
import 'vue-awesome/icons/amazon'
import 'vue-awesome/icons/id-card-o'
*/

export default {
  name: 'login',
  created () {
    this.authenticate()
  },
  methods: {
    authenticate (provider) {
      return auth.authenticate(provider)
    }
  }
}
</script>
