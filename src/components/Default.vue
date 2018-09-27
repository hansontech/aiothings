<template>
  <b-container fluid>
    <b-row>
      <h1> This is a default page </h1>
    </b-row>
  </b-container>
</template>

<script>

export default {
  name: 'device',
  props: ['description'],
  data: function () {
    return {
      activeMenu: 'app',
      response: 'unknown',
      guess: 123,
      what: 0,
      loading: false,
      thingDesc: String
    }
  },
  computed: {},
  created () {},
  methods: {
  }
}
</script>
