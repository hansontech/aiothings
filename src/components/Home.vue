<template>
<div> 
  <App/>
  <b-container fluid style="padding-right: 0px; padding-left: 0px; margin-top:-15px; margin-left:0px; margin-right:0px"> 
    <div class="bgimg" style="height: 250px;">
      <b-row align-v="end" class="h-50">
        <b-col class="text-center"  style="color:black">
          <h1 style="display: inline;"><b>AIoT</b></h1>
          <h1 style="display: inline; color:darkred">
            <b>hings</b>
          </h1>
        </b-col>
      </b-row>
      <b-row align-v="center">
        <b-col class="text-center">
          <h3 style="color:white">
            Rapid Cloud / IoT Application DevOps Tool
          </h3>
        </b-col>
      </b-row>
    </div>
    <div class="bv-example-row" style="padding-right: 50px; padding-left: 50px">    
      <b-row class="at-home" align-h="center" align-v="center">
        <b-col md="6" align-self="center"> 
            <b-img src="/static/aiot-whatitis.png" fluid align=center />
        </b-col>
        <b-col md="6">
          <h5>
           AIoThings provides RAPID tools to
            <ul>
              <li>Connect IoT devices securely</li>
              <li>Create REST APIs of cloud services
              <li>Design microservices for data analytics</li> 
              <li>Interact with popular mobile/home apps</li>
            </ul>
          </h5> 
        </b-col>
      </b-row>
      <b-row class="at-home" align-h="center">
        <b-col> 
          <h3> How it works </h3>
          <h5 class="mt-4"> Cloud / IoT application developers </h5>
            <p>
              Easy-to-use features to build apps combining hardware, software and cloud.
            </p>
          <h5> IoT hardware manufacturers </h5>
             <p>
              Cloud services connecting devices and supporting popular platforms. End users subscribe to access their IoT data.
            </p>
          <h5> AI solution providers </h5>
             <p>
              API interface and simplified subscription model to end developers.
            </p>
          <h5> DIY users </h5>
            <p> 
              IoT and Cloud playground for engineers, students and educators. 
            </p>
        </b-col>
        <b-col md="6" align-self="center"> 
            <b-img src="/static/aiot-block-diagram.png" fluid align=center />
        </b-col>
      </b-row>
      <b-row class="at-home" align-h="center" align-v="center">
        <b-col md="6" align-self="center"> 
            <b-img src="/static/microservice-diagram.png" fluid align=center />
        </b-col>
        <b-col align-v="center"> 
          <h3> Microservice and cloud store</h3>
          <ul class="mt-4" style="magin-left:0px">
            <li>Microservice as granular building block optimizing to tasks.</li>
            <li>Flow based programming through messages in-and-out microservices.</li>
            <li>Subscribe message topics to use other user's cloud services.</li>
            <li>Share and trade cloud resurces through Cloud Store.</li>
          </ul>
        </b-col>
      </b-row>
      <b-row class="at-home" align-h="center" align-v="center">
        <b-col md > 
          <h3>Web integrated development</h3>
          <p class="mt-4">
              AIoThings offers one-stop web interface to
              <ul>
                <li>Build secured IoT device network. </li>
                <li>Create/Share/Reuse microservices optimizing to tasks. </li>
                <li>Design workflows for devices and microservices.</li>
                <li>Edge computing through AWS Greengrass or Node-RED.</li> 
              </ul> 
          </p>    
        </b-col>
        <b-col md align-self="center"> 
          <!-- width=450 height=338 src="../assets/aiot-block.png" --> 
          <b-img src="/static/aiot-ui-concept.png" fluid align=center />
        </b-col>
      </b-row>
      <b-row class="at-home" align-h="center" align-v="center">
        <b-col md="5" align-self="center" class="p-8"> 
          <b-img src="/static/aws-services-logos.png" fluid align=center />
        </b-col>
        <b-col md="7" > 
          <h3> Built on Amazon AWS </h3>  
          <p>
            <ul>
              <li>Leveraging full advantage of world largest public cloud.</li>
              <li>More than 100 services spanning >20 geographical regions.</li>
              <li>Best class security, scalability, AI and IoT resources.</li> 
              <li>Ideal choice for scaling to large projects.</li> 
            </ul>           
          </p>
        </b-col>
      </b-row>
      <b-row class="at-home" align-v="center">
        <b-col md="7">
          <h3> Social development</h3> 
          <p> 
            <ul>            
              <li>We encourage people share their microservices to others.</li>
              <li>Microservice defines input and output message topic pair and description.</li>
              <li>Users find shared services by querying keywords and use them.</li>
              <li>Rapid development through incremental design.</li>
            </ul>
          </p>
        </b-col>
        <b-col md="5" align-self="center"> 
          <b-img style="padding:35px;" src="/static/aiot-social-develop.png" fluid align=center />
        </b-col>
      </b-row>
      <b-row class="at-home" align-v="center">
        <b-col md="5" align-self="center"> 
          <b-img style="padding:35px;" src="/static/sharing-economy.jpg" fluid align=center />
        </b-col>
        <b-col>
          <h3>Shared economy </h3>
          <!--
          <em style="color:darkred;">
          [The service is FREE and feedback is always welcome.]
          </em>
          -->
          <p class="mt-4">
            <ul>
              <li>Encourage ecosystem of shared services.</li>
              <li>Offer pay-as-you-go pricing through flow based design.</li>
              <li>Reward developers sharing their services.</li>
            </ul>
          </p>
        </b-col>
      </b-row>
       <b-row class="at-home" align-v="center">
        <b-col md="6" lg="6">
          <h3>Connecting services</h3>
          <p class="mt-5">
          App Connectors accelerate connect to external digital platforms. 
          </p><P>
          Unified API to IFTTT for unlimited IFTTT applets.
          </p><p>  
          Microservice seamleass support to Amazon Alexa.
          </p>
        </b-col>
        <b-col md="6" lg="6" align-self="center"> 
          <b-img style="padding:30px;" src="/static/connecting-services.png" fluid align=center />
        </b-col>
      </b-row>
      <!--
      <b-row class="at-home" align-h="center">
        <b-col sm md="9" lg="7" align-self="center"> 
          <b-img src="/static/aiot-block.png" fluid align=center />
        </b-col>
      </b-row>
      -->
      <b-row class="at-home" align-v="center">
        <b-col md="5" align-self="center"> 
          <b-img style="padding:30px;" src="/static/aiot-workflow.png" fluid align=center />
        </b-col>
        <b-col>
          <h3>Your first project starts from..</h3> 
          <div class="mt-3">
          <ol> 
          <li>                     
          Select <a href="/docs/main#DocThingEnabler">enabler hardware</a>. Configure IoT platform software.
          </li><li>
          Create <a href="/docs/main#DocThingObject">thing objects</a> and security credentials to connect to IoT devices. 
          </li><li>
          Design <a href="/docs/main#DocMicroservice">microservices</a>, or search and reuse from shared assets. 
          </li><li>
          Deploy microservices and <a href="/docs/main#DocNodeRed">Node-RED</a> flows to edge devices. 
          </li><li>
          Design workflow, <a href="/docs/main#DocMicroserviceTopic">input and output message</a> of microservices. 
          </li><li>
          Create <a href="/docs/main#DocApi">REST APIs</a> to provide services externally. 
          </li><li>
          Connect to other external mobile / home applications.
          </li><li>
          Add or reuse data analytic and AI algorithms.
          </li>
          </ol>
          </div>
        </b-col>
      </b-row>
      <b-row class="at-home" align-h="center">
        <b-col> 
        </b-col>
      </b-row>
    </div>
  </b-container>
  <at-footer/>
