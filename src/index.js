var Map = require('./map')
var Chart = require('./chart')

//San Francisco coordinates
var map = MAP = new Map([37.76487, -122.41948], 13)
d3.csv('data/stations.csv', function (data) {
  map.draw(data)
})

var year = 2014
var id = 'USW00023234'

function load(id, year) {
  d3.csv('data/' + year + '/' + id + '.csv', function (data) {
    chart.draw(data)
  })
}
