/** 
Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
This node.js Lambda function code creates certificate, attaches an IoT policy, IoT thing . 
It also activates the certificate. 
**/
// const config = require('./config');
const applyModel = require("./utility");

/* 
    You should submit your device credentials to Lambda function through API Gateway for authenticating in DynamoDB.
    eg: {"userId":"YOUR_DEVICE_SERIAL_NUMBER","deviceToken":"TOKEN"}
*/
let createThing = (username, thingNameTag, thingDesc, deviceGroupName, alertEnabled, context, callback) => {
  // Get device credentials
  var userId = username;
  // var deviceToken = event.deviceToken;
  // After the verification is complete, you can apply for a certificate for the device.
  applyModel.applyThingCert(userId, thingNameTag, deviceGroupName, (err, certId, thingId, certData) => {
    let publicKey = certData.keyPair.PublicKey
    let privateKey = certData.keyPair.PrivateKey
    let certPem = certData.certificatePem
    // In order to be safe, you should write the certificate ID/Arn, indicating that the device has applied for a certificate.
    applyModel.dbInsertCertinfo(userId, certId, thingId, thingNameTag, thingDesc, publicKey, privateKey, alertEnabled, (err, dbData) => {

      if (err) callback(null, 'createThing: dbInsertCertinfo: error: '+err);

      // Don't forget to return CA certificate
      applyModel.getIoTRootCA((err, rootca) => {
        if (err) {
          console.log(err);
          callback(null, 'Can not get Get VeriSign Class 3 Public Primary G5 root CA certificate! ');
        }
        var returnValues = dbData;
        console.log('createThing: dbData: ', dbData)
        returnValues.RootCA = rootca;
        returnValues.CertPem = certPem
        console.log('createThing: success: ', returnValues)
        // Don't forget to return CA certificate
        callback(null, returnValues); // return all data to frontend for user to distribute
      })

    });
  });
};

let createDeviceGroup = (username, deviceGroupName, deviceGroupDesc, context, callback) => {
  // Get device credentials
  var userId = username;
  // var deviceToken = event.deviceToken;
  // After the verification is complete, you can apply for a certificate for the device.
  applyModel.applyDeviceGroupCert(userId, deviceGroupName, (err, certId, thingId, certData) => {
    let publicKey = certData.keyPair.PublicKey
    let privateKey = certData.keyPair.PrivateKey
    let certPem = certData.certificatePem
    // In order to be safe, you should write the certificate ID/Arn, indicating that the device has applied for a certificate.
    applyModel.dbInsertCertinfo(userId, certId, thingId, deviceGroupName, deviceGroupDesc, publicKey, privateKey, (err, dbData) => {

      if (err) {
        callback(err)
        return
      }

      // Don't forget to return CA certificate
      applyModel.getIoTRootCA((err, rootca) => {
        if (err) {
          callback(err)
          return
        }
        var returnValues = dbData;
        console.log('createDeviceGroup: dbData: ', dbData)
        returnValues.RootCA = rootca;
        returnValues.CertPem = certPem
        // Don't forget to return CA certificate
        callback(null, returnValues); // return all data to frontend for user to distribute
      })

    });
  });
};

let allowUserIoT = (identityId, callback ) => {
  applyModel.allowUserIoT (identityId, (err) => {
    if (err) callback(null, 'allowUserIoT: error: ' + err)
    callback(null, 'success')
  })
}

let deleteThing = (userId, certId, thingId, context, callback) => {
  // After the verification is complete, you can apply for a certificate for the device.
  applyModel.cancelThingCert(certId, thingId, (err) => {
    if (err) callback(null, 'deleteThing: removeCert: error: '+err);
    // In order to be safe, you should write the certificate ID/Arn, indicating that the device has applied for a certificate.
    applyModel.dbDeleteCertinfo(userId, thingId, certId, (err) => {
        if (err) callback(null, 'deleteThing: removeCerinfo: error:'+err);
        console.log('deleteThing: Api: success');
        callback(null, 'success');
    });
  });
};

let updateThing = (userId, certId, thingNameTag, thingId, desc, alertEnabled, firmware, context, callback) => {
  // After the verification is complete, you can apply for a certificate for the device.
  applyModel.updateThingCert(userId, certId, thingId, thingNameTag, firmware, (err) => {
    if (err) callback('updateThing: updateThingCert: error: '+err);
    if (firmware !== undefined && firmware !== null && (typeof firmware === 'object') && firmware.Desired !== undefined) {
      // The firmware update job has been assigned from updateThingCert
      firmware.Processing = firmware.Desired
      delete firmware.Desired
      console.log('firmware updated: ', firmware)
    } else {
      firmware = null
    }
    applyModel.dbUpdateCertinfo(userId, certId, thingNameTag, thingId, desc, alertEnabled, firmware, (err, data) => {
      if (err) {
        callback('updateThing: dbUpdateCertinfo: error: '+err);
      } else {
        getThingGeneral(userId, certId, context, function(err,result) {
          if (err) {
            callback(err)
          } else {
            callback(null, result)
          }
        })
      }
    });
  })
};
let getThingGeneral = (userId, certId, context, callback) => {
  applyModel.dbGetCertinfo(userId, certId, (err, dbDataJson) => {
    if (err) { 
      callback(err)
    } else {
      callback(null, dbDataJson)
    }
  })
};
let getThingDetail = (userId, certId, thingName, thingId, context, callback) => {
  applyModel.getThingDesc(thingId, certId, (err, thingData) => {
    if (err) callback(null, 'getThingDesc: error' + err);
    applyModel.getCertPem(certId, (err, certPem) => {
      if (err) callback(null, 'getThingDetail: getCertPem: error' + err);
      applyModel.dbGetCertinfo(userId, certId, (err, dbDataJson) => {
        if (err) callback(null, 'getThingDetail: dbUpdateCertinfo: error: ' + err);
        // Don't forget to return CA certificate
        applyModel.getIoTRootCA((err, rootca) => {
          if (err) {
            console.log(err);
            callback(null, 'Can not get Get VeriSign Class 3 Public Primary G5 root CA certificate! ');
          }
          let returnValue = dbDataJson;
          returnValue.CertPem = certPem.CertPem;
          returnValue.RootCA = rootca;
          returnValue.ThingArn = thingData.thing.thingArn;
          returnValue.CertificateArn = thingData.certificate.certificateArn;
          console.log('getThingDetail: success: ', returnValue);
          // Don't forget to return CA certificate
          callback(null, returnValue); // return all data to frontend for user to distribute
        });   
      });
    });
  });
};
let listThings = (userId, context, callback) => {
  // After the verification is complete, you can apply for a certificate for the device.
  console.log('listThings: userId: ', userId)
  applyModel.dbListCertinfo(userId, (err, data) => {
    if (err) callback(null, 'listThings: dbListCertinfo: error: '+err);    
    callback(null, data);
  });
};

module.exports = {
  createDeviceGroup,
  createThing,
  deleteThing,
  updateThing,
  getThingDetail,
  getThingGeneral,
  listThings,
  allowUserIoT
}