</div>
</template>

<script>
// import request from 'browser-request'
// import cheerio from 'cheerio'
// import { XMLHttpRequest as xhr} from 'xmlhttprequest'

export default {
  name: 'home',
  data: function () {
    return {
      hostUrl: '',
      response: 'unknown',
      idName: '',
      nodeUrl: 'https://flows.nodered.org/flow/0d98ac57a6ebf724def9'
    }
  },
  computed: {
  },
  methods: {
    toTest () {
      let iframe = document.getElementById('nodered')
      console.log('test frame: ', iframe)
      let content = iframe.contentWindow.document.getElementById('flow')
      console.log('test: ', content)
    }
  },
  created () {
    this.hostUrl = window.location.protocol + '//' + window.location.host

    this.nodeUrl = 'https://flows.nodered.org/flow/0d98ac57a6ebf724def9'
    // let url = 'https://www.google.com'
    /*
    headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/x-www-form-urlencoded'
      },
      ,
      mode: 'no-cors'
      encodeURIComponent(url)
    */
   /*
    let urlAnyorigin = 'https://crossorigin.me/' + url
    fetch(urlAnyorigin)
    .then(res => {
      console.log('res.json: ', res)
      // res.json()
    })
    .catch(function (error) {
        console.log('Looks like there was a problem: \n', error)
    })
    */
    /*
    xhr.open('GET', url, true)
    xhr.onreadystatechange = function () {
        console.log('There are ready content!')
    }
    xhr.onerror = function () {
        console.log('There was an error!')
    }
    xhr.send()
    */
    // https://www.npmjs.com/package/request
    // https://flows.nodered.org/flow/0d98ac57a6ebf724def9'
    /*
    request('https://flows.nodered.org/flow/0d98ac57a6ebf724def9', function (err, resp, html) {
      if (!err) {
        const $ = cheerio.load(html)
        console.log(html)
        this.idName = $('pre').attr('id')
        console.log('idName: ', this.idName)
      } else {
        console.log('error: ', err)
      }
    })
    request('http://www.google.com', function (err, resp, html) {
      if (!err) {
        const $ = cheerio.load(html)
        console.log(html)
        this.idName = $('pre').attr('id')
        console.log('idName: ', this.idName)
      } else {
        console.log('error: ', err)
      }
    })
    request.get('http://google.com')
    .on('error', function (err) {
      console.log('simple::: ', err)
    })
    .on('response', function (response) {
      console.log('statusCode', response.statusCode) // 200
      console.log('response header: ', response.headers['content-type']) // 'image/png'
    })
    */
    // $( "#result" ).load( 'https://flows.nodered.org/flow/0d98ac57a6ebf724def9', function() {
    //     console.log( "Load was performed." )
    // });
    // const $ = cheerio.load('https://flows.nodered.org/flow/0d98ac57a6ebf724def9')

    // For each .item, we add all the structure of a company to the companiesList array
    // Don't try to understand what follows because we will do it differently.
  }
}
</script>
<style>

