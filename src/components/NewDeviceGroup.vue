<template>
  <div>
    <div>
       <b-row align-v="center" class="at-bottombar">
          <b-col align="start">
            <h3>New IoT Device</h3>
          </b-col>
          <b-col sm="auto" align="end" >
            <b-button variant="success" @click="$router.go(-1)">Cancel</b-button>
            <b-button variant="success" @click="createDeviceGroup()"
                  v-b-popover.hover.bottom="'Create new device group'">
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
      <p class="h4">Device Group Name</p>
    </div>
    <b-row>
      <b-col md align="start">
        <b-form-input class="at-border" v-model="deviceGroupName" placeholder="device group's name"></b-form-input>
      </b-col>      
      <b-col md="auto" align="end">
        <b-button variant="secondary" v-b-popover.hover.bottomleft="'Check if the name is available to use'" @click="checkDeviceGroupName()">Check name</b-button>
      </b-col>
    </b-row>
    <b-collapse v-model="showCheckNameMessage" id="collapse1" class="mt-2">
    <b-card>
      <b-row>
        <b-col>
          {{checkNameResultMessage}} 
        </b-col>
        <b-col align="end">
          <b-button variant="primary" 
            :class="showCheckNameMessage ? 'collapsed' : null"
            :aria-expanded="showCheckNameMessage ? 'true' : 'false'"
            aria-controls="collapse1"
            @click="showCheckNameMessage = !showCheckNameMessage" size="sm">Confirm</b-button>
        </b-col>
      </b-row>
    </b-card>
  </b-collapse>
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
        <textarea class="at-desc-edit" v-model="deviceGroupDesc" placeholder="device group's description. (Can be a markdown text)"></textarea>
      </b-col>
    </b-row>
    <b-row v-else>
        <b-col>
          <vue-markdown class="at-desc-display">{{deviceGroupDesc}}</vue-markdown>
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
      deviceGroup: null,
      devices: [],
      newDevice: null,
      guess: 123,
      what: 0,
      loading: false,
      deviceGroupDesc: '',
      deviceGroupName: '',
      showDescCannotEmptyAlert: false,
      showCheckNameMessage: false,
      checkNameResultMessage: '',
      isEditDesc: true
    }
  },
  computed: {},
  created () {
    console.log('new device group')
  },
  methods: {
    handleNewDeviceSubmit () {
      if (this.newDevice === null || this.newDevice === '') {
        return
      }
      this.devices.push(this.newDevice)
    },
    deletePath (index) {
      this.devices.splice(index, 1)
    },
    async checkDeviceGroupName () {
      console.log('checkDeviceGroupName')
      // this.showCollapse = !this.showCollapse
      if (this.deviceGroupName === null || this.deviceGroupName === '') {
        return
      }
      if (this.showCheckNameMessage) {
        this.showCheckNameMessage = false
        return
      }
      const result = await API.get('thingApi', '/device-groups', {
          'queryStringParameters': {
            'deviceGroupName': this.deviceGroupName
          }
      })
      // return success : 'used' or 'new'
      if (result.hasOwnProperty('error') === false) {
        this.checkNameResultMessage = 'This name has been used by another device group.'
      } else {
        this.checkNameResultMessage = 'This device group name is available to use.'
      }
      this.showCheckNameMessage = true
    },
    async createDeviceGroup () {
      if (this.deviceGroupDesc === '' || this.deviceGroupName === '') {
        this.showDescCannotEmptyAlert = true
        return
      }
      const userId = this.$store.getters.userId
      const desc = this.deviceGroupDesc
      const deviceGroupName = this.deviceGroupName
      if (userId !== null) {
        const body = { userId, desc, deviceGroupName }
        const result = await API.post('thingApi', '/device-groups', { body })
        console.log('result: ', result)
        this.deviceGroup = result
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
      await atHelper.downloadCertKey(this.deviceGroup.Thing)
      await this.returnSuccess()
    },
    async returnSuccess () {
      await atHelper.reloadDeviceGroups()
      this.$router.go(-1)
    }
  }
}
</script>

<style>
</style>
