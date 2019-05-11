<template>
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
      <b-row align-v="top" class="h-50">
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
          <h5 class="mt-4"> For Cloud / IoT application developers </h5>
            <p>
              We provide rapid development services from hardware, software to cloud, use AIoThings tools as our competitive advantage.
            </p>
          <h5> For IoT hardware manufacturers </h5>
             <p>
              We develop / integrate / operate cloud services to link with their IoT devices. Only subscription and royalty fees as our pricing models.
            </p>
          <h5> For AI solution providers </h5>
             <p>
              We partner with data analytic solution providers. Create interfaces (APIs) and streamlined commercial models for our clients to utilize them easily.
            </p>
          <h5> Rest of the world </h5>
            <p> 
              The web site is a free space for IoT and cloud applications. 
              Users can create their own microservices to connect to their IoT devices or to share with other users. 
            </p>
        </b-col>
        <b-col md="6" align-self="center"> 
            <b-img src="/static/aiot-block-diagram.png" fluid align=center />
        </b-col>
      </b-row>
      <b-row class="at-home" align-h="center">
        <b-col sm > 
          <h3>Web integrated development</h3>
        </b-col>
      </b-row>
      <b-row class="at-home" align-h="center">
        <b-col md > 
          <p>
              AIoThings provides the web interface easy to
              <ul>
                <li>Build secured IoT device network. </li>
                <li>Create/Share/Reuse microservices they each optimized to a specific task. </li>
                <li>Workflow design to connect devices and microservices together.</li> 
              </ul> 
          </p>    
          <p>
              Node-RED running on edge devices, part of AIoThings design tools for rapid development purpose.
          </p><p>
              JavaScript and Python codes of microservices, extendable to other AWS services. 
          </p><p>
              MQTT message publish/subscription model, to communicate among devices and microservices. 
          </p>
        </b-col>
        <b-col md align-self="center"> 
          <!-- width=450 height=338 src="../assets/aiot-block.png" --> 
          <b-img src="/static/aiot-ui-concept.png" fluid align=center />
        </b-col>
      </b-row>
      <b-row class="at-home" align-h="center">
        <b-col md="5" align-self="center" class="p-8"> 
          <b-img src="/static/aws-services-logos.png" fluid align=center />
        </b-col>
        <b-col md="7" > 
          <h3>  Built on AWS </h3>  
          <p> 
            AIoThings service is built upon Amazon Web Services, takes full advantages of AWS cloud computing platforms from security, scalability, AI, and IoT establishments. 
            Makes it ideal for large-scale projects.            
          </p><p>
            AWS has more than 100 services spanning >20 geographical regions.
          </p>
        </b-col>
      </b-row>
      <b-row class="at-home">
        <b-col md="7">
          <h3> Social development</h3> 
          <p>             
              We encourage people share their microservices to others. 
              Each microservice has own input message topic and output message topics, also a description to explain how to use them.
              Developers search for shared microservices, reuse them if possible. 
          </p><p>
              Many applications and data sources share similar patterns.
              Rapid development can be realized through incremental design and existing assets, for example, machine learning inference functions. 
           </p>
        </b-col>
        <b-col md="5" align-self="center"> 
          <b-img style="padding:35px;" src="/static/aiot-social-develop.png" fluid align=center />
        </b-col>
      </b-row>
      <b-row class="at-home">
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
          <p class="mt-3">
          We encourage an ecosystem of shared services. 
          </p><p>
          The service offers pay-as-you-go pricing for enterprise members and free-tier membership for concept-proving users.
          </p><p>  
          At the same time, we also look for reward programs for service and solution providers sharing their assets to others.
          </p>
        </b-col>
      </b-row>
       <b-row class="at-home">
        <b-col md="6" lg="6">
          <h3>Connecting external services</h3>
          <p class="mt-5">
          Connectors interface to external digital platforms. 
          </p><P>
          Unified API connects to IFTTT  for unlimited IFTTT services, without needs of extra API setups.
          </p><p>  
          Amazon Alexa define Skills that need AWS Lambdas to run their Skill codes.
          </p><p> 
          AIoThings microservice itself is an AWS Lambda function, hence seamlessly supports Alexa.
          </p>
        </b-col>
        <b-col md="6" lg="6" align-self="center"> 
          <b-img style="padding:30px;" src="/static/connecting-services.png" fluid align=center />
        </b-col>
      </b-row>
      <b-row class="at-home" align-h="center">
        <b-col sm md="9" lg="7" align-self="center"> 
          <b-img src="/static/aiot-block.png" fluid align=center />
        </b-col>
      </b-row>
      <b-row class="at-home" align-v="center">
        <b-col md="5" align-self="center"> 
          <b-img style="padding:30px;" src="/static/aiot-workflow.png" fluid align=center />
        </b-col>
        <b-col>
          <h3>Example development flow</h3> 
          <div class="mt-3">
          <ul> 
          <li>                     
          Select enabler hardware. Configure IoT platform software.
          </li><li>
          Create IoT objects and security credentials to connect to IoT devices. 
          </li><li>
          Design microservices, or search and reuse from shared assets. 
          </li><li>
          Deploy microservices and Node-RED flows to edge devices. 
          </li><li>
          Design Workflow, MQTT message topics for microservices. 
          </li><li>
          Create REST APIs to export services externally. 
          </li><li>
          Connect to other external mobile / home applications.
          </li><li>
          Add or reuse data analytic functions, including ML inferences.
          </li>
          </ul>
          </div>
        </b-col>
      </b-row>
      <b-row class="at-home" align-h="center">
        <b-col> 
        </b-col>
      </b-row>
    </div>
  </b-container>
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