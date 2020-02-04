<template>
  <div>
    <div>
       <b-row align-v="center" class="at-bottombar">
          <b-col align="start">
            <h3>New IoT Device</h3>
          </b-col>
          <b-col sm="auto" align="end" >
            <b-button variant="success" @click="$router.go(-1)">Cancel</b-button>
            <b-button variant="success" @click="createThing()"
                  v-b-popover.hover.bottom="'Create new thing'">
                    Create
            </b-button>
          </b-col>
      </b-row>
      <b-modal ref="downloadModal" hide-footer>
              <div class="d-block text-center">
                <h4>Do you want to download the certificates and private key?</h4>
              </div>
              <b-btn class="mt-3" variant="outline-danger" block @click="downloadCert()">Yes</b-btn>
              <b-btn class="mt-3" variant="outline-danger" block @click="hideDownloadModal()">No</b-btn>
      </b-modal>
      <b-row align-v="center" class="mt-3">
        <b-col>
        </b-col>
        <b-col align-self="end">
          <b-alert variant="danger"
                dismissible
                :show="showDescCannotEmptyAlert"
                @dismissed="showDescCannotEmptyAlert=false">
                Device name or description cannot be empty.
          </b-alert>
        </b-col>
      </b-row>
    </div>
    <div class="mt-3">
      <p class="h4">Thing Name</p>
    </div>
    <div>
      <b-form-input class="at-border" v-model="thingNameTag" placeholder="thing's name"></b-form-input>
    </div>
    <b-row class="mt-3" align-v="center">
      <b-col><h5>Description</h5></b-col>
      <b-col v-if="isEditDesc">
          <small>Markdown script...</small>
      </b-col>
      <b-col align="end">
          <b-form-radio-group v-model="isEditDesc">
            <b-form-radio :value="false">Display</b-form-radio>
            <b-form-radio :value="true">Edit</b-form-radio>
          </b-form-radio-group>
      </b-col>
    </b-row>
    <b-row v-if="isEditDesc">
      <b-col> 
        <textarea class="at-desc-edit" v-model="thingDesc" placeholder="thing's description. (Can be a markdown text)"></textarea>
      </b-col>
    </b-row>
    <b-row v-else>
        <b-col>
          <vue-markdown class="at-desc-display">{{thingDesc}}</vue-markdown>
        </b-col>
    </b-row> 
    <div class="mt-3">
    </div>  
  </div>
</template>

<script>

import { API } from 'aws-amplify'
import atHelper from '../aiot-helper'

export default {
  name: 'device',
  props: ['description'],
  data: function () {
    return {
      activeMenu: 'app',
      response: 'unknown',
      thing: null,
      guess: 123,
      what: 0,
      loading: false,
      thingDesc: '',
      thingNameTag: '',
      showDescCannotEmptyAlert: false,
      isEditDesc: true
    }
  },
  computed: {},
  created () {
    console.log('new thing')
  },
  methods: {
    async createThing () {
      if (this.thingDesc === '' || this.thingNameTag === '') {
        this.showDescCannotEmptyAlert = true
        return
      }
      const userId = this.$store.getters.userId
      const desc = this.thingDesc
      const thingNameTag = this.thingNameTag
      if (userId !== null) {
        const body = { userId, desc, thingNameTag }
        const result = await API.post('thingApi', '/things', { body })
        console.log('result: ', result)
        this.thing = result
        this.showDownloadModal()
        // popup for save certificates and keys
      }
    },
    showDownloadModal () {
      this.$refs.downloadModal.show()
    },
    async hideDownloadModal () {
      this.$refs.downloadModal.hide()
      await this.returnSuccess()
    },
    async downloadCert () {
      this.$refs.downloadModal.hide()
      await atHelper.downloadCertKey(this.thing)
      await this.returnSuccess()
    },
    async returnSuccess () {
      await atHelper.reloadThings()
      this.$router.go(-1)
    }
  }
}
</script>

<style>
</style>
