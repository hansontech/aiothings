<template>
  <div>
    <div>
      <b-modal id="modalReturnConfirm"
             hide-header
             ref="modalReturnConfirmRef"
             @ok="returnDiscardChangesOk"
             @cancel="returnCancel">
             <h5>Discard the changes and return?</h5>
      </b-modal>
      <b-row align-v="center" style="border-bottom: 1px solid grey; padding-bottom: 5px; margin-bottom: 5px;">
        <b-col align="start">
            <h4>Device Group: {{deviceGroupName}}</h4>
        </b-col>
        <b-col sm="auto" align="end">
          <!-- <b-button v-if="!isShowEdit" v-b-popover.hover.bottom="'toggle to edit mode'" v-b-toggle.collapseEdit.collapseShow variant="info" @click="isChangedNotSaved = false">Edit</b-button>
          <b-button v-if="isShowEdit" v-b-popover.hover.bottom="'toggle to display only'" v-b-toggle.collapseEdit.collapseShow variant="info">Show</b-button> -->
          <b-button variant="info" @click="updateDeviceGroup()" v-b-popover.hover.left="'Update the Device Group'">Update</b-button>
          <b-button variant="dark" class="ml-1" @click="backHome()"><i class="fas fa-arrow-left" /><sub><b-badge class="ml-1" variant="warning" v-if="isChangedNotSaved">:&nbsp;</b-badge></sub></b-button>
        </b-col>
      </b-row>
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
          <textarea class="at-desc-edit" v-model="deviceGroupDesc" placeholder="thing's description. (Can be a markdown text)"></textarea>
        </b-col>
      </b-row>
      <b-row v-else>
        <b-col>
          <markdown-it-vue class="at-desc-display" :content="deviceGroupDesc" />
        </b-col>
      </b-row> 
      <b-modal id="modalCertificateHelpConfirm"
              title="Certificates"
              hide-footer
              size="sm"
              >
                <b-row><b-col>Zipped configuration and certificate files for the Device Group devices.</b-col></b-row>
                <b-row><b-col><span class="text-danger">config.json</span></b-col></b-row><b-row><b-col>Config file used by the Device Group devices to connect to AIoThings. <br /></b-col></b-row>
                <b-row><b-col><span class="text-danger">certificate.crt</span></b-col></b-row><b-row><b-col> Group certificate of the DeviceGgroup devices. <br /></b-col></b-row>
                <b-row><b-col><span class="text-danger">private.key</span></b-col></b-row><b-row><b-col>Private key of the Device Group devices. <br /></b-col></b-row>
                <b-row><b-col><span class="text-danger">root-CA.crt</span></b-col></b-row><b-row><b-col>Issued by CA (Certificate Authority).<br /></b-col></b-row>
      </b-modal>
      <b-row  align-v="center" class="mt-3">
        <b-col sm="4">
            <h5 style="display: inline;">Config, Certificate & key</h5>
            <b-button variant="light" small v-b-modal.modalCertificateHelpConfirm><i class="fas fa-info-circle"></i></b-button>
        </b-col>
        <b-col sm="8">
            <b-button style="display: inline;" id="downloadButton" variant="info" v-b-popover.hover.bottom="'Group certificates and configuration for the factory setting of Device Group devices'" @click="downloadCert()" :disabled="$store.getters.isGuestLoggedin">Download</b-button>
        </b-col>
      </b-row>
      <b-modal id="modalBspHelp"
              title="BSP"
              hide-footer
              size="sm"
              >
          <b-row>
            <b-col>
              Board support package is the software package that will be installed in IoT devices to communicate with AIoThings cloud.
              <br>It includes <bold>readme</bold> file to describe how the installation can be completed.
            </b-col>
          </b-row>
        </b-modal>
      <b-row class = "mt-3">
        <b-col sm="4">
          <h5 style="display: inline;">Board support package</h5>
          <b-button variant="light" small v-b-modal.modalBspHelp><i class="fas fa-info-circle"></i></b-button>
        </b-col>
        <b-col sm="5" v-if="deviceGroup !== null && deviceGroup.BspFileName !== undefined && deviceGroup.BspFileName !== ' ' && isLoading === false">
          <b-button style="display: inline;" id="downloadbspFileButton" variant="info" @click="downloadBspFile()" :disabled="$store.getters.isGuestLoggedin">Download</b-button>
          &ensp;
          {{deviceGroup.BspFileName}}
        </b-col>
        <b-col align="start">
            <b-button variant="info" class="ml-1" v-b-toggle.collapseUploadBSP v-b-popover.hover.left="'Upgload new BSP'">Upload</b-button>
        </b-col>
      </b-row>
      <b-row v-if="isLoading === true" class="mt-3">
        <b-col align="center">
          <spinner size="medium" />
        </b-col>
      </b-row>
      <b-collapse id="collapseUploadBSP" class="mt-3">
        <b-row>
          <b-col sm="4">
          </b-col>
          <b-col sm="5">
            <b-form-file
              v-model="bspFile"
              :state="Boolean(bspFile)"
              placeholder="Choose a file to upload"
              drop-placeholder="Drop file here..."
            ></b-form-file>
            <!-- accept=".zip" -->
            <!-- <div class="mt-3">Selected zip file: {{ bspFile ? bspFile.name : '' }}</div> -->
          </b-col>
        </b-row>
      </b-collapse>
      <b-row class="mt-2" align-v="center">
        <b-col sm="4">
          <h5 style="display: inline;">Firmware</h5>
        </b-col>
        <b-col sm="5">
            {{(deviceGroup !== null && deviceGroup.Firmware !== undefined && typeof deviceGroup.Firmware === 'object' && deviceGroup.Firmware.FileName !== undefined) ? 'Installed: ' + deviceGroup.Firmware.FileName + ',  ' + (new Date(deviceGroup.Firmware.DateStamp)).toLocaleString() : '-- -- --' }}
        </b-col>
        <b-col align="start">
            <b-button variant="info" class="ml-1" v-b-toggle.collapseUploadFirmware v-b-popover.hover.left="'Update firmware to installed devices'">Update</b-button>
        </b-col>
      </b-row>
      <b-row class="mt-2" align-v="center">
        <b-col sm="4">
        </b-col>
        <b-col>
            {{(deviceGroup !== null && deviceGroup.Firmware !== undefined && typeof deviceGroup.Firmware === 'object' && deviceGroup.Firmware.Processing !== undefined) ? 'Progressing: ' + deviceGroup.Firmware.Processing.FileName + ',  ' + (new Date(deviceGroup.Firmware.Processing.DateStamp)).toLocaleString() : '' }}
        </b-col>
      </b-row>
      <b-row v-if="isFirmwareUpdating === true" class="mt-3">
        <b-col align="center">
          <spinner size="medium" />
        </b-col>
      </b-row>
      <b-collapse id="collapseUploadFirmware" class="mt-2">
        <b-row align-v="center">
          <b-col sm="4" />
          <b-col sm="5">
              <b-form-file
                v-model="firmwareFile"
                :state="Boolean(firmwareFile)"
                placeholder="New firmware ..."
                drop-placeholder="Drop file here..."
              ></b-form-file>
          </b-col>
          <b-col>
            <b-button variant="success" class="ml-1" v-b-toggle.collapseUploadFirmware @click="uploadFirmwareFile(firmwareFile)">Confirm</b-button>
          </b-col>
        </b-row>
      </b-collapse>
      <b-modal id="modalRegUrlHelp"
              title="User URL"
              hide-footer
              size="sm"
              >
          <b-row>
            <b-col>
              Device users need to register their IoT devices first before using the devices.
              <br>By entering the URL manually, or scanning QR code from the IoT devices, users will be asked to enter the device names and descriptions.
              <br>After the registration process, Thing Objects will be created to the IoT devices for users to access from AIoThings user interface.
            </b-col>
          </b-row>
      </b-modal>
      <b-row  align-v="center" class="mt-3">
        <b-col sm="4">
          <h5 style="display: inline;">Registration URL</h5>
          <b-button variant="light" small v-b-modal.modalRegUrlHelp><i class="fas fa-info-circle"></i></b-button>
       </b-col>
        <b-col sm="8" v-if="deviceGroup !== null">
           www.aiothings.com/user/mythings/add_device?group={{deviceGroup.DeviceGroupName}}&id={Device ID}
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
    </div>
  </div>
