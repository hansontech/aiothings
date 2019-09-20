/** 
Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
This node.js Lambda function code creates certificate, attaches an IoT policy, IoT edge . 
It also activates the certificate. 
**/
// const config = require('./config');
const applyModel = require("utility");
const AWS = require('aws-sdk');
const config = require('./config');

AWS.config.update({region: config.region});
let greengrass = new AWS.Greengrass();

/* 
    You should submit your device credentials to Lambda function through API Gateway for authenticating in DynamoDB.
    eg: {"userId":"YOUR_DEVICE_SERIAL_NUMBER","deviceToken":"TOKEN"}
*/
let createEdge = (userId, certId, thingNameTag, thingId, edgeDefinition, callback) => {
  // Get device credentials
  console.log('start create edge')
  let thingFullName = thingId // userId + '_' + thingNameTag
  let edgeData = {}
  applyModel.getThingDesc(thingFullName, certId, async (err, thingDesc) => {
    if (err) {
      console.log('getThingDesc: ', err)
      callback(err)
    } else {
        try {
          // create core definition 
          console.log('start create core')
          edgeData.ggCore = {}
          edgeData.ggCore.created = await greengrass.createCoreDefinition({Name: thingFullName + '_coreDefinition'}).promise()
          edgeData.ggCore.version = await greengrass.createCoreDefinitionVersion({
            CoreDefinitionId: edgeData.ggCore.created.Id,
            Cores: [
              {
                CertificateArn: thingDesc.certificate.certificateDescription.certificateArn, //cert of core device
                Id: thingDesc.thing.thingId, //id of core device device
                SyncShadow: true,
                ThingArn: thingDesc.thing.thingArn //core thing arn
              },
            ]
          }).promise()

          console.log('getCoreDef edgeData: ', edgeData)

          edgeDefinition.coreDefinition = await greengrass.getCoreDefinitionVersion( {
            CoreDefinitionId: edgeData.ggCore.created.Id, /* required */
            CoreDefinitionVersionId: edgeData.ggCore.version.Version /* required */
          }).promise()

          console.log('core definition created ..')
          // now create greengrass group
          edgeData.ggGroup = {}
          edgeData.ggGroup.created = await greengrass.createGroup({Name: thingId + '_' + 'groupDefinition'}).promise()
          console.log('group definition created ..');
          await greengrass.associateRoleToGroup({
            GroupId: edgeData.ggGroup.created.Id, /* required */
            RoleArn: 'arn:aws:iam::414327512415:role/aiot-iot-greengrass-default' /* required */
          }).promise()
          console.log('edgeData: ', edgeData)
          console.log('edgeDefinition: ', edgeDefinition)
          callback(null, edgeData, edgeDefinition)
        } catch (err) {
          console.log('createGroup error: ', err)
          callback(err)
        }
      } // end if else
  })  // getThingDesc
};

