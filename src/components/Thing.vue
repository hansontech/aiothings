<template>
  <b-container fluid>
    <b-alert :show="loading" variant="info">Loading...</b-alert>
    <b-row>
      <b-col>
        <div class="embed-responsive embed-responsive-16by9">
          <!-- <iframe class="embed-responsive-item" src="https://www.youtube.com/embed/v64KOxKVLVg" allowfullscreen></iframe>
            <iframe class="embed-responsive-item" src="https://www.google.com" allowfullscreen></iframe>  -->
          <iframe class="embed-responsive-item" :src="nodeRedUrl" allowfullscreen></iframe>
        </div>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import Sidebar from './Sidebar'
import { eventBus } from '../main'

export default {
  components: {
    sidebar: Sidebar
  },
  name: 'my node-RED',
  props: ['url'],
  data: function () {
    return {
      activeMenu: 'app',
      response: 'unknown',
      guess: 123,
      what: 0,
      loading: false,
      nodeRedUrl: null
    }
  },
  computed: {},
  mounted () {
    console.log('thing mounted')
  },
  created () {
    eventBus.$on('pageBack', this.pageBackListener)
    this.nodeRedUrl = 'http://' + this.url + ':1880'
    console.log('nodeRedUrl: ', this.nodeRedUrl)
  },
  beforeDestroy () {
    eventBus.$off('pageBack', this.pageBackListener) // only remove current listener
  },
  methods: {
    pageBackListener: function () {
      console.log('test emit')
      this.$router.go(-2) // don't know why?? -1 was not enough
    }
  }
}
</script>
