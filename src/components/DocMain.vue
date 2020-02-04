<template>
  <b-container>
  <div class="wrapper">
 <vue-markdown id="DocIntroduction">
### Introduction
AIoThings is a SaaS (Software as a Service), a development platform with the ability to **quickly** build cloud and IoT applications, **without the need** of comprehensive cloud programming knowledge that often prevents developers from continuing their core design works.

These features include:
</vue-markdown> 
            <ul>
              <li>Connect IoT devices securely, and collect data</li>
              <li>Create REST APIs, and interface with other cloud services, 
              <li>Design cloud services to process IoT data, do analytic works</li> 
              <li>Interact with popular mobile/home apps</li>
            </ul>
<vue-markdown>
In response to the growing demand for IoT data analysis and AI (Artificial Intelligence) skills applied to applications, AIoThings can also effectively implement machine learning (ML) training and inference functions on cloud and edge devices with much less complexity.

AIoThings is built on AWS.

AIoThings is an open-source project and it's [source code](https://github.com/hansontech/aiothings) is also available for public access.

***We also provide professional services for custom engineering projects.***
***Please contact us at service@aiothings.com***
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
                      <b-col><code>a3vgppxo7lddg8-ats.iot.ap-southeast-2.amazonaws.com</code></b-col>
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
      <th>ESP32 (ESP-WROOM32)</th> 
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

<vue-markdown id="DocFreeRTOS">
### FreeRTOS and Amazon FreeRTOS

**FreeRTOS** is recognized as an option for lightweight real-time operating systems.
**Amazon FreeRTOS** enhances the FreeRTOS kernel with additional libraries for connectivity, security, and over-the-air (OTA) updates provided with AWS IoT services.

