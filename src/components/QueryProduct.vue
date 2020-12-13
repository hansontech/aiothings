<template>
  <div> 
   <!-- <App /> -->
   <b-container style="min-height: 800px; margin-top: 85px; padding-bottom: 30px;">
     <b-row>
       <b-col cols="10" align="center">
         <h3 style="display: inline;">About the new IoT product</h3>
         <b-button variant="light" v-b-modal.modalHelp>?</b-button>
       </b-col>
       <b-col cols="2" align="end">
        <b-button variant="secondary" @click="backHome()"><i class="fas fa-arrow-left" /></b-button>
       </b-col>
     </b-row>
    <b-modal id="modalReturnConfirm"
        ref="modalReturnConfirmRef"
        hide-header
        @ok="returnDiscardChangesOk"
        @cancel="returnCancel">
        Discard the inputs and return?
    </b-modal>
     <hr>
     <b-modal id="modalHelp" hide-header ok-only>
       <markdown-it-vue  content="
    We collect the product requirements first, then
    We will reply to you, within two days:
    1. Product proposal with technologies in use. 
    2. Development plan
    3. Proof of Concept event 
    4. Mass production plan 
    5. Cost estimations
       " />
     </b-modal>
     <!-- vertical -->
     <b-tabs pills card v-model="formPage" v-on:activate-tab="tabActivated" :title-link-class="['bg-primary', 'text-capitalize']">
      <b-tab title="Story" :title-link-class="tabLinkClass(0)">
        <b-form @submit="onSubmit" @reset="onReset" >
          <div> <!--  style="max-height: 410px;  overflow-y: scroll; "> -->
          <b-form-group
            id="input-group-market-opportunity"
            label="What is the market opportunity?"
            label-for="input-market-opportunity"
            description=""
          >
            <b-form-textarea
              id="input-market-opportunity"
              v-model="form.MarketOpportunity"
              type="text"
              required
              placeholder="Tell us about the target market"
            ></b-form-textarea>
          </b-form-group>
          <b-form-group
            id="input-group-iot-device"
            label="Please describe the new IoT device"
            label-for="input-iot-device"
            description=""
          >
            <b-form-textarea
              id="input-iot-device"
              v-model="form.IoTDeviceDesc"
              type="text"
              required
              placeholder="Tell us about the IoT device"
            ></b-form-textarea>
          </b-form-group>
          <b-form-group
            id="input-group-online-service"
            label="Please describe the cloud services required"
            label-for="input-online-service"
            description=""
          >
            <b-form-textarea
              id="input-online-service"
              v-model="form.OnlineServiceDesc"
              type="text"
              required
              placeholder="Tell us about the new cloud services"
            ></b-form-textarea>
          </b-form-group>
          <b-form-group
            id="input-group-price-cost"
            label="What is the target price (or cost) and the volume estimated in the first year?"
            label-for="input-price-cost"
            description=""
          >
            <b-form-input
              id="input-price-cost"
              v-model="form.ProductPriceCost"
              type="text"
              required
              placeholder="About the IoT device price or/and cost"
            ></b-form-input>
          </b-form-group>
          <b-form-group
            id="input-group-product-time-cycle"
            label="When will the product be introduced to the market? How long is the life cycle?"
            label-for="input-price-cost"
            description=""
          >
            <b-form-input
              id="input-product-time-cycle"
              v-model="form.ProductTimeCycle"
              type="text"
              required
              placeholder="Target market introduction date and life cycle"
            ></b-form-input>
          </b-form-group>
          </div>
          <hr>
          <b-row align-v="center" class="mt-2 mb-2">
            <b-col align="center">
              <b-button type="submit" v-if="formPage < 3" variant="info" size="lg">Next</b-button>
            </b-col>
          </b-row>
        </b-form>
      </b-tab>
      <b-tab title="IoT Device" :title-link-class="tabLinkClass(1)">
          <b-form @submit="onSubmit" @reset="onReset">
            <div style="max-height: 410px;  overflow-y: scroll; ">
            <b-form-group label="Network and communication features required">
              <b-form-checkbox v-model="form.NetcomIndoor" value="IndoorWifi">Indoor with broadband and WiFi</b-form-checkbox>
              <b-form-checkbox v-model="form.NetcomOutdoor" value="OutdoorMobile">Outdoor with mobile telecom</b-form-checkbox>
              <b-form-checkbox v-model="form.NetcomPAN" value="PAN">Personal Area Network (PAN, such like Zigbee or Bluetooth)</b-form-checkbox>
            </b-form-group>
            <b-form-group label="Power source type">
              <b-form-radio v-model="form.PowerSource" value="BatteryRechargeable">Battery powered, Rechargeable</b-form-radio>
              <b-form-radio v-model="form.PowerSource" value="BatteryReplaceable">Battery powered, Replaceable</b-form-radio>
              <b-form-radio v-model="form.PowerSource" value="AdapterPowered">Adapter powered</b-form-radio>  
            </b-form-group>
            <b-form-group label="Sensors">
              <b-form-checkbox v-model="form.SensorTemperature" value="Temperature">Temperature</b-form-checkbox>
              <b-form-checkbox v-model="form.SensorHumidity" value="Humidity">Humidity</b-form-checkbox>
              <b-form-checkbox v-model="form.SensorLight" value="Light">Light</b-form-checkbox>  
              <b-form-checkbox v-model="form.SensorCO2" value="CO2">CO2</b-form-checkbox>
              <b-form-input class= "mt-2" v-model="form.SensorOthers" type="text"
                placeholder="Other sensors"
              ></b-form-input>            
            </b-form-group>
            <b-form-group
              id="input-group-product-dimensions"
              label="Size / Dimensions: L x W x H"
              label-for="input-product-dimensions"
              description=""
            >
              <b-form-input
                id="input-product-dimensions"
                v-model="form.ProductDimensions"
                type="text"
                required
                placeholder="About the product dimensions"
              ></b-form-input>
            </b-form-group>
            <b-form-group label="">
              <b-form-checkbox v-model="form.WaterProof" value="Yes">Water Proof</b-form-checkbox>
              <b-form-checkbox v-model="form.IDService" value="Yes">Need industrial design service</b-form-checkbox>
              <b-form-checkbox v-model="form.MDService" value="Yes">Need mechanical design service</b-form-checkbox>
            </b-form-group>
            </div>
            <hr>
            <b-row align-v="center" class="mt-2 mb-2">
              <b-col align="center">
                <b-button variant="info" size="lg" @click="pageMove(-1)">Back</b-button>
                <b-button type="submit" variant="info" size="lg">Next</b-button>
              </b-col>
            </b-row>
          </b-form>
      </b-tab>
      <b-tab title="Software" :title-link-class="tabLinkClass(2)">
        <b-form @submit="onSubmit" @reset="onReset" >
          <div style="height: 410px;  overflow-y: scroll; ">
            <b-form-group label="Machine learning required?">
              <b-form-checkbox
                  v-model="form.MLTraining"
                  value="MLTraining"
                  unchecked-value="none"
                > 
                Training
              </b-form-checkbox>
              <b-form-checkbox
                  v-model="form.MLInference"
                  value="MLInference"
                  unchecked-value="none"
                >
                Inference
              </b-form-checkbox>
            </b-form-group>
              <b-form-checkbox
                  v-model="form.LocationBase"
                  value="yes"
                  unchecked-value="none"
                >
                Location Base
              </b-form-checkbox>
            <b-form-group class="mt-2" label="Payment">
              <b-form-checkbox
                  v-model="form.PaymentNFC"
                  value="yes"
                  unchecked-value="none"
                >
                NFC
              </b-form-checkbox>
              <b-form-checkbox
                  v-model="form.PaymentQRCode"
                  value="yes"
                  unchecked-value="none"
                >
                QR Code
              </b-form-checkbox>
              <b-form-checkbox
                  v-model="form.PaymentRFID"
                  value="yes"
                  unchecked-value="none"
                >
                RFID
              </b-form-checkbox>
            </b-form-group>
            <b-form-group label="Mobile Apps">
              <b-form-checkbox
                  v-model="form.WebApp"
                  value="yes"
                  unchecked-value="none"
                >
                Custom web app
              </b-form-checkbox>
              <b-form-checkbox
                  v-model="form.MobileApp"
                  value="yes"
                  unchecked-value="none"
                >
                Custom iOS and Android App
              </b-form-checkbox>
            </b-form-group>  
          </div>
          <hr>
          <b-row align-v="center" class="mt-2 mb-2">
            <b-col align="center">
              <b-button variant="info" size="lg" @click="pageMove(-1)">Back</b-button>
              <b-button type="submit" variant="info" size="lg">Next</b-button>
            </b-col>
          </b-row>
        </b-form>
      </b-tab>
      <b-tab title="Send" :title-link-class="tabLinkClass(3)">
        <b-form @submit="onSubmit" @reset="onReset" >
          <div style="height: 410px;  overflow-y: scroll; ">
            <b-form-group
             label="Email address"
             description=""
            >
              <b-form-input
                v-model="form.Email"
                type="email"
                required
                placeholder="The email address that we will send the reply"
              ></b-form-input>
            </b-form-group> 
            <b-form-group
             label="Other inputs that want to tell us"
             description=""
            >
              <b-form-textarea
                v-model="form.OtherInputs"
                type="text"
                rows="8"
                required
                placeholder="More about the product and services ..."
              ></b-form-textarea>
            </b-form-group>
          </div>
          <hr>
          <b-row align-v="center" class="mt-2 mb-2">
            <b-col align="center">
              <b-button variant="info" size="lg" @click="pageMove(-1)">Back</b-button>
              <b-button type="submit" variant="success" size="lg">Submit</b-button>
            </b-col>
          </b-row>
        </b-form>
      </b-tab>
     </b-tabs>
     <!--
     <hr>
     <b-row align-v="center" class="mb-2">
        <b-col align="center">
          <b-button v-if="formPage > 0" variant="info" size="lg" @click="pageMove(-1)">Back</b-button>
          <b-button v-if="formPage < 3" variant="info" size="lg" @click="pageMove(1)">Next</b-button>
          <b-button v-if="formPage === 3" variant="success" size="lg" @click="submitForm()">Submit</b-button>
        </b-col>
      </b-row>
      -->
   </b-container>
   <at-footer/>
  </div>
