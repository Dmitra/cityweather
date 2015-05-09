require('plusjs/src/selection/Selection')
var Map = require('./map')
var Chart = require('./chart')

var Self = function (options) {
  var self = this
  self.year = options.year
  self.station = options.station
  self.center = options.center
  self.dateFormatter = d3.time.format('%m%d')

  self.map = new Map(self.center, 13)
  d3.csv('data/stations.csv', function (data) {
    self.map.draw(data)
  })

  d3.select('#map').delegate('click', '.station', self._onStationClick.bind(self))
  //var chartContainer = d3.select(self.map.map.getPanes().overlayPane)
  self.chart = new Chart(d3.select('#chart'))
}

Self.prototype.load = function (id, year) {
  var self = this
  self.chart.show()
  d3.text('data/' + (year || self.year) + '/' + (id || self.station) + '.csv', function (data) {
    data = "date,attr,value,a,b,c,d\n" + data
    self._onLoad(self.parse(d3.csv.parse(data)))
  })
}

Self.prototype.parse = function (data) {
  var self = this
  data = d3.nest()
    .key(function (d) { return d.date })
    .rollup(function (leaves) {
      return leaves.reduce(function (p, d, i, arr) { p[d.attr] = +d.value; return p}, {})
    })
    .entries(data)

  //format data
  for (var i = 0; i < data.length; i++) {
    var result = {}
    result.date = self.dateFormatter.parse(data[i].key)
    result.tmin = +data[i].values.TMIN / 10
    result.tmax = +data[i].values.TMAX / 10
    result.prcp = +data[i].values.PRCP / 10

    data[i] = result
  }
  return data
}

Self.prototype._onStationClick = function (data) {
  var self = this
  self.load(data.id, self.year)
}

Self.prototype._onLoad = function (data) {
  var self = this
  self.loaded = data
  self.chart.draw(data)
}

window.app = new Self({
  year: 2014
, station: 'USW00023234'
  //San Francisco coordinates
, center: [37.76487, -122.41948]
})

//setTimeout(function () {
  //app.load()
//}, 3000)
