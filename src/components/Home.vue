<template>
<div> 
  <App/>
  <b-container fluid style="padding-right: 0px; padding-left: 0px; margin-top:65px; margin-left:0px; margin-right:0px"> 
    <div class="bgimg" style="height: 250px;">
      <b-row style="height:100%">
        <b-col>
          <swiper class="rounded mt-3 swiper" align="center" :options="swiperOption">
            <swiper-slide>
              <b-row align-v="end" class="h-50">
                <b-col class="text-center" align="center" style="color:black">
                  <h1 style="display: inline;"><b>AIoT</b></h1>
                  <h1 style="display: inline; color:darkred">
                    <b>hings</b>
                  </h1>
                </b-col>
              </b-row>
              <b-row align-v="center" class="mt-2">
                <b-col class="text-center" align="center">
                  <h4 style="color: dimgray;">
                    Rapid IoT & Cloud
                  </h4> 
                </b-col>
              </b-row>
            </swiper-slide>
            <swiper-slide>
              <a href="#home-iot-hw-design" style="text-decoration: none;">
              <b-row align-v="end" class="h-50">
                <b-col class="text-center" align="center" style="color:black">
                  <h1 style="display: inline;"><b>IoT</b></h1>
                </b-col>
              </b-row>
              <b-row align-v="center">
                <b-col class="text-center" align="center">
                  <h3 style="display: inline; color:darkred">
                    <b>Device Design</b>
                  </h3>
                </b-col>
              </b-row>
              </a>
            </swiper-slide>
            <swiper-slide>
              <a href="#home-cloud-services" style="text-decoration: none;">
               <b-row align-v="end" class="h-50">
                <b-col class="text-center" align="center" style="color:black">
                  <h1 style="display: inline;"><b>Cloud</b></h1>
                </b-col>
              </b-row>
              <b-row align-v="center">
                <b-col class="text-center" align="center">
                  <h3 style="display: inline; color:darkred">
                    <b>Web App API</b>
                  </h3>
                </b-col>
              </b-row> 
              </a>            
            </swiper-slide>
            <swiper-slide>
              <a href="#intro-pdf" style="text-decoration: none;">
                <b-row align-v="end" class="h-50">
                  <b-col class="text-center" align="center" style="color:black">
                    <h1 style="display: inline;"><b>Applications</b></h1>
                  </b-col>
                </b-row>
                <b-row align-v="center">
                  <b-col class="text-center" align="center">
                    <h3 style="display: inline; color:darkred">
                      <b>Introduction</b>
                    </h3>
                  </b-col>
                </b-row>
              </a>
            </swiper-slide>
            <swiper-slide>
              <a href="#home-demos" style="text-decoration: none;">
                <b-row align-v="end" class="h-50">
                  <b-col class="text-center" align="center" style="color:black">
                    <h1 style="display: inline;"><b>Demos</b></h1>
                  </b-col>
                </b-row>
                <b-row align-v="center">
                  <b-col class="text-center" align="center">
                    <h3 style="display: inline; color:darkred">
                      <b>Sensor Hub</b>
                    </h3>
                  </b-col>
                </b-row>
              </a>
            </swiper-slide>
            <div class="swiper-pagination" slot="pagination"></div>
            <div class="swiper-button-prev" slot="button-prev"></div>
            <div class="swiper-button-next" slot="button-next"></div>
          </swiper>
        </b-col>
      </b-row>
    </div>
    <b-row id="home-iot-hw-design">
    </b-row>
    <div  class="bv-example-row" style="margin-top: 150px; padding-right: 50px; padding-left: 50px">
      <b-row class="at-home mt-4">
        <b-col md="5">
          <h3>
          <b-button id="popoverSmartIoT" variant="light" class="p-0" size="lg"><h3>Smart IoT</h3></b-button> product development
          </h3>
          <h5 class="mt-3">
          <ul>
            <li>Building IoT product supply chain</li> 
            <li>In-house IoT and Cloud service</li> 
            <li>In-house Web application</li> 
          </ul>
          </h5>
        </b-col>
        <b-col md="7">
          <b-popover target="popoverSmartIoT" triggers="hover focus">
              <template v-slot:title>Smart IoT is</template>
              <b-list-group style="font-size:16px;">
                <b-list-group-item>Cloud services connect to devices</b-list-group-item>
                <b-list-group-item>Data analytics above controls</b-list-group-item> 
                <b-list-group-item>Machine learning applicable</b-list-group-item>
              </b-list-group>
          </b-popover> 
          <b-jumbotron header-level="7" bg-variant="info" text-variant="white" border-variant="dark">
            <template v-slot:header style="display:inline">
              <b-row>
                <b-col align="center">
                  <h2>Idea to realization</h2>
                  <b-button-group id="popoverGetStart" size="lg">
                    <b-button  class="mx-1" variant="primary" @click="$router.push({name: 'queryProduct'})">Get Started</b-button>
                  </b-button-group>
                  <b-button variant="light" v-b-toggle.collapseGetStart style="background-color: transparent;">
                    <i class="fas fa-plus"></i>
                  </b-button>
                </b-col>
              </b-row>
            </template>
              <b-collapse id="collapseGetStart" class="mt-2">
                <b-row align-v="center">
                  <b-col>
                    <ol>
                      <li>By defining your IoT product first,</li>
                      <li>We will propose a development plan.</li>
                      <li>Then, deliver the product and services.</li>
                    </ol>
                  </b-col>
                </b-row>
              </b-collapse>
          </b-jumbotron>
          <!--
          <b-popover target="popoverGetStart" triggers="hover focus">
              <template v-slot:title>Develop IoT product</template>
              <b-list-group style="font-size:16px;">
                <b-list-group-item>1. Define your IoT product</b-list-group-item>
                <b-list-group-item>2. Propose development plan</b-list-group-item>
                <b-list-group-item>3. Deliver product and services </b-list-group-item>
              </b-list-group>
          </b-popover> 
          -->
        </b-col>
      </b-row>
      <!--
      <b-row v-b-hover="setShowGetStartedHelp">
        <b-col>
      <b-row class="at-home" align-v="top">
        <b-col align="right">
          <h3> Intelligent IoT </h3>
        </b-col>
        <b-col align="left">
          <b-button-group size="lg">
            <b-button class="mx-1" variant="success">Get Started Now</b-button>
          </b-button-group>
        </b-col>
      </b-row> 
      <b-row v-if="showGetStartedHelp" class="mt-2 ml-5">
        <b-col cols="2" />
        <b-col class="at-border">
          <ol>
            <li>By Q & A, collect and define the new IoT product</li>
            <li>Propose a project plan, technology in use and cost estimation</li>
            <li>Open a workspace and invite suppliers to chat together</li>
            <li>Support project executions, building supply-chain</li>
          </ol> 
        </b-col>
        <b-col cols="2"/>
      </b-row>
      </b-col>
      </b-row>
      -->
      <hr>
      <b-row class="at-home" align-h="center" align-v="center">
        <b-col md="6" align-self="center"> 
            <b-img src="/static/aiot-whatitis.png" fluid align=center />
        </b-col>
        <b-col md="6">
          <h5>
           AIoThings provides RAPID cloud services
            <ul>
              <li>Manage IoT devices from cloud</li>
              <li>Access cloud data storage as easy as passing messages</li>
              <li>Serverless microservices to plugin custom software</li>
              <li>Sharing resources among users for team collaboration</li>               
              <li>Interact with external services through APIs</li>
            </ul>
          </h5> 
        </b-col>
      </b-row>
      <hr>
      <b-row class="at-home" align-h="center">
        <b-col>
          <b-row> <b-col>
