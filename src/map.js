L.Icon.Default.imagePath = 'image'
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

  self.selectedIcon = new L.Icon.Default({
    iconUrl: L.Icon.Default.imagePath + '/marker-selected.png'
  })

  self.markers = L.markerClusterGroup()
  self.map.addLayer(self.markers)

  self.markers.on('click', function (a) {
    //a.layer.setIcon(self.selectedIcon)
    self.trigger('station-select', a.layer.id)
  });
}

Self.prototype.draw = function (data) {
  var self = this

  var markers = _.map(data, function (d) {
    var marker = L.marker(L.latLng(d.latitude, d.longitude), { title: d.name })
    marker.id = d.id
    return marker
  })
  self.markers.addLayers(markers)
}

Self.prototype.highlight = function (id, state) {
  var self = this

  //TODO find marker and change icon by state
}

Events.mixin(Self.prototype)
module.exports = Self
