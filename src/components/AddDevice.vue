<template>
  <div>
      <b-row align-v="center" class="at-bottombar h5" variant="secondary">
          <b-col align="start">
            Create Thing from Device
          </b-col>
          <b-col align="start">
          ({{deviceGroupName}} - {{deviceId}})
          </b-col>
      </b-row>
      <b-row v-if="isLoading" class="mb-2">
        <b-col align="center">
          <spinner  size="medium" />
        </b-col>
      </b-row>
      <b-modal ref="completeModal" hide-header ok-only @ok="returnSuccess()" >
        {{completeMessage}}
      </b-modal>
      <b-row v-if="isCreatingThing" class="ml-2 mr-2">
        <b-col>
          <at-new-thing :deviceGroupName="deviceGroupName" :deviceId="deviceId" v-on:thingCreated="onDeviceThingCreated"/>
        </b-col>
      </b-row>
    <div class="mt-3">
    </div>  
  </div>
</template>

<script>

import { API } from 'aws-amplify'

export default {
  name: 'device',
  props: ['description'],
  data: function () {
    return {
      deviceGroupName: null,
      deviceId: null,
      device: null,
      isLoading: false,
      completeMessage: null,
      isCreatingThing: false
    }
  },
  computed: {},
  created () {
    // https://router.vuejs.org/guide/essentials/dynamic-matching.html
    console.log('add device: ', this.$route.query)
  },
  async mounted () {
    let query = this.$route.query
    if (query.group === undefined || query.id === undefined) {
      // TODO show error message and timeout to IoT page
    } else {
      this.deviceGroupName = query.group
      this.deviceId = query.id
      if (await this.checkDeviceStatus() === false) {
        this.$router.replace({name: 'mythings'})
      }
    }
  },
  methods: {
    async checkDeviceStatus () {
        this.isLoading = true
        const result = await API.get('thingApi', '/devices', {
              'queryStringParameters': {
                  'deviceGroupName': this.deviceGroupName,
                  'deviceId': this.deviceId
              }
        })
        this.isLoading = false
        console.log('result: ', result)
        if (result.hasOwnProperty('error')) {
          console.log('get device detail error: ', result.error)
          return false
        } else {
          this.device = result
          console.log('device  detail: ', this.device)
        }
        if (this.device.ThingId !== undefined) {
          // -- TODO check if the thing id is exist
          // -- if not exist, then remove this ThingId field
          return false
        }
        if (this.device.ThingId === undefined) {
          // catch the thing id from the routine, and update the device's DB field thing id
          // TODO launch create thing routine
          this.isCreatingThing = true
          // const deviceGroupName = this.deviceGroupName
          // const deviceId = this.deviceId
          // this.$router.push({ name: 'newthing', params: { deviceGroupName, deviceId } })
          // this on handler must be a separate function instead of an instant function parameter
          // otherwise, it cannot access the local variables such as this.xxx
        }
        return true
    },
    async onDeviceThingCreated ({deviceGroupName, deviceId, thing}) {
      console.log('onDeviceThingCreated: ', deviceGroupName, deviceId, thing)
      if (this.deviceGroupName === deviceGroupName && this.deviceId === deviceId && thing !== null) {
        this.device.ThingId = thing.ThingId
        this.device.ThingName = thing.ThingName
        this.device.CertId = thing.CertId
        this.device.OwnerId = thing.UserId
        const body = { device: this.device }
        const result = await API.put('thingApi', '/devices', { body })
        console.log('updated device: ', result)
        if (result.hasOwnProperty('error')) {
          console.log('error: ', result.error)
          this.completeMessage = result.error
        } else {
          this.completeMessage = 'Thing is created successfully from device.'
        }
      } else {
        this.completeMessage = 'Thing creation from Device ID has been canceled.'
      }
      this.isCreatingThing = false
      this.$refs.completeModal.show()
    },
    async returnSuccess () {
      this.$router.replace({name: 'mythings'})
    }
  }
}
</script>

<style>
</style>
