/**
 * Application responsible for data load and comparison, controls, chart, map
 */
require('plusjs/src/selection/Selection')
var Map = require('./map')
var Chart = require('./chart')
var Header = require('./header')

var Self = function (options) {
  var self = this
  self.year = options.year
  self.center = options.center
  self.dateFormatter = d3.time.format('%m%d')

  self.map = new Map({container: d3.select('#map'), center: self.center, zoom: 13})
  self.map.on('station-select', self._onStationSelect.bind(self))
  self.header = new Header(d3.select('#header'))
  //var chartContainer = d3.select(self.map.map.getPanes().overlayPane)
  self.chart = new Chart(d3.select('#chart'))
  self.header.on('hide', function (id) {
    self.chart.hide()
  })
  self.header.on('remove', self.remove.bind(self))
  self.header.on('show', function (id) {
    self.add(self.first && self.first.id === id ? self.first : self.second)
  })

  d3.csv('data/stations.csv', function (stations) {
    self.map.draw(stations)
  })
}
/**
 * Load station data from server
 */
Self.prototype.load = function (id, year) {
  var self = this
  d3.text('data/' + (year || self.year) + '/' + (id) + '.csv', function (weather) {
    weather = "date,attr,value,a,b,c,d\n" + weather
    self._onLoad(d3.csv.parse(weather), id)
  })
}
/**
 * format weather data from server
 */
Self.prototype.parse = function (data) {
  var self = this
  var weather = d3.nest()
    .key(function (d) { return d.date })
    .rollup(function (leaves) {
      return leaves.reduce(function (p, d, i, arr) { p[d.attr] = +d.value; return p}, {})
    })
    .entries(data)

  //format weather data
  for (var i = 0; i < weather.length; i++) {
    var result = {}
    result.date = self.dateFormatter.parse(weather[i].key)
    result.tmin = +weather[i].values.TMIN / 10
    result.tmax = +weather[i].values.TMAX / 10
    result.prcp = +weather[i].values.PRCP / 10

    weather[i] = result
  }
  return weather
}
/**
 * add station to comparison
 */
Self.prototype.add = function (station) {
  var self = this

  if (self.first && self.first.id === station.id || self.second && self.second.id === station.id) {
    if (self.active !== station.id) {
      self.chart.shadow(self.active)
      self.chart.bringToFront(station.id)
    }
  } else {
    if (self.first) {
      if (self.second) self.chart.remove(self.second.id)
      self.second = station
      self.chart.shadow(self.first.id)
    } else {
      self.first = station
    }

    self.load(station.id, self.year)
  }

  self.header.render(self.first, self.second)
  self.chart.show()
  self.active = station.id
}

Self.prototype.remove = function (id) {
  var self = this
  if (self.first && self.first.id === id) {
    delete self.first
  } else delete self.second

  self.chart.remove(id)

  if (!self.first && !self.second) self.chart.hide()
  else {
    var last = self.first || self.second
    if (last.id !== self.active) self.chart.bringToFront(last.id)
  }
}

Self.prototype._onStationSelect = function (station) {
  var self = this
  d3.event.stopPropagation()
  self.add(station)
}

Self.prototype._onLoad = function (data, id) {
  var self = this
  var weather = self.parse(data)
  self.loaded = weather
  self.chart.render(weather, id)
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