Since AIoThings uses AWS IoT to serve IoT devices, it also supports **FreeRTOS** with simple configuration.
</vue-markdown>
<b-img style="padding:20px;" src="/static/AmazonFreeRTOS-arch.png" fluid align=center />
<vue-markdown>
In fact, Amazon FreeRTOS provides a wrapper layer for FreeRTOS functionality, and the definition can be found on [AWS IoT Device SDK C](https://docs.aws.amazon.com/freertos/latest/lib-ref/c-sdk/main/index.html).
Amazon FreeRTOS software package also includes demo examples that accelerate development.

The qualified devices for Amazon FreeRTOS are listed on the [AWS Partner Device Catalog](https://devices.amazonaws.com/search?page=1&sv=freertos). And the following is an example list of supported platforms:
* ATECC608a Zero Touch Provisioning Kit for AWS IoT
* Cypress CYW943907AEVAL1F Development Kit
* Cypress CYW954907AEVAL1F Development Kit
* Espressif ESP32-DevKitC
* Espressif ESP-WROVER-KIT
* Infineon XMC4800 IoT Connectivity Kit
* Marvell MW320 AWS IoT Starter Kit
* Marvell MW322 AWS IoT Starter Kit
* MediaTek MT7697Hx Development Kit
* Microchip Curiosity PIC32MZEF Bundle
* Nordic nRF52840-DK
* NXP LPC54018 IoT Module
* OPTIGA Trust X Security Solution
* Renesas RX65N RSK IoT Module
* STMicroelectronicsSTM32L4 Discovery Kit IoT Node
* Texas Instruments CC3220SF-LAUNCHXL
* Microsoft Windows 7 or later, with at least a dual core and a hard-wired Ethernet connection
* Xilinx Avnet MicroZed Industrial IoT Kit

</vue-markdown>

<vue-markdown id="DocThingEdge">
### Edge computing

IoT Devices (also called IoT Object) can be solely a Thing device or function as an Edge device. 
Edge devices, by AIoThings definition, are able to run user's microservices locally.
This feature is especially crucial for the edge computing, such as machine learning inferences functions, to reduce communication traffics to clouds and mitigate cloud computing loadings.
In order to achieve this goal, edge devices have to run extra agent software to receive service deployment commands from the cloud.
AWS IoT Greengrass Core software is the agent software AIoThings is leveraging.

With the Edge Setting tab of AIoThings IoT Device window, users can define three types of items deploying to this Edge device.
1. **Microservice**: Similar to other microservices, users create and edit microservices being deployed to Edge deviecs. However, they have several differences comparing to ones running on cloud, including that they use AWS Greengrass Core SDK APIs instead of AIoThings SDK or AWS SDK to pusbish and receive messages. 
2. **Resource**: Local resources, such as files and directories of lcoal file system and device resources accessible through /dev from Unix systems.
3. **Connector**: Prebuilt modules that help accelerate the development lifecycle for common edge scenarios. They make it easier to interact with local infrastructure, device protocols, AWS, and other cloud services. With connectors, you can spend less time learning new protocols and APIs and more time focusing on the logic that matters to your business.

</vue-markdown>
<vue-markdown id="DocThingEdgeConfiguration">
#### Configuration of Edge devices
</vue-markdown>

<div>
    The steps to setup a Greengrass Core device are:
                      <ol>
                        <li>Download <a target="_blank" href="https://github.com/awsdocs/aws-greengrass-developer-guide/blob/master/doc_source/what-is-gg.md#gg-downloads">AWS IoT Greengrass Core software</a> that runs on this core device.</li>
                        <li>
                          Download <a v-b-tooltip.hover="'that enable secure communications between AWS IoT'">security certificates</a> and <a v-b-tooltip.hover="'that contains configuration information specific to your AWS IoT Greengrass core and the AWS IoT endpoint.'">the config.json file of this device as a zipped setup file.</a>
                        </li>
                        <li>Move and decompress the downloaded files of [1] amd [2] to the Edge device, under the same path.
                          <pre class="at-code"><code>sudo tar -xzvf greengrass-OS-architecture-1.7.0.tar.gz -C /
sudo unzip thing-id-setup.zip -d /greengrass</code></pre>
                        <li>Start AWS IoT Greengrass on your core device. 
                          <pre class="at-code"><code>cd /greengrass/ggc/core/
sudo ./greengrassd start</code></pre>
                        </li>
                        <li>Set up the core device to start AWS IoT Greengrass on system boot.<a href="https://docs.aws.amazon.com/greengrass/latest/developerguide/gg-core.html#start-on-boot">(Example)</a></li>
                      </ol>
                      <p>
                        Check <a href="https://docs.aws.amazon.com/greengrass/latest/developerguide/gg-device-start.html">AWS page</a> for further information about the setup procedure.
                      </p>
</div>
<vue-markdown id="DocThingEdgeMachineLearning">
#### Machine Learning over Edge devices
Machine learning (ML) inference function at Edge devices use edge-generated data and cloud-trained models. 
This approach benefits from the low latency and cost savings of running local inference, still take advantage of cloud computing for training models and complex cloud applications.

Users can train their inference models anywhere and deploy them as machine learning resources, then access the resources from microservices running over Edge devices.
For example, users can build and train deep-learning models in Amazon SageMaker.

In order to perform inference function successfully at an Edge device, the Edge device needs to install runtime framework libraries for ML inference first, then access these libraries later from the inferencing microservices.
These frameworks can be [Apache MXNet](https://mxnet.incubator.apache.org) or [TensorFlow](https://www.tensorflow.org).

The runtime libraries usually provide various releases optimized to their specific hardware architecture (for example, NVIDIA CUDA and Intel MKL).
Python 2.7 is, currently, the programming language in support from AIoThings for ML inference functions.

Local microservices at edge devices run on a container environment. For this reason, local and cloud resources need to map to logical paths of the container for microservices to access. 
These resources include:
* **Local device resource**, device files, such as /dev/video0
* **Local volume resource**, local files or directories
* **Machine learning model resource**, a ML model that includes multiple files representing model parameters, synset - synonym ring, computation graph (of Neuro Network) respectively.

a ML model should be zipped and uploaded during the creation of a resource, and map to a logical pathname. Then, in the inference function, the model data will be accessed through regular file read operations with {logical pathname}+{file name} as the full file path.

Following is the snippet of an example inference function:
```
import greengrasssdk
import numpy as np
import mxnet as mx
import cv2
Batch = namedtuple('Batch', ['data'])

class ImagenetModel(object):
    #Loads a pre-trained model locally or from an external URL
    #and returns an MXNet graph that is ready for prediction
    def __init__(self, synset_path, network_prefix, params_url=None,
                 symbol_url=None, synset_url=None, context=mx.cpu(),
                 label_names=['prob_label'], input_shapes=[('data', (1, 3, 224, 224))]):

        with open(synset_path, 'r') as f:
            self.synsets = [l.rstrip() for l in f]

        # Load the network parameters from default epoch 0
        sym, arg_params, aux_params = mx.model.load_checkpoint(network_prefix, 0)

        # Load the network into an MXNet module and bind the corresponding parameters
        self.mod = mx.mod.Module(symbol=sym, label_names=label_names, context=context)
        self.mod.bind(for_training=False, data_shapes=input_shapes)
        self.mod.set_params(arg_params, aux_params)
        self.camera = None

    def predict_from_image(self, cvimage, reshape=(224, 224), N=5):
        topN = []

        # Switch RGB to BGR format (which ImageNet networks take)
        img = cv2.cvtColor(cvimage, cv2.COLOR_BGR2RGB)
        if img is None:
            return topN

        # Resize image to fit network input
        img = cv2.resize(img, reshape)
        img = np.swapaxes(img, 0, 2)
        img = np.swapaxes(img, 1, 2)
        img = img[np.newaxis, :]

        # Run forward on the image
        self.mod.forward(Batch([mx.nd.array(img)]))
        prob = self.mod.get_outputs()[0].asnumpy()
        prob = np.squeeze(prob)
        # Extract the top N predictions from the softmax output
        a = np.argsort(prob)[::-1]
        for i in a[0:N]:
            topN.append((prob[i], self.synsets[i]))
        return topN

model_path = '/greengrass-machine-learning/mxnet/squeezenet/'
global_model = ImagenetModel(model_path + 'synset.txt', model_path + 'squeezenet_v1.1')

def microservice_object_classification_run():
    # comply to AIoThings message header, in order to be subscribed by cloud microservices
    messageHeader = 'aiot/' + os.environ['OWNER_ID'] + '/' + os.environ['MSERVICE_NAME'] 
    try:
        image = cv2.imread('/home/ggc_user/pi/camera_image.jpg', cv2.IMREAD_COLOR)
        predictions = global_model.predict_from_image(image)
        # publish predictions
        client.publish(topic= messageHeader + '//world', payload='New Prediction: {}'.format(str(predictions)))
    except:
        e = sys.exc_info()[0]
        print("Exception occured during prediction: %s" % e)
```

Please note that, this function imports AWS's **Greengrass SDK** from the statement of 'import greengrasssdk', and uses **publish** API to send the inference results as AIoThings messages.
AIoThings only allow messages complying to its message header format to be receivable from its cloud microservices. The message header format is: **'aiot/{Sender's User Id}/{Sender's Microservice Name}/'**

</vue-markdown>
<vue-markdown id="DocThingProvisioning">
### Just-in-time provisioning

For an IoT device manufacturer, it requires to provision a lot of devices in a secure and scalable manner connecting to the cloud, rather than manually creating a thing object and thing certificates.
The just-in-time provisioning allows devices registering to AIoThings without requiring human intervention.

As we mentioned previously, the communication between IoT devices and AIoThings cloud is secured by TLS. And it needs PKI (Public Key Infrastructure) certificates to authenticate each other, in two ways, during MQTT connections.

First of all, AIoThings users (manufacturers) need to register a series of device serial numbers to database tables and then assigning a set of certificates to the serial numbers.
Next, the serial number will be uniquely assigned to each of the provisioning devices.
Device provisioning API is the REST API, either through system provides or through user defines, that receives a pair of user-ID and serial number as the request, and responses with the information required for secured MQTT connections, including certificates.
Lastly, the provisioned device now has enough data to set up a secured MQTT connection with AIoThings.

And the entire process is carefully guarded to prevent man-in-the-middle attacks. For example, data returned from the provisioning REST API should be signed with the user's signature.

</vue-markdown>
<b-img style="padding:30px;" src="/static/jit-provisioning.png" fluid align=center />

<vue-markdown class="chapterSpace" id="DocMicroservice">

### Microservice

Microservice plays the most important role in AIoThings. It makes this cloud system programmable.

Microservices deliver functionalities through code blocks and message events, allowing developers to quickly build, test and deploy new applications.

Microservices are also the great enablers of continuous delivery, allowing frequent releases while keeping the rest of the system available and stable.

A microservice includes a code block and input/output message topics.

The code can be edited inline via the AIoThings editor or uploaded as a ZIP archive from local storage.
The advantage of using a ZIP file is that the code can be a package that includes multiple user modules and imported libraries.

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
    await aiot.messagePublish({data: event.data}); // must be a JSON, forward data as output message
};
```

For a ZIP file to upload, the entry point of the main user module and handler routine needs to be specified separately. 

By importing 'aiothings' library module to the code block, developers can use [Microservices APIs](#DocMicroserviceApi) to access data storage, message queues and database globally.

Message queue as an example, it provides an ordered queue storage between two or more microservices. A use case is that, IoT data sent from devices are put to a message queue first, and mobile app will retrive them later when it becomes active.

When a new microservice is created, it will automatically subscribe to its input message topic. 

</vue-markdown> 

<vue-markdown id="DocMicroserviceShared">

##### Private and public (shared) microservices


A private microservice can only be triggered by messages from the **owner** of the microservice or the **system** (and 'admin').
On the other hand, shared (public) microservices can also receive input messages from any other user.
In either case, by default, microservices use the sender of the input messages as the sender of output messages.
For security reasons, if the input message comes from the system, the microservice will set the owner of the microservice as the sender of its output message.

All users can view and have access to the shared microservices. In contrast, private microservices are only available to their owners.

The **Shared** option can be set from the edit page of the microservice.
Then, other users find them by querying the shared microservice from [Shared Solution](#DocSharedSolution).

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

The **Tree** button on the microservices window displays multi-level tree structure among topics of input/output messages and the corresponding microservices. With this tree, users are able to take a look at the summary of message flows, as well as the relationship between message topics and microservices.

```TopicTree
├ test/timer
│ └ testTimerScheduler 
├ device/data
│ └ sampleApiHandler ─ device/command
├ ifttt/setup
│ └ iftttServiceSetup 
├ device/timer/remove
│ └ testTimerRemove 
├ aiot_iotdata/query
│ └ aiotIotDataQuery ─ aiot_iotdata/response
│   └ iotDataReceiver 
├ aiot_iotdata/put
│ └ aiotIotDataPut 
├ ifttt/input/create_new_thing1
│ └ iftttCreateNewThingHandler ─ ifttt/output/new_thing_created
│   └ ifttt/output/#
│     └ iftttSenderService 
├ device/null
│ └ aiotIotDataApiHandler 
├ device/timer/add
│ └ testTimer ─ device/command
├ ifttt/input/create_new_thing
│ └ simuOnlinePayment ─ Facebook_10212683421500597_1536893927497/paid
└ timer/minute
  └ minuteUpdater ─ ifttt/output/new_thing_created
    └ ifttt/output/#
      └ iftttSenderService 
```

The last few lines of the example tree show that the input message with topic ***timer/minutes*** triggers the microservice ***minuteUpdater***, and the microservice will publish the output message using the topic ***ifttt/output/new_thing_created***. Subsequently, the microservice ***iftttSenderService*** is triggered by its input message topic ***ifttt/output/#*** to capture the previously published ***ifttt/output/new_thing_created*** message.

As you can from this example, this function takes into account the wildcard pattern of the input message topic when generating tree charts.
</vue-markdown>

<vue-markdown id="DocMicroserviceDeploy">
#### Deploy and Undeploy

The design pattern of using microservices often includes first to subscribe a service, and then to wait for the messages sending by the subscribed service, and, at the end of the service round, to stop the subscription that has done before.
**Deploy** and **Undeploy** provide a convenient way to let users send these subscription messages through AIoThings user interface.
We can treat Deploy as an action to set a microservice, or a group of microservices related, to an active running state ready to serve.

* Deploy: By selecting this action from the microservice list window, the system will publishe [deploy message] once.
* Undeploy: By selecting this action, the system will publishe [undeploy message] once.

Since only certain microservices need the deploy action, the deploy and un-deploy messages of a microservice can be optionally defined.

The Deploy / Undeploy message consists of 1) Topic and 2) Data two parts, and microservices define these optional values by themselves.

Deploy message example:
```Deploy
{
  topic: 'ifttt/setup', 
  data: {
    Service: {
      ServiceKey: 'ebqwhq0MOsPmUGptlS4wFC8kVPl8wumZvXoUz4Tarz4HRJbrUBsL-4xusnN_kz10', 
      triggers : [ 'a', 'b', 'c']
    }
  }
}
```
</vue-markdown>

<vue-markdown class="chapterSpace" id="DocMicroserviceExport">
#### Export Microservices

The **Export** button downloads all user available microservices to the local storage as a zipped file.

</vue-markdown>


<vue-markdown id="DocApi" class="mt-5">
### REST API

A RESTful API is an application program interface (API) that uses HTTP requests to GET, PUT, POST and DELETE data.
These APIs make it possible to let AIoThings services to interact with other Internet services.

AIoThings provide REST API editor and gateway for developers to create their own REST APIs, with the form of: `https://api.aiothings.com/{api name}/{path}'<div class=""></div>

A REST API is defined to include following parts:
1. **API Name**: Name of the API
2. **Description**: to describe what this API stands for and how to use it. It may include the HTTP methods in support, their query parameters, and also the expected responses.
3. **Path**: The list of paths supported. For REST API requests with supported paths, the gateway will pass the request to the REST API's predefined backend handler (a microservice).
4. **Handler**: The backend handler that handles this API request. Handlers are actually microservices capable to process HTTP requests.
5. **Authorization**: The authorization option for this REST API. If set it to 'Authenticated access', then the API requires the autorization check from the gateway before passing the request to the handler. 'Owner access only' means that the API is only authorized to the owner of the API. or 'Public access' allows anonymous access and no need of authorization information. The authorization data is obtained through user's login process, and is used to sign the HTTP requests. 

For authorization required options, the API request needs to provide the 'authorization' parameter in the request header, and the value is the access token of the user authentication data which is replied by the authentication server.
</vue-markdown>
<b-img style="padding:20px;" src="/static/authentication_abstract_flow.png" fluid align=center />
<vue-markdown>
```JavaScript
  let result = await API.get('myApi', '/query', {
        headers: {
          'Authorization': 'Bearer ' + userAuthentication.accessToken,
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        },
        queryStringParameters: {
          'ThingId': 'Facebook_XXXXXXX_YYYYYY'
        }
  });
```
 
A REST API can be accessed through the URL address with the form of 
```URL
  https://api.aiothings.com/{API name}/path
```

AIoThings defines a set of REST API available for users to access, for exameple [IoT Data](#DocIotDataRestApi).
</vue-markdown> 
<vue-markdown id="DocAppAuth">
### Application Authentication

When users' Internet applications want to use AIoThings REST APIs that require user authentication, AIoThings needs go through OAuth - an open standard protocol, every time to grant the application and the user.
After the whole authentication process completed, eventually applications will receive access tokens that is required to be added to the headers of REST API requests.

As the first step of OAuth authentication, users need to register their applications here in AIoThings console with a pair of Application Client ID and Client Secret keys. Later then, the OAuth requests from applications will use these client keys as their HTTP parameters to request for the tokens.
 

</vue-markdown>
<vue-markdown id="DocAppConnector">
### App Connectors

App Connectors are the interfaces AIoThings has prepared for developers to connect to external 3rd party services.
Two examples are the popular application connectivity platforms IFTTT and Zapier.

An App Connector defines a couple of message types that allow developers create / send / receive data to external services, such as Amazon Alexa, Facebook Messenger or Google Assistant. 
Developers are able to create their own App Connectors using a combination of REST API, microservice and message queue features.


</vue-markdown>
<vue-markdown id="DocAppConnectorIFTTT">
#### IFTTT Service

AIoThings has implemented a pair of IFTTT action and trigger in IFTTT to publish messages to and subscribe messages from AIoThings cloud.
* **Publish a message** is the action name. 
* **A message was published** is the trigger name.

Users, then, include these action and trigger in IFTTT Applets to complete their tasks. For example, an Applet can be defined as IF {user said a keyword to Alexa} THEN {publish a message to AIoThings} or IF {a message was published in AIoThings} THEN {send a message to user's Messenger account}.

**Publish a message** has two action fields: message topic and message body that IFTTT Applets are responsible to fill in.
* Message topic complies to AIoThings message topic format (MQTT).
* Message body includes payload parts of messages in a JSON form.

The trigger **A message was published** subscribes AIoThings messages with a topic. When the messages published, it forwards them attaching some extra information together to IFTTT. The information is called IFTTT trigger ingredients, and Applets will use these ingredients from their following actions.
* CreatedAt: Date and time event was Created.
* MessageJson: Message data in JSON form.
* MessageReadable: Message data in readable formats convenient to some actions such as email or messenger.

In order to minimize the traffic between AIoThings and IFTTT when running triggers and actions, message topics are limited to ifttt/input/... for action **Publish a message** and ifttt/output/... for trigger **A message was published**. Topics not compliant to those two formasts will be ignored without further processing.

</vue-markdown>
<vue-markdown id="DocAppConnectorZapier">
#### Zapier Integration

In a nutshell, Zapier performs the similar task as IFTTT. It defines Zapier Integrations similar to IFTTT Services, and an Integration includes Triggers and Actions. Finally, a Zap is similar to IFTTT Applet to connect a trigger event to a series of actions.

AIoThings also have implemented the Zapier Integration and the pair of trigger and action.
* **Publish a message** is the action name.
* **A message was published** is the trigger name.

Similar to IFTTT case, **Publish a message** action defines two input fields.
* **Message Topic** is the message topic starts with zapier/input/... 
* **Message Body** is the JSON formatted message data.

The trigger **A message was published** subscribes AIoThings messages with a topic. When the messages published, it forwards them to Zapier. Zaps will use their data fields for their following actions.
* CreatedAt: Date and time event was Created.
* MessageJson: Message data in JSON form.
* MessageReadable: Message data in readable formats convenient to some actions such as email or messenger.

In order to minimize the traffic overhead between AIoThings and Zapier, message topics are limited to zapier/input/... for the action **Publish a message** and zapier/output/... for the trigger **A message was published**. Topics not compliant to those two formats will be ignored without further processing.

</vue-markdown>
<vue-markdown id="DocSharedSolution">
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
<vue-markdown id="DocLog">
### Running Log

Developers or system operators may want to know the runtime status of each microservice.
For example, a microservice can use console output (such as console.log(..) in JavaScript) to display it's internal states.

The AIoThings UI has the ability to retrieve the logging information.

In the Microservices window, you can enable the Running Log option to display the runtime logs for each microservice.
When this option is enabled, it will also update the log in real time.


</vue-markdown> 
<b-row>
  <b-col>
    <b-img style="padding:20px;" src="/static/running-log-ui-2.png" fluid align=center />
  </b-col>
   <b-col>
    <b-img style="padding:20px;" src="/static/running-log-ui.png" fluid align=center />
  </b-col>
</b-row> 
&nbsp;
&nbsp;
&nbsp;
<vue-markdown id="DocIotData">

### IoT Data Access

Typically an IoT data tuple is in the form of { Device ID, Timestamp, Data }. This means that the device thing has created data at the specific time.
User's data access is available by sending messages with the message topic ***aiot_iotdata/query***.
The system will reply the query result as separate messages with the topic of ***aiot_iotdata/response*** from its microservice ***aiotIotDataQuery***.

It is the user's responssibility to specify Device ID (or Thing ID) and Time Period (start and end) in the query request.
```QueryRequest
await aiot.messagePublish('aiot_iotdata/query', {
    ThingId:    'XYZ'，  // required
    StartTime:  12345678，
    EndTime:    12456789
    ScanForward: true,   // default is true
    LimitPerReturn: 100,  // maximum numbers of items returned
    Session: { ... }  // JSON 
})
```

If StartTime and EndTime are not specified, then the system will do the query from the latest tuple.

If the query has only StartTime specified, it will bring as much as possible the data allowed for a query from the start time.

If the query has only EndTime specified, it will bring as much as possible the data allowed for a query until the end time.

If the ScanForward is defined, it optionally decide the time order (True means ascending or False for descending) of queries.

LimitPerReturn sets the maximum number of items that can be returned from the query. As the limitation of message size, users are responsible to define this value avoiding possible errors from too large of the message size.

The Session, itself can be a JSON,  will be returned as a part of the response data, and is used to check if the response data is from the corresponding request. Alternatively, SessionName is also available to use with String type for this purpose.

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
  ContinueTime: 12567890, // Optional
  SessionName: 'Text'
}
```
The ContinueTime field only appears if there is more data left in the last query.

The ContinueTime field can be used as the StartTime (or EndTime) for conesecutive query requests. It is the responsibility of the user to send addtional requests for obtaining successive query results.

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
            "TimeStamp": 1560406698331, // Optional
            "Data": {
              "light": "off"
            }
          }
        ]
      }
    }
```
If without Timestamp field included, the system will attach the time it received the request as the timestamp and together with data into the IoT database.

Messages have the payload size limit of 128KB. The system rejects publish requests larger than this size.

</vue-markdown> 
<vue-markdown id="DocIotDataRestApi">

#### REST API Query for IoT data

User's IoT data is accessible from the system provided REST API 
```
  https://api.aiothings.com/iotdata
```

This API requires authorization. Users need to sign in to use this REST API.
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

</vue-markdown> 
<vue-markdown class="chapterSpace" id="DocMicroserviceApi">
### Microservice APIs

The set of APIs are used inside Microservices to achieve the functions required to implement applications, including to publish messages, to put/get from storage, and to save/retrieve from message queues.

Microservices also can use APIs from AWS SDK to realize application logics, as long as the user obtained the required resource permissions. 
In fact, the Microservice APIs here are also implemented by APIs from AWS SDK.

</vue-markdown>

<vue-markdown class="chapterSpace" id="DocMicroserviceApiNodejs">

### Node.js functions 

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

<vue-markdown class="borderLine" id="DocNodejsSetInterval">
#### setInterval

```JavaScript
setInterval(periodTime, messageTopic, messageData, numberOfTimes)
```
To publish message periodically as assigned until a clearInterval is called.
The period time must be a multiple of 10 seconds, and the occurences of message publishing would also be aligned by 10 second boundaries.
If the message topic has been registered in the existing intervals, then the old one will be replaced by the new request.

* periodTime -- (Number)
  * The period time between each occurence. It must be a multiple of 10 (in seconds)
* messageTopic -- (String)
  * The topic of messages to publish
* messageData -- (JSON)
  * The message body in JSON form to publish
* numberOfTimes -- (Number)
  * The number of occurences repeating to publish messages
  * For resource concerns, currently, the maximum number of repetitions is ten. If the input value is larger than 10, then the actual count will be ceiled to 10.
  
**Example**
```JavaScript
const aiot = require('aiothings');
await aiot.setInterval(10, 'timer/alert', {data: 'new cycle'});
```
</vue-markdown> 

<vue-markdown class="borderLine" id="DocNodejsClearInterval">
#### clearInterval

```JavaScript
clearInterval(messageTopic)
```
To cancel the interval request previosly registered through **setInterval**.

* messageTopic -- (String)
  * The message topic used by setInterval.

**Example**
```JavaScript
const aiot = require('aiothings');
await aiot.clearInterval('timer/alert');
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

<vue-markdown class="mt-2" id="DocProgramming">
### Programming Environment

AIoThings takes advantage of AWS development tools to further accelerate the speed of building web and mobile applications. We'll introduce these tools and examples here to show how to manage AIoThings resources from a user application.

[AWS Amplify](https://aws-amplify.github.io/docs/) is a framework provided by AWS, including tools for developing cloud back-end services and SDKs for various front-end applications to access these back-end services.
AIoThings is committed to producing cloud services quickly and easily. At the same time, it uses the AWS Amplify SDK to allow front-end web and mobile applications to access its cloud resources.

In order to properly configure the AWS SDK to use the AIoThings resource, AIoThings provides its configuration file (the [aws-exports.js](https://aws-amplify.github.io/docs/js/authentication#sign-in) file for JavaScript and the [awsconfiguration.json](https://aws-amplify.github.io/docs/ios/authentication) file for the Android and iOS mobile environments). These configuration files are explained in detail in the AWS Amplify documentation of integrating them into the user's web and mobile development environment.

The configuration files can be downloaded through **App Config** button of [User's main page](/user).

Once the configuration file is properly installed, a typical application scenario will first sign in to the AIoThings user identity and use the authenticated identity to access the AIoThings resources, such as calling a REST API, or subscribing and publishing messages.

***JavaScript example for user sign-in and calling a REST API***
```javascript

  import { Auth, API } from 'aws-amplify';

  await Auth.signIn(username, password); // directly assigning username and password
  or
  await Auth.federatedSignIn(); // Popup default Hosted UI 
  or
  await AuthfederatedSignIn({provider: ‘Facebook’}); // Using social media account 

  let result = await API.get('myApi', '/query', {
        headers: {
          'Authorization': (await Auth.currentSession()).getAccessToken().getJwtToken(),
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        },
        queryStringParameters: {
          'ThingId': 'Facebook_XXXXXXX_YYYYYY'
        }
  });
```

</vue-markdown> 

<!--  an example of the same effect of ```
<pre>
<code>
  import { Auth, API } from 'aws-amplify';
</code>
</pre>
-->
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
// import VueMarkdown from 'vue-markdown'
import { eventBus } from '../main'

// utility copied from https://stackoverflow.com/questions/123999/how-to-tell-if-a-dom-element-is-visible-in-the-current-viewport
function elementInViewport (el) {
  var top = el.offsetTop
  var height = el.offsetHeight

  while (el.offsetParent) {
    el = el.offsetParent
    top += el.offsetTop
  }
  // console.log(el.id, top, height)
  // console.log(window.pageYOffset, window.innerHeight)
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
    touchMoveHandler () {
      console.log('touch move')
      this.checkDocLocation()
    },
    offsetAnchor () {
      console.log('offsetAnchor')
      if (location.hash.length !== 0) {
          window.scrollTo(window.scrollX, window.scrollY - 80)
      }
    },
    handleWheel (event) {
      this.checkDocLocation()
    },
    checkDocLocation () {
      console.log('wheel: ')
      // let that = this
      // let currentDocElement = null
      for (let el of this.idDocs) {
        // "el" is your element
        let bounding = el.getBoundingClientRect()
        // console.log(bounding.y, el.id)
        if (bounding.y > 0 && el.id.startsWith('Doc')) {
          // .y is relative position from top of viewport,
          // as the ids are ordered too, means, the values will change from negative, zero to positive numbers.
          // Find the first position .y element
          // All element ids of the page start with 'Doc',
          // use this check to avoid cases of other ids from parents.
          // console.log('change to: ', el.id) // log the ID
          if (this.activeId !== el.id) {
            this.activeId = el.id
            eventBus.$emit('changeDocId', el.id)
          }
          return
        }
      }
    },
    handleScroll () {
      console.log('scroll: ', window.pageYOffset)
      let that = this
      let currentDocElement = null
      Array.prototype.forEach.call(this.idDocs, function (el, i) {
        // "el" is your element
        // console.log(el.id) // log the ID
        if (elementInViewport(el)) {
          if (that.activeId !== el.id) {
            that.activeId = el.id
            if (!currentDocElement || (currentDocElement && currentDocElement.offsetTop > el.offsetTop)) {
              console.log('el: ', el.id)
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
    // window.addEventListener('hashchange', this.offsetAnchor)

    // let docMain = document.getElementById('docMain')
    // http://jschof.com/vue/scroll-tracking-in-vue-applications-some-gotchas/

    // 'scroll' event is not fired when layout position is set to 'fixed'
    // window.addEventListener('scroll', this.handleScroll, false)

    // insteadly, use 'wheel' mouse wheel event to trigger the scrolling event
    window.addEventListener('wheel', this.handleWheel, false)
  },
  mounted () {
    this.idDocs = document.querySelectorAll('[id]')
    // console.log('idDocs: ', this.idDocs)
    // for mobile touch screen devices
    if ('ontouchstart' in window) {
      window.addEventListener('touchstart', this.touchMoveHandler)
      window.addEventListener('touchmove', this.touchMoveHandler)
      window.addEventListener('touchend', this.touchMoveHandler)
    }
  },
  destroyed () {
    // document.removeEventListener('scroll', this.handleScroll)
    document.removeEventListener('wheel', this.handleWheel)
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
/*
html, body {
    margin:0;
    padding:0;
    height: 100%;
}
.wrapper {
    height: 100%;
    overflow-x: hidden;
} 
*/
pre {
  background:#F8F9F9;
  border: 1px solid lightgray;
  border-radius: 10px;
  padding: 10px;
}

.chapterSpace {
    margin-top: 50px;
}
</style>