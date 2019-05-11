<template>
  <b-container>
 <vue-markdown id="DocIntroduction">
### Introduction
AIoThings has the features to help user to build cloud and IoT applications rapidly, without the need of learning curve that often prevents people from continuing their design works.
These features include:
</vue-markdown> 
            <ul>
              <li>Connect IoT devices securely, and collect data</li>
              <li>Create REST APIs, and interface with other cloud services, 
              <li>Design microservices to process IoT data, do analytic works</li> 
              <li>Interact with popular mobile/home apps</li>
            </ul>
<vue-markdown>
  ***We also provide professional services for your engineering projects.***
  ***Please contact us by service@hanson-tech.com***
</vue-markdown> 
<vue-markdown id="DocGetStarted" class="mt-4"> 
### Get Started
If you did not login yet, it is the time to create an account and login to our   website. 

You can use Facebook or Google - federated identities to login conveniently.

For an IoT application, normally it is required to connect to a hardware device from cloud. In this case, you need to decide what kind of hardware enablers you decide to use or are in use alreay.
For example, the IoT device can be actually an ordinary Windows computer, or an embedded system running Linux, or even a smaller system such as ESP8266/ESP32 over NB-IOT network.

However, AIoThings also can be used to develop cloud applications without the need of IoT connectivity. 

Microservice is the basic element of processing data, and a group of microservices working together through message flows will work as an application.

Means, you need to design the microservices and their input/output message flows.

By taking the advantage of AIoThings sharing features, you can reuse / copy other users' microservices, or share yours to others too.


</vue-markdown>  

<vue-markdown id="DocThingObject">

### Thing Objects

A Thing Object is a counterpart object living in AIoThing cloud to map to a physical IoT device.

It can be created, configured and removed. Once a thing is created, it has the unique certificate that is installed to the physical device to build a secured communication channel.

For edge devices running AWS Greengrass Core, we can deploy a microservice running on this edge device remotely. For example, we can deploy machine learning inference functions to the specific thing. 

</vue-markdown> 

<vue-markdown id="DocThingEnabler">

### Thing Enablers

Thing enablers are the selected hardware platforms that are recommeneded to use to build your own IoT application.

For example, you can use Raspberry Pi as a reference design to connect the Modbus sensors, and also to connect AIoThings cloud.
</vue-markdown> 

<vue-markdown id="DocPi">
### Raspberry Pi

Raspberry Pi is a small and affordable computer that you can use to start programming for your edge computing needs.

Different to ESP32 or ESP8266 series single board solutions, Pi is a complete computer system running Linux operating system.
This makes it an ideal platorm for sophisticated applications, such as machine learning with edge computing. 

There are two ways to connect AIoThings from Raspberry Pi, 1) go through Node-RED, or 2) go through AWS IoT SDK.

For IoT applications without needs of advanced edge computing, such as machine learning through AWS IoT Greengrass service, we recommend Node-RED.

As Node-RED developer community has plenty of examples and resources telling how to develop an IoT application, it can significantly reduce the learning curves from prototyping to production of IoT applications.

