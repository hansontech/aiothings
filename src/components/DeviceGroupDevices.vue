<template>
  <div>
    <b-modal id="modalReturnConfirm"
            hide-header
            ref="modalReturnConfirmRef"
            @ok="returnDiscardChangesOk"
            @cancel="returnCancel">
            <h5>Discard the changes and return?</h5>
    </b-modal>
    <b-row align-v="center" style="border-bottom: 1px solid grey; padding-bottom: 5px; margin-bottom: 5px;">
      <b-col sm="4" align="start">
        <h5 v-b-popover.hover.bottom="'Manage Device Group devices'">{{deviceGroupName}}</h5>
      </b-col>
      <b-col sm="4">
        <b-form-input class="at-border"
          type="text" 
          v-model="searchString"
          required
          placeholder="Search ...">
        </b-form-input>
      </b-col>  
      <b-col sm="4" align="end">
        <!-- <b-button v-if="!isShowEdit" v-b-popover.hover.bottom="'toggle to edit mode'" v-b-toggle.collapseEdit.collapseShow variant="info" @click="isChangedNotSaved = false">Edit</b-button>
        <b-button v-if="isShowEdit" v-b-popover.hover.bottom="'toggle to display only'" v-b-toggle.collapseEdit.collapseShow variant="info">Show</b-button> -->
        <b-button variant="light" @click="reloadDevices()"><i class="fas fa-sync" style='font-size:20px'></i></b-button>
        <b-button variant="info" class="ml-1" v-b-modal.scanDeviceModal @click="newDeviceId = null" v-b-popover.hover.bottom="'Add new device IDs to the group'">Add Device</b-button>
        <b-button variant="dark" class="ml-1" @click="backHome()"><i class="fas fa-arrow-left" /><sub><b-badge class="ml-1" variant="warning" v-if="isChangedNotSaved">:&nbsp;</b-badge></sub></b-button>
      </b-col>
    </b-row>
    <b-modal id="scanDeviceModal" ref="scanDeviceModalRef" title="Scan or Input Device ID" ok-only ok-variant="secondary" ok-title="Close">
      <qrcode-stream @decode="onQRCodeDecode" v-b-popover.hover="'URL format of https://../..?group='+deviceGroupName+'&id={Device ID}'"></qrcode-stream>       
        <form @submit.stop.prevent="handleNewDeviceSubmit">
          <b-row class="mt-2" align-v="center">
            <b-col sm="8">
              <b-form-input v-model="newDeviceId" type="text" placeholder="New device ID number"></b-form-input>
            </b-col>
            <b-col sm="4" @click="handleNewDeviceSubmit" align="end">
              <b-button>Add</b-button>
            </b-col>
          </b-row>
        </form>
    </b-modal>
    <b-modal id="modalDeleteDeviceConfirm"
          hide-header
          size="sm"
          @ok="deleteDevice(deletingDeviceGroupIndex)"
          >
      <div class="text-center">
        <h5>Delete this device?</h5>
      </div>            
    </b-modal>
    <b-row v-if="isLoading" class="mb-2">
      <b-col align="center">
        <spinner  size="medium" />
      </b-col>
    </b-row>
    <b-row class="mt-5" v-if="deviceGroup === null || deviceGroup.hasOwnProperty('Devices') === false || deviceGroup.Devices.length === 0">
      <b-col class="text-center" align-h="center">
          No device (id) is defined yet.
      </b-col>
    </b-row>
    <b-row class="mt-2" align-v="center" v-else>
      <b-col style="overflow-y: scroll; white-space: nowrap; display: inline-block; height:500px; width:90%">
        <b-row class="mt-1" v-for="(device, index) in filteredDevices" :key="index">
            <b-col>
              {{device.DeviceId}}
            </b-col>
            <b-col v-if="device.hasOwnProperty('ThingName')" align="end"> 
               <b-dropdown :text="device.ThingName" variant="light" v-b-popover.hover.bottom="'Binding Thing object'">
                <b-dropdown-item @click="deviceThingStatus(device)">Dashboard</b-dropdown-item>
                <b-dropdown-item @click="editDeviceThing(device)">Edit</b-dropdown-item>
              </b-dropdown>
            </b-col>
            <b-col align="end">
              <b-button size="sm" v-b-modal.modalDeleteDeviceConfirm @click="deletingDeviceIndex=devices.indexOf(device)">
                <i class="fas fa-trash-alt"></i>
              </b-button>
            </b-col>
        </b-row>
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
  props: ['deviceGroupIndex'],
  data: function () {
    return {
      newDeviceId: null,
      searchString: '',
      activeMenu: 'app',
      response: 'unknown',
      deviceGroup: null,
      newDevice: null,
      guess: 123,
      what: 0,
      loading: false,
      deviceGroupDesc: null,
      deviceGroupName: '',
      showDescCannotEmptyAlert: false,
      showCheckNameMessage: false,
      checkNameResultMessage: '',
      isEditDesc: true,
      isChangedNotSaved: false,
      isLoading: false,
      deletingDeviceIndex: -1,
      scanErrorMessage: null
    }
  },
  computed: {
    filteredDevices () {
      let foundDevices = this.deviceGroup.Devices.filter(device => {
        return device.DeviceId.toLowerCase().includes(this.searchString.toLowerCase())
      })
      foundDevices.sort(function (a, b) {
        return a.DeviceId.localeCompare(b.DeviceId)
      })
      return foundDevices
    }
  },
  watch: {
    deviceGroup: {
      handler: function (newThing) {
        this.$forceUpdate()
      },
      deep: true
    }
  },
  created () {
    console.log('new device group')
  },
  mounted () {
    let index = this.deviceGroupIndex
    this.deviceGroup = this.$store.getters.deviceGroups[index]
    this.deviceGroupDesc = this.deviceGroup.DeviceGroupDesc
    this.deviceGroupName = this.deviceGroup.DeviceGroupName
    if (this.deviceGroup.Devices === undefined) {
      this.reloadDevices()
    }
  },
  methods: {
    showScanMessage (append = false) {
      this.$bvToast.toast(this.scanErrorMessage, {
        title: 'Camera Scan',
        autoHideDelay: 5000,
        appendToast: append
      })
    },
    async createNewDevice () {
      if (this.newDeviceId === '' || this.newDeviceId === ' ') {
        return
      }
      this.isLoading = true
      const body = {
        deviceGroupName: this.deviceGroup.DeviceGroupName,
        deviceId: this.newDeviceId
      }
      const result = await API.post('thingApi', '/devices', { body })
      if (result.hasOwnProperty('error')) {
        console.log('createNewDevice: ', result.error)
      } else {
        if (this.deviceGroup.Devices === undefined) {
          this.deviceGroup.Devices = []
        }
        this.deviceGroup.Devices.unshift(result)
        this.newDeviceId = null
      }
      this.isLoading = false
    },
    async reloadDevices () {
      this.isLoading = true
      const result = await API.get('thingApi', '/devices', {
          'queryStringParameters': {
               'deviceGroupName': this.deviceGroup.DeviceGroupName
          }
      })
      console.log('result: ', result)
      if (result.hasOwnProperty('error')) {
        console.log('reloadDevice error: ', result.error)
      } else {
        this.deviceGroup.Devices = result
        this.$forceUpdate()
      }
      this.isLoading = false
    },
    onQRCodeDecode (decodedString) {
      console.log('d: ', decodedString)
      // let testString = 'http://www.aiothings.com/user/add-device?group=SBC700_group&id=A123456789'
      // let decodedString = testString
      let inputParameters = {}
      if (decodedString.startsWith('http')) {
        decodedString = decodedString.split('?')[1]
        if (decodedString === undefined) {
          return
        }
      }
      let vars = decodedString.split('&')
      for (var i = 0; i < vars.length; i++) {
          var pair = vars[i].split('=')
          inputParameters[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1])
      }
      console.log('inputs: ', inputParameters)
      this.scanErrorMessage = null
      if (inputParameters.group !== undefined) {
        if (inputParameters.group === this.deviceGroupName) {
          if (inputParameters.id !== undefined) {
            this.newDeviceId = inputParameters.id
          } else {
            this.scanErrorMessage = 'Cannot find Device Id'
          }
        } else {
          this.scanErrorMessage = 'Incorrect Device Group'
        }
      } else {
        // this.scanErrorMessage = 'Cannot find Device Group'
      }
      if (this.scanErrorMessage !== null) {
        this.showScanMessage(false)
      }
      // this.$refs.scanDeviceModalRef.hide()
    },
    handleNewDeviceSubmit () {
      if (this.newDeviceId === null || this.newDevice === '' || this.newDevice === ' ') {
        return
      }

      this.createNewDevice()
    },
    async loadDeviceThing (device) {
      if (device.Thing === undefined) {
        this.isLoading = true
        const result = await API.get('thingApi', '/things', {
              'queryStringParameters': {
                  'userId': device.OwnerId,
                  'certId': device.CertId,
                  briefOnly: true
              }
        })
        console.log('result: ', result)
        this.isLoading = false
        if (result.error !== undefined) {
          console.log('load device thing error: ', result.error)
        } else {
          device.Thing = result
        }
      }
    },
    async deviceThingStatus (device) {
      await this.loadDeviceThing(device)
      this.$router.push({name: 'thing_status', params: { thingBody: device.Thing, thingIndex: -1 }})
    },
    async editDeviceThing (device) {
      await this.loadDeviceThing(device)
      this.$router.push({name: 'edit_thing', params: { thingBody: device.Thing, thingIndex: -1 }})
    },
    async deleteDevice (index) {
      let device = this.deviceGroup.Devices[index]
      const result = await API.del('thingApi', '/devices', {
        'queryStringParameters': {
          'deviceGroupName': device.DeviceGroupName,
          'deviceId': device.DeviceId
        }
      })
      console.log(result)
      if (result.error !== undefined) {
        console.log(' delete device error: ', result.error)
      } else {
        this.deviceGroup.Devices.splice(index, 1)
        this.$forceUpdate()
      }
    },
    showDownloadModal () {
      this.$refs.downloadModal.show()
    },
    // --
     async downloadCert () {
      this.isLoading = true
      // let getThingDetails = '/things?userId=' + userId + '?certId=' + this.thing.certId
      console.log('device group: ', this.deviceGroup)
      if (this.deviceGroup.hasOwnProperty('Thing') === false) {
        const result = await API.get('thingApi', '/device-groups', {
              'queryStringParameters': {
                  'userId': this.deviceGroup.OwnerId,
                  'deviceGroupName': this.deviceGroup.DeviceGroupName
              }
        })
        console.log('result: ', result)
        if (result.hasOwnProperty('error')) {
          console.log('get device group detail error: ', result.error)
        } else {
          this.deviceGroup = result
          console.log('device group detail: ', this.deviceGroup)
        }
      }
      await atHelper.downloadCertKey(this.deviceGroup.Thing)
      this.isLoading = false
    },
    returnDiscardChangesOk (evt) {
      // Prevent modal from closing
      // evt.preventDefault()
      this.$refs.modalReturnConfirmRef.hide()
      this.$router.go(-1)
    },
    returnCancel () {
      this.$refs.modalReturnConfirmRef.hide()
    },
    backHome () {
      console.log('quit: ', this.isChangedNotSaved)
      if (this.isChangedNotSaved === true) {
        this.$refs.modalReturnConfirmRef.show()
      } else {
        this.$router.go(-1)
      }
    }
  }
}
</script>

<style>
</style>