</template>


<script>
export default {
  name: 'queryForm',
  data: function () {
    return {
      form: {
        MarketOpportunity: '',
        IoTDeviceDesc: '',
        OnlineServiceDesc: '',
        ProductTimeCycle: '',
        ProductPriceCost: '',
        WaterProof: '',
        ProductDimensions: '',
        MDService: '',
        IDService: '',
        Email: '',
        OtherInputs: '',
        PaymentQRCode: '',
        PaymentRFID: '',
        PaymentNFC: '',
        MLTraining: '',
        MLInference: '',
        LocationBase: '',
        PowerSource: '',
        SensorTemperature: '',
        SensorHumidity: '',
        SensorCO2: '',
        SensorLight: '',
        SensorOthers: '',
        NetcomIndoor: '',
        NetcomOutdoor: '',
        NetcomPAN: ''
      },
      formPage: 0,
      formPageReached: 0
    }
  },
  watch: {
    formPage: function (newValue, oldValue) {
    }
  },
  computed: {
  },
  async created () {
  },
  mounted () {
  },
  methods: {
    tabLinkClass (idx) {
        if (this.formPage === idx) {
          return ['bg-primary', 'tab-title-class']
        } else if (this.formPageReached < idx) {
          return ['text-secondary']
        } else {
          return [] // bg-light, text-light
        }
    },
    tabActivated (newTabIndex, oldTabIndex, event) {
      if (newTabIndex > this.formPageReached) {
        event.preventDefault()
      }
    },
    pageMove (shift) {
      console.log('page move')
      if (this.formPage + shift > this.formPageReached) {
        this.formPageReached = this.formPage + shift
      }
      this.formPage = this.formPage + shift
    },
    async submitForm () {
      try {
        const res = await fetch('https://api.aiothings.com/aiot_app/query_iot_design', {
          method: 'POST', // *GET, POST, PUT, DELETE, etc.
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(this.form) // body data type must match "Content-Type" header
        })
        console.log('res: ', res)
      } catch (err) {
          console.log('Form deliver error:', err)
      }
      this.$router.go(-1)
    },
    onReset () {

    },
    onSubmit (evt) {
      evt.preventDefault()
      console.log('submit: ', evt)
      if (this.formPage < 3) {
        this.pageMove(1)
      } else {
        this.submitForm()
      }
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
      this.$refs.modalReturnConfirmRef.show()
    }
  }
}
</script>

<style>
.tab-title-class {
  font-size: 20px;
}
</style>