<template>
<div> 
  <App/>
  <b-container fluid class="bv-example-row" >
    <div style="min-height: 500px">
      <!-- <b-alert :show="loading" variant="info">Loading...</b-alert> -->
      <b-row>
        <b-col sm="3" lg="2" style="border-right: 1px solid blue">
          <at-sidebar menu="user"></at-sidebar>
        </b-col>
        <b-col sm="9" lg="10">
          <router-view />
        </b-col>
      </b-row>
    </div>
  </b-container>
  <at-footer/>
 </div>
</template>

<script>
export default {
  /*
  components: {
    sidebar: Sidebar
  }, */
  name: 'user',
  data: function () {
    return {
      searchString: {
        mservice: '',
        api: '',
        thing: ''
      }
    }
  },
  computed: {
    isActiveMenu (order) {},
    accessToken () {
      return this.$store.getters.accessToken
    },
    idToken () {
      return this.$store.getters.idToken
    },
    profile () {
      return this.$store.getters.profile
    },
    firstname () {
      return this.$store.getters.profile.name.split(' ')[0]
    }
  },
  created () {
  },
  mounted () {
  },
  beforeDestroy () {
  },
  methods: {
  }
}
</script>