For more information about Raspberry Pi, please check this [official site](https://www.raspberrypi.org/).

</vue-markdown> 
<vue-markdown id="DocNodeRed" class="mt-5">
##### Node-RED

Node-RED is a flow-based programming environment for the Internet of Things.

It provides a browser-based editor that makes it easy to wire together flows using the wide range of nodes in the palette that can be deployed to its runtime.

For more information about Node-RED, please check this [site](https://nodered.org/).

In order to connect AIoThings cloud from Node-RED running IoT device, we provide an example Node-RED flow called 'AIoThings Connector'<div class=""></div>

1. Please move to [Shared Solutions], and select [Node-RED Flows] tab. Or directly visit [here](https://flows.nodered.org/?term=aiothings&num_pages=1). Enter 'AIoThings' from the --Search Library-- field. 
2. Select 'AIoThings Connector' found from search, and import this flow to the Node-RED Editor of your Raspberry Pi.
3. Create a Thing from AIoThings
4. Apply Thing Object Certificates and Keys to MQTT node settings of Node-RED. You can change them from 'AIoT Alive Request' node.


</vue-markdown> 
<vue-markdown id="DocESP8266" class="mt-5">
### ESP32 / ESP8266

ESP8266 is a Wi-Fi SoC that integrates Tensilica L106 32-bit processor, and SRAM / ROM too.

In many cases, it is also used to mention many Wi-Fi modules based on this SoC, such as ESP-12F, ESP-WROOM-S2, ESP8266MOD, and the modules also integrate SPI Flash memory.

ESP32 is seen as the upgraded version of ESP8266, that integrates Wi-Fi and Bluetooth functionalities, dual (or single) Telsilica LX6 cores, and SRAM as well.

In addition to the faster processing speed, ESP32 has SRAM significantly larger than ESP8266, makes it suitable to more broader IoT applications. Although it comes with higher costs than its previous generation - ESP8266.

Following table shows the differences at a glace between these two processors and the modules based on them.
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

[Espressif](https://www.espressif.com/en/products/hardware) is the place for more information about these hardware solutions.


##### NodeMCU and NodeMCU-32S

NodeMCU in its hardware form comes with ESP8266 which is based on the ESP-12 module, button inputs, LED outputs, and USB-to-Serial interface.

This USB-to-Serial interface provides a convenient way to connect with development tools, running on host computers, to download firmware images.

NodeMCU-32S is the counterpart product comes with the ESP32 based module.

##### Mongoose OS

[Mongoose OS](https://mongoose-os.com/) is the recommnended OS and development environement we are using on ESP boards to connect to AIoThings. 

Mongoose OS has reference designs to build secured connections to major cloud operators, including AWS.

[Tutorial to connect to Cloud](https://mongoose-os.com/docs/mongoose-os/cloud/aws.md) is prepared for a step-by-step guidance to connect a ESP board to AWS cloud.

We will have the complete description about how to access ESP board resources from/to AIoThings microservices in following chapters as well.

##### ESP32 + AIoThings

1. Create a Thing from AIoThings
2. Download Certificate and Keys 
3. Create Mongoose OS app project. We develop applications in Javascript.
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
6. Use the format of MQTT publish message topic as 'aiot/{User ID}/{topic}' to send and receive MQTT message:
``` javascript
    MQTT.pub(topic, message, 0 /* QoS */);
```
7. Check the example source from [here](https://github.com/hansontech/esp32-aiothings-app)

##### ESP8266 + AIoThings

Most of the previous section ***ESP32 + AIoThings*** are still applicable to ESP8266 case, just a difference that we cannot use JavaScript anymore.

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

The article [AWS IoT on Mongoose OS (Part 1 & 2)](https://aws.amazon.com/blogs/apn/aws-iot-on-mongoose-os-part-1) from AWS Partner Network is still quite useful, especially for the C example parts. 


</vue-markdown> 

<vue-markdown id="DocMicroservice">
### Microservice

Microservice plays the most important part of AIoThings functions. It is constructed by a set of functions which has a single entry point, and input/output message topics.

When a new microservice is created, it will subscribe the input message topic it has. 
A new message with this input message topic will trigger this microservice to execute (by allocating runtime resources), then it will release resources and goes to sleep after finishing its tasks.
During the execution of the functions, a microservice also is able to publish one or more messages with its output message topic.

</vue-markdown> 

<vue-markdown id="DocConsole">
### Console

The console window is normally used for debug and test purposes.

Any messages with its topic format of +/{user id}/console/output will be displayed on this window.

User can use consoleOutput API to output debug messages during the execution of microservices. In this case, {user id} will be automatically added ahead of the 'console/output' topic.


</vue-markdown> 

<vue-markdown id="DocExampleClawMachine">
### Example Cloud to Claw Machine

>

#### Background
Claw Machines have become popular in Taiwan in last couple of years. They are operated as unmanned stores. A new round of play starts when the user inserts coins to the machine.
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
    </div>
  </b-container>
</template>

<script>
import VueMarkdown from 'vue-markdown'

export default {
  name: 'home',
  data: function () {
    return {
    }
  },
  components: {
    VueMarkdown
  },
  computed: {
  },
  methods: {
  },
  created () {
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

</style>