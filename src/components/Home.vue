<template>
  <b-container>
    <div>
      <!--
              <p>idName: {{idName}}</p>

      <b-button @click="toTest()">test</b-button>
      <div class="embed-responsive embed-responsive-16by9">
          <iframe id="nodered" class="embed-responsive-item" :src="nodeUrl" allowfullscreen></iframe>
      </div>
      -->
      <!-- <h1>Hello AIOT New First</h1>
      <p>This is the main page of {{hostUrl}} .</p> --> 
      <at-whitepaper></at-whitepaper>
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
