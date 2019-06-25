<template>
  <b-container>
  <div>
 <vue-markdown id="DocIntroduction">
### Introduction
AIoThings has the features to build cloud and IoT applications rapidly, without the need for comprehensive cloud programming knowledge - that often prevent people from continuing their core design works.


These features include:
</vue-markdown> 
            <ul>
              <li>Connect IoT devices securely, and collect data</li>
              <li>Create REST APIs, and interface with other cloud services, 
              <li>Design cloud services to process IoT data, do analytic works</li> 
              <li>Interact with popular mobile/home apps</li>
            </ul>
<vue-markdown>
  ***We also provide professional services for your engineering projects.***
  ***Please contact us at service@hanson-tech.com***
</vue-markdown> 
<vue-markdown id="DocGetStarted" class="mt-4"> 
### Get Started

First of all, users need to sign in to use the services.

Next, for IoT applications, [**Thing Objects**](#DocThingObject) should be created as the interface for IoT devices.
Each Thing Object has its unique security credentials that will be used by IoT devices to build secured connections to the cloud.

Ideally, any type of IoT device that can support X.509 and TLS 1.2 is capable to connect to AIoThings Cloud. 
They include Windows/Linux computers or embedded single board systems, such as [Raspberry Pi](#DocPi) and [ESP32/ESP8266](#DocESP8266).

MQTT protocol is used to communicate between a device and a cloud service, and also to interface among cloud services.
In this way, an event-driven application can be achieved through publishing and subscribing messages.

The [**Microservice**](#DocMicroservice) is the basic building block of data processing inside the cloud.
Each microservice defines a pair of input and output message topics, a description, and software codes written in JavaScript or Python.
A group of microservices works together through their input and output messages.
We provide a set of [Microservice APIs](#DocMicroserviceApi) for the programming. (In addition, AWS SDKs can be called to utilize Amazon AWS resources inside Microservices) 


To an extension, AIoThings also is used to develop a cloud application that doesn't include IoT devices.
In this case, developers only need to use services such as Microservices, REST APIs and App Connectors to build an application, without Thing Object's involvements.

Microservices and their messages can be configured visible to other users. Through this setting, sharing and reuse are accomplished among multiple developers.
Developers search and reuse or even duplicate other users' microservices to accelerate their development works. Fast prototyping and DevOps are the benefits offered from this too. 

Web API is a useful tool to connect Internet services together. RESTful API as an example, it uses HTTP requests to GET, PUT, POST and DELETE data.
Our [REST API](#DocApi) function is an easy-to-use version of RESTful API editor.
The REST API plays as a gateway to define the API address in a format of `api.aiothings.com/{api name}/{path}`, and to pass external HTTP requests to the assigned Microservices. 
Users need to authenticate themselves from the external service first, and authorize this service to use the API.

We are also continuously providing a series of pre-defined REST APIs for developers to use them connecting to some popular Internet services, such as IFTTT, without the actual needs of separate implementations by developers. 

[App Connector](#DocAppConnector) is based on these REST API, and one step further, it defines messages and Microservices that developers can work with them to send and receive data directly to/from popular Internet services (for example, Alexa, Facebook Messenger, or LINE) from AIoThings internally without interfacing through Web APIs.

</vue-markdown>  
<b-img style="padding:20px;" src="/static/aiot-block-diagram.png" fluid align=center />

&nbsp;
&nbsp;
&nbsp;

<vue-markdown id="DocThingObject">

### Thing Object

A Thing Object is required by AIoThing cloud to connect to a physical IoT device.

It can be created, configured and removed through AIoThings console. 
It includes certificate data that will be copied to the physical device and be used to build a secured communication channel (MQTT and TLS 1.2).

For [edge devices](#DocThingEnabler) support AWS Greengrass Core, users can deploy a microservice from the cloud to this device and execute it remotely. 
For example, we can deploy machine learning inference functions (a microservice) to run on the IoT device that is using this Thing Object. 

</vue-markdown> 

<vue-markdown id="DocThingEnabler">

### Thing Enabler

Thing enablers are the selected hardware platforms that are used to connect to AIoThings cloud. 
It plays the role of an IoT gateway to communicate with the cloud for IoT data and messages.
A Thing Enabler device needs to support MQTT and TLS 1.2 - the minimum requirements to build a secured connection channel to AIoThings.
In addition, it may support edge computing of machine learning through AWS IoT Greengrass Core software. 
Or, it may use Node-RED as the rapid programming tool to develop IoT application.

Raspberry Pi is a good example of the enablers. Developers can design Node-RED flows running on Raspberry Pi to collect data from Modbus connected sensors and send them to cloud.

[Shop](/shop#ShopIoTGateway) is available for users as a one-stop shop to purchase the hardware enablers with AIoThings services together.

</vue-markdown> 

<vue-markdown id="DocPi">
### Raspberry Pi

Raspberry Pi is a small and affordable computer that you can use to start programming for your edge computing needs.

Different to ESP32 or ESP8266 series single board solutions, Pi is a complete computer system running Linux operating system.
This makes it an ideal platform for sophisticated applications, such as machine learning with edge computing. 

There are two ways to connect AIoThings from Raspberry Pi, 1) go through Node-RED, or 2) go through AWS IoT SDK.

For IoT applications that don't need advanced edge computing features such as machine learning through AWS IoT Greengrass service, we recommend Node-RED.

As Node-RED developer community has plenty of examples and resources telling how to develop an IoT application, it can significantly reduce the learning curves from prototyping to production of IoT applications.

For more information about Raspberry Pi, please check this [official site](https://www.raspberrypi.org/).

</vue-markdown> 
<vue-markdown id="DocNodeRed" class="mt-5">
##### Node-RED

Node-RED is a flow-based programming environment for the Internet of Things.
</vue-markdown>

<b-img style="padding:20px;" src="/static/nodered-screen.png" fluid align=center />
&nbsp;
&nbsp;

<vue-markdown>

It provides a browser-based editor that makes it easy to connect multiple action blocks (known as nodes) together. Events from source nodes trigger the successive nodes connected to them and pass outputs. 
The nodes are supporting wide range of functions from the developer community, that makes the development much easier and faster than traditional approach.

(For more information about Node-RED, please check this [site](https://nodered.org/).)

NQTT nodes are required for IoT devices running Node-RED to connect to AIoThings. 

Node-RED nodes can send or receive data to/from AIoThings microservices through MQTT messages. The only difference between MQTT message topics and input/output message topics of microservices is that MQTT message topics need to add a header: **aiot/{User ID}/{Microservice Name}/** before the body in order to be compatible to Microservice's format of message topics.
 
 
</vue-markdown>
          <b-row class="mt-1">
            <b-col>
              <b-card>
                <b-row>
                  <b-col><strong>MQTT client settings to connect to AIoThings</strong> <br /></b-col>
                </b-row>
                <b-row>
                  <b-col sm="3"><span class="text-primary">MQTT broker (server)</span></b-col>
                  <b-col>
                    <b-row>
                      <b-col><code>b-a3vgppxo7lddg8-ats.iot.ap-southeast-2.amazonaws.com</code></b-col>
                    </b-row>
                    <b-row>
                      <b-col>Or, <code><em>iot.aiothings.com</em></code><br/></b-col>
                    </b-row>
                  </b-col>
                </b-row>
                <b-row>
                  <b-col sm="3"> <span class="text-primary">Certificates and keys</span></b-col> 
                  <b-col>Set to the files <em>downloaded</em> from the above button<br /> </b-col>
                </b-row>
                <b-row>
                  <b-col sm="3"> <span class="text-primary">Username/password</span></b-col> 
                  <b-col>Leave it blank <br /> </b-col>
                </b-row>
                <b-row>
                  <b-col sm="3"> <span class="text-primary">Client Id</span></b-col> 
                  <b-col>Set to <code>{Thing ID}</code> showing above <br /> </b-col>
                </b-row>
                <b-row>
                  <b-col sm="3"> <span class="text-primary">QoS</span></b-col> 
                  <b-col>Set to <code>1 or higher</code> <br /> </b-col>
                </b-row>
                <b-row>
                  <b-col sm="3"> <span class="text-primary">MQTT port</span></b-col>
                  <b-col><code>8883</code><br /> </b-col>
                </b-row>
                <b-row class="mt-3">
                  <b-col> <strong>MQTT messages</strong> <br /> </b-col>
                </b-row>
                <b-row>
                  <b-col sm="3"> <span class="text-primary">MQTT topic format</span></b-col> 
                  <b-col>Set to <code>'aiot/{User ID}/{Thing ID}/{your topic}'</code><br /> </b-col>
                </b-row>
                <b-row>
                  <b-col sm="3"> <span class="text-primary">MQTT payload format</span></b-col> 
                  <b-col>Must comply to JSON<br /> </b-col>
                </b-row>
              </b-card>
            </b-col>
          </b-row>
<vue-markdown class="mt-2">

An example Node-RED flow called **AIoThings Connector** is available at Node-RED flow library. 
Once it is set and deployed properly on an IoT device, a button will appear on the AIoThings Things window, and that button can be used to open the Node-RED editor too.

***Steps:***
1. Please move to [Shared Solutions], and select [Node-RED Flows] tab. Or directly visit [here](https://flows.nodered.org/?term=aiothings&num_pages=1). Enter 'AIoThings' from the --Search Library-- field. 
2. Select **AIoThings Connector** found from search, and import this flow to the Node-RED Editor of your Raspberry Pi.
3. Create a Thing from AIoThings
4. Apply Thing Object Certificates and Keys to MQTT node settings of Node-RED. You can change them from 'AIoT Alive Request' node.


For security reason, the MQTT topics must include the preceding header **aiot/{User ID}** as part of the topic. Otherwise, they won't be able to publish or subscribe.

</vue-markdown> 
<vue-markdown id="DocESP8266" class="mt-5">
### ESP32 / ESP8266

ESP8266 is a **Wi-Fi SoC** that integrates Tensilica L106 32-bit processor and SRAM / ROM together.

The name is also widely used to describe the **Wi-Fi modules** based on this SoC, such as ESP-12F, ESP-WROOM-S2, ESP8266MOD. 
These modules also have integrated extra SPI Flash memories, where part of these space can be used to store application codes and data later by flashing.

ESP32 is the upgrade version of ESP8266 that integrates Wi-Fi and Bluetooth both, dual (or single) Tensilica LX6 cores and larger SRAM.

In addition to the faster processing speed, ESP32 has SRAM the size is significantly larger than ESP8266, makes it suitable for broader IoT applications. Although it comes with the costs higher than ESP8266.

Following table shows the differences at a glace between these two SoC and the modules based on them.
</vue-markdown>
<div>
  <table style="width:100%">
    <tr>
      <th>ESP8266 (ESP-12)</th>
      <th>ESP32 (ESP-WEOOM32)</th> 
    </tr>
    <tr>
      <td>80-160 MHz</td>
      <td>80-240 MHz</td> 
    </tr>
    <tr>
      <td>Xtensa L106 Core</td>
      <td>Xtensa LX6 Dual-Core</td> 
    </tr>
    <tr>
      <td>50 KB SRAM</td>
      <td>520 KB SRAM</td> 
    </tr>
    <tr>
      <td>2 MB Flash</td>
      <td>4 MB Flash</td> 
    </tr>
  </table>
</div>
<vue-markdown class="mt-2">

[Espressif](https://www.espressif.com/en/products/hardware) is the place for the latest information about these hardware platforms.


##### NodeMCU and NodeMCU-32S

NodeMCU (or NodeMCU-32S for ESP32) is the general name for the products that integrate button inputs, LED outputs, USB-to-Serial interface to ESP8266 modules together.

This USB-to-Serial interface provides a convenient way to connect ESP8266 module from its development tools running on host computers, and to download application images to it.
The USB interface also naturally provide the power required by this system.

</vue-markdown> 
<vue-markdown id="DocMongooseOs" class="mt-5">
##### Mongoose OS

[Mongoose OS](https://mongoose-os.com/) is the recommnended OS (and development environement too) using on ESP8266 or ESP32 boards to connect to AIoThings. 

Mongoose OS has reference designs to build secured connections to major cloud operators, including AWS.

[Tutorial to connect to Cloud](https://mongoose-os.com/docs/mongoose-os/cloud/aws.md) is prepared for a step-by-step guidance to connect a ESP board to AWS cloud.
However, we will also show the steps here to explain how to access ESP board resources from AIoThings microservices using next chapters.

##### ESP32 + AIoThings

1. Create a Thing Object from AIoThings
2. Download Certificate and Keys created from Thing Object to the computer Mongoose tool is installed 
3. Create Mongoose OS app project from the Mongoose tool. And start develop applications in Javascript.
4. Add following lines to mos.yml file: (***Please note that device.id or filename cannot be longer than 32 characters.*** )
``` bash
config_schema:
  - ["mqtt.enable", true]
  - ["mqtt.ssl_cert", "aiot-certificate.crt"]
  - ["mqtt.ssl_key", "aiot-private.key"]
  - ["mqtt.ssl_ca_cert", "ca.pem"]
  - ["mqtt.server", "xxxxxxxxxxxx-ats.iot.{region}.amazonaws.com:8883"]
  - ["aws.thing_name", "Thing-ID"]

```
``` bash
libs:
  - origin: https://github.com/mongoose-os-libs/boards
  - origin: https://github.com/mongoose-os-libs/js-demo-bundle
  - origin: https://github.com/mongoose-os-libs/aws
```
5. aiot-root-CA.crt downloaded from AIoThings is not required here. This CA file is for Server Certificate purpose. It allows your devices to verify that they're communicating with AIoThings and not another server impersonating. As the CA certificates (used to sign for AWS IoT server certificates) are already included inside the [ca-bundle](https://github.com/mongoose-os-libs/ca-bundle) of Mongoose packages, just leave the ca_cert field with 'ca.pem'.
6. Use the format of MQTT publish message topic as 'aiot/{User ID}/{Microservice name or Thing ID or +}/{topic}' to send and receive MQTT message:
``` javascript
    MQTT.pub(topic, message, 0 /* QoS */);
```
7. Check the example source from [here](https://github.com/hansontech/esp32-aiothings-app)

##### ESP8266 + AIoThings

Most contents of the previous section ***ESP32 + AIoThings*** are still applicable to this ESP8266 case, just a difference that we cannot use JavaScript anymore.

ESP8266 has significantly smaller SRAM than ESP32, it makes the tutorials being used by Mongoose to connect to AWS become too big for ESP8266 to run. 

The solution to this issue is to develop applications using C instead of JavaScript.

Following is the example mos.yml settings for this C based example:
``` bash
config_schema:
  - ["mqtt.enable", true]
  - ["mqtt.ssl_cert", "aiot-certificate.crt"]
  - ["mqtt.ssl_key", "aiot-private.key"]
  - ["mqtt.ssl_ca_cert", "ca.pem"]
  - ["aws.thing_name", "{Thing ID}"]
  - ["mqtt.server", "xxxxxxxxxxx-ats.iot.{region}.amazonaws.com:8883"]
  - ["device.id", "{name not longer than 32}"]
  - ["i2c.enable", true]
  - ["wifi.ap.enable", false]
  - ["wifi.sta.enable", true]
  - ["wifi.sta.ssid", "{SSID name}"]
  - ["wifi.sta.pass", "{SSID password}"]
  
libs:
  - origin: https://github.com/mongoose-os-libs/boards
  - origin: https://github.com/mongoose-os-libs/ca-bundle
  - origin: https://github.com/mongoose-os-libs/rpc-service-config
  - origin: https://github.com/mongoose-os-libs/rpc-service-fs
  - origin: https://github.com/mongoose-os-libs/rpc-uart
  - origin: https://github.com/mongoose-os-libs/rpc-service-i2c
  - origin: https://github.com/mongoose-os-libs/wifi
  - origin: https://github.com/mongoose-os-libs/aws
build_vars:
  SSL: mbedTLS

```

Also, check the example source from [here](https://github.com/hansontech/esp8266-aiothings-app)

Again, ***please note that device.id or filename cannot be longer than 32 characters.***

The article [AWS IoT on Mongoose OS (Part 1 & 2)](https://aws.amazon.com/blogs/apn/aws-iot-on-mongoose-os-part-1) from AWS Partner Network is still available, especially for the C example parts. 


</vue-markdown> 

<vue-markdown id="DocMicroservice">
### Microservice

Microservice plays the most important role in AIoThings. It makes this cloud configurable through programming.

Microservices deliver functionality as granular building blocks, allowing developers to quickly build, test, deploy
Microservices are also great enablers for continuous delivery, allowing frequent releases for users while keeping
the rest of the system available and stable.


A microservice includes a code block and input/output message topics.

The code block looks like: 
```Javascript
const aiot = require('aiothings');

// process.env.INPUT_MESSAGE_TOPIC
// process.env.OUTPUT_MESSAGE_TOPIC
// event.sender

exports.handler = async (event, context) => {
    aiot.setInput(event);
    // Add your code here
    await aiot.consoleOutput('console display:' + process.env.MSERVICE_NAME); // display from console
	  await aiot.messagePublish({data: 'payload'}); // must be a JSON
};
```
By importing aiothings module to the code block, developers can use [Microservices APIs](#DocMicroserviceApi) to access data storage, message queues and database globally.

Message queue as an example, it provides an ordered queue storage between two or more microservices. A use case is that, IoT data sent from devices are put to a message queue first, and mobile app will retrive them later when it becomes active.

When a new microservice is created, it will automatically subscribe to its input message topic. 

</vue-markdown> 

<vue-markdown id="DocMicroserviceShared">

##### Private and public (shared) microservices


A private microservice can only be triggered by a message from the owner of the microservic, OR, from the system ('admin').
On the other hand, shared (public) microservices can also receive input messages from any other user.
In either case, by default, microservices use the sender of the input messages as the sender of output messages.
Optionally, a microservice is able to set the sender of the output message to its owner instead of the input message sender, by setting the API flag.
If the input message is from the system, then, the microservice will attach it's owner user as the sender of its output message.

Again, all users can see and have access to the shared microservices. Conversely, private microservices are only available to their owners.

**Shared** option can be set from the edit page of microservices.
Then, other users find shared microservices by querying them from [Shared Solution](#DocSharedSolution).

</vue-markdown> 

<vue-markdown id="DocMicroserviceTopic">

##### Message topic

Imput and output messages follow MQTT standard. 
The message topic is an UTF-8 string. It consists of one or more topic levels. Each topic level is separated by a forward slash ( / ).

If a microservice doesn't have input or output messages, for example REST API handlers, **'null'** should be assigned to them, where 'null' is reserved by the system for this purpose. 

Here are some examples of message topics:
```Topics
myhome/groundfloor/livingroom/temperature
USA/California/San Francisco/Silicon Valley
5ff4a2ce-e485-40f4-826c-b1a5d81be9b6/status
Germany/Bavaria/car/2382340923453/latitude
```

###### Wildcards

Input message topics can include wildcards to subscribe to multiple topics simultaneously. 
A wildcard can only be used for input message topics, not to output message topics. 
There are two different kinds of wildcards: Single Level: + and Multi Level: #.
For example,
```wildcards
myhome/groundfloor/+/temperature
myhome/groundfloor/#
```

When a new output message with this input message topic is published, this event will trigger the microservices (with the input message topic) to execute (by allocating runtime resources) and goes to sleep after finishing their tasks.

During the execution of the code block, the microservice publishes output messages with its output message topic - [messagePublish](#DocNodejsMessagePublish).

</vue-markdown> 

<vue-markdown id="DocMessageTopicTree">
#### Message Topic Tree

The button located in the microservice list window is a utility for displaying multi-level message topic structure. With this display, users get a summary of their message flows, as well as the relationship between message topics and microservices.

```TopicTree
├ test/input
│ └ [testPython] test/output
├ device/data
│ ├ [sampleApiHandler] device/command
│ └ [ggHelloWorld] device/command
├ ifttt/input/create_new_thing1
│ └ [iftttCreateNewThingHandler] ifttt/output/new_thing_created
│   └ ifttt/output/#
│     └ [iftttSenderService] null
├ ifttt/demo1/setup
│ └ [iftttDemoSetup] ifttt/setup
│   └ [iftttServiceSetup] null
├ ifttt/input/create_new_thing
│ └ [simuOnlinePayment] userid_1536893927497/paid
└ timer/minute
  └ [minuteUpdater] ifttt/output/new_thing_created
    └ ifttt/output/#
      └ [iftttSenderService] null
```

The last few lines of the example tree show that the input message with topic ***timer/minutes*** triggers the microservice ***minuteUpdater***, and the microservice will publish the output message using the topic ***ifttt/output/new_thing_created***. Subsequently, the microservice ***iftttSenderService*** is triggered by its input message topic ***ifttt/output/#*** to capture the previously published ***ifttt/output/new_thing_created*** message.

As you can from this example, this function takes into account the wildcard pattern of the input message topic when generating tree charts.

```EmptyLines


```
</vue-markdown>

<vue-markdown id="DocApi" class="mt-3">
### REST API

A RESTful API is an application program interface (API) that uses HTTP requests to GET, PUT, POST and DELETE data.
These APIs make it possible to let AIoThings services to interact with other Internet services.

AIoThings provide REST API editor and gateway for developers to create their own REST APIs, with the form of: `https://api.aiothings.com/{api name}/{path}'<div class=""></div>

A REST API is defined to include following parts:
1. **API Name**: Name of the API
2. **Description**: to describe what this API stands for and how to use it. It may include the HTTP methods in support, their query parameters, and also the expected responses.
3. **Path**: The list of paths supported. For REST API requests with supported paths, the gateway will pass the request to the REST API's predefined backend handler (a microservice).
4. **Handler**: The backend handler that handles this API request. Handlers are actually microservices capable to process HTTP requests.
5. **Authorization**: The authorization option for this REST API. If set to Auth, the API requires the autorization check from the gateway before passing the request to the handler, or NONE for no authorization check is required. The authorization data is obtained through user's login process, and is used to sign the HTTP requests. 
 
A REST API can be accessed through the URL address with the form of 
```URL
  https://api.aiothings.com/{API name}/path
```

AIoThings defines a set of REST API available for users to access, for exameple [IoT Data](#DocIotDataRestApi).
</vue-markdown> 
<vue-markdown id="DocAppConnector">
### App Connectors

App Connectors are the interfaces AIoThings has prepared for developers to connect to external 3rd party services and mobile/home applications easily.
It utilizes popular application connectivity platforms (IFTTT and Zapier) for this purpose.

An App Connector defines a couple of message types that allow developers create / send / receive data to the target external services, such as Amazon Alexa, Facebook Messenger and Google Assistant. 
It is also possible for a developer to create his/her own App Connector, using the REST API and other AIoThings functions.


</vue-markdown> <vue-markdown id="DocSharedSolution">
### Shared Solutions

The Shared Solution Window shows microservices that are shared by other users.
Users can query the message topics and microservices they are interested in and use them.

There are two ways for developers to leverage other user's sharing resources:
1. Send or receive messages to/from the shared resources using their input/output message topics. As the caller's user ID is automatically attached to these messages, the microservices can handle them separately and send back to callers.
2. Duplicate the shared microservices and run them separately in user's own space.

The window also show other type of shared resources such as Node-RED Node and Flow libraries. 

</vue-markdown> 

<vue-markdown id="DocConsole">
### Console

The Console Window is used for debug and test purposes. 

Developers can use it to:
1. Embed console-output codes inside microservice code blocks to output debug messages to this console window.
2. Send an input message (topic and payload) as a trigger.

Any messages with the topic format of +/{user id}/console/output will be displayed on this window.

User can use [consoleOutput](#DocNodejsConsoleOutput) API to output debug messages during the execution of microservices. In this case, {user id} will be automatically added ahead of the 'console/output' topic.


</vue-markdown> 
<vue-markdown id="DocIotData">

### IoT Data Access

Typical IoT data is in the form of { Device ID, Timestamp, Data }. This means that the device creates and sends data at a specific time.
User's data access is available by sending messages with the message topic ***aiot_iotdata/query***.
The system will reply the query result as separate messages with the topic of ***aiot_iotdata/response*** from its microservice ***aiotIotDataQuery***.

It is the user's responssibility to specify Device ID (or Thing ID) and Time Period (start and end) in the query request.
```QueryRequest
await aiot.messagePublish('aiot_iotdata/query', {
    ThingId:    'XYZ'，  // required
    StartTime:  12345678，
    EndTime:    12456789
})
```

If StartTime and EndTime are not specified, then the system will do the query from the latest tuple.

If the query has only StartTime specified, it will bring as much as possible the data allowed for a query from the start time.

If the query has only EndTime specified, it will bring as much as possible the data allowed for a query until the end time.

The query response is in the form of
```QueryResponse
{
  ThingID: 'XYZ',
  DataList: [
    {
      TimeStamp: 12345678
      Data: { ... }
    },
    ...
  },
  ContinueTime: 12567890 // Optional
}
```
The ContinueTime field only appears if there is more data left in the last query.

The ContinueTime field can be used as the StartTime (or EndTime) for conesecutive query requests. It is the responsibility of the user to send a new request to obtain the successive query result.

#### Write to IoT Database

IoT device sends it's data to cloud through MQTT messages. The MQTT topic should be
```
    aiot/{User ID}/{Thing ID}/aiot_iotdata/put
```
and the payload is included as a JSON with "data" as the key.
```
    {
      "data": {
        "ThingId": "XYZ",
        "DataList": [
          {
            "TimeStamp": 1560406698331,
            "Data": {
              "light": "off"
            }
          }
        ]
      }
    }
```
The system will attach a time stamp and save them together with data to the IoT database.

</vue-markdown> 
<vue-markdown id="DocIotDataRestApi">

#### REST API Query for IoT data

User's IoT data is accessible from the system provided REST API 
```
  https://api.aiothings.com/iotdata
```

This API reqires the authroization. Users need to sign in to use this REST API.
It supports HTTP GET method with the query strings equivalent to the message topic ***aiot_iotdata/query*** we introduced earlier.
```QueryRequest
  {
    ThingId:    'XYZ',  // required
    StartTime:  12345678,
    EndTime:    12456789
  }
```

For example,
```
  https://api.aiothings.com/iotdata/query?ThingId=XYZ&StartTime=12345678&EndTime=12456789

```

Then, the API replies the query result synchronously with it's response.
```
  { 
    "DataList":[
      { 
        "TimeStamp": 1560406698331,
        "Data": { "pump": "on", "light": "off" }
      }
    ]
  }
```

```


```
</vue-markdown> 
<vue-markdown id="DocMicroserviceApi">
### Microservice APIs

The set of APIs are used inside Microservices to achieve the functions required to implement applications, including to publish messages, to put/get from storage, and to save/retrieve from message queues.

Microservices also can use APIs from AWS SDK to realize application logics, as long as the user obtained the required resource permissions. 
In fact, the Microservice APIs here are also implemented by APIs from AWS SDK.

</vue-markdown>

<vue-markdown id="DocMicroserviceApiNodejs">
```


```
### Node.js functions 


&nbsp;
&nbsp;
&nbsp;

</vue-markdown>
<div class="borderLine">
  <br />
</div>
<vue-markdown class="borderLine" id="DocNodejsMessagePublish">
#### messagePublish

```JavaScript
messagePublish( message ) => Promise
```
To publish a message with this Microservice's Output Message Topic.
* message -- (JSON)
  * The message in JSON format that is going to be published.

**Example**
```JavaScript
const aiot = require('aiothings');
await aiot.messagePublish( {error: null, data: { on: true}} );
```
</vue-markdown> 

<vue-markdown class="borderLine" id="DocNodejsMessageQueueSend">
#### messageQueueSend

```JavaScript
messageQueueSend( queueName, message ) => Promise
```
To send a message to a message queue. 
A message queue is a queue (first come first out) that is used to store messages in sequence.

* queueName -- (String)
  * Name of the message queue.
* message -- (JSON)
  * The message in JSON format.

**Example**
```JavaScript
const aiot = require('aiothings');
await aiot.messageQueueSend( 'QueueOne', {data: { on: true}} );
```
</vue-markdown> 

<vue-markdown class="borderLine" id="DocNodejsMessageQueueGet">
#### messageQueueGet

```JavaScript
messageQueueGet( queueName ) => Promise
```
To retrieve a message from a message queue.

* queueName -- (String)
  * Name of the message queue.
* message -- (JSON)
  * The message in JSON format.

**Example**
```JavaScript
const aiot = require('aiothings');
let message = await aiot.messageQueueGet( 'queueOne' );
```
</vue-markdown> 

<vue-markdown class="borderLine" id="DocNodejsStorePutObject">
#### storePutObject

```JavaScript
storePutObject(objectName, objectData) => Promise
```
To store data to storage, with an object name. Any Microservice can use the object name to store or retrieve data stored from other Microservice.

* objectName -- (String)
  * The object name used to store or retrive data.
* objectData -- (JSON)
  * The object data to be stored to the storage.

**Example**
```JavaScript
const aiot = require('aiothings');
await aiot.storePutObject( 'ObjectOne', {data: { on: true}} );
```
</vue-markdown>

<vue-markdown class="borderLine" id="DocNodejsStoreGetObject">
#### storeGetObject

```JavaScript
storeGetObject(objectName)
```
To get data from a storage object, with an object name. 
Any Microservice can use the object name to store or retrieve data stored from other Microservice.

* objectName -- (String)
  * The object name used to store or retrive data.

**Example**
```JavaScript
const aiot = require('aiothings');
let data = await aiot.storeGetObject( 'ObjectOne' );
```
</vue-markdown> 

<vue-markdown class="borderLine" id="DocNodejsConsoleOutput">
#### consoleOutput

```JavaScript
consoleOutput( message ) => Promise
```
To output a message to the console. 
The console message will be displayed on the Console window.

* message -- (String)
  * The output message to Console.

**Example**
```JavaScript
const aiot = require('aiothings');
await aiot.consoleOutput('this is a debug message');
```
</vue-markdown> 

<!--
<vue-markdown id="DocExamplesClawMachine">

### Examples


#### Example Cloud to Claw Machine



##### Background
Claw Machines have become popular in Taiwan in the last couple of years. They are operated as unmanned stores. A new round of play starts when the user inserts coins to the machine.
A store is normally shared by multiple leaseholders, each leaseholder takes their own efforts to attract customers, and maximize profits.

For this exercise, we upgrade the claw machine to accept online payments and NFC based contactless payment (For example, EasyCard in Taiwan) as well.

### Steps
1. Create a Thing Object
2. Run Node-RED on Raspberry Pi
3. Import AIoThings Connector Flow to Node-RED
4. Apply Thing Object Certificates to Node-RED Flow
5. Design Node-RED flow to emulate Coin Inserter
6. Alexa to simulate an event of online payment
 


      </vue-markdown>  
-->
    </div>
  </b-container>
</template>

<script>
import VueMarkdown from 'vue-markdown'
import { eventBus } from '../main'

// utility copied from https://stackoverflow.com/questions/123999/how-to-tell-if-a-dom-element-is-visible-in-the-current-viewport
function elementInViewport (el) {
  var top = el.offsetTop
  var height = el.offsetHeight

  while (el.offsetParent) {
    el = el.offsetParent
    top += el.offsetTop
  }

  return (
    top >= window.pageYOffset &&
    (top + height) <= (window.pageYOffset + window.innerHeight)
  )
}

export default {
  name: 'home',
  data: function () {
    return {
      idDocs: null,
      activeId: null
    }
  },
  components: {
    VueMarkdown
  },
  computed: {
  },
  watch: {
    /*
    activeId: function (newId, oldId) {
      if (newId !== oldId) {
        eventBus.$emit('changeDocId', newId)
      }
    }
    */
  },
  methods: {
    offsetAnchor () {
      if (location.hash.length !== 0) {
          window.scrollTo(window.scrollX, window.scrollY - 80)
      }
    },
    handleScroll () {
      // console.log('scroll')
      let that = this
      let currentDocElement = null
      Array.prototype.forEach.call(this.idDocs, function (el, i) {
        // "el" is your element
        // console.log( el.id ); // log the ID
        if (elementInViewport(el)) {
          if (that.activeId !== el.id) {
            that.activeId = el.id
            if (!currentDocElement || (currentDocElement && currentDocElement.offsetTop > el.offsetTop)) {
              currentDocElement = el
              eventBus.$emit('changeDocId', that.activeId)
            }
          }
          // console.log('id reached: ', el.id)
        }
      })
      /*
      this.idDocs.find(el => {
        // const el = document.getElementById(number)
        if (elementInViewport(el)) {
          this.activeBlock = el.id
          console.log('id reached: ', el)
        }
      })
      */
    }
  },
  created () {
    /*
      In order to make a fixed distance jump from the tag
      Otherwise, the TAG (id=) portion is hidden by the top menu portion
    */
    // This will capture hash changes while on the page
    window.addEventListener('hashchange', this.offsetAnchor)

    // http://jschof.com/vue/scroll-tracking-in-vue-applications-some-gotchas/
    document.addEventListener('scroll', this.handleScroll)
  },
  mounted () {
    this.idDocs = document.querySelectorAll('[id]')
    console.log('idDocs: ', this.idDocs)
  },
  destroyed () {
    document.removeEventListener('scroll', this.handleScroll)
  }
}
</script>
<style>
table, th, td {
  border: 1px solid black;
  border-collapse: collapse;
  padding: 10px
}
table {
  border-spacing: 5px;
}
/*
vue-markdown {
  padding-bottom: 5px;
  margin-bottom: 5px;
  border-top: 1px solid grey
}
*/

.borderLine {
  padding-bottom: 5px;
  margin-bottom: 5px;
  border-bottom: 1px dotted grey
}
</style>