</template>

<script>

import { API, Storage } from 'aws-amplify'
import atHelper from '../aiot-helper'

export default {
  name: 'device',
  props: ['deviceGroupIndex'],
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
      deviceGroupDesc: null,
      firmwareFile: null,
      deviceGroupName: '',
      showDescCannotEmptyAlert: false,
      showCheckNameMessage: false,
      checkNameResultMessage: '',
      isEditDesc: true,
      isChangedNotSaved: false,
      isFirmwareUpdating: false,
      isLoading: false,
      bspFile: null
    }
  },
  watch: {
    deviceGroupDesc: function (newDesc, oldDesc) {
        if (newDesc !== oldDesc && this.isChangedNotSaved !== null && oldDesc !== null) {
        this.isChangedNotSaved = true
      }
    },
    bspFile: function (newValue, oldValue) {
      if (newValue !== oldValue && (newValue !== '' && newValue !== null)) {
        this.uploadBspFile(newValue)
      }
    }
  },
  created () {
    console.log('new device group')
  },
  mounted () {
    let index = this.deviceGroupIndex
    this.deviceGroup = this.$store.getters.deviceGroups[index]
    console.log('deviceGroup: ', this.deviceGroup)
    this.deviceGroupDesc = this.deviceGroup.DeviceGroupDesc
    this.deviceGroupName = this.deviceGroup.DeviceGroupName
  },
  methods: {
    uploadBspFile (file) {
      console.log('uplaodBspFile: ', file)
      let reader = new window.FileReader() // if window is not used it says File READER is not defined
      let that = this
      reader.onload = function (event) {
         // dispatch fileAttached to state UI postEditor with event.target.result as read dataURL
        let content = event.target.result
        // still save to project bucket Storage.configure({level: 'public', bucket: this.ggS3BucketName})
        let fileName = that.deviceGroupName + '_' + file.name
        Storage.put(fileName, content, {
            contentType: 'application/zip'
        })
        .then(result => {
          // console.log(result)
          // s3://bucket/key
          that.deviceGroup.BspFileName = file.name
          that.isChangedNotSaved = true
          that.$root.$emit('bv::toggle::collapse', 'collapseUploadBSP')
          that.$forceUpdate()
        })
        .catch(err => {
          console.log(err)
          that.bspFile = null // means not successful
        })
        // console.log('content: ', content)
      }
      // https://developer.mozilla.org/en-US/docs/Web/API/FileReader
      /*
      .readAsDataURL() return a URL representing the file's data as a base64 encoded string
      .readAsArrayBuffer() return an ArrayBuffer representing the file's data
      .readAsText() return the file's data as a text string.
      */
      reader.readAsArrayBuffer(file)
    },
    async downloadBspFile () {
      if (this.deviceGroup.BspFileName === undefined || this.deviceGroup.BspFileName === '' || this.deviceGroup.BspFileName === ' ') {
        return
      }
      this.isLoading = true
      let that = this
      let fileName = that.deviceGroupName + '_' + this.deviceGroup.BspFileName
      try {
        let result = await Storage.get(fileName)
        await atHelper.downloadBinaryFile(fileName, result)
        that.isLoading = false
      } catch (err) {
        console.log(err)
        that.isLoading = false
      }
    },
    uploadFirmwareFile (file) {
      console.log('file: ', file)
      if (file === null) return
      this.firmwareFile = null
      this.isFirmwareUpdating = true
      let reader = new window.FileReader() // if window is not used it says File READER is not defined
      let userId = this.deviceGroup.OwnerId
      let that = this
      reader.onload = function (event) {
        // dispatch fileAttached to state UI postEditor with event.target.result as read dataURL
        let content = event.target.result
        // still save to project bucket Storage.configure({level: 'public', bucket: this.ggS3BucketName})
        let currentTime = (new Date()).getTime()
        let fileName = userId + '_' + file.name + '_' + currentTime
        Storage.put(fileName, content, {
            contentType: 'binary/octet-stream'
        })
        .then(async (result) => {
          console.log(result, fileName)
          // s3://bucket/key
          let newFirmware = {
            FileName: file.name,
            DateStamp: currentTime,
            StorageKey: fileName
          }
          if ((that.deviceGroup.Firmware === undefined) || (typeof that.deviceGroup.Firmware !== 'object')) {
            that.deviceGroup.Firmware = {}
          }
          that.deviceGroup.Firmware.Desired = newFirmware
          await that.updateDeviceGroup()
          that.isFirmwareUpdating = false
          that.isChangedNotSaved = false
          // for some reason, need programatically close the collapse
          // https://github.com/bootstrap-vue/bootstrap-vue/tree/dev/src/components/collapse#v-model-support
          that.$root.$emit('bv::toggle::collapse', 'collapseUploadFirmware')
          that.$forceUpdate()
        })
        .catch(err => {
          console.log(err)
          that.isFirmwareUpdating = false
          that.isChangedNotSaved = false
        })
        // console.log('content: ', content)
      }
      // https://developer.mozilla.org/en-US/docs/Web/API/FileReader
      /*
      .readAsDataURL() return a URL representing the file's data as a base64 encoded string
      .readAsArrayBuffer() return an ArrayBuffer representing the file's data
      .readAsText() return the file's data as a text string.
      */
      reader.readAsArrayBuffer(file)
    },
    async updateDeviceGroup () {
      // if (this.isChangedNotSaved) {
        this.deviceGroup.DeviceGroupDesc = this.deviceGroupDesc
        let deviceGroupToUpdate = this.$_.omit(this.deviceGroup, ['Thing', 'Devices'])
        if (deviceGroupToUpdate.BspFileName !== null) {
          if (deviceGroupToUpdate.BspFileName === '' || deviceGroupToUpdate.BspFileName === ' ') {
            delete deviceGroupToUpdate['BspFileName']
          }
        }
        console.log('updateDeviceGroup: ', deviceGroupToUpdate)
        const body = { deviceGroup: deviceGroupToUpdate }
        const result = await API.put('thingApi', '/device-groups', { body })
        if (result.hasOwnProperty('error')) {
          console.log('error: ', result.error)
        } else {
          console.log('new deviceGroup result: ', result)
          this.deviceGroup = result
          this.$store.dispatch('replaceDeviceGroup', this.deviceGroup)
        }
        this.isChangedNotSaved = false
        this.$forceUpdate()
      // }
    },
    handleNewDeviceSubmit () {
      if (this.newDevice === null || this.newDevice === '') {
        return
      }
      this.devices.push(this.newDevice)
    },
    deletePath (index) {
      this.devices.splice(index, 1)
    },
    showDownloadModal () {
      this.$refs.downloadModal.show()
    },
    // --
     async downloadCert () {
      this.isLoading = true
      // let getThingDetails = '/things?userId=' + userId + '?certId=' + this.thing.certId
      console.log('thing: ', this.deviceGroup)
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
      await atHelper.exportDeviceGroupCert(this.deviceGroup)
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
