<template>
  <b-container fluid>
    <div v-bind:titleString="changeTitle()">
      <b-modal id="modalReturnConfirm"
             hide-header=""
             ref="modalReturnConfirmRef"
             @ok="returnDiscardChangesOk"
             @cancel="returnCancel">
             <h5>Leave and ignore the changes?</h5>
      </b-modal>
      <b-row align-v="center" style="border-bottom: 1px solid grey; padding-bottom: 5px;
  margin-bottom: 5px;">
        <b-col align="start">
            <h4>IoT Device : {{thingName}}</h4>
        </b-col>
        <b-col sm="auto" align="end">
          <!-- <b-button v-if="!isShowEdit" v-b-popover.hover.bottom="'toggle to edit mode'" v-b-toggle.collapseEdit.collapseShow variant="info" @click="isChangedNotSaved = false">Edit</b-button>
          <b-button v-if="isShowEdit" v-b-popover.hover.bottom="'toggle to display only'" v-b-toggle.collapseEdit.collapseShow variant="info">Show</b-button> -->
          <b-button variant="info" @click="updateThing()">Update</b-button>
          <b-button v-if="isEdgeAbleToDeploy" v-b-popover.hover.bottom="'To deploy, make sure the edge device is online and edge daemon is running'" variant="info" @click="deployEdge()">Edge Deploy</b-button>
          <b-button v-if="isEdgeAbleToDelete" variant="info" @click="deleteEdge()">Delete Edge</b-button>
          <b-button variant="dark" @click="backHome()">Return</b-button>
        </b-col>
      </b-row>
      <spinner v-if="isDeploying === true" size="medium" />
      <!-- 
      <b-row align-v="center" class="mt-3">
        <b-col sm align="start">
          <h4 style="display: inline;" class="mr-0">Thing Name: &ensp;</h4> 
          <h5 v-if="isShowEdit === false" style="display: inline;">{{thingName}} </h5>
          <b-form-input v-if="isShowEdit === true" class="at-border" v-model="thingName" placeholder="Thing name"></b-form-input>
        </b-col>
      </b-row>
      -->
      <b-tabs card>
        <b-tab title="Thing Settings">
          <b-row class="mt-3">
            <b-col>
              <h4>Description </h4>
            </b-col>
          </b-row>
          <!-- 
          <b-row>
            <b-col>
              <b-collapse visible id="collapseShow" class="mt-2" style="white-space: pre-wrap;">
                <textarea class="w-100 h-300" style="height: 150px;" v-model="thingDesc" placeholder="Please input for description" disabled></textarea>
              </b-collapse> 
            </b-col>       
          </b-row>
          -->
          <b-row>
            <b-col>
            <!-- <b-collapse id="collapseEdit" class="mt-2"> -->
              <!-- <b-collapse id="collapseEdit" class="mt-2" style="width:100%; height: 150px; "> -->
                <textarea class="w-100 h-300" style="height: 150px;" v-model="thingDesc" placeholder="Please input for description"></textarea>
              <!-- </b-collapse> -->
            <!-- </b-collapse> -->
            </b-col>
          </b-row>
          <b-row class="mt-3">
            <b-col sm="4">
              <h5 style="display: inline;">User ID</h5>
            </b-col>
            <b-col>
              <h5 style="display: inline;"><code>{{$store.getters.username}}</code></h5>
            </b-col>
          </b-row>
          <b-row class="mt-2">
            <b-col sm="4">
              <h5 style="display: inline;">Thing ID</h5> 
            </b-col>
            <b-col>
              <h5 style="display: inline;"><code>{{thing.ThingId}}</code></h5>
            </b-col>
          </b-row>
          <b-row  class="mt-2">
            <b-col sm="4">
                <h5 style="display: inline;">Certificates & key</h5>
            </b-col>
            <b-col>
                <b-button style="display: inline;" id="downloadButton" variant="info" @click="downloadCert()">Download</b-button>
            </b-col>
          </b-row>
          <spinner v-if="isDownloading === true" size="medium" />
          <b-modal id="deployErrorModal"
             ref="deployErrorModalRef" 
             ok-only
             >
            Edge deployment is failed
          </b-modal>
          <b-popover v-if="isDownloading === false" target="downloadButton" triggers="hover focus">
                  <template slot="title">Download configurations</template>
                    <b-row><b-col>They are used to build a secured connection to IoT device.</b-col></b-row>
                    <b-row><b-col><span class="text-danger">certificate.crt</span></b-col></b-row><b-row><b-col>Certificate for AIoThings to certify this device. <br /></b-col></b-row>
                    <b-row><b-col><span class="text-danger">private.key</span></b-col></b-row><b-row><b-col>Private key the device uses as it's identity. <br /></b-col></b-row>
                    <b-row><b-col><span class="text-danger">root-CA.crt</span></b-col></b-row><b-row><b-col>Certificate issued by CA (Certificate Authority) used to certify AIoThings. <br /></b-col></b-row>
          </b-popover>
          <b-row class="mt-2">
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
        </b-tab>
        <b-popover target="propsTabBtn___BV_tab_button__" placement="right" triggers="hover focus" content="An Edge device is more than a Thing, able to run microservices locally."></b-popover>
        <b-tab title="Edge Setting" id="propsTabBtn">
         <spinner v-if="isEdgeUpdating === true" size="medium" />
         <b-row class="mt-1">
           <b-col>
              <b-tabs card>
                <b-tab title="Microservices">
                  <b-modal id="addEdgeServiceModal" ref="addEdgeServiceModalRef" title="Select from microservices" class="my-modal">
                    <b-list-group>
                      <b-list-group-item v-for="(service, index) in unselectedMicroservices" :key="index" href="#" @click="confirmAddEdgeService(service)">
                        {{service.ServiceName}}
                      </b-list-group-item>    
                    </b-list-group>
                    <div v-if="favoriteServices !== null && favoriteServices.length > 0">
                      From favorites:
                      <b-list-group>
                        <b-list-group-item v-for="(service) in favoriteServices" :key="service.ServiceName" href="#" @click="confirmAddEdgeService(service)">
                          {{service.ServiceName}}
                        </b-list-group-item>    
                      </b-list-group>
                    </div>
                </b-modal> 
                <b-modal @ok="confirmSetEdgeMicroservice(ggFunction)" id="setEdgeMicroserviceModal" ref="setEdgeMicroserviceModalRef" title="Set Edge Microservice" class="my-modal">
                  <b-container fluid>
                      <b-row>
                        <b-col sm="4">
                          Lifestyle
                        </b-col>
                        <b-col sm="8">
                          <b-form-select v-model="ggFunction.FunctionConfiguration.Pinned" class="mb-3">
                            <option :value="true">Long-lived and running indefinitely</option>
                            <option :value="false">On-demand function</option>
                          </b-form-select>                       
                        </b-col>
                      </b-row>
                      <b-row class="mt-1" v-if="ggFunction.FunctionConfiguration.Pinned === true">
                        <b-col sm="4">
                          Timeout
                        </b-col>
                        <b-col sm="8">
                          <b-form-input v-model="ggFunction.FunctionConfiguration.Timeout" type="number" placeholder="in seconds">
                          </b-form-input>                     
                        </b-col>
                      </b-row>
                      <b-row class="mt-1">
                        <b-col sm="4">
                          Memory size
                        </b-col>
                        <b-col sm="8">
                          <b-form-input v-model="ggFunction.FunctionConfiguration.MemorySize" type="number" placeholder=">= 32000 in KB">
                          </b-form-input>                     
                        </b-col>
                      </b-row>
                      <b-row class="mt-1">
                        <b-col sm="4">
                          Resources used
                        </b-col>
                        <b-col sm="8">
                        <b-form-select v-model="ggFunctionResourceId" class="mb-3">
                            <option :value="null">Add resource</option>
                            <option v-for="(edgeResource, index) in unselectedEdgeFunctionResources" :key="index" :value="edgeResource.Id">{{edgeResource.Id}}</option>
                          </b-form-select>
                        </b-col>
                      </b-row>
                      <b-row class="mt-1">
                        <b-col>
                          <b-list-group>
                            <b-list-group-item v-for="(resourcePolicy, index) in ggFunction.FunctionConfiguration.Environment.ResourceAccessPolicies" :key="index">
                              <b-row>
                                <b-col sm="7">
                                  {{resourcePolicy.ResourceId}}
                                </b-col>
                                <b-col sm="2"> 
                                  <b-button size="sm" @click="switchResourcePolicyPermission(index)">
                                    {{resourcePolicy.Permission}}
                                  </b-button>
                                </b-col>                                
                                <b-col sm="3" align="end">
                                  <b-button size="sm" @click="deleteEdgeFunctionResource(index)">
                                    <i class="fas fa-trash-alt"></i>
                                  </b-button>
                                </b-col>
                              </b-row>
                            </b-list-group-item>
                          </b-list-group>
                        </b-col>
                      </b-row>
                  </b-container>
                </b-modal> 
                <b-row align-v="center">
                  <b-col align="start" sm="8">
                      <h5>Microservices running on this edge device</h5>
                  </b-col>
                  <b-col align="end">
                    <b-button v-b-modal.addEdgeServiceModal v-b-popover.hover.bottom="'Add new microservice to run on this edge'" variant="info" @click="addNewEdgeService()">Add New</b-button>
                  </b-col>
                </b-row> 
                <b-row align-v="center" style="border-bottom: 1px solid grey">
                  <b-col align="start">
                  </b-col>
                </b-row>
                <b-row v-if="edgeFunctions.length === 0">
                  <b-col class="text-center mt-5" >
                    No microservices running on this edge .
                  </b-col>
                </b-row>
                <b-row class="mt-1" v-else>
                  <div class="at-scroll">
                    <b-card-group columns>
                      <b-card v-for="(edgeFunction, index) in edgeFunctions" :key="index"
                          img-src="/static/photo-27.png"
                          img-alt="Image"
                          img-top
                          tag="article"
                          class="mb-2 at-card">
                          <b-row>
                            <b-col>
                              <p class="card-text">
                                {{edgeFunctionArnToName(edgeFunction)}}
                              </p>
                            </b-col>
                            <b-col align="end">   
                              <b-dropdown variant="secondary" class="mx-0" right >
                                <!-- VUE reference: https://vuejs.org/v2/guide/events.html -->
                                <b-dropdown-item @click.stop="deleteFunctionFromEdge(index)" >Unselect</b-dropdown-item>
                                <b-dropdown-item @click = "editFunctionDetail(edgeFunction)" >Edit</b-dropdown-item>
                              </b-dropdown>
                            </b-col>
                          </b-row>
                          <b-row class="mt-2" v-if="edgeFunctionToService(edgeFunction) !== null" >
                            <b-col>
                              {{edgeFunctionToService(edgeFunction).ServiceDesc}}
                            </b-col>
                          </b-row>
                          <!--
                          <b-row class="mt-1" v-if="edgeFunctionToService(edgeFunction) !== null" align-v="center" style="border-top: 1px solid lightgrey; padding-top: 5px; margin-top: 5px;">
                            <b-col sm="5">
                              Input:
                            </b-col>
                            <b-col sm="7">
                              {{edgeFunctionToService(edgeFunction).InputMessageTopic}}
                            </b-col>
                          </b-row>
                          <b-row class="mt-1" v-if="edgeFunctionToService(edgeFunction) !== null">
                            <b-col sm="5">
                              Output:
                            </b-col>
                            <b-col sm="7">
                              {{edgeFunctionToService(edgeFunction).OutputMessageTopic}}
                            </b-col>
                          </b-row>
                          -->
                          <b-row>
                            <b-col align="left" v-if="edgeFunction.FunctionConfiguration.Environment.ResourceAccessPolicies.length > 0">
                              Resources:
                            </b-col>
                          </b-row>
                          <small>
                          <b-row class="mt-1" v-if="edgeFunction.FunctionConfiguration.Environment.ResourceAccessPolicies.length > 0">
                            <b-col>
                              <b-list-group>
                                <b-list-group-item v-for="(resource, index) in edgeFunction.FunctionConfiguration.Environment.ResourceAccessPolicies" :key="index" href="#">
                                  <b-row>
                                    <b-col sm="9" align="left">
                                      {{resource.ResourceId}}
                                    </b-col>
                                    <b-col>
                                      {{resource.Permission}}
                                    </b-col>
                                  </b-row>
                                </b-list-group-item>    
                              </b-list-group>
                            </b-col>
                          </b-row>
                          </small>
                      </b-card>
                    </b-card-group>
                  </div>
                </b-row>
              </b-tab>
              <b-tab title="Resources">
                <b-modal id="addResourceModal" ref="addResourceModalRef" title="Select from Resource types" class="my-modal">
                    <b-list-group>
                      <b-list-group-item v-for="(resource) in resources" :key="resource.ResourceType" href="#" @click="confirmAddResource(resource)">
                        {{resource.ResourceType}}
                      </b-list-group-item>    
                    </b-list-group>
                </b-modal>
                <b-modal @ok="confirmSetMLResource" id="setMLResourceModal" ref="setMLResourceModalRef" title="Set Machine Learning Resource" class="my-modal">
                  <b-container fluid>
                    <form @submit.stop.prevent="handleMLResourceSubmit">
                      <b-row>
                        <b-col sm="4">
                          Resource name (ID)
                        </b-col>
                        <b-col sm="8">
                          <b-form-input v-model="ggMLResource.Name" type="text" placeholder="Unique service name"></b-form-input>
                        </b-col>
                      </b-row>
                      <b-row class="mt-1">
                        <b-col sm="4">
                          ML model
                        </b-col>
                        <b-col sm="8">
                          {{ggMLResourceModelFileName}}
                        </b-col>
                      </b-row>
                      <b-row class="mt-1">
                        <b-col sm="4">
                        </b-col>
                        <b-col sm="8">
                          <b-form-file v-model="mlResourceModelFile" :state="Boolean(mlResourceModelFile)" accept=".gz, .zip" placeholder="Choose a file..."></b-form-file>
                        </b-col>
                      </b-row>
                      <b-row class="mt-1">
                        <b-col sm="4">
                          Local path
                        </b-col>
                        <b-col sm="8">
                          <b-form-input v-model="ggMLResource.ResourceDataContainer.S3MachineLearningModelResourceData.DestinationPath" type="text" placeholder="e.g. /trained_models"></b-form-input>
                        </b-col>
                      </b-row>
                    </form>
                    <b-row style="border-top: 1px solid lightgrey; padding-top: 5px; margin-top: 5px;">
                      <small>
                        <p>
                        In order to run machine learning inference function over edge device, the edge device needs to install the related runtimes and precompiled framework libraries.
                        </p>
                        <p>
                        The runtimes and precompiled framework libraries can be downloaded through the Software page of the AWS IoT console.
                        </p>
                        <p>
                        In the Machine learning inference section of the Software page, choose the right libraries for the machine learning model in use, and download.
                        </p>
                        <ul>  
                            <li>Amazon SageMaker Neo deep learning runtime. (Greengrass Core Software License Agreement)</li>
                            <li>Apache MXNet (Apache License 2.0)</li>
                            <li>TensorFlow (Apache License 2.0)</li>
                            <li>Chainer (MIT License)</li>
                            <li>Cameras (for example, /dev/video0).</li>
                        </ul>
                      </small>
                    </b-row> 
                  </b-container>
                </b-modal> 
                <b-modal @ok="confirmSetLocalDeviceResource" id="setLocalDeviceResourceModal" ref="setLocalDeviceResourceModalRef" title="Set Device Resource" class="my-modal">
                  <b-container fluid>
                    <form @submit.stop.prevent="handleDeviceResourceSubmit">
                      <b-row>
                        <b-col sm="4">
                          Resource name (ID)
                        </b-col>
                        <b-col sm="8">
                          <b-form-input v-model="ggLocalDeviceResource.Name" type="text" placeholder="Unique name"></b-form-input>
                        </b-col>
                      </b-row>
                      <b-row class="mt-1">
                        <b-col sm="4">
                          Group Owner
                        </b-col>
                        <b-col sm="8">  
                          <b-form-input v-model="ggLocalDeviceResource.ResourceDataContainer.LocalDeviceResourceData.GroupOwnerSetting.GroupOwner" type="text" placeholder="Other group name if need."></b-form-input>
                        </b-col>
                      </b-row>                        
                      <b-row class="mt-1">
                        <b-col sm="4">
                          Device path
                        </b-col>
                        <b-col sm="8">
                          <b-form-input v-model="ggLocalDeviceResource.ResourceDataContainer.LocalDeviceResourceData.SourcePath" type="text" placeholder="e.g. /dev/bus/usb"></b-form-input>
                        </b-col>
                      </b-row>
                    </form>
                    <b-row style="border-top: 1px solid lightgrey; padding-top: 5px; margin-top: 5px;">
                      <small>
                        <p>
                        Files under /dev. Only character devices or block devices under /dev are allowed for device resources. These include:
                        <ul>                     
                            <li>Serial ports (for example, /dev/ttyS0, /dev/ttyS1).</li>
                            <li>USB (for example, /dev/ttyUSB0 or /dev/bus/usb).</li>
                            <li>GPIOs (for example, /dev/gpiomem).</li>
                            <li>GPUs (for example, /dev/nvidia0).</li>
                            <li>Cameras (for example, /dev/video0).</li>
                        </ul>
                        </p>
                      </small>
                    </b-row> 
                  </b-container>
                </b-modal> 
                <b-modal @ok="confirmSetLocalVolumeResource" id="setLocalVolumeResourceModal" ref="setLocalVolumeResourceModalRef" title="Set Volume Resource" class="my-modal">
                  <b-container fluid>
                    <!-- <form @submit.stop.prevent="handleLocalVolumeResourceSubmit"> -->
                    <b-row>
                      <b-col sm="4">
                        Resource name (ID)
                      </b-col>
                      <b-col sm="8">
                        <b-form-input v-model="ggLocalVolumeResource.Name" type="text" placeholder="Unique name"></b-form-input>
                      </b-col>
                    </b-row>
                    <b-row class="mt-1">
                      <b-col sm="4">
                        Source path
                      </b-col>
                      <b-col sm="8">
                        <b-form-input v-model="ggLocalVolumeResource.ResourceDataContainer.LocalVolumeResourceData.SourcePath" type="text" placeholder="e.g. /src/test"></b-form-input>
                      </b-col>
                    </b-row>
                    <b-row class="mt-1">
                      <b-col sm="4">
                        Destination path
                      </b-col>
                      <b-col sm="8">  
                        <b-form-input v-model="ggLocalVolumeResource.ResourceDataContainer.LocalVolumeResourceData.DestinationPath" type="text" placeholder="e.g. /dst/test"></b-form-input>
                      </b-col>
                    </b-row>
                    <b-row class="mt-1">
                      <b-col sm="4">
                        Group Owner
                      </b-col>
                      <b-col sm="8">  
                        <b-form-input v-model="ggLocalVolumeResource.ResourceDataContainer.LocalVolumeResourceData.GroupOwnerSetting.GroupOwner" type="text" placeholder="Other group name if need."></b-form-input>
                      </b-col>
                    </b-row>                    
                    <!-- </form> -->
                    <b-row style="border-top: 1px solid lightgrey; padding-top: 5px; margin-top: 5px;">
                      <small>
                      <p>
                      Source path is the local absolute path of the resource on the file system of the core device. This
