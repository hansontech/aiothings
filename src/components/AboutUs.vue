<template>
<div>
  <App/>
  <b-container style="min-height: 800px; margin-top: 85px; padding-bottom: 60px;"> 
    <b-row class="mt-4" >
      <b-col>
        <markdown-it-vue  content="
## Vision

To build the best intelligent system for IoT creators, to be the place where people can find and participate in the realization of their IoT ideas.  
 
## Our approach

Creators are excellent at sensing new product opportunities that often come from emerging and sometimes fragmented markets. Many of these new products need to integrate hardware, software, electronics, cloud services, and AI as a complete IoT solution. 
By connecting industrial resources from design to manufacturing, from proof of concept to mass production, AIoThings goes along with creators together to realize their innovations. 

## The founder
        " />
      </b-col>
    </b-row>
    <b-row class="mt-2">
      <b-col md="8">
        <markdown-it-vue  content="
Dennis Kung has 30 years of experience working in software and electronics industries, took multiple roles of engineering, product, sales, and management in Motorola, Quanta Computer, and the startups of Esmertec AG and Hanson Technology. 
        " />
      </b-col>
      <b-col md="4">
        <b-img alt="Dennis Kung" src="/static/dennis-photo.png" class="mr-2" fluid rounded style="max-width:250px; max-height:250px; padding: 20px;"></b-img>
      </b-col>
    </b-row>
    <b-row class="mt-3">
      <b-col>
        <markdown-it-vue  content="
## The team

* Product development: market research, product plan, project management, mobile, consumer, and IoT products. 

* System and electronics: microprocessors, realtime system, networking, digital system design, and manufacturing. 

* Software development: cloud services, microservice, IoT, embedded system, DevOps, web and mobile apps. 
        " />
      </b-col>
    </b-row>  
    <b-row class="mt-2">
      <b-col>
        <markdown-it-vue  content="
## The service
        " />
      </b-col>
    </b-row>  
    <b-row class="mt-2">
      <b-col md="4">
        <markdown-it-vue  class="mt-3" content="
  **Hardware design**
* Microprocessor and controller based digital system
* Semiconductor component selection
* Proof-of-Concept and manufacturing
        " />
      </b-col>
      <b-col md="4">
        <markdown-it-vue  class="mt-3" content="
  **Applications**
* Automation
* Networking
* Wireless
* Location base
* Wearable
* Payment
* Other IoT enabling devices
        " />
      </b-col>
      <b-col md="4">
        <markdown-it-vue  class="mt-3" content="
  **Software**
* AWS, Azure-based cloud and IoT services
* Web applications
* Native mobile apps
* Machine learning
        " /> 
      </b-col>
    </b-row>
  </b-container>
  <at-footer class="mt-3" />
</div>
</template>

<script>

export default {
  name: 'aboutus',
  data: function () {
    return {
    }
  }
}
</script>

<style>
</style>