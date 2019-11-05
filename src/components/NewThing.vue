<template>
  <b-container fluid>
    <div>
       <b-row align-v="center" style="border-bottom: 1px solid grey">
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
    <div class="mt-3">
      <p class="h4">Description</p>
    </div>
    <div style="height: 200px; background-color: rgba(255,0,0,0.1);">
      <textarea class="at-border w-100 h-100" v-model="thingDesc" placeholder="thing's description"></textarea>
    </div>
    <div class="mt-3">
  
    </div>  
  </b-container>
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
      showDescCannotEmptyAlert: false
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
      const userId = this.$store.getters.username
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
.at-border {
  border: 1px solid #a78;
  padding: 5px;
}
</style>
