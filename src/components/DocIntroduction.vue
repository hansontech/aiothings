<template>
  <b-container fluid style="padding-right: 0px; padding-left: 0px; margin-top:0px; margin-left:0px; margin-right:0px"> 
    <div class="bv-example-row" style="padding-right: 50px; padding-left: 50px">  
      <vue-markdown>
### Under Construction ....
      </vue-markdown>  
    </div>
  </b-container>
</template>

<script>
import VueMarkdown from 'vue-markdown' // production

export default {
  name: 'home',
  data: function () {
    return {
      hostUrl: '',
      response: 'unknown',
      idName: '',
      nodeUrl: 'https://flows.nodered.org/flow/0d98ac57a6ebf724def9'
    }
  },
  components: {
    VueMarkdown
  },
  computed: {
  },
  methods: {
    toTest () {
      let iframe = document.getElementById('nodered')
      console.log('test frame: ', iframe)
      let content = iframe.contentWindow.document.getElementById('flow')
      console.log('test: ', content)
    }
  },
  created () {
    this.hostUrl = window.location.protocol + '//' + window.location.host
    this.nodeUrl = 'https://flows.nodered.org/flow/0d98ac57a6ebf724def9'
  }
}
</script>
<style>
.at-home{
  margin-top: 50px;
}
.at-home p {
    font-size:18px;
}

.at-home h5 {
    font-size:18px;
}

.stretch {
    width:100%;
}

.centered-and-cropped { object-fit: cover }

.top-foto {
  z-index: -1;
  width: 100%;
  height: 700px;
}

.bgimg {
    background-image: url('/static/aiot-home-bg.jpg');

}

.at-home li{
  margin: 20px 0;
  font-size: 18px;
}
</style>