<template>
  <b-container> 
    <div style="min-height: 500px">
<b-row class="mt-4">
  <b-col>
<vue-markdown>
### About Us
</vue-markdown>
</b-col>
</b-row>
<b-row>
  <b-col>

   <img width="250" height="250" title="Load Options" src="/static/dennis-photo.png" style="float: right; margin-left: 20px; margin-right: 20px; margin-bottom: 20 px;">
   <vue-markdown>

Hi, I am Dennis, the founder of AIoThings. In 2017 I moved to Brisbane, after many years working for the other startup (Hanson Technology). It gave me the opportunity to review my previous electronics and software business. AIoThings is the result, kind of, from this review. 


I have worked in semiconductors, microprocessors, factory automation, networking, mobile phones, navigation device, smart TV, wearables, etc. for more than 20 years (they are also my favorites)... But more and more, I was tired of facing the challenges of time to market, production scale and short life cycles that are making this business extremely difficult to sustain. 

At that time, I was also a capable mobile app and cloud backend developer. This inspired me to think about how to build a sustainable model to carry forward these skills together.

I created AIoThings as an **easy-to-use Cloud for IoT**.


I found the cute innovations from DIY electronics - Raspberry Pi, Arduino, and ESP32/8266 based ecosystems. Thanks to their passion and continuity, they have large developer communities and engineering assets. The successors are getting more powerful, and many of which are even widely used in real industrial projects.


In line with this trend, AIoThings delivers **Cloud for DIY** to IoT devices. 


Not only does it provide a friendly cloud extension to the DIY electronics and IoT devices, but it is also a space for developers to **Develop and Share** their Cloud works for others to leverage.

In this way, AIoThings users will be able to connect to each other and each other's IoT data and algorithms easily, collaboratively and collectively - which means **DIY Spirit** to me too.
    </vue-markdown>
  </b-col>
  </b-row>
  <div>
    <p/>
     <p/>
      <p/>
  </div>
  <div>
  </div> 
    </div>
  </b-container>
</template>

<script>

import VueMarkdown from 'vue-markdown'

export default {
  name: 'aboutus',
  data: function () {
    return {
    }
  },
  components: {
    VueMarkdown
  }
}
</script>

<style>
div.at-bottombar {
  padding-bottom: 5px;
  border-bottom: 1px solid grey
}
</style>