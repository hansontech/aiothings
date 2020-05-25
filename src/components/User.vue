<template>
<div> 
  <App/>
  <b-container fluid class="bv-example-row" >
      <!-- <b-alert :show="loading" variant="info">Loading...</b-alert> -->
      <b-row  style="min-height: 620px; margin-top: 65px">
        <b-col sm="3" lg="2" style="border-right: 1px solid blue">
          <at-sidebar menu="user"></at-sidebar>
        </b-col>
        <b-col sm="9" lg="10">
          <router-view class="mt-1" />
        </b-col>
      </b-row>
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
      },
      mythingsTabIndex: 0
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