location is outside of the container that the function runs in. The path can't start with /sys.</p>
                      <p>Destination path is the absolute path of the resource in the Lambda namespace. This location is
inside the container that the function runs in.</p>
                      </small>
                    </b-row> 
                  </b-container>
                </b-modal> 
                <b-row align-v="center">
                  <b-col align="start">
                      <h5>Resources defined on this edge device</h5>
                  </b-col>
                  <b-col align="end">
                    <b-button v-b-modal.addResourceModal v-b-popover.hover.bottom="'Add new resource of this edge'" variant="info" @click="addNewResource()">Add New</b-button>
                  </b-col>
                </b-row> 
                <b-row align-v="center" style="border-bottom: 1px solid grey">
                  <b-col align="start">
                  </b-col>
                </b-row>
                <b-row v-if="edgeResources.length === 0">
                  <b-col class="text-center mt-5" >
                    No resource set on this edge .
                  </b-col>
                </b-row>
                <b-row class="mt-1" v-else>
                  <div class="at-scroll">
                    <b-card-group columns>
                      <b-card v-for="(resource, index) in edgeResources" :key="index"
                          class="mb-2 at-card">
                          <b-row >
                            <b-col class="color-box" v-bind:style="{'background-color': resourceCboxColor(resource)}">
                            </b-col>
                          </b-row>
                          <b-row>
                            <b-col align="start">
                              <p class="card-text">
                                {{resource.Name}}
                              </p>
                            </b-col>
                            <b-col align="end">   
                              <b-dropdown variant="secondary" class="mx-0" right >
                                <!-- VUE reference: https://vuejs.org/v2/guide/events.html -->
                                <b-dropdown-item @click.stop="deleteResourceFromEdge(index)" >Unselect</b-dropdown-item>
                                <b-dropdown-item @click = "editResourceDetail(resource)" >Edit</b-dropdown-item>
                              </b-dropdown>
                            </b-col>
                          </b-row>
                          <b-row>
                            <b-col>
                              {{resourceType(resource)}}
                            </b-col>
                          </b-row>
                          <div  v-if="resourceType(resource) === 'Local Device'">
                            <b-list-group>
                              <b-list-group-item>{{resource.ResourceDataContainer.LocalDeviceResourceData.SourcePath}}</b-list-group-item>
                              <b-list-group-item v-if="resource.ResourceDataContainer.LocalDeviceResourceData.GroupOwnerSetting.AutoAddGroupOwner === false">{{resource.ResourceDataContainer.LocalDeviceResourceData.GroupOwnerSetting.GroupOwner}}</b-list-group-item>
                            </b-list-group>
                          </div>
                          <div v-if="resourceType(resource) === 'Local Volume'">
                            <b-list-group>
                              <b-list-group-item>{{resource.ResourceDataContainer.LocalVolumeResourceData.SourcePath}}</b-list-group-item>
                              <b-list-group-item>{{resource.ResourceDataContainer.LocalVolumeResourceData.DestinationPath}}</b-list-group-item>
                              <b-list-group-item v-if="resource.ResourceDataContainer.LocalVolumeResourceData.GroupOwnerSetting.AutoAddGroupOwner === false">{{resource.ResourceDataContainer.LocalVolumeResourceData.GroupOwnerSetting.GroupOwner}}</b-list-group-item>
                            </b-list-group>
                          </div>
                          <div v-if="resourceType(resource) === 'Machine Learning'">
                            <b-list-group>
                              <b-list-group-item>{{mlResourceModelFileName(resource)}}</b-list-group-item>
                              <b-list-group-item>{{mlResourceModelDestPath(resource)}}</b-list-group-item>
                            </b-list-group>
                          </div>
                      </b-card>
                    </b-card-group>
                  </div>
                </b-row>
              </b-tab>
              <b-tab title="Connectors">
                <b-modal id="addConnectorModal" ref="addConnectorModalRef" title="Select from Connectors" class="my-modal">
                  <b-container fluid>
                    <b-list-group>
                      <b-list-group-item v-for="(connector) in unselectedConnectors" :key="connector.ConnectorName" href="#" @click="confirmAddConnector(connector)">
                        {{connector.ConnectorName}}
                      </b-list-group-item>    
                    </b-list-group>
                  </b-container>
                </b-modal> 
                <!-- -->
                <b-modal @ok="confirmSetRaspPiGpioConnector" id="setRaspPiGpioConnectorModal" ref="setRaspPiGpioConnectorModalRef" title="Set Raspberry Pi GPIO Connector" class="my-modal">
                  <b-container fluid>
                    <b-row>
                      <b-col>
                        <h5>Controls GPIO pins on a Raspberry Pi core device.</h5>
                      </b-col>
                    </b-row>
                    <form @submit.stop.prevent="handleRaspPiGpioConnectorSubmit">
                      <b-row align-v="center" class="mt-1">
                        <b-col sm="4">
                          Device Resource
                        </b-col>
                        <b-col sm="8">
                          <b-form-select v-model="ggRaspPiGpioConnector.Parameters['GpioMem-ResourceId']" class="mb-3">
                              <option :value="null">Please select a device resource</option>
                              <option v-for="(resource, index) in edgeResources" :key="index" :value="resource.Name">{{resource.Name}}</option>
                          </b-form-select>
                        </b-col>
                      </b-row>
                      <b-row align-v="center">
                        <b-col>
                          <h6>Optional settings</h6>
                        </b-col>
                      </b-row>
                      <b-row align-v="center" class="mt-1">
                        <b-col sm="4">
                          Input pins, 
                          <small>Pull [U]p, [D]own</small>
                        </b-col>
                        <b-col sm="8">
                          <b-form-input v-model="ggRaspPiGpioConnector.Parameters.InputGpios" type="text" placeholder="e.g. 5,6U,7D"></b-form-input>
                        </b-col>
                      </b-row>
                      <b-row align-v="center" class="mt-1">
                        <b-col sm="4">
                          Poll period
                        </b-col>
                        <b-col sm="8">  
                          <b-form-input v-model="ggRaspPiGpioConnector.Parameters.InputPollPeriod" type="number" placeholder="in ms"></b-form-input>
                        </b-col>
                      </b-row>
                     <b-row align-v="center" class="mt-1">
                        <b-col sm="4">
                          Output pins, 
                          <small>[H]igh, [L]ow state</small>
                        </b-col>
                        <b-col sm="8">
                          <b-form-input v-model="ggRaspPiGpioConnector.Parameters.OutputGpios" type="text" placeholder="e.g. 7,8H,27L"></b-form-input>
                        </b-col>
                    </b-row>
                    </form>
                  </b-container>
                </b-modal> 
                <!-- -->
               <b-modal @ok="confirmSetModbusConnector" id="setModbusConnectorModal" ref="setModbusConnectorModalRef" title="Set Modbus Connector" class="my-modal">
                  <b-container fluid>
                    <b-row>
                      <b-col>
                        Modbus-RTU Protocol Adapter
                        <p><small>Sends requests to Modbus RTU Devices.</small></p>
                      </b-col>
                    </b-row>
                    <form @submit.stop.prevent="handleModbusConnectorSubmit">
                      <b-row class="mt-1">
                        <b-col sm="4">
                          Modbus serial port Resource
                        </b-col>
                        <b-col sm="8">
                          <b-form-select v-model="ggModbusConnector.Parameters['ModbusSerialPort-ResourceId']" class="mb-3">
                              <option :value="null">Please select a ML resource</option>
                              <option v-for="(resource, index) in edgeResources" :key="index" :value="resource.Name">{{resource.Name}}</option>
                          </b-form-select>
                        </b-col>
                      </b-row>
                     </form>
                  </b-container>
                </b-modal>
                <!-- -->
                <b-modal @ok="confirmSetImageClassArmv7Connector" id="setImageClassArmv7ConnectorModal" ref="setImageClassArmv7ConnectorModalRef" title="Set Machine Learning Connector" class="my-modal">
                  <b-container fluid>
                    <b-row>
                      <b-col>
                        Image Classification ARMv7
                        <p><small>Image classification inference service (Arm v7, Raspberry Pi)</small></p>
                      </b-col>
                    </b-row>
                    <form @submit.stop.prevent="handleImageClassArmv7ConnectorSubmit">
                      <b-row>
                        <b-col sm="4">
                          Connector ID
                        </b-col>
                        <b-col sm="8">
                          <b-form-input v-model="ggMLConnector.Id" type="text" placeholder="Connector ID"></b-form-input>
                        </b-col>
                      </b-row>
                      <b-row class="mt-1">
                        <b-col sm="4">
                          Machine-learning Resource
                        </b-col>
                        <b-col sm="8">
                          <b-form-select v-model="ggMLConnector.Parameters.MLModelResourceId" class="mb-3">
                              <option :value="null">Please select a ML resource</option>
                              <option v-for="(resource, index) in edgeResources" :key="index" :value="resource.Name">{{resource.Name}}</option>
                          </b-form-select>
                        </b-col>
                      </b-row>
                      <b-row class="mt-1">
                        <b-col sm="4">
                          Model destination path
                        </b-col>
                        <b-col sm="8">
                          <b-form-input v-model="ggMLConnector.Parameters.MLModelDestinationPath" type="text" placeholder="e.g. /dest/model"></b-form-input>
                        </b-col>
                      </b-row>
                      <b-row class="mt-1">
                        <b-col sm="4">
                          Local inference service name
                        </b-col>
                        <b-col sm="8">  
                          <b-form-select v-model="ggMLConnector.Parameters.LocalInferenceServiceName" class="mb-3">
                            <option :value="null">Select an inference microservice</option>
                            <option v-for="(edgeFunction, index) in edgeFunctions" :key="index" :value="edgeFunctionArnToName(edgeFunction)">{{edgeFunctionArnToName(edgeFunction)}}</option>
                          </b-form-select>
                        </b-col>
                      </b-row>
                     </form>
                  </b-container>
                </b-modal> 
                <b-modal @ok="confirmSetImageClassArmv8Connector" id="setImageClassArmv8ConnectorModal" ref="setImageClassArmv8ConnectorModalRef" title="Set Machine Learning Connector" class="my-modal">
                  <b-container fluid>
                    <b-row>
                      <b-col>
                        Image Classification Aarch64 JTX2
                        <p><small>Image classification inference service (Nvidia Jetson TX2).</small></p>
                      </b-col>
                    </b-row>
                    <form @submit.stop.prevent="handleImageClassArmv8ConnectorSubmit">
                      <b-row>
                        <b-col sm="4">
                          Connector ID
                        </b-col>
                        <b-col sm="8">
                          <b-form-input v-model="ggMLConnector.Parameters.Id" type="text" placeholder="Connector ID"></b-form-input>
                        </b-col>
                      </b-row>
                      <b-row class="mt-1">
                        <b-col sm="4">
                          Machine-learning Resource
                        </b-col>
                        <b-col sm="8">
                          <b-form-select v-model="ggMLConnector.Parameters.MLModelResourceId" class="mb-3">
                              <option :value="null">Please select a ML resource</option>
                              <option v-for="(resource, index) in edgeResources" :key="index" :value="resource.Name">{{resource.Name}}</option>
                          </b-form-select>
                        </b-col>
                      </b-row>
                      <b-row class="mt-1">
                        <b-col sm="4">
                          Model destination path
                        </b-col>
                        <b-col sm="8">
                          <b-form-input v-model="ggMLConnector.Parameters.MLModelDestinationPath" type="text" placeholder="e.g. /dest/model"></b-form-input>
                        </b-col>
                      </b-row>
                      <b-row class="mt-1">
                        <b-col sm="4">
                          Local inference service name
                        </b-col>
                        <b-col sm="8">  
                          <b-form-input v-model="ggMLConnector.Parameters.LocalInferenceServiceName" type="text" placeholder="local inference service"></b-form-input>
                        </b-col>
                      </b-row>
                      <b-row>
                        <b-col sm="4">
                          GPU Acceleration
                        </b-col>
                        <b-col sm="8">
                          <b-form-select v-model="ggMLConnector.Parameters.GPUAcceleration" class="mb-3">
                              <option :value="'GPU'">GPU</option>
                              <option :value="'CPU'">CPU</option>
                          </b-form-select>
                        </b-col>
                      </b-row>
                     </form>
                  </b-container>
                </b-modal>
                <b-modal @ok="confirmSetImageClassX86Connector" id="setImageClassX86ConnectorModal" ref="setImageClassX86ConnectorModalRef" title="Set Machine Learning Connector" class="my-modal">
                  <b-container fluid>
                    <b-row>
                      <b-col>
                        Image Classification x86_64
                        <p><small>Image classification inference service (x86_64).</small></p>
                      </b-col>
                    </b-row>
                    <form @submit.stop.prevent="handleImageClassArmv8ConnectorSubmit">
                      <b-row>
                        <b-col sm="4">
                          Connector ID
                        </b-col>
                        <b-col sm="8">
                          <b-form-input v-model="ggMLConnector.Parameters.Id" type="text" placeholder="Connector ID"></b-form-input>
                        </b-col>
                      </b-row>
                      <b-row class="mt-1">
                        <b-col sm="4">
                          Machine-learning Resource
                        </b-col>
                        <b-col sm="8">
                          <b-form-select v-model="ggMLConnector.Parameters.MLModelResourceId" class="mb-3">
                              <option :value="null">Please select a ML resource</option>
                              <option v-for="(resource, index) in edgeResources" :key="index" :value="resource.Name">{{resource.Name}}</option>
                          </b-form-select>
                        </b-col>
                      </b-row>
                      <b-row class="mt-1">
                        <b-col sm="4">
                          Model destination path
                        </b-col>
                        <b-col sm="8">
                          <b-form-input v-model="ggMLConnector.Parameters.MLModelDestinationPath" type="text" placeholder="e.g. /dest/model"></b-form-input>
                        </b-col>
                      </b-row>
                      <b-row class="mt-1">
                        <b-col sm="4">
                          Local inference service name
                        </b-col>
                        <b-col sm="8">  
                          <b-form-input v-model="ggMLConnector.Parameters.LocalInferenceServiceName" type="text" placeholder="local inference service"></b-form-input>
                        </b-col>
                      </b-row>
                     </form>
                  </b-container>
                </b-modal> 
                <b-row align-v="center">
                  <b-col align="start">
                      <h5>Connectors running on this edge device</h5>
                  </b-col>
                  <b-col align="end">
                    <b-button v-b-modal.addConnectorModal v-b-popover.hover.bottom="'Add new connector to run on this edge'" variant="info" @click="addNewConnector()">Add New</b-button>
                  </b-col>
                </b-row> 
                <b-row align-v="center" style="border-bottom: 1px solid grey">
                  <b-col align="start">
                  </b-col>
                </b-row>
                <b-row v-if="edgeConnectors.length === 0">
                  <b-col class="text-center mt-5" >
                    No connector running on this edge .
                  </b-col>
                </b-row>
                <b-row class="mt-1" v-else>
                  <div class="at-scroll">
                    <b-card-group columns>
                      <b-card v-for="(connector, index) in edgeConnectors" :key="index"
                          class="mb-2 at-card">
                          <b-row >
                            <b-col class="color-box" v-bind:style="{'background-color': connectorCboxColor(connector), 'height': '20px'}">
                            </b-col>
                          </b-row>
                          <b-row class="mt-2" align-v="center">
                            <b-col>
                              <p class="card-text">
                                {{connector.Id}}
                              </p>
                            </b-col>
                            <b-col align="end">   
                              <b-dropdown variant="secondary" class="mx-0" right >
                                <!-- VUE reference: https://vuejs.org/v2/guide/events.html -->
                                <b-dropdown-item @click.stop="deleteConnectorFromEdge(index)" >Unselect</b-dropdown-item>
                                <b-dropdown-item @click = "editConnectorDetail(connector)" >Edit</b-dropdown-item>
                              </b-dropdown>
                            </b-col>
                          </b-row>
                          <b-row class="mt-2">
                            <b-col>
                              {{connectorDescription(connector)}}
                            </b-col>
                          </b-row>
                      </b-card>
                    </b-card-group>
                  </div>
                </b-row>
              </b-tab>
              <b-tab title="Configuration">
                <b-row>
                  <spinner v-if="isDownloading === true" size="medium" />
                  <b-col>
                    <p>
                    An Edge device is more than a Thing device. It is able to run microservices locally.
                    </p><p>
                    By default, regular Thing devices only exchange messages with AIoThings services. On the other hand, AIoThings manage, deploy and run microservices on Edge devices. 
                    </p><p>
                    In fact, an Edge device is an <a v-b-tooltip.hover="'Developers who use AWS IoT Greengrass can author AWS Lambda functions in the cloud and deploy them to core devices for local execution.'">AWS IoT Greengrass Core device.</a>
                    </p><p>
                    The steps to setup a Greengrass Core device are:
                    </p><p>
                      <ol>
                        <li>Download <a target="_blank" href="https://github.com/awsdocs/aws-greengrass-developer-guide/blob/master/doc_source/what-is-gg.md#gg-downloads">AWS IoT Greengrass Core software</a> that runs on this core device.</li>
                        <li>
                          <b-button style="display: inline;" id="downloadEdgeSetupButton" variant="info" @click="downloadEdgeCoreSetup()">Download</b-button>
                          <a v-b-tooltip.hover="'that enable secure communications between AWS IoT'">security certificates</a> and <a v-b-tooltip.hover="'that contains configuration information specific to your AWS IoT Greengrass core and the AWS IoT endpoint.'">the config.json file of this device as a zipped setup file.</a>
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
                    </p>
                    <p>
                      Check <a href="https://docs.aws.amazon.com/greengrass/latest/developerguide/gg-device-start.html">AWS page</a> for further information about the setup procedure.
                    </p>
                  </b-col>
                </b-row>
                </b-tab>
              </b-tabs>
            </b-col>
        </b-row>
       </b-tab>
      </b-tabs>
      <b-row>
        <pre>  </pre>
      </b-row>
    </div>
  </b-container>
 </template>

