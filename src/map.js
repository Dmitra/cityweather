require('leaflet')
require('leaflet.markercluster')
L.Icon.Default.imagePath = 'node_modules/leaflet/dist/images/'
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

  self.markers = L.markerClusterGroup()
  self.map.addLayer(self.markers)

  self.markers.on('click', function (a) {
    self.trigger('station-select', a.layer.id)
  });
}

Self.prototype.draw = function(data) {
  var self = this

  var markers = _.map(data, function (d) {
    var marker = L.marker(L.latLng(d.latitude, d.longitude), { title: d.name })
    marker.id = d.id
    return marker
  })
  self.markers.addLayers(markers)
}

Events.mixin(Self.prototype)
module.exports = Self
