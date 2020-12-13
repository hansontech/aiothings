<template>
<div> 
  <App/>
  <b-container style="min-height: 800px; margin-top: 65px; padding-bottom: 30px;">
        <!-- https://www.codeply.com/go/p2pModdHxc/bootstrap-independent-scrolling-columns -->
        <!--
          <div class="row">
        <div class="col-md-4" style="border-right: 1px solid blue; overflow-y: scroll; position: fixed; width: 300px;">
          <doc-sidebar></doc-sidebar>
        </div>
        <div class="col-md-8" style="overflow-y: scroll;">
          <router-view />
        </div>
        </div>
        -->
        <!-- reference source CSS https://amsik.github.io/liquor-tree/#Guides -->
        <div id="normalSizeScreen">
          <div class="menu" style="border-right: 1px solid blue; margin-top: 65px;" >         
            <doc-sidebar></doc-sidebar>
          </div>
          <div id="docMain" class="page">
              <router-view/>
          </div>
        </div>
        <div id="smallSizeScreen">
          <div id="docMain">
            <router-view/>
          </div>
        </div>

  </b-container>
</div>
</template>

<script>

export default {
  name: 'documents',
  data: function () {
    return {
      activeMenu: 'app',
      response: 'unknown',
      guess: 123,
      what: 0,
      loading: false
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
  beforeDestroy () {
  },
  methods: {

  }
}
</script>
<style scoped>

/* 
  Explain to the position definitions,
  https://www.w3schools.com/css/css_positioning.asp 
*/
.menu {
  position: fixed; /* fixed to top/left/right/bottom viewport */
  top: 0;
  left: 0;
  right: 75%; /* right boundary is at 75% from the rightmost */
  bottom: 0;
  width: 25%;
  overflow-y: scroll;
  -webkit-overflow-scrolling: touch; /* for iphone .. touch devices */
  border-right: 1px solid #efefef; 
}

.page {
  position: fixed;
  left: 25%;
  top: 70px;  /* below the top menu portion */
  right: 0%;  /* from rightmost */
  bottom: 0%; /* to the end of the bottom */
  overflow-y: scroll;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 80px;
}

@media only screen and (max-width: 600px) {
  #smallSizeScreen div {
    visibility: visible;
  }
  #normalSizeScreen div {
    visibility: hidden;
    /* height: 0px; */
    display: none;
  }
}
@media only screen and (min-width: 600px) {
  #smallSizeScreen div {
    visibility: hidden;
    /* height: 0px; */
    display: none;
  }
  #normalSizeScreen div {
    visibility: visible;
  }
}
</style>

