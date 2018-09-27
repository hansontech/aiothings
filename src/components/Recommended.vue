<template>
  <div>
    <h1 class="h1">Recommended page</h1>
    <em>{{what}}</em>
  </div>
</template>

<script>
import Sidebar from './Sidebar'

export default {
  components: {
    sidebar: Sidebar
  },

  name: 'recommended',
  data: function () {
    return {
      activeMenu: 'app',
      response: 'unknown',
      guess: 123,
      what: 0,
      loading: false
    }
  },
  computed: {},
  created () {},
  methods: {}
}
</script>