let updateEdge = async (userId, certId, edgeData, edgeDefinition) => {
  console.log('updateEdge')
  try {
    if (edgeDefinition.hasOwnProperty('connectorDefinition') && edgeDefinition.connectorDefinition.CreationTimestamp === '0') {
      if (edgeDefinition.connectorDefinition.hasOwnProperty('Arn') === false) {
        edgeData.ggConnector = {}
        edgeData.ggConnector.created = await greengrass.createConnectorDefinition({
          Name: 'connectorDefinition' /* required */
        }).promise()
      }
      if (edgeDefinition.connectorDefinition.Definition.Connectors.length == 0) {
          await greengrass.deleteConnectorDefinition({
            ConnectorDefinitionId: edgeData.ggConnector.created.Id /* required */
          }).promise()
          delete edgeData.ggConnector
      } else {
          edgeData.ggConnector.version = await greengrass.createConnectorDefinitionVersion({
            ConnectorDefinitionId: edgeData.ggConnector.created.Id, /* required */
            Connectors: edgeDefinition.connectorDefinition.Definition.Connectors
          }).promise()
      }
    }
    if (edgeDefinition.hasOwnProperty('functionDefinition') && edgeDefinition.functionDefinition.CreationTimestamp === '0') {
      if (edgeDefinition.functionDefinition.hasOwnProperty('Arn') === false) {
        edgeData.ggFunction = {}
        edgeData.ggFunction.created = await greengrass.createFunctionDefinition({
          Name: 'functionDefinition' /* required */
        }).promise()
      } 
      if (edgeDefinition.functionDefinition.Definition.Functions.length == 0) {
          await greengrass.deleteFunctionDefinition({
            FunctionDefinitionId: edgeData.ggFunction.created.Id /* required */
          }).promise()
          delete edgeData.ggFunction
      } else {
          console.log('create function def ver:', edgeDefinition.functionDefinition.Definition)
          // TODO
          // console.log('functions [0]: ', edgeDefinition.functionDefinition.Definition.Functions[0])
          // Duplicate lambda function environment variables to the edge deployment
          let lambda = new AWS.Lambda()
          for (let edgeFunction of edgeDefinition.functionDefinition.Definition.Functions) {
            let funcData = await lambda.getFunctionConfiguration({
              FunctionName: edgeFunction.FunctionArn
            }).promise()
            for (let funcEnvVarKey of Object.keys(funcData.Environment.Variables)) {
              if (edgeFunction.FunctionConfiguration.Environment.Variables.hasOwnProperty(funcEnvVarKey) === false) {
                edgeFunction.FunctionConfiguration.Environment.Variables[funcEnvVarKey] = funcData.Environment.Variables[funcEnvVarKey]
              }
            }
          }
          edgeData.ggFunction.version = await greengrass.createFunctionDefinitionVersion({
            FunctionDefinitionId: edgeData.ggFunction.created.Id, /* required */
            Functions: edgeDefinition.functionDefinition.Definition.Functions
          }).promise()
      }
    }
    console.log('after create function def ver:', edgeDefinition)
    if (edgeDefinition.hasOwnProperty('resourceDefinition') && edgeDefinition.resourceDefinition.CreationTimestamp === '0') {
      if (edgeDefinition.resourceDefinition.hasOwnProperty('Arn') === false) { 
        console.log('create resource def')
        edgeData.ggResource = {}
        edgeData.ggResource.created = await greengrass.createResourceDefinition({
          Name: 'resourceDefinition' /* required */
        }).promise()
      }
      if (edgeDefinition.resourceDefinition.Definition.Resources.length == 0) {
          await greengrass.deleteResourceDefinition({
            ResourceDefinitionId: edgeData.ggResource.created.Id /* required */
          }).promise()
          delete edgeData.ggResource
      } else {
          /*
          console.log('resources: ', edgeDefinition.resourceDefinition.Definition.Resources)
          for (let resource of edgeDefinition.resourceDefinition.Definition.Resources) {
            console.log('resource list: ', resource)
            if (resource.ResourceDataContainer.hasOwnProperty('LocalVolumeResourceData')) {
              console.log('resources - : ', resource.Name, resource.ResourceDataContainer.LocalVolumeResourceData)
            }
          }
          console.log('ggResource ID: ', edgeData.ggResource.created.Id)
          */
          edgeData.ggResource.version = await greengrass.createResourceDefinitionVersion({
              ResourceDefinitionId: edgeData.ggResource.created.Id, /* required */
              Resources: edgeDefinition.resourceDefinition.Definition.Resources
          }).promise()
      }
    }
    if (edgeDefinition.hasOwnProperty('subscriptionDefinition') && edgeDefinition.subscriptionDefinition.CreationTimestamp === '0') {
      // timestamp 0 means the content is modified, not yet updated
      if (edgeDefinition.subscriptionDefinition.hasOwnProperty('Arn') === false) {
        // no Arn means it is the first time entry, create def and create the version next
        edgeData.ggSubscription = {}
        edgeData.ggSubscription.created = await greengrass.createSubscriptionDefinition({
          Name: 'subscriptionDefinition' /* required */
        }).promise()
      }
      // Arn exists, means only need to create a new version or delete
      if (edgeDefinition.subscriptionDefinition.Definition.Subscriptions.length == 0) {
          await greengrass.deleteSubscriptionDefinition({
            SubscriptionDefinitionId: edgeData.ggSubscription.created.Id /* required */
          }).promise()
          delete edgeData.ggSubscription
      } else {
          edgeData.ggSubscription.version = await greengrass.createSubscriptionDefinitionVersion({
            SubscriptionDefinitionId: edgeData.ggSubscription.created.Id, /* required */
            Subscriptions: edgeDefinition.subscriptionDefinition.Definition.Subscriptions
          }).promise()
      }
    }
    let edgeDataBasicList = ['Name', 'ggGroup', 'ggCore', 'ggSubscription']
    let edgeDataKeys = Object.keys(edgeData)
    let edgeDataOthers = edgeDataKeys.filter( key => {
      let index = edgeDataBasicList.indexOf(key)
      if (index !== -1) {
        return true
      } else {
        return false
      }
    })
    if (edgeDataOthers.length == 0) { // means no more an edge definiton is required
      await applyModel.dbDeleteEdge(userId, certId)
      return null
    }
    console.log('update edge data: ', edgeData)
    console.log('update edge defninition: ', edgeDefinition)
    // otherwise
    let newGroupVersionParams = {GroupId: edgeData.ggGroup.created.Id}
    if (edgeData.hasOwnProperty('ggConnector')) {
      newGroupVersionParams.ConnectorDefinitionVersionArn = edgeData.ggConnector.version.Arn
    }
    if (edgeData.hasOwnProperty('ggCore')) {
      newGroupVersionParams.CoreDefinitionVersionArn = edgeData.ggCore.version.Arn
    }
    if (edgeData.hasOwnProperty('ggDevice')) {
      newGroupVersionParams.DeviceDefinitionVersionArn = edgeData.ggDevice.version.Arn
    }
    if (edgeData.hasOwnProperty('ggFunction')) {
      newGroupVersionParams.FunctionDefinitionVersionArn = edgeData.ggFunction.version.Arn
    }
    if (edgeData.hasOwnProperty('ggLogger')) {
      newGroupVersionParams.LoggerDefinitionVersionArn = edgeData.ggLogger.version.Arn
    }
    if (edgeData.hasOwnProperty('ggResource')) {
      newGroupVersionParams.ResourceDefinitionVersionArn = edgeData.ggResource.version.Arn
    }
    if (edgeData.hasOwnProperty('ggSubscription')) {
      newGroupVersionParams.SubscriptionDefinitionVersionArn = edgeData.ggSubscription.version.Arn
    }
    console.log('new group: ', newGroupVersionParams)
    edgeData.ggGroup.version = await greengrass.createGroupVersion(newGroupVersionParams).promise()
    await applyModel.dbUpdateEdgeAsync(userId, certId, edgeData)
    return edgeData
  } catch (err) {
    console.log('updateEdge err: ', err)
    return edgeData
  }
};

