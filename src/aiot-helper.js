/* eslint-disable */
/* global window, FB, document */

import { API } from 'aws-amplify'
import store from './store'
export default {
  async allowLoginIdentityUseIoT (identityId) {
    const body = { identityId }
    const result = await API.post('thingAllow', '/iot-allow', { body })
    console.log('allowLoginIdentityUseIoT: ', result)
  },
  async reloadThings () {
    const username = store.getters.username
    console.log('reloadThings: username: ', username)
    const result = await API.get('thingApi', '/things', {
          'queryStringParameters': {
               'userId': username
          }
    })
    store.commit('setThings', JSON.parse(result))
  },
  downloadFile: function (fileName, fileData) {
    // console.log('download File: ', fileName, ': ', fileData)
    let blob = new Blob([fileData], { type: 'text/plain' })
    let link = document.createElement('a')
    link.href = window.URL.createObjectURL(blob)
    link.download = fileName
    link.click()
  },
  downloadCertKey: function (thingData) {
    let thingId = thingData.ThingId
    // not required this.downloadFile('aiot-' + thingId + '-public.key', thingData.PublicKey)
    this.downloadFile('aiot-' + thingId + '-private.key', thingData.PrivateKey)
    this.downloadFile('aiot-' + thingId + '-certificate.crt', thingData.CertPem)
    // Server certificates allow your devices to verify that they're communicating with
    // AWS IoT and not another server impersonating AWS IoT
    this.downloadFile('aiot-root-CA.crt', thingData.RootCA)
  }
}

