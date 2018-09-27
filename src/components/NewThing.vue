<template>
  <b-container fluid>
    <div>
       <b-row align-v="center" style="border-bottom: 1px solid grey">
          <b-col cols="7" class="mt-2">
            <h2>New IoT Device</h2>
          </b-col>
          <b-col cols="5" align="end" >
            <b-button variant="success" @click="$router.go(-1)">Cancel</b-button>
            <b-button variant="success" @click="createThing()"
                  v-b-popover.hover="'Create new thing'">
                    Create
            </b-button>
            <b-modal ref="downloadModal" hide-footer title="Using Component Methods">
              <div class="d-block text-center">
                <h3>Do you want to download the certificates and private key?</h3>
              </div>
              <b-btn class="mt-3" variant="outline-danger" block @click="download()">Yes</b-btn>
              <b-btn class="mt-3" variant="outline-danger" block @click="hideDownloadModal()">No</b-btn>
            </b-modal>
          </b-col>
      </b-row>
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
      <b-form-input v-model="thingNameTag" placeholder="thing's name"></b-form-input>
    </div>
    <div class="mt-3">
      <p class="h4">Description</p>
    </div>
    <div style="height: 200px; background-color: rgba(255,0,0,0.1);">
      <textarea class="w-100 h-100" v-model="thingDesc" placeholder="thing's description"></textarea>
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
        // TODO popup for save certificates and keys
      }
    },
    showDownloadModal () {
      this.$refs.downloadModal.show()
    },
    hideDownloadModal () {
      this.$refs.downloadModal.hide()
      this.returnSuccess()
    },
    download () {
      this.hideDownloadModal()
      atHelper.downloadCertKey(this.thing)
      this.returnSuccess()
    },
    returnSuccess () {
      atHelper.reloadThings()
      this.$router.go(-1)
    }
  }
}
</script>
