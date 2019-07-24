const { environment } = require('@rails/webpacker');

const webpack = require('webpack');

environment.plugins.prepend(
  'Provide',
  new webpack.ProvidePlugin({
    $: 'jquery',
    jQuery: 'jquery',
    jquery: 'jquery',
    'window.Tether': 'tether',
    Popper: ['popper.js', 'default']
  }),
  new webpack.EnvironmentPlugin([
    'IMAGE_ENGINE',
    'CROP_IMAGE',
    'CATCHOOM_ACCESS_TOKEN',
    'CATCHOOM_REQUEST_URL',
    'APP_VERSION',
    'STORY_PARAGRAPH_TO_USE'
  ]) // this makes sure that these are accessible as env variables to react
);

module.exports = environment;
