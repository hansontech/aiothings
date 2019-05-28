/* eslint-disable */
/* global window, FB, document */

import { API, Storage } from 'aws-amplify'
import JSZip from 'jszip'
import FileSaver from 'file-saver'
import store from './store'
import config from './config'

export default {
  async exportService (ms, isLoadCode) {
    // name
    // desc
    // code
    // input message topic
    // output message topic
    console.log('exportService: ', ms, ':', isLoadCode)
    let sourceCode = ms.ServiceCode
    if (isLoadCode === false) {
      // DO NOTHING
    } else {
      console.log('load code')
      sourceCode = await this.loadSourceFromS3(ms.ServiceCode)
    }
    let fileNameExtension = ''
    if (ms.ServiceRuntime === 'nodejs') {
      fileNameExtension = '.js'
    } else {
      fileNameExtension = '.py'
    }
    let serviceData = ''
    let serviceFileName = ms.ServiceName + fileNameExtension
    serviceData += ('// Name: ' + ms.ServiceName + '\n')
    serviceData += ('/*\n' + ms.ServiceDesc + '\n*/\n')
    serviceData += ('// Input Message Topic: ' + ms.InputMessageTopic + '\n')
    serviceData += ('// Output Message Topic:' + ms.OutputMessageTopic + '\n')
    serviceData += (sourceCode + '\n')
    this.downloadFile(serviceFileName, serviceData)
  },
  async loadSourceFromS3 (s3filename) {
    Storage.configure({level: 'public', bucket: config.awsMserviceBucket})
    console.log('loadSourceFromS3')
    let s3url = await Storage.get(s3filename)
    let dataResponse = await fetch(s3url)
    // https://css-tricks.com/using-fetch/
    let dataText = await dataResponse.text()
    console.log('loadSourceFromS3: ', dataText)
    return dataText
  },
  async deleteFavorite (serviceName) {
    const userId = store.getters.username
    const result = await API.del('mserviceApi', '/favorites', {
        'queryStringParameters': {
          'userId': userId,
          'serviceName': serviceName
        }
    })
    console.log(result)
    store.dispatch('removeFavorite', serviceName)
  },
  async reloadFavoriteServices () { // { ms1, ms2, ms3 }
    const userId = store.getters.username
    const result = await API.get('mserviceApi', '/favorite-mservices', {
      'queryStringParameters': {
        'userId': userId
      }
    })
    console.log(result)
    let favoriteMservices = JSON.parse(result)
    store.commit('setFavoriteMservices', favoriteMservices)
  },
  async reloadFavoriteServiceList () { // { 'ms1 name' : true, 'ms2 name' : true, ... }
    const userId = store.getters.username
    if (userId === null) {
      userId = ' '
    }
    const result = await API.get('mserviceApi', '/favorites', {
      'queryStringParameters': {
        'userId': userId
      }
    })
    // console.log('reloadFavoriteServiceList: ', result)
    let favoriteList = JSON.parse(result)
    let favoriteMservices = {}
    for (let favorite of favoriteList) {
      favoriteMservices[favorite.ServiceName] = true
    }
    await store.commit('setFavoriteMserviceList', favoriteMservices)
  },
  async loadUser (userId) {
    console.log('loadUser: ', userId)
    let loadedUsers = await store.getters.atusers
    console.log('atusers: ', loadedUsers)
    if (loadedUsers !== null && (typeof loadedUsers[userId] !== 'undefined')) {
      console.log('found existing user')
      return loadedUsers[userId]
    }
    const result = await API.get('userApi', '/users', {
        'queryStringParameters': {
          userId: userId
        }
    })
    // array as data should apply stringfy
    let users = JSON.parse(result)
    for (let user of users) {
      console.log('user: ', user.Username)
      const username = user.Username
      let userData = {}
      for (let attrs of user.Attributes) {
          let userAttrName = attrs.Name
          userData[userAttrName] = attrs.Value
      }
      userData['UserCreateDate'] = user.UserCreateDate
      userData['UserLastModifiedDate'] = user.UserLastModifiedDate
      if (loadedUsers === null) {
          loadedUsers = {}
      }
      loadedUsers[username] = userData
      store.commit('setAtusers', loadedUsers)
    }
    return loadedUsers[userId]
  },
  async checkMserviceNameIsUsed (msName) {
    const result = await API.get('mserviceApi', '/checkname', {
        'queryStringParameters': {
          'serviceName': msName
        }
    })
    // return success : 'used' or 'new'
    if (result.success === 'used') {
      return true
    } else {
      return false
    }
  },
  async loadMserviceSource (s3place) {
    Storage.configure({level: 'public', bucket: config.awsMserviceBucket})
    console.log('start loadSource')
    let s3url = await Storage.get(s3place)
    let dataResponse = await fetch(s3url)
    // https://css-tricks.com/using-fetch/
    let dataText = await dataResponse.text()
    return dataText
   },
  async allowLoginIdentityUseIoT (identityId) {
    const body = { identityId }
    const result = await API.post('thingApi', '/iot-allow', { body })
    console.log('allowLoginIdentityUseIoT: ', result)
  },
  async continueLoadSharedServices () {
    const username = store.getters.username
    const continueIndex = store.getters.sharedMservicesContinueIndex
    console.log('reloadServices: username: ', username)
    const result = await API.get('mserviceApi', '/mservices', {
          'queryStringParameters': {
               'userId': username,
               'isShared': true,
               'continueIndex': continueIndex
          }
    })
    let resultJson = JSON.parse(result)
    store.commit('setSharedMServicesContinueIndex', resultJson.continueIndex)
    store.commit('addSharedMservices', JSON.parse(result))
  },
  async reloadSharedServices () {
    const username = store.getters.username
    console.log('reloadSharedServices: username: ', username)
    store.commit('setSharedMServicesContinueIndex', null)
    const result = await API.get('mserviceApi', '/mservices', {
          'queryStringParameters': {
               'userId': username,
               'isShared': true
          }
    })
    let resultJson = JSON.parse(result)
    store.commit('setSharedMServicesContinueIndex', resultJson.continueIndex)
    store.commit('setSharedServices', JSON.parse(result))
  },
  async reloadServices () {
    const username = store.getters.username
    console.log('reloadServices: username: ', username)
    const result = await API.get('mserviceApi', '/mservices', {
          'queryStringParameters': {
               'userId': username
          }
    })
    let resultJson = JSON.parse(result)
    console.log('reloadServices:: ', resultJson.length)
    store.commit('setMservices', resultJson)
  },
  async reloadApis () {
    const username = store.getters.username
    console.log('reloadApis: username: ', username)
    const resultJson = await API.get('apiApi', '/apis', {
          'queryStringParameters': {
               'userId': username
          }
    })
    console.log('reloadApis: ', resultJson)
    if (resultJson.error === null && resultJson.result !== undefined) {
      store.commit('setApis', resultJson.result)
    }
  },
  async reloadThings () {
    const username = store.getters.username
    console.log('reloadThings: username: ', username)
    const result = await API.get('thingApi', '/things', {
          'queryStringParameters': {
               'userId': username
          }
    })
    let things = JSON.parse(result)
    console.log('things: ', things)
    store.commit('setThings', things)
  },
  async reloadSolutions () {
    const username = store.getters.username
    if (username === null) {
      username = ' '
    }
    console.log('reloadSolutions: username: ', username)
    const result = await API.get('solutionApi', '/solutions', {
          'queryStringParameters': {
               'userId': username
          }
    })
    // store.commit('setThings', JSON.parse(result))
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
  },
  downloadEdgeCoreSetup: async function (thingData) {
    let thingId = thingData.ThingId

    // https://docs.aws.amazon.com/greengrass/latest/developerguide/gg-core.html

    let rootCaPemFileName = 'aiot-root-CA.crt'
    let thingCertPemFileName = thingId + '-certificate.crt'
    let thingCertPublicKeyFileName = thingId + '-public.key'
    let thingCertPrivateKeyFileName = thingId + '-private.key'
    
    let configJson = ""

    let configTemplateFileName = '/static/config.json'
    try {
      let dataResponse = await fetch(configTemplateFileName)
      console.log('dataResponse: ', dataResponse)
      configJson = await dataResponse.text()
    } catch (err) {
      console.log('read config.js template error: ', err)
      return
    }    
    let configStr = JSON.stringify(configJson)
            .replace(/\[ROOT_CA_PEM\]/g, rootCaPemFileName )
            .replace(/\[THING_PEM_CRT\]/g, thingCertPemFileName)
            .replace(/\[THING_PEM_PRIVATE_KEY\]/g, thingCertPrivateKeyFileName)
            .replace(/\[THING_ARN\]/g, thingData.ThingArn)
            .replace(/\[IOT_HOST\]/g, config.awsIotHost)
            .replace(/\[GG_HOST\]/g, 'cgreengrass-ats.iot.' + config.awsRegion + '.amazonaws.com')

    configJson = JSON.parse(configStr)

    // https://davidwalsh.name/javascript-zip

    let zip = new JSZip();

    // Generate a directory within the Zip file structure
    let configFolder = zip.folder("config");
    let certsFolder = zip.folder("certs");

    // Add a file to the directory, in this case an image with data URI as contents
    certsFolder.file(thingCertPrivateKeyFileName, thingData.PrivateKey);
    certsFolder.file(thingCertPublicKeyFileName, thingData.PublicKey);
    certsFolder.file(thingCertPemFileName, thingData.CertPem);
    certsFolder.file(rootCaPemFileName, thingData.RootCA);
    
    configFolder.file('config.json', configJson);

    // Generate the zip file asynchronously
    zip.generateAsync({type:'blob'})
    .then(function(content) {
        // Force down of the Zip file
        FileSaver.saveAs(content, thingId + '-edge-setup.zip');
    });
  },
  userHasPhoto () {
    try {
      let photo = JSON.parse(store.getters.profile.picture)
      if (photo != null) {
        if (typeof photo === 'string') {
          if (photo.substring(0, 4) !== 'http') {
            return false
          }
        }
        return true
      } else {
        return false
      }
    } catch (e) {
      try {
        let photo = store.getters.profile.picture
        if (typeof photo === 'string') {
            if (photo.substring(0, 4) !== 'http') {
              return false
            }
            return true
        }
        return false
      } catch (err) {
        return false
      }
    }
  }
}

