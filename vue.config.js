const { defineConfig } = require('@vue/cli-service')
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin")
module.exports = defineConfig({

  transpileDependencies: true,
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true
    }
  },
  configureWebpack: {
    resolve: {
      fallback: {
        "fs": false
      },
    },
    plugins: [
      new NodePolyfillPlugin()
    ]
  }

})