let getEdgeDetail = async (edgeData) => {
  let edgeDefinition = {}
  console.log('edgeData: ', edgeData)
  if (edgeData === null) {
    return null
  }
  try {
    let groupData = await greengrass.getGroupVersion({
      GroupId: edgeData.ggGroup.created.Id,
      GroupVersionId: edgeData.ggGroup.version.Version
    }).promise()
    let groupDefinitionArns = groupData.Definition
    if (groupDefinitionArns.hasOwnProperty('CoreDefinitionVersionArn')) {
      edgeDefinition.coreDefinition = await greengrass.getCoreDefinitionVersion( {
        CoreDefinitionId: edgeData.ggCore.created.Id, /* required */
        CoreDefinitionVersionId: edgeData.ggCore.version.Version /* required */
      }).promise()
    }
    if (groupDefinitionArns.hasOwnProperty('ConnectorDefinitionVersionArn')) {
      edgeDefinition.connectorDefinition = await greengrass.getConnectorDefinitionVersion( {
        ConnectorDefinitionId: edgeData.ggConnector.created.Id, /* required */
        ConnectorDefinitionVersionId: edgeData.ggConnector.version.Version /* required */
      }).promise()
    }
    if (groupDefinitionArns.hasOwnProperty('FunctionDefinitionVersionArn')) {
      edgeDefinition.functionDefinition = await greengrass.getFunctionDefinitionVersion( {
        FunctionDefinitionId: edgeData.ggFunction.created.Id, /* required */
        FunctionDefinitionVersionId: edgeData.ggFunction.version.Version /* required */
      }).promise()
    }
    if (groupDefinitionArns.hasOwnProperty('ResourceDefinitionVersionArn')) {
      edgeDefinition.resourceDefinition = await greengrass.getResourceDefinitionVersion( {
        ResourceDefinitionId: edgeData.ggResource.created.Id, /* required */
        ResourceDefinitionVersionId: edgeData.ggResource.version.Version /* required */
      }).promise()
    }
    if (groupDefinitionArns.hasOwnProperty('SubscriptionDefinitionVersionArn')) {
      edgeDefinition.subscriptionDefinition = await greengrass.getSubscriptionDefinitionVersion( {
        SubscriptionDefinitionId: edgeData.ggSubscription.created.Id, /* required */
        SubscriptionDefinitionVersionId: edgeData.ggSubscription.version.Version /* required */
      }).promise()
    }
    return edgeDefinition
  } catch (err) {
    console.log('edgeDetail err: ', err)
    return null
  }
};