<script>

import { API, Storage } from 'aws-amplify'
import atHelper from '../aiot-helper'
import config from '../config'

export default {
  name: 'device',
  props: ['thingIndex'], // VUE reference https://router.vuejs.org/guide/essentials/passing-props.html
  data: function () {
    return {
      thing: null,
      isChangedNotSaved: false,
      isDownloading: false,
      isEdgeUpdating: false,
      isDeploying: false,
      thingDesc: null,
      thingName: null,
      isShowEdit: false,
      testList: {},
      cboxColor: 'blue',
      initialGgLocalDeviceResource: {
          Id: null, // 'STRING_VALUE'
          Name: null, // 'STRING_VALUE'
          ResourceDataContainer: {
            LocalDeviceResourceData: {
              GroupOwnerSetting: {
                AutoAddGroupOwner: false, // if set to true then, GroupOwner must be assigned
                GroupOwner: null
              },
              SourcePath: null // 'STRING_VALUE'
            }
          }
      },
      initialGgLocalVolumeResource: {
          Id: null, // 'STRING_VALUE'
          Name: null, // 'STRING_VALUE'
          ResourceDataContainer: {
            LocalVolumeResourceData: {
              DestinationPath: null, // 'STRING_VALUE',
              GroupOwnerSetting: {
                AutoAddGroupOwner: false, // if set to true then, GroupOwner must be assigned
                GroupOwner: null
              },
              SourcePath: null // 'STRING_VALUE'
            }
          }
      },
      initialGgS3MachineLearningResource: {
          Id: null, // 'STRING_VALUE'
          Name: null, // 'STRING_VALUE'
          ResourceDataContainer: {
            S3MachineLearningModelResourceData: {
              DestinationPath: null, // 'STRING_VALUE',
              S3Uri: null // 'STRING_VALUE'
            }
          }
      },
      initialGgLSageMakerMachineLearningResource: {
          Id: null, // 'STRING_VALUE'
          Name: null, // 'STRING_VALUE'
          ResourceDataContainer: {
            SageMakerMachineLearningModelResourceData: {
              DestinationPath: null, // 'STRING_VALUE',
              SageMakerJobArn: null // 'STRING_VALUE'
            }
          }
      },
      initialGgSecretResource: {
          Id: null, // 'STRING_VALUE'
          Name: null, // 'STRING_VALUE'
          ResourceDataContainer: {
            SecretsManagerSecretResourceData: {
              ARN: 'STRING_VALUE',
              AdditionalStagingLabelsToDownload: [
                // 'STRING_VALUE',
                /* more items */
              ]
            }
          }
      },
      initialGgMLConnector: {
          ConnectorArn: null, // 'STRING_VALUE'
          Id: null, // 'STRING_VALUE'
          Parameters: {
            MLModelDestinationPath: null, // "/path-to-model",
            MLModelResourceId: null, // "my-ml-resource",
            // MLModelSageMakerJobArn: "arn:aws:sagemaker:uswest-2:123456789012:training-job:MyImageClassifier",
            LocalInferenceServiceName: null, // "imageClassification",
            LocalInferenceServiceTimeoutSeconds: '10',
            LocalInferenceServiceMemoryLimitKB: '500000',
            GPUAcceleration: 'CPU'
          }
      },
      initialGgModbusConnector: {
          ConnectorArn: null, // 'STRING_VALUE'
          Id: null, // 'STRING_VALUE'
          Parameters: {
            'ModbusSerialDevice-ResourceId': null, // "MyLocalModbusSerialPort",
            ModbusSerialDevice: null // "/path-to-port"
          }
      },
      initialGgRaspPiGpioConnector: {
          ConnectorArn: null, // 'STRING_VALUE'
          Id: null, // 'STRING_VALUE'
          Parameters: {
            'GpioMem-ResourceId': null, // "my-gpio-resource",
            'InputGpios': '5,6U,7D',
            'InputPollPeriod': 50,
            'OutputGpios': '8H,9,27L'
          }
      },
      initialGgFunction: {
            FunctionArn: null,
            FunctionConfiguration: {
              EncodingType: 'json',
              Environment: {
                AccessSysfs: true, // only if GreengrassContainer // true only when set GreengrassContainer,
                Execution: {
                  IsolationMode: 'GreengrassContainer' // GreengrassContainer | NoContainer
                  /*
                  ,
                  RunAs: {
                    Gid: 0,
                    Uid: 0
                  }
                  */
                },
                ResourceAccessPolicies: [
                  /*
                  {
                    Permission: 'rw',
                    ResourceId: 'STRING_VALUE'
                  }
                  more items
                  */
                ],
                Variables: {
                  /* '<__string>': 'STRING_VALUE',
                  '<__string>': ... */
                  'AIOT_RUN_FROM_EDGE': 'true',
                  EDGE_THING_ID: ' '
                }
              },
              // ExecArgs: 'STRING_VALUE',
              // Executable: 'STRING_VALUE',

              MemorySize: 64000, // only available when GreengrassContainer is set. 16M works, in KB // 16K was not enough.
              Pinned: true, // Pinned means the function is long-lived and starts when the core starts.
              Timeout: 20 // in seconds
            },
            Id: null // 'STRING_VALUE'
      },
      ggMLConnector: {},
      ggModbusConnector: {},
      ggRaspPiGpioConnector: {},
      ggLocalVolumeResource: {},
      ggLocalDeviceResource: {},
      ggS3BucketName: 'aiot-greengrass-bucket',
      ggMLResource: {},
      ggFunction: {},
      ggFunctionResourceId: null,
      services: [],
      favoriteServices: [],
      connectors: [
        {ConnectorName: 'Image Classification ARMv7', ARN: 'arn:aws:greengrass:' + config.awsRegion + '::/connectors/ImageClassificationARMv7/versions/1', cardColor: 'DeepSkyBlue'},
        {ConnectorName: 'Image Classification Aarch64 JTX2', ARN: 'arn:aws:greengrass:' + config.awsRegion + '::/connectors/ImageClassificationAarch64JTX2/versions/1', cardColor: 'DodgerBlue'},
        {ConnectorName: 'Image Classification x86_64', ARN: 'arn:aws:greengrass:' + config.awsRegion + '::/connectors/ImageClassificationx86-64/versions/1', cardColor: 'CornflowerBlue'},
        // {ConnectorName: 'Kinesis Firehose', ARN: 'arn:aws:greengrass:' + config.awsRegion + '::/connectors/KinesisFirehose/versions/1', cardColor: 'Khaki'},
        {ConnectorName: 'Modbus-RTU Protocol Adapter', ARN: 'arn:aws:greengrass:' + config.awsRegion + '::/connectors/ModbusRTUProtocolAdapter/versions/1', cardColor: 'DarkCyan'},
        // {ConnectorName: 'Twilio Notifications', ARN: 'arn:aws:greengrass:' + config.awsRegion + '::/connectors/TwilioNotifications/versions/1', cardColor: 'Gold'},
        {ConnectorName: 'Raspberry Pi GPIO', ARN: 'arn:aws:greengrass:' + config.awsRegion + '::/connectors/RaspberryPiGPIO/versions/1', cardColor: 'MediumOrchid'}
      ],
      resources: [
        // https://www.quackit.com/css/css_color_codes.cfm
        {ResourceType: 'Local Volume', cardColor: 'MediumSeaGreen'},
        {ResourceType: 'Local Device', cardColor: 'LightSkyBlue'},
        {ResourceType: 'Machine Learning', cardColor: 'SandyBrown'}
        ],
      mlResourceModelFile: null,
      localInferenceServiceName: null,
      mlModelDestPath: null,
      initialFunctionDefinition: {
        // No Arn field, means newly created definition
        CreationTimestamp: '0',
        Definition: {
          DefaultConfig: {
            /*
            Execution: {
              IsolationMode: 'NoContainer', // 'GreengrassContainer'
              RunAs: {
                    Gid: '0',
                    Uid: '0'
              }
            }
            */
          },
          Functions: []
        }
      },
      initialResourceDefinition: {
        // No Arn field, means newly created definition
        CreationTimestamp: '0',
        Definition: {
          Resources: []
        }
      },
      initialConnectorDefinition: {
        // No Arn field, means newly created definition
        CreationTimestamp: '0',
        Definition: {
          Connectors: []
        }
      },
      initialSubscriotionDefinition: {
        // No Arn field, means newly created definition
        CreationTimestamp: '0',
        Subscriptions: [
          {
            Id: 'CloudToEdge',
            Source: 'cloud',
            Subject: '#',
            Target: 'GGShadowService'
          },
          {
            Id: 'EdgeToCloud',
            Source: 'GGShadowService',
            Subject: '#',
            Target: 'cloud'
          },
          {
            Id: 'EdgeToEdge',
            Source: 'GGShadowService',
            Subject: '#',
            Target: 'GGShadowService'
          }
        ]
      },
      initialEdgeDefinition: {
        // Core Definition will be created by backend
        // Group Definition will be created by backend
        subscriptionDefinition: {
          // No Arn field, means newly created definition
          CreationTimestamp: '0',
          // No SubscriptionDefinitionId field for new definition
          Definition: {
            Subscriptions: [
              {
                Id: 'CloudToEdge',
                Source: 'cloud',
                Subject: '#',
                Target: 'GGShadowService'
              },
              {
                Id: 'EdgeToCloud',
                Source: 'GGShadowService',
                Subject: '#',
                Target: 'cloud'
              },
              {
                Id: 'EdgeToEdge',
                Source: 'GGShadowService',
                Subject: '#',
                Target: 'GGShadowService'
              }
            ]
          }
        }
      }
    }
  },
  computed: {
    edgeFunctions () {
      if (this.thing.EdgeDefinition !== undefined && this.thing.EdgeDefinition.functionDefinition !== undefined) {
        return this.thing.EdgeDefinition.functionDefinition.Definition.Functions
      } else {
        return []
      }
    },
    edgeConnectors () {
      if (this.thing.EdgeDefinition !== undefined && this.thing.EdgeDefinition.connectorDefinition !== undefined) {
        return this.thing.EdgeDefinition.connectorDefinition.Definition.Connectors
      } else {
        return []
      }
    },
    edgeResources () {
      if (this.thing.hasOwnProperty('EdgeDefinition') && this.thing.EdgeDefinition.resourceDefinition !== undefined) {
        return this.thing.EdgeDefinition.resourceDefinition.Definition.Resources
      } else {
        return []
      }
    },
    unselectedEdgeFunctionResources () {
      let unselectedList = []
      for (let edgeResource of this.edgeResources) {
        let isFound = false
        if (this.ggFunction.FunctionConfiguration.Environment.ResourceAccessPolicies !== undefined) {
          for (let resourceAccessPolicy of this.ggFunction.FunctionConfiguration.Environment.ResourceAccessPolicies) {
            if (resourceAccessPolicy.ResourceId === edgeResource.Id) {
              isFound = true
            }
          }
        }
        if (isFound === false) {
          unselectedList.push(edgeResource)
        }
      }
      return unselectedList
    },
    unselectedConnectors () {
      let unselectedList = []
      for (let connector of this.connectors) {
        if (this.edgeConnectors.includes(connector) === false) {
          unselectedList.push(connector)
        }
      }
      return unselectedList
    },
    unselectedMicroservices () {
      let unselectedList = []
      for (let microservice of this.services) {
        let isFound = false
        for (let edgeFunction of this.edgeFunctions) {
          if (this.edgeFunctionArnToName(edgeFunction) === microservice.ServiceName) {
            isFound = true
            break
          }
        }
        if (isFound === false) {
          unselectedList.push(microservice)
        }
      }
      return unselectedList
    },
    ggMLResourceModelFileName () {
      let uri = this.ggMLResource.ResourceDataContainer.S3MachineLearningModelResourceData.S3Uri
      if (uri) {
        let fileName = uri.split(config.awsGreengrassBucket + '/public/' + this.thing.UserId + '_')[1]
        return fileName
      } else {
        return null
      }
    },
    isEdgeAbleToDelete () {
      if (this.thing.hasOwnProperty('EdgeData')) {
        let edgeData = this.thing.EdgeData
        if (edgeData.ggFunction === undefined && edgeData.ggResource === undefined) {
          return true
        }
      }
      return false
    },
    isEdgeAbleToDeploy () {
      if (this.thing.hasOwnProperty('EdgeData') && this.isEdgeAbleToDelete === false) {
        return true
      }
      return false
    }
  },
  async created () {
    let index = this.thingIndex
    this.thing = this.$store.getters.things[index]
    this.thingDesc = this.thing.ThingDesc
    this.thingName = this.thing.ThingName
    this.ggMLConnector = this.initialGgMLConnector
    this.ggModbusConnector = this.initialGgModbusConnector
    this.ggRaspPiGpioConnector = this.initialGgRaspPiGpioConnector
    this.ggFunction = this.initialGgFunction
    this.ggLocalDeviceResource = this.initialGgLocalDeviceResource
    this.ggLocalVolumeResource = this.initialGgLocalVolumeResource
    this.ggMLResource = this.initialGgS3MachineLearningResource
    console.log('thing: ', this.thing)
    if (this.thing.hasOwnProperty('EdgeData')) {
      // this.thing.EdgeData
      try {
        let definitionData = await API.get('thingApi', '/edge/definition', {
          'queryStringParameters': {
            'edgeData': JSON.stringify(this.thing.EdgeData)
          }
        })
        // console.log('definitionData: ', definitionData)
        // console.log('result: ', definitionData.edgeDefinition)
        if (definitionData.edgeDefinition === null) {
          // this.$delete(this.thing, 'EdgeData')
          this.$delete(this.thing, 'EdgeDefinition')
        } else {
          this.$set(this.thing, 'EdgeDefinition', definitionData.edgeDefinition)
        }
      } catch (err) {
        console.log('def error: ', err)
      }
    }
    console.log('edit thing: ', this.thing)
  },
  beforeDestroy () {
  },
  async mounted () {
    this.services = this.$store.getters.mservices
    if (this.services === null) {
      await atHelper.reloadServices()
      this.services = this.$store.getters.mservices
    }
    this.favoriteServices = this.$store.getters.favoriteMservices
    if (this.favoriteServices === null) {
      await atHelper.reloadFavoriteServices()
      this.favoriteServices = this.$store.getters.favoriteMservices
    }
  },
  watch: {
    /* right way to force rendering (refresh)
      1. watch the data variable
      2. use this.$set or this.$delete to give chance to VUE to watch
      3. put $forceUpdate()
    */
    thing: {
        handler: function () {
          this.$forceUpdate()
        },
        deep: true
    },
    cboxColor (val) {
      this.$el.style.setProperty('--color', val)
    },
    ggFunctionResourceId: function (newValue, oldValue) {
      if (newValue !== undefined && newValue !== null && newValue !== oldValue) {
        let newResourcePolicy = {
            Permission: 'ro',
            ResourceId: newValue
        }
        this.ggFunction.FunctionConfiguration.Environment.ResourceAccessPolicies.push(newResourcePolicy)
        this.ggFunctionResourceId = null
      }
      this.$forceUpdate()
    },
    mlResourceModelFile: function (newFile, oldFile) {
      if (newFile !== undefined && newFile !== null && newFile !== oldFile) {
        // console.log('file: ', newValue)
        this.uploadModelFile(newFile)
      }
    },
    thingDesc: function (newDesc, oldDesc) {
      console.log('thingDesc changed: ', oldDesc)
      if (newDesc !== oldDesc && this.isChangedNotSaved !== null && oldDesc !== null) {
        console.log('thingDesc changed now')
        this.isChangedNotSaved = true
      }
    },
    thingName: function (newName, oldName) {
      console.log('thingName changed: ', oldName)
      if (newName !== oldName && this.isChangedNotSaved !== null && oldName !== null) {
        console.log('thingName changed now')
        this.isChangedNotSaved = true
      }
    }
   },
  methods: {
    mlResourceModelFileName (edgeResource) {
      let uri = edgeResource.ResourceDataContainer.S3MachineLearningModelResourceData.S3Uri
      if (uri !== null) {
        let fileNameFilter = uri.split(config.awsGreengrassBucket + '-prod/public/' + this.thing.UserId + '_')
        // console.log('file names: ', fileNameFilter)
        let fileName = fileNameFilter[1] // uri.split(config.awsGreengrassBucket + '/public/' + this.thing.UserId + '_')[1]
        return fileName
      } else {
        return ''
      }
    },
    mlResourceModelDestPath (edgeResource) {
      let destPath = edgeResource.ResourceDataContainer.S3MachineLearningModelResourceData.DestinationPath
      if (destPath !== null) {
        return destPath
      } else {
        return ''
      }
    },
    connectorDescription (edgeConnector) {
      for (let connector of this.connectors) {
        if (edgeConnector.ConnectorArn === connector.ARN) {
          return connector.ConnectorName
        }
      }
      return 'unknown connector'
    },
    edgeFunctionToService (edgeFunction) {
      // console.log('edgeFunction: ', edgeFunction)
      let serviceName = this.edgeFunctionArnToName(edgeFunction)
      for (let service of this.services) {
        if (service.ServiceName === serviceName) {
          return service
        }
      }
      return null
    },
    edgeFunctionArnToName (edgeFunction) {
      if (edgeFunction !== null) {
        let nameAliasPair = edgeFunction.FunctionArn.split(':function:')[1]
        let name = nameAliasPair.split(':')[0]
        return name
      }
      return 'unknown'
    },
    connectorCboxColor (edgeConnector) {
      for (let connector of this.connectors) {
        if (connector.ARN === edgeConnector.ConnectorArn) {
          // this.cboxColor = resource.cardColor
          return connector.cardColor
        }
      }
      // this.cboxColor = 'LightGrey'
      return 'LightGrey'
    },
    resourceCboxColor (edgeResource) {
      let type = this.resourceType(edgeResource)
      for (let resource of this.resources) {
        if (resource.ResourceType === type) {
          // this.cboxColor = resource.cardColor
          return resource.cardColor
        }
      }
      // this.cboxColor = 'LightGrey'
      return 'LightGrey'
    },
    changeCboxColor (color) {
      this.cboxColor = color
    },
    copyJson (dataJson) {
      return JSON.parse(JSON.stringify(dataJson))
    },
    deleteEdgeFunctionResource (index) {
      this.ggFunction.FunctionConfiguration.Environment.ResourceAccessPolicies.splice(index, 1)
    },
    switchResourcePolicyPermission (index) {
      if (this.ggFunction.FunctionConfiguration.Environment.ResourceAccessPolicies[index].Permission === 'rw') {
        this.ggFunction.FunctionConfiguration.Environment.ResourceAccessPolicies[index].Permission = 'ro'
      } else {
        this.ggFunction.FunctionConfiguration.Environment.ResourceAccessPolicies[index].Permission = 'rw'
      }
      // this.$forceUpdate()
    },
    editResourceDetail (edgeResourceOrigin) {
      let edgeResource = this.copyJson(edgeResourceOrigin)
      this.mlResourceModelFile = null
      if (edgeResource.ResourceDataContainer.hasOwnProperty('LocalDeviceResourceData')) {
        console.log('show edit resource:', edgeResource)
        this.ggLocalDeviceResource = edgeResource
        this.$refs.setLocalDeviceResourceModalRef.show()
      } else if (edgeResource.ResourceDataContainer.hasOwnProperty('LocalVolumeResourceData')) {
        this.ggLocalVolumeResource = edgeResource
        this.$refs.setLocalVolumeResourceModalRef.show()
      } else if (edgeResource.ResourceDataContainer.hasOwnProperty('S3MachineLearningModelResourceData')) {
        this.ggMLResource = edgeResource
         this.$refs.setMLResourceModalRef.show()
      }
    },
    resourceType (edgeResource) {
      this.mlResourceModelFile = null
      if (edgeResource.ResourceDataContainer.hasOwnProperty('LocalDeviceResourceData')) {
        return 'Local Device'
      } else if (edgeResource.ResourceDataContainer.hasOwnProperty('LocalVolumeResourceData')) {
        return 'Local Volume'
      } else if (edgeResource.ResourceDataContainer.hasOwnProperty('S3MachineLearningModelResourceData')) {
        return 'Machine Learning'
      }
    },
    editFunctionDetail (edgeFunction) {
      this.ggFunction = this.copyJson(edgeFunction)
      this.ggFunctionResourceId = null
      this.$refs.setEdgeMicroserviceModalRef.show()
    },
    editConnectorDetail (edgeConnectorOrigin) {
      let edgeConnector = this.copyJson(edgeConnectorOrigin)
      let description = this.connectorDescription(edgeConnector)
      switch (description) {
        case 'Image Classification ARMv7':
          this.ggMLConnector = edgeConnector
          this.$refs.setImageClassArmv7ConnectorModalRef.show()
          break
        case 'Image Classification Aarch64 JTX2':
          this.ggMLConnector = edgeConnector
          this.$refs.setImageClassArmv8ConnectorModalRef.show()
          break
        case 'Image Classification x86_64':
          this.ggMLConnector = edgeConnector
          this.$refs.setImageClassX86ConnectorModalRef.show()
          break
        case 'Kinesis Firehose':
          this.$refs.setKinesisFirehoseConnectorModalRef.show()
          break
        case 'Modbus-RTU Protocol Adapter':
          this.ggModbusConnector = edgeConnector
          this.$refs.setModbusConnectorModalRef.show()
          break
        case 'Raspberry Pi GPIO':
          this.ggRaspPiGpioConnector = edgeConnector
          this.$refs.setRaspPiGpioConnectorModalRef.show()
          break
        case 'Twilio Notifications':
          this.$refs.setTwilioConnectorModalRef.show()
          break
        default:
          break
      }
    },
    deleteConnectorFromEdge (index) {
      this.edgeConnectors.splice(index, 1)
      this.thing.EdgeDefinition.connectorDefinition.CreationTimestamp = '0'
      this.uploadEdge()
    },
    deleteResourceFromEdge (index) {
      this.edgeResources.splice(index, 1)
      this.thing.EdgeDefinition.resourceDefinition.CreationTimestamp = '0'
      this.uploadEdge()
    },
    deleteFunctionFromEdge (index) {
      let functionToDelete = this.edgeFunctions[index]
      // let functionName = this.edgeFunctionArnToName(functionToDelete)
      let subList = this.thing.EdgeDefinition.subscriptionDefinition.Definition.Subscriptions.filter(subscription => {
        return (subscription.Source !== functionToDelete.FunctionArn && subscription.Target !== functionToDelete.FunctionArn)
      })
      this.thing.EdgeDefinition.subscriptionDefinition.Definition.Subscriptions = subList
      this.edgeFunctions.splice(index, 1)
      this.thing.EdgeDefinition.functionDefinition.CreationTimestamp = '0'
      this.thing.EdgeDefinition.subscriptionDefinition.CreationTimestamp = '0'
      this.uploadEdge()
    },
    async deleteEdge () {
      try {
        await API.del('thingApi', '/edge', {
            'queryStringParameters': {
              userId: this.thing.UserId,
              certId: this.thing.CertId,
              thingId: this.thing.ThingId,
              edgeData: JSON.stringify(this.thing.EdgeData)
            }
        })
        this.$delete(this.thing, 'EdgeDefinition')
        this.$delete(this.thing, 'EdgeData')
        // TODO update thing
        let storedThings = this.$store.getters.things
        storedThings[this.thingIndex] = this.thing
        this.$store.commit('setThings', storedThings)
      } catch (err) {
        console.log(err)
      }
      this.$forceUpdate()
    },
    confirmAddEdgeService (service) {
      console.log('service: ', service)
      this.ggFunction = JSON.parse(JSON.stringify(this.initialGgFunction))
      this.ggFunction.FunctionArn = service.ServiceArn
      this.ggFunction.Id = service.ServiceName
      this.ggFunction.FunctionConfiguration.Environment.Variables.EDGE_THING_ID = this.thing.ThingId
      this.$refs.addEdgeServiceModalRef.hide()
      this.$refs.setEdgeMicroserviceModalRef.show()
      // this.$forceUpdate()
    },
    prepareEdgeDefinition () {
      if (this.thing.hasOwnProperty('EdgeDefinition') === false) {
        this.thing.EdgeDefinition = JSON.parse(JSON.stringify(this.initialEdgeDefinition))
        // done by backend
        // this.thing.EdgeDefinition.coreDefinition.Cores[0].CertificateArn = this.thing.CertificateArn
        // this.thing.EdgeDefinition.coreDefinition.Cores[0].ThingArn = this.thing.ThingArn
      }
    },
    confirmSetEdgeMicroservice (newFunction) {
      this.prepareEdgeDefinition()
      if (this.thing.EdgeDefinition.hasOwnProperty('functionDefinition') === false) {
        this.thing.EdgeDefinition.functionDefinition = this.copyJson(this.initialFunctionDefinition)
      }
      let newList = this.thing.EdgeDefinition.functionDefinition.Definition.Functions.filter(func => {
        return func.FunctionArn !== newFunction.FunctionArn
      })
      this.thing.EdgeDefinition.functionDefinition.Definition.Functions = newList
      this.thing.EdgeDefinition.functionDefinition.Definition.Functions.push(newFunction)
      this.thing.EdgeDefinition.functionDefinition.CreationTimestamp = '0'
      let functionName = this.edgeFunctionArnToName(newFunction)
      this.thing.EdgeDefinition.subscriptionDefinition.Definition.Subscriptions = this.thing.EdgeDefinition.subscriptionDefinition.Definition.Subscriptions.filter(subscription => {
        return subscription.Id.includes(functionName) === false
      })
      this.thing.EdgeDefinition.subscriptionDefinition.Definition.Subscriptions.push({
          Id: 'subFrom_' + functionName,
          Source: newFunction.FunctionArn,
          Subject: '#',
          Target: 'cloud'
      })
      this.thing.EdgeDefinition.subscriptionDefinition.Definition.Subscriptions.push({
          Id: 'subTo_' + functionName,
          Source: 'cloud',
          Subject: '#',
          Target: newFunction.FunctionArn
      })
      this.thing.EdgeDefinition.subscriptionDefinition.CreationTimestamp = '0'
      this.uploadEdge()
    },
    async uploadEdge () {
        let body = {}
        body.userId = this.thing.UserId
        body.certId = this.thing.CertId
        body.thingId = this.thing.ThingId
        body.thingNameTag = this.thing.ThingName
        body.edgeDefinition = this.thing.EdgeDefinition
        console.log('body: ', body)
        if (this.thing.hasOwnProperty('EdgeData')) {
          body.edgeData = this.thing.EdgeData
        }
        this.isEdgeUpdating = true
        const result = await API.post('thingApi', '/edge', { body })
        console.log('uploadEdge result: ', result)
        if (result.edgeDefinition !== null && result.edgeData !== null) {
          this.$set(this.thing, 'EdgeDefinition', result.edgeDefinition)
          this.$set(this.thing, 'EdgeData', result.edgeData)
          // update to current cached things array
          let storedThings = this.$store.getters.things
          storedThings[this.thingIndex] = this.thing
          this.$store.commit('setThings', storedThings)
        }
        this.isEdgeUpdating = false
        this.$forceUpdate()
    },
    async deployEdge () {
      if (this.thing.hasOwnProperty('EdgeData')) {
        let body = {}
        body.edgeData = this.thing.EdgeData
        try {
          const deployResult = await API.post('thingApi', '/edge/deploy', { body })
          console.log('deploy result: ', deployResult)
          if (deployResult.DeploymentStatus === 'Failure') {
            this.$refs.deployErrorModalRef.show()
          } else if (deployResult.DeploymentStatus === 'Success') {
            console.log('Deployment succeeded')
          } else {
            /*
            let that = this
            let edgeData = JSON.stringify(that.thing.EdgeData)
            let timer = setInterval(async function () {
                this.isDeploying = true
                try {
                  const statusResult = await API.get('thingApi', '/edge/deploy/status', {
                    'queryStringParameters': {
                        deployId: deployResult.DeploymentId,
                        edgeData: edgeData
                    }
                  })
                  let deployStatus = statusResult.deployStatus
                  console.log('deploy status: ', deployStatus)
                  console.log('deploy status value: ', deployStatus.DeploymentStatus)
                  switch (deployStatus.DeploymentStatus) {
                    case 'Pending':
                    case 'InProgress':
                      break
                    case 'Success':
                      this.isDeploying = false
                      clearInterval(timer)
                      break
                    case 'Failure':
                      this.isDeploying = false
                      that.$refs.deployErrorModalRef.show()
                      clearInterval(timer)
                      break
                    default:
                      this.isDeploying = false
                      that.$refs.deployErrorModalRef.show()
                      clearInterval(timer)
                      break
                  }
                } catch (err) {
                  console.log(err)
                  this.isDeploying = false
                  that.$refs.deployErrorModalRef.show()
                  clearInterval(timer)
                }
            }, 3000) // in ms, run every 3 seconds
            */
          } // if after successful deployment
        } catch (err) {
          this.$refs.deployErrorModalRef.show()
          console.log(err)
        }
      } // end if
    },
    uploadModelFile (file) {
      let reader = new window.FileReader() // if window is not used it says File READER is not defined
      let userId = this.thing.UserId
      let that = this
      that.ggMLResource.ResourceDataContainer.S3MachineLearningModelResourceData.S3Uri = 's3://' + config.awsGreengrassBucket + '-prod/public/' + userId + '_' + file.name
      reader.onload = function (event) {
         // dispatch fileAttached to state UI postEditor with event.target.result as read dataURL
        let content = event.target.result
        let fileName = userId + '_' + file.name
        console.log('fileName: ', fileName)
        // still save to project bucket Storage.configure({level: 'public', bucket: this.ggS3BucketName})
        Storage.put(fileName, content, {
            contentType: 'application/zip'
        })
        .then(result => {
          console.log(result)
           // s3://bucket/key
        })
        .catch(err => console.log(err))
      }
      reader.readAsArrayBuffer(file)
    },
    confirmAddConnector (connector) {
      console.log('connector:', connector.ConnectorName)
      this.ggMLConnector.ConnectorArn = connector.ARN
      switch (connector.ConnectorName) {
        case 'Image Classification ARMv7':
          this.ggMLConnector = JSON.parse(JSON.stringify(this.initialGgMLConnector))
          this.$refs.setImageClassArmv7ConnectorModalRef.show()
          break
        case 'Image Classification Aarch64 JTX2':
          this.ggMLConnector = JSON.parse(JSON.stringify(this.initialGgMLConnector))
          this.$refs.setImageClassArmv8ConnectorModalRef.show()
          break
        case 'Image Classification x86_64':
          this.ggMLConnector = JSON.parse(JSON.stringify(this.initialGgMLConnector))
          this.$refs.setImageClassX86ConnectorModalRef.show()
          break
        case 'Kinesis Firehose':
          this.$refs.setKinesisFirehoseConnectorModalRef.show()
          break
        case 'Modbus-RTU Protocol Adapter':
          this.ggModbusConnector = JSON.parse(JSON.stringify(this.initialGgModbusConnector))
          this.$refs.setModbusConnectorModalRef.show()
          break
        case 'Raspberry Pi GPIO':
          this.ggRaspPiGpioConnector = JSON.parse(JSON.stringify(this.initialGgRaspPiGpioConnector))
          this.$refs.setRaspPiGpioConnectorModalRef.show()
          break
        case 'Twilio Notifications':
          this.$refs.setTwilioConnectorModalRef.show()
          break
        default:
          break
      }
      this.$refs.addConnectorModalRef.hide()
    },
    confirmAddResource (resource) {
      this.mlResourceModelFile = null
      this.$refs.addResourceModalRef.hide()
      if (resource.ResourceType === 'Local Volume') {
        this.ggLocalVolumeResource = JSON.parse(JSON.stringify(this.initialGgLocalVolumeResource))
        this.$refs.setLocalVolumeResourceModalRef.show()
      } else if (resource.ResourceType === 'Local Device') {
        this.ggLocalDeviceResource = JSON.parse(JSON.stringify(this.initialGgLocalDeviceResource))
        this.$refs.setLocalDeviceResourceModalRef.show()
      } else if (resource.ResourceType === 'Machine Learning') {
        this.ggMLResource = JSON.parse(JSON.stringify(this.initialGgS3MachineLearningResource))
        this.$refs.setMLResourceModalRef.show()
      }
    },
    confirmSetLocalVolumeResource (evt) {
      if (this.ggLocalVolumeResource.Name !== null &&
            this.ggLocalVolumeResource.ResourceDataContainer.LocalVolumeResourceData.SourcePath !== null &&
            this.ggLocalVolumeResource.ResourceDataContainer.LocalVolumeResourceData.DestinationPath !== null) {
        this.handleLocalVolumeResourceSubmit()
      } else {
        // Prevent modal from closing
        evt.preventDefault()
      }
    },
    handleLocalVolumeResourceSubmit () {
      // this.$refs.setLocalVolumeResourceModalRef.hide()
      this.ggLocalVolumeResource.Id = this.ggLocalVolumeResource.Name
      // The GroupOwner value is ignored if GroupOwnerSetting#AutoAddGroupOwner is true.
      if (this.ggLocalVolumeResource.ResourceDataContainer.LocalVolumeResourceData.GroupOwnerSetting.GroupOwner !== null) {
        this.ggLocalVolumeResource.ResourceDataContainer.LocalVolumeResourceData.GroupOwnerSetting.AutoAddGroupOwner = false
      } else {
        this.ggLocalVolumeResource.ResourceDataContainer.LocalVolumeResourceData.GroupOwnerSetting.AutoAddGroupOwner = true
        delete this.ggLocalVolumeResource.ResourceDataContainer.LocalVolumeResourceData.GroupOwnerSetting.GroupOwner
      }
      this.handleResource(this.ggLocalVolumeResource)
    },
    confirmSetModbusConnector (evt) {
      if (this.ggModbusConnector.Parameters['ModbusSerialPort-ResourceId'] !== null) {
        this.handleModbusConnectorSubmit()
      } else {
        // Prevent modal from closing
        evt.preventDefault()
      }
    },
    handleModbusConnectorSubmit () {
      this.$refs.setModbusConnectorModalRef.hide()
      let modbusResourceId = this.ggModbusConnector.Parameters['ModbusSerialPort-ResourceId']
      let modbusResource = this.edgeResources.find(function (resource) {
        return resource.Id === modbusResourceId
      })
      this.ggModbusConnector.Parameters['ModbusSerialPort'] = modbusResource.ResourceDataContainer.SourcePath
      this.handleConnector(this.ggModbusConnector)
    },
    confirmSetRaspPiGpioConnector (evt) {
      if (this.ggRaspPiGpioConnector.Parameters['GpioMem-ResourceId'] !== null) {
        if (this.ggRaspPiGpioConnector.Parameters.InputGpios === null) {
          delete this.ggRaspPiGpioConnector.Parameters.InputGpios
        }
        if (this.ggRaspPiGpioConnector.Parameters.InputPollPeriod === null) {
          delete this.ggRaspPiGpioConnector.Parameters.InputPollPeriod
        }
        if (this.ggRaspPiGpioConnector.Parameters.OutputGpios === null) {
          delete this.ggRaspPiGpioConnector.Parameters.OutputGpios
        }
        this.handleRaspPiGpioConnectorSubmit()
      } else {
        // Prevent modal from closing
        evt.preventDefault()
      }
    },
    handleRaspPiGpioConnectorSubmit () {
      this.$refs.setRaspPiGpioConnectorModalRef.hide()
      this.handleConnector(this.ggRaspPiGpioConnector)
    },
    confirmSetImageClassArmv7Connector (evt) {
      if (this.ggMLConnector.Id !== null &&
            this.ggMLConnector.Parameters.MLModelDestinationPath !== null &&
            this.ggMLConnector.Parameters.MLModelResourceId !== null &&
            this.ggMLConnector.Parameters.LocalInferenceServiceName !== null) {
        this.handleImageClassArmv7ConnectorSubmit()
      } else {
        // Prevent modal from closing
        evt.preventDefault()
      }
    },
    handleImageClassArmv7ConnectorSubmit () {
      this.$refs.setImageClassArmv7ConnectorModalRef.hide()
      this.handleConnector(this.ggMLConnector)
    },
    confirmSetImageClassArmv8Connector (evt) {
      if (this.ggMLConnector.Name !== null &&
            this.ggMLConnector.ResourceDataContainer.S3MachineLearningModelResourceData.DestinationPath !== null &&
            this.ggMLConnector.ResourceDataContainer.S3Uri !== null) {
        this.handleImageClassArmv8ConnectorSubmit()
      } else {
        // Prevent modal from closing
        evt.preventDefault()
      }
    },
    handleImageClassArmv8ConnectorSubmit () {
      this.$refs.setImageClassArmv8ConnectorModalRef.hide()
      this.handleConnector(this.ggMLConnector)
    },
    confirmSetImageClassX86Connector (evt) {
      if (this.ggMLConnector.Name !== null &&
            this.ggMLConnector.ResourceDataContainer.S3MachineLearningModelResourceData.DestinationPath !== null &&
            this.ggMLConnector.ResourceDataContainer.S3Uri !== null) {
        this.handleImageClassX86ConnectorSubmit()
      } else {
        // Prevent modal from closing
        evt.preventDefault()
      }
    },
    handleImageClassX86ConnectorSubmit () {
      this.$refs.setImageClassX86ConnectorModalRef.hide()
      this.handleConnector(this.ggMLConnector)
    },
    handleConnector (newConnector) {
      this.prepareEdgeDefinition()
      if (this.thing.EdgeDefinition.hasOwnProperty('connectorDefinition') === false) {
        this.thing.EdgeDefinition.connectorDefinition = this.initialConnectorDefinition
      }
      let newList = this.thing.EdgeDefinition.connectorDefinition.Definition.Connectors.filter(connector => {
        return connector.Id !== newConnector.Id
      })
      this.thing.EdgeDefinition.connectorDefinition.Definition.Connectors = newList
      this.thing.EdgeDefinition.connectorDefinition.Definition.Connectors.push(newConnector)

      this.thing.EdgeDefinition.connectorDefinition.CreationTimestamp = '0'
      this.uploadEdge()
    },
    handleResource (newResource) {
      this.prepareEdgeDefinition()
      if (this.thing.EdgeDefinition.hasOwnProperty('resourceDefinition') === false) {
        this.thing.EdgeDefinition.resourceDefinition = this.initialResourceDefinition
      }
      let newList = this.thing.EdgeDefinition.resourceDefinition.Definition.Resources.filter(resource => {
        return resource.Id !== newResource.Id
      })
      this.thing.EdgeDefinition.resourceDefinition.Definition.Resources = newList
      this.thing.EdgeDefinition.resourceDefinition.Definition.Resources.push(newResource)
      console.log('newResource: ', newResource.ResourceDataContainer.LocalVolumeResourceData.GroupOwnerSetting)
      this.thing.EdgeDefinition.resourceDefinition.CreationTimestamp = '0'
      this.uploadEdge()
    },
    confirmSetLocalDeviceResource (evt) {
      if (this.ggLocalDeviceResource.Name !== null &&
            this.ggLocalDeviceResource.ResourceDataContainer.LocalDeviceResourceData.SourcePath !== null) {
        this.handleDeviceResourceSubmit()
      } else {
        // Prevent modal from closing
        evt.preventDefault()
      }
    },
    handleDeviceResourceSubmit () {
      this.ggLocalDeviceResource.Id = this.ggLocalDeviceResource.Name
      // The GroupOwner value is ignored if GroupOwnerSetting#AutoAddGroupOwner is true.
      if (this.ggLocalDeviceResource.ResourceDataContainer.LocalDeviceResourceData.GroupOwnerSetting.GroupOwner !== null) {
        this.ggLocalDeviceResource.ResourceDataContainer.LocalDeviceResourceData.GroupOwnerSetting.AutoAddGroupOwner = false
      } else {
        this.gggLocalDeviceResource.ResourceDataContainer.LocalDeviceResourceData.GroupOwnerSetting.AutoAddGroupOwner = true
        delete this.ggLocalDeviceResource.ResourceDataContainer.LocalDeviceResourceData.GroupOwnerSetting.GroupOwner
      }
      this.$refs.setLocalDeviceResourceModalRef.hide()
      this.handleResource(this.ggLocalDeviceResource)
    },
    confirmSetMLResource (evt) {
      console.log('ggMLResource: ', this.ggMLResource)
      if (this.ggMLResourceModelFileName !== null &&
            this.ggMLResource.ResourceDataContainer.S3MachineLearningModelResourceData.DestinationPath != null &&
            this.ggMLResource.Name !== null) {
        this.handleMLResourceSubmit()
      } else {
        // Prevent modal from closing
        evt.preventDefault()
      }
    },
    handleMLResourceSubmit () {
      this.ggMLResource.Id = this.ggMLResource.Name
      this.$refs.setMLResourceModalRef.hide()
      this.handleResource(this.ggMLResource)
    },
    addNewEdgeService () {
    },
    addNewConnector () {
    },
    addNewResource () {
    },
    changeTitle () {
      // console.log('isShowEdit: ', this.isShowEdit)
      if (this.isShowEdit) {
        return 'Edit'
      } else {
        return 'Show'
      }
    },
    async updateThing () {
      // if (this.isChangedNotSaved) {
        this.thing.ThingDesc = this.thingDesc
        this.thing.ThingName = this.thingName
        // console.log('Thing: ', this.thing)
        const userId = this.$store.getters.username
        const certId = this.thing.CertId
        const thingId = this.thing.ThingId
        const name = this.thing.ThingName
        const desc = this.thing.ThingDesc
        const body = { userId, certId, thingId, name, desc }
        const result = await API.post('thingApi', '/things', { body })
        console.log('updateThing: result: ', result)
        this.$store.dispatch('replaceThing', this.thing)
        this.isChangedNotSaved = false
      // }
    },
    async downloadEdgeCoreSetup () {
      this.isDownloading = true
      // let getThingDetails = '/things?userId=' + userId + '?certId=' + this.thing.certId
      const result = await API.get('thingApi', '/things', {
            'queryStringParameters': {
                'userId': this.thing.UserId,
                'certId': this.thing.CertId,
                'thingName': this.thing.ThingName,
                'thingId': this.thing.ThingId
            }
      })
      console.log('result: ', result)
      let resultJson = result
      console.log('result: ', resultJson)
      await atHelper.downloadEdgeCoreSetup(resultJson)
      this.isDownloading = false
    },
    async downloadCert () {
      this.isDownloading = true
      // let getThingDetails = '/things?userId=' + userId + '?certId=' + this.thing.certId
      console.log('thing: ', this.thing)
      const result = await API.get('thingApi', '/things', {
            'queryStringParameters': {
                'userId': this.thing.UserId,
                'certId': this.thing.CertId,
                'thingName': this.thing.ThingName,
                'thingId': this.thing.ThingId
            }
      })
      console.log('result: ', result)
      let resultJson = result
      console.log('result: ', resultJson)
      await atHelper.downloadCertKey(resultJson)
      this.isDownloading = false
    },
    returnDiscardChangesOk (evt) {
      // Prevent modal from closing
      // evt.preventDefault()
      this.$refs.modalReturnConfirmRef.hide()
      this.$router.go(-1)
    },
    returnCancel () {
      this.$refs.modalReturnConfirmRef.hide()
    },
    backHome () {
      console.log('quit: ', this.isChangedNotSaved)
      if (this.isChangedNotSaved === true) {
        this.$refs.modalReturnConfirmRef.show()
      } else {
        this.$router.go(-1)
      }
    }
  }
}
</script>
<style>

.at-code {
    white-space: pre-wrap;
    background: hsl(30,80%,90%);
}

.at-scroll {
  /* height : 500px ; */
  overflow-y: scroll; /* auto */
  max-height: 60%;
}

.my-modal .modal-body {
  max-height: 70vh; /* max 70% of the viewport height */
  overflow-y: auto;
}

.color-box {
    width: 100%;
    height: 10px;
    display: inline-block;
    background-color: var(--color);
    position: absolute;
    right: 0px;
    left: 0px;
    top: 0px;
}
</style>
