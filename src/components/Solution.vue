<template>
<div> 
  <App/>
    <b-container fluid >
        <!-- <b-alert :show="loading" variant="info">Loading...</b-alert> -->
        <b-row style="min-height: 620px; margin-top: 65px;">
          <b-col sm="3" lg="2" style="border-right: 1px solid blue">
            <at-sidebar menu="solution"></at-sidebar>
          </b-col>
          <b-col sm="9" lg="10">
            <router-view />
          </b-col>
        </b-row>
    </b-container>
    <at-footer class="footer" />
  </div>
</template>

<script>
export default {
  name: 'solution',
  data: function () {
    return {
    }
  },
  computed: {
  },
  created () {
  },
  methods: {
  }
}
</script>
<style>
.footer > *:last-child {
    margin-bottom: 0px;
    color: #fff;
}
</style>