let deployEdge = async (edgeData) => {
  console.log('deployEdge start')
  try {
    //-- make sure it has the right permission
    // let serviceRole = await greengrass.getServiceRoleForAccount({}).promise()
    // console.log('getAssociateRole: ', serviceRole)
    // if (serviceRole === null || serviceRole.RoleArn === null || serviceRole.RoleArn.search(/greengrass/i) === -1) {
      console.log('start associate')
      await greengrass.associateServiceRoleToAccount({
        RoleArn: 'arn:aws:iam::414327512415:role/aiot-iot-greengrass-default'
      }).promise()
      console.log('end associate')
    // }
    let deployData = await greengrass.createDeployment({
      GroupId: edgeData.ggGroup.created.Id, /* required */
      DeploymentType: 'NewDeployment',
      GroupVersionId: edgeData.ggGroup.version.Version
    }).promise()
    return deployData
  } catch (err) {
    console.log('deployEdge err: ', err)
    return null
  }
};

let getDeployStatus = async (deployId, edgeData) => {
  try {
    let deployData = await greengrass.getDeploymentStatus({
      DeploymentId: deployId, /* required */
      GroupId: edgeData.ggGroup.created.Id /* required */
    }).promise()
    return deployData
  } catch (err) {
    console.log('getDeployStatus err: ', err)
    return null
  }
};


let deleteEdge = async (userId, certId, edgeData) => {
  console.log('deleteEdge')
  try {
    await greengrass.resetDeployments({
      GroupId: edgeData.ggGroup.created.Id,
      Force: true
    }).promise()
    console.log('edgeData: ', edgeData)
    if (edgeData.ggConnector !== undefined) {
      await greengrass.deleteConnectorDefinition({
        ConnectorDefinitionId: edgeData.ggConnector.created.Id /* required */
      }).promise()
    }
    if (edgeData.ggFunction !== undefined) {
      await greengrass.deleteFunctionDefinition({
        FunctionDefinitionId: edgeData.ggFunction.created.Id /* required */
      }).promise()
    }
    if (edgeData.ggResource !== undefined) {
      await greengrass.deleteResourceDefinition({
        ResourceDefinitionId: edgeData.ggResource.created.Id /* required */
      }).promise()
    }
    if (edgeData.ggSubscription !== undefined) {
      await greengrass.deleteSubscriptionDefinition({
        SubscriptionDefinitionId: edgeData.ggSubscription.created.Id /* required */
      }).promise()
    }
    if (edgeData.ggCore !== undefined) {
      await greengrass.deleteCoreDefinition({
        CoreDefinitionId: edgeData.ggCore.created.Id /* required */
      }).promise()
    }
    console.log('deleteGroup ---: ', edgeData.ggGroup)
    if (edgeData.ggGroup !== undefined) {
      console.log('deleteGroup: ', edgeData.ggGroup)
      await greengrass.deleteGroup({
        GroupId: edgeData.ggGroup.created.Id /* required */
      }).promise()
    }
    await applyModel.dbDeleteEdge(userId, certId)
  } catch (err) {
    console.log('deleteEdge error: ', err)
  }
};

module.exports = {
  createEdge,
  deleteEdge,
  updateEdge,
  getEdgeDetail,
  getDeployStatus,
  deployEdge
}
