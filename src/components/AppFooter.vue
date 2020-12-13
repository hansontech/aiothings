<template> 
  <div id="footer">
    <b-row align-v="center" align-h="center" class="at-footer-background text-center">
      <!--
      <b-col sm="4" lg="3">
        &copy; 2018 Copyright &nbsp; <a v-b-tooltip.hover="'ABN: 63737379731'" href="https://www.aiothings.com"> Hanson Technology</a>
      </b-col>
      -->
      <b-col>
        <a href="/aboutus">About&ensp;
        <b-img src="/static/img/icons/favicon-16x16.png" /></a>
      </b-col>
       <!-- position as a pure internet operation
      <b-col>
        <a href="tel:+61-421858381">
            <i class="fas fa-phone"></i>&ensp;+61-421858381
        </a>
        &ensp;
      </b-col>
      https://getbootstrap.com/docs/4.0/utilities/display/#common-display-values
      -->
      <b-col class="d-none d-md-block d-lg-block d-xl-block">
        <div style="display: inline; color:lightgray" >
        Contact us
        &ensp;
        </div>
        <a v-b-tooltip.hover="'service@aiothings.com'" href="mailto:service@aiothings.com?subject=Enquiry">
            <i class="fas fa-envelope"></i>
        </a>
        &ensp;
        <a v-b-tooltip.hover="'Comments over Facebook'" href="https://www.facebook.com/aiothings" target="_blank">
            <i class="fab fa-facebook-f"></i>
        </a>
        &ensp;
        <a v-b-tooltip.hover="'Workspace collaboration'" href="https://aiothings.slack.com" target="_blank">
            <i class="fab fa-slack"></i>
        </a>
        &ensp;
        <a v-b-tooltip.hover="'Source repository'" href="https://github.com/hansontech/aiothings" target="_blank">
            <i class="fab fa-github"></i>
        </a>
      </b-col>
      <b-col class="d-none d-lg-block d-xl-block">
        <social-sharing url="https://www.aiothings.com/"
                      title="The AI + IoT playground"
                      description="Intuitive and Fast AI + IoT application development environment"
                      quote="AIoThings is a framework for building serverless cloud application."
                      hashtags="AI, IoT, Node-RED, AWS"
                      twitter-user="vuejs"
                      inline-template>
          <div>
            <div style="display: inline; color:lightgray" >
            Share us
            &ensp;
            </div>
            <network network="facebook">
              <i class="fab fa-facebook"></i> 
            </network>
            &ensp;
            <!-- <network network="googleplus">
              <i class="fab fa-google-plus"></i> 
            </network> -->
            <!-- <network network="line">
              <i class="fab fa-line"></i>
            </network> -->
            <network network="linkedin">
              <i class="fab fa-linkedin"></i> 
            </network>
            &ensp;
            <network network="twitter">
              <i class="fab fa-twitter"></i> 
            </network>
            <!--
            <network network="weibo">
              <i class="fab fa-weibo"></i> 
            </network> 
            <network network="weixin">
              <i class="fab fa-weixin"></i> 
            </network> 
            -->
          </div>
        </social-sharing>
      </b-col>
    </b-row>
  </div>
</template>
<script>
export default {
  name: 'at-footer',
  data () {
    return {
    }
  }
}
</script>

<style scoped>
.at-footer-background {
  border-top: 1px solid #000;
  background: gray;
  padding: 5px;
  margin-bottom: 0px;
}
a {
  color: lightgray;
}
</style>
