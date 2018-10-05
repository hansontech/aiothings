<template>
  <div>
    <!-- <b-alert :show="loading" variant="info">Loading...</b-alert> -->
    <b-row style="height: 600px">
      <b-col cols="2" style=" border-right: 1px solid blue">
        <at-sidebar menu="solution"></at-sidebar>
      </b-col>
      <b-col cols="10">
        <router-view />
      </b-col>
    </b-row>
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
