/* eslint-disable */
/* global window, FB, document */

import { API, Storage } from 'aws-amplify'
import JSZip from 'jszip'
import FileSaver from 'file-saver'
import store from './store'
import config from './config'

export default {
  truncatedString (textStr, length) {
    return (textStr.length < (length)) ? textStr : (textStr.substring(0, length - 4) + '...')
  },
  async downloadUrlToLocal (url, fileName) {
    let res = await fetch(url)
    // let data = await res.text()
    let blob = await res.blob()
    await this.downloadBinaryFile(fileName, blob)
  },
  async downloadBinaryFile (fileName, fileDataBlob) {
    FileSaver.saveAs(fileDataBlob, fileName);
  },
  async exportServices(mservices) {
    let zip = new JSZip()
    try {
      Storage.configure({level: 'public'})
      for (let ms of mservices) { // for each microservice
        let msZipFolder = zip.folder(ms.ServiceName)
        await this.exportServiceToZip(msZipFolder, ms, true)
      } // end of for loop
      // console.log('export zip')
      let zipContent = await zip.generateAsync({type:"blob"})
      const userId = store.getters.userId
      FileSaver.saveAs(zipContent, userId + '.zip')
    } catch (err) {
      console.log('export error: ', err)
    }
  },
  async exportService(mservice, isLoadCode) {
    let zip = new JSZip()
    try {
      Storage.configure({level: 'public'})
      await this.exportServiceToZip (zip, mservice, isLoadCode)
      let zipContent = await zip.generateAsync({type:"blob"})
      const userId = store.getters.userId
      FileSaver.saveAs(zipContent, userId + '-' + mservice.ServiceName + '.zip')
    } catch (err) {
      console.log('export service error: ', err)
    }
  },
  async exportDeviceGroupCert(deviceGroup) {
    let zip = new JSZip()
    let thingData = deviceGroup.Thing
    let deviceGroupName = deviceGroup.DeviceGroupName
    let privateKeyPath = 'aiot-' + deviceGroupName + '-private.key'
    let certificatePath = 'aiot-' + deviceGroupName  + '-certificate.crt'
    let rootCAPath = 'aiot-root-CA.crt'
    let folderPath = '/root/aiothings/'
    let configFileName = 'aiotConfig.json'
    try {
      let zipFolder = zip.folder('aiothings')
      zipFolder.file(privateKeyPath, thingData.PrivateKey)
      zipFolder.file(certificatePath, thingData.CertPem)
      zipFolder.file(rootCAPath, thingData.RootCA)
      let configFileContent = {}
      configFileContent.thingName = ''
      configFileContent.endpoint = config.awsIotHost
      configFileContent.certificatePath = folderPath + certificatePath
      configFileContent.privateKeyPath = folderPath + privateKeyPath
      configFileContent.rootCAPath = folderPath + rootCAPath
      let configFileContentStr = JSON.stringify(configFileContent, null, "\t")
      zipFolder.file(configFileName, configFileContentStr)
      let zipContent = await zip.generateAsync({type:"blob"})
      // const userId = store.getters.userId
      FileSaver.saveAs(zipContent, 'aiot-' + deviceGroup.DeviceGroupName + '.zip')
    } catch (err) {
      console.log('export device group cert error: ', err)
    }
  },
  async exportServiceToZip (zipFolder, ms, isLoadCode) {
    /* mservice header file */
    let serviceHeader = ''
    serviceHeader += ('Name: ' + ms.ServiceName + '\n')
    serviceHeader += ('\n' + ms.ServiceDesc + '\n\n')
    serviceHeader += ('Input Message Topic: ' + ms.InputMessageTopic + '\n')
    serviceHeader += ('Output Message Topic: ' + ms.OutputMessageTopic + '\n')
    let headerFileName = ms.ServiceName + '.txt'
    zipFolder.file(headerFileName, serviceHeader)
    /* mservice code file (zipped or a single main) */
    if (ms.hasOwnProperty('CodeEntryType') && ms.CodeEntryType === 'zip') {
      if (ms.CodeFileName !== '' && ms.CodeFileName !== ' ') {
        let codeFileName = ms.CodeFileName
        let resultUrl = await Storage.get(codeFileName)
        let dataResponse = await fetch(resultUrl)
        let blob = await dataResponse.blob()   
        zipFolder.file(ms.ServiceName + '.zip', blob.arrayBuffer())
      }
    } else {
      let fileNameExtension = ms.ServiceRuntime.includes('nodejs') ? '.js' : '.py'
      let serviceFileName = ms.ServiceName + fileNameExtension
      let sourceCode = (isLoadCode === false) ? ms.ServiceCode : await this.loadSourceFromS3(ms.ServiceCode)
      zipFolder.file(serviceFileName, sourceCode)
    }
  },
  async exportService_old (ms, isLoadCode) {  // not been used anymore obsolete implementationxs
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
    if (ms.ServiceRuntime.includes('nodejs')) {
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
    if (ms.hasOwnProperty('CodeEntryType') && ms.CodeEntryType === 'zip') {
      this.downloadFile(serviceFileName, serviceData) // to download the header
      if (ms.CodeFileName !== '' && ms.CodeFileName !== ' ') {
        let fileName = ms.CodeFileName
        Storage.configure({level: 'public'})
        try {
          let result = await Storage.get(fileName)
          await this.downloadBinaryFile(fileName, result)
        } catch (err) {
          console.log(err)
        }
      }
    } else {
      serviceData += (sourceCode + '\n')
      // this.downloadFile(serviceFileName, serviceData)
      let blob = new Blob([serviceData], { type: 'text/plain' })
      FileSaver.saveAs(blob, serviceFileName);
    }
  },
  async loadSourceFromS3 (s3filename) {
    Storage.configure({level: 'public'})
    // console.log('loadSourceFromS3')
    let s3url = await Storage.get(s3filename)
    let dataResponse = await fetch(s3url)
    // https://css-tricks.com/using-fetch/
    let dataText = await dataResponse.text()
    // console.log('loadSourceFromS3: ', dataText)
    return dataText
  },
  async deleteFavorite (serviceName) {
    const userId = store.getters.userId
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
    const userId = store.getters.userId
    try {
      const result = await API.get('mserviceApi', '/favorite-mservices', {
        'queryStringParameters': {
          'userId': userId
        }
      })
      console.log(result)
      // let favoriteMservices = JSON.parse(result)
      let favoriteMservices = result
      store.commit('setFavoriteMservices', favoriteMservices)
    } catch (err) {
      console.error(err)
    }
  },
  async reloadFavoriteServiceList () { // { 'ms1 name' : true, 'ms2 name' : true, ... }
    let userId = store.getters.userId
    if (userId === null) {
      userId = ' '
    }
    const result = await API.get('mserviceApi', '/favorites', {
      'queryStringParameters': {
        'userId': userId
      }
    })
    // console.log('reloadFavoriteServiceList: ', result)
    // let favoriteList = JSON.parse(result)
    let favoriteList = result
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
    // let users = JSON.parse(result)
    let users = result
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
    Storage.configure({level: 'public'})
    console.log('start loadSource')
    let s3url = await Storage.get(s3place)
    let dataResponse = await fetch(s3url)
    // https://css-tricks.com/using-fetch/
    let dataText = await dataResponse.text()
    return dataText
   },
  async allowLoginIdentityUseIoT (identityId, userId, profile) {
    console.log('profile: ', profile)
    const body = { identityId, userId, profile }
    const result = await API.post('thingApi', '/iot-allow', { body })
    console.log('allowLoginIdentityUseIoT: ', result)
  },
  async continueLoadSharedServices () {
    const userId = store.getters.userId
    const continueIndex = store.getters.sharedMservicesContinueIndex
    const result = await API.get('mserviceApi', '/mservices', {
          'queryStringParameters': {
               'userId': userId,
               'isShared': true,
               'continueIndex': continueIndex
          }
    })
    // let resultJson = JSON.parse(result)
    let resultJson = result
    store.commit('setSharedMServicesContinueIndex', resultJson.continueIndex)
    store.commit('addSharedMservices', JSON.parse(result))
  },
  async reloadSharedServices () {
    const userId = store.getters.userId
    store.commit('setSharedMServicesContinueIndex', null)
    const result = await API.get('mserviceApi', '/mservices', {
          'queryStringParameters': {
               'userId': userId,
               'isShared': true
          }
    })
    // let resultJson = JSON.parse(result)
    let resultJson = result
    store.commit('setSharedMServicesContinueIndex', resultJson.continueIndex)
    store.commit('setSharedServices', JSON.parse(result))
  },
  async reloadServices () {
    const userId = store.getters.userId
    try {
      const result = await API.get('mserviceApi', '/mservices', {
            'queryStringParameters': {
                'userId': userId
            }
      })
      // let resultJson = JSON.parse(result)
      let resultJson = result
      store.commit('setMservices', resultJson)
    } catch (err) {
      console.error(err)
    }
  },
  async reloadApis () {
    const userId = store.getters.userId
    const resultJson = await API.get('apiApi', '/apis', {
          'queryStringParameters': {
               'userId': userId
          }
    })
    if (resultJson.error === null && resultJson.result !== undefined) {
      store.commit('setApis', resultJson.result)
    }
  },
  async reloadAuthApplications () {
    const userId = store.getters.userId
    const resultJson = await API.get('apiApi', '/apps', {
          'queryStringParameters': {
               'userId': userId
          }
    })
    if (resultJson.error === null && resultJson.result !== undefined) {
      store.commit('setApps', resultJson.result)
    }
  },
  async reloadDeviceGroups () {
    const userId = store.getters.userId
    const result = await API.get('thingApi', '/device-groups', {
          'queryStringParameters': {
               'userId': userId
          }
    })
    // let things = JSON.parse(result)
    let deviceGroups = result
    console.log('device groups: ', deviceGroups)
    store.commit('setDeviceGroups', deviceGroups)
  },
  async reloadThings () {
    const userId = store.getters.userId
    const result = await API.get('thingApi', '/things', {
          'queryStringParameters': {
               'userId': userId
          }
    })
    // let things = JSON.parse(result)
    let things = result
    // console.log('things:: ', things)
    store.commit('setThings', things)
  },
  /*
  async reloadSolutions () {
    let userId = store.getters.userId
    if (userId === null) {
      userId = ' '
    }
    const result = await API.get('solutionApi', '/solutions', {
          'queryStringParameters': {
               'userId': userId
          }
    })
    // store.commit('setThings', JSON.parse(result))
  },
  */
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
            .replace(/\[GG_HOST\]/g, 'greengrass-ats.iot.' + config.awsRegion + '.amazonaws.com')

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

