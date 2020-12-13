
//-- vue.config.js is an optional config file that will be automatically loaded by @vue/cli-service if it's present in your project root (next to package.json).
// webpack.config.js
// const VueLoaderPlugin = require('vue-loader/lib/plugin')

module.exports = {
    lintOnSave: false,
    runtimeCompiler: true,
    configureWebpack: {
      resolve: {
        // .mjs needed for https://github.com/graphql/graphql-js/issues/1272
        extensions: ['*', '.mjs', '.js', '.vue', '.json', '.gql', '.graphql']
      },
      /*
      module: {
        rules: [ // fixes https://github.com/graphql/graphql-js/issues/1272
          {
            test: /\.mjs$/,
            include: /node_modules/,
            type: 'javascript/auto'
          },
          {
            test: /\.vue$/,
            loader: 'vue-loader'
          }
        ]
      },
      plugins: [
        new VueLoaderPlugin()
      ], */
      devtool: 'source-map'
    }
    /*
    ,
    devServer: {
      proxy: 'http://backend.test/',
    }
    */
}
