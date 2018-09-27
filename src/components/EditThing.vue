<template>
  <b-container fluid>
    <div v-bind:titleString="changeTitle()">
      <b-row align-v="center">
        <b-col align="end" class="mt-2">
          <b-button v-if="!isShowEdit" v-b-toggle.collapseEdit.collapseShow variant="primary" @click="isChangedNotSaved = false">Edit</b-button>
          <b-button v-if="isShowEdit" v-b-toggle.collapseEdit.collapseShow variant="primary">Show</b-button>
          <b-button v-if="isChangedNotSaved" variant="success" @click="updateThing()">Update thing</b-button>
          <b-button variant="secondary" @click="backHome()">Return</b-button>
          <b-modal id="modalReturnConfirm"
             ref="modalReturnConfirmRef"
             title="Discard changes and return?" 
             @ok="returnDiscardChangesOk"
             @cancel="returnCancel">
          </b-modal>
        </b-col>
      </b-row>
      <b-row align-v="center" class="mb-3" style="border-bottom: 1px solid grey">
        <p> </p>
      </b-row>
      <b-row align-v="center" class="mt-3">
        <h4 class="mr-4">Thing Name:</h4> <p>{{thing.ThingId}} </p>
      </b-row>
      <b-row class="mt-3">
        <h4>Description: </h4>
      </b-row>
      <b-row>
        <!-- elements to collapse -->
        <b-collapse visible id="collapseShow" class="mt-2">
          <b-card class="text-left">
            {{thingDesc}}
          </b-card>
        </b-collapse>        
      </b-row>
      <b-row>
        <!-- <b-collapse id="collapseEdit" class="mt-2"> -->
          <b-collapse v-model="isShowEdit" id="collapseEdit" class="mt-2" style="width:90%; height: 200px; background-color: rgba(255,0,0,0.1);">
            <textarea class="w-100 h-100" v-model="thingDesc" placeholder="Please input for description"></textarea>
          </b-collapse>
        <!-- </b-collapse> -->
      </b-row>
      <b-row  class="mt-3">
          <h4 class="mr-2"> Certificates and key</h4>
          <b-button id="downloadButton" variant="success" @click="downloadCert()">Download</b-button>
          <b-popover target="downloadButton" triggers="hover focus">
           <template slot="title">Downloads three files</template>
            <span class="text-danger">certificate.crt</span>: the certificate for AIOT to certify this device. <br />
            <span class="text-danger">private.key</span>: the private key the device will use it for it's identity. <br />
            <span class="text-danger">root-CA.crt</span>: the certificate issued by a CA (Certificate Authority) to certify AIOT. <br />
        </b-popover>
      </b-row>
      <b-row  class="mt-3">
          <b-card class="text-left mr-3">
            <strong>MQTT client settings:</strong> <br />
            <span class="text-primary">MQTT broker</span>: iot.aiothings.com <br />
            <span class="text-primary">Certificates and keys></span> set to files downloaded <br />
            <span class="text-primary">Username/password</span>: please leave blank. <br />
            <span class="text-primary">Client Id</span>: an unique name or leave blank. <br />
            <span class="text-primary">QoS</span>: set to 1 or higher <br />
            <span class="text-primary">MQTT port</span>: 8883 (or 443) <br />
          </b-card>
      </b-row>
    </div>
  </b-container>
 </template>

<script>

import { API } from 'aws-amplify'
import atHelper from '../aiot-helper'

export default {
  name: 'device',
  props: ['thingIndex'], // VUE reference https://router.vuejs.org/guide/essentials/passing-props.html
  data: function () {
    return {
      thing: null,
      isChangedNotSaved: null,
      loading: false,
      thingDesc: '',
      isShowEdit: false
    }
  },
  computed: {
  },
  created () {
    let index = this.thingIndex
    this.thing = this.$store.getters.things[index]
    this.thingDesc = this.thing.ThingDesc
    console.log('edit thing: ', this.thing)
  },
  beforeDestroy () {
  },
  watch: {
    thingDesc: function (newDesc, oldDesc) {
      if (newDesc !== oldDesc && this.isChangedNotSaved !== null) {
        this.isChangedNotSaved = true
      }
    }
  },
  methods: {
    changeTitle () {
      // console.log('isShowEdit: ', this.isShowEdit)
      if (this.isShowEdit) {
        return 'Edit'
      } else {
        return 'Show'
      }
    },
    async updateThing () {
      if (this.isChangedNotSaved) {
        this.thing.ThingDesc = this.thingDesc
        const userId = this.$store.getters.username
        const certId = this.thing.CertId
        const desc = this.thing.ThingDesc
        const body = { userId, certId, desc }
        const result = await API.post('thingApi', '/things', { body })
        console.log('updateThing: result: ', result)
        this.isChangedNotSaved = false
      }
    },
    async downloadCert () {
      // let getThingDetails = '/things?userId=' + userId + '?certId=' + this.thing.certId
      const result = await API.get('thingApi', '/things', {
            'queryStringParameters': {
                'userId': this.thing.UserId,
                'certId': this.thing.CertId
            }
      })
      console.log('result: ', result)
      let resultJson = result
      console.log('result: ', resultJson)
      atHelper.downloadCertKey(resultJson)
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
      console.log('quit')
      if (this.isChangedNotSaved === true) {
        console.log('real quit')
        this.$refs.modalReturnConfirmRef.show()
      } else {
        this.$router.go(-1)
      }
    }
  }
}
</script>
