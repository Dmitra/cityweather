var Events = require('backbone-events-standalone')

var Self = function (p) {
  var self = this
  p = p || {}

  self.container = p.container
  var zoomLevels = [3, 15]
  var markerSizes = [1, 40]
  self.markerScale = d3.scale.linear().domain(zoomLevels).range(markerSizes)

  self.map = L.map('map')
  self.map.setView(p.center, p.zoom)

  mapLink = '<a href="http://openstreetmap.org">OpenStreetMap</a>'
  L.tileLayer(
    'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; ' + mapLink + ' Contributors',
    minZoom: zoomLevels[0],
    maxZoom: zoomLevels[1],
  }).addTo(self.map)

  // Initialize the SVG layer
  self.map._initPathRoot()    

  // We pick up the SVG from the map object
  var svg = self.container.select('svg')
  self.overlay = svg.append('g')
    .attr('id', 'stations')

  self.container.delegate('click', '.station', function (data) {
    self.trigger('station-select', data)
  })
}

Self.prototype.draw = function(data) {
  var self = this

  // Add a LatLng object to each item in the dataset
  data.forEach(function(d) {
    d.LatLng = new L.LatLng(d.latitude, d.longitude)
  })

  self.nodes = self.overlay.selectAll('circle')
    .data(data)
    .enter().append('circle')
    .attr('class', 'station')
    .attr('r', 5)
  
  self.map.on('viewreset', self.update.bind(self))
  self.update()
}

Self.prototype.update = function () {
  var self = this

  self.nodes.attr('transform', 
    function(d) { 
      return 'translate('+ 
         self.map.latLngToLayerPoint(d.LatLng).x +','+ 
         self.map.latLngToLayerPoint(d.LatLng).y +')'
    }
  )
  self.nodes.attr('r', self.markerScale(self.map.getZoom()))
}

Events.mixin(Self.prototype)
module.exports = Self
