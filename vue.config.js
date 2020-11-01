module.exports = {
  lintOnSave: false,
  publicPath: '',
  css: {
    loaderOptions: {
      sass: {
        prependData: `@import '@/styles/utils/_index.scss';`,
      },
    },
  },
  chainWebpack: config => {
    config.module
      .rule('glsl')
      .test(/\.(glsl|frag|vert)$/)
      .exclude.add(/node_modules/)
      .end()
      .use('raw-loader')
      .loader('raw-loader')
      .end()
      .use('glslify-loader')
      .loader('glslify-loader')
      .end()
  },
}
