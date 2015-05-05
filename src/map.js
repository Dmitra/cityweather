var Self = function (center, zoom) {
  var self = this

  var zoomLevels = [3, 13]
  var markerSizes = [1, 7]
  self.markerScale = d3.scale.linear().domain(zoomLevels).range(markerSizes)

  self.map = L.map('map')
  self.map.setView(center, zoom)

  mapLink = '<a href="http://openstreetmap.org">OpenStreetMap</a>'
  L.tileLayer(
    'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; ' + mapLink + ' Contributors',
    maxZoom: 13,
  }).addTo(self.map)

  // Add an SVG element to Leaflet’s overlay pane
  //var svg = d3.select(self.map.getPanes().overlayPane).append('svg'),
  //g = svg.append('g').attr('class', 'leaflet-zoom-hide')

  // Initialize the SVG layer
  self.map._initPathRoot()    

  // We pick up the SVG from the map object
  var svg = d3.select('#map').select('svg')
  self.overlay = svg.append('g')
    .attr('id', 'stations')

  return self
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
module.exports = Self