/* Extra small devices (portrait phones, less than 576px) */
/* Small devices (landscape phones, less than 768px) */
/* Medium devices (tablets, less than 992px) */
/* Large devices (desktops, less than 1200px) */
/* Extra large devices (large desktops)
   No media query since the extra-large breakpoint has no upper bound on its width */

/*
@media (min-width: 400px) {
  .at-home p {
    font-size:3.7vw;
  }
  .at-home h2 {
    font-size:6.8vw;
  }
}

@media (min-width: 575.98px) {
  .at-home p {
    font-size:2.9vw;
  }
  .at-home h2 {
    font-size:5.3vw;
  }
}

@media (min-width: 767.98px) {
  .at-home p {
    font-size:2.0vw;
  }
  .at-home h2 {
    font-size:3.8vw;
  }
}

@media (min-width: 991px.98) {
  .at-home p {
    font-size:1.8vw;
  }
  .at-home h2 {
    font-size:3.2vw;
  } 
}

@media (min-width: 1199.98px) {
  .at-home p {
    font-size:1.5vw;
  }
  .at-home h2 {
    font-size:2.7vw;
  }
}

*/
/*
.container-fluid {
  padding-right: 15px;
  padding-left: 15px;
  margin-right: auto;
  margin-left: auto;
}
.row {
  margin-right: -15px;
  margin-left: -15px;
}
*/

.at-home{
  margin-top: 50px;
}
.at-home p {
    font-size:18px;
}

.at-home h5 {
    font-size:18px;
}

.stretch {
    width:100%;
}

.centered-and-cropped { object-fit: cover }

.top-foto {
  z-index: -1;
  width: 100%;
  height: 700px;
}

.bgimg {
    background-image: url('/static/aiot-home-bg.jpg');

}

.at-home li{
  margin: 20px 0;
  font-size: 18px;
}
</style>