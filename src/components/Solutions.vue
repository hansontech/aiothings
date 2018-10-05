<template>
  <b-container fluid> 
      <!--
       <b-row align-v="center" class="at-sidebar">
          <b-col align="start" class="mt-2">
            <h2 class="h2">Solutions</h2>
          </b-col>
          <b-col col class="mt-2">
            <b-button variant="primary" @click="searchFromNodeRed()">Query Node-RED</b-button>
          </b-col>
          <b-col align="end">
            <b-button variant="primary" @click="refreshSolutions()">Refresh</b-button>
            <b-button aligh="end" variant="success" @click="createSolution()" >Add new solution</b-button>
          </b-col>
      </b-row>
      -->
      <b-row align-v="center" class="at-sidebar mt-1 ">
          <b-col align="end">
            <b-button variant="primary" @click="refreshSolutions()">Refresh</b-button>
            <b-button aligh="end" variant="success" @click="createSolution()" >Add new solution</b-button>
          </b-col>
      </b-row>
      <b-card no-body>
        <b-tabs card>
          <b-tab title="Node-RED Flows" active>
            <div class="embed-responsive embed-responsive-16by9">
              <iframe id="nodered" class="embed-responsive-item" :src="nodeRedLink" allowfullscreen></iframe>
            </div>
          </b-tab>
          <b-tab title="AWS Solutions" active>
            <div class="at-scroll">
              <b-card-group columns>
              <b-card v-for="(solution, index) in solutions" :key="solution.SolutionId"
                  img-src="https://picsum.photos/600/300/?image=25"
                  img-alt="Image"
                  img-top
                  @click = "showSolutionDetail(index)"
                  tag="article"
                  class="mb-2 at-card">
                  <b-row>
                    <!--
                    <b-col align="start">
                      <b-button size="sm" variant="success" @click.stop="deploySolution(solution)">Deploy</b-button>
                    </b-col>
                    -->
                    <b-col align="start">
                      <b-badge variant="primary">{{solution.SolutionName}}</b-badge>
                    </b-col>
                    <b-col align="end">   
                      <b-dropdown variant="success" class="mx-1" right >
                        <b-dropdown-item @click.stop="deploySolution(solution)" >Deploy</b-dropdown-item>
                        <!-- VUE reference: https://vuejs.org/v2/guide/events.html -->
                        <b-dropdown-item @click.stop="deleteSolution(index)" >Delete</b-dropdown-item>
                      </b-dropdown>
                    </b-col>
                  </b-row>
                  <b-row class="ml-1 mt-2">  
                    <p class="card-text">
                      {{solution.SolutionDesc}}
                    </p>
                  </b-row>
                </b-card>
              </b-card-group>
            </div>
          </b-tab>
        </b-tabs>
      </b-card>
      <!-- 
      <b-row v-if="isSearchFromNodeRed == true">
        <div class="embed-responsive embed-responsive-16by9">
          <iframe id="nodered" class="embed-responsive-item" :src="nodeRedLink" allowfullscreen></iframe>
        </div>
      </b-row>
      <b-row v-if="isSearchFromNodeRed == false" class="mt-2">
        <div class="at-scroll">
          <b-card-group columns>
           <b-card v-for="(solution, index) in solutions" :key="solution.SolutionId"
              img-src="https://picsum.photos/600/300/?image=25"
              img-alt="Image"
              img-top
              @click = "showSolutionDetail(index)"
              tag="article"
              class="mb-2 at-card">
              <b-row>
                  <b-col align="start">
                  <b-badge variant="primary">{{solution.SolutionName}}</b-badge>
                </b-col>
                <b-col align="end">   
                  <b-dropdown variant="success" class="mx-1" right >
                    <b-dropdown-item @click.stop="deploySolution(solution)" >Deploy</b-dropdown-item>
                    <b-dropdown-item @click.stop="deleteSolution(index)" >Delete</b-dropdown-item>
                  </b-dropdown>
                </b-col>
              </b-row>
              <b-row class="ml-1 mt-2">  
                <p class="card-text">
                  {{solution.SolutionDesc}}
                </p>
              </b-row>
            </b-card>
          </b-card-group>
        </div>
      </b-row>
      -->
  </b-container> 
</template>

<script>
// import { API, Auth } from 'aws-amplify'
import atHelper from '../aiot-helper'
import { eventBus } from '../main'
// import * as IoT from '../lib/aws-iot'
// import { API, PubSub } from 'aws-amplify'
// import AWS from 'aws-sdk'

// AWS Amplify API reference
// https://aws-amplify.github.io/amplify-js/media/api_guide.html

export default {
  name: 'mysolutions',
  props: [ 'queryString' ],
  data: function () {
    return {
      activeMenu: 'app',
      response: 'unknown',
      guess: 123,
      what: 0,
      loading: false,
      items: [ 'apple', 'monkey' ],
      iotClient: null,
      subs: [],
      solutionsMap: {'x': 1},
      testFlag: false,
      solutions: null,
      isSearchFromNodeRed: false,
      nodeRedLink: null,
      searchText: null,
      searchArea: null
    }
  },
  computed: {
    // solutions () {
    //   let solutionList = this.$store.getters.solutions
      // console.log('solutions: ', solutionList)
    //   return solutionList // this.items
    // },
  },
  watch: {
    solutions: function () {
      // this.testFlag = true
    },
    searchText: function () {
      this.searchFromNodeRed()
    }
  },
  mounted () {
    console.log('solutions mounted')
    eventBus.$on('pageRefresh', () => {
      console.log('refresh')
      this.updateSearchSetting()
      this.solutions = this.$store.getters.solutions
    })
  },
  created () {
    console.log('solutions created')
    this.solutions = this.$store.getters.solutions
    this.solutionsMap = new Map()
    this.updateSearchSetting()
  },
  beforeDestroy () {
    // Unsubscribe client connected
    // Unsubscribe client disconnected
  },
  methods: {
    updateSearchSetting () {
      if (this.$store.getters.searchText === null || this.$store.getters.searchText === '') {
        this.searchText = this.$store.getters.searchKeywords
      } else {
        this.searchText = this.$store.getters.searchText
      }
    },
    searchFromNodeRed () {
      let flowsQueryText = encodeURIComponent(this.searchText)
      // let flowsResponse = await fetch('https://flows.nodered.org/api/v1/search?term=' + flowsQueryText + 'sort=downloads&per_page=30', { mode: 'no-cors' })
      // let flowsJson = await flowsResponse.json()
      this.nodeRedLink = 'https://flows.nodered.org/?sort=downloads&term=' + flowsQueryText

      this.isSearchFromNodeRed = !(this.isSearchFromNodeRed)
    },
    refreshSolutions () {
      atHelper.reloadSolutions()
    },
    createSolution () {
      this.$router.push({ name: 'newsolution' })
    },
    showSolutionDetail (index) {
      this.$router.push({name: 'editSolution', params: { solutionIndex: index }})
    },
    deleteSolution (index) {
    },
    deploySolution (solution) {

    }
  }
}
</script>

<style>


.at-scroll {
  // height : 500px ;
  overflow-y: auto;
}

.at-card:hover {
  // background-color: red;
  // opacity: 0.5;
  box-shadow : 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
  // box-shadow: 1px -1px teal;
}

div.at-sidebar {
  // background-color : grey;
  border-bottom: 1px solid grey
}
</style>
