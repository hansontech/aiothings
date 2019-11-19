<template>
<div> 
  <App/>
  <b-container>
  <div>
<font color="white"><vue-markdown id="ShopBegin" style="background-color: darkcyan; padding-left: 20px">
```

```
### Shop
```

```
</vue-markdown></font>
<vue-markdown class="borderLine" id="ShopIoTGateway">
```



```
##### IoT Gateways

Start a new IoT project from selecting IoT Gateways.
The gateway hardware plays as the [Thing Enabler](/docs/main#DocThingEnabler) to work locally with sensors, and to connect to AIoThings cloud.

</vue-markdown>

<div>
  <table style="width:100%">
    <tr>
      <th>IoT Gateway Models</th>
      <th>Package</th>
      <th>Price (+ One Year Cloud Subscription)</th> 
    </tr>
    <tr>
      <td>NodeMCU ESP32S<a href="/docs/main#DocESP8266">**</a></td>
      <td>
        <ul>
          <li>USB Cable </li>
        </ul>
      </td>
      <td style="text-align:center">AUD 150</td> 
    </tr>
    <tr>
      <td>Raspberry Pi 3 Model B+<a href="/docs/main#DocPi">**</a></td>
      <td>
        <ul>
          <li>Power Supply</li>
          <li>MicroSD Software Preloaded</li>
        </ul>
      </td>
      <td style="text-align:center">AUD 200</td> 
    </tr>    
    <tr>
      <td>SBC700<a href="#ShopSBC700">**</a></td>
      <td>
        <ul>
          <li>SIM Telstra NB-IOT network </li>
          <li>Antenna</li>
          <li>Power Supply</li>
        </ul>
      </td>
      <td style="text-align:center">AUD 400</td> 
    </tr>
  </table>
</div>

<div class="mt-2">

The One Year Cloud Subscription includes: 
            <ul>
              <li>Easy setup through preinstalled software </li>
              <li>12 month AIoThings paid membership</li>
              <li>IoT data storage access</li>
              <li>Custom REST APIs to serve externally</li>
              <li>Unlimited microservices for data analytics</li> 
              <li>Interact with popular mobile/home apps</li>
            </ul>
</div>
<vue-markdown class="mt-2">
  **Please contact [US](mailto:service@hanson-tech.com?subject=Shop) for more information.**
</vue-markdown> 
<vue-markdown id="ShopSBC700" class="borderLine mt-4"> 
```

```
#### SBC700 Product Overview


SBC700 is a compact, low power, cost effective and high performance IoT Gateway. 
As an industrial grade edge computing device, it is designed to work between sensors and cloud.

The features include 
* 32-bit low power, high performance (580 MHz) processor 
* Low Power DDR RAM 128MB / Flash 32MB
* 10/100M Base-T Ethernet
* 2.4GHz 802.11b/g/n WiFi
* Mini-PCIe Socket Support 4G/LTE, CAT-M, NB-IOT modules
* USB 2.0 ports 
* MicroSD socket for storage extension
* 2x or 4x ports auto flow control RS485 with isolation. 
* OS support Linux 3.x
* Power DC +9V ~ +30V
* Dimension - 70(W) x 25(H) x 120(L) mm
* Operating Temp: -20℃ ~ 50 ℃, under 95% RH
* Mounting - Wall-mount, DIN rail

It's Mini-PCIe interfaced LPWAN modules support CAT-NB ane NB-IOT standards.
In Australia, they work with [Telstra IoT network](https://www.telstra.com.au/business-enterprise/solutions/internet-of-things).

Also, the USB port supports UIO modules for AI/AO/DI/DO with/without isolation features.

</vue-markdown>
<b-row>
  <b-col>
    <b-img style="padding:20px;" src="/static/sbc700-image.png" fluid align=center />
  </b-col>
  <b-col>
    <b-img style="padding:20px;" src="/static/sbc700-photo.png" fluid align=center />
  </b-col>
</b-row>
<vue-markdown>
```


```
</vue-markdown>
<b-row>
  <b-col>
    <img width="250" height="250" title="Climate Sensor Hub" src="/static/sbc700-climate_sensor_hub.jpg" style="float: right; margin-left: 20px; margin-right: 20px; margin-bottom: 20 px;">
    <vue-markdown>
#### Climate Sensor Hub
```

```
**Climate Sensor Hub** integrates SBC700 together with Temperature, CO2, Humidity, and Light sensors.
This product is being deployed to greenhouse environment for smart farming purposes.
    </vue-markdown>
  </b-col>
</b-row>
<vue-markdown>
```


```
</vue-markdown>

</div>
  </b-container>
  <at-footer/>
</div>
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
  border-top: 1px dotted grey;
}
</style>