<markdown-it-vue class="mt-5" :content="`
### Benefits
#### Application owner

* Rapid proof of concept to operation, effective DevOps tool
* Friendly web interface, including dashboard editor, to complete tasks even without need of separate software development
* Easy sharing of services internally through only message passing, saving efforts from creating REST APIs and re-authentication

#### IoT Hardware manufacturers
* Instant provisioning of cloud services to the devices
* Highly customizable features adapt to specific needs of IoT applications
* IFTTT and Zapier supports to connect with other software through just event triggers


`" />
          </b-col> </b-row>
          <!--
          <h3> How it works </h3>
          <h5  class="mt-4"> Cloud / IoT application developers - </h5>
            <p>
              Easy-to-use features to build apps combining hardware, software and cloud.
            </p>
          <h5> IoT hardware manufacturers - </h5>
             <p>
              Cloud services connecting devices and supporting popular platforms. End users subscribe to access their IoT data.
            </p>
          <h5> AI solution providers - </h5>
             <p>
              API interface and simplified subscription model to end developers.
            </p>
          <h5> DIY users -</h5>
            <p> 
              IoT and Cloud playground for engineers, students and educators. 
            </p>
          -->
        </b-col>
        <b-col md="6" align-self="center"> 
            <b-img src="/static/aiot-block-diagram.png" fluid align=center />
        </b-col>
      </b-row>
      <hr>
      <b-row class="at-home" align-h="center" align-v="center">
        <b-col md="6" align-self="center"> 
            <b-img src="/static/microservice-diagram.png" fluid align=center />
        </b-col>
        <b-col align-v="center"> 
          <h3> Microservice and messages</h3>
          <ul class="mt-4" style="magin-left:0px">
            <li>Serverless microservices as basic function blocks running Node.js or Python codes</li>
            <li>Triggered by MQTT compatible message topics and publish results as output messages</li>
            <li>IoT devices communicate in MQTT messages, are the native triggers of microservices</li> 
            <li>By sharing and subscribing messages, users collaborate with each other effectively</li>
          </ul>
        </b-col>
      </b-row>
      <hr>
      <b-row class="at-home" align-h="center" align-v="center">
        <b-col md > 
          <h3>Web integrated development</h3>
          <p class="mt-4">
              AIoThings offers one-stop web interface to
              <ul>
                <li>Manage secured IoT device network </li>
                <li>Create/Share/Reuse microservices optimizing to tasks </li>
                <li>By choosing message topics, design workflows among devices and microservices</li>
                <li>Edge computing through AWS IoT or Node-RED</li> 
              </ul> 
          </p>    
        </b-col>
        <b-col md align-self="center"> 
          <b-img src="/static/aiot-ui-concept.png" fluid align=center />
        </b-col>
      </b-row>
      <hr>
      <b-row class="at-home" align-h="center" align-v="center">
        <b-col md="5" align-self="center" class="p-8"> 
          <b-img src="/static/aws-services-logos.png" fluid align=center />
        </b-col>
        <b-col md="7" > 
          <h3> Built on Amazon AWS </h3>  
          <p>
            <ul>
              <li>Leveraging full advantage of world largest public cloud</li>
              <li>More than 100 services spanning >20 geographical regions</li>
              <li>Best class security, scalability, AI and IoT resources</li> 
              <li>Ideal choice for scaling to large projects</li> 
            </ul>           
          </p>
        </b-col>
      </b-row>
      <hr>
      <b-row class="at-home" align-v="center">
        <b-col md="7">
          <h3> Social development</h3> 
          <p> 
            <ul>            
              <li>Encourage collaborations through sharing microservices</li>
              <li>Connect services through simple input and output message topics</li>
              <li>Find services by querying keywords</li>
              <li>Rapid development through incremental designs</li>
            </ul>
          </p>
        </b-col>
        <b-col md="5" align-self="center"> 
          <b-img style="padding:25px;" src="/static/aiot-social-develop.png" fluid align=center />
        </b-col>
      </b-row>
      <hr>
      <b-row class="at-home" align-v="center">
        <b-col md="5" align-self="center"> 
          <b-img style="padding:35px;" src="/static/sharing-economy.jpg" fluid align=center />
        </b-col>
        <b-col>
          <h3>Sharing economy </h3>
          <!--
          <em style="color:darkred;">
          [The service is FREE and feedback is always welcome.]
          </em>
          -->
          <p class="mt-4">
            <ul>
              <li>Gain Sharing Credits from sharing services through just messages and microservices</li>
              <li>No needs of extra authentication and API designs to use services</li>
              <li>Pay-as-you-go pricing that can trade credits earned by sharing</li>
              <li>Reward developers who are contributing to the ecosystem</li>
            </ul>
          </p>
        </b-col>
      </b-row>
      <hr>
       <b-row class="at-home" align-v="center">
        <b-col md="6" lg="6">
          <h3>Connecting apps and services</h3>
          <p class="mt-5">
          <ul>
            <li>Connectors are available making easier to connect to external apps and services</li> 
            <li>Trigger and action services to exchange messages over IFTTT and Zapier</li>
            <li>Microservices are built on AWS Lambda, have seamless support to Amazon Alexa</li>
          </ul>
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
      <hr>
      <b-row id="intro-pdf">
      </b-row>
      <b-row class="at-home" style="margin-top:50px;">
        <b-col md="6" lg="6" align="center"> 
          <b-img style="padding:30px;" src="/static/aiot-cold-chain.png" fluid align=center />
        </b-col>
        <b-col md="6" lg="6" align="left">
          <b-row class="mt-5">
            <b-col>
              <h3>Applications</h3>
           <ul class="mt-2" style="margin:5px 0">
            <li style="margin:5px 0">Cold chain</li>
            <li style="margin:5px 0">Food safety</li>
            <li style="margin:5px 0">Surveillance</li>
            <li style="margin:5px 0">IoT data interface</li>
          </ul>
            </b-col>
          </b-row>
          <b-row class="mt-2">
            <b-col class="ml-3">
                Download <a href="/static/aiothings-introduction.pdf">PDF presentation</a> for more.
            </b-col>
          </b-row>
        </b-col>
      </b-row>
      <hr>
      <b-row id="home-demos">
      </b-row>
      <b-row align-v="center" style="margin-top:100px">
        <b-col md="6" align-self="center">
          <b-img src="/static/climate-hub-dashboard.png" fluid align=center style="max-height:100%; padding:30px;"/>
        </b-col>
        <b-col align="center">
          <b-jumbotron header-level="7" bg-variant="info" text-variant="white" border-variant="dark" >
            <template v-slot:header style="display:inline">
              <b-row align="center">
                <b-col align="center">
                  <h2>Demos</h2>
                  <spinner v-if="isDemoLaunching === true" size="medium" />
                  <b-button-group v-if="isDemoLaunching === false" id="popoverDemoLogin" size="lg">
                    <b-button  class="mx-1" variant="primary" @click="demoLogin">Start</b-button>
                  </b-button-group>
                  <b-button v-if="isDemoLaunching === false" variant="light" v-b-toggle.collapseDemoLogin style="background-color: transparent;">
                    <i class="fas fa-plus"></i>
                  </b-button>
                </b-col>
              </b-row>
            </template>
              <b-collapse id="collapseDemoLogin" class="mt-2">
                <b-row align-v="center">
                  <b-col align="center">
                      <p>Login to Demo account <b>Techware</b></p>
                      <div style="width: 300px; text-align: left;">
                        <p style="margin-left:25px;"> It runs: </p>
                        <ul>
                          <li>Climate Sensor Hub</li>
                          <li>Node-RED on Rasp. Pi</li>
                          <li>ML Image Recognition</li>
                        </ul>
                      </div>
                  </b-col>
                </b-row>
              </b-collapse>
          </b-jumbotron>
        </b-col>
      </b-row>
      <b-modal ref="logoutFirstModal" ok-only hide-header size="sm">
          Signout from current account first.
      </b-modal>
      <hr>
      <b-row id="home-cloud-services">
      </b-row>
      <b-row class="at-home" align-v="center" style="margin-top:60px;">
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
          Deploy microservices or <a href="/docs/main#DocNodeRed">Node-RED</a> flows to <a href="/docs/main#DocThingEdge">edge devices</a>. 
          </li><li>
          Design workflow by <a href="/docs/main#DocMicroserviceTopic">input and output message topics</a> of microservices. 
          </li><li>
          Debug microservices with <a href="/docs/main#DocLog">running logs</a>. 
          </li><li>
          Create <a href="/docs/main#DocApi">REST APIs</a> to interact with external services. 
          </li><li>
          Integrate with <a href="/docs/main#DocProgramming">web and mobile</a> applications.
          </li><li>
          Add or reuse  <a href="/docs/main#DocThingEdgeMachineLearning">machine learning</a> resources.
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
import { Swiper, SwiperSlide } from 'vue-awesome-swiper'
import 'swiper/css/swiper.css'
import { Auth } from 'aws-amplify'
// import { CognitoAuth } from 'amazon-cognito-auth-js'
// import awsmobile from '../aws-exports.js'
import { eventBus } from '../main'
import atHelper from '../aiot-helper'

export default {
  name: 'home',
  components: {
      Swiper,
      SwiperSlide
  },
  data: function () {
    return {
      isDemoLaunching: false,
      showGetStartedHelp: false,
      hostUrl: '',
      response: 'unknown',
      idName: '',
      nodeUrl: 'https://flows.nodered.org/flow/0d98ac57a6ebf724def9',
      swiperOption: {
          spaceBetween: 30,
          centeredSlides: true,
          autoplay: {
            delay: 5000,
            disableOnInteraction: false
          },
          pagination: {
            el: '.swiper-pagination',
            clickable: true
          },
          navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev'
          }
      }
    }
  },
  // components: { VueMarkdown },
  computed: {
  },
  methods: {
    async demoLogin() {
      if (this.$store.getters.isAuthenticated) {
        if (this.$store.getters.username === 'Techware') {
          this.$router.push({ name: 'mythings' }) 
        } else {
          this.$refs.logoutFirstModal.show()
        }
      } else {
        this.isDemoLaunching = true
        try {
            const user = await Auth.signIn('Techware', 'Techware123');
            console.log('user: ', user)
            const authSessionPromise = Auth.currentSession()
            const session = await authSessionPromise
            console.log('user session: ', session)
            this.$store.dispatch('profileUpdate', session.idToken.payload)

            const authCredentialsPromise = Auth.currentCredentials()
            const credentials = await authCredentialsPromise
            // console.log('credentials: ', credentials)
            const identityId = credentials.identityId
            await atHelper.allowLoginIdentityUseIoT(identityId, this.$store.getters.userId, this.$store.getters.profile)
            // console.log('jump to mythings')
            eventBus.$emit('login')
            this.$store.commit('setGuestLoggedin', true)
            this.isDemoLaunching = false
            this.$router.push({ name: 'mythings' })
        } catch (error) {
            console.log('error demo signing in', error);
        }
        this.isDemoLaunching = false
      }
     /*
     const hostUrl = window.location.protocol + '//' + window.location.host
     const redirectUriSignIn = hostUrl + '/callback/'
     const redirectUriSignOut = hostUrl + '/signout/'
     // let awsmobile = this.$awsmobile
     console.log('as: ', redirectUriSignIn)
     const params = {
            ClientId: awsmobile.aws_user_pools_web_client_id,
            UserPoolId: awsmobile.aws_user_pools_id,
            AppWebDomain: awsmobile.oauth.domain, 
            TokenScopesArray: awsmobile.oauth.scope,
            RedirectUriSignIn: redirectUriSignIn, // awsmobile.oauth.redirectSignIn,
            RedirectUriSignOut: redirectUriSignOut, // awsmobile.oauth.redirectSignOut,
            ResponseType: awsmobile.oauth.responseType // , // ResponseType,
            // Storage  // optional
      }
      const cognitoAuthClient = new CognitoAuth(params);
      cognitoAuthClient.userhandler = {
            // user signed in
            onSuccess: (result) => {
                console.log('login success')
                Auth.currentSession().then(async (session) => {
                    // ...
                })
            },
            onFailure: (err) => {
                console.log('Error in cognito hosted auth response: ', err)
            }
      };

      const curUrl = window.location.href
      console.log('url: ', hostUrl)
      cognitoAuthClient.parseCognitoWebResponse(hostUrl)
      */
    },
    setShowGetStartedHelp (hovered) {
      this.showGetStartedHelp = hovered
    },
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

<style scoped>
.popover{
    max-width: 100%; /* Max Width of the popover (depending on the container!) */
}
</style>
<style lang="scss" scoped>
  // @import './base.scss';
  .swiper {
    width: 90%;
    height: 90%;
    padding: 10px;
    background-color: white;
    opacity: .7;

    .swiper-slide {
      background-position: 50%;
      background-size: cover;
      width: 100%;
      /*
      &.slide-1 {
        background-image:url('/images/example/5.jpg');
      }
      &.slide-2 {
        background-image:url('/images/example/6.jpg');
      }
      &.slide-3 {
        background-image:url('/images/example/7.jpg');
      }
      &.slide-4 {
        background-image:url('/images/example/8.jpg');
      }
      &.slide-5 {
        background-image:url('/images/example/9.jpg');
      }
      */
    }
  }
</style>