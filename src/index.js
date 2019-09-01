window.d3 = require('d3')
require('plusjs/src/selection/Selection')
window._ = require('lodash')
import App from './app'

window.app = new App({
  year: 2014
, station: 'USW00023272'
  //San Francisco coordinates
, center: [37.76487, -122.41948]
